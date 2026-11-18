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
        marcados = marcas.leer()
    except marcas.MarcasMal as e:
        abortar(f"{marcas.ARCHIVO.name}: {e}")
    for codigo in marcas.desconocidos(marcados, conocidos):
        print(f"AVISO: {marcas.ARCHIVO.name}: el video {codigo!r} no aparece en las búsquedas de YouTube de estas mediciones: no esconde nada (¿código mal copiado?)")
    return {"modo": f["modo"], "palabras": [x.strip().lower() for x in palabras], "marcados": set(marcados)}


def gta_visibles(region, filtro):
    """Los videos de GTA de una región de Tendencias, sin los que Bruno marcó (Fase 10). Lo usan
    el conteo de cada medición y la lista de la última: así los dos siempre cuadran."""
    return [v for v in region["gta"] if v["id"] not in filtro["marcados"]]


def pasa_filtro(v, filtro):
    if v["id"] in filtro["marcados"]:   # "el de Rust": los que Bruno marcó a mano no se muestran
        return False
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


def convertir(medidas, marcados=None):
    """marcados: solo para el panel de videos (10.2), que necesita ver la página "como si" las
    marcas fueran otras. None = las de recolector/marcas_videos.json."""
    filtro = leer_filtro(videos_conocidos(medidas))
    if marcados is not None:
        filtro["marcados"] = set(marcados)
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
    comparacion = None
    if ult_rk or ult_yt or ult_kr:
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

    ultima_es = next((m["youtube_es"]["videos"] for m in reversed(medidas) if m.get("youtube_es", {}).get("videos")), [])
    youtube_es = [{
        "id": v["id"], "titulo": ultimo_es[v["id"]]["titulo"], "canal": ultimo_es[v["id"]]["canal"],
        "miniatura": ultimo_es[v["id"]].get("miniatura", ""), "idioma": ultimo_es[v["id"]].get("idioma"),
        **marca_short(ultimo_es[v["id"]]),
        "serie": series_es[v["id"]],
    } for v in elegir_videos([v for v in ultima_es if re.match(r"es\b", ultimo_es.get(v["id"], {}).get("idioma") or "", re.I)],
                             ultimo_es, series_es, filtro)]

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
            "records_youtube": records_youtube,
            "comparacion": comparacion,
            "trailers": sorted(trailers.values(), key=lambda v: v.get("publicado") or "")}   # todos: la página los muestra por páginas (Bruno, 2026-11-13)


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
    escribir(SALIDA, texto)
    escribir(VERSION, json.dumps({"generado": d["generado"]}) + "\n")
    peso_dias = sum(len(t.encode("utf-8")) for t in archivos.values())
    print(f"web/datos.js listo: {len(d['mediciones'])} mediciones (de {medidas[0]['t']} a {medidas[-1]['t']} UTC), "
          f"{len(d['youtube'])} videos, {len(d['noticias_t'])} titulares, "
          f"{len(texto.encode('utf-8')) // 1024} KB; "
          f"{len(archivos)} días en web/dias/ ({peso_dias // 1024} KB, se cargan solo si hacen falta).")


if __name__ == "__main__":
    main()
