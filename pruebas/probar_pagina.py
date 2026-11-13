"""Prueba de la página (regla "verificar de verdad" de CLAUDE.md).

Abre web/index.html a 1280 y 384 px en los dos estilos ("Miami 1986" y "Miami 2026") y
comprueba: sin errores en la consola, sin desborde horizontal y el estilo puesto. Guarda una
captura de cada caso en pruebas/capturas/.

Uso:  python pruebas/probar_pagina.py
      python pruebas/probar_pagina.py --seccion "#videos"   (además, captura de cerca esa parte)

Antes, para ver los datos reales: python recolector/generar_web.py (si no, salen los de ejemplo).
Código de salida: 0 todo bien; 1 algún fallo (se dice cuál).
"""
import sys

from playwright.sync_api import sync_playwright

from navegador import ANCHOS, CAPTURAS, ESTILOS, PAGINA, abrir, preparar_salida


def main():
    preparar_salida()
    seccion = sys.argv[sys.argv.index("--seccion") + 1] if "--seccion" in sys.argv else None
    fallos = 0
    with sync_playwright() as p:
        nav = abrir(p)
        for ancho in ANCHOS:
            for tema, boton in ESTILOS:
                pg = nav.new_page(viewport={"width": ancho, "height": 900})
                errores = []
                pg.on("console", lambda m: errores.append(m.text) if m.type in ("error", "warning") else None)
                pg.on("pageerror", lambda e: errores.append(str(e)))
                pg.goto(PAGINA.as_uri())
                pg.wait_for_load_state("networkidle")
                pg.get_by_role("button", name=boton).click()
                pg.wait_for_timeout(1200)
                # Datos de ejemplo: datos.js no existe y el navegador avisa que no lo encontró. Es normal.
                errores = [e for e in errores if "ERR_FILE_NOT_FOUND" not in e]
                r = pg.evaluate("""() => ({
                    tema: document.documentElement.dataset.tema,
                    desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
                    ejemplo: !document.getElementById('aviso-ejemplo').hidden})""")
                ok = r["tema"] == tema and r["desborde"] <= 0 and not errores
                fallos += not ok
                pg.screenshot(path=str(CAPTURAS / f"pagina_{ancho}_{tema}.png"), full_page=True)
                extra = ""
                if seccion:
                    el = pg.locator(seccion).first
                    el.scroll_into_view_if_needed()
                    pg.wait_for_timeout(2000)   # las partes aparecen y se dibujan al llegar a ellas
                    nombre = "".join(c for c in seccion if c.isalnum()) or "seccion"
                    b, y0 = el.bounding_box(), pg.evaluate("window.scrollY")
                    pg.screenshot(path=str(CAPTURAS / f"{nombre}_{ancho}_{tema}.png"), full_page=True,
                                  clip={"x": b["x"], "y": b["y"] + y0, "width": b["width"], "height": min(b["height"], 1400)})
                    extra = f" + {nombre}_{ancho}_{tema}.png"
                print(f"{'OK   ' if ok else 'FALLO'} {ancho}px {boton}: estilo={r['tema']} desborde={r['desborde']}px "
                      f"errores={errores or 'ninguno'} datos={'de EJEMPLO' if r['ejemplo'] else 'reales'} "
                      f"-> pagina_{ancho}_{tema}.png{extra}")
                pg.close()
        nav.close()
    print("Capturas en", CAPTURAS)
    print("RESULTADO:", "todo bien" if fallos == 0 else f"{fallos} fallos")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
