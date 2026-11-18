"""Servidor local del panel de videos (Fase 10, tarea 10.2). Lo abre panel_videos.bat.

Solo para el PC de Bruno, nunca en internet. Una página abierta como archivo no puede guardar ni
correr git; por eso este pequeño servidor, solo con la librería estándar de Python. Protecciones
(requisitos de la revisión del 2026-11-18, para que ninguna otra página web abierta en el
navegador pueda ordenarle "publicar"):
- escucha solo en 127.0.0.1 (nadie de la red puede entrar);
- cada vez que arranca inventa una clave al azar, que va en la dirección que abre; toda llamada
  a /api/ debe traerla en la cabecera X-Clave (otra página no la conoce);
- revisa Host (contra el "DNS rebinding") y, en los POST, Origin;
- los POST solo aceptan JSON (application/json), hasta 1 MB;
- se cierra al cerrar su ventana negra.

Uso:  python panel/servidor.py [--sin-navegador] [--puerto N] [--raiz CARPETA]
"""
import argparse
import hmac
import json
import secrets
import sys
import threading
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import lista  # noqa: E402
import publicar  # noqa: E402

ARCHIVOS = {"/": ("index.html", "text/html; charset=utf-8"),
            "/panel.css": ("panel.css", "text/css; charset=utf-8"),
            "/panel.js": ("panel.js", "text/javascript; charset=utf-8")}
MAXIMO = 1024 * 1024


class Panel:
    """El estado del servidor: dónde está el repositorio, la clave y un candado para git."""

    def __init__(self, raiz, puerto):
        self.raiz = Path(raiz)
        self.puerto = puerto
        self.clave = secrets.token_urlsafe(24)
        self.candado = threading.Lock()   # dos "Publicar" a la vez no
        self.traido = None

    def hosts(self):
        return {f"127.0.0.1:{self.puerto}", f"localhost:{self.puerto}"}

    def origenes(self):
        return {f"http://{h}" for h in self.hosts()}


def manejador(panel):
    class Manejador(BaseHTTPRequestHandler):
        server_version = "PanelVideos"
        sys_version = ""

        def log_message(self, formato, *args):   # la ventana muestra solo lo importante
            pass

        def responder(self, codigo, cuerpo, tipo="application/json; charset=utf-8"):
            datos = cuerpo if isinstance(cuerpo, bytes) else json.dumps(cuerpo, ensure_ascii=False).encode("utf-8")
            self.send_response(codigo)
            self.send_header("Content-Type", tipo)
            self.send_header("Content-Length", str(len(datos)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("X-Frame-Options", "DENY")
            self.send_header("Referrer-Policy", "no-referrer")
            self.send_header("Content-Security-Policy",
                             "default-src 'self'; img-src 'self' https://i.ytimg.com; frame-ancestors 'none'")
            self.end_headers()
            self.wfile.write(datos)

        def error(self, codigo, texto):
            self.responder(codigo, {"error": texto})

        def permitido(self, post):
            if self.headers.get("Host") not in panel.hosts():
                self.error(403, "dirección no permitida")
                return False
            ruta = self.path.split("?")[0]
            if ruta.startswith("/api/"):
                if not hmac.compare_digest(self.headers.get("X-Clave", "").encode("utf-8", "replace"), panel.clave.encode()):
                    self.error(403, "falta la clave del panel: ciérralo y ábrelo otra vez con panel_videos.bat")
                    return False
            if post:
                if self.headers.get("Origin") not in panel.origenes():
                    self.error(403, "origen no permitido")
                    return False
                if (self.headers.get("Content-Type") or "").split(";")[0].strip() != "application/json":
                    self.error(415, "solo JSON")
                    return False
            return True

        def leer_crudo(self):
            try:
                largo = int(self.headers.get("Content-Length") or 0)
            except ValueError:
                largo = -1
            if not 0 <= largo <= MAXIMO:
                raise ValueError("tamaño no permitido")
            return self.rfile.read(largo)

        def do_GET(self):
            if not self.permitido(post=False):
                return
            ruta = self.path.split("?")[0]
            if ruta in ARCHIVOS:
                nombre, tipo = ARCHIVOS[ruta]
                p = AQUI / nombre
                if not p.exists():
                    return self.error(404, f"falta {nombre}")
                return self.responder(200, p.read_bytes(), tipo)
            if ruta == "/favicon.ico":   # el navegador lo pide solo; sin icono, sin error en la consola
                self.send_response(204)
                self.end_headers()
                return
            if ruta == "/api/datos":
                try:
                    with panel.candado:
                        borrador = publicar.leer_borrador(panel.raiz)
                        d = lista.leer_todo(panel.raiz, borrador)
                except (SystemExit, Exception) as e:   # generar_web aborta con SystemExit
                    return self.error(500, f"no se pudieron leer los datos: {e}")
                d["borrador"] = borrador
                d["rama"] = publicar.rama(panel.raiz)
                d["por_subir"] = publicar.por_subir(panel.raiz)   # un Publicar anterior que no alcanzó a subir
                d["traido"] = panel.traido
                return self.responder(200, d)
            self.error(404, "no existe")

        def do_POST(self):
            # El cuerpo se lee siempre antes de responder (hasta 1 MB): en Windows, cerrar sin
            # leerlo corta la conexión y el navegador no vería el mensaje de error.
            try:
                crudo = self.leer_crudo()
            except ValueError as e:
                self.close_connection = True
                return self.error(413, str(e))
            if not self.permitido(post=True):
                return
            ruta = self.path.split("?")[0]
            try:
                datos = json.loads(crudo or b"{}")
            except ValueError as e:
                return self.error(400, f"no es un JSON válido: {e}")
            if not isinstance(datos, dict):
                return self.error(400, "se esperaba un objeto JSON")
            with panel.candado:
                try:
                    if ruta == "/api/borrador":
                        publicar.guardar_borrador(panel.raiz, datos)
                        return self.responder(200, {"ok": True})
                    if ruta == "/api/descartar":
                        publicar.descartar_borrador(panel.raiz)
                        return self.responder(200, {"ok": True})
                    if ruta == "/api/publicar":
                        conocidos = lista.conocidos(panel.raiz)
                        return self.responder(200, {"ok": True, "mensaje": publicar.publicar(panel.raiz, datos, conocidos)})
                except publicar.marcas.MarcasMal as e:
                    return self.error(400, str(e))
                except publicar.NoSePudo as e:
                    return self.error(409, str(e))
                except (SystemExit, Exception) as e:   # generar_web aborta con SystemExit; que el panel lo diga
                    return self.error(500, f"falló algo inesperado, no se publicó nada: {e!r}. Muéstraselo a Claude.")
            self.error(404, "no existe")

    return Manejador


def arrancar(raiz, puerto=0):
    """Crea el servidor (sin ponerlo a andar). puerto=0: el sistema elige uno libre."""
    servidor = ThreadingHTTPServer(("127.0.0.1", puerto), None)
    panel = Panel(raiz, servidor.server_address[1])
    servidor.RequestHandlerClass = manejador(panel)
    return servidor, panel


def main():
    a = argparse.ArgumentParser(description="Panel de videos (solo en este PC)")
    a.add_argument("--sin-navegador", action="store_true")
    a.add_argument("--puerto", type=int, default=0)
    a.add_argument("--raiz", default=str(AQUI.parent))
    o = a.parse_args()
    servidor, panel = arrancar(o.raiz, o.puerto)
    print("Trayendo lo nuevo de GitHub...")
    panel.traido = publicar.traer(panel.raiz)
    print("  listo" if panel.traido == "ok" else f"  no se pudo ({panel.traido}); se usa lo que hay en el PC")
    url = f"http://127.0.0.1:{panel.puerto}/?clave={panel.clave}"
    print(f"Panel abierto en el navegador. Para cerrarlo, cierra esta ventana.\n{url}")
    if not o.sin_navegador:
        webbrowser.open(url)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()
