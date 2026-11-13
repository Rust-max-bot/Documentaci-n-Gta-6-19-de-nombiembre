"""Prueba el código real de despertador/worker.js en el motor de JavaScript del navegador,
con horas simuladas y un GitHub falso. No llama a GitHub ni a Cloudflare.

Comprueba que el turno del minuto 7 siempre lanza el recolector, que el del minuto 37 solo
lo lanza la semana del lanzamiento (17 al 21 nov, UTC), que la orden a GitHub va bien
formada y que sin clave o con la clave rechazada da error.

Uso:  python pruebas/probar_despertador.py      (0 = todo bien; 1 = algún fallo)
"""
import json
import sys

from playwright.sync_api import sync_playwright

from navegador import RAIZ, abrir, preparar_salida

URL_ESPERADA = ("https://api.github.com/repos/Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre"
                "/actions/workflows/recolectar.yml/dispatches")
# (hora programada en UTC, ¿debe lanzar el recolector?)
CASOS = [
    ("2026-11-13T14:07:00Z", True), ("2026-11-13T14:37:00Z", False),
    ("2026-11-16T23:07:00Z", True), ("2026-11-16T23:37:00Z", False),
    ("2026-11-17T00:07:00Z", True), ("2026-11-17T00:37:00Z", True),
    ("2026-11-19T02:37:00Z", True), ("2026-11-19T03:07:00Z", True), ("2026-11-19T03:37:00Z", True),
    ("2026-11-21T23:37:00Z", True), ("2026-11-22T00:07:00Z", True), ("2026-11-22T00:37:00Z", False),
    ("2026-12-19T23:07:00Z", True),   # el despertador no sabe del interruptor: eso lo decide GitHub
]
JS = """async ([casos]) => {
  const salida = [];
  for (const [hora] of casos) {
    const llamadas = [];
    globalThis.fetch = async (url, op) => { llamadas.push({url, op}); return new Response(null, {status: 204}); };
    await worker.scheduled({scheduledTime: Date.parse(hora)}, {GITHUB_TOKEN: "clave-falsa"}, {});
    salida.push(llamadas.map(l => ({url: l.url, metodo: l.op.method, auth: l.op.headers.Authorization,
                                    ua: l.op.headers["User-Agent"], cuerpo: l.op.body})));
  }
  const errores = [];
  try { await worker.scheduled({scheduledTime: Date.parse("2026-11-13T14:07:00Z")}, {}, {}); errores.push("sin clave: NO dio error"); }
  catch (e) { errores.push("sin clave: " + e.message); }
  globalThis.fetch = async () => new Response('{"message":"Bad credentials"}', {status: 401});
  try { await worker.scheduled({scheduledTime: Date.parse("2026-11-13T14:07:00Z")}, {GITHUB_TOKEN: "x"}, {}); errores.push("401: NO dio error"); }
  catch (e) { errores.push("401: " + e.message); }
  return {salida, errores};
}"""


def main():
    preparar_salida()
    codigo = (RAIZ / "despertador" / "worker.js").read_text(encoding="utf-8")
    if codigo.count("export default {") != 1:
        print("FALLO: worker.js ya no tiene un único 'export default {'; hay que adaptar esta prueba")
        return 1
    codigo = codigo.replace("export default {", "globalThis.worker = {")
    with sync_playwright() as p:
        nav = abrir(p)
        pg = nav.new_page()
        pg.goto("about:blank")
        pg.add_script_tag(content=codigo)
        r = pg.evaluate(JS, [CASOS])
        nav.close()
    fallos = 0
    for (hora, debe), llamadas in zip(CASOS, r["salida"]):
        lanzo = len(llamadas) == 1
        ok = lanzo == debe and len(llamadas) <= 1
        if lanzo:
            l = llamadas[0]
            ok = ok and l["url"] == URL_ESPERADA and l["metodo"] == "POST" and l["auth"] == "Bearer clave-falsa" \
                and bool(l["ua"]) and json.loads(l["cuerpo"]) == {"ref": "main"}
        fallos += not ok
        print(f"{'OK   ' if ok else 'FALLO'} {hora}  {'lanza' if lanzo else 'no lanza'} (debía: {'lanza' if debe else 'no lanza'})")
    for e in r["errores"]:
        print("error esperado ->", e)
        fallos += "NO dio error" in e
    print("RESULTADO:", "todo bien" if fallos == 0 else f"{fallos} fallos")
    return 1 if fallos else 0


if __name__ == "__main__":
    sys.exit(main())
