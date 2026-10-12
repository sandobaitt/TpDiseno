#!/usr/bin/env python3
# ==============================================================================
# verificar.py - Verificador de coherencia Secuencia <-> Clases <-> CRC
# Materia: Diseño de Sistemas (DSI 2026)
#
# Uso:
#   ./verificar.py modelos/02                       # busca los .puml/.md en la carpeta
#   ./verificar.py secuencia.puml clases.puml [crc.md]
#
# Errores (✗) rompen una regla de cátedra; advertencias (!) conviene revisarlas.
# Sale con código 1 si hay errores.
# ==============================================================================

import itertools
import re
import sys
from pathlib import Path

ROJO, AMARILLO, VERDE, NEGRITA, RESET = "\033[31m", "\033[33m", "\033[32m", "\033[1m", "\033[0m"

PARTICIPANTE = re.compile(
    r'^\s*(actor|boundary|control|participant|entity|collections|database)\s+'
    r'(?:"([^"]+)"|(\S+))(?:\s+as\s+(\w+))?'
)
MENSAJE = re.compile(r'^\s*("?[\w ]+?"?)\s*(-->>|-->|->>|->)\s*("?[\w ]+?"?)\s*:\s*(.*)$')
CLASE = re.compile(r'^\s*(?:abstract\s+)?class\s+(?:"([^"]+)"|(\w+))(?:\s+as\s+(\w+))?')
METODO = re.compile(r'^\s*[+\-#~]\s*(\w+)\s*\(([^)]*)\)')
EXENTOS_LISTA = {"create", "destroy", "add"}


def norm(texto):
    return re.sub(r"[^a-z]", "", texto.lower())


def contar_params(args):
    args = args.strip()
    return 0 if not args else len([a for a in args.split(",") if a.strip()])


def variantes_singular(nombre):
    """'Lineas_pedido' -> {'lineaspedido', 'lineapedido', ...}"""
    palabras = [p for p in re.split(r"[\s_]+", nombre) if p]
    opciones = []
    for p in palabras:
        v = {p}
        if p.lower().endswith("es"):
            v.add(p[:-2])
        if p.lower().endswith("s"):
            v.add(p[:-1])
        opciones.append(v)
    return {norm("".join(c)) for c in itertools.product(*opciones)}


# ------------------------------------------------------------------------------
# Lectura de archivos
# ------------------------------------------------------------------------------

def leer_clases(path):
    clases = {}  # norm(nombre o alias) -> {"nombre": str, "metodos": {nombre: [nparams]}}
    actual = None
    for linea in path.read_text(encoding="utf-8").splitlines():
        m = CLASE.match(linea)
        if m:
            nombre = m.group(1) or m.group(2)
            actual = {"nombre": nombre, "metodos": {}}
            clases[norm(nombre)] = actual
            if m.group(3):
                clases[norm(m.group(3))] = actual
            continue
        if actual is not None:
            if linea.strip().startswith("}"):
                actual = None
                continue
            mm = METODO.match(linea)
            if mm and "(" in linea:
                actual["metodos"].setdefault(mm.group(1), []).append(contar_params(mm.group(2)))
    return clases


def leer_crc(path):
    """Devuelve {norm(clase): texto de su tarjeta}. Tarjetas con encabezado '### ... `Clase`'."""
    tarjetas, actual = {}, None
    for linea in path.read_text(encoding="utf-8").splitlines():
        if linea.startswith("### "):
            m = re.search(r"`([^`]+)`", linea)
            actual = norm(m.group(1)) if m else None
            if actual:
                tarjetas[actual] = ""
            continue
        if actual:
            tarjetas[actual] += linea + "\n"
    return tarjetas


def leer_secuencia(path):
    participantes = {}  # alias -> dict
    mensajes = []
    creados = set()
    destruidos = set()
    activo_loop = 0
    for n, linea in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        s = linea.strip()
        if s.startswith("'") or not s:
            continue
        m = PARTICIPANTE.match(s)
        if m:
            tipo, etiqueta = m.group(1), m.group(2) or m.group(3)
            alias = m.group(4) or etiqueta
            participantes[alias] = {"tipo": tipo, "etiqueta": etiqueta, "linea": n}
            continue
        if s.startswith("create "):
            resto = s[len("create "):].strip()
            mm = re.match(r'(?:\w+\s+)?(?:"([^"]+)"|(\w+))(?:\s+as\s+(\w+))?', resto)
            if mm:
                alias = mm.group(3) or mm.group(2) or mm.group(1)
                etiqueta = mm.group(1) or mm.group(2)
                participantes.setdefault(alias, {"tipo": "participant", "etiqueta": etiqueta, "linea": n})
                creados.add(alias)
            continue
        if s.startswith("destroy "):
            destruidos.add(s.split()[1])
            continue
        if s.startswith("loop"):
            activo_loop += 1
        m = MENSAJE.match(s)
        if m:
            origen, flecha, destino, texto = (g.strip().strip('"') for g in m.groups())
            mensajes.append({"origen": origen, "flecha": flecha, "destino": destino,
                             "texto": texto, "linea": n})
    return participantes, mensajes, creados, destruidos


# ------------------------------------------------------------------------------
# Clasificación de participantes
# ------------------------------------------------------------------------------

def clasificar(alias, p, creados):
    et = p["etiqueta"]
    clase_txt = et.split(":", 1)[1].strip() if ":" in et else et
    prefijo = et.split(":", 1)[0].strip() if ":" in et else ""
    es_lt = bool(re.match(r"^LT[A-Z]+$", prefijo))
    p["clase_txt"] = clase_txt
    p["es_temporal"] = es_lt and alias in creados
    p["es_coleccion"] = es_lt and alias not in creados
    p["es_actor"] = p["tipo"] == "actor"
    # Colección por nombre plural sin prefijo (búsqueda indexada: "Clientes")
    p["plural"] = not prefijo and clase_txt.endswith("s")


def resolver_clase(p, clases):
    for v in [norm(p["clase_txt"])] + sorted(variantes_singular(p["clase_txt"])):
        if v in clases:
            return clases[v]
    return None


# ------------------------------------------------------------------------------
# Verificación
# ------------------------------------------------------------------------------

def verificar(sec_path, cls_path, crc_path):
    errores, avisos = [], []
    participantes, mensajes, creados, destruidos = leer_secuencia(sec_path)
    clases = leer_clases(cls_path) if cls_path else {}
    crc = leer_crc(crc_path) if crc_path else {}

    for alias, p in participantes.items():
        clasificar(alias, p, creados)

    def P(alias):
        return participantes.get(alias, {"tipo": "?", "etiqueta": alias, "clase_txt": alias,
                                         "es_temporal": False, "es_coleccion": False,
                                         "es_actor": False, "plural": False})

    def err(n, msg):
        errores.append(f"  {ROJO}✗{RESET} L{n}: {msg}")

    def warn(n, msg):
        avisos.append(f"  {AMARILLO}!{RESET} L{n}: {msg}")

    ui_alias = next((a for a, p in participantes.items() if p["tipo"] == "boundary"), None)
    actores = [a for a, p in participantes.items() if p["tipo"] == "actor"]
    externos = set(actores[1:])  # el primer actor declarado es el que inicia el CU
    sistema_alias = next((a for a, p in participantes.items()
                          if norm(p["etiqueta"]) == "sistema"), None)

    for m in mensajes:
        n, o, d, texto, flecha = m["linea"], m["origen"], m["destino"], m["texto"], m["flecha"]
        po, pd = P(o), P(d)

        if re.match(r"^\d+\.\s", texto):
            warn(n, f"numeración manual en '{texto}' (usar solo autonumber)")
        if re.search(r"\b(return|retornar)\b", texto, re.I):
            err(n, f"retorno con la palabra return/retornar: '{texto}'")

        texto = re.sub(r"^\d+\.\s*", "", texto)
        es_retorno = flecha.startswith("--")
        if es_retorno:
            if re.search(r"\w\(", texto) and not pd["es_actor"]:
                err(n, f"flecha de retorno con un método '{texto}' (usar mensaje síncrono '->')")
            continue

        metodo_m = re.match(r"(\w+)\s*\((.*)\)\s*$", texto)
        if not metodo_m:
            if not pd["es_actor"]:
                warn(n, f"mensaje sin forma de método: '{texto}'")
            continue
        metodo, nparams = metodo_m.group(1), contar_params(metodo_m.group(2))

        # Reglas de capa
        if po["tipo"] == "control" and d == sistema_alias and metodo.startswith("get"):
            err(n, f"'{metodo}' de CTRL a Sistema: usar verbo de negocio, no get")
        if d in externos:
            if o != sistema_alias:
                err(n, f"el actor externo '{d}' debe ser invocado por Sistema, no por '{o}'")
            if flecha != "->>":
                err(n, f"mensaje al actor externo '{d}' debe ser asíncrono (->>)")
        if metodo == "create" and P(d)["etiqueta"] == "CTRLSesion":
            err(n, "CTRLSesion es preexistente: no lleva create")
        if pd["es_temporal"] and metodo in {"create", "add"} and o != sistema_alias:
            err(n, f"solo Sistema crea/llena listas temporales ('{o}' -> {d}.{metodo})")
        if re.match(r"set[A-Z]\w*estado", metodo, re.I):
            warn(n, f"'{metodo}': para cambios de estado usar un mensaje de negocio (confirmar(), cancelar()...)")

        # Coherencia con clases
        if pd["es_actor"] or pd["es_temporal"] or metodo in {"create", "destroy"}:
            continue
        acceso_coleccion = (pd["es_coleccion"] or pd["plural"]) and metodo.startswith("get") and \
            norm(metodo[3:]) in variantes_singular(pd["clase_txt"]) | {norm(pd["clase_txt"])}
        if acceso_coleccion or not clases:
            continue
        clase = resolver_clase(pd, clases)
        if clase is None:
            err(n, f"'{pd['etiqueta']}' recibe '{metodo}()' pero no hay clase '{pd['clase_txt']}' en el diagrama de clases")
            continue
        if metodo not in clase["metodos"]:
            err(n, f"falta el método '{metodo}' en la clase {clase['nombre']}")
        elif nparams not in clase["metodos"][metodo]:
            err(n, f"{clase['nombre']}.{metodo}: {nparams} parámetro(s) en secuencia, "
                   f"{clase['metodos'][metodo]} en clases")
        if crc:
            tarjeta = crc.get(norm(clase["nombre"]))
            if tarjeta is not None and metodo not in tarjeta:
                warn(n, f"la tarjeta CRC de {clase['nombre']} no menciona '{metodo}'")

    # Ciclo de vida
    for alias, p in participantes.items():
        if p["es_temporal"] and alias not in destruidos:
            err(p["linea"], f"la lista temporal '{p['etiqueta']}' no tiene destroy")
        if p["es_temporal"]:
            for m in mensajes:
                if m["origen"] == alias and m["flecha"].startswith("--") and m["destino"] == sistema_alias:
                    err(m["linea"], f"retorno desde la lista temporal '{p['etiqueta']}' hacia Sistema")
    if ui_alias and ui_alias not in destruidos:
        warn(0, "el CTRL no destruye la UI al final del CU (CTRLCU -> UI: destroy())")

    return errores, avisos


def encontrar(carpeta):
    pumls = sorted(carpeta.rglob("*.puml"))
    sec = [p for p in pumls if re.search(r"secuencia|seq_", p.name)]
    cls = [p for p in pumls if re.search(r"clases", p.name)]
    crc = sorted(p for p in carpeta.rglob("*.md") if "crc" in p.name.lower())
    return sec, (cls[0] if cls else None), (crc[0] if crc else None)


def main(argv):
    if not argv or argv[0] in {"-h", "--help"}:
        print("Uso: ./verificar.py <carpeta> | <secuencia.puml> <clases.puml> [crc.md]")
        return 0
    rutas = [Path(a) for a in argv]
    if len(rutas) == 1 and rutas[0].is_dir():
        secs, cls, crc = encontrar(rutas[0])
    else:
        secs = [rutas[0]]
        cls = rutas[1] if len(rutas) > 1 else None
        crc = rutas[2] if len(rutas) > 2 else None
    if not secs:
        print(f"{ROJO}No se encontró diagrama de secuencia.{RESET}")
        return 1

    total_err = 0
    for sec in secs:
        print(f"{NEGRITA}=== {sec}{RESET}")
        print(f"    clases: {cls or '—'}   crc: {crc or '—'}")
        errores, avisos = verificar(sec, cls, crc)
        for linea in errores + avisos:
            print(linea)
        if not errores and not avisos:
            print(f"  {VERDE}✔ sin observaciones{RESET}")
        total_err += len(errores)
    return 1 if total_err else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
