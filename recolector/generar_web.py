"""Convierte las mediciones de datos/ en web/datos.js, el archivo que lee la página.

Uso:  python recolector/generar_web.py
      (o doble clic en ver_pagina.bat, que además trae los datos nuevos y abre la página)

Solo LEE datos/ y solo escribe en web/: datos.js, version.json y la carpeta web/dias/.
Nada de eso se sube a git (.gitignore): se rehace entero cada vez, y subirlo cada 30 minutos
inflaría el repositorio. Si algo no cuadra, se detiene y deja web/datos.js como estaba.

Datos por días (pedido de Bruno, 2026-11-14: "no puedes siempre cargar todos los datos de todos
los días"). Lo que más pesa y menos se comprime son los titulares (sus enlaces de Google Noticias
son muy largos) y las publicaciones de Reddit. Por eso:
- web/datos.js lleva todo lo que la página necesita al abrir: las mediciones (para los gráficos,
  los récords y los resúmenes), los videos y, de los titulares y de Reddit, solo sus horas (para
  contarlos por día y por hora) y las 8 publicaciones de Reddit más nuevas.
- web/dias/AAAA-MM-DD.js lleva los titulares y las publicaciones completas de un día (UTC, según
  la hora de cada titular). La página carga un día solo cuando hace falta mostrarlo.
- web/version.json solo dice cuándo se generaron los datos: la página lo mira cada 2 minutos para
  saber si hay datos nuevos, en vez de bajar datos.js entero.
"""
import hashlib
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos"
SALIDA = RAIZ / "web" / "datos.js"
DIAS = RAIZ / "web" / "dias"
VERSION = RAIZ / "web" / "version.json"
ALBUM = RAIZ / "web" / "album"
# Álbum de momentos (tarea 7.7): Bruno sube capturas a web/album/ con nombres como
# "2026-11-19 02-10 Se caen los servidores.jpg" (hora de Santiago). El nombre es todo lo que
# hace falta: la página toma de ahí la hora y el texto.
NOMBRE_FOTO = re.compile(r"^(\d{4}-\d{2}-\d{2}) (\d{2})[-.:h](\d{2})\s*(.*)\.(jpe?g|png|webp|gif)$", re.IGNORECASE)
FOTO_PESADA = 2 * 1024 * 1024   # más de 2 MB: se avisa (con muchas visitas, gasta tráfico)
REDDIT_ULTIMAS = 8   # publicaciones de Reddit completas en datos.js (la página muestra las 8 últimas)
NOMBRE_ARCHIVO = re.compile(r"^\d{4}-\d{2}-\d{2}\.jsonl$")
VIDEOS = 20         # videos de YouTube que se muestran (los más vistos en la última medición)
CANALES = 3         # canales de Twitch por medición


def abortar(mensaje):
    print(f"ABORTADO, web/datos.js no se tocó: {mensaje}")
    sys.exit(2)


def leer_mediciones(carpeta):
    medidas = []
    for p in sorted(carpeta.glob("*.jsonl")):
        if not NOMBRE_ARCHIVO.match(p.name):
            abortar(f"archivo con nombre inesperado en datos/: {p.name}")
        for n, linea in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            if not linea.strip():
                continue
            try:
                m = json.loads(linea)
            except ValueError:
                abortar(f"{p.name}, línea {n}: no es una medición válida")
            if m.get("v") != 1 or not isinstance(m.get("t"), str):
                abortar(f"{p.name}, línea {n}: formato desconocido")
            if m.get("ejemplo"):
                abortar(f"{p.name}, línea {n}: una medición real no puede llevar la marca de ejemplo")
            medidas.append(m)
    medidas.sort(key=lambda m: m["t"])
    tiempos = [m["t"] for m in medidas]
    if len(set(tiempos)) != len(tiempos):
        abortar("hay dos mediciones con la misma hora")
    return medidas


def ultima_hora_completa(trends):
    """Interés de la última hora completa de esa medición (la hora en curso viene a medias)."""
    puntos = [p for p in trends.get("puntos", []) if not p.get("parcial")]
    return puntos[-1]["interes"] if puntos else None


def estado_servidor(r):
    if not r or "error" in r:
        return None            # sin dato: la página lo muestra como hueco
    return "ok" if r["ok"] else "problemas"


def convertir(medidas):
    mediciones, series, ultimo_video, vistas, noticias = [], {}, {}, set(), []
    reddit, reddit_vistas, reddit_medidas = [], set(), []
    series_es, ultimo_es = {}, {}   # tarea 6.4: videos de la búsqueda en español
    trailers = {}   # tarea 6.2: serie de visitas de cada video oficial, desde el 13 nov
    for m in medidas:
        tw, tr = m.get("twitch", {}), m.get("trends", {})
        fila = {"t": m["t"]}
        if "error" in tw:
            fila["twitch"] = {"error": tw["error"]}
        else:
            fila["twitch"] = {"espectadores": tw["espectadores"], "transmisiones": tw["transmisiones"],
                              "canales": [{"nombre": c["nombre"], "login": c["login"], "espectadores": c["espectadores"],
                                           **({"foto": c["foto"]} if c.get("foto") else {})}
                                          for c in tw["canales"][:CANALES]]}
        interes = None if "error" in tr else ultima_hora_completa(tr)
        fila["trends"] = {"interes": interes} if interes is not None else {"error": tr.get("error", "sin hora completa")}
        fila["servidores"] = {
            "rockstar": None,   # no se puede medir con programas; sus caídas se anotan en web/eventos.js
            "playstation": estado_servidor(m.get("playstation")),
            "xbox": estado_servidor(m.get("xbox")),
        }
        # Tarea 6.3: puesto de GTA en Twitch y videos de GTA en tendencias de YouTube. Solo
        # existen desde el 13 nov: las mediciones de antes no traen estas claves.
        rk = m.get("twitch_ranking")
        if rk is not None:
            fila["ranking"] = {"error": rk["error"]} if "error" in rk else {
                "gta6": rk["puesto_gta6"], "gta5": rk["puesto_gta5"], "leidas": rk["leidas"]}
        yt = m.get("youtube_tendencias")
        if yt is not None:
            fila["tendencias"] = {"error": yt["error"]} if "error" in yt else {
                r: len(d["gta"]) for r, d in yt["regiones"].items()}
        mediciones.append(fila)

        for v in m.get("youtube", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                series.setdefault(v["id"], []).append({"t": m["t"], "visitas": v["visitas"]})
                ultimo_video[v["id"]] = v
        for v in m.get("youtube_es", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                series_es.setdefault(v["id"], []).append({"t": m["t"], "visitas": v["visitas"]})
                ultimo_es[v["id"]] = v
        for v in m.get("youtube_trailers", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                tr_v = trailers.setdefault(v["id"], {"id": v["id"], "titulo": v["titulo"], "publicado": v.get("publicado"), "serie": []})
                tr_v["titulo"] = v["titulo"]
                tr_v["serie"].append({"t": m["t"], "visitas": v["visitas"]})
        for n in m.get("noticias", {}).get("nuevas", []):
            if n["url"] not in vistas:
                vistas.add(n["url"])
                noticias.append({"t": n.get("t") or m["t"], "titulo": n["titulo"], "medio": n.get("medio") or "", "url": n["url"]})
        rd = m.get("reddit")
        if rd is not None:
            # Cada medición dice si Reddit respondió y cuántas publicaciones nuevas trajo: si
            # trae todas las del RSS (100), puede que se hayan escapado otras entre medición
            # y medición.
            reddit_medidas.append({"t": m["t"], "ok": "error" not in rd,
                                   "nuevas": len(rd.get("nuevas", [])), "en_fuente": rd.get("en_fuente")})
            for p in rd.get("nuevas", []):
                if p["id"] not in reddit_vistas:
                    reddit_vistas.add(p["id"])
                    reddit.append({"t": p.get("t") or m["t"], "titulo": p["titulo"], "autor": p.get("autor") or "",
                                   "url": p["url"]})

    # Los videos que aparecen en la última medición en que YouTube respondió, de más a menos visto.
    ultima_yt = next((m["youtube"]["videos"] for m in reversed(medidas) if m.get("youtube", {}).get("videos")), [])
    youtube = [{
        "id": v["id"],
        "titulo": ultimo_video[v["id"]]["titulo"],
        "canal": ultimo_video[v["id"]]["canal"],
        "miniatura": ultimo_video[v["id"]].get("miniatura", ""),
        "serie": series[v["id"]],
    } for v in ultima_yt if v["id"] in series][:VIDEOS]

    # Lo último de la 6.3, para las tarjetas de comparación (la medición más nueva sin hueco).
    ult_rk = next((m for m in reversed(medidas) if "error" not in m.get("twitch_ranking", {"error": 1})), None)
    ult_yt = next((m for m in reversed(medidas) if "error" not in m.get("youtube_tendencias", {"error": 1})), None)
    comparacion = None
    if ult_rk or ult_yt:
        comparacion = {}
        if ult_rk:
            rk = ult_rk["twitch_ranking"]
            comparacion["twitch"] = {"t": ult_rk["t"], "top": rk["top"], "comparadas": rk["comparadas"],
                                     "gta6": rk["puesto_gta6"], "gta5": rk["puesto_gta5"], "leidas": rk["leidas"]}
        if ult_yt:
            yt = ult_yt["youtube_tendencias"]
            comparacion["youtube"] = {"t": ult_yt["t"], "regiones": yt["regiones"], "rockstar": yt["rockstar"]}

    ultima_es = next((m["youtube_es"]["videos"] for m in reversed(medidas) if m.get("youtube_es", {}).get("videos")), [])
    youtube_es = [{
        "id": v["id"], "titulo": ultimo_es[v["id"]]["titulo"], "canal": ultimo_es[v["id"]]["canal"],
        "miniatura": ultimo_es[v["id"]].get("miniatura", ""), "idioma": ultimo_es[v["id"]].get("idioma"),
        "serie": series_es[v["id"]],
    } for v in ultima_es if v["id"] in series_es][:VIDEOS]

    noticias.sort(key=lambda n: n["t"])
    reddit.sort(key=lambda p: p["t"])
    return {"mediciones": mediciones, "youtube": youtube, "youtube_es": youtube_es, "noticias": noticias,
            "reddit": {"comunidad": "r/GTA6", "publicaciones": reddit, "mediciones": reddit_medidas},
            "comparacion": comparacion,
            "trailers": sorted(trailers.values(), key=lambda v: v.get("publicado") or "")}   # todos: la página los muestra por páginas (Bruno, 2026-11-13)


def segundos(iso):
    """'2026-11-14T03:07:00Z' -> segundos desde 1970 (UTC). Más corto que el texto."""
    return int(datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp())


def serie_corta(serie):
    """[{"t": ..., "visitas": n}, ...] -> [[segundos, n], ...]: la mitad de largo, sin perder nada."""
    return [[segundos(p["t"]), p["visitas"]] for p in serie]


def separar_por_dias(d):
    """Saca de d los titulares y las publicaciones de Reddit completos y los reparte por día.

    En d quedan solo sus horas, en el mismo orden (de la más vieja a la más nueva): la posición
    de cada titular en esa lista es su número "i", que también va en el archivo de su día. Así la
    página sabe qué días cargar para mostrar una página de titulares."""
    dias = {}
    for i, n in enumerate(d["noticias"]):
        s = segundos(n["t"])
        dia = datetime.fromtimestamp(s, timezone.utc).strftime("%Y-%m-%d")
        dias.setdefault(dia, {"noticias": [], "reddit": []})["noticias"].append(
            {"i": i, "t": s, "titulo": n["titulo"], "medio": n["medio"], "url": n["url"]})
    pubs = d["reddit"]["publicaciones"]
    for p in pubs:
        s = segundos(p["t"])
        dia = datetime.fromtimestamp(s, timezone.utc).strftime("%Y-%m-%d")
        dias.setdefault(dia, {"noticias": [], "reddit": []})["reddit"].append(
            {"t": s, "titulo": p["titulo"], "autor": p["autor"], "url": p["url"]})
    d["formato"] = 2
    d["noticias_t"] = [segundos(n["t"]) for n in d.pop("noticias")]
    d["reddit"]["publicaciones_t"] = [segundos(p["t"]) for p in pubs]
    d["reddit"]["ultimas"] = pubs[-REDDIT_ULTIMAS:]
    del d["reddit"]["publicaciones"]
    for v in d["youtube"] + d["youtube_es"] + d["trailers"]:
        v["serie"] = serie_corta(v["serie"])
    archivos = {}
    for dia, contenido in sorted(dias.items()):
        texto = ("/* DATOS REALES de un día (UTC), generados por recolector/generar_web.py. No editar a mano. */\n"
                 "window.DATOS_DIA && window.DATOS_DIA(" + json.dumps(dia) + "," +
                 json.dumps(contenido, ensure_ascii=False, separators=(",", ":")) + ");\n")
        archivos[dia] = texto
    # La huella de cada archivo va en datos.js: el navegador guarda un día que no cambió y
    # vuelve a pedirlo solo si cambió (lo nuevo llega siempre, y lo viejo no se baja otra vez).
    d["dias"] = {dia: hashlib.sha256(t.encode("utf-8")).hexdigest()[:10] for dia, t in archivos.items()}
    total = sum(len(c["noticias"]) for c in dias.values())
    if total != len(d["noticias_t"]) or sum(len(c["reddit"]) for c in dias.values()) != len(pubs):
        abortar("se perdieron titulares o publicaciones al repartirlos por días")
    return archivos


def leer_album():
    """Lista las fotos de web/album/ con su hora (texto de Santiago) y su texto. Las que no
    siguen el formato del nombre se avisan y no se muestran (no se toca ningún archivo)."""
    fotos = []
    if not ALBUM.is_dir():
        return fotos
    for p in sorted(ALBUM.iterdir()):
        if p.name.startswith(".") or p.name.lower() in ("leeme.md", "readme.md"):
            continue
        m = NOMBRE_FOTO.match(p.name)
        if not m:
            print(f"AVISO: web/album/{p.name} no sigue el formato 'AAAA-MM-DD HH-MM texto.jpg': no se muestra.")
            continue
        if p.stat().st_size > FOTO_PESADA:
            print(f"AVISO: web/album/{p.name} pesa {p.stat().st_size // 1024} KB; conviene que sea de menos de 2 MB.")
        fotos.append({"archivo": "album/" + p.name, "hora": f"{m.group(1)} {m.group(2)}:{m.group(3)}",
                      "texto": m.group(4).strip()})
    fotos.sort(key=lambda f: f["hora"])
    return fotos


def escribir(ruta, texto):
    temporal = ruta.with_name(ruta.name + ".tmp")
    temporal.write_text(texto, encoding="utf-8", newline="\n")
    os.replace(temporal, ruta)   # se cambia de golpe: nunca queda un archivo a medias


def comprobar(d, medidas):
    if len(d["mediciones"]) != len(medidas):
        abortar("se perdieron mediciones al convertir")
    for f in d["mediciones"]:
        tw = f["twitch"]
        if "error" not in tw and not (isinstance(tw["espectadores"], int) and tw["espectadores"] >= 0):
            abortar(f"espectadores inválidos en {f['t']}")
        i = f["trends"].get("interes")
        if i is not None and not (0 <= i <= 100):
            abortar(f"interés de Trends fuera de 0-100 en {f['t']}")
    for v in d["youtube"] + d["youtube_es"] + d["trailers"]:
        if [p["t"] for p in v["serie"]] != sorted(p["t"] for p in v["serie"]):
            abortar(f"la serie del video {v['id']} está desordenada")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    carpeta = Path(sys.argv[sys.argv.index("--carpeta") + 1]) if "--carpeta" in sys.argv else DATOS
    medidas = leer_mediciones(carpeta)
    if not medidas:
        abortar(f"no hay mediciones en {carpeta}")
    d = convertir(medidas)
    comprobar(d, medidas)
    archivos = separar_por_dias(d)
    d["album"] = leer_album()
    d["generado"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    d["eventos"] = []   # los eventos a mano están en web/eventos.js
    texto = ("/* DATOS REALES generados por recolector/generar_web.py a partir de datos/.\n"
             "   No editar a mano: se rehace entero cada vez. No se sube a git. */\n"
             "window.DATOS = " + json.dumps(d, ensure_ascii=False, separators=(",", ":")) + ";\n")
    # Primero los días y al final datos.js, que es el que dice qué días hay.
    DIAS.mkdir(exist_ok=True)
    for dia, t in archivos.items():
        escribir(DIAS / f"{dia}.js", t)
    for viejo in DIAS.glob("*.js"):
        if viejo.stem not in archivos:   # un día que ya no existe (por ejemplo, otra carpeta de datos)
            viejo.unlink()
    escribir(SALIDA, texto)
    escribir(VERSION, json.dumps({"generado": d["generado"]}) + "\n")
    peso_dias = sum(len(t.encode("utf-8")) for t in archivos.values())
    print(f"web/datos.js listo: {len(d['mediciones'])} mediciones (de {medidas[0]['t']} a {medidas[-1]['t']} UTC), "
          f"{len(d['youtube'])} videos, {len(d['noticias_t'])} titulares, "
          f"{len(d['reddit']['publicaciones_t'])} publicaciones de Reddit, {len(texto.encode('utf-8')) // 1024} KB; "
          f"{len(archivos)} días en web/dias/ ({peso_dias // 1024} KB, se cargan solo si hacen falta).")


if __name__ == "__main__":
    main()
