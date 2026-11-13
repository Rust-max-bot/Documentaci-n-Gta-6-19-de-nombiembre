"""Comprobaciones antes de guardar una medición (regla "datos por programa").

Si algo no cuadra, se lanza Invalida y el recolector se detiene SIN escribir nada en datos/.
GitHub marca la ejecución como fallida y avisa por correo.
"""
import re
from datetime import datetime, timedelta, timezone

ISO = re.compile(r"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$")
TAMANO_MAX_LINEA = 300_000        # bytes; una medición normal pesa unos pocos KB
VERSION = 1


class Invalida(Exception):
    pass


def exigir(condicion, mensaje):
    if not condicion:
        raise Invalida(mensaje)


def es_entero(x, minimo=0):
    return isinstance(x, int) and not isinstance(x, bool) and x >= minimo


def es_iso(x):
    if not isinstance(x, str) or not ISO.match(x):
        return False
    try:
        datetime.strptime(x, "%Y-%m-%dT%H:%M:%SZ")
        return True
    except ValueError:
        return False


def a_fecha(x):
    return datetime.strptime(x, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def _twitch(r):
    exigir(es_entero(r.get("espectadores")), "Twitch: espectadores no es un número válido")
    exigir(es_entero(r.get("transmisiones")), "Twitch: transmisiones no es un número válido")
    exigir(isinstance(r.get("completo"), bool), "Twitch: falta 'completo'")
    canales = r.get("canales")
    exigir(isinstance(canales, list) and len(canales) <= 20, "Twitch: lista de canales inválida")
    exigir(r["transmisiones"] >= len(canales), "Twitch: hay más canales que transmisiones")
    for c in canales:
        exigir(isinstance(c.get("login"), str) and c["login"], "Twitch: canal sin nombre")
        exigir(es_entero(c.get("espectadores")), "Twitch: espectadores de un canal inválidos")
        exigir("foto" not in c or (isinstance(c["foto"], str) and c["foto"].startswith("https://static-cdn.jtvnw.net/")),
               "Twitch: foto de perfil con dirección inesperada")
    exigir(sum(c["espectadores"] for c in canales) <= r["espectadores"], "Twitch: los canales suman más que el total")


def _youtube(r):
    exigir(es_entero(r.get("unidades"), 1), "YouTube: faltan las unidades gastadas")
    videos = r.get("videos")
    exigir(isinstance(videos, list) and 0 < len(videos) <= 50, "YouTube: lista de videos inválida")
    ids = [v.get("id") for v in videos]
    exigir(all(isinstance(i, str) and len(i) == 11 for i in ids), "YouTube: id de video inválido")
    exigir(len(set(ids)) == len(ids), "YouTube: videos repetidos")
    for v in videos:
        for campo in ("visitas", "me_gusta", "comentarios"):
            exigir(v.get(campo) is None or es_entero(v[campo]), f"YouTube: '{campo}' inválido")
        exigir(isinstance(v.get("titulo"), str), "YouTube: video sin título")


def _trends(r):
    puntos = r.get("puntos")
    exigir(isinstance(puntos, list) and 0 < len(puntos) <= 24, "Trends: lista de puntos inválida")
    for p in puntos:
        exigir(es_iso(p.get("t")), "Trends: hora inválida")
        exigir(es_entero(p.get("interes")) and p["interes"] <= 100, "Trends: interés fuera de 0-100")
    horas = [p["t"] for p in puntos]
    exigir(horas == sorted(horas) and len(set(horas)) == len(horas), "Trends: horas desordenadas o repetidas")


def _noticias(r):
    exigir(es_entero(r.get("en_fuente"), 1), "Noticias: 'en_fuente' inválido")
    nuevas = r.get("nuevas")
    exigir(isinstance(nuevas, list) and len(nuevas) <= r["en_fuente"], "Noticias: lista inválida")
    for n in nuevas:
        exigir(isinstance(n.get("titulo"), str) and n["titulo"], "Noticias: titular vacío")
        exigir(isinstance(n.get("url"), str) and n["url"].startswith("http"), "Noticias: enlace inválido")
        exigir(n.get("t") is None or es_iso(n["t"]), "Noticias: fecha inválida")


def _reddit(r):
    exigir(es_entero(r.get("en_fuente"), 1), "Reddit: 'en_fuente' inválido")
    nuevas = r.get("nuevas")
    exigir(isinstance(nuevas, list) and len(nuevas) <= r["en_fuente"], "Reddit: lista inválida")
    ids = [n.get("id") for n in nuevas]
    exigir(all(isinstance(i, str) and i.startswith("t3_") for i in ids), "Reddit: id de publicación inválido")
    exigir(len(set(ids)) == len(ids), "Reddit: publicaciones repetidas")
    for n in nuevas:
        exigir(isinstance(n.get("titulo"), str) and n["titulo"], "Reddit: publicación sin título")
        exigir(isinstance(n.get("url"), str) and n["url"].startswith("https://www.reddit.com/"), "Reddit: enlace inválido")
        exigir(n.get("t") is None or es_iso(n["t"]), "Reddit: fecha inválida")


def _twitch_ranking(r):
    exigir(es_entero(r.get("leidas"), 1), "Ranking de Twitch: 'leidas' inválido")
    for campo in ("puesto_gta6", "puesto_gta5"):
        exigir(r.get(campo) is None or (es_entero(r[campo], 1) and r[campo] <= r["leidas"]),
               f"Ranking de Twitch: '{campo}' inválido")
    top = r.get("top")
    exigir(isinstance(top, list) and 0 < len(top) <= 10, "Ranking de Twitch: lista 'top' inválida")
    exigir([g.get("puesto") for g in top] == list(range(1, len(top) + 1)), "Ranking de Twitch: puestos desordenados")
    for g in top:
        exigir(isinstance(g.get("id"), str) and g["id"].isdigit(), "Ranking de Twitch: id de categoría inválido")
        exigir(isinstance(g.get("nombre"), str), "Ranking de Twitch: categoría sin nombre")
    comparadas = r.get("comparadas")
    exigir(isinstance(comparadas, list) and 0 < len(comparadas) <= 7, "Ranking de Twitch: lista 'comparadas' inválida")
    ids = [c.get("id") for c in comparadas]
    exigir(len(set(ids)) == len(ids), "Ranking de Twitch: categorías repetidas")
    for c in comparadas:
        exigir(isinstance(c.get("id"), str) and c["id"].isdigit(), "Ranking de Twitch: id inválido en 'comparadas'")
        exigir(c.get("puesto") is None or es_entero(c["puesto"], 1), "Ranking de Twitch: puesto inválido en 'comparadas'")
        exigir(es_entero(c.get("espectadores_top100")), "Ranking de Twitch: espectadores inválidos")
        exigir(es_entero(c.get("transmisiones_top100")) and c["transmisiones_top100"] <= 100,
               "Ranking de Twitch: transmisiones inválidas")


def _youtube_tendencias(r):
    exigir(es_entero(r.get("unidades"), 1), "Tendencias de YouTube: faltan las unidades gastadas")
    regiones = r.get("regiones")
    exigir(isinstance(regiones, dict) and regiones, "Tendencias de YouTube: faltan las regiones")
    for region, d in regiones.items():
        exigir(isinstance(region, str) and len(region) == 2, "Tendencias de YouTube: región inválida")
        exigir(es_entero(d.get("en_lista"), 1) and d["en_lista"] <= 50, f"Tendencias de YouTube ({region}): 'en_lista' inválido")
        exigir(isinstance(d.get("gta"), list), f"Tendencias de YouTube ({region}): 'gta' no es una lista")
        for v in [d.get("primero")] + d["gta"]:
            exigir(isinstance(v, dict) and isinstance(v.get("id"), str) and len(v["id"]) == 11,
                   f"Tendencias de YouTube ({region}): id inválido")
            exigir(es_entero(v.get("puesto"), 1) and v["puesto"] <= d["en_lista"], f"Tendencias de YouTube ({region}): puesto inválido")
            exigir(isinstance(v.get("titulo"), str), f"Tendencias de YouTube ({region}): video sin título")
            exigir(v.get("visitas") is None or es_entero(v["visitas"]), f"Tendencias de YouTube ({region}): visitas inválidas")
    ro = r.get("rockstar")
    exigir(isinstance(ro, dict) and isinstance(ro.get("id"), str) and ro["id"].startswith("UC"),
           "Tendencias de YouTube: canal de Rockstar inválido")
    for campo in ("suscriptores", "visitas", "videos"):
        exigir(ro.get(campo) is None or es_entero(ro[campo]), f"Tendencias de YouTube: '{campo}' de Rockstar inválido")


def _servidor(r):
    exigir(isinstance(r.get("ok"), bool), "Servidores: falta 'ok'")


CHEQUEOS = {
    "twitch": _twitch,
    "youtube": _youtube,
    "trends": _trends,
    "noticias": _noticias,
    "reddit": _reddit,
    "twitch_ranking": _twitch_ranking,
    "youtube_tendencias": _youtube_tendencias,
    "playstation": _servidor,
    "xbox": _servidor,
}


def medicion(m, linea, ahora, fuentes, secretos, ultima_t):
    """Comprueba la medición completa y la línea de texto que se va a guardar."""
    exigir(m.get("v") == VERSION, "versión de formato inesperada")
    exigir(es_iso(m.get("t")), "la hora de la medición no tiene formato UTC")
    t = a_fecha(m["t"])
    exigir(abs(t - ahora) < timedelta(minutes=10), "la hora de la medición no es la de ahora")
    exigir(ultima_t is None or m["t"] > ultima_t, "ya hay una medición igual o más nueva en el archivo")
    exigir("ejemplo" not in m, "una medición real no puede llevar la marca de ejemplo")
    exigir("\n" not in linea and "\r" not in linea, "la línea tiene saltos de línea")
    exigir(len(linea.encode("utf-8")) <= TAMANO_MAX_LINEA, "la medición pesa demasiado")
    for s in secretos:
        exigir(not s or s not in linea, "la medición contiene una clave: no se guarda")   # nunca se muestra cuál
    for nombre in fuentes:
        exigir(isinstance(m.get(nombre), dict), f"falta la fuente '{nombre}'")
        r = m[nombre]
        if "error" in r:
            exigir(isinstance(r["error"], str) and r["error"], f"{nombre}: error sin mensaje")
            exigir(set(r) <= {"error", "original"}, f"{nombre}: un hueco no puede traer datos")
        else:
            CHEQUEOS[nombre](r)
