"""Mide cuánto tarda en cargar la página (tarea 9.4, pedido de Bruno, 2026-11-20).

Sirve para comparar antes y después de optimizar: se corre igual en las dos versiones y se
miran los números. No cambia nada de web/ ni de datos/: copia web/ a pruebas/capturas/medir/
(que no se sube a git) y la sirve desde ahí con compresión gzip, como GitHub Pages.

Cómo se mide (celular lento, el mismo de la medición del 16 nov en PLAN.md): 384 px de ancho,
CPU 4 veces más lenta, red de 1,6 Mbps con 150 ms de demora. Se abre la página 3 veces (sin
nada guardado en el navegador) y se da la mediana (entre paréntesis, la más rápida y la más
lenta) de:
  - datos.js: lo que pesa sin comprimir y lo que viaja comprimido;
  - primer dibujo: cuándo se ve algo en la pantalla;
  - página armada: cuándo terminó app.js (marca "app-listo"): lo que de verdad espera quien
    visita; antes de eso la portada se ve sin rellenar;
  - carga completa: cuándo terminó de bajar todo (evento "load", incluye letras de Google);
  - bloqueo: suma de lo que las tareas largas del navegador pasan de 50 ms hasta 3 s después
    de la carga (la página no responde mientras tanto).

Con --simular N, datos.js se rehace con N mediciones: las reales y, después de la última,
copias de las reales con la hora corrida de a una hora. Es para ver cómo cargará la página
cuando haya más datos (~1.000 mediciones el 19 dic). Ese datos.js va marcado como inventado
("ejemplo": true y aviso en la cabecera) y solo vive en pruebas/capturas/medir/.

Uso (antes, python recolector/generar_web.py):
  python pruebas/medir_carga.py                 # con los datos de hoy
  python pruebas/medir_carga.py --simular 1000  # como el 19 dic
  python pruebas/medir_carga.py --web <carpeta> # otra versión de la página, para comparar
"""
import argparse
import gzip
import http.server
import json
import shutil
import statistics
import threading
from datetime import datetime, timedelta, timezone
from functools import partial

from playwright.sync_api import sync_playwright

from navegador import CAPTURAS, RAIZ, abrir, preparar_salida

COPIA = CAPTURAS / "medir" / "web"
COMPRIMIR = (".js", ".css", ".html", ".json", ".svg")
VECES = 5
LENTO = {"offline": False, "latency": 150, "downloadThroughput": 1.6e6 / 8, "uploadThroughput": 0.75e6 / 8}

# Se pega antes de que cargue la página: junta las tareas largas y el primer dibujo.
ESPIA = """
window.__largas = [];
try {
  new PerformanceObserver(function (l) { l.getEntries().forEach(function (e) {
    window.__largas.push([e.startTime, e.duration]); }); }).observe({ type: "longtask", buffered: true });
} catch (e) {}
"""


class Servidor(http.server.SimpleHTTPRequestHandler):
    """Sirve la copia de web/ comprimiendo con gzip lo que GitHub Pages también comprime."""

    def send_head(self):
        ruta = self.translate_path(self.path.split("?")[0])
        if ruta.endswith(COMPRIMIR) and "gzip" in self.headers.get("Accept-Encoding", ""):
            try:
                with open(ruta, "rb") as f:
                    cuerpo = gzip.compress(f.read(), 6)
            except OSError:
                return super().send_head()
            self.send_response(200)
            self.send_header("Content-Type", self.guess_type(ruta))
            self.send_header("Content-Encoding", "gzip")
            self.send_header("Content-Length", str(len(cuerpo)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return _Cuerpo(cuerpo)
        return super().send_head()

    def log_message(self, *a):
        pass


class _Cuerpo:
    def __init__(self, b):
        self.b = b

    def read(self, *a):
        b, self.b = self.b, b""
        return b

    def close(self):
        pass


def copiar_web(simular, origen=None):
    if COPIA.exists():
        shutil.rmtree(COPIA)
    shutil.copytree(origen or RAIZ / "web", COPIA)
    if not simular:
        return
    ruta = COPIA / "datos.js"
    texto = ruta.read_text(encoding="utf-8")
    d = json.loads(texto[texto.index("{"):texto.rindex("}") + 1])
    reales = d["mediciones"]
    if simular <= len(reales):
        raise SystemExit(f"Ya hay {len(reales)} mediciones: --simular tiene que ser más que eso.")
    ultima = datetime.fromisoformat(reales[-1]["t"].replace("Z", "+00:00"))
    for k in range(simular - len(reales)):
        copia = json.loads(json.dumps(reales[k % len(reales)]))
        copia["t"] = (ultima + timedelta(hours=k + 1)).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        reales.append(copia)
    d["ejemplo"] = True
    ruta.write_text("/* DATOS INVENTADOS para medir la carga (pruebas/medir_carga.py --simular): las mediciones\n"
                    f"   reales y copias con la hora corrida hasta llegar a {simular}. No es el recuerdo. */\n"
                    "window.DATOS = " + json.dumps(d, ensure_ascii=False) + ";\n", encoding="utf-8")


def medir_una(navegador, url):
    ctx = navegador.new_context(viewport={"width": 384, "height": 800})
    pg = ctx.new_page()
    cdp = ctx.new_cdp_session(pg)
    cdp.send("Network.enable")
    cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})
    cdp.send("Network.emulateNetworkConditions", LENTO)
    cdp.send("Emulation.setCPUThrottlingRate", {"rate": 4})
    pg.add_init_script(ESPIA)
    errores = []
    pg.on("pageerror", lambda e: errores.append(str(e)))
    pg.goto(url, wait_until="load", timeout=120000)
    pg.wait_for_timeout(3000)
    r = pg.evaluate("""() => {
      const nav = performance.getEntriesByType("navigation")[0];
      const pinta = performance.getEntriesByName("first-contentful-paint")[0];
      const datos = performance.getEntriesByType("resource").find(e => /\\/datos\\.js/.test(e.name));
      const bloqueo = (window.__largas || []).reduce((s, x) => s + Math.max(0, x[1] - 50), 0);
      const listo = performance.getEntriesByName("app-listo")[0];
      return { carga: nav.loadEventEnd, listo: listo ? listo.startTime : null, pinta: pinta ? pinta.startTime : null, bloqueo: bloqueo,
               largas: (window.__largas || []).length,
               viaja: datos ? datos.transferSize : null, pesa: datos ? datos.decodedBodySize : null };
    }""")
    ctx.close()
    if errores:
        raise SystemExit("La página dio errores: " + " | ".join(errores))
    return r


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--simular", type=int, default=0, help="rehacer datos.js con N mediciones")
    ap.add_argument("--web", help="otra carpeta con la página (p. ej. la versión de antes) en vez de web/")
    a = ap.parse_args()
    preparar_salida()
    if not (RAIZ / "web" / "datos.js").exists():
        raise SystemExit("Falta web/datos.js: correr antes python recolector/generar_web.py")
    copiar_web(a.simular, a.web)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), partial(Servidor, directory=str(COPIA)))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{srv.server_address[1]}/index.html"
    with sync_playwright() as p:
        nav = abrir(p)
        vueltas = [medir_una(nav, url) for _ in range(VECES)]
        nav.close()
    srv.shutdown()
    def med(k):
        return statistics.median(v[k] for v in vueltas if v[k] is not None)

    def rango(k, div=1000, dec=2):
        xs = [v[k] for v in vueltas if v[k] is not None]
        return f"({min(xs) / div:.{dec}f}-{max(xs) / div:.{dec}f})" if xs else ""
    print(f"Celular lento (384 px, CPU 4x, 1,6 Mbps, 150 ms), mediana de {VECES} cargas"
          + (f", {a.simular} mediciones simuladas" if a.simular else ", datos de hoy") + ":")
    print(f"  datos.js:      {med('pesa') / 1024:.0f} KB ({med('viaja') / 1024:.0f} KB comprimido)")
    print(f"  primer dibujo:  {med('pinta') / 1000:.2f} s {rango('pinta')}")
    if any(v["listo"] is not None for v in vueltas):
        print(f"  página armada:  {med('listo') / 1000:.2f} s {rango('listo')}")
    print(f"  carga completa: {med('carga') / 1000:.2f} s {rango('carga')}")
    print(f"  bloqueo:        {med('bloqueo'):.0f} ms {rango('bloqueo', 1, 0)} en {med('largas'):.0f} tareas largas")


if __name__ == "__main__":
    main()
