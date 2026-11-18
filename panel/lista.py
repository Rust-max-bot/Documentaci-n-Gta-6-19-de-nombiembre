"""Lista única de videos para el panel (Fase 10, tarea 10.2).

Junta, una sola vez cada uno, los videos de YouTube que la página muestra hoy o mostraría con
otras marcas: Global, Español, Tendencias (Chile y EE. UU.) y los récords "Video/Short más
visto". Se calcula sin marcas (para ver los marcados y poder deshacer), con las publicadas y con
las del borrador (para ver los que entran en el lugar de los marcados). Los videos que el filtro
automático descarta llegan en la 10.3. Solo lee datos/: no escribe nada.
"""
import json
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
}


def armar(medidas, *juegos_de_marcas):
    """Devuelve la lista de videos, de más a menos visto, con dónde sale cada uno, juntando lo que
    se vería sin marcas y con cada juego de marcas dado ({código: ...})."""
    vistos = {}

    def anotar(v, lugar, **extra):
        e = vistos.setdefault(v["id"], {"id": v["id"], "titulo": v.get("titulo", ""), "canal": v.get("canal", ""),
                                        "lugares": [], "visitas": None, "short": None})
        if lugar not in e["lugares"]:
            e["lugares"].append(lugar)
        for k, valor in extra.items():
            if valor is not None and e.get(k) is None:
                e[k] = valor

    for marcados in ({},) + juegos_de_marcas:
        d = generar_web.convertir(medidas, marcados=marcados)
        for clave, lugar in (("youtube", "global"), ("youtube_es", "es")):
            for v in d[clave]:
                anotar(v, lugar, visitas=(v["serie"][-1]["visitas"] if v.get("serie") else None), short=v.get("short"))
        for r, reg in ((d.get("comparacion") or {}).get("youtube") or {}).get("regiones", {}).items():
            for v in reg["gta"]:
                anotar(v, f"tend_{r}", visitas=v.get("visitas"))
        for tipo in ("video", "short"):
            for v in d["records_youtube"][tipo]:
                anotar(v, f"record_{tipo}", visitas=v.get("visitas"), short=(tipo == "short"))
    lista = list(vistos.values())
    for e in lista:
        e["miniatura"] = f"https://i.ytimg.com/vi/{e['id']}/mqdefault.jpg"
        e["lugares"].sort(key=list(LUGARES).index)
    lista.sort(key=lambda e: e["visitas"] or 0, reverse=True)
    return lista


def conocidos(raiz=RAIZ):
    """Los códigos de video que aparecen en datos/ (para validar antes de publicar)."""
    return generar_web.videos_conocidos(generar_web.leer_mediciones(Path(raiz) / "datos"))


def leer_todo(raiz=RAIZ, borrador=None):
    """Lo que el panel necesita al abrir: la lista, las marcas publicadas y los motivos."""
    raiz = Path(raiz)
    medidas = generar_web.leer_mediciones(raiz / "datos")
    archivo = raiz / "recolector" / marcas.ARCHIVO.name
    publicadas = marcas.leer(archivo)   # valida (también claves repetidas) antes de usarlo
    contenido = json.loads(archivo.read_text(encoding="utf-8")) if archivo.exists() else {"videos": {}}
    del_borrador = (borrador or {}).get("videos") if isinstance(borrador, dict) else None
    juegos = (publicadas,) + ((del_borrador,) if isinstance(del_borrador, dict) and del_borrador else ())
    return {
        "videos": armar(medidas, *juegos),
        "publicado": {"videos": contenido.get("videos", {}), "revisados": contenido.get("revisados", {})},
        "motivos": marcas.MOTIVOS,
        "lugares": LUGARES,
    }
