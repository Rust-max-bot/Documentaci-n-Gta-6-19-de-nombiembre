"""Prueba real de cada fuente de datos. No guarda nada: solo imprime qué responde cada una.

Se ejecuta desde GitHub (workflow "Probar fuentes") para comprobar las claves y ver si
los servidores de GitHub reciben el mismo trato que la sesión en la nube.
Solo usa la biblioteca estándar de Python. Nunca imprime claves ni direcciones con claves.
"""
import http.cookiejar
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone

UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36"
resultados = {}


def pedir(url, cabeceras=None, datos=None, abridor=None, espera=30):
    """Devuelve (codigo, texto). Los errores HTTP no lanzan excepcion."""
    req = urllib.request.Request(url, data=datos, headers={"User-Agent": UA, **(cabeceras or {})})
    try:
        with (abridor.open(req, timeout=espera) if abridor else urllib.request.urlopen(req, timeout=espera)) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def prueba(nombre):
    def envolver(f):
        print(f"\n=== {nombre} ===")
        try:
            resultados[nombre] = f()
        except Exception as e:  # el mensaje podria traer una direccion con clave: solo el tipo
            resultados[nombre] = False
            print(f"FALLO: {type(e).__name__}")
        print("RESULTADO:", "funciona" if resultados[nombre] else "NO funciona")
    return envolver


@prueba("Twitch")
def _():
    cid, sec = os.environ.get("TWITCH_CLIENT_ID", ""), os.environ.get("TWITCH_CLIENT_SECRET", "")
    if not cid or not sec:
        print("Faltan las claves de Twitch")
        return False
    cuerpo = urllib.parse.urlencode({"client_id": cid, "client_secret": sec, "grant_type": "client_credentials"}).encode()
    cod, txt = pedir("https://id.twitch.tv/oauth2/token", datos=cuerpo)
    if cod != 200:
        print("Token: codigo", cod, "| mensaje:", json.loads(txt).get("message", "")[:120])
        return False
    cab = {"Client-Id": cid, "Authorization": "Bearer " + json.loads(txt)["access_token"]}
    print("Token: ok")
    cod, txt = pedir("https://api.twitch.tv/helix/search/categories?" + urllib.parse.urlencode({"query": "Grand Theft Auto VI", "first": 10}), cab)
    cats = json.loads(txt).get("data", [])
    print("Categorias encontradas:", [(c["id"], c["name"]) for c in cats])
    elegida = next((c for c in cats if c["name"].lower() in ("grand theft auto vi", "grand theft auto 6")), None)
    if not elegida:
        print("No hay categoria con el nombre exacto")
        return cod == 200
    total, canales, cursor, paginas = 0, [], None, 0
    while paginas < 20:
        q = {"game_id": elegida["id"], "first": 100}
        if cursor:
            q["after"] = cursor
        cod, txt = pedir("https://api.twitch.tv/helix/streams?" + urllib.parse.urlencode(q), cab)
        d = json.loads(txt)
        for s in d.get("data", []):
            total += s["viewer_count"]
            canales.append((s["viewer_count"], s["user_name"]))
        cursor = d.get("pagination", {}).get("cursor")
        paginas += 1
        if not cursor or not d.get("data"):
            break
    print(f"Categoria: {elegida['name']} (id {elegida['id']}) | transmisiones: {len(canales)} | espectadores: {total} | paginas: {paginas}")
    print("Canales con mas publico:", sorted(canales, reverse=True)[:3])
    return cod == 200


@prueba("YouTube")
def _():
    clave = os.environ.get("YOUTUBE_API_KEY", "")
    if not clave:
        print("Falta la clave de YouTube")
        return False
    desde = (datetime.now(timezone.utc) - timedelta(days=7)).strftime("%Y-%m-%dT%H:%M:%SZ")
    q = {"part": "snippet", "q": "GTA 6", "type": "video", "order": "viewCount", "publishedAfter": desde, "maxResults": 10, "key": clave}
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode(q))
    d = json.loads(txt)
    if cod != 200:
        print("Busqueda: codigo", cod, "|", d.get("error", {}).get("message", "")[:160])
        return False
    ids = [i["id"]["videoId"] for i in d.get("items", [])]
    print("Busqueda: ok,", len(ids), "videos (cuesta 100 unidades de las 10.000 diarias)")
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode({"part": "snippet,statistics", "id": ",".join(ids), "key": clave}))
    d = json.loads(txt)
    if cod != 200:
        print("Estadisticas: codigo", cod, "|", d.get("error", {}).get("message", "")[:160])
        return False
    for v in d.get("items", [])[:5]:
        print("  ", v["statistics"].get("viewCount"), "visitas |", v["snippet"]["channelTitle"], "|", v["snippet"]["title"][:70])
    return bool(ids)


@prueba("Google Trends")
def _():
    ab = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    cod, _t = pedir("https://trends.google.com/trends/explore?q=GTA%206&date=now%207-d", abridor=ab)
    print("Paso 1 (cookie): codigo", cod, "(429 aqui es normal)")
    req = {"comparisonItem": [{"keyword": "GTA 6", "geo": "", "time": "now 7-d"}], "category": 0, "property": ""}
    cod, txt = pedir("https://trends.google.com/trends/api/explore?" + urllib.parse.urlencode({"hl": "es", "tz": 180, "req": json.dumps(req)}), abridor=ab)
    print("Paso 2 (explore): codigo", cod)
    if cod != 200:
        return False
    w = next(x for x in json.loads(txt[txt.index("{"):])["widgets"] if x["id"] == "TIMESERIES")
    cod, txt = pedir("https://trends.google.com/trends/api/widgetdata/multiline?" + urllib.parse.urlencode(
        {"hl": "es", "tz": 180, "req": json.dumps(w["request"], separators=(",", ":")), "token": w["token"]}), abridor=ab)
    print("Paso 3 (serie): codigo", cod)
    if cod != 200:
        return False
    puntos = json.loads(txt[txt.index("{"):])["default"]["timelineData"]
    print("Puntos:", len(puntos), "| ultimo:", puntos[-1]["formattedTime"], puntos[-1]["value"])
    return len(puntos) > 0


@prueba("Titulares (Google Noticias)")
def _():
    cod, txt = pedir("https://news.google.com/rss/search?q=%22GTA+6%22&hl=es-419&gl=CL&ceid=CL:es-419")
    items = ET.fromstring(txt).findall(".//item") if cod == 200 else []
    print("Codigo", cod, "| titulares:", len(items))
    for i in items[:2]:
        print("  ", i.findtext("pubDate"), "|", (i.findtext("title") or "")[:80])
    return len(items) > 0


@prueba("Estado de PlayStation")
def _():
    cod, txt = pedir("https://status.playstation.com/data/statuses/region/SCEA.json")
    d = json.loads(txt)
    cl = next((c for c in d["countries"] if c["countryCode"] == "CL"), None)
    print("Codigo", cod, "| estado region:", d["status"], "| Chile:", [(s["serviceName"], s.get("status")) for s in cl["services"]] if cl else "no esta")
    return cod == 200


@prueba("Estado de Xbox")
def _():
    cod, txt = pedir("https://xnotify.xboxlive.com/servicestatusv6/US/en-US")
    print("Codigo", cod, "| estado general:", re.findall(r"<Overall><State>(.*?)</State>", txt), "| estados:", sorted(set(re.findall(r"<Status><Name>(.*?)</Name>", txt))))
    return cod == 200


@prueba("Estado de Rockstar")
def _():
    cod, txt = pedir("https://support.rockstargames.com/servicestatus", espera=20)
    # El título de la página dice el estado general (por ejemplo "All services operational").
    print("Codigo", cod, "| tamano:", len(txt), "| titulo:", re.findall(r"<title[^>]*>(.*?)</title>", txt, re.S)[:1])
    return cod == 200


@prueba("Tráilers oficiales de GTA VI (tarea 6.2)")
def _():
    # Busca en el canal de Rockstar los tráilers de GTA VI para anotar sus enlaces fijos. La
    # búsqueda cuesta 100 unidades: se hace solo aquí, a mano. El recolector mide después esos
    # videos por su enlace (1 unidad por medición).
    clave = os.environ.get("YOUTUBE_API_KEY", "")
    if not clave:
        print("Falta la clave de YouTube")
        return False
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/channels?" + urllib.parse.urlencode(
        {"part": "id", "forHandle": "@RockstarGames", "key": clave}))
    canal = (json.loads(txt).get("items") or [{}])[0].get("id") if cod == 200 else None
    print("Canal de Rockstar:", canal, "| codigo", cod)
    if not canal:
        return False
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/search?" + urllib.parse.urlencode(
        {"part": "snippet", "channelId": canal, "q": "Grand Theft Auto VI Trailer", "type": "video",
         "order": "viewCount", "maxResults": 15, "key": clave}))
    ids = [i["id"]["videoId"] for i in json.loads(txt).get("items", [])] if cod == 200 else []
    print("Busqueda: codigo", cod, "| videos:", len(ids))
    if not ids:
        return False
    cod, txt = pedir("https://www.googleapis.com/youtube/v3/videos?" + urllib.parse.urlencode(
        {"part": "snippet,statistics", "id": ",".join(ids), "key": clave}))
    for v in json.loads(txt).get("items", []):
        sn, st = v["snippet"], v.get("statistics", {})
        print(f"  {v['id']} | {sn.get('publishedAt')} | {st.get('viewCount')} visitas | {sn.get('channelTitle')} | {sn.get('title')}")
    return cod == 200


# Tarea 6.4: la comparación de cuatro formas de buscar videos en español (unas 400 unidades)
# se hizo una vez el 13 nov (ejecución 43515144506) y se quitó para no gastar cuota en cada
# prueba. Resultado en PLAN.md, "Videos de YouTube en español".


# Reddit (tarea 3.2) no se prueba aquí: Reddit responde 429 ("demasiadas consultas") a la
# segunda consulta seguida desde la misma máquina, y entonces fallaría la prueba del
# recolector, que viene después en el mismo workflow. Resultados del 2026-11-13 (PLAN.md,
# "Reddit"): el JSON sin clave da 403; el RSS con ?limit=100 da 200 con 100 publicaciones.

print("\n=== RESUMEN ===")
for n, ok in resultados.items():
    print(("SI  " if ok else "NO  ") + n)
sys.exit(0)
