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
RECORTE_ORIGINAL = 30000          # caracteres de la respuesta original que se guardan si hay problemas


def twitch(estado):
    cid = os.environ.get("TWITCH_CLIENT_ID", "")
    sec = os.environ.get("TWITCH_CLIENT_SECRET", "")
    if not cid or not sec:
        raise Falla("faltan las claves de Twitch")
    cuerpo = urllib.parse.urlencode({"client_id": cid, "client_secret": sec, "grant_type": "client_credentials"}).encode()
    token = pedir_json("https://id.twitch.tv/oauth2/token", "token de Twitch", datos=cuerpo)
    cab = {"Client-Id": cid, "Authorization": "Bearer " + token["access_token"]}

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
    return {
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
        } for s in lista[:TWITCH_CANALES]],
    }


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


FUENTES = {
    "twitch": twitch,
    "youtube": youtube,
    "trends": trends,
    "noticias": noticias,
    "playstation": playstation,
    "xbox": xbox,
}
