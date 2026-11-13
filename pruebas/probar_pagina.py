"""Prueba de la página (regla "verificar de verdad" de CLAUDE.md).

Abre web/index.html a 1280 y 384 px en los dos estilos ("Miami 1986" y "Miami 2026") y
comprueba: sin errores en la consola, sin desborde horizontal y el estilo puesto. Antes de la
captura baja por toda la página, como una persona, para que los gráficos se dibujen y las
fotos carguen (si no, salen vacíos en la captura). Guarda una captura de cada caso en
pruebas/capturas/.

Si una foto de internet (YouTube, Twitch) no carga porque la red de la máquina no deja entrar
a ese sitio, no cuenta como fallo de la página: se avisa aparte con los sitios afectados.

Uso:  python pruebas/probar_pagina.py
      python pruebas/probar_pagina.py --seccion "#videos"   (además, captura de cerca esa parte)

Antes, para ver los datos reales: python recolector/generar_web.py (si no, salen los de ejemplo).
Código de salida: 0 todo bien; 1 algún fallo (se dice cuál).
"""
import sys

from playwright.sync_api import sync_playwright

from navegador import ANCHOS, CAPTURAS, ESTILOS, PAGINA, abrir, preparar_salida

# Errores de red de la máquina (no de la página): sitio bloqueado, sin internet, sin DNS.
ERRORES_RED = ("ERR_TUNNEL_CONNECTION_FAILED", "ERR_PROXY", "ERR_NAME_NOT_RESOLVED",
               "ERR_INTERNET_DISCONNECTED", "ERR_CONNECTION_", "ERR_NETWORK_")


def recorrer(pg):
    """Baja por la página de pantalla en pantalla y vuelve arriba."""
    alto = pg.evaluate("document.documentElement.scrollHeight")
    paso = pg.viewport_size["height"] // 2
    for y in range(0, alto + paso, paso):
        pg.evaluate(f"window.scrollTo(0, {y})")
        pg.wait_for_timeout(150)
    pg.wait_for_timeout(2500)   # que terminen de dibujarse los gráficos
    pg.evaluate("window.scrollTo(0, 0)")
    pg.wait_for_timeout(300)


def main():
    preparar_salida()
    seccion = sys.argv[sys.argv.index("--seccion") + 1] if "--seccion" in sys.argv else None
    fallos = 0
    with sync_playwright() as p:
        nav = abrir(p)
        for ancho in ANCHOS:
            for tema, boton in ESTILOS:
                pg = nav.new_page(viewport={"width": ancho, "height": 900})
                errores, sin_red = [], set()
                pg.on("requestfailed", lambda r: sin_red.add(r.url.split("/")[2])
                      if r.url.startswith("http") and any(e in (r.failure or "") for e in ERRORES_RED) else None)
                pg.on("console", lambda m: errores.append(m.text) if m.type in ("error", "warning") else None)
                pg.on("pageerror", lambda e: errores.append(str(e)))
                pg.goto(PAGINA.as_uri())
                pg.wait_for_load_state("networkidle")
                pg.get_by_role("button", name=boton).click()
                pg.wait_for_timeout(1200)
                recorrer(pg)
                # Fotos de internet que la red de esta máquina no deja cargar: aviso, no fallo.
                errores = [e for e in errores if not any(r in e for r in ERRORES_RED)]
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
                if sin_red:
                    print(f"      aviso: la red de esta máquina no dejó cargar fotos de {', '.join(sorted(sin_red))}")
                pg.close()
        nav.close()
    print("Capturas en", CAPTURAS)
    print("RESULTADO:", "todo bien" if fallos == 0 else f"{fallos} fallos")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
