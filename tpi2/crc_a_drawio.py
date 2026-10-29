#!/usr/bin/env python3
"""Pasa las tarjetas CRC del .md a un archivo .drawio (draw.io / diagrams.net).

Uso (desde la raíz del repo):
    tpi2/crc_a_drawio.py                        # usa las tarjetas de Registrar Pagos
    tpi2/crc_a_drawio.py tarjetas.md salida.drawio

Cada tarjeta queda como un grupo (se mueve de una pieza) con el formato del apunte:
título, clase y propósito, y debajo Responsabilidad | Colaboración.
"""
import math
import re
import sys
import xml.etree.ElementTree as ET
from html import escape
from pathlib import Path

CARPETA = Path(__file__).parent / "02-realizacion-cu"
ENTRADA = CARPETA / "3_tarjetas_crc_registrar_pagos.md"
SALIDA = CARPETA / "3_tarjetas_crc_registrar_pagos.drawio"

ANCHO, ANCHO_RESP = 560, 340          # ancho de la tarjeta y de la columna de responsabilidades
ALTO_TITULO = ALTO_ENCABEZADO = 26
LINEA = 15                            # alto de una línea de texto (fuente 11)
CARACTERES_ANCHO = 58                 # caracteres por línea en 340 px (aprox.)
CARACTERES_ANCHO_COLAB = 35           # y en la columna de colaboración (220 px)
SEPARACION = 50


def limpiar(texto):
    """Quita el formato markdown y escapa el HTML."""
    texto = texto.replace("`", "")
    negritas = re.split(r"(\*\*.+?\*\*)", texto)
    partes = []
    for p in negritas:
        if p.startswith("**") and p.endswith("**"):
            partes.append(f"<b>{escape(p[2:-2])}</b>")
        else:
            partes.append(escape(p))
    return "".join(partes)


def texto_plano(html):
    return re.sub(r"<[^>]+>", "", html)


def leer_tarjetas(ruta):
    tarjetas = []
    for bloque in re.split(r"\n### Tarjeta \d+: ", ruta.read_text(encoding="utf-8"))[1:]:
        nombre = re.match(r"`([^`]+)`", bloque).group(1)
        proposito = re.search(r"\* \*\*Propósito:\*\* (.+)", bloque).group(1).strip()
        fila = next(l for l in bloque.splitlines() if l.startswith("| **Hacer:**"))
        celdas = fila.strip().strip("|").split(" | ")
        tarjetas.append(
            {
                "nombre": nombre,
                "proposito": proposito,
                "resp": celdas[0].strip().split("<br>"),
                "colab": celdas[1].strip().split("<br>"),
            }
        )
    return tarjetas


def lineas(items, por_linea):
    total = 0
    for it in items:
        total += max(1, math.ceil(len(texto_plano(limpiar(it))) / por_linea))
    return total


def construir(tarjetas):
    modelo = ET.Element(
        "mxGraphModel",
        dx="1400", dy="900", grid="1", gridSize="10", guides="1", tooltips="1",
        connect="1", arrows="1", fold="1", page="1", pageScale="1",
        pageWidth="1700", pageHeight="1100", math="0", shadow="0",
    )
    raiz = ET.SubElement(modelo, "root")
    ET.SubElement(raiz, "mxCell", id="0")
    ET.SubElement(raiz, "mxCell", id="1", parent="0")

    base = "whiteSpace=wrap;html=1;strokeColor=#000000;fontSize=11;fontColor=#000000;"
    est_titulo = base + "fillColor=#E6E6E6;fontStyle=1;align=center;verticalAlign=middle;"
    est_texto = base + "fillColor=#FFFFFF;align=left;verticalAlign=top;spacingLeft=6;spacingRight=6;spacingTop=4;"

    ancho_colab = ANCHO - ANCHO_RESP
    fila_y = 0
    alto_fila = 0
    for i, t in enumerate(tarjetas):
        col = i % 2
        x = col * (ANCHO + SEPARACION)

        alto_nombre = LINEA * (1 + math.ceil((len(t["proposito"]) + 11) / 92)) + 12
        alto_cuerpo = (
            max(lineas(t["resp"], CARACTERES_ANCHO), lineas(t["colab"], CARACTERES_ANCHO_COLAB)) * LINEA + 16
        )
        alto = ALTO_TITULO + alto_nombre + ALTO_ENCABEZADO + alto_cuerpo

        # dos tarjetas por fila; la fila siguiente empieza donde termina la más alta
        y = fila_y
        alto_fila = alto if col == 0 else max(alto_fila, alto)
        if col == 1 or i == len(tarjetas) - 1:
            fila_y += alto_fila + SEPARACION

        gid = f"t{i + 1}"
        grupo = ET.SubElement(raiz, "mxCell", id=gid, value="", style="group", vertex="1", connectable="0", parent="1")
        ET.SubElement(grupo, "mxGeometry", {"x": str(x), "y": str(y), "width": str(ANCHO), "height": str(alto), "as": "geometry"})

        def hijo(sufijo, valor, cx, cy, w, h, estilo):
            c = ET.SubElement(raiz, "mxCell", id=f"{gid}-{sufijo}", value=valor, style=estilo, vertex="1", parent=gid)
            ET.SubElement(c, "mxGeometry", {"x": str(cx), "y": str(cy), "width": str(w), "height": str(h), "as": "geometry"})

        cy = 0
        hijo("titulo", "Tarjeta CRC", 0, cy, ANCHO, ALTO_TITULO, est_titulo)
        cy += ALTO_TITULO
        hijo(
            "nombre",
            f"<b>CLASE:</b> {escape(t['nombre'])}<br><b>PROPÓSITO:</b> {limpiar(t['proposito'])}",
            0, cy, ANCHO, alto_nombre, est_texto,
        )
        cy += alto_nombre
        hijo("h-resp", "Responsabilidad", 0, cy, ANCHO_RESP, ALTO_ENCABEZADO, est_titulo)
        hijo("h-colab", "Colaboración", ANCHO_RESP, cy, ancho_colab, ALTO_ENCABEZADO, est_titulo)
        cy += ALTO_ENCABEZADO
        hijo("resp", "<br>".join(limpiar(l) if l else "" for l in t["resp"]), 0, cy, ANCHO_RESP, alto_cuerpo, est_texto)
        hijo("colab", "<br>".join(limpiar(l) for l in t["colab"]), ANCHO_RESP, cy, ancho_colab, alto_cuerpo, est_texto)
    return modelo


def main(argv):
    entrada = Path(argv[0]) if argv else ENTRADA
    salida = Path(argv[1]) if len(argv) > 1 else SALIDA
    tarjetas = leer_tarjetas(entrada)
    modelo = construir(tarjetas)
    archivo = ET.Element("mxfile", host="app.diagrams.net")
    diagrama = ET.SubElement(archivo, "diagram", id="tarjetas-crc", name="Tarjetas CRC")
    diagrama.append(modelo)
    ET.indent(archivo)
    ET.ElementTree(archivo).write(salida, encoding="utf-8", xml_declaration=True)
    print(f"{len(tarjetas)} tarjetas -> {salida}")


if __name__ == "__main__":
    main(sys.argv[1:])
