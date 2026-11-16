"""Abre el navegador para las pruebas con Playwright.

En el PC de Bruno (Windows) usa Edge, que ya está instalado. En la nube (Linux) usa el
Chromium de Playwright, que instala .claude/hooks/preparar-nube.sh al empezar la sesión. Si
ese Chromium no está (la versión de Playwright no coincide o la red no dejó bajarlo), usa el
que ya viene en la máquina de la nube (CHROMIUM_NUBE).
"""
import os
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PAGINA = RAIZ / "web" / "index.html"
CAPTURAS = RAIZ / "pruebas" / "capturas"          # no se sube a git (.gitignore)
ESTILOS = (("ochenta", "Miami 1986"), ("actual", "Miami 2026"))
ANCHOS = (1280, 384)
CHROMIUM_NUBE = Path("/opt/pw-browsers/chromium")   # navegador que trae la máquina de la nube


def abrir(p, firefox=False):
    """Con firefox=True usa el Firefox de Playwright (pedido de Bruno, 2026-11-16), para ver
    que la página también funciona con ese motor. El Firefox normal del PC no sirve: Playwright
    necesita el suyo. Si no está instalado, se dice cómo instalarlo."""
    if firefox:
        try:
            return p.firefox.launch()
        except Exception as e:
            if "Executable doesn't exist" not in str(e):
                raise
            sys.exit("Falta el Firefox de Playwright. Instalarlo con: python -m playwright install firefox")
    if os.name == "nt":
        return p.chromium.launch(channel="msedge")
    try:
        return p.chromium.launch()
    except Exception:
        if not CHROMIUM_NUBE.exists():
            raise
        print(f"(Chromium de Playwright no encontrado: se usa {CHROMIUM_NUBE})")
        return p.chromium.launch(executable_path=str(CHROMIUM_NUBE))


def preparar_salida():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    CAPTURAS.mkdir(parents=True, exist_ok=True)
