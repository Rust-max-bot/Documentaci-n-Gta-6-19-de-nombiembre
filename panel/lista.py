"""Lista única de videos para el panel (Fase 10, tarea 10.2).

Junta, una sola vez cada uno, los videos de YouTube que la página muestra hoy o mostraría con
otras marcas: Global, Español, Tendencias (Chile y EE. UU.) y los récords "Video/Short más
visto". Se calcula sin marcas (para ver los marcados y poder deshacer), con las publicadas y con
las del borrador (para ver los que entran en el lugar de los marcados). Desde la 10.3 trae
también los que el filtro automático descarta, para rescatarlos. Solo lee datos/: no escribe nada.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "recolector"))
import generar_web  # noqa: E402
import marcas  # noqa: E402

LUGARES = {
    "global": "Global",
    "es": "Español",
    "tend_CL": "Tendencias Chile",
    "tend_US": "Tendencias EE. UU.",
    "record_video": "Récord video",
    "record_short": "Récord Short",
    "descartado": "Descartado por el filtro",
}


def armar(medidas, *juegos):
    """Devuelve la lista de videos, de más a menos visto, con dónde sale cada uno, juntando lo que
    se vería sin marcas y con cada juego dado: (marcados, rescatados), cada uno {código: ...}."""
    vistos = {}

    def anotar(v, lugar, **extra):
        e = vistos.setdefault(v["id"], {"id": v["id"], "titulo": v.get("titulo", ""), "canal": v.get("canal", ""),
                                        "lugares": [], "visitas": None, "short": None})
        if lugar not in e["lugares"]:
            e["lugares"].append(lugar)
        for k, valor in extra.items():
            if valor is not None and e.get(k) is None:
                e[k] = valor

    en_base = set()   # los que la página muestra sin marcas ni rescates (para saber cuáles están "fuera")
    for n, (marcados, rescatados) in enumerate((({}, {}),) + juegos):
        if n == 1:
            en_base = set(vistos)
        d = generar_web.convertir(medidas, marcados=marcados, rescatados=rescatados)
        for clave, lugar in (("youtube", "global"), ("youtube_es", "es")):
            for v in d[clave]:
                anotar(v, lugar, visitas=(v["serie"][-1]["visitas"] if v.get("serie") else None), short=v.get("short"))
        for r, reg in ((d.get("comparacion") or {}).get("youtube") or {}).get("regiones", {}).items():
            for v in reg["gta"]:
                anotar(v, f"tend_{r}", visitas=v.get("visitas"))
        for tipo in ("video", "short"):
            for v in d["records_youtube"][tipo]:
                anotar(v, f"record_{tipo}", visitas=v.get("visitas"), short=(tipo == "short"))
    if not juegos:
        en_base = set(vistos)
    for v in descartados(medidas):   # 10.3: los que el filtro automático deja fuera, para rescatarlos
        anotar(v, "descartado", visitas=v["visitas"], short=v["short"])
        e = vistos[v["id"]]
        e["reciente"] = v["reciente"]
        # "fuera": sin rescatarlo no sale en ninguna parte de la página. Un descartado de Global
        # que igual sale en Español o en Tendencias no está fuera: se puede marcar.
        e["fuera"] = v["id"] not in en_base
        # Medido solo antes del 15 nov (sin tipo video/Short): rescatarlo no cambia nada.
        e["sin_efecto"] = not v["reciente"] and v["short"] is None
    lista = list(vistos.values())
    for e in lista:
        e["miniatura"] = f"https://i.ytimg.com/vi/{e['id']}/mqdefault.jpg"
        e["lugares"].sort(key=list(LUGARES).index)
    lista.sort(key=lambda e: e["visitas"] or 0, reverse=True)
    return lista


def descartados(medidas):
    """Videos de Global (todo el historial) y de Español (la última medición, solo en español)
    que el filtro automático no deja pasar. "reciente": está en la última medición, así que si se
    rescata puede salir en una lista; si no, solo cuenta para los récords (decisión de Bruno)."""
    filtro = generar_web.leer_filtro(generar_web.videos_conocidos(medidas))
    filtro["marcados"], filtro["rescatados"] = set(), set()
    ultimo, recientes = {}, set()
    for m in medidas:
        for v in (m.get("youtube") or {}).get("videos", []) + (m.get("youtube_largos") or {}).get("videos", []):
            if isinstance(v.get("visitas"), int):   # igual que convertir(): sin visitas, no cuenta
                ultimo[v["id"]] = v
    ult_yt = next((m for m in reversed(medidas) if (m.get("youtube") or {}).get("videos")), None)
    ult_lg = next((m for m in reversed(medidas) if (m.get("youtube_largos") or {}).get("videos")), None)
    ult_es = next((m for m in reversed(medidas) if (m.get("youtube_es") or {}).get("videos")), None)
    for um, clave in ((ult_yt, "youtube"), (ult_lg, "youtube_largos")):
        recientes.update(v["id"] for v in (um or {}).get(clave, {}).get("videos", []))
    for v in (ult_es or {}).get("youtube_es", {}).get("videos", []):
        if re.match(r"es\b", v.get("idioma") or "", re.I) and isinstance(v.get("visitas"), int):
            ultimo.setdefault(v["id"], v)
            recientes.add(v["id"])
    salida = []
    for i, v in ultimo.items():
        if not generar_web.pasa_filtro(v, filtro):
            salida.append({"id": i, "titulo": v.get("titulo", ""), "canal": v.get("canal", ""),
                           "visitas": v.get("visitas") if isinstance(v.get("visitas"), int) else None,
                           "short": v.get("short") if isinstance(v.get("short"), bool) else None,
                           "reciente": i in recientes})
    return salida


def conocidos(raiz=RAIZ):
    """Los códigos de video que aparecen en datos/ (para validar antes de publicar)."""
    return generar_web.videos_conocidos(generar_web.leer_mediciones(Path(raiz) / "datos"))


def leer_todo(raiz=RAIZ, borrador=None):
    """Lo que el panel necesita al abrir: la lista, las marcas publicadas y los motivos."""
    raiz = Path(raiz)
    medidas = generar_web.leer_mediciones(raiz / "datos")
    archivo = raiz / "recolector" / marcas.ARCHIVO.name
    pub = marcas.leer_todo(archivo)   # valida (también claves repetidas) antes de usarlo
    contenido = json.loads(archivo.read_text(encoding="utf-8")) if archivo.exists() else {"videos": {}}
    juegos = [(pub["marcados"], pub["rescatados"])]
    if isinstance(borrador, dict):
        bm, br = borrador.get("videos"), borrador.get("rescatados")
        if isinstance(bm, dict) and isinstance(br or {}, dict) and (bm or br):
            juegos.append((bm, br or {}))
    videos = armar(medidas, *juegos)   # aquí generar_web valida filtro_videos.json (aborta si está mal)
    auto = json.loads(generar_web.FILTRO.read_text(encoding="utf-8"))
    return {
        "videos": videos,
        "publicado": {k: contenido.get(k, {}) for k in ("videos", "revisados", "rescatados", "configuraciones")},
        "filtro_automatico": {k: auto.get(k) for k in ("modo", "excluir_palabras")},
        "fijas": marcas.FIJAS,
        "modos": list(marcas.MODOS),
        "motivos": marcas.MOTIVOS,
        "lugares": LUGARES,
    }
