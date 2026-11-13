#!/usr/bin/env bash
# Prepara una sesión de Claude Code en la nube para trabajar en el proyecto: instala lo que
# usan las pruebas (Playwright con Chromium, Pillow) y Graphify, y genera web/datos.js con
# los datos reales. Lo lanza el hook SessionStart de .claude/settings.json al empezar.
#
# Solo actúa en la nube (CLAUDE_CODE_REMOTE=true). En el PC de Bruno no hace nada.
# Nunca frena la sesión: si algo no se puede instalar, lo dice y sigue.
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

registro=/tmp/preparar-nube.log
listo=()
falta=()

instalar_python() {
  python3 -m pip install -q "$@" >>"$registro" 2>&1 ||
    python3 -m pip install -q --break-system-packages "$@" >>"$registro" 2>&1
}

if instalar_python -r pruebas/requisitos.txt graphifyy==0.9.107; then
  listo+=("Playwright, Pillow y Graphify")
else
  falta+=("paquetes de Python (pip falló)")
fi

if python3 -m playwright install --with-deps chromium >>"$registro" 2>&1 ||
   python3 -m playwright install chromium >>"$registro" 2>&1; then
  listo+=("Chromium para Playwright")
else
  falta+=("Chromium para Playwright (no se pudo descargar: ¿la red del entorno lo bloquea?)")
fi

if python3 recolector/generar_web.py >>"$registro" 2>&1; then
  listo+=("web/datos.js con los datos reales")
else
  falta+=("web/datos.js (generar_web.py falló)")
fi

if command -v gh >/dev/null 2>&1; then
  listo+=("gh")
else
  falta+=("gh (GitHub CLI): para ver las ejecuciones del recolector, mirar los commits 'Medición automática' con git log")
fi

ok=$(IFS=', '; echo "${listo[*]:-nada}")
no=$(IFS='; '; echo "${falta[*]:-nada}")
echo "Preparación de la nube (.claude/hooks/preparar-nube.sh). Listo: ${ok}. Falta: ${no}. Detalle en ${registro}."
exit 0
