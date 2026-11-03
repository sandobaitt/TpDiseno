#!/usr/bin/env python3
"""Pasa un diagrama de clases de PlantUML a un .drawio con clases nativas de draw.io.

Uso:  tpi2/clases_a_drawio.py tpi2/02-realizacion-cu/2_clases_registrar_pagos.puml

Lee el .puml (clases, enums, relaciones y leyenda) y las posiciones del .svg que
ya generó render.sh (tiene que estar al lado, con el mismo nombre). Así las cajas
quedan donde las puso PlantUML, pero con el tamaño calculado para la fuente de
draw.io: el texto no se desfasa ni se sale de la caja.
"""
import html
import re
import subprocess
import sys
from pathlib import Path
from xml.sax.saxutils import quoteattr

from PIL import ImageFont

FONT_SIZE = 12
LINE_H = 18          # alto de cada línea de atributo o método
SEP_H = 8            # alto del separador entre atributos y métodos
HEAD_H = 40          # estereotipo + nombre
PAD = 14             # margen horizontal dentro de la caja
SX, SY = 1.25, 1.3   # las cajas de draw.io son un poco más grandes que las del SVG


def fuente():
    ruta = subprocess.run(["fc-match", "-f", "%{file}", "Liberation Sans"],
                          capture_output=True, text=True).stdout
    return ImageFont.truetype(ruta, FONT_SIZE), ImageFont.truetype(ruta.replace("Regular", "Bold"), FONT_SIZE)


FONT, FONT_B = fuente()


def ancho(texto, bold=False):
    return (FONT_B if bold else FONT).getlength(texto)


# Acomodo propio para draw.io: (centro horizontal, fila), una disposición por diagrama (nombre del archivo).
# Las filas se apilan de arriba hacia abajo. Con las posiciones del SVG algunas líneas rectas atraviesan
# cajas; así quedan más limpias. Si el diagrama no está acá, se usa la posición del SVG.
DISPOSICIONES = {
    "2_clases_registrar_pagos": {
        "UIRegistrarPagos": (300, 1), "UIAplicarPromociones": (780, 1), "UIEmitirRecibos": (1200, 1),
        "CTRLRegistrarPagos": (300, 2), "CTRLAplicarPromociones": (780, 2), "CTRLEmitirRecibos": (1200, 2),
        "CTRLSesion": (300, 3), "Sistema": (760, 3), "Recibo": (1300, 3),
        "Alumno": (420, 4), "Pago": (900, 4),
        "Cuota": (230, 5), "Promocion": (660, 5), "Secretaria": (1000, 5),
        "MedioPago": (400, 6), "EstadoCuota": (560, 6), "EstadoCuenta": (720, 6), "EstadoAlumno": (880, 6), "EstadoPromocion": (1040, 6),
    },
    "2_clases_antes": {
        "Sistema": (420, 1), "Alumno": (420, 2), "Cuota": (420, 3), "EstadoCuota": (420, 4),
    },
    "3_clases_despues": {
        "Sistema": (420, 1), "Alumno": (420, 2), "Cuota": (420, 3), "EstadoCuota": (420, 4),
        "EstadoCuotaPendiente": (200, 5), "EstadoCuotaPagada": (880, 5),
    },
}
SEPARACION_FILAS = {2: 70, 3: 80, 4: 100, 5: 70, 6: 70}


def leer_puml(ruta):
    lineas = Path(ruta).read_text(encoding="utf-8").split("\n")
    clases, relaciones, leyenda, notas = {}, [], [], []
    i = 0
    while i < len(lineas):
        l = lineas[i].rstrip()
        m = re.match(r"\s*(abstract\s+)?(class|enum)\s+(\w+)\s*<<([^>]+)>>\s*\{", l)
        mn = re.match(r"\s*note\s+right\s+of\s+(\w+)\s*$", l)
        if mn:
            texto = []
            i += 1
            while lineas[i].strip() != "end note":
                texto.append(lineas[i].strip())
                i += 1
            notas.append((mn.group(1), texto))
        elif m:
            abstracta, tipo, nombre, estereo = m.groups()
            attrs, metodos, valores = [], [], []
            i += 1
            while lineas[i].strip() != "}":
                t = lineas[i].strip().replace("{abstract} ", "")
                if t:
                    if tipo == "enum":
                        valores.append(t)
                    elif "(" in t:
                        metodos.append(t)
                    else:
                        attrs.append(t)
                i += 1
            clases[nombre] = dict(tipo=tipo, estereo=estereo, attrs=attrs, metodos=metodos, valores=valores, abstracta=bool(abstracta))
        elif l.strip() == "legend bottom":
            i += 1
            while lineas[i].strip() != "endlegend":
                leyenda.append(lineas[i].strip())
                i += 1
        else:
            m = re.match(r'^(\w+)\s*(?:"([^"]*)")?\s*(\S+)\s*(?:"([^"]*)")?\s*(\w+)\s*(?::\s*(.*))?$', l)
            if m and m.group(1) in clases or (m and m.group(5) in clases and m.group(1)[0].isupper()):
                o, mo, flecha, md, d, etiqueta = m.groups()
                if "hidden" not in flecha and o in clases and d in clases:
                    relaciones.append(dict(o=o, mo=mo or "", flecha=flecha, md=md or "", d=d, etiqueta=etiqueta or ""))
        i += 1
    return clases, relaciones, leyenda, notas


def leer_svg(ruta):
    s = Path(ruta).read_text(encoding="utf-8")
    pos = {}
    for m in re.finditer(r'<g class="(entity|cluster)" data-qualified-name="([^"]+)"[^>]*>\s*<rect x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"', s):
        _, nombre, x, y, w, h = m.groups()
        pos[nombre.split('.')[-1]] = (float(x), float(y), float(w), float(h))
    return pos


def val(texto):
    """Texto para el atributo value (html=1): primero HTML, después XML."""
    return quoteattr(html.escape(texto, quote=False))


def medir(c, nombre):
    lineas = c["attrs"] + c["metodos"] + c["valores"]
    w = max([ancho(f"«{c['estereo']}»"), ancho(nombre, True)] + [ancho(t) for t in lineas]) + 2 * PAD
    h = HEAD_H + LINE_H * len(lineas)
    if c["attrs"] and c["metodos"]:
        h += SEP_H
    elif c["tipo"] == "class" and not c["attrs"]:
        h += SEP_H          # compartimento de atributos vacío (UI, CTRL)
    return round(w), h


def generar(ruta_puml):
    ruta_puml = Path(ruta_puml)
    clases, relaciones, leyenda, notas = leer_puml(ruta_puml)
    texto_puml = ruta_puml.read_text(encoding='utf-8')
    DISPOSICION = DISPOSICIONES.get(ruta_puml.stem, {})
    pos = leer_svg(ruta_puml.with_suffix(".svg"))
    celdas = []
    ids = {}
    n = [1]

    def nuevo():
        n[0] += 1
        return f"c{n[0]}"

    # --- recuadro "Tipos enumerados" y cajas ---
    cajas = {}
    tam = {nombre: medir(c, nombre) for nombre, c in clases.items()}
    if all(k in DISPOSICION for k in clases):
        y_fila, y_actual, prev_alto = {}, 20, 0
        for fila_n in sorted({f for _, f in DISPOSICION.values()}):
            if fila_n > 1:
                y_actual += prev_alto + SEPARACION_FILAS.get(fila_n, 70)
            y_fila[fila_n] = y_actual
            prev_alto = max(tam[k][1] for k, (_, f) in DISPOSICION.items() if f == fila_n and k in tam)
        for nombre in clases:
            w, h = tam[nombre]
            cx, f = DISPOSICION[nombre]
            cajas[nombre] = [cx - w / 2, y_fila[f], w, h]
    else:
        for nombre in clases:
            w, h = tam[nombre]
            x, y, sw, sh = pos[nombre]
            cajas[nombre] = [(x + sw / 2) * SX - w / 2, (y + sh / 2) * SY - h / 2, w, h]

    estilo_clase = ("swimlane;fontStyle=0;childLayout=stackLayout;horizontal=1;startSize=%d;horizontalStack=0;"
                    "resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;"
                    "fontSize=%d;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=#444444;swimlaneFillColor=#FFFFFF;" % (HEAD_H, FONT_SIZE))
    estilo_txt = ("text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=%d;spacingRight=4;"
                  "overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;html=1;whiteSpace=nowrap;fontSize=%d;" % (PAD - 4, FONT_SIZE))
    estilo_sep = ("line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;"
                  "spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;")

    # recuadro de los enums (con margen alrededor)
    enums = [k for k, c in clases.items() if c["tipo"] == "enum"]
    if enums and 'package "Tipos enumerados"' in texto_puml:
        x0 = min(cajas[k][0] for k in enums) - 20
        y0 = min(cajas[k][1] for k in enums) - 34
        x1 = max(cajas[k][0] + cajas[k][2] for k in enums) + 20
        y1 = max(cajas[k][1] + cajas[k][3] for k in enums) + 20
        celdas.append(f'<mxCell id="{nuevo()}" value="Tipos enumerados" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;'
                      f'strokeColor=#999999;verticalAlign=top;fontStyle=1;fontSize={FONT_SIZE + 1};" vertex="1" parent="1">'
                      f'<mxGeometry x="{x0:.0f}" y="{y0:.0f}" width="{x1 - x0:.0f}" height="{y1 - y0:.0f}" as="geometry"/></mxCell>')

    for nombre, c in clases.items():
        x, y, w, h = cajas[nombre]
        cid = nuevo()
        ids[nombre] = cid
        nom = html.escape(nombre)
        cab = f"«{c['estereo']}»<br><b>{'<i>' + nom + '</i>' if c['abstracta'] else nom}</b>"
        celdas.append(f'<mxCell id="{cid}" value={quoteattr(cab)} style="{estilo_clase}" vertex="1" parent="1">'
                      f'<mxGeometry x="{x:.0f}" y="{y:.0f}" width="{w}" height="{h}" as="geometry"/></mxCell>')
        yy = HEAD_H

        def fila(texto):
            nonlocal yy
            celdas.append(f'<mxCell id="{nuevo()}" value={val(texto)} style="{estilo_txt}" vertex="1" parent="{cid}">'
                          f'<mxGeometry y="{yy}" width="{w}" height="{LINE_H}" as="geometry"/></mxCell>')
            yy += LINE_H

        def sep():
            nonlocal yy
            celdas.append(f'<mxCell id="{nuevo()}" value="" style="{estilo_sep}" vertex="1" parent="{cid}">'
                          f'<mxGeometry y="{yy}" width="{w}" height="{SEP_H}" as="geometry"/></mxCell>')
            yy += SEP_H

        for t in c["valores"]:
            fila(t)
        for t in c["attrs"]:
            fila(t)
        if c["attrs"] and c["metodos"] or (c["tipo"] == "class" and not c["attrs"]):
            sep()
        for t in c["metodos"]:
            fila(t)

    # --- relaciones ---
    for r in relaciones:
        f = r["flecha"]
        punteada = ".." in f
        agreg = f.startswith("o")
        comp = f.startswith("*")
        flecha_fin = f.endswith(">")
        herencia = f.startswith("<|")
        est = "html=1;rounded=0;fontSize=11;endSize=10;startSize=12;"
        est += "endArrow=open;endFill=0;" if flecha_fin else "endArrow=none;"
        if herencia:
            est += "startArrow=block;startFill=0;startSize=12;"
        elif agreg or comp:
            est += "startArrow=diamondThin;startFill=%d;" % (1 if comp else 0)
        else:
            est += "startArrow=none;"
        if punteada:
            est += "dashed=1;"
        eid = nuevo()
        celdas.append(f'<mxCell id="{eid}" value={val(r["etiqueta"].replace("<<", "«").replace(">>", "»"))} style="{est}" edge="1" parent="1" '
                      f'source="{ids[r["o"]]}" target="{ids[r["d"]]}"><mxGeometry relative="1" as="geometry"/></mxCell>')
        for texto, x in ((r["mo"], -0.82), (r["md"], 0.82)):
            if texto:
                celdas.append(f'<mxCell id="{nuevo()}" value={val(texto)} style="edgeLabel;resizable=0;html=1;align=center;'
                              f'verticalAlign=middle;labelBackgroundColor=none;fontSize=11;" connectable="0" vertex="1" parent="{eid}">'
                              f'<mxGeometry x="{x}" relative="1" as="geometry"><mxPoint y="-10" as="offset"/></mxGeometry></mxCell>')

    # --- notas pegadas a una clase ---
    for anclada, lineas_nota in notas:
        if anclada not in ids:
            continue
        bx, by, bw, bh = cajas[anclada]
        # a la derecha, salvo que haya otra clase a ese lado en la misma fila: ahí va abajo
        vecina = any(k != anclada and abs(v[1] - by) < 5 and v[0] > bx for k, v in cajas.items())
        nw = round(max(ancho(t) for t in lineas_nota) + 2 * PAD)
        nh = 18 * len(lineas_nota) + 16
        nx, ny = (bx, by + bh + 40) if vecina else (bx + bw + 40, by)
        nid = nuevo()
        texto = "<br>".join(f"<b>{html.escape(t.strip('*'))}</b>" if t.startswith("**") else html.escape(t) for t in lineas_nota)
        celdas.append(f'<mxCell id="{nid}" value={quoteattr(texto)} style="shape=note;size=12;whiteSpace=wrap;html=1;fillColor=#FFFBE6;'
                      f'strokeColor=#BBAA55;align=left;verticalAlign=top;spacingLeft=6;fontSize=11;" vertex="1" parent="1">'
                      f'<mxGeometry x="{nx:.0f}" y="{ny:.0f}" width="{nw}" height="{nh}" as="geometry"/></mxCell>')
        celdas.append(f'<mxCell id="{nuevo()}" value="" style="endArrow=none;dashed=1;html=1;strokeColor=#BBAA55;" edge="1" parent="1" '
                      f'source="{ids[anclada]}" target="{nid}"><mxGeometry relative="1" as="geometry"/></mxCell>')
        cajas[f"nota {anclada}"] = [nx, ny, nw, nh]

    # --- leyenda ---
    if leyenda:
        lw = round(max(ancho(re.sub(r"\*\*", "", t)) for t in leyenda) + 2 * PAD)
        base = max(v[1] + v[3] for v in cajas.values()) + 60
        texto = "<br>".join(f"<b>{html.escape(t.strip('*'))}</b>" if t.startswith("**") else html.escape(t) for t in leyenda)
        celdas.append(f'<mxCell id="{nuevo()}" value={quoteattr(texto)} style="rounded=0;whiteSpace=wrap;html=1;fillColor=#F5F5F5;'
                      f'strokeColor=#999999;align=left;verticalAlign=top;spacingLeft=8;fontSize=11;" vertex="1" parent="1">'
                      f'<mxGeometry x="40" y="{base:.0f}" width="{lw}" height="{18 * len(leyenda) + 10}" as="geometry"/></mxCell>')

    xml = ('<mxfile host="app.diagrams.net"><diagram name="Diagrama de clases" id="clases">'
           '<mxGraphModel dx="1400" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" '
           'page="0" pageScale="1" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>\n'
           + "\n".join(celdas) + "\n</root></mxGraphModel></diagram></mxfile>\n")
    salida = ruta_puml.with_suffix(".drawio")
    salida.write_text(xml, encoding="utf-8")

    # control: cajas que se pisan
    ls = list(cajas.items())
    pisadas = [(a, b) for i, (a, A) in enumerate(ls) for b, B in ls[i + 1:]
               if A[0] < B[0] + B[2] and B[0] < A[0] + A[2] and A[1] < B[1] + B[3] and B[1] < A[1] + A[3]]
    print(f"✔ {salida}  ({len(clases)} clases, {len(relaciones)} relaciones)")
    if pisadas:
        print("⚠ cajas que se pisan:", pisadas)


if __name__ == "__main__":
    generar(sys.argv[1] if len(sys.argv) > 1 else "tpi2/02-realizacion-cu/2_clases_registrar_pagos.puml")
