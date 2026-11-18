"""Prueba del panel de videos (Fase 10, tarea 10.2): servidor, borrador y "Publicar".

Uso:  python pruebas/probar_panel.py

Nunca toca GitHub ni el repositorio de verdad: crea en una carpeta temporal un "GitHub falso"
(un repositorio vacío) y una copia de trabajo, y publica ahí.
1. Seguridad del servidor: sin la clave, con otro Host, con otro Origin o sin JSON, se niega.
2. Publicar: sube solo recolector/marcas_videos.json, aunque haya otros archivos cambiados;
   se junta con commits nuevos del "GitHub falso" (como las mediciones de cada hora); se niega
   fuera de main, con marcas inválidas o si hay otros commits sin subir; si falla el envío, el
   borrador queda guardado.
Termina con código 1 si algo falla.
"""
import http.client
import json
import shutil
import subprocess
import sys
import tempfile
import threading
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "panel"))
import publicar  # noqa: E402
import servidor  # noqa: E402

MARCADO = "_LVLtceZy3I"
HOY = "2026-11-18"
fallos = []


def comprobar(cond, texto):
    print(("  bien  " if cond else "  FALLA ") + texto)
    if not cond:
        fallos.append(texto)


def git(carpeta, *args):
    return subprocess.run(["git", *args], cwd=carpeta, capture_output=True, text=True, check=True).stdout.strip()


def repositorio_falso(tmp):
    """Un 'GitHub falso' (remoto) y una copia de trabajo en main, con el archivo de marcas."""
    remoto, copia = tmp / "remoto.git", tmp / "copia"
    subprocess.run(["git", "init", "--bare", "--quiet", "-b", "main", str(remoto)], check=True)
    subprocess.run(["git", "clone", "--quiet", str(remoto), str(copia)], check=True, capture_output=True)
    for k, v in (("user.name", "Prueba"), ("user.email", "prueba@example.invalid"), ("commit.gpgsign", "false")):
        git(copia, "config", k, v)
    (copia / "recolector").mkdir()
    (copia / "datos").mkdir()
    (copia / "recolector" / "marcas_videos.json").write_text('{"videos": {}, "ayuda": ["prueba"]}\n', encoding="utf-8")
    (copia / "datos" / "nota.txt").write_text("medición 1\n", encoding="utf-8")
    git(copia, "add", "-A")
    git(copia, "commit", "--quiet", "-m", "inicio")
    git(copia, "push", "--quiet", "-u", "origin", "main")
    return remoto, copia


def otra_copia(tmp, remoto, nombre):
    c = tmp / nombre
    subprocess.run(["git", "clone", "--quiet", str(remoto), str(c)], check=True, capture_output=True)
    for k, v in (("user.name", "Prueba"), ("user.email", "prueba@example.invalid"), ("commit.gpgsign", "false")):
        git(c, "config", k, v)
    return c


ESTADO = {"videos": {MARCADO: {"motivos": ["no_gta", "ia"], "fecha": HOY}}, "revisados": {"OTROvideo01": HOY}}
CONOCIDOS = {MARCADO, "OTROvideo01"}

print("1. Seguridad del servidor")
with tempfile.TemporaryDirectory() as t:
    tmp = Path(t)
    _, copia = repositorio_falso(tmp)
    srv, panel = servidor.arrancar(copia)
    hilo = threading.Thread(target=srv.serve_forever, daemon=True)
    hilo.start()
    host = f"127.0.0.1:{panel.puerto}"

    def pedir(metodo, ruta, cuerpo=None, **cab):
        c = http.client.HTTPConnection("127.0.0.1", panel.puerto, timeout=10)
        cabeceras = {"Host": host, "X-Clave": panel.clave, "Origin": f"http://{host}", "Content-Type": "application/json"}
        cabeceras.update({k.replace("_", "-"): v for k, v in cab.items() if v is not None})
        for k in [k.replace("_", "-") for k, v in cab.items() if v is None]:
            cabeceras.pop(k, None)
        c.request(metodo, ruta, body=json.dumps(cuerpo) if cuerpo is not None else None, headers=cabeceras)
        r = c.getresponse()
        return r.status, r.read()

    comprobar(srv.server_address[0] == "127.0.0.1", "escucha solo en 127.0.0.1")
    comprobar(pedir("POST", "/api/borrador", ESTADO)[0] == 200, "con la clave, guarda el borrador")
    comprobar(publicar.leer_borrador(copia) == ESTADO, "el borrador quedó en panel/borrador.json")
    comprobar(pedir("POST", "/api/borrador", ESTADO, X_Clave=None)[0] == 403, "sin la clave, se niega")
    comprobar(pedir("POST", "/api/borrador", ESTADO, X_Clave="otra")[0] == 403, "con una clave falsa, se niega")
    comprobar(pedir("GET", "/api/datos", X_Clave=None)[0] == 403, "leer los datos sin la clave, se niega")
    comprobar(pedir("POST", "/api/borrador", ESTADO, Host="malo.example:80")[0] == 403, "con otro Host (DNS rebinding), se niega")
    comprobar(pedir("POST", "/api/borrador", ESTADO, Origin="https://pagina-mala.example")[0] == 403, "desde otra página (Origin), se niega")
    comprobar(pedir("POST", "/api/borrador", ESTADO, Origin=None)[0] == 403, "un POST sin Origin, se niega")
    comprobar(pedir("POST", "/api/borrador", ESTADO, Content_Type="text/plain")[0] == 415, "sin JSON (formulario de otra página), se niega")
    malo = {"videos": {MARCADO: {"motivos": ["feo"], "fecha": HOY}}}
    comprobar(pedir("POST", "/api/borrador", malo)[0] == 400, "un borrador con marcas inválidas no se guarda")
    comprobar(publicar.leer_borrador(copia) == ESTADO, "el borrador bueno sigue ahí")
    comprobar(pedir("POST", "/api/descartar", {})[0] == 200 and publicar.leer_borrador(copia) is None, "descartar borra el borrador")
    srv.shutdown()
    srv.server_close()

print("2. Publicar (en un GitHub falso)")
with tempfile.TemporaryDirectory() as t:
    tmp = Path(t)
    remoto, copia = repositorio_falso(tmp)
    # Mientras Bruno marca, llega una medición nueva a GitHub (como cada hora).
    otra = otra_copia(tmp, remoto, "nube")
    (otra / "datos" / "nota.txt").write_text("medición 1\nmedición 2\n", encoding="utf-8")
    git(otra, "commit", "--quiet", "-am", "Medición automática")
    git(otra, "push", "--quiet")
    # Y en el PC hay otro archivo cambiado sin guardar, que no se debe subir.
    (copia / "datos" / "otro.txt").write_text("sin guardar\n", encoding="utf-8")
    publicar.guardar_borrador(copia, ESTADO)
    msg = publicar.publicar(copia, ESTADO, CONOCIDOS)
    comprobar(msg.startswith("Publicado"), f"publica ({msg})")
    ultimo = git(remoto, "log", "-1", "--name-only", "--format=%s", "main").splitlines()
    comprobar(ultimo[0].startswith("Marcas de videos") and [x for x in ultimo[1:] if x] == ["recolector/marcas_videos.json"],
              "en GitHub, el commit nuevo trae solo recolector/marcas_videos.json")
    comprobar("Medición automática" in git(remoto, "log", "--format=%s", "main"), "la medición que llegó mientras tanto sigue ahí")
    subido = json.loads(git(remoto, "show", "main:recolector/marcas_videos.json"))
    comprobar(subido["videos"] == ESTADO["videos"] and subido["revisados"] == ESTADO["revisados"] and subido["ayuda"] == ["prueba"],
              "lo subido es lo marcado, con su ayuda de antes")
    comprobar((copia / "datos" / "otro.txt").exists() and "otro.txt" in git(copia, "status", "--porcelain"),
              "el otro archivo sin guardar sigue en el PC, sin subir")
    comprobar(publicar.leer_borrador(copia) is None, "al publicar, el borrador se borra")
    comprobar(publicar.publicar(copia, ESTADO, CONOCIDOS).startswith("No había cambios"), "publicar dos veces lo mismo no hace otro commit")

    antes = git(remoto, "rev-parse", "main")
    malo = {"videos": {"AAAAAAAAAAA": {"motivos": ["dudoso"], "fecha": HOY}}}
    try:
        publicar.publicar(copia, malo, CONOCIDOS)
        comprobar(False, "con un video que no está en datos/, se niega")
    except publicar.NoSePudo as e:
        comprobar(git(remoto, "rev-parse", "main") == antes, f"con un video que no está en datos/, se niega sin subir nada ({e})")

    git(copia, "switch", "--quiet", "-c", "otra-rama")
    try:
        publicar.publicar(copia, {"videos": {}}, CONOCIDOS)
        comprobar(False, "fuera de main, se niega")
    except publicar.NoSePudo as e:
        comprobar(True, f"fuera de main, se niega ({e})")
    git(copia, "switch", "--quiet", "main")

    (copia / "README.md").write_text("trabajo de Claude\n", encoding="utf-8")
    git(copia, "add", "README.md")
    git(copia, "commit", "--quiet", "-m", "trabajo sin subir")
    try:
        publicar.publicar(copia, {"videos": {}}, CONOCIDOS)
        comprobar(False, "con otros commits sin subir, se niega")
    except publicar.NoSePudo as e:
        comprobar("README.md" not in git(remoto, "ls-tree", "--name-only", "main"), f"con otros commits sin subir, se niega y no los sube ({e})")
    git(copia, "reset", "--quiet", "--hard", "HEAD~1")

    # Si GitHub no responde, el borrador queda y se puede volver a intentar.
    git(copia, "remote", "set-url", "origin", str(tmp / "no-existe.git"))
    nuevo = {"videos": {}, "revisados": {MARCADO: HOY}}
    publicar.guardar_borrador(copia, nuevo)
    try:
        publicar.publicar(copia, nuevo, CONOCIDOS)
        comprobar(False, "sin conexión con GitHub, avisa")
    except publicar.NoSePudo as e:
        comprobar(publicar.leer_borrador(copia) == nuevo, f"sin conexión con GitHub, avisa y el borrador sigue guardado ({str(e)[:70]}…)")
    git(copia, "remote", "set-url", "origin", str(remoto))
    # GitHub rechaza el envío después del commit (hook falso que siempre dice que no).
    gancho = remoto / "hooks" / "pre-receive"
    gancho.write_text("#!/bin/sh\necho rechazado por la prueba >&2\nexit 1\n", encoding="utf-8", newline="\n")
    gancho.chmod(0o755)
    try:
        publicar.publicar(copia, nuevo, CONOCIDOS)
        comprobar(False, "si GitHub rechaza el envío, avisa")
    except publicar.NoSePudo as e:
        comprobar("no se pudo subir" in str(e) and publicar.leer_borrador(copia) == nuevo,
                  "si GitHub rechaza el envío, avisa y el borrador sigue guardado")
        comprobar(publicar.por_subir(copia) == 1, "el panel sabe que quedó 1 commit sin subir (botón 'Subir lo pendiente')")
    gancho.unlink()
    msg = publicar.publicar(copia, nuevo, CONOCIDOS)
    comprobar(json.loads(git(remoto, "show", "main:recolector/marcas_videos.json")).get("revisados") == nuevo["revisados"],
              f"al volver a intentar, sube el commit que había quedado pendiente ({msg})")
    # Revisión del 18 nov (agente revisor): casos que antes salían mal.
    archivo = copia / "recolector" / "marcas_videos.json"
    otro_estado = {"videos": {"OTROvideo01": {"motivos": ["dudoso"], "fecha": HOY}}}
    archivo.write_text(json.dumps(publicar.contenido_completo(copia, otro_estado), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    antes = git(remoto, "rev-parse", "main")
    try:   # el archivo de marcas cambiado a mano sin commit: no se pisa ni se da por "subido"
        msg = publicar.publicar(copia, otro_estado, CONOCIDOS)
        comprobar(False, f"con el archivo de marcas cambiado a mano sin guardar, se niega ({msg})")
    except publicar.NoSePudo as e:
        comprobar(git(remoto, "rev-parse", "main") == antes and "fuera del panel" in str(e),
                  "con el archivo de marcas cambiado a mano sin guardar, se niega (antes decía 'todo subido' sin subir)")
    git(copia, "checkout", "--", "recolector/marcas_videos.json")
    gancho_c = copia / ".git" / "hooks" / "pre-commit"
    gancho_c.write_text("#!/bin/sh\nexit 1\n", encoding="utf-8", newline="\n")
    gancho_c.chmod(0o755)
    publicar.guardar_borrador(copia, ESTADO)
    try:
        publicar.publicar(copia, ESTADO, CONOCIDOS)
        comprobar(False, "si el commit falla, avisa")
    except publicar.NoSePudo as e:
        limpio = "marcas_videos" not in git(copia, "status", "--porcelain")
        comprobar(limpio and publicar.leer_borrador(copia) == ESTADO,
                  f"si el commit falla, avisa, deja el archivo como estaba y el borrador guardado ({str(e)[:50]}…)")
    gancho_c.unlink()
    try:
        publicar.publicar(copia, ESTADO, CONOCIDOS)
        comprobar(True, "al reintentar sin el fallo, publica")
    except publicar.NoSePudo as e:
        comprobar(False, f"al reintentar sin el fallo, publica ({e})")
    (copia / "datos" / "nota.txt").write_text("cambio sin guardar\n", encoding="utf-8")
    try:
        publicar.publicar(copia, {"videos": {}}, CONOCIDOS)
        comprobar(False, "con otro archivo del repositorio cambiado sin guardar, se niega")
    except publicar.NoSePudo as e:
        comprobar("nota.txt" in str(e), "con otro archivo del repositorio cambiado sin guardar, se niega (no arriesga dejarlo en conflicto)")
    git(copia, "checkout", "--", "datos/nota.txt")
    git(copia, "commit", "--quiet", "--allow-empty", "-m", "commit vacío sin subir")
    antes = git(remoto, "rev-parse", "main")
    try:
        publicar.publicar(copia, {"videos": {}}, CONOCIDOS)
        comprobar(False, "con un commit vacío sin subir, se niega")
    except publicar.NoSePudo:
        comprobar(git(remoto, "rev-parse", "main") == antes, "con un commit vacío (o un merge) sin subir, se niega y no sube nada")
    git(copia, "reset", "--quiet", "--hard", "HEAD~1")
    shutil.rmtree(otra, ignore_errors=True)

print("3. El panel en el navegador (Playwright, con un GitHub falso)")
try:
    from playwright.sync_api import sync_playwright
    sys.path.insert(0, str(RAIZ / "pruebas"))
    import navegador
except ImportError:
    sync_playwright = None
    comprobar(False, "Playwright instalado (pip install -r pruebas/requisitos.txt)")
ultimo_dia = sorted((RAIZ / "datos").glob("*.jsonl"))[-1:] if (RAIZ / "datos").exists() else []
if sync_playwright and not ultimo_dia:
    comprobar(False, "hay mediciones en datos/ para probar el panel (en la nube, git pull)")
elif sync_playwright:
    with tempfile.TemporaryDirectory() as t:
        tmp = Path(t)
        remoto, copia = repositorio_falso(tmp)
        shutil.copy(ultimo_dia[0], copia / "datos" / ultimo_dia[0].name)   # el día más nuevo, de verdad
        (copia / "recolector" / "marcas_videos.json").write_text('{"videos": {}, "ayuda": ["prueba"]}\n', encoding="utf-8")
        git(copia, "add", "-A")
        git(copia, "commit", "--quiet", "-m", "datos de prueba")
        git(copia, "push", "--quiet")
        srv, panel = servidor.arrancar(copia)
        threading.Thread(target=srv.serve_forever, daemon=True).start()
        url = f"http://127.0.0.1:{panel.puerto}/"
        with sync_playwright() as p:
            b = navegador.abrir(p)
            for ancho in (1280, 384):
                if ancho == 384:
                    # Borrador viejo + alguien publicó otra marca mientras tanto: se juntan, no se pisa.
                    import lista
                    ids = [v["id"] for v in lista.leer_todo(copia)["videos"] if v["id"] not in base_pub["videos"]]
                    y_, z_ = ids[3], ids[4]
                    nuevo_pub = {"videos": {**base_pub["videos"], y_: {"motivos": ["dudoso"], "fecha": HOY}}}
                    (copia / "recolector" / "marcas_videos.json").write_text(
                        json.dumps(publicar.contenido_completo(copia, nuevo_pub), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
                    git(copia, "commit", "--quiet", "-am", "otra marca publicada mientras tanto")
                    publicar.guardar_borrador(copia, {"videos": {**base_pub["videos"], z_: {"motivos": ["ia"], "fecha": HOY}},
                                                      "revisados": {}, "base": base_pub})
                pg = b.new_page(viewport={"width": ancho, "height": 900})
                errores = []
                pg.on("console", lambda m: errores.append(m.text) if m.type == "error" and "ytimg" not in m.text else None)
                pg.on("pageerror", lambda e: errores.append(str(e)))
                pg.goto(url + "?clave=" + panel.clave)
                pg.wait_for_selector(".tabla tr", timeout=30000)
                filas = pg.locator(".tabla tr").count()
                comprobar(filas >= 20, f"{ancho}px: abre en 'sin revisar' con {filas} videos")
                comprobar("clave" not in pg.url, f"{ancho}px: la clave se quita de la barra de direcciones")
                desborde = pg.evaluate("document.documentElement.scrollWidth - innerWidth")
                comprobar(desborde <= 0, f"{ancho}px: sin desborde horizontal ({desborde}px)")
                pg.screenshot(path=str(RAIZ / "pruebas" / "capturas" / f"panel_{ancho}.png"))
                if ancho == 1280:
                    primero = pg.locator(".tabla tr").first
                    titulo = primero.locator(".t-tit").inner_text()
                    primero.locator('button[data-a="no_gta"]').click()
                    primero.locator('button[data-a="ia"]').click()
                    pg.wait_for_timeout(800)
                    b_ = publicar.leer_borrador(copia) or {"videos": {}}
                    marcado = next(iter(b_["videos"]), None)
                    comprobar(marcado and b_["videos"][marcado]["motivos"] == ["no_gta", "ia"],
                              "marcar un video con dos motivos lo guarda al momento en el borrador del PC")
                    comprobar(pg.locator(".tabla tr").first.locator(".t-tit").inner_text() == titulo,
                              "el video marcado no desaparece de la lista al marcarlo (se le puede poner otro motivo)")
                    comprobar(pg.locator("#publicar").inner_text() == "Publicar (1)", "el botón dice cuántos cambios hay: Publicar (1)")
                    pg.locator('.tabla tr >> nth=1 >> button[data-a="bien"]').click()
                    pg.locator('.tabla tr >> nth=1 >> button[data-a="deshacer"]').click()
                    pg.wait_for_timeout(800)
                    comprobar(len((publicar.leer_borrador(copia) or {}).get("revisados", {})) == 0, "'Deshacer' quita el cambio de ese video")
                    pg.locator("#publicar").click()
                    pg.wait_for_selector(".aviso.ok, .aviso.mal", timeout=60000)
                    texto = pg.locator(".aviso").first.inner_text()
                    subido = json.loads(git(remoto, "show", "main:recolector/marcas_videos.json"))
                    comprobar(texto.startswith("Publicado") and marcado in subido["videos"],
                              f"'Publicar' lo sube al GitHub falso ({texto[:60]})")
                    comprobar(pg.locator("#publicar").is_disabled(), "después de publicar no quedan cambios pendientes")
                    pg.wait_for_timeout(800)
                    comprobar(publicar.leer_borrador(copia) is None, "después de publicar no revive ningún borrador")
                    base_pub = {"videos": subido["videos"], "revisados": subido.get("revisados", {})}
                if ancho == 384:
                    comprobar(pg.locator("#publicar").inner_text() == "Publicar (1)",
                              f"borrador viejo + otra marca publicada: solo cuenta el cambio propio ({pg.locator('#publicar').inner_text()})")
                    comprobar("se juntaron" in pg.inner_text("#avisos"), "avisa que se juntaron los cambios")
                    pg.locator('.pestanas button[data-v="marcado"]').click()
                    marcados_vistos = pg.locator(".tabla tr").count()
                    comprobar(marcados_vistos == len(base_pub["videos"]) + 2,
                              f"siguen marcados lo publicado, la marca nueva de otro y la del borrador ({marcados_vistos})")
                comprobar(not errores, f"{ancho}px: sin errores en la consola {errores[:3]}")
                pg.close()
            pg = b.new_page()
            pg.goto(url)
            pg.wait_for_timeout(500)
            comprobar("panel_videos.bat" in pg.inner_text("#lista"), "abierto sin la clave, solo dice que se abra con panel_videos.bat")
            pg.close()
            b.close()
        srv.shutdown()
        srv.server_close()

print()
if fallos:
    print(f"FALLARON {len(fallos)}:")
    for f in fallos:
        print("  - " + f)
    sys.exit(1)
print("Todo bien.")
