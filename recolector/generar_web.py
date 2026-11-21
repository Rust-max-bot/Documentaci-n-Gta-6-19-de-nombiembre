"""Convierte las mediciones de datos/ en web/datos.js, el archivo que lee la página.

Uso:  python recolector/generar_web.py
      (o doble clic en ver_pagina.bat, que además trae los datos nuevos y abre la página)

Solo LEE datos/ y solo escribe en web/: datos.js, version.json y la carpeta web/dias/.
Nada de eso se sube a git (.gitignore): se rehace entero cada vez, y subirlo cada 30 minutos
inflaría el repositorio. Si algo no cuadra, se detiene y deja web/datos.js como estaba.

Datos por días (pedido de Bruno, 2026-11-14: "no puedes siempre cargar todos los datos de todos
los días"). Lo que más pesa y menos se comprime son los titulares (sus enlaces de Google Noticias
son muy largos). Por eso:
- web/datos.js lleva todo lo que la página necesita al abrir: las mediciones (para los gráficos,
  los récords y los resúmenes), los videos y, de los titulares, solo sus horas (para contarlos
  por día) y los más nuevos.
- web/dias/AAAA-MM-DD.js lleva los titulares completos de un día (UTC, según la hora de cada
  titular).

Reddit (tarea 6.9, decisión de Bruno, 2026-11-17): ya no se muestra. Las mediciones viejas lo
siguen guardando en datos/ (no se borra nada), pero aquí se ignora. La página carga un día solo cuando hace falta mostrarlo.
- web/version.json solo dice cuándo se generaron los datos: la página lo mira cada 2 minutos para
  saber si hay datos nuevos, en vez de bajar datos.js entero.
"""
import hashlib
import itertools
import json
import os
import re
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

import marcas   # recolector/marcas.py: marcas de videos de Bruno (Fase 10)

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos"
SALIDA = RAIZ / "web" / "datos.js"
DIAS = RAIZ / "web" / "dias"
VERSION = RAIZ / "web" / "version.json"
EXTRA = RAIZ / "web" / "videos-extra.js"   # selector del visitante (10.4): se carga solo si hace falta
ALBUM = RAIZ / "web" / "album"
# Álbum de momentos (tarea 7.7): Bruno sube capturas a web/album/ con nombres como
# "2026-11-19 02-10 Se caen los servidores.jpg" (hora de Santiago). El nombre es todo lo que
# hace falta: la página toma de ahí la hora y el texto.
NOMBRE_FOTO = re.compile(r"^(\d{4}-\d{2}-\d{2}) (\d{2})[-.:h](\d{2})\s*(.*)\.(jpe?g|png|webp|gif)$", re.IGNORECASE)
FOTO_PESADA = 2 * 1024 * 1024   # más de 2 MB: se avisa (con muchas visitas, gasta tráfico)
MEDIOS_TOP = 8        # medios que más publican, en la sección Titulares
NOTICIAS_ULTIMAS = 6  # titulares completos en datos.js para "Lo último"
NOMBRE_ARCHIVO = re.compile(r"^\d{4}-\d{2}-\d{2}\.jsonl$")
VIDEOS = 20         # videos de YouTube que se muestran de cada tipo (videos y Shorts), los más vistos
FILTRO = RAIZ / "recolector" / "filtro_videos.json"   # qué videos se muestran (pedido de Bruno, 2026-11-15)
CANALES = 3         # canales de Twitch por medición


# Filtro "¿de verdad es de GTA 6?" (pedido de Bruno, 2026-11-15; pruebas en historial/PLAN_2026-11-16.md).
NOMBRA_GTA6 = re.compile(r"\bgta\s*-?\s*(6|vi)\b|\bgta(6|vi)\b|\bgrand\s+theft\s+auto\s*-?\s*(6|vi)\b", re.IGNORECASE)


def leer_filtro(conocidos):
    """Lee recolector/filtro_videos.json y las marcas de recolector/marcas_videos.json. Si algo
    está mal escrito, aborta: mejor no publicar que publicar con un filtro que no es el que Bruno
    eligió. conocidos: los códigos de video que aparecen en datos/ (para revisar las marcas)."""
    try:
        f = json.loads(FILTRO.read_text(encoding="utf-8"))
    except (OSError, ValueError) as e:
        abortar(f"no se pudo leer {FILTRO.name}: {e}")
    if f.get("modo") not in ("estricto", "titulo", "ninguno"):
        abortar(f"{FILTRO.name}: 'modo' debe ser estricto, titulo o ninguno")
    if "ocultar" in f:   # se quitó el 2026-11-18 (Fase 10): que no se ignore en silencio
        abortar(f"{FILTRO.name}: 'ocultar' ya no existe; los videos sueltos se marcan en {marcas.ARCHIVO.name}")
    palabras = f.get("excluir_palabras", [])
    if not (isinstance(palabras, list) and all(isinstance(x, str) and x.strip() for x in palabras)):
        abortar(f"{FILTRO.name}: 'excluir_palabras' debe ser una lista de palabras")
    try:
        todo = marcas.leer_todo()
    except marcas.MarcasMal as e:
        abortar(f"{marcas.ARCHIVO.name}: {e}")
    for codigo in marcas.desconocidos(list(todo["marcados"]) + list(todo["rescatados"]), conocidos):
        print(f"AVISO: {marcas.ARCHIVO.name}: el video {codigo!r} no aparece en las búsquedas de YouTube de estas mediciones: no cambia nada (¿código mal copiado?)")
    return {"modo": f["modo"], "palabras": [x.strip().lower() for x in palabras],
            "marcados": set(todo["marcados"]), "rescatados": set(todo["rescatados"]),
            "_todo": todo}   # lo leído y validado, para videos_extra() (no se lee dos veces)


def gta_visibles(region, filtro):
    """Los videos de GTA de una región de Tendencias, sin los que Bruno marcó (Fase 10). Lo usan
    el conteo de cada medición y la lista de la última: así los dos siempre cuadran."""
    return [v for v in region["gta"] if v["id"] not in filtro["marcados"]]


def pasa_filtro(v, filtro):
    if v["id"] in filtro["marcados"]:   # "el de Rust": los que Bruno marcó a mano no se muestran
        return False
    if v["id"] in filtro.get("rescatados", ()):   # 10.3: los que Bruno rescató se muestran aunque el filtro no los deje
        return True
    # El resto solo depende del registro del video y del modo/palabras: videos_extra() lo guarda
    # (por objeto, no por código: Global y Español traen registros distintos del mismo video).
    cache = filtro.get("_cache")
    if cache is None:
        return pasa_filtro_base(v, filtro)
    k = id(v)
    if k not in cache:
        cache[k] = pasa_filtro_base(v, filtro)
    return cache[k]


def pasa_filtro_base(v, filtro):
    titulo = v.get("titulo", "")
    if any(p in titulo.lower() for p in filtro["palabras"]):
        return False
    if filtro["modo"] == "ninguno":
        return True
    if not NOMBRA_GTA6.search(re.sub(r"#\S+", " ", titulo)):
        return False
    temas = v.get("temas")
    if filtro["modo"] == "estricto" and isinstance(temas, list):   # las mediciones de antes del 15 nov no traen temas
        return any(t == "Video_game_culture" or t.endswith("_game") for t in temas)
    return True


def elegir_videos(ultima, ultimos, series, filtro):
    """De los videos de la última medición, los que pasan el filtro: hasta VIDEOS videos normales
    y hasta VIDEOS Shorts, de más a menos visto. Los que no traen la marca de Short (mediciones de
    antes del 15 nov) cuentan como videos normales."""
    normales, shorts = [], []
    for v in ultima:
        if v["id"] in series and pasa_filtro(ultimos[v["id"]], filtro):
            (shorts if ultimos[v["id"]].get("short") is True else normales).append(v)
    return normales[:VIDEOS] + shorts[:VIDEOS]


def marca_short(v):
    """Videos y Shorts (pedido de Bruno, 15 nov): la página separa los Shorts de los videos.
    Las mediciones de antes del 15 nov no traen la marca: entonces no se pone nada."""
    return {"short": v["short"]} if isinstance(v.get("short"), bool) else {}


def records_videos(medidas, ultimos, filtro):
    """Récords "Video más visto" y "Short más visto" (pedido de Bruno, 2026-11-15). Recorre todas
    las mediciones de Global (no solo los videos que se muestran hoy) y anota cada vez que un video
    supera el máximo de visitas de su tipo. Si el mismo video sigue primero, solo suben sus visitas.
    Pasan el mismo filtro que las listas. Los videos sin marca de Short (los que no se midieron
    desde el 15 nov) quedan fuera: no se sabe de qué tipo son y no se adivina."""
    h = {"video": [], "short": []}
    for m in medidas:
        for v in m.get("youtube", {}).get("videos", []) + m.get("youtube_largos", {}).get("videos", []):
            u = ultimos.get(v["id"], {})
            if not isinstance(v.get("visitas"), int) or not isinstance(u.get("short"), bool) or not pasa_filtro(u, filtro):
                continue
            lista = h["short" if u["short"] else "video"]
            if lista and v["visitas"] <= lista[-1]["visitas"]:
                continue
            if lista and lista[-1]["id"] == v["id"]:
                lista[-1]["visitas"] = v["visitas"]
            else:
                lista.append({"t": m["t"], "id": v["id"], "titulo": u["titulo"], "visitas": v["visitas"]})
    return h


# Todas las combinaciones de motivos que el visitante puede ocultar (con 3 motivos, 8).
COMBOS = [tuple(c) for n in range(len(marcas.MOTIVOS) + 1) for c in itertools.combinations(sorted(marcas.MOTIVOS), n)]


def configuraciones_visitante(filtro, todo):
    """Las configuraciones que puede elegir el visitante (10.4): las tres fijas y las propias de
    Bruno. Los rescates valen en "el de Rust" y en las propias, no en "filtro automático" (que
    queda puro) ni hacen falta en "desde cero" (Bruno, 2026-11-18)."""
    resc = set(todo["rescatados"])
    confs = {
        "desde-cero": {"nombre": marcas.FIJAS["desde-cero"], "modo": "ninguno", "palabras": [], "rescatados": set()},
        "automatico": {"nombre": marcas.FIJAS["automatico"], "modo": filtro["modo"], "palabras": filtro["palabras"], "rescatados": set()},
        "rust": {"nombre": marcas.FIJAS["rust"], "modo": filtro["modo"], "palabras": filtro["palabras"], "rescatados": resc},
    }
    for k, c in todo["configuraciones"].items():
        confs[k] = {"nombre": c["nombre"], "modo": c["modo"], "palabras": [p.strip().lower() for p in c["excluir_palabras"]],
                    "rescatados": resc}
    # El texto que ve el visitante en el selector.
    confs["desde-cero"]["desc"] = "Todos los videos que trae YouTube, sin filtro."
    # Se arma con el filtro de verdad (si Bruno cambia filtro_videos.json, el texto cambia solo).
    que = {"estricto": "Solo los que nombran GTA 6 en el título y YouTube marca como videojuegos",
           "titulo": "Solo los que nombran GTA 6 en el título", "ninguno": "Todos los videos"}[filtro["modo"]]
    confs["automatico"]["desc"] = que + (", sin los que dicen " + ", ".join(filtro["palabras"]) if filtro["palabras"] else "") + "."
    confs["rust"]["desc"] = "El automático, corregido a mano por Rust (videos rescatados y marcados)."
    modos = {"estricto": "GTA 6 en el título y tema de videojuegos", "titulo": "GTA 6 en el título", "ninguno": "sin filtro"}
    for k in todo["configuraciones"]:
        c = confs[k]
        c["desc"] = "Configuración de Rust: " + modos[c["modo"]] + (", sin " + ", ".join(c["palabras"]) if c["palabras"] else "") + ", con sus rescates."
    return confs


def videos_extra(medidas, pools, ultimos, ultimo_video, filtro, ya=None):
    """Lo que necesita el selector del visitante (10.4), en web/videos-extra.js, que la página solo
    carga si el visitante elige otra cosa que "el de Rust" con los tres motivos ocultos (así
    datos.js no crece). pools: {"global": [...], "es": [...]}, los candidatos de la última medición
    ya armados como en datos.js. ultimos: {"global": ultimo_video, "es": ultimo_es}: cada lista se
    filtra con su propio registro del video (Global y Español pueden traer temas distintos). Para no repetir la lógica del filtro en la
    página, aquí se calcula qué videos pasa cada configuración y los récords de cada combinación."""
    todo = filtro["_todo"]
    motivos_de = todo["marcados"]
    confs = configuraciones_visitante(filtro, todo)
    pasa, records = {}, {}
    for k, c in confs.items():
        base = {"modo": c["modo"], "palabras": c["palabras"], "marcados": set(), "rescatados": c["rescatados"], "_cache": {}}
        pasa[k] = {n: [v["id"] for v in lista if pasa_filtro(ultimos[n][v["id"]], base)] for n, lista in pools.items()}
        records[k] = {}
        for combo in COMBOS:
            f = dict(base, marcados={i for i, ms in motivos_de.items() if set(ms) & set(combo)})
            records[k][",".join(combo)] = records_videos(medidas, ultimo_video, f)
    # Tendencias: los marcados que sí estaban en la lista, por medición y región, con sus motivos.
    tend_hist, tend_ultima = [], {}
    ult_yt = next((m for m in reversed(medidas) if "error" not in m.get("youtube_tendencias", {"error": 1})), None)
    for i, m in enumerate(medidas):
        yt = m.get("youtube_tendencias") or {}
        if "error" in yt or not yt.get("regiones"):
            continue
        por_region = {r: [motivos_de[v["id"]] for v in d["gta"] if v["id"] in motivos_de] for r, d in yt["regiones"].items()}
        por_region = {r: x for r, x in por_region.items() if x}
        if por_region:
            tend_hist.append([i, por_region])
        if m is ult_yt:
            tend_ultima = {r: [dict(v, motivos=motivos_de[v["id"]]) for v in d["gta"] if v["id"] in motivos_de]
                           for r, d in yt["regiones"].items()}
    return {
        "confs": {k: {"nombre": c["nombre"], "desc": c["desc"], "propia": k not in marcas.FIJAS} for k, c in confs.items()},
        "motivos": marcas.MOTIVOS,
        # La serie de visitas solo va si datos.js no la trae ya (la página la toma de ahí): pesa la mitad.
        "pools": {n: [{k: (serie_corta(x) if k == "serie" else x) for k, x in v.items()
                       if not (k == "serie" and v["id"] in (ya or {}).get(n, ()))} for v in lista] for n, lista in pools.items()},
        "pasa": pasa,
        "marcados": motivos_de,
        "records": records,
        "tendencias": {"historial": tend_hist, "ultima": tend_ultima},
        "videos_por_tipo": VIDEOS,
    }


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


def horas_trends(medidas):
    """Interés de cada hora completa, tomado de la medición MÁS NUEVA que la trae ("Trends sin
    huecos", 2026-11-16). Cada medición guarda muchas horas (24 hasta el 16 nov; 7 días desde
    entonces), así que si una falla, la siguiente trae su hora y el hueco se tapa solo. Además,
    Trends cambia de escala en cada medición (100 = el máximo de sus 7 días): usar siempre la más
    nueva deja las horas vecinas en escalas casi iguales y evita saltos falsos en el gráfico."""
    horas = {}
    for m in medidas:   # en orden de tiempo: las más nuevas pisan a las más viejas
        tr = m.get("trends") or {}
        for p in tr.get("puntos", []) if "error" not in tr else []:
            if not p.get("parcial"):
                horas[p["t"]] = p["interes"]
    return horas


def hora_de_medicion(t):
    """La última hora completa en el momento de una medición (la hora en curso viene a medias)."""
    d = datetime.strptime(t, "%Y-%m-%dT%H:%M:%SZ").replace(minute=0, second=0, tzinfo=timezone.utc)
    return (d - timedelta(hours=1)).strftime("%Y-%m-%dT%H:%M:%SZ")


def serie_trends(horas, desde, hasta):
    """Una entrada por hora entre 'desde' y 'hasta' (ISO), con None donde no hay dato."""
    serie, d = [], datetime.strptime(desde, "%Y-%m-%dT%H:%M:%SZ")
    fin = datetime.strptime(hasta, "%Y-%m-%dT%H:%M:%SZ")
    while d <= fin:
        t = d.strftime("%Y-%m-%dT%H:%M:%SZ")
        serie.append([t, horas.get(t)])
        d += timedelta(hours=1)
    return serie


def estado_servidor(r):
    if not r or "error" in r:
        return None            # sin dato: la página lo muestra como hueco
    return "ok" if r["ok"] else "problemas"


def videos_conocidos(medidas):
    """Todos los códigos de video que aparecen en alguna búsqueda de YouTube de datos/."""
    ids = set()
    for m in medidas:
        for clave in ("youtube", "youtube_largos", "youtube_es"):
            ids.update(v["id"] for v in (m.get(clave) or {}).get("videos", []))
        for d in ((m.get("youtube_tendencias") or {}).get("regiones") or {}).values():
            ids.update(v["id"] for v in d.get("gta", []))
    return ids


def convertir(medidas, marcados=None, rescatados=None, extra=False):
    """marcados y rescatados: solo para el panel de videos (10.2 y 10.3), que necesita ver la
    página "como si" fueran otros. None = los de recolector/marcas_videos.json."""
    filtro = leer_filtro(videos_conocidos(medidas))
    # extra=True (solo main): arma también web/videos-extra.js para el selector del visitante (10.4).
    if marcados is not None:
        filtro["marcados"] = set(marcados)
    if rescatados is not None:
        filtro["rescatados"] = set(rescatados)
    mediciones, series, ultimo_video, vistas, noticias = [], {}, {}, set(), []
    series_es, ultimo_es = {}, {}   # tarea 6.4: videos de la búsqueda en español
    trailers = {}   # tarea 6.2: serie de visitas de cada video oficial, desde el 13 nov
    horas = horas_trends(medidas)
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
        # Tarea 6.6: Kick, desde el 16 nov. Las mediciones de antes no traen la clave.
        kk = m.get("kick")
        if kk is not None:
            fila["kick"] = {"error": kk["error"]} if "error" in kk else {
                "espectadores": kk["espectadores"], "transmisiones": kk["transmisiones"],
                "canales": [{"canal": c["canal"], "espectadores": c["espectadores"], "idioma": c["idioma"]}
                            for c in kk["canales"][:5]]}
        hora = hora_de_medicion(m["t"])
        interes = horas.get(hora)
        fila["trends"] = {"interes": interes, "hora": hora} if interes is not None else {"error": tr.get("error", "sin hora completa")}
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
        kr = m.get("kick_ranking")   # desde el 18 nov (pedido de Bruno)
        if kr is not None:
            fila["ranking_kick"] = {"error": kr["error"]} if "error" in kr else {
                "gta6": kr["puesto_gta6"], "gta5": kr["puesto_gta5"], "categorias": kr["categorias"]}
        yt = m.get("youtube_tendencias")
        if yt is not None:   # sin los videos que Bruno marcó (Fase 10): se recuenta en cada medición
            fila["tendencias"] = {"error": yt["error"]} if "error" in yt else {
                r: len(gta_visibles(d, filtro)) for r, d in yt["regiones"].items()}
        mediciones.append(fila)

        # "Global" junta la búsqueda por visitas y, desde el 15 nov, la de videos de 4 a 20 minutos
        # (youtube_largos). Si un video sale en las dos, cuenta una sola vez por medición.
        for v in m.get("youtube", {}).get("videos", []) + m.get("youtube_largos", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                serie = series.setdefault(v["id"], [])
                if not serie or serie[-1]["t"] != m["t"]:
                    serie.append({"t": m["t"], "visitas": v["visitas"]})
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

    # Los videos que aparecen en la última medición en que YouTube respondió, de más a menos visto.
    ultima_yt = next((m["youtube"]["videos"] for m in reversed(medidas) if m.get("youtube", {}).get("videos")), [])
    ultima_lg = next((m["youtube_largos"]["videos"] for m in reversed(medidas) if m.get("youtube_largos", {}).get("videos")), [])
    vistos = {v["id"] for v in ultima_yt}
    ultima_yt = sorted(ultima_yt + [v for v in ultima_lg if v["id"] not in vistos], key=lambda v: v.get("visitas") or 0, reverse=True)
    youtube = [{
        "id": v["id"],
        "titulo": ultimo_video[v["id"]]["titulo"],
        "canal": ultimo_video[v["id"]]["canal"],
        "miniatura": ultimo_video[v["id"]].get("miniatura", ""),
        **marca_short(ultimo_video[v["id"]]),
        "serie": series[v["id"]],
    } for v in elegir_videos(ultima_yt, ultimo_video, series, filtro)]
    records_youtube = records_videos(medidas, ultimo_video, filtro)

    # Lo último de la 6.3, para las tarjetas de comparación (la medición más nueva sin hueco).
    ult_rk = next((m for m in reversed(medidas) if "error" not in m.get("twitch_ranking", {"error": 1})), None)
    ult_yt = next((m for m in reversed(medidas) if "error" not in m.get("youtube_tendencias", {"error": 1})), None)
    ult_kr = next((m for m in reversed(medidas) if "error" not in m.get("kick_ranking", {"error": 1})), None)
    comparacion = armar_comparacion(ult_rk, ult_yt, ult_kr, filtro)

    ultima_es = next((m["youtube_es"]["videos"] for m in reversed(medidas) if m.get("youtube_es", {}).get("videos")), [])
    youtube_es = [{
        "id": v["id"], "titulo": ultimo_es[v["id"]]["titulo"], "canal": ultimo_es[v["id"]]["canal"],
        "miniatura": ultimo_es[v["id"]].get("miniatura", ""), "idioma": ultimo_es[v["id"]].get("idioma"),
        **marca_short(ultimo_es[v["id"]]),
        "serie": series_es[v["id"]],
    } for v in elegir_videos([v for v in ultima_es if re.match(r"es\b", ultimo_es.get(v["id"], {}).get("idioma") or "", re.I)],
                             ultimo_es, series_es, filtro)]

    resultado_extra = None
    if extra:
        def armado(v, ult, ser):
            u = ult[v["id"]]
            return {"id": v["id"], "titulo": u["titulo"], "canal": u["canal"], "miniatura": u.get("miniatura", ""),
                    **({"idioma": u.get("idioma")} if ult is ultimo_es else {}), **marca_short(u), "serie": ser[v["id"]]}
        pool_es = [v for v in ultima_es if re.match(r"es\b", ultimo_es.get(v["id"], {}).get("idioma") or "", re.I) and v["id"] in series_es]
        pools = {"global": [armado(v, ultimo_video, series) for v in ultima_yt if v["id"] in series],
                 "es": [armado(v, ultimo_es, series_es) for v in pool_es]}
        resultado_extra = videos_extra(medidas, pools, {"global": ultimo_video, "es": ultimo_es}, ultimo_video, filtro,
                                       ya={"global": {v["id"] for v in youtube}, "es": {v["id"] for v in youtube_es}})

    noticias.sort(key=lambda n: n["t"])
    trends_horas = (serie_trends(horas, hora_de_medicion(medidas[0]["t"]), hora_de_medicion(medidas[-1]["t"]))
                    if medidas else [])
    # Tarea 9.10: foto de perfil de cada canal de Kick (la más reciente). Un solo diccionario en vez de una
    # foto por medición: pesa poco y las mediciones del 16 nov, que no la guardaron, también la usan.
    fotos_kick = {}
    for m in medidas:
        for c in (m.get("kick") or {}).get("canales") or []:
            if str(c.get("foto") or "").startswith("https://files.kick.com/"):
                fotos_kick[c["canal"]] = c["foto"]
    return {"mediciones": mediciones, "fotos_kick": fotos_kick, "trends_horas": trends_horas, "youtube": youtube, "youtube_es": youtube_es, "noticias": noticias,
            "records_youtube": records_youtube, **({"_extra": resultado_extra, "_filtro": filtro} if extra else {}),
            "comparacion": comparacion,
            "trailers": sorted(trailers.values(), key=lambda v: v.get("publicado") or "")}   # todos: la página los muestra por páginas (Bruno, 2026-11-13)


def armar_comparacion(ult_rk, ult_yt, ult_kr, filtro):
    """"GTA frente a lo más visto" (6.3) con las mediciones dadas (la más nueva sin hueco de cada
    fuente). La usan la página de hoy y cada momento del rebobinado (7.1)."""
    if not (ult_rk or ult_yt or ult_kr):
        return None
    comparacion = {}
    if ult_kr:
        kr = ult_kr["kick_ranking"]
        comparacion["kick"] = {"t": ult_kr["t"], "comparadas": kr["comparadas"], "gta6": kr["puesto_gta6"],
                               "gta5": kr["puesto_gta5"], "categorias": kr["categorias"], "completo": kr["completo"]}
    if ult_rk:
        rk = ult_rk["twitch_ranking"]
        comparacion["twitch"] = {"t": ult_rk["t"], "top": rk["top"], "comparadas": rk["comparadas"],
                                 "gta6": rk["puesto_gta6"], "gta5": rk["puesto_gta5"], "leidas": rk["leidas"]}
    if ult_yt:
        yt = ult_yt["youtube_tendencias"]
        # Sin los videos que Bruno marcó (Fase 10). "primero" (el n.º 1 de la lista, sea del juego
        # que sea) no se toca: la página no lo muestra hoy. Si un día lo muestra, filtrarlo también.
        regiones = {r: {**d, "gta": gta_visibles(d, filtro)} for r, d in yt["regiones"].items()}
        comparacion["youtube"] = {"t": ult_yt["t"], "regiones": regiones, "rockstar": yt["rockstar"]}
    return comparacion


# Rebobinar el lanzamiento (tarea 7.1; entrevista con Bruno, 2026-11-20). Del 18 nov 08:00 UTC
# (3 h antes de la hora cero de Nueva Zelanda, donde empezó el boom) al 20 nov 12:00 UTC (cuando
# el 19 nov ya terminó en todo el mundo: UTC-12). Una parada por cada medición de ese tramo
# (cada media hora).
REBOBINAR_DESDE = "2026-11-18T08:00:00Z"
REBOBINAR_HASTA = "2026-11-20T12:00:00Z"
REBOBINAR = RAIZ / "web" / "rebobinar.js"
# Fuentes de cada momento que pueden fallar: nombre en la página -> claves de la medición.
FUENTES_REB = {"twitch": ("twitch",), "kick": ("kick",), "trends": ("trends",), "noticias": ("noticias",),
               "youtube": ("youtube", "youtube_largos"), "youtube_es": ("youtube_es",),
               "ranking": ("twitch_ranking",), "ranking_kick": ("kick_ranking",), "tendencias": ("youtube_tendencias",)}


def fallo_fuente(m, claves):
    """True si alguna clave trae error, False si están y responden, None si no están (una fuente
    que todavía no se medía, como el ranking de Kick antes del 18 nov, o que esa vez no tocaba)."""
    if any(c in m and (not isinstance(m[c], dict) or "error" in m[c]) for c in claves):
        return True
    return False if any(c in m for c in claves) else None


def rebobinado(medidas, d, filtro):
    """Lo que la página necesita para mostrar cada momento del tramo del rebobinado y que no está
    en datos.js: qué videos estaban arriba, "GTA frente a lo más visto", el resumen de titulares y
    qué fuentes fallaron (la página muestra entonces el último dato bueno, con un aviso). Lo demás
    (Twitch, Kick, Trends, récords, tráilers) la página lo saca de datos.js cortando en ese momento.
    d: lo que devolvió convertir(), con los titulares todavía completos. None si no hay tramo."""
    ventana = [m for m in medidas if REBOBINAR_DESDE <= m["t"] <= REBOBINAR_HASTA]
    if len(ventana) < 2:
        return None
    noticias = d["noticias"]   # ya ordenados por hora: la posición es el número "i" de la página
    t_noticias = [segundos(n["t"]) for n in noticias]
    # El registro más nuevo de cada video, como en convertir() (títulos y filtro iguales a los de hoy).
    reg_g, reg_e = {}, {}
    for m in medidas:
        for v in m.get("youtube", {}).get("videos", []) + m.get("youtube_largos", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                reg_g[v["id"]] = v
        for v in m.get("youtube_es", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                reg_e[v["id"]] = v
    estado = {"yt": [], "lg": [], "es": [], "rk": None, "kr": None, "tend": None}
    bueno = {f: None for f in FUENTES_REB}   # hora de la última medición buena de cada fuente
    vigente = {f: False for f in FUENTES_REB}   # ¿la última vez que se midió, falló? (sigue hasta que responda)
    # Récords "Video/Short más visto" (como records_videos): en cada momento, las visitas que tenía
    # entonces el líder. datos.js guarda las del final de su racha, que pueden ser del futuro.
    rec = {"video": [], "short": []}
    series_g, series_e = {}, {}
    medios = Counter()
    k_not = 0
    momentos, vistos_g, vistos_e, videos_t = [], set(), set(), {}
    for m in medidas:
        if m["t"] > REBOBINAR_HASTA:
            break
        if m.get("youtube", {}).get("videos"):
            estado["yt"] = m["youtube"]["videos"]
        if m.get("youtube_largos", {}).get("videos"):
            estado["lg"] = m["youtube_largos"]["videos"]
        if m.get("youtube_es", {}).get("videos"):
            estado["es"] = m["youtube_es"]["videos"]
        for clave, k in (("twitch_ranking", "rk"), ("kick_ranking", "kr"), ("youtube_tendencias", "tend")):
            if isinstance(m.get(clave), dict) and "error" not in m[clave]:
                estado[k] = m
        for v in m.get("youtube", {}).get("videos", []) + m.get("youtube_largos", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                s = series_g.setdefault(v["id"], [])
                if not s or s[-1][0] != segundos(m["t"]):
                    s.append([segundos(m["t"]), v["visitas"]])
        for v in m.get("youtube_es", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                series_e.setdefault(v["id"], []).append([segundos(m["t"]), v["visitas"]])
        for v in m.get("youtube", {}).get("videos", []) + m.get("youtube_largos", {}).get("videos", []):
            u = reg_g.get(v["id"], {})
            if not isinstance(v.get("visitas"), int) or not isinstance(u.get("short"), bool) or not pasa_filtro(u, filtro):
                continue
            h = rec["short" if u["short"] else "video"]
            if h and v["visitas"] <= h[-1][1]:
                continue
            if h and h[-1][0] == v["id"]:
                h[-1][1] = v["visitas"]
            else:
                h.append([v["id"], v["visitas"]])
        fallos = {}
        for f, claves in FUENTES_REB.items():
            estado_f = fallo_fuente(m, claves)
            if estado_f is True:
                vigente[f] = True
            elif estado_f is False:
                vigente[f], bueno[f] = False, m["t"]
            if vigente[f]:
                fallos[f] = bueno[f]   # None: no hubo ningún dato bueno antes
        if m["t"] < REBOBINAR_DESDE:
            continue
        # Videos de ese momento: los de la última búsqueda que respondió, de más a menos visto.
        vistos = {v["id"] for v in estado["yt"]}
        lista = sorted(estado["yt"] + [v for v in estado["lg"] if v["id"] not in vistos], key=lambda v: v.get("visitas") or 0, reverse=True)
        g = [v["id"] for v in elegir_videos(lista, reg_g, series_g, filtro)]
        lista_es = [v for v in estado["es"] if re.match(r"es\b", reg_e.get(v["id"], {}).get("idioma") or "", re.I)]
        e = [v["id"] for v in elegir_videos(lista_es, reg_e, series_e, filtro)]
        vistos_g.update(g)
        vistos_e.update(e)
        # Titulares publicados hasta ese momento: los 6 últimos y los medios que más publicaron.
        hasta = segundos(m["t"])
        while k_not < len(noticias) and t_noticias[k_not] <= hasta:
            if noticias[k_not]["medio"]:
                medios[noticias[k_not]["medio"]] += 1
            k_not += 1
        cmp = armar_comparacion(estado["rk"], estado["tend"], estado["kr"], filtro)
        # Más liviano (la página no usa "top" ni "primero"): cada video en tendencia va como
        # [puesto, código] y su título y canal, una sola vez en "videos_t".
        if cmp and "twitch" in cmp:
            cmp["twitch"] = {k: x for k, x in cmp["twitch"].items() if k != "top"}
        if cmp and "youtube" in cmp:
            for r, dr in cmp["youtube"]["regiones"].items():
                for v in dr["gta"]:
                    videos_t[v["id"]] = {"titulo": v["titulo"], "canal": v["canal"]}
                cmp["youtube"]["regiones"][r] = {"en_lista": dr["en_lista"], "gta": [[v["puesto"], v["id"]] for v in dr["gta"]]}
        momentos.append({
            "t": m["t"], "g": g, "e": e, "cmp": cmp,
            "rv": {tipo: list(h[-1]) for tipo, h in rec.items() if h},
            "nt": {"n": k_not, "ultimas": list(range(k_not - 1, max(-1, k_not - 1 - NOTICIAS_ULTIMAS), -1)),
                   "medios": [[x, c] for x, c in medios.most_common(MEDIOS_TOP)], "medios_n": len(medios)},
            **({"fallos": fallos} if fallos else {}),
        })

    def meta(v, es):
        return {"titulo": v["titulo"], "canal": v["canal"], "miniatura": v.get("miniatura", ""), **marca_short(v),
                **({"idioma": v.get("idioma")} if es else {})}
    return {
        "desde": REBOBINAR_DESDE, "hasta": REBOBINAR_HASTA, "momentos": momentos,
        "videos_g": {i: dict(meta(reg_g[i], False), serie=series_g[i]) for i in sorted(vistos_g)},
        "videos_e": {i: dict(meta(reg_e[i], True), serie=series_e[i]) for i in sorted(vistos_e)},
        "videos_t": videos_t,   # los titulares no van: la página los toma de web/dias/ (pesan mucho)
    }


def comprobar_rebobinado(r, medidas, n_titulares, records):
    """Lo que no cuadra en el rebobinado, o None. Si algo no cuadra, se publica la página sin el
    rebobinado (es aparte: no vale la pena dejar de publicar todo por él)."""
    en_tramo = [m["t"] for m in medidas if REBOBINAR_DESDE <= m["t"] <= REBOBINAR_HASTA]
    tiempos = [mo["t"] for mo in r["momentos"]]
    if tiempos != en_tramo:
        return "rebobinar.js: los momentos no son las mediciones del tramo, en orden"
    for mo in r["momentos"]:
        for clave, tabla in (("g", r["videos_g"]), ("e", r["videos_e"])):
            if any(i not in tabla or not tabla[i]["serie"] for i in mo[clave]):
                return f"rebobinar.js: en {mo['t']} falta un video o su serie de visitas"
        yt = (mo["cmp"] or {}).get("youtube")
        if yt and any(v[1] not in r["videos_t"] for dr in yt["regiones"].values() for v in dr["gta"]):
            return f"rebobinar.js: en {mo['t']} falta un video en tendencia"
        if any(not (0 <= i < n_titulares) for i in mo["nt"]["ultimas"]):
            return f"rebobinar.js: en {mo['t']} hay un titular que no existe"
        if len(mo["nt"]["ultimas"]) > NOTICIAS_ULTIMAS or any(a <= b for a, b in zip(mo["nt"]["ultimas"], mo["nt"]["ultimas"][1:])):
            return f"rebobinar.js: en {mo['t']} los últimos titulares no van del más nuevo al más viejo"
    for mo in r["momentos"]:   # el líder de cada momento es el último récord de datos.js hasta esa hora
        for tipo, (vid, visitas) in mo.get("rv", {}).items():
            antes = [x for x in records.get(tipo, []) if x["t"] <= mo["t"]]
            if not antes or antes[-1]["id"] != vid or visitas > antes[-1]["visitas"]:
                return f"rebobinar.js: en {mo['t']} el récord de {tipo} no cuadra con datos.js"
    if any(a["nt"]["n"] > b["nt"]["n"] for a, b in zip(r["momentos"], r["momentos"][1:])):
        return "rebobinar.js: la cuenta de titulares baja con el tiempo"
    for tabla in (r["videos_g"], r["videos_e"]):
        for i, v in tabla.items():
            if [p[0] for p in v["serie"]] != sorted({p[0] for p in v["serie"]}):
                return f"rebobinar.js: la serie del video {i} está desordenada o repetida"
    return None


def segundos(iso):
    """'2026-11-14T03:07:00Z' -> segundos desde 1970 (UTC). Más corto que el texto."""
    return int(datetime.fromisoformat(iso.replace("Z", "+00:00")).timestamp())


def serie_corta(serie):
    """[{"t": ..., "visitas": n}, ...] -> [[segundos, n], ...]: la mitad de largo, sin perder nada."""
    return [[segundos(p["t"]), p["visitas"]] for p in serie]


def separar_por_dias(d):
    """Saca de d los titulares completos y los reparte por día.

    En d quedan solo sus horas, en el mismo orden (de la más vieja a la más nueva): la posición
    de cada titular en esa lista es su número "i", que también va en el archivo de su día. Así la
    página sabe qué días cargar para mostrar una página de titulares."""
    dias = {}
    for i, n in enumerate(d["noticias"]):
        s = segundos(n["t"])
        dia = datetime.fromtimestamp(s, timezone.utc).strftime("%Y-%m-%d")
        dias.setdefault(dia, {"noticias": []})["noticias"].append(
            {"i": i, "t": s, "titulo": n["titulo"], "medio": n["medio"], "url": n["url"]})
    d["formato"] = 2
    # Resumen de los titulares (opción B de Bruno, 2026-11-16): los medios que más publican y los
    # últimos titulares. La página los muestra sin tener que bajar los archivos de cada día.
    conteo = Counter(n["medio"] for n in d["noticias"] if n["medio"])
    d["medios_top"] = [[m, c] for m, c in conteo.most_common(MEDIOS_TOP)]
    d["medios_n"] = len(conteo)
    d["noticias_ultimas"] = [{"t": n["t"], "titulo": n["titulo"], "medio": n["medio"], "url": n["url"]}
                             for n in reversed(d["noticias"][-NOTICIAS_ULTIMAS:])]
    d["noticias_t"] = [segundos(n["t"]) for n in d.pop("noticias")]
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
    if total != len(d["noticias_t"]):
        abortar("se perdieron titulares al repartirlos por días")
    return archivos


def leer_trends_extra(carpeta):
    """Preguntas extra a Trends (6.1 y 6.7). Usa la más nueva de datos/trends_extra/ (la 6.1, con
    los días del lanzamiento) y, mientras no exista, la más nueva de datos/trends_previa/ (la
    consulta previa de la 6.7, pedido de Bruno, 2026-11-17). Cada serie va como
    [[segundos, v1, v2, ...], ...] en el orden de "palabras". None si no hay ninguna."""
    for sub in ("trends_extra", "trends_previa"):
        archivos = sorted((carpeta / sub).glob("*.json"))
        if archivos:
            break
    else:
        return None
    r = json.loads(archivos[-1].read_text(encoding="utf-8"))
    sal = {"t": r["t"], "tarea": r.get("tarea", "6.1"), "archivo": f"{sub}/{archivos[-1].name}"}
    for nombre in ("pelicula", "historica", "comparacion"):
        s = r[nombre]
        palabras = s["palabras"]
        puntos = [[segundos(x["t"])] + [x["interes"][k] for k in palabras] for x in s["puntos"]]
        if not puntos or any(not (0 <= v <= 100) for x in puntos for v in x[1:]):
            abortar(f"{sub}: la serie {nombre} está vacía o tiene valores fuera de 0-100")
        sal[nombre] = {"palabras": palabras, "rango": s["rango"], "puntos": puntos}
    sal["paises"] = [[p["pais"], p["interes"]] for p in r["paises"]["lista"][:15]]
    rel = r["relacionadas"]
    sal["en_aumento"] = [[k["busqueda"], k["valor"]] for k in rel["en_aumento"][:10]]
    sal["mas_buscadas"] = [k["busqueda"] for k in rel["mas_buscadas"][:10]]
    return sal


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
    th = d["trends_horas"]
    if [t for t, _ in th] != sorted({t for t, _ in th}):
        abortar("la serie por hora de Trends está desordenada o repetida")
    if any(v is not None and not (0 <= v <= 100) for _, v in th):
        abortar("la serie por hora de Trends tiene un interés fuera de 0-100")
    for tipo, h in d["records_youtube"].items():
        if any(a["visitas"] >= b["visitas"] or a["t"] > b["t"] for a, b in zip(h, h[1:])):
            abortar(f"el récord de {tipo} de YouTube no sube en orden de tiempo")
    for v in d["youtube"] + d["youtube_es"] + d["trailers"]:
        if [p["t"] for p in v["serie"]] != sorted(p["t"] for p in v["serie"]):
            abortar(f"la serie del video {v['id']} está desordenada")


def elegir_con_extra(extra, conf, combo):
    """Lo mismo que hará la página (web/filtro-videos.js) con videos-extra.js: qué videos ve el
    visitante con una configuración y unos motivos ocultos. Se usa para comprobar que la elección
    por defecto da exactamente lo de datos.js."""
    ocultos = set(combo)
    salida = {}
    for n, lista in extra["pools"].items():
        pasa = set(extra["pasa"][conf][n])
        sel = [v for v in lista if v["id"] in pasa and not (set(extra["marcados"].get(v["id"], ())) & ocultos)]
        normales = [v for v in sel if v.get("short") is not True][:extra["videos_por_tipo"]]
        shorts = [v for v in sel if v.get("short") is True][:extra["videos_por_tipo"]]
        salida[n] = [v["id"] for v in normales + shorts]
    return salida


def comprobar_extra(extra, d):
    """La elección por defecto ("el de Rust", los tres motivos ocultos) debe dar lo mismo que
    datos.js; si no, la lógica del selector no cuadra y mejor no publicar."""
    todos = ",".join(sorted(marcas.MOTIVOS))
    e = elegir_con_extra(extra, "rust", todos.split(","))
    if e["global"] != [v["id"] for v in d["youtube"]] or e["es"] != [v["id"] for v in d["youtube_es"]]:
        abortar("videos-extra.js: 'el de Rust' con los tres motivos ocultos no da las mismas listas que datos.js")
    if set(extra["records"]["rust"]) != {",".join(c) for c in COMBOS}:
        abortar("videos-extra.js: faltan combinaciones de motivos en los récords")
    for i, por_region in extra["tendencias"]["historial"]:
        t = d["mediciones"][i].get("tendencias") if i < len(d["mediciones"]) else None
        if not isinstance(t, dict) or "error" in t or any(r not in t for r in por_region):
            abortar(f"videos-extra.js: la medición {i} de Tendencias no cuadra con datos.js")
    if extra["records"]["rust"][todos] != d["records_youtube"]:
        abortar("videos-extra.js: 'el de Rust' con los tres motivos ocultos no da los mismos récords que datos.js")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    carpeta = Path(sys.argv[sys.argv.index("--carpeta") + 1]) if "--carpeta" in sys.argv else DATOS
    medidas = leer_mediciones(carpeta)
    if not medidas:
        abortar(f"no hay mediciones en {carpeta}")
    d = convertir(medidas, extra=True)
    extra = d.pop("_extra")
    # Lo poco que el selector necesita al abrir (nombres de las configuraciones y de los motivos);
    # el resto va en web/videos-extra.js, que solo se carga si el visitante cambia la elección.
    d["filtro_videos"] = {"confs": {k: {"nombre": c["nombre"], "desc": c["desc"]} for k, c in extra["confs"].items()},
                          "motivos": extra["motivos"]}
    filtro = d.pop("_filtro")
    comprobar(d, medidas)
    comprobar_extra(extra, d)
    # Rebobinar (7.1): antes de separar los titulares por días (necesita los titulares completos).
    try:
        reb = rebobinado(medidas, d, filtro)
        malo = reb and comprobar_rebobinado(reb, medidas, len(d["noticias"]), d["records_youtube"])
    except Exception as e:   # un fallo del rebobinado no frena la página
        reb, malo = None, f"{type(e).__name__}: {e}"
    if malo:
        print(f"AVISO: la página se publica sin rebobinado: {malo}")
        reb = None
    texto_reb = None
    if reb:
        texto_reb = ("/* DATOS REALES para rebobinar el lanzamiento (tarea 7.1), generados por recolector/generar_web.py.\n"
                     "   La página solo lo carga si el visitante abre el rebobinado. No editar a mano ni subir a git. */\n"
                     "window.REBOBINAR = " + json.dumps(reb, ensure_ascii=False, separators=(",", ":")) + ";\n")
        d["rebobinar"] = {"desde": reb["momentos"][0]["t"], "hasta": reb["momentos"][-1]["t"], "n": len(reb["momentos"]),
                          "huella": hashlib.sha256(texto_reb.encode("utf-8")).hexdigest()[:10]}
    archivos = separar_por_dias(d)
    d["album"] = leer_album()
    d["trends_extra"] = leer_trends_extra(carpeta)
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
    extra["generado"] = d["generado"]
    texto_extra = ("/* DATOS REALES para el selector de videos del visitante (Fase 10, tarea 10.4), generados por\n"
                   "   recolector/generar_web.py. La página solo lo carga si el visitante cambia la elección.\n"
                   "   No editar a mano ni subir a git. */\n"
                   "window.VIDEOS_EXTRA = " + json.dumps(extra, ensure_ascii=False, separators=(",", ":")) + ";\n")
    escribir(EXTRA, texto_extra)
    if texto_reb:
        escribir(REBOBINAR, texto_reb)
    elif REBOBINAR.exists():   # otra carpeta de datos sin el tramo: que no quede uno viejo
        REBOBINAR.unlink()
    escribir(SALIDA, texto)
    escribir(VERSION, json.dumps({"generado": d["generado"]}) + "\n")
    peso_dias = sum(len(t.encode("utf-8")) for t in archivos.values())
    print(f"web/datos.js listo: {len(d['mediciones'])} mediciones (de {medidas[0]['t']} a {medidas[-1]['t']} UTC), "
          f"{len(d['youtube'])} videos, {len(d['noticias_t'])} titulares, "
          f"{len(texto.encode('utf-8')) // 1024} KB; "
          f"{len(archivos)} días en web/dias/ ({peso_dias // 1024} KB, se cargan solo si hacen falta); "
          f"web/videos-extra.js {len(texto_extra.encode('utf-8')) // 1024} KB (solo si el visitante cambia el filtro); "
          + (f"web/rebobinar.js {len(texto_reb.encode('utf-8')) // 1024} KB, {len(reb['momentos'])} momentos (solo al rebobinar)."
             if texto_reb else "sin tramo para rebobinar."))


if __name__ == "__main__":
    main()
