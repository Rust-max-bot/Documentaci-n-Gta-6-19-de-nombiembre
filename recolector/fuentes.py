"""Las fuentes de datos del recolector.

Cada fuente es una función independiente que recibe el "estado" (lo que quedó guardado en
mediciones anteriores) y devuelve un diccionario con lo medido. Si algo sale mal, lanza una
excepción: el recolector la anota como hueco y sigue con las demás.

Para añadir una fuente nueva: escribir su función aquí, añadirla a FUENTES al final del
archivo y añadir su comprobación en validar.py. No hace falta tocar las demás.

Las consultas son las mismas que se probaron desde GitHub el 2026-11-12
(probar_fuentes.py). Rockstar no está: no responde a programas; sus caídas se anotan a mano.
"""
import http.client
import http.cookiejar
import json
import os
import re
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

from red import UA, Falla, a_iso, pedir, pedir_json

TWITCH_CATEGORIA = "1867279146"   # "Grand Theft Auto VI", verificado el 2026-11-12
KICK_CATEGORIA = 13155            # "Grand Theft Auto VI (GTA)" en Kick, verificado el 2026-11-16 (tarea 6.6)
KICK_PAGINAS_MAX = 5              # 1.000 directos por página
KICK_CANALES = 10                 # canales con más público que se guardan en cada medición
KICK_GTA5 = 8                     # "Grand Theft Auto V (GTA)" en Kick, verificado el 2026-11-18
KICK_RANKING_PAGINAS_MAX = 30     # ranking de Kick: lee TODOS los directos (11.081 el 18 nov = 12 páginas)
KICK_COMPARAR = 5                 # categorías de Kick que se guardan para comparar, además de GTA VI y GTA V
TWITCH_CANALES = 20               # canales con más público que se guardan en cada medición
TWITCH_PAGINAS_MAX = 60           # 100 transmisiones por página: hasta 6.000 transmisiones
YOUTUBE_BUSQUEDA = "GTA 6"
YOUTUBE_RESULTADOS = 25           # videos nuevos que entrega cada búsqueda
YOUTUBE_SEGUIMIENTO = 50          # máximo de videos cuyas visitas se miden (1 unidad cada 50)
# Tarea 6.4 (Bruno, 2026-11-13): una segunda búsqueda con idioma preferido español, para ver a
# los creadores hispanohablantes. La búsqueda (100 unidades) se hace como mucho una vez por hora;
# en los otros turnos solo se vuelven a medir sus videos (1 unidad). Ver historial/PLAN_DE_TRABAJO_2026-11-14.md, 6.4.
YOUTUBE_ES_IDIOMA = "es"
YOUTUBE_ES_CADA_MIN = 50          # minutos mínimos entre dos búsquedas en español
YOUTUBE_CADA_MIN = 50             # minutos mínimos entre dos búsquedas globales (antes del 15 nov: en cada medición)
YOUTUBE_LARGOS_CADA_MIN = 50      # minutos mínimos entre dos búsquedas de videos de 4 a 20 minutos
# Partes que se piden de cada video. Cuesta 1 unidad igual, pidan las partes que se pidan.
PARTES_VIDEO = "snippet,statistics,contentDetails,topicDetails,player"
SHORTS_SEGUNDOS = 45              # tiempo máximo por fuente para preguntar a youtube.com qué videos son Shorts
TRENDS_PALABRA = "GTA 6"
# Desde el 2026-11-16 (Bruno) se guarda la serie entera de 7 días (unos 169 puntos por hora, ~10 KB),
# no solo las últimas 24 horas: así basta con que una medición salga bien cada pocos días para no
# perder ninguna hora, y hay más horas en común para comparar las escalas de dos mediciones.
TRENDS_PUNTOS = 200               # tope de puntos que se guardan (la serie de 7 días trae ~169)
# Google responde a veces 429 ("demasiadas peticiones") a las máquinas de GitHub: 4 de 98
# mediciones hasta el 16 nov. Un solo reintento corto, y solo si queda tiempo, para no
# arriesgar el límite de 8 minutos del workflow. Trends va al final de FUENTES por lo mismo.
TRENDS_ESPERA_429 = 20            # segundos antes del reintento
TRENDS_REINTENTA_ANTES_DE = 40    # solo se reintenta si el primer intento tardó menos que esto (s)
TRENDS_ESPERA_CONSULTA = 20       # segundos máximos por consulta (pedir() usa 30 por defecto)
NOTICIAS_RSS = "https://news.google.com/rss/search?q=%22GTA+6%22&hl=es-419&gl=CL&ceid=CL:es-419"
# Tarea 9.3 (Bruno, 2026-11-17: "que haya menos fallos"): Google Noticias responde a veces 429 o 503
# a las máquinas de GitHub (8 huecos del 16 al 17 nov). Un solo reintento, como en Trends.
NOTICIAS_ESPERA = 20              # segundos antes del reintento
NOTICIAS_REINTENTA = (429, 503)   # códigos pasajeros que vale la pena reintentar
# Tarea 6.3 (Bruno, 2026-11-13): GTA comparado con lo más visto. Se guarda desde antes del
# lanzamiento porque el ranking de un momento no se puede pedir después.
TWITCH_GTA5 = "32982"             # "Grand Theft Auto V"; el nombre se comprueba en la prueba real
TWITCH_RANKING = 100              # categorías del ranking que se leen (una consulta)
TWITCH_GUARDAR_RANKING = 10       # las primeras que se guardan con su nombre
TWITCH_COMPARAR = 5               # las primeras cuyas transmisiones se miden para comparar
YOUTUBE_REGIONES = ("CL", "US")   # tendencias de YouTube de Chile y de EE. UU. (1 unidad cada una)
YOUTUBE_ROCKSTAR = "@RockstarGames"
# Tarea 6.2: videos oficiales de GTA VI en el canal de Rockstar, medidos por su enlace fijo
# (1 unidad por medición). Encontrados y verificados con una consulta real desde GitHub el
# 2026-11-13 (ejecución 43511560652 de "Probar fuentes"): título, canal y fecha.
YOUTUBE_TRAILERS = (
    "QdBZY2fkU-0",   # Grand Theft Auto VI Trailer 1 (4 dic 2023)
    "VQRLujxTm3c",   # Grand Theft Auto VI Trailer 2 (6 may 2025)
    "tJbzMqJGH4k",   # Grand Theft Auto VI: An Extended Look (28 ago 2026)
    "rz1B4B2yBZY",   # Grand Theft Auto VI Launch Trailer (15 oct 2026)
    # Añadidos el 2026-11-17 (pedido de Bruno: "más tráilers, solo oficiales"). Son los demás
    # videos de GTA VI de la pestaña "Videos" del canal principal @RockstarGames (no Shorts ni
    # canales regionales), comprobados en su página pública: dueño, duración y que no son Shorts.
    "EiQEBYDox_k",   # Grand Theft Auto VI: Official Cover Art Reveal (jun 2026, 0:33)
    "qq76pQsI1iw",   # Grand Theft Auto VI: An Extended Look Coming August 27 (6 ago 2026, 0:26)
    "_yl5ELcmugI",   # Grand Theft Auto VI: Pre-Load Now (10 nov 2026, 0:30)
)
ES_GTA = re.compile(r"\bGTA|grand theft auto|rockstar games", re.I)   # "GTA 6", "GTA6", "GTAV"
RECORTE_ORIGINAL = 30000          # caracteres de la respuesta original que se guardan si hay problemas


def _cabeceras_twitch(cid, sec):
    cuerpo = urllib.parse.urlencode({"client_id": cid, "client_secret": sec, "grant_type": "client_credentials"}).encode()
    token = pedir_json("https://id.twitch.tv/oauth2/token", "token de Twitch", datos=cuerpo)
    return {"Client-Id": cid, "Authorization": "Bearer " + token["access_token"]}


def twitch(estado):
    cid = os.environ.get("TWITCH_CLIENT_ID", "")
    sec = os.environ.get("TWITCH_CLIENT_SECRET", "")
    if not cid or not sec:
        raise Falla("faltan las claves de Twitch")
    cab = _cabeceras_twitch(cid, sec)
    vistas, cursor, paginas = {}, None, 0
    while paginas < TWITCH_PAGINAS_MAX:
        q = {"game_id": TWITCH_CATEGORIA, "first": 100}
        if cursor:
            q["after"] = cursor
        d = pedir_json("https://api.twitch.tv/helix/streams?" + urllib.parse.urlencode(q), "transmisiones de Twitch", cab)
        for s in d.get("data", []):
            vistas.setdefault(s["id"], s)   # Twitch a veces repite una transmisión entre páginas
        cursor = d.get("pagination", {}).get("cursor")
        paginas += 1
        if not cursor or not d.get("data"):
            cursor = None
            break

    lista = sorted(vistas.values(), key=lambda s: s["viewer_count"], reverse=True)
    fotos, error_fotos = _fotos_de_perfil([s["user_login"] for s in lista[:TWITCH_CANALES]], cab)
    r = {
        "categoria": TWITCH_CATEGORIA,
        "espectadores": sum(s["viewer_count"] for s in lista),
        "transmisiones": len(lista),
        "completo": cursor is None,   # False si había más páginas de las que se leyeron
        "canales": [{
            "login": s["user_login"],
            "nombre": s["user_name"],
            "espectadores": s["viewer_count"],
            "titulo": s.get("title", ""),
            "idioma": s.get("language", ""),
            "inicio": s.get("started_at"),
            "miniatura": s.get("thumbnail_url", ""),
            **({"foto": fotos[s["user_login"]]} if s["user_login"] in fotos else {}),
        } for s in lista[:TWITCH_CANALES]],
    }
    if error_fotos:
        r["error_fotos"] = error_fotos
    return r


def _fotos_de_perfil(logins, cab):
    """Foto de perfil de cada canal (no cambia como la miniatura del directo, que se pierde al
    terminar la transmisión; decisión de Bruno, 2026-11-13). Una consulta para los 20 canales.
    Si falla, no se pierde la medición de Twitch: se guardan sin foto y se anota el motivo."""
    if not logins:
        return {}, None
    try:
        q = urllib.parse.urlencode([("login", l) for l in logins])
        d = pedir_json("https://api.twitch.tv/helix/users?" + q, "fotos de perfil de Twitch", cab)
        fotos = {}
        for u in d.get("data", []):
            url = u.get("profile_image_url") or ""
            if u.get("login") in logins and url.startswith("https://static-cdn.jtvnw.net/"):
                fotos[u["login"]] = url
        return fotos, None
    except Falla as e:
        return {}, str(e)[:200]


def _mensaje_youtube(txt):
    try:
        return json.loads(txt).get("error", {}).get("message", "")[:160]
    except ValueError:
        return ""


def _segundos(duracion):
    """Duración de YouTube (ISO 8601, por ejemplo "PT1M5S") en segundos; None si no se entiende."""
    r = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", duracion or "")
    if not r or not any(r.groups()):
        return None
    d, h, m, s = (int(x or 0) for x in r.groups())
    return d * 86400 + h * 3600 + m * 60 + s


def _preguntar_short(vid):
    """youtube.com/shorts/<id> responde 200 si el video es un Short y redirige (303) a /watch si
    no lo es. Probado con 96 videos el 15 nov (ejecución 43736224115). None si no hay respuesta clara."""
    c = http.client.HTTPSConnection("www.youtube.com", timeout=5)
    try:
        c.request("HEAD", "/shorts/" + vid, headers={"User-Agent": UA})
        cod = c.getresponse().status
        return True if cod == 200 else False if cod in (301, 302, 303) else None
    except (OSError, http.client.HTTPException):
        return None
    finally:
        c.close()


def _datos_video(v, conocidos, limite):
    """Tarea "videos y Shorts" (pedido de Bruno, 15 nov): duración, temas que YouTube asigna solo
    al video (para el filtro "¿es de GTA 6?") y si es un Short. Si ya se supo en una medición
    anterior (preguntando a youtube.com), se reutiliza; si youtube.com no responde a tiempo, se
    adivina: Short si dura 3 minutos o menos y el reproductor no es apaisado (en la prueba
    coincidió en 94 de 96 videos) y se vuelve a preguntar en la próxima medición."""
    seg = _segundos(v.get("contentDetails", {}).get("duration"))
    pl = v.get("player", {})
    try:
        ancho, alto = int(pl.get("embedWidth")), int(pl.get("embedHeight"))
    except (TypeError, ValueError):
        ancho = alto = None
    temas = [t.rsplit("/", 1)[-1] for t in v.get("topicDetails", {}).get("topicCategories", []) if isinstance(t, str)]
    short, por = conocidos.get(v["id"]), "url"
    if short is None and seg and seg > 180:   # un Short dura como mucho 3 minutos: no hace falta preguntar
        short, por = False, "duracion"
    if short is None and time.monotonic() < limite:
        short = _preguntar_short(v["id"])
    if short is None:
        short, por = bool(seg and seg <= 180 and ancho and alto and alto >= ancho), "forma"
    return {"duracion": seg, "temas": temas, "short": short, "short_por": por}


def _toca_buscar(previos, ultima, ahora, cada_min):
    """Las búsquedas cuestan 100 unidades: se hacen como mucho una vez cada `cada_min` minutos.
    En los demás turnos solo se vuelven a medir los videos anteriores (1 unidad)."""
    return not previos or not ultima or ahora - datetime.fromisoformat(ultima.replace("Z", "+00:00")) >= timedelta(minutes=cada_min)


def youtube(estado):
    clave = os.environ.get("YOUTUBE_API_KEY", "")
    if not clave:
        raise Falla("falta la clave de YouTube")
    # Desde el 15 nov (decisión de Bruno, con la búsqueda de videos largos): como mucho una vez
    # por hora, para no pasar el cupo diario de YouTube; las visitas se siguen midiendo siempre.
    ahora = datetime.now(timezone.utc)
    buscar = _toca_buscar(estado["youtube_previos"], estado.get("youtube_busqueda"), ahora, YOUTUBE_CADA_MIN)
    unidades, nuevos = 0, []
    if buscar:
        q = {"part": "snippet", "q": YOUTUBE_BUSQUEDA, "type": "video", "order": "viewCount",
             "publishedAfter": a_iso(ahora - timedelta(days=7)), "maxResults": YOUTUBE_RESULTADOS, "key": clave}
        cod, txt = pedir("https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode(q))
        if cod != 200:
            raise Falla(f"búsqueda de YouTube: código {cod}. {_mensaje_youtube(txt)}")
        unidades = 100
        nuevos = [i["id"]["videoId"] for i in json.loads(txt).get("items", []) if i.get("id", {}).get("videoId")]
    puesto = {vid: n + 1 for n, vid in enumerate(nuevos)}

    # Se siguen midiendo los videos de la medición anterior (los más vistos primero), para que
    # cada video tenga una serie continua aunque salga de la búsqueda.
    previos = [vid for vid in estado["youtube_previos"] if vid not in puesto]
    ids = nuevos + previos[:YOUTUBE_SEGUIMIENTO - len(nuevos)]
    if not ids:
        raise Falla("la búsqueda de YouTube no devolvió videos")

    cod, txt = pedir("https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode(
        {"part": PARTES_VIDEO, "maxWidth": 400, "id": ",".join(ids), "key": clave}))
    unidades += 1
    if cod != 200:
        raise Falla(f"estadísticas de YouTube: código {cod}. {_mensaje_youtube(txt)}")

    def numero(st, campo):
        return int(st[campo]) if campo in st else None   # None: el canal lo oculta

    videos, conocidos, limite = [], estado.get("shorts", {}), time.monotonic() + SHORTS_SEGUNDOS
    for v in json.loads(txt).get("items", []):
        sn, st = v.get("snippet", {}), v.get("statistics", {})
        miniaturas = sn.get("thumbnails", {})
        mini = (miniaturas.get("medium") or miniaturas.get("high") or miniaturas.get("default") or {}).get("url", "")
        videos.append({
            "id": v["id"],
            "titulo": sn.get("title", ""),
            "canal": sn.get("channelTitle", ""),
            "canal_id": sn.get("channelId", ""),
            "publicado": sn.get("publishedAt"),
            "visitas": numero(st, "viewCount"),
            "me_gusta": numero(st, "likeCount"),
            "comentarios": numero(st, "commentCount"),
            "en_vivo": sn.get("liveBroadcastContent", "none"),
            "miniatura": mini,
            "puesto": puesto.get(v["id"]),   # puesto en la búsqueda de esta medición; None si ya no sale
            **_datos_video(v, conocidos, limite),
        })
    if not videos:
        raise Falla("YouTube no devolvió las estadísticas de ningún video")
    videos.sort(key=lambda v: v["visitas"] or 0, reverse=True)
    return {"busqueda": YOUTUBE_BUSQUEDA, "busco": buscar, "unidades": unidades, "videos": videos}


def youtube_largos(estado):
    """Videos normales para "Global" (pedido de Bruno, 15 nov): en la búsqueda por visitas, 45 de
    50 eran Shorts. Esta busca "GTA 6" de los últimos 7 días, de 4 a 20 minutos, por visitas.
    Comparada el 15 nov (ejecución 43737292527) con la de más de 20 minutos: la de 4 a 20 trajo
    25 de 25 que nombran GTA 6 en el título; la de más de 20 traía directos y partidas de GTA 5.
    Busca como mucho una vez por hora; en los demás turnos vuelve a medir los anteriores."""
    clave = os.environ.get("YOUTUBE_API_KEY", "")
    if not clave:
        raise Falla("falta la clave de YouTube")
    ahora = datetime.now(timezone.utc)
    previos = estado.get("youtube_largos_previos", [])
    buscar = _toca_buscar(previos, estado.get("youtube_largos_busqueda"), ahora, YOUTUBE_LARGOS_CADA_MIN)
    unidades, nuevos = 0, []
    if buscar:
        q = {"part": "snippet", "q": YOUTUBE_BUSQUEDA, "type": "video", "order": "viewCount", "videoDuration": "medium",
             "publishedAfter": a_iso(ahora - timedelta(days=7)), "maxResults": YOUTUBE_RESULTADOS, "key": clave}
        cod, txt = pedir("https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode(q))
        if cod != 200:
            raise Falla(f"búsqueda de videos largos de YouTube: código {cod}. {_mensaje_youtube(txt)}")
        unidades += 100
        nuevos = [i["id"]["videoId"] for i in json.loads(txt).get("items", []) if i.get("id", {}).get("videoId")]
    puesto = {vid: n + 1 for n, vid in enumerate(nuevos)}
    ids = nuevos + [vid for vid in previos if vid not in puesto][:YOUTUBE_SEGUIMIENTO - len(nuevos)]
    if not ids:
        raise Falla("la búsqueda de videos largos de YouTube no devolvió videos")
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode(
        {"part": PARTES_VIDEO, "maxWidth": 400, "id": ",".join(ids), "key": clave}))
    unidades += 1
    if cod != 200:
        raise Falla(f"estadísticas de videos largos de YouTube: código {cod}. {_mensaje_youtube(txt)}")
    videos, conocidos, limite = [], estado.get("shorts", {}), time.monotonic() + SHORTS_SEGUNDOS
    for v in json.loads(txt).get("items", []):
        sn, st = v.get("snippet", {}), v.get("statistics", {})
        miniaturas = sn.get("thumbnails", {})
        mini = (miniaturas.get("medium") or miniaturas.get("high") or miniaturas.get("default") or {}).get("url", "")
        videos.append({
            "id": v["id"], "titulo": sn.get("title", ""), "canal": sn.get("channelTitle", ""),
            "canal_id": sn.get("channelId", ""), "publicado": sn.get("publishedAt"),
            "visitas": int(st["viewCount"]) if "viewCount" in st else None,
            "me_gusta": int(st["likeCount"]) if "likeCount" in st else None,
            "comentarios": int(st["commentCount"]) if "commentCount" in st else None,
            "miniatura": mini, "puesto": puesto.get(v["id"]),
            **_datos_video(v, conocidos, limite),
        })
    if not videos:
        raise Falla("YouTube no devolvió las estadísticas de ningún video largo")
    videos.sort(key=lambda v: v["visitas"] or 0, reverse=True)
    return {"busqueda": YOUTUBE_BUSQUEDA, "duracion": "4-20 min", "busco": buscar, "unidades": unidades, "videos": videos}


def youtube_es(estado):
    """Tarea 6.4: videos de "GTA 6" de los últimos 7 días con idioma preferido español, en el
    orden de relevancia de YouTube (después se ordenan por visitas). Comparado con una consulta
    real el 13 nov (ejecución 43515144506): ordenando por visitas, YouTube ignora casi del todo
    el idioma (3 de 25 en español); por relevancia, 19 de 25. relevanceLanguage es una
    preferencia, no un filtro: por eso se guarda el idioma que declara cada video, si lo declara.
    Busca como mucho una vez por hora; en los demás turnos vuelve a medir los videos anteriores."""
    clave = os.environ.get("YOUTUBE_API_KEY", "")
    if not clave:
        raise Falla("falta la clave de YouTube")
    ahora = datetime.now(timezone.utc)
    previos = estado.get("youtube_es_previos", [])
    ultima = estado.get("youtube_es_busqueda")
    buscar = _toca_buscar(previos, ultima, ahora, YOUTUBE_ES_CADA_MIN)
    unidades, nuevos = 0, []
    if buscar:
        q = {"part": "snippet", "q": YOUTUBE_BUSQUEDA, "type": "video", "order": "relevance",
             "relevanceLanguage": YOUTUBE_ES_IDIOMA, "publishedAfter": a_iso(ahora - timedelta(days=7)),
             "maxResults": YOUTUBE_RESULTADOS, "key": clave}
        cod, txt = pedir("https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode(q))
        if cod != 200:
            raise Falla(f"búsqueda de YouTube en español: código {cod}. {_mensaje_youtube(txt)}")
        unidades += 100
        nuevos = [i["id"]["videoId"] for i in json.loads(txt).get("items", []) if i.get("id", {}).get("videoId")]
    puesto = {vid: n + 1 for n, vid in enumerate(nuevos)}
    ids = nuevos + [vid for vid in previos if vid not in puesto][:YOUTUBE_SEGUIMIENTO - len(nuevos)]
    if not ids:
        raise Falla("la búsqueda de YouTube en español no devolvió videos")
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode(
        {"part": PARTES_VIDEO, "maxWidth": 400, "id": ",".join(ids), "key": clave}))
    unidades += 1
    if cod != 200:
        raise Falla(f"estadísticas de YouTube en español: código {cod}. {_mensaje_youtube(txt)}")
    videos, conocidos, limite = [], estado.get("shorts", {}), time.monotonic() + SHORTS_SEGUNDOS
    for v in json.loads(txt).get("items", []):
        sn, st = v.get("snippet", {}), v.get("statistics", {})
        miniaturas = sn.get("thumbnails", {})
        mini = (miniaturas.get("medium") or miniaturas.get("high") or miniaturas.get("default") or {}).get("url", "")
        videos.append({
            "id": v["id"], "titulo": sn.get("title", ""), "canal": sn.get("channelTitle", ""),
            "canal_id": sn.get("channelId", ""), "publicado": sn.get("publishedAt"),
            "visitas": int(st["viewCount"]) if "viewCount" in st else None,
            "me_gusta": int(st["likeCount"]) if "likeCount" in st else None,
            "comentarios": int(st["commentCount"]) if "commentCount" in st else None,
            "idioma": sn.get("defaultAudioLanguage") or sn.get("defaultLanguage"),   # None si el video no lo declara
            "miniatura": mini, "puesto": puesto.get(v["id"]),
            **_datos_video(v, conocidos, limite),
        })
    if not videos:
        raise Falla("YouTube no devolvió las estadísticas de ningún video en español")
    videos.sort(key=lambda v: v["visitas"] or 0, reverse=True)
    return {"busqueda": YOUTUBE_BUSQUEDA, "idioma": YOUTUBE_ES_IDIOMA, "busco": buscar, "unidades": unidades, "videos": videos}


class _Trends429(Exception):
    """Google respondió 429 en algún paso; se puede reintentar."""


def _serie_trends():
    """Un intento completo (cookie nueva, explore, serie). Devuelve timelineData."""
    espera = TRENDS_ESPERA_CONSULTA
    ab = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    pedir("https://trends.google.com/trends/explore?q=GTA%206&date=now%207-d", abridor=ab, espera=espera)  # solo da la cookie
    req = {"comparisonItem": [{"keyword": TRENDS_PALABRA, "geo": "", "time": "now 7-d"}], "category": 0, "property": ""}
    cod, txt = pedir("https://trends.google.com/trends/api/explore?" + urllib.parse.urlencode(
        {"hl": "es", "tz": 0, "req": json.dumps(req)}), abridor=ab, espera=espera)
    if cod == 429:
        raise _Trends429("paso explore")
    if cod != 200:
        raise Falla(f"Google Trends (paso explore): código {cod}")
    widgets = json.loads(txt[txt.index("{"):]).get("widgets", [])
    w = next((x for x in widgets if x.get("id") == "TIMESERIES"), None)
    if not w:
        raise Falla("Google Trends no entregó la serie de tiempo")
    cod, txt = pedir("https://trends.google.com/trends/api/widgetdata/multiline?" + urllib.parse.urlencode(
        {"hl": "es", "tz": 0, "req": json.dumps(w["request"], separators=(",", ":")), "token": w["token"]}),
        abridor=ab, espera=espera)
    if cod == 429:
        raise _Trends429("paso serie")
    if cod != 200:
        raise Falla(f"Google Trends (paso serie): código {cod}")
    return json.loads(txt[txt.index("{"):])["default"]["timelineData"]


def trends(estado):
    inicio = time.monotonic()
    try:
        linea = _serie_trends()
    except _Trends429 as e:
        if time.monotonic() - inicio >= TRENDS_REINTENTA_ANTES_DE:
            raise Falla(f"Google Trends ({e}): código 429, sin tiempo para reintentar") from None
        time.sleep(TRENDS_ESPERA_429)
        try:
            linea = _serie_trends()
        except _Trends429 as e2:
            raise Falla(f"Google Trends ({e2}): código 429 tras 2 intentos") from None
    if not linea:
        raise Falla("Google Trends devolvió una serie vacía")
    puntos = [{
        "t": a_iso(datetime.fromtimestamp(int(p["time"]), timezone.utc)),
        "interes": int(p["value"][0]),
        "parcial": bool(p.get("isPartial", False)),   # la última hora todavía no está completa
    } for p in linea[-TRENDS_PUNTOS:]]
    # Ojo: el interés es relativo (100 = el máximo de esos 7 días), así que el mismo punto
    # puede cambiar de valor entre una medición y otra.
    return {"palabra": TRENDS_PALABRA, "rango": "now 7-d", "puntos_en_fuente": len(linea), "puntos": puntos}


def noticias(estado):
    cod, txt = pedir(NOTICIAS_RSS)
    if cod in NOTICIAS_REINTENTA:
        time.sleep(NOTICIAS_ESPERA)
        cod2, txt = pedir(NOTICIAS_RSS)
        if cod2 != 200:
            raise Falla(f"Google Noticias: código {cod2} tras 2 intentos (antes {cod})")
        cod = cod2
    if cod != 200:
        raise Falla(f"Google Noticias: código {cod}")
    try:
        items = ET.fromstring(txt).findall(".//item")
    except ET.ParseError:
        raise Falla("Google Noticias: la respuesta no es un RSS válido") from None
    if not items:
        raise Falla("Google Noticias no devolvió titulares")
    nuevas = []
    for i in items:
        url = (i.findtext("link") or "").strip()
        if not url or url in estado["noticias_vistas"]:
            continue   # solo se guardan los titulares que no estaban en mediciones anteriores
        try:
            fecha = a_iso(parsedate_to_datetime(i.findtext("pubDate")))
        except (TypeError, ValueError):
            fecha = None
        medio = i.find("source")
        nuevas.append({
            "titulo": (i.findtext("title") or "").strip(),
            "medio": medio.text if medio is not None else None,
            "medio_url": medio.get("url") if medio is not None else None,
            "url": url,
            "t": fecha,
        })
    return {"en_fuente": len(items), "nuevas": nuevas}


# Reddit (r/GTA6 por RSS) se quitó el 2026-11-17 (tarea 6.9, decisión de Bruno): desde ese día
# a las 18:37 UTC Reddit bloquea su RSS público. Lo ya guardado sigue en datos/. Si llega la
# clave oficial, la función vieja está en git (commit anterior a "6.9: quitar Reddit").


def twitch_ranking(estado):
    """Tarea 6.3: en qué puesto está GTA VI entre todas las categorías de Twitch (Twitch da el
    orden, no el número) y, para comparar, los espectadores de las 100 transmisiones con más
    público de las primeras categorías, de GTA VI y de GTA V. Es una aproximación igual para
    todas: la cifra total de GTA VI está en la fuente "twitch"."""
    cid = os.environ.get("TWITCH_CLIENT_ID", "")
    sec = os.environ.get("TWITCH_CLIENT_SECRET", "")
    if not cid or not sec:
        raise Falla("faltan las claves de Twitch")
    cab = _cabeceras_twitch(cid, sec)
    d = pedir_json("https://api.twitch.tv/helix/games/top?" + urllib.parse.urlencode({"first": TWITCH_RANKING}),
                   "ranking de categorías de Twitch", cab)
    top = [{"id": g["id"], "nombre": g.get("name", ""), "puesto": n + 1} for n, g in enumerate(d.get("data", []))]
    if not top:
        raise Falla("Twitch no devolvió el ranking de categorías")
    puesto = {g["id"]: g["puesto"] for g in top}
    ids = [g["id"] for g in top[:TWITCH_COMPARAR]]
    for extra in (TWITCH_CATEGORIA, TWITCH_GTA5):
        if extra not in ids:
            ids.append(extra)
    comparadas = []
    for gid in ids:
        s = pedir_json("https://api.twitch.tv/helix/streams?" + urllib.parse.urlencode({"game_id": gid, "first": 100}),
                       "transmisiones para comparar en Twitch", cab).get("data", [])
        nombre = next((g["nombre"] for g in top if g["id"] == gid), s[0].get("game_name", "") if s else "")
        comparadas.append({"id": gid, "nombre": nombre, "puesto": puesto.get(gid),
                           "espectadores_top100": sum(x["viewer_count"] for x in s), "transmisiones_top100": len(s)})
    return {"leidas": len(top), "puesto_gta6": puesto.get(TWITCH_CATEGORIA), "puesto_gta5": puesto.get(TWITCH_GTA5),
            "top": top[:TWITCH_GUARDAR_RANKING], "comparadas": comparadas}


def youtube_tendencias(estado):
    """Tarea 6.3: videos en tendencia de YouTube (Chile y EE. UU.): el primero de cada lista y
    los que son de GTA, con su puesto. Y los números del canal de Rockstar. 3 unidades."""
    clave = os.environ.get("YOUTUBE_API_KEY", "")
    if not clave:
        raise Falla("falta la clave de YouTube")

    def ver(v, n):
        sn, st = v.get("snippet", {}), v.get("statistics", {})
        return {"puesto": n, "id": v["id"], "titulo": sn.get("title", ""), "canal": sn.get("channelTitle", ""),
                "visitas": int(st["viewCount"]) if "viewCount" in st else None}

    regiones, unidades = {}, 0
    for region in YOUTUBE_REGIONES:
        cod, txt = pedir("https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode(
            {"part": "snippet,statistics", "chart": "mostPopular", "regionCode": region, "maxResults": 50, "key": clave}))
        unidades += 1
        if cod != 200:
            raise Falla(f"tendencias de YouTube ({region}): código {cod}. {_mensaje_youtube(txt)}")
        items = json.loads(txt).get("items", [])
        if not items:
            raise Falla(f"YouTube no devolvió tendencias de {region}")
        gta = []
        for n, v in enumerate(items):
            sn = v.get("snippet", {})
            # Solo el título: con las etiquetas entraban videos de otros juegos (probado el 13 nov).
            if ES_GTA.search(sn.get("title", "")):
                gta.append(ver(v, n + 1))
        regiones[region] = {"en_lista": len(items), "primero": ver(items[0], 1), "gta": gta}
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/channels?" + urllib.parse.urlencode(
        {"part": "snippet,statistics", "forHandle": YOUTUBE_ROCKSTAR, "key": clave}))
    unidades += 1
    if cod != 200:
        raise Falla(f"canal de Rockstar en YouTube: código {cod}. {_mensaje_youtube(txt)}")
    canales = json.loads(txt).get("items", [])
    if not canales:
        raise Falla("YouTube no encontró el canal de Rockstar")
    st = canales[0].get("statistics", {})

    def numero(campo):
        if campo not in st or (campo == "subscriberCount" and st.get("hiddenSubscriberCount")):
            return None
        return int(st[campo])

    rockstar = {"id": canales[0]["id"], "nombre": canales[0].get("snippet", {}).get("title", ""),
                "suscriptores": numero("subscriberCount"), "visitas": numero("viewCount"), "videos": numero("videoCount")}
    return {"unidades": unidades, "regiones": regiones, "rockstar": rockstar}


def playstation(estado):
    d = pedir_json("https://status.playstation.com/data/statuses/region/SCEA.json", "estado de PlayStation")
    chile = next((c for c in d.get("countries", []) if c.get("countryCode") == "CL"), None)
    if chile is None:
        raise Falla("el estado de PlayStation no trae a Chile")
    region, servicios = d.get("status") or [], chile.get("services") or []
    if not servicios:
        raise Falla("el estado de PlayStation no trae la lista de servicios de Chile")
    # Cada servicio (y cada parte de un servicio) trae una lista "status": vacía significa
    # "sin problemas" (visto el 2026-11-12). El formato de una caída todavía no se ha visto.
    problemas = []
    for s in servicios:
        if s.get("status"):
            problemas.append({"servicio": s.get("serviceName"), "estado": s["status"]})
        for parte in s.get("resources") or []:
            if parte.get("status"):
                problemas.append({"servicio": s.get("serviceName"), "parte": parte.get("resourceName"), "estado": parte["status"]})
    r = {"ok": not region and not problemas, "servicios_chile": len(servicios), "region": region, "problemas": problemas}
    if not r["ok"]:
        r["original"] = json.dumps(chile, ensure_ascii=False)[:RECORTE_ORIGINAL]   # para interpretar después
    return r


def xbox(estado):
    cod, txt = pedir("https://xnotify.xboxlive.com/servicestatusv6/US/en-US")
    if cod != 200:
        raise Falla(f"estado de Xbox: código {cod}")
    general = re.findall(r"<Overall><State>(.*?)</State>", txt)
    estados = sorted(set(re.findall(r"<Status><Name>(.*?)</Name>", txt)))
    if not general:
        raise Falla("el estado de Xbox llegó con un formato desconocido")
    r = {"ok": all(x == "None" for x in general + estados), "general": general, "estados": estados}
    if not r["ok"]:
        r["original"] = txt[:RECORTE_ORIGINAL]   # para interpretar después el formato de una caída
    return r


def youtube_trailers(estado):
    """Tarea 6.2: visitas, me gusta y comentarios de los videos oficiales de GTA VI, por su
    enlace fijo (sin búsqueda). 1 unidad. Un video borrado u oculto simplemente no aparece."""
    clave = os.environ.get("YOUTUBE_API_KEY", "")
    if not clave:
        raise Falla("falta la clave de YouTube")
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode(
        {"part": "snippet,statistics", "id": ",".join(YOUTUBE_TRAILERS), "key": clave}))
    if cod != 200:
        raise Falla(f"tráilers de YouTube: código {cod}. {_mensaje_youtube(txt)}")
    videos = []
    for v in json.loads(txt).get("items", []):
        sn, st = v.get("snippet", {}), v.get("statistics", {})
        videos.append({"id": v["id"], "titulo": sn.get("title", ""), "canal": sn.get("channelTitle", ""),
                       "publicado": sn.get("publishedAt"),
                       "visitas": int(st["viewCount"]) if "viewCount" in st else None,
                       "me_gusta": int(st["likeCount"]) if "likeCount" in st else None,
                       "comentarios": int(st["commentCount"]) if "commentCount" in st else None})
    if not videos:
        raise Falla("YouTube no devolvió ninguno de los tráilers")
    return {"unidades": 1, "pedidos": len(YOUTUBE_TRAILERS), "videos": videos}


KICK_FOTOS = "https://files.kick.com/"


def _foto_kick(directo):
    """{"foto": url} si el directo trae una foto de perfil de files.kick.com; si no, {}."""
    url = (directo.get("broadcaster_user") or {}).get("profile_picture")
    return {"foto": url} if isinstance(url, str) and url.startswith(KICK_FOTOS) and len(url) <= 300 else {}


def _cabeceras_kick():
    """Cabeceras con una clave temporal de la app de Bruno en Kick (nunca se guarda ni se imprime)."""
    cid = os.environ.get("KICK_CLIENT_ID", "")
    sec = os.environ.get("KICK_CLIENT_SECRET", "")
    if not cid or not sec:
        raise Falla("faltan las claves de Kick")
    cuerpo = urllib.parse.urlencode({"grant_type": "client_credentials", "client_id": cid, "client_secret": sec}).encode()
    cod, txt = pedir("https://id.kick.com/oauth/token", {"Content-Type": "application/x-www-form-urlencoded"}, cuerpo)
    if cod != 200:
        raise Falla(f"clave temporal de Kick: código {cod}")
    try:
        return {"Authorization": "Bearer " + json.loads(txt)["access_token"], "Accept": "application/json"}
    except (ValueError, KeyError):
        raise Falla("clave temporal de Kick: respuesta inesperada") from None


def kick(estado):
    """Tarea 6.6: espectadores de GTA VI en Kick (API oficial, clave temporal de la app de Bruno).
    Suma el público de todos los directos de la categoría y guarda los de más público."""
    cab = _cabeceras_kick()
    directos, cursor, completo = [], "", False
    for _ in range(KICK_PAGINAS_MAX):
        url = f"https://api.kick.com/public/v2/livestreams?category_id={KICK_CATEGORIA}&limit=1000"
        if cursor:
            url += "&cursor=" + urllib.parse.quote(cursor)
        d = pedir_json(url, "directos de Kick", cab)
        directos += d.get("data") or []
        cursor = (d.get("pagination") or {}).get("next_cursor") or ""
        if not cursor:
            completo = True
            break
    directos.sort(key=lambda x: x.get("viewer_count", 0), reverse=True)
    # Tarea 9.10: la lista de directos ya trae la foto de perfil (broadcaster_user.profile_picture;
    # verificado el 2026-11-17: 221 de 221 directos). Solo se guarda si es de files.kick.com: las fotos
    # por defecto de Kick están en kick.com y la página ya dibuja su propio reemplazo.
    canales = [{"canal": (x.get("channel") or {}).get("slug", ""), "espectadores": x.get("viewer_count", 0),
                "idioma": x.get("language_code", ""),
                **_foto_kick(x)} for x in directos[:KICK_CANALES]]
    return {"categoria": KICK_CATEGORIA, "espectadores": sum(x.get("viewer_count", 0) for x in directos),
            "transmisiones": len(directos), "completo": completo, "canales": canales}


def kick_ranking(estado):
    """GTA frente a lo más visto en Kick (pedido de Bruno, 2026-11-18). Kick no tiene una lista
    de categorías más vistas (verificado el 18 nov: /categories no trae espectadores), pero su
    lista de directos sí trae la categoría de cada uno: se leen TODOS los directos en vivo de
    Kick y se suma el público por categoría. A diferencia de Twitch, es la cifra completa de
    cada categoría, no una aproximación. Si no alcanzan las páginas, "completo" es False."""
    cab = _cabeceras_kick()
    vistos, cursor, completo, paginas = {}, "", False, 0
    for _ in range(KICK_RANKING_PAGINAS_MAX):
        url = "https://api.kick.com/public/v2/livestreams?limit=1000"
        if cursor:
            url += "&cursor=" + urllib.parse.quote(cursor)
        d = pedir_json(url, "directos de Kick (ranking)", cab)
        paginas += 1
        for x in d.get("data") or []:
            vistos.setdefault(x.get("id"), x)   # por si un directo se repite entre páginas
        cursor = (d.get("pagination") or {}).get("next_cursor") or ""
        if not cursor or not d.get("data"):
            completo = True
            break
    suma, cuantos, nombres = {}, {}, {}
    for x in vistos.values():
        c = x.get("category") or {}
        if not isinstance(c.get("id"), int):
            continue
        suma[c["id"]] = suma.get(c["id"], 0) + (x.get("viewer_count") or 0)
        cuantos[c["id"]] = cuantos.get(c["id"], 0) + 1
        nombres[c["id"]] = str(c.get("name") or "")[:80]
    if not suma:
        raise Falla("Kick no devolvió directos con categoría")
    orden = sorted(suma, key=lambda i: suma[i], reverse=True)
    puesto = {i: n + 1 for n, i in enumerate(orden)}
    ids = orden[:KICK_COMPARAR]
    for extra in (KICK_CATEGORIA, KICK_GTA5):
        if extra not in ids and extra in suma:
            ids.append(extra)
    return {"directos": len(vistos), "paginas": paginas, "completo": completo, "categorias": len(suma),
            "puesto_gta6": puesto.get(KICK_CATEGORIA), "puesto_gta5": puesto.get(KICK_GTA5),
            "comparadas": [{"id": i, "nombre": nombres[i], "puesto": puesto[i], "espectadores": suma[i],
                            "directos": cuantos[i]} for i in ids]}


FUENTES = {
    "twitch": twitch,
    "kick": kick,
    "youtube": youtube,
    "youtube_es": youtube_es,
    "youtube_largos": youtube_largos,
    "noticias": noticias,
    "twitch_ranking": twitch_ranking,
    "kick_ranking": kick_ranking,
    "youtube_tendencias": youtube_tendencias,
    "youtube_trailers": youtube_trailers,
    "playstation": playstation,
    "xbox": xbox,
    "trends": trends,   # al final: si Google pide esperar (429), el reintento no atrasa a las demás
}
