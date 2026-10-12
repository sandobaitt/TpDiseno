#!/usr/bin/env bash
# ==============================================================================
# render.sh - Generador automático de SVG para diagramas UML con PlantUML
# Materia: Diseño de Sistemas (DSI 2026)
# ==============================================================================

set -euo pipefail

# Colores para salida de terminal
COLOR_RESET="\033[0m"
COLOR_BOLD="\033[1m"
COLOR_GREEN="\033[32m"
COLOR_BLUE="\033[34m"
COLOR_YELLOW="\033[33m"
COLOR_RED="\033[31m"
COLOR_CYAN="\033[36m"

# Directorio base del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BIN_PLANTUML="$SCRIPT_DIR/bin/plantuml"

# Formato por defecto: SVG
FORMAT="svg"
WATCH_MODE=false
TARGETS=()

# Función de ayuda
show_help() {
    cat << EOF
${COLOR_BOLD}Uso:${COLOR_RESET} ./render.sh [opciones] [archivo.puml | directorio]

${COLOR_BOLD}Opciones:${COLOR_RESET}
  -h, --help            Muestra este mensaje de ayuda.
  -f, --format FORMATO   Formato de salida (svg, png, txt). Por defecto: svg.
  -w, --watch           Modo observación: re-renderiza automáticamente al guardar cambios.
  -a, --all             Renderiza todos los archivos .puml del proyecto.

${COLOR_BOLD}Ejemplos:${COLOR_RESET}
  ./render.sh                                         # Renderiza todos los .puml del proyecto
  ./render.sh secuencia/ejemplos/seq_pedido.puml      # Renderiza un archivo puntual a .svg
  ./render.sh casos-de-uso/                          # Renderiza todos los .puml dentro de esa carpeta
  ./render.sh -f png secuencia/                      # Renderiza a PNG
  ./render.sh -w casos-de-uso/ejemplos/cu_login.puml  # Modo observación en tiempo real
EOF
}

# Parsear argumentos
while [[ $# -gt 0 ]]; do
    case "$1" in
        -h|--help)
            show_help
            exit 0
            ;;
        -f|--format)
            FORMAT="$2"
            shift 2
            ;;
        -w|--watch)
            WATCH_MODE=true
            shift
            ;;
        -a|--all)
            shift
            ;;
        -*)
            echo -e "${COLOR_RED}Opción desconocida:${COLOR_RESET} $1" >&2
            show_help
            exit 1
            ;;
        *)
            TARGETS+=("$1")
            shift
            ;;
    esac
done

# Verificar ejecutable de PlantUML
if [ ! -x "$BIN_PLANTUML" ]; then
    if command -v plantuml >/dev/null 2>&1; then
        BIN_PLANTUML="plantuml"
    else
        echo -e "${COLOR_RED}Error:${COLOR_RESET} No se encontró el ejecutable de PlantUML en $BIN_PLANTUML ni en el PATH." >&2
        exit 1
    fi
fi

# Renderizar un archivo individual
render_single_file() {
    local file="$1"
    local dir
    local filename
    local basename
    local output_file

    dir="$(dirname "$file")"
    filename="$(basename "$file")"
    basename="${filename%.*}"
    output_file="$dir/$basename.$FORMAT"

    local format_upper
    format_upper="$(echo "$FORMAT" | tr '[:lower:]' '[:upper:]')"
    echo -ne "  ${COLOR_CYAN}➜${COLOR_RESET} Compilando ${COLOR_BOLD}$file${COLOR_RESET} a ${format_upper}... "

    # Ejecutar compilación con PlantUML
    # -t$FORMAT : tipo de salida (svg, png, etc.)
    # -Playout=smetana : permite diagramas no-secuencia sin necesitar graphviz externo
    if "$BIN_PLANTUML" -t"$FORMAT" "$file" 2>&1 | grep -E -i "(error|exception|syntax)" >&2; then
        echo -e "${COLOR_RED}✗ ERROR${COLOR_RESET}"
        return 1
    else
        if [ -f "$output_file" ]; then
            echo -e "${COLOR_GREEN}✔ ÉXITO${COLOR_RESET} -> ${COLOR_BOLD}$output_file${COLOR_RESET}"
        else
            echo -e "${COLOR_YELLOW}✔ COMPLETADO${COLOR_RESET}"
        fi
    fi
}

# Recolectar lista de archivos .puml
collect_files() {
    local files=()

    if [ ${#TARGETS[@]} -eq 0 ]; then
        # Buscar todos los .puml en el proyecto excepto .git o caches
        while IFS= read -r -d '' f; do
            files+=("$f")
        done < <(find "$SCRIPT_DIR" -type f -name "*.puml" ! -path "*/.git/*" -print0)
    else
        for target in "${TARGETS[@]}"; do
            if [ -f "$target" ]; then
                files+=("$target")
            elif [ -d "$target" ]; then
                while IFS= read -r -d '' f; do
                    files+=("$f")
                done < <(find "$target" -type f -name "*.puml" ! -path "*/.git/*" -print0)
            else
                echo -e "${COLOR_RED}Error:${COLOR_RESET} No se encontró el archivo o ruta: $target" >&2
            fi
        done
    fi

    echo "${files[@]}"
}

# Ejecución principal
run_build() {
    local files_str
    files_str="$(collect_files)"
    # shellcheck disable=SC2206
    local files=($files_str)

    if [ ${#files[@]} -eq 0 ]; then
        echo -e "${COLOR_YELLOW}No se encontraron archivos .puml para renderizar.${COLOR_RESET}"
        return 0
    fi

    echo -e "\n${COLOR_BLUE}${COLOR_BOLD}=== Compilando diagramas UML (${#files[@]} archivo(s)) ===${COLOR_RESET}"
    local errors=0
    for f in "${files[@]}"; do
        if ! render_single_file "$f"; then
            ((errors++))
        fi
    done

    echo -e "${COLOR_BLUE}${COLOR_BOLD}=== Proceso finalizado (${errors} errores) ===${COLOR_RESET}\n"
    return "$errors"
}

if [ "$WATCH_MODE" = true ]; then
    echo -e "${COLOR_GREEN}${COLOR_BOLD}[Modo Observación Activo]${COLOR_RESET} Presiona Ctrl+C para salir."
    # Ejecutar primera compilación
    run_build || true

    # Si inotifywait está disponible, usarlo; de lo contrario, polling liviano
    if command -v inotifywait >/dev/null 2>&1; then
        while true; do
            inotifywait -r -q -e modify,create,delete "$SCRIPT_DIR" --include '.*\.puml$'
            run_build || true
        done
    else
        echo -e "${COLOR_YELLOW}(inotifywait no disponible, usando polling de verificación cada 2s)${COLOR_RESET}"
        LAST_HASH=""
        while true; do
            CURRENT_HASH="$(find "$SCRIPT_DIR" -name "*.puml" ! -path "*/.git/*" -exec stat -c "%y" {} + 2>/dev/null | md5sum)"
            if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
                if [ -n "$LAST_HASH" ]; then
                    echo -e "${COLOR_YELLOW}Cambios detectados, recompilando...${COLOR_RESET}"
                    run_build || true
                fi
                LAST_HASH="$CURRENT_HASH"
            fi
            sleep 2
        done
    fi
else
    run_build
fi
