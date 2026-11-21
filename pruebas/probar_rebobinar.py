"""Prueba de "Rebobinar el lanzamiento" (tarea 7.1).

Uso:  python recolector/generar_web.py   (antes: datos reales, web/datos.js y web/rebobinar.js)
      python pruebas/probar_rebobinar.py [--firefox]

Abre web/index.html a 1280 y 384 px, en los dos estilos, y comprueba: que rebobinar.js no se baja
hasta tocar el botón; que la barra abre al inicio del tramo; que al saltar a la hora cero de
Nueva Zelanda cambian las fichas, los récords, el gráfico, la tabla, los videos, la comparación y
los titulares (con los números reales de esa medición), que vuelve la fiesta y que la cuenta
"desde la salida" cambia al elegir otro lugar; los avisos de una medición que falló; media hora
antes/después; que los números cuentan al cambiar de momento (y al instante con "reducir
movimiento"); reproducir a 4x; el enlace a un momento (abre la página ya rebobinada); "Volver a
hoy"; sin errores en la consola ni desborde horizontal. Capturas en pruebas/capturas/rebobinar_*.png.
Termina con código 1 si algo falla.
"""
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "pruebas"))
from playwright.sync_api import sync_playwright  # noqa: E402
import navegador  # noqa: E402

URL = (RAIZ / "web" / "index.html").as_uri()
CAPTURAS = RAIZ / "pruebas" / "capturas"
FIREFOX = "--firefox" in sys.argv
fallos = []


def comprobar(cond, texto):
    print(("  bien  " if cond else "  FALLA ") + texto)
    if not cond:
        fallos.append(texto)


def ignorable(texto):
    return any(x in texto for x in ("ytimg", "jtvnw", "files.kick", "fonts.g", "ERR_NAME_NOT_RESOLVED", "ERR_INTERNET_DISCONNECTED", "NS_ERROR"))


def leer_js(nombre, variable):
    t = (RAIZ / "web" / nombre).read_text(encoding="utf-8")
    return json.loads(t[t.index(variable + " = ") + len(variable) + 3:].rstrip().rstrip(";"))


if not (RAIZ / "web" / "rebobinar.js").exists():
    sys.exit("Falta web/rebobinar.js: correr antes python recolector/generar_web.py")
navegador.preparar_salida()
R = leer_js("rebobinar.js", "window.REBOBINAR")
D = leer_js("datos.js", "window.DATOS")
MOM = R["momentos"]
NZ = next(i for i, m in enumerate(MOM) if m["t"] >= "2026-11-18T11:00:00Z")
med_nz = next(m for m in D["mediciones"] if m["t"] == MOM[NZ]["t"])
FALLO_TRENDS = next((i for i, m in enumerate(MOM) if "trends" in m.get("fallos", {})), None)


def num(n):
    return f"{n:,}".replace(",", ".")


with sync_playwright() as p:
    b = navegador.abrir(p, FIREFOX)
    pre = "firefox_" if FIREFOX else ""
    for ancho in navegador.ANCHOS:
        for tema, nombre in navegador.ESTILOS:
            print(f"{ancho}px {nombre}")
            ctx = b.new_context(viewport={"width": ancho, "height": 860}, timezone_id="America/Santiago")
            pg = ctx.new_page()
            errores, pedidos = [], []
            pg.on("pageerror", lambda e: errores.append(str(e)))
            pg.on("console", lambda m: errores.append(m.text) if m.type == "error" and not ignorable(m.text) else None)
            pg.on("request", lambda r: pedidos.append(r.url))
            pg.goto(URL)
            pg.evaluate("t => { localStorage.clear(); localStorage.setItem('tema', t); }", tema)
            pg.reload()
            pg.wait_for_selector("#rebobinar:not([hidden])", timeout=15000)
            comprobar(not any("rebobinar.js" in u for u in pedidos) and pg.evaluate("!window.REBOBINAR"), "rebobinar.js no se baja hasta tocar el botón")

            pg.click("#rb-abrir")
            pg.wait_for_selector("#rb-barra:not([hidden])", timeout=15000)
            ini = pg.evaluate("[document.getElementById('rb-rango').value, document.getElementById('rb-rango').max, document.querySelector('.rb-momento').innerText]")
            comprobar(ini[0] == "0" and ini[1] == str(len(MOM) - 1), f"la barra abre al inicio del tramo, con {len(MOM)} paradas ({ini[0]} de {ini[1]})")
            comprobar("18 nov" in ini[2] and "5:07" in ini[2] and "faltan 2 h 53 min para la salida en Nueva Zelanda" in ini[2], f"hora del inicio y cuenta hasta Nueva Zelanda ({ini[2]!r})")
            tr0 = R["tr_med"].get(str(int(datetime.strptime(MOM[0]["t"], "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc).timestamp())))
            f_tr = pg.evaluate("document.querySelectorAll('#fichas .ficha')[2].textContent")
            comprobar(tr0 is not None and f_tr.startswith("Google Trends" + str(tr0)), f"Trends con la escala de ese momento ({tr0} de 100; ficha: {f_tr[:40]!r})")
            ini2 = pg.evaluate("[document.querySelector('.lema').textContent, document.getElementById('linea').textContent, document.getElementById('cuenta').textContent]")
            comprobar(ini2[0] == "El día que salió GTA 6" and "Medianoche en Nueva Zelanda" not in ini2[1], f"portada y línea de tiempo de antes de la hora cero ({ini2[0]!r})")
            comprobar(pg.locator("#resumen.rb-hoy .rb-nota-hoy").count() == 1 and pg.locator("#records.rb-hoy, #seccion-linea.rb-hoy").count() == 0,
                      "las secciones que no viajan en el tiempo quedan tenues con su nota; las que viajan, no")

            pg.click('#rb-barra .rb-ceros [data-salto="nz"]')
            pg.wait_for_timeout(500)   # la dirección se actualiza a los 400 ms
            est = pg.evaluate("""() => ({
              idx: document.getElementById('rb-rango').value,
              momento: document.querySelector('.rb-momento').innerText,
              fichas: document.getElementById('fichas').innerText,
              aviso: document.getElementById('aviso-lanz').hidden ? '' : document.getElementById('aviso-lanz').textContent,
              fuegos: document.querySelectorAll('#rb-fiesta canvas, .portada canvas.fuegos').length,
              lema: document.querySelector('.lema').textContent,
              linea: document.getElementById('linea').textContent,
              finales: document.querySelectorAll('#g-twitch .rb-fin').length,
              tabla: (document.querySelector('#t-twitch tbody tr td') || {}).innerText,
              comp: document.getElementById('comparacion-nota').innerText,
              ultimas: document.querySelectorAll('#noticias-ultimas li').length,
              resumen: document.getElementById('noticias-resumen').innerText,
              videos: document.getElementById('videos').innerText,
              records: document.getElementById('records-vitrina').textContent,
              fechas: [...document.querySelectorAll('#noticias-ultimas li small')].map(x => x.textContent),
              url: location.search
            })""")
            comprobar(est["idx"] == str(NZ), f"'Saltar a Nueva Zelanda' va a la primera medición después de su hora cero ({est['idx']})")
            comprobar("8:07" in est["momento"] and "+7 min desde la salida en Nueva Zelanda" in est["momento"], f"hora y cuenta en la hora cero de Nueva Zelanda ({est['momento']!r})")
            tw = med_nz["twitch"]["espectadores"]
            comprobar(num(tw) in est["fichas"] and "Récord hasta ahí" in est["fichas"], f"la ficha de Twitch muestra el dato real de esa medición ({num(tw)}) y el récord hasta ahí")
            comprobar("GTA 6 ya salió en Nueva Zelanda" in est["aviso"] and "en Chile faltan" in est["aviso"], f"al pasar por la hora cero vuelve el aviso de la portada ({est['aviso'][:60]!r})")
            comprobar(est["fuegos"] >= 1, f"y los fuegos artificiales (en la portada y, si no está a la vista, sobre la pantalla) ({est['fuegos']})")
            comprobar(est["lema"] == "¡Ya salió GTA 6 en Nueva Zelanda!", f"la portada cambia su lema como en la hora cero ({est['lema']!r})")
            comprobar("Medianoche en Nueva Zelanda" in est["linea"], "la línea de tiempo suma la hora cero de Nueva Zelanda")
            comprobar(est["finales"] == 2, "el gráfico de Twitch y Kick marca el momento al final de cada línea")
            comprobar(est["tabla"] and "8:07" in est["tabla"], f"la tabla empieza en la medición de ese momento ({est['tabla']!r})")
            comprobar("Medición de 18 nov" in est["comp"], f"la comparación es la de ese momento ({est['comp']!r})")
            comprobar(est["ultimas"] == min(6, MOM[NZ]["nt"]["n"]) and "hasta ese momento" in est["resumen"], f"titulares hasta ese momento ({est['ultimas']} últimos)")
            comprobar("a las 8:07" in est["videos"], "los videos muestran sus visitas a esa hora")
            comprobar("En ese momento" in est["records"], "los récords muestran el valor de ese momento")
            rv = MOM[NZ]["rv"]["video"][1]
            comp = f"{rv / 1e6:.1f}".replace(".", ",").replace(",0", "") + " M"
            comprobar(comp in est["records"].split("Video más visto")[1][:40], f"el récord 'Video más visto' trae las visitas de ese momento ({comp}), no las de después")
            comprobar(est["fechas"] and all("nov" in f for f in est["fechas"]), f"'Lo último' muestra la fecha de cada titular ({est['fechas'][:1]})")
            comprobar("momento=2026-11-18T11:07Z" in est["url"], f"la dirección guarda el momento ({est['url']})")
            pista = pg.evaluate("[document.querySelectorAll('.rb-pulso .linea-antes').length, document.querySelectorAll('.rb-pulso .linea-despues').length, document.querySelectorAll('.rb-pulso .cero').length, (document.querySelector('.rb-pulso .valor') || {}).textContent]")
            comprobar(pista[0] == 1 and pista[1] == 1 and pista[2] == 3 and pista[3] == "2 M", f"la pista dibuja lo vivido, lo que viene, las 3 horas cero y el valor del momento ({pista})")
            pg.screenshot(path=str(CAPTURAS / f"{pre}rebobinar_{tema}_{ancho}_nz.png"))
            pg.locator("#seccion-twitch").scroll_into_view_if_needed()
            pg.wait_for_timeout(300)
            pg.locator("#seccion-twitch").screenshot(path=str(CAPTURAS / f"{pre}rebobinar_{tema}_{ancho}_twitch.png"))

            pg.click("#rb-barra .rb-mas")
            pg.click('#rb-barra .rb-menu [data-ref="mia"]')
            m = pg.locator(".rb-momento").inner_text()
            comprobar("faltan 17 h 53 min para la salida en Miami" in m, f"al elegir Miami, la cuenta es hasta Miami ({m!r})")
            pg.click('#rb-barra .rb-menu [data-ref="nz"]')
            pg.keyboard.press("Escape")
            comprobar(pg.locator("#rb-menu").is_hidden(), "Escape cierra el menú ⋯")

            pg.evaluate("document.querySelector('#records-vitrina details') && (document.querySelector('#records-vitrina details').open = true)")
            pg.click('#rb-barra [data-paso="1"]')
            comprobar(pg.evaluate("!document.querySelector('#records-vitrina details') || document.querySelector('#records-vitrina details').open"), "'Récords anteriores' abierto sigue abierto al avanzar")
            comprobar(pg.evaluate("document.getElementById('rb-rango').value") == str(NZ + 1), "+30 min avanza una medición")
            pg.click('#rb-barra [data-paso="-1"]')
            comprobar(pg.evaluate("document.getElementById('rb-rango').value") == str(NZ), "−30 min retrocede una medición")

            # 7.1 a (opción 1 de Bruno): al cambiar de momento, los números cuentan en 250 ms en vez
            # de saltar y terminan en el valor exacto; con "reducir movimiento", cambian al instante.
            contar = """() => new Promise(listo => {
              document.querySelector('#rb-barra [data-paso="1"]').click();
              const b = () => document.querySelector('#fichas [data-rb]');
              setTimeout(() => { const medio = b().textContent;
                setTimeout(() => listo([medio, b().textContent, b().dataset.v]), 400); }, 80);
            })"""
            c = pg.evaluate(contar)
            comprobar(c[0] != c[1] and c[1] == num(int(float(c[2]))), f"los números cuentan al cambiar de momento y terminan exactos ({c})")
            pg.click('#rb-barra [data-paso="-1"]')
            pg.emulate_media(reduced_motion="reduce")
            c = pg.evaluate(contar)
            comprobar(c[0] == c[1] == num(int(float(c[2]))), f"con 'reducir movimiento' los números cambian al instante ({c})")
            pg.emulate_media(reduced_motion="no-preference")
            pg.click('#rb-barra [data-paso="-1"]')
            pg.wait_for_timeout(400)

            if FALLO_TRENDS is not None:
                pg.evaluate(f"window.__rebobinar.ir({FALLO_TRENDS})")
                f = pg.evaluate("(document.querySelector('#seccion-trends .rb-fallo') || {}).innerText || ''")
                comprobar("Google Trends falló" in f and "Dato de hace" in f, f"medición con Trends caído: último dato bueno con aviso ({f!r})")
                comprobar(pg.locator("#seccion-twitch .rb-fallo").count() == 0, "y sin aviso en las secciones que sí tienen dato")

            pg.click("#rb-barra .rb-mas")
            pg.click('#rb-barra .rb-menu [data-vel="4"]')
            pg.click("#rb-barra .rb-play")
            pg.wait_for_timeout(1700)
            pg.click("#rb-barra .rb-play")
            avanzo = int(pg.evaluate("document.getElementById('rb-rango').value")) - (FALLO_TRENDS if FALLO_TRENDS is not None else NZ)
            comprobar(2 <= avanzo <= 5, f"reproducir a 4x avanza media hora cada medio segundo ({avanzo} en 1,7 s)")

            pg.evaluate(f"window.__rebobinar.ir({len(MOM) - 1})")
            fin = pg.locator(".rb-momento").inner_text()
            comprobar("20 nov" in fin and pg.locator('#rb-barra [data-paso="1"]').is_disabled(), f"la última parada es el 20 nov y no deja avanzar más ({fin!r})")
            desborde = pg.evaluate("document.documentElement.scrollWidth - innerWidth")
            comprobar(desborde <= 0, f"sin desborde horizontal con la barra abierta ({desborde}px)")
            pg.screenshot(path=str(CAPTURAS / f"{pre}rebobinar_{tema}_{ancho}_fin.png"))

            pg.click("#rb-barra .rb-mas")
            pg.click("#rb-barra .rb-copiar")
            pg.wait_for_timeout(200)
            av = pg.locator(".rb-aviso").inner_text()
            comprobar("Enlace copiado" in av or "Copia este enlace" in av, f"'Copiar enlace' avisa ({av[:40]!r})")

            pg.evaluate(f"window.__rebobinar.ir({NZ})")
            pg.wait_for_timeout(500)
            enlace = pg.evaluate("location.href")
            pg2 = ctx.new_page()
            pg2.on("pageerror", lambda e: errores.append(str(e)))
            pg2.goto(enlace.replace(":07Z", "%3A07Z"))   # como lo deja una app de mensajes
            pg2.wait_for_selector("#rb-barra:not([hidden])", timeout=15000)
            comprobar(pg2.evaluate("document.getElementById('rb-rango').value") == str(NZ) and num(tw) in pg2.locator("#fichas").inner_text(),
                      "el enlace (con los dos puntos codificados) abre la página ya rebobinada en ese momento")
            pg2.close()

            pg.click("#rb-barra .rb-volver")
            pg.wait_for_timeout(300)
            hoy = pg.evaluate("[document.getElementById('rb-barra').hidden, document.querySelectorAll('.rb-hoy, .rb-fallo').length, document.getElementById('fichas').textContent, location.search, (document.querySelector('#fichas b[data-hasta]') || {dataset: {}}).dataset.hasta]")
            pico = max(m["twitch"]["espectadores"] for m in D["mediciones"] if "espectadores" in m["twitch"])
            comprobar(pg.evaluate("document.querySelectorAll('#rb-fiesta canvas, .portada canvas.fuegos, .portada .reflectores').length") == 0, "al volver a hoy no quedan fuegos")
            comprobar(pg.evaluate("document.querySelector('.lema').textContent") == "¡Ya salió GTA 6!", "y la portada vuelve a la de hoy")
            comprobar(hoy[0] and hoy[1] == 0 and "Máximo en Twitch" in hoy[2] and hoy[4] == str(pico) and "momento=" not in hoy[3], "'Volver a hoy' deja la página como siempre (máximo de Twitch de hoy)")
            comprobar(not errores, "sin errores en la consola" + (": " + " | ".join(errores[:3]) if errores else ""))
            ctx.close()
    # Visitante con otro filtro de videos (10.4): el rebobinado usa "El de Rust" y lo avisa.
    print("1280px con el filtro 'Desde cero' del visitante")
    ctx = b.new_context(viewport={"width": 1280, "height": 860}, timezone_id="America/Santiago")
    pg = ctx.new_page()
    errores = []
    pg.on("pageerror", lambda e: errores.append(str(e)))
    pg.goto(URL)
    pg.evaluate("localStorage.setItem('filtro-videos', JSON.stringify({conf: 'desde-cero', ocultos: []}))")
    pg.reload()
    pg.wait_for_selector("#rebobinar:not([hidden])", timeout=15000)
    comprobar(pg.evaluate("!!window.VIDEOS_EXTRA && window.FILTRO_VIDEOS.aplicado"), "el filtro del visitante está puesto")
    pg.click("#rb-abrir")
    pg.wait_for_selector("#rb-barra:not([hidden])", timeout=15000)
    pg.click('#rb-barra .rb-ceros [data-salto="nz"]')
    nota = pg.evaluate("(document.querySelector('#seccion-videos .rb-filtro') || {}).textContent || ''")
    comprobar("El de Rust" in nota, f"la sección de videos avisa que se usa el filtro de Rust ({nota[:50]!r})")
    rec = pg.evaluate("document.getElementById('records-vitrina').textContent")
    rv = MOM[NZ]["rv"]["video"][1]
    comp = f"{rv / 1e6:.1f}".replace(".", ",").replace(",0", "") + " M"
    comprobar(comp in rec.split("Video más visto")[1][:40], f"y los récords son los de Rust en ese momento ({comp})")
    pg.click("#rb-barra .rb-volver")
    comprobar(pg.locator("#seccion-videos .rb-filtro").count() == 0, "al volver a hoy se quita el aviso")
    comprobar(not errores, "sin errores en la consola" + (": " + " | ".join(errores[:3]) if errores else ""))
    ctx.close()
    b.close()

print("RESULTADO: " + ("todo bien" if not fallos else f"{len(fallos)} fallos"))
sys.exit(1 if fallos else 0)
