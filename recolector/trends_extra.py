"""Tarea 6.1: más estadísticas de Google Trends, pedidas UNA sola vez (no cada hora).

Decisión de Bruno (2026-11-13): se ejecuta una vez entre el 20 y el 25 nov, fuera del
recolector de cada hora, para que un bloqueo de Google (429) no ponga en riesgo la medición
normal de "GTA 6", sobre todo el 19. Antes del 26 nov, porque Trends solo da el detalle
hora por hora de los últimos 7 días.

Hace 5 preguntas a Trends, con una pausa entre una y otra:
  1. paises      en qué países se busca más "GTA 6" (últimos 7 días);
  2. relacionadas qué más busca la gente junto con "GTA 6": las más buscadas y las que
                  están "en aumento" (últimos 7 días);
  3. comparacion "GTA 6" junto a otras palabras, hora por hora, en la misma escala de 0 a 100
                  (últimos 7 días);
  4. historica   GTA V frente a GTA 6, mes a mes, desde 2013 (el lanzamiento de GTA V fue en
                  septiembre de 2013).
  5. pelicula    GTA 6 frente a Avengers: Doomsday, día por día, últimos 90 días (pedido de
                  Bruno, 2026-11-14: en la página va solo esta comparación directa).

Guarda UN archivo nuevo: datos/trends_extra/AAAA-MM-DDTHHMMZ.json (hora UTC de la ejecución).
Nunca sobrescribe uno que ya exista. Si algo no cuadra, se detiene sin escribir nada.
Como el recolector, en datos/ solo escribe desde GitHub; en el PC o para probar:
    python recolector/trends_extra.py --carpeta <carpeta temporal>

Trends no dice cuántas búsquedas hubo: todo es de 0 a 100 dentro de cada pregunta
(100 = el punto más alto de esa pregunta). Por eso los números de dos preguntas distintas
no se pueden comparar entre sí. Solo usa la biblioteca estándar.
"""
import http.cookiejar
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from red import Falla, a_iso, pedir  # noqa: E402
from validar import Invalida, es_entero, es_iso, exigir  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos" / "trends_extra"
VERSION = 1

PALABRA = "GTA 6"
# Palabras elegidas por Bruno (2026-11-13). Trends acepta hasta 5 juntas; "GTA 6" va primera.
# Semana del lanzamiento: GTA 6 al lado de juegos que siempre se buscan (salen del ranking de
# Twitch del 13 nov: GTA V 3.º, Marvel Rivals 4.º, Fortnite 6.º, Minecraft 10.º).
COMPARAR = ("GTA 6", "GTA 5", "Minecraft", "Fortnite", "Marvel Rivals")
# Mes a mes desde 2013: los otros grandes estrenos cercanos. El remake de Ocarina of Time salió
# el 5 nov 2026; Avengers: Doomsday se estrena el 18 dic 2026 (para ver su estreno hay que
# repetir esta pregunta después, por ejemplo en enero).
HISTORICA = ("GTA 6", "GTA 5", "Ocarina of Time", "Avengers Doomsday")
HISTORICA_DESDE = "2013-01-01"
# Día por día (Trends da un punto por día con "today 3-m"): solo el juego y la película.
PELICULA = ("GTA 6", "Avengers Doomsday")
RANGO_PELICULA = "today 3-m"
RANGO_SEMANA = "now 7-d"
PAUSA = 20                       # segundos entre una pregunta y la siguiente
REINTENTOS = (60, 180)           # si Google responde 429, se espera esto y se reintenta
TAMANO_MAX = 500_000             # bytes; el archivo normal pesa unas decenas de KB


def abortar(msg):
    print("ERROR:", msg)
    sys.exit(1)


class Trends:
    """Una sesión con Trends: primero la cookie, después las preguntas."""

    def __init__(self):
        self.ab = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
        self.consultas = 0
        pedir("https://trends.google.com/trends/explore?q=GTA%206&date=now%207-d", abridor=self.ab)  # solo da la cookie

    def _pedir(self, url, nombre):
        for espera in (*REINTENTOS, None):
            self.consultas += 1
            cod, txt = pedir(url, abridor=self.ab)
            if cod == 200:
                return json.loads(txt[txt.index("{"):])   # Trends antepone ")]}'," al JSON
            if cod == 429 and espera is not None:
                print(f"  {nombre}: Google pidió esperar (429); reintento en {espera} s")
                time.sleep(espera)
                continue
            raise Falla(f"{nombre}: código {cod}")

    def widgets(self, palabras, rango):
        req = {"comparisonItem": [{"keyword": p, "geo": "", "time": rango} for p in palabras],
               "category": 0, "property": ""}
        d = self._pedir("https://trends.google.com/trends/api/explore?" + urllib.parse.urlencode(
            {"hl": "es", "tz": 0, "req": json.dumps(req)}), "explore")
        return {w["id"]: w for w in d.get("widgets", [])}

    def datos(self, tipo, w):
        return self._pedir(f"https://trends.google.com/trends/api/widgetdata/{tipo}?" + urllib.parse.urlencode(
            {"hl": "es", "tz": 0, "req": json.dumps(w["request"], separators=(",", ":")), "token": w["token"]}), tipo)


def widget(ws, nombre):
    if nombre not in ws:
        raise Falla(f"Trends no entregó {nombre} (entregó: {', '.join(ws) or 'nada'})")
    return ws[nombre]


def serie(d, palabras):
    linea = d["default"]["timelineData"]
    return [{
        "t": a_iso(datetime.fromtimestamp(int(p["time"]), timezone.utc)),
        "interes": dict(zip(palabras, (int(v) for v in p["value"]))),
        "parcial": bool(p.get("isPartial", False)),
    } for p in linea]


def paises(d):
    return [{"codigo": g["geoCode"], "pais": g["geoName"], "interes": int(g["value"][0])}
            for g in d["default"]["geoMapData"] if g.get("hasData", [True])[0] and int(g["value"][0]) > 0]


def relacionadas(d):
    listas = d["default"]["rankedList"]
    leer = lambda i: [{"busqueda": k["query"], "valor": k["formattedValue"]}   # noqa: E731
                      for k in (listas[i]["rankedKeyword"] if len(listas) > i else [])]
    return {"mas_buscadas": leer(0), "en_aumento": leer(1)}


def preguntar():
    """Hace las 5 preguntas. Devuelve el diccionario que se guarda."""
    t = Trends()
    r = {}
    print("1-2. Países y búsquedas relacionadas de", PALABRA)
    ws = t.widgets([PALABRA], RANGO_SEMANA)
    time.sleep(PAUSA)
    r["paises"] = {"palabra": PALABRA, "rango": RANGO_SEMANA, "lista": paises(t.datos("comparedgeo", widget(ws, "GEO_MAP")))}
    time.sleep(PAUSA)
    r["relacionadas"] = {"palabra": PALABRA, "rango": RANGO_SEMANA,
                         **relacionadas(t.datos("relatedsearches", widget(ws, "RELATED_QUERIES")))}
    time.sleep(PAUSA)
    print("3. Comparación hora por hora:", ", ".join(COMPARAR))
    ws = t.widgets(COMPARAR, RANGO_SEMANA)
    time.sleep(PAUSA)
    r["comparacion"] = {"palabras": list(COMPARAR), "rango": RANGO_SEMANA,
                        "puntos": serie(t.datos("multiline", widget(ws, "TIMESERIES")), COMPARAR)}
    time.sleep(PAUSA)
    rango = f"{HISTORICA_DESDE} {datetime.now(timezone.utc):%Y-%m-%d}"
    print("4. Histórica, mes a mes:", ", ".join(HISTORICA), "|", rango)
    ws = t.widgets(HISTORICA, rango)
    time.sleep(PAUSA)
    r["historica"] = {"palabras": list(HISTORICA), "rango": rango,
                      "puntos": serie(t.datos("multiline", widget(ws, "TIMESERIES")), HISTORICA)}
    time.sleep(PAUSA)
    print("5. Día por día:", ", ".join(PELICULA), "|", RANGO_PELICULA)
    ws = t.widgets(PELICULA, RANGO_PELICULA)
    time.sleep(PAUSA)
    r["pelicula"] = {"palabras": list(PELICULA), "rango": RANGO_PELICULA,
                     "puntos": serie(t.datos("multiline", widget(ws, "TIMESERIES")), PELICULA)}
    r["consultas"] = t.consultas
    return r


def comprobar_serie(s, nombre, minimo):
    puntos = s["puntos"]
    exigir(isinstance(puntos, list) and len(puntos) >= minimo, f"{nombre}: muy pocos puntos ({len(puntos)})")
    horas = [p["t"] for p in puntos]
    exigir(all(es_iso(h) for h in horas), f"{nombre}: hora inválida")
    exigir(horas == sorted(horas) and len(set(horas)) == len(horas), f"{nombre}: horas desordenadas o repetidas")
    valores = [v for p in puntos for v in p["interes"].values()]
    exigir(all(set(p["interes"]) == set(s["palabras"]) for p in puntos), f"{nombre}: faltan palabras en algún punto")
    exigir(all(es_entero(v) and v <= 100 for v in valores), f"{nombre}: interés fuera de 0-100")
    exigir(max(valores) == 100, f"{nombre}: ningún punto llega a 100 (la escala no cuadra)")


def comprobar(r):
    lista = r["paises"]["lista"]
    exigir(len(lista) >= 5, f"países: muy pocos ({len(lista)})")
    exigir(all(isinstance(p["codigo"], str) and len(p["codigo"]) == 2 for p in lista), "países: código inválido")
    exigir(all(es_entero(p["interes"]) and p["interes"] <= 100 for p in lista), "países: interés fuera de 0-100")
    exigir(max(p["interes"] for p in lista) == 100, "países: ningún país llega a 100")
    rel = r["relacionadas"]
    exigir(rel["mas_buscadas"] or rel["en_aumento"], "relacionadas: las dos listas vienen vacías")
    exigir(all(isinstance(k["busqueda"], str) and k["busqueda"] for k in rel["mas_buscadas"] + rel["en_aumento"]),
           "relacionadas: búsqueda vacía")
    comprobar_serie(r["comparacion"], "comparación", 100)    # 7 días por hora: unas 168
    comprobar_serie(r["historica"], "histórica", 100)        # desde 2013 por mes: más de 150
    comprobar_serie(r["pelicula"], "película", 60)           # 90 días, uno por día
    meses = r["historica"]["puntos"]
    exigir(meses[0]["t"] < "2013-02-01T00:00:00Z", "histórica: no empieza en enero de 2013")
    exigir(len(json.dumps(r, ensure_ascii=False)) <= TAMANO_MAX, "el resultado pesa demasiado")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    en_github = os.environ.get("GITHUB_ACTIONS") == "true"
    if "--carpeta" in sys.argv:
        carpeta = Path(sys.argv[sys.argv.index("--carpeta") + 1]).resolve()
        if carpeta == DATOS.resolve() or DATOS.resolve() in carpeta.parents or carpeta == DATOS.parent.resolve():
            abortar("--carpeta no puede ser datos/: para probar, usa una carpeta temporal")
        origen = "prueba"
    elif en_github:
        carpeta, origen = DATOS, "github"
    else:
        abortar("en el PC usa --carpeta <carpeta temporal>; datos/ solo lo escribe GitHub")

    ahora = datetime.now(timezone.utc).replace(microsecond=0)
    archivo = carpeta / f"{ahora:%Y-%m-%dT%H%MZ}.json"
    if archivo.exists():
        abortar(f"{archivo.name} ya existe: no se sobrescribe nada")
    try:
        r = preguntar()
        comprobar(r)
    except (Falla, Invalida, KeyError, IndexError, TypeError, ValueError) as e:
        abortar(f"{type(e).__name__}: {e}. No se guardó nada.")

    salida = {"v": VERSION, "t": a_iso(ahora), "origen": origen, "ejecucion": os.environ.get("GITHUB_RUN_ID"),
              "tarea": "6.1", "nota": "Interés de 0 a 100 dentro de cada pregunta: no se comparan entre preguntas.", **r}
    carpeta.mkdir(parents=True, exist_ok=True)
    archivo.write_text(json.dumps(salida, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")

    print(f"\nGuardado en {archivo} ({r['consultas']} consultas a Trends)")
    print("Países (primeros 10):", ", ".join(f"{p['pais']} {p['interes']}" for p in r["paises"]["lista"][:10]))
    rel = r["relacionadas"]
    print("Más buscadas:", ", ".join(k["busqueda"] for k in rel["mas_buscadas"][:10]))
    print("En aumento:", ", ".join(f"{k['busqueda']} ({k['valor']})" for k in rel["en_aumento"][:10]))
    for nombre in ("comparacion", "historica", "pelicula"):
        s = r[nombre]
        maximos = {p: max(x["interes"][p] for x in s["puntos"]) for p in s["palabras"]}
        print(f"{nombre}: {len(s['puntos'])} puntos, de {s['puntos'][0]['t']} a {s['puntos'][-1]['t']}; máximos {maximos}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
