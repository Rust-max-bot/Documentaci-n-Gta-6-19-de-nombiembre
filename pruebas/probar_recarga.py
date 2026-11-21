"""Revisa que la recarga automática deje la página donde estaba (tarea 9.4, 2026-11-21).

El fallo que había: al recargar sola por datos nuevos, la página hacía un scrollTo cuando aún
no tenía todo su alto; el navegador lo recortaba y, con el desplazamiento suave del CSS, la
vista se iba ~2.000 px más arriba (Titulares quedaba 1.700 a 4.600 px corrido).

Sirve web/ por http (la recarga sola no funciona abierta como archivo), hace como si
version.json tuviera datos nuevos y pasa la pestaña a segundo plano (el mismo camino que la
recarga de verdad; el botón "Hay datos nuevos" no sirve: está arriba de todo) y mira dónde
queda todo. A 1280 y 384 px, en los dos estilos:
  1. titulares: con Titulares arriba de la pantalla, sigue arriba tras recargar.
  2. dentro: a media sección (300 px dentro de una del medio), queda igual.
  3. se arma tarde: como en un celular lento, lo de arriba de Titulares aparece 1,5 s después
     de recargar (al principio la página es más corta). Es el caso que fallaba antes: el
     arreglo tiene que esperar a que esté y dejar Titulares donde estaba.
  4. arriba crece: si lo de arriba crece 1.200 px después de recargar, la sección no se mueve.
  5. la persona mueve: si gira la rueda justo después, la página no la devuelve a la fuerza.
  6. oculta: lo normal de verdad. La página recargada sigue en segundo plano (el navegador no
     corre requestAnimationFrame ahí), se arma tarde, llega una SEGUNDA recarga sola mientras
     sigue oculta y recién después la persona vuelve a la pestaña: Titulares, donde estaba.
  7. recarga a mano: si la persona recarga ella misma durante los 5 s de corrección, la página
     siguiente vuelve a tener history.scrollRestoration = "auto" (no queda pegado "manual").
Además: sin errores en la consola y el navegador vuelve a restaurar él las recargas normales
(history.scrollRestoration = "auto").

Uso (antes, python recolector/generar_web.py):  python pruebas/probar_recarga.py [--firefox]
"""
import argparse
import functools
import http.server
import sys
import threading

from playwright.sync_api import sync_playwright

from navegador import ANCHOS, ESTILOS, PAGINA, abrir, preparar_salida

TOLERANCIA = 3   # px


class Servidor(http.server.SimpleHTTPRequestHandler):
    # HTTP/1.1: con HTTP/1.0, a veces una carga se quedaba ~19 s esperando (ver medir_carga.py).
    protocol_version = "HTTP/1.1"

    def log_message(self, *a):
        pass


class Callado(http.server.ThreadingHTTPServer):
    def handle_error(self, *a):
        pass   # el navegador corta conexiones al recargar: no es un fallo


def ignorable(texto):
    """Fotos y letras de internet que la prueba no deja bajar (no son fallos de la página)."""
    return any(x in texto for x in ("ytimg", "jtvnw", "files.kick", "fonts.g", "ERR_FAILED", "ERR_NAME_NOT_RESOLVED",
                                    "ERR_INTERNET_DISCONNECTED", "NS_ERROR", "Failed to load resource"))


def ir(pg, url):
    for intento in range(3):
        try:
            pg.goto(url, wait_until="domcontentloaded", timeout=45000)
            return
        except Exception:
            if intento == 2:
                raise


def caso(nav, url, ancho, estilo, nombre):
    ctx = nav.new_context(viewport={"width": ancho, "height": 800})
    ctx.add_init_script(f'try{{localStorage.setItem("tema","{estilo}")}}catch(e){{}}')
    ctx.route(lambda u: not u.startswith(url.rsplit("/", 1)[0]), lambda r: r.abort())   # nada de internet
    pg = ctx.new_page()
    errores = []
    pg.on("pageerror", lambda e: errores.append(str(e)))
    pg.on("console", lambda m: errores.append(m.text) if m.type == "error" and not ignorable(m.text) else None)
    fallos = []
    try:
        ir(pg, url)
        pg.wait_for_timeout(3000)
        if nombre == "dentro":
            sec = pg.evaluate("""() => { const h = document.documentElement.scrollHeight / 2;
              const s = [...document.querySelectorAll('section[id]')].filter(e => !e.hidden && e.offsetHeight > 700);
              s.sort((a, b) => Math.abs(a.getBoundingClientRect().top + scrollY - h) - Math.abs(b.getBoundingClientRect().top + scrollY - h));
              return s[0].id; }""")
        else:
            sec = "seccion-noticias"
        medir = f"Math.round(document.getElementById('{sec}').getBoundingClientRect().top)"
        pg.evaluate(f"document.getElementById('{sec}').scrollIntoView({{behavior: 'instant'}})")
        if nombre == "dentro":
            pg.evaluate("window.scrollBy({top: 300, behavior: 'instant'})")
        pg.wait_for_timeout(2500)
        antes = pg.evaluate(medir)
        # version.json con una fecha más nueva: la página ofrece el botón (alguien la está moviendo).
        ctx.route("**/version.json", lambda r: r.fulfill(body='{"generado":"2099-01-01T00:00:00Z"}', content_type="application/json"))
        pg.evaluate("document.dispatchEvent(new Event('visibilitychange'))")
        pg.wait_for_selector("#en-vivo-boton", timeout=15000)
        if nombre == "oculta":
            # Solo en las cargas que vienen de una recarga sola: la pestaña sigue oculta (sin
            # requestAnimationFrame, como en un navegador de verdad) hasta que la prueba la muestra,
            # y la página mira version.json cada 1,5 s en vez de cada 2 min.
            ctx.add_init_script("""if (sessionStorage.getItem('gta6-recarga') === '1') {
              window.__oculta = true; const cola = [], raf = window.requestAnimationFrame.bind(window);
              Object.defineProperty(document, 'hidden', { get: () => window.__oculta, configurable: true });
              Object.defineProperty(document, 'visibilityState', { get: () => window.__oculta ? 'hidden' : 'visible', configurable: true });
              window.requestAnimationFrame = cb => window.__oculta ? (cola.push(cb), 0) : raf(cb);
              window.__mostrar = () => { window.__oculta = false; cola.splice(0).forEach(cb => raf(cb));
                document.dispatchEvent(new Event('visibilitychange')); };
              const si = window.setInterval.bind(window);
              window.setInterval = (f, ms, ...a) => si(f, ms === 120000 ? 1500 : ms, ...a); }""")
        if nombre in ("se arma tarde", "oculta"):
            # Solo en la carga que viene de la recarga sola: lo demás oculto durante 1,5 s.
            ctx.add_init_script(f"""if (sessionStorage.getItem('gta6-recarga') === '1') {{
              const st = new CSSStyleSheet();   // aquí aún no hay <html>: hoja "adoptada"
              st.replaceSync('section[id]:not(#{sec}) {{ display: none !important; }}');
              document.adoptedStyleSheets = [...document.adoptedStyleSheets, st];
              setTimeout(() => {{ document.adoptedStyleSheets = document.adoptedStyleSheets.filter(x => x !== st); }}, 1500); }}""")
        # La recarga sola de verdad: la pestaña pasa a segundo plano con datos nuevos esperando.
        # (No se toca el botón: está arriba de todo y tocarlo ya deja la página arriba.)
        with pg.expect_navigation(wait_until="domcontentloaded", timeout=90000):
            pg.evaluate("""() => { Object.defineProperty(document, 'hidden', { get: () => true, configurable: true });
              document.dispatchEvent(new Event('visibilitychange')); }""")
        if nombre == "oculta":
            with pg.expect_navigation(wait_until="domcontentloaded", timeout=30000):
                pass   # la segunda recarga sola, con la pestaña todavía oculta
            ctx.unroute("**/version.json")
            pg.wait_for_timeout(3000)
            pg.evaluate("window.__mostrar()")   # la persona vuelve a la pestaña
        ctx.unroute("**/version.json")
        if nombre == "recarga a mano":
            pg.wait_for_timeout(500)
            with pg.expect_navigation(wait_until="domcontentloaded", timeout=90000):
                pg.evaluate("location.reload()")
            pg.wait_for_timeout(1500)
            modo = pg.evaluate("history.scrollRestoration")
            ctx.close()
            return [f"{nombre}: history.scrollRestoration quedó en '{modo}'"] * (modo != "auto") +                 [f"{nombre}: error en la consola: {e[:160]}" for e in errores]
        if nombre == "arriba crece":
            pg.wait_for_timeout(1200)
            pg.evaluate("""() => { const d = document.createElement('div'); d.style.height = '1200px';
              const m = document.querySelector('main') || document.body; m.insertBefore(d, m.firstChild); }""")
        if nombre == "la persona mueve":
            pg.wait_for_timeout(400)
            pg.mouse.move(ancho / 2, 400)
            pg.mouse.wheel(0, -700)
        pg.wait_for_timeout(6500)
        despues = pg.evaluate(medir)
        modo = pg.evaluate("history.scrollRestoration")
        if nombre == "la persona mueve":
            if abs(despues - antes) < 300:
                fallos.append(f"{nombre}: la página volvió a la fuerza (#{sec} a {antes} px y luego a {despues} px)")
        elif abs(despues - antes) > TOLERANCIA:
            fallos.append(f"{nombre}: #{sec} estaba a {antes} px de arriba y quedó a {despues} px")
        if modo != "auto":
            fallos.append(f"{nombre}: history.scrollRestoration quedó en '{modo}'")
        if pg.evaluate("sessionStorage.getItem('gta6-lugar-recarga')") is not None:
            fallos.append(f"{nombre}: quedó guardado el lugar de la recarga")
    except Exception as e:
        fallos.append(f"{nombre}: la prueba no pudo terminar ({str(e).splitlines()[0]})")
    fallos += [f"{nombre}: error en la consola: {e[:160]}" for e in errores]
    ctx.close()
    return fallos


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--firefox", action="store_true", help="en el Firefox de Playwright")
    a = ap.parse_args()
    preparar_salida()
    srv = Callado(("127.0.0.1", 0), functools.partial(Servidor, directory=str(PAGINA.parent)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{srv.server_port}/index.html"
    todos = []
    with sync_playwright() as p:
        nav = abrir(p, a.firefox)
        for ancho in ANCHOS:
            for estilo, nombre_estilo in ESTILOS:
                fallos = []
                for nombre in ("titulares", "dentro", "se arma tarde", "arriba crece", "la persona mueve", "oculta", "recarga a mano"):
                    fallos += caso(nav, url, ancho, estilo, nombre)
                print(("OK   " if not fallos else "FALLO") + f" {ancho}px {nombre_estilo}" + "".join("\n      " + f for f in fallos))
                todos += fallos
        nav.close()
    srv.shutdown()
    print("RESULTADO: " + ("todo bien" if not todos else f"{len(todos)} fallo(s)"))
    sys.exit(1 if todos else 0)


if __name__ == "__main__":
    main()
