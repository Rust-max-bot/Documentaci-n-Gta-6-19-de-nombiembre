"""Prueba del selector de videos del visitante (Fase 10, tarea 10.4).

Uso:  python recolector/generar_web.py   (antes: datos reales y web/videos-extra.js)
      python pruebas/probar_selector.py

Abre web/index.html con Edge (o el Chromium de la nube) a 1280 y 384 px, en los dos estilos, y
comprueba: con la elección de siempre no se descarga videos-extra.js; elegir "Desde cero" sin
ocultar nada trae de vuelta el video marcado _LVLtceZy3I; "Volver a lo de siempre" deja todo como
antes; una elección rota o de una configuración que ya no existe vuelve a la de siempre; sin
errores en la consola ni desborde horizontal. Capturas en pruebas/capturas/selector_*.png.
Termina con código 1 si algo falla.
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "pruebas"))
from playwright.sync_api import sync_playwright  # noqa: E402
import navegador  # noqa: E402

MARCADO = "_LVLtceZy3I"
URL = (RAIZ / "web" / "index.html").as_uri()
CAPTURAS = RAIZ / "pruebas" / "capturas"
CAPTURAS.mkdir(exist_ok=True)
fallos = []


def comprobar(cond, texto):
    print(("  bien  " if cond else "  FALLA ") + texto)
    if not cond:
        fallos.append(texto)


def ignorable(texto):
    return any(x in texto for x in ("ytimg", "jtvnw", "files.kick", "fonts.g", "ERR_NAME_NOT_RESOLVED", "ERR_INTERNET_DISCONNECTED"))


if not (RAIZ / "web" / "videos-extra.js").exists() or not (RAIZ / "web" / "datos.js").exists():
    sys.exit("Falta web/datos.js o web/videos-extra.js: correr antes python recolector/generar_web.py")

with sync_playwright() as p:
    b = navegador.abrir(p)
    for ancho in (1280, 384):
        for tema, nombre in navegador.ESTILOS:
            print(f"{ancho}px {nombre}")
            pg = b.new_page(viewport={"width": ancho, "height": 900})
            errores = []
            pg.on("pageerror", lambda e: errores.append(str(e)))
            pg.on("console", lambda m: errores.append(m.text) if m.type == "error" and not ignorable(m.text) else None)
            pg.goto(URL)
            pg.evaluate("t => { localStorage.clear(); localStorage.setItem('tema', t); }", tema)
            pg.reload()
            pg.wait_for_selector("#seccion-videos .fv-boton", timeout=15000)
            estado = pg.evaluate("[!!window.VIDEOS_EXTRA, window.DATOS.youtube.map(v => v.id)]")
            comprobar(not estado[0], "con la elección de siempre no se descarga videos-extra.js")
            comprobar(MARCADO not in estado[1], "con la elección de siempre, el video marcado no sale")
            boton = pg.locator(".fv-boton")
            comprobar("El de Rust" in boton.inner_text(), f"el botón dice qué filtro se usa ({boton.inner_text()!r})")
            boton.click()
            comprobar(pg.locator("#fv-panel").is_visible() and boton.get_attribute("aria-expanded") == "true", "el botón abre el panel")
            pg.keyboard.press("Escape")
            comprobar(not pg.locator("#fv-panel").is_visible(), "Escape cierra el panel")
            boton.click()
            pg.locator("#seccion-videos").scroll_into_view_if_needed()
            pg.wait_for_timeout(400)
            pg.locator("#seccion-videos").screenshot(path=str(CAPTURAS / f"selector_{tema}_{ancho}.png"))
            desborde = pg.evaluate("document.documentElement.scrollWidth - innerWidth")
            comprobar(desborde <= 0, f"sin desborde horizontal con el panel abierto ({desborde}px)")
            pg.locator('input[name="fv-conf"][value="desde-cero"]').check()
            for c in pg.locator('#fv-panel input[type="checkbox"]').all():
                c.uncheck()
            pg.locator(".fv-aplicar").click()
            pg.wait_for_load_state("load")
            pg.wait_for_selector("#seccion-videos .fv-boton", timeout=15000)
            estado = pg.evaluate("[!!window.VIDEOS_EXTRA, window.DATOS.youtube.map(v => v.id), window.FILTRO_VIDEOS.aviso, JSON.parse(localStorage.getItem('filtro-videos'))]")
            comprobar(estado[0] and not estado[2], "al elegir otra cosa, se carga videos-extra.js sin avisos")
            comprobar(estado[3] == {"conf": "desde-cero", "ocultos": []}, "la elección queda guardada en el navegador")
            comprobar(MARCADO in estado[1], "'Desde cero' sin ocultar nada trae de vuelta el video marcado")
            comprobar("Desde cero" in pg.locator(".fv-boton").inner_text() and "sin ocultar nada" in pg.locator(".fv-boton").inner_text(),
                      "el botón dice la elección nueva")
            pg.locator(".fv-boton").click()
            pg.locator(".fv-volver").click()
            pg.wait_for_load_state("load")
            pg.wait_for_selector("#seccion-videos .fv-boton", timeout=15000)
            estado = pg.evaluate("[!!window.VIDEOS_EXTRA, window.DATOS.youtube.map(v => v.id), localStorage.getItem('filtro-videos')]")
            comprobar(not estado[0] and MARCADO not in estado[1] and estado[2] is None, "'Volver a lo de siempre' deja todo como antes")
            if ancho == 1280 and tema == "ochenta":
                for malo, texto in (("{roto", "una elección rota"), (json.dumps({"conf": "no-existe", "ocultos": []}), "una configuración que ya no existe"),
                                    (json.dumps({"conf": "constructor", "ocultos": ["constructor"]}), "un valor raro ('constructor')")):
                    pg.evaluate("s => localStorage.setItem('filtro-videos', s)", malo)
                    pg.reload()
                    pg.wait_for_selector("#seccion-videos .fv-boton", timeout=15000)
                    e = pg.evaluate("[window.FILTRO_VIDEOS.eleccion.conf, !!window.VIDEOS_EXTRA]")
                    comprobar(e == ["rust", False], f"{texto} vuelve a la de siempre sin descargar nada")
                antes = pg.evaluate("Object.fromEntries(window.DATOS.youtube.map(v => [v.id, v.serie.length]))")
                pg.evaluate("localStorage.setItem('filtro-videos', JSON.stringify({conf: 'rust', ocultos: ['ia']}))")
                pg.reload()
                pg.wait_for_selector("#seccion-videos .fv-boton", timeout=15000)
                despues = pg.evaluate("Object.fromEntries(window.DATOS.youtube.map(v => [v.id, v.serie.length]))")
                iguales = [i for i in antes if i in despues and antes[i] != despues[i]]
                comprobar(not iguales, f"cada video de Global conserva su propia serie de visitas (no la de Español) {iguales[:3]}")
                e = pg.evaluate("[window.DATOS.youtube.length, window.DATOS.youtube.every(v => v.serie && v.serie.length), window.DATOS.youtube_es.length]")
                comprobar(e[0] > 0 and e[1] and e[2] > 0, "con otra elección, las listas tienen videos y todos traen su gráfico de visitas")
                pg.evaluate("localStorage.removeItem('filtro-videos')")
            comprobar(not errores, f"sin errores en la consola {errores[:3]}")
            pg.close()
    b.close()

print()
if fallos:
    print(f"FALLARON {len(fallos)}:")
    for f in fallos:
        print("  - " + f)
    sys.exit(1)
print("Todo bien.")
