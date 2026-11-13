"""Las fuentes de datos del recolector.

Cada fuente es una función independiente que recibe el "estado" (lo que quedó guardado en
mediciones anteriores) y devuelve un diccionario con lo medido. Si algo sale mal, lanza una
excepción: el recolector la anota como hueco y sigue con las demás.

Para añadir una fuente nueva: escribir su función aquí, añadirla a FUENTES al final del
archivo y añadir su comprobación en validar.py. No hace falta tocar las demás.

Las consultas son las mismas que se probaron desde GitHub el 2026-11-12
(probar_fuentes.py). Rockstar no está: no responde a programas; sus caídas se anotan a mano.
"""
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

from red import Falla, a_iso, pedir, pedir_json

TWITCH_CATEGORIA = "1867279146"   # "Grand Theft Auto VI", verificado el 2026-11-12
TWITCH_CANALES = 20               # canales con más público que se guardan en cada medición
TWITCH_PAGINAS_MAX = 60           # 100 transmisiones por página: hasta 6.000 transmisiones
YOUTUBE_BUSQUEDA = "GTA 6"
YOUTUBE_RESULTADOS = 25           # videos nuevos que entrega cada búsqueda
YOUTUBE_SEGUIMIENTO = 50          # máximo de videos cuyas visitas se miden (1 unidad cada 50)
TRENDS_PALABRA = "GTA 6"
TRENDS_PUNTOS = 24                # últimas 24 horas de la serie de 7 días
NOTICIAS_RSS = "https://news.google.com/rss/search?q=%22GTA+6%22&hl=es-419&gl=CL&ceid=CL:es-419"
REDDIT_RSS = "https://www.reddit.com/r/GTA6/new/.rss?limit=100"
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
)
ES_GTA = re.compile(r"\bGTA|grand theft auto|rockstar games", re.I)   # "GTA 6", "GTA6", "GTAV"
# Reddit bloquea su JSON sin clave desde GitHub (403, probado el 2026-11-13); el RSS sí
# responde, pero sin votos ni comentarios. Bruno eligió el RSS (2026-11-13).
REDDIT_ESPERA_429 = 20           # segundos antes del segundo intento si Reddit responde 429
REDDIT_UA = "linux:recuerdo-gta6:v0.1 (proyecto personal, solo lectura)"
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


def youtube(estado):
    clave = os.environ.get("YOUTUBE_API_KEY", "")
    if not clave:
        raise Falla("falta la clave de YouTube")
    desde = a_iso(datetime.now(timezone.utc) - timedelta(days=7))
    q = {"part": "snippet", "q": YOUTUBE_BUSQUEDA, "type": "video", "order": "viewCount",
         "publishedAfter": desde, "maxResults": YOUTUBE_RESULTADOS, "key": clave}
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
        {"part": "snippet,statistics", "id": ",".join(ids), "key": clave}))
    unidades += 1
    if cod != 200:
        raise Falla(f"estadísticas de YouTube: código {cod}. {_mensaje_youtube(txt)}")

    def numero(st, campo):
        return int(st[campo]) if campo in st else None   # None: el canal lo oculta

    videos = []
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
        })
    if not videos:
        raise Falla("YouTube no devolvió las estadísticas de ningún video")
    videos.sort(key=lambda v: v["visitas"] or 0, reverse=True)
    return {"busqueda": YOUTUBE_BUSQUEDA, "unidades": unidades, "videos": videos}


def trends(estado):
    ab = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    pedir("https://trends.google.com/trends/explore?q=GTA%206&date=now%207-d", abridor=ab)  # solo da la cookie
    req = {"comparisonItem": [{"keyword": TRENDS_PALABRA, "geo": "", "time": "now 7-d"}], "category": 0, "property": ""}
    cod, txt = pedir("https://trends.google.com/trends/api/explore?" + urllib.parse.urlencode(
        {"hl": "es", "tz": 0, "req": json.dumps(req)}), abridor=ab)
    if cod != 200:
        raise Falla(f"Google Trends (paso explore): código {cod}")
    widgets = json.loads(txt[txt.index("{"):]).get("widgets", [])
    w = next((x for x in widgets if x.get("id") == "TIMESERIES"), None)
    if not w:
        raise Falla("Google Trends no entregó la serie de tiempo")
    cod, txt = pedir("https://trends.google.com/trends/api/widgetdata/multiline?" + urllib.parse.urlencode(
        {"hl": "es", "tz": 0, "req": json.dumps(w["request"], separators=(",", ":")), "token": w["token"]}), abridor=ab)
    if cod != 200:
        raise Falla(f"Google Trends (paso serie): código {cod}")
    linea = json.loads(txt[txt.index("{"):])["default"]["timelineData"]
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


def reddit(estado):
    """Publicaciones nuevas de r/GTA6 (RSS en formato Atom): título, autor, fecha y enlace."""
    cod, txt = pedir(REDDIT_RSS, {"User-Agent": REDDIT_UA})
    if cod == 429:
        # "Demasiadas consultas": los servidores de GitHub se comparten y Reddit cuenta las
        # consultas por dirección. Se espera un poco y se intenta una sola vez más.
        time.sleep(REDDIT_ESPERA_429)
        cod, txt = pedir(REDDIT_RSS, {"User-Agent": REDDIT_UA})
    if cod != 200:
        raise Falla(f"Reddit: código {cod}")
    atom = "{http://www.w3.org/2005/Atom}"
    try:
        entradas = ET.fromstring(txt).findall(atom + "entry")
    except ET.ParseError:
        raise Falla("Reddit: la respuesta no es un RSS válido") from None
    if not entradas:
        raise Falla("Reddit no devolvió publicaciones")
    nuevas = []
    for e in entradas:
        pid = (e.findtext(atom + "id") or "").strip()
        if not pid or pid in estado["reddit_vistas"]:
            continue   # solo se guardan las publicaciones que no estaban en mediciones anteriores
        enlace = e.find(atom + "link")
        try:
            fecha = a_iso(datetime.fromisoformat(e.findtext(atom + "published") or ""))
        except ValueError:
            fecha = None
        nuevas.append({
            "id": pid,
            "titulo": (e.findtext(atom + "title") or "").strip(),
            "autor": (e.findtext(f"{atom}author/{atom}name") or "").strip() or None,
            "url": enlace.get("href") if enlace is not None else None,
            "t": fecha,
        })
    return {"comunidad": "r/GTA6", "en_fuente": len(entradas), "nuevas": nuevas}


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


FUENTES = {
    "twitch": twitch,
    "youtube": youtube,
    "trends": trends,
    "noticias": noticias,
    "reddit": reddit,
    "twitch_ranking": twitch_ranking,
    "youtube_tendencias": youtube_tendencias,
    "youtube_trailers": youtube_trailers,
    "playstation": playstation,
    "xbox": xbox,
}
