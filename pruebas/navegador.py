"""Abre el navegador para las pruebas con Playwright.

En el PC de Bruno (Windows) usa Edge, que ya está instalado. En la nube (Linux) usa el
Chromium de Playwright, que instala .claude/hooks/preparar-nube.sh al empezar la sesión.
"""
import os
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PAGINA = RAIZ / "web" / "index.html"
CAPTURAS = RAIZ / "pruebas" / "capturas"          # no se sube a git (.gitignore)
ESTILOS = (("ochenta", "Miami 1986"), ("actual", "Miami 2026"))
ANCHOS = (1280, 384)


def abrir(p):
    if os.name == "nt":
        return p.chromium.launch(channel="msedge")
    return p.chromium.launch()


def preparar_salida():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    CAPTURAS.mkdir(parents=True, exist_ok=True)
