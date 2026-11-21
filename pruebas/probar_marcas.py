"""Prueba de las marcas de videos (Fase 10, tarea 10.1).

Uso:  python pruebas/probar_marcas.py

No toca datos/ ni web/, y no depende de lo que diga hoy recolector/marcas_videos.json: usa un
archivo de marcas propio, temporal, que marca solo _LVLtceZy3I ("Lamine Yamal x GTA 6").
1. La validación (recolector/marcas.py) rechaza archivos mal escritos; el archivo real es válido.
2. Con los datos reales: sin marcas el video sale en Global y en el récord de Shorts; con la
   marca, en ninguno.
3. Con mediciones inventadas solo para la prueba (no se guardan): el video marcado sale de
   Español y de Tendencias (lista y conteo por región); generar_web.py aborta con un archivo de
   marcas mal escrito o con la lista vieja "ocultar".
Termina con código 1 si algo falla.
"""
import json
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "recolector"))
import generar_web  # noqa: E402
import marcas  # noqa: E402

MARCADO = "_LVLtceZy3I"
SOLO_MARCADO = {"videos": {MARCADO: {"motivos": ["no_gta", "ia"], "fecha": "2026-11-18"}}}
SIN_MARCAS = {"videos": {}}
fallos = []


def comprobar(cond, texto):
    print(("  bien  " if cond else "  FALLA ") + texto)
    if not cond:
        fallos.append(texto)


def rechaza(datos, texto, conocidos=None):
    try:
        marcas.validar(datos, conocidos)
    except marcas.MarcasMal as e:
        comprobar(True, f"rechaza {texto} ({e})")
        return
    except Exception as e:   # otro error (TypeError…) también es un fallo: el mensaje no sería claro
        comprobar(False, f"rechaza {texto} con un mensaje claro (salió {type(e).__name__}: {e})")
        return
    comprobar(False, f"rechaza {texto}")


def con_archivo(variable, contenido, funcion):
    """Corre funcion() con un archivo temporal (texto o JSON) en lugar de marcas o del filtro."""
    modulo, nombre = variable
    original = getattr(modulo, nombre)
    with tempfile.TemporaryDirectory() as tmp:
        ruta = Path(tmp) / original.name
        if contenido is not None:
            ruta.write_text(contenido if isinstance(contenido, str) else json.dumps(contenido), encoding="utf-8")
        setattr(modulo, nombre, ruta)
        try:
            return funcion()
        finally:
            setattr(modulo, nombre, original)


def con_marcas(contenido, funcion):
    return con_archivo((marcas, "ARCHIVO"), contenido, funcion)


def aborta(funcion):
    try:
        funcion()
    except SystemExit as e:
        return e.code == 2
    return False


def ids(lista):
    return [v["id"] for v in lista]


print("1. Validación")
bien = {"motivos": ["no_gta"], "fecha": "2026-11-18"}
rechaza([], "un archivo que no es un objeto")
rechaza({"videos": {}, "otra": 1}, "una clave desconocida en el archivo")
rechaza({}, "un archivo sin 'videos'")
rechaza({"videos": {"corto": bien}}, "un código que no tiene 11 letras")
rechaza({"videos": {MARCADO + "\n": bien}}, "un código con un salto de línea al final")
rechaza({"videos": {MARCADO: {**bien, "motivos": []}}}, "una marca sin motivos")
rechaza({"videos": {MARCADO: {**bien, "motivos": ["feo"]}}}, "un motivo desconocido")
rechaza({"videos": {MARCADO: {**bien, "motivos": [["ia"]]}}}, "un motivo que no es texto")
rechaza({"videos": {MARCADO: {**bien, "motivos": ["ia", "ia"]}}}, "un motivo repetido")
rechaza({"videos": {MARCADO: {**bien, "fecha": "18-11-2026"}}}, "una fecha mal escrita")
rechaza({"videos": {MARCADO: {**bien, "fecha": "2026-02-30"}}}, "una fecha que no existe")
rechaza({"videos": {MARCADO: {**bien, "fecha": "2099-01-01"}}}, "una fecha que todavía no llega")
rechaza({"videos": {MARCADO: {**bien, "color": "rojo"}}}, "una clave desconocida en una marca")
rechaza({"videos": {"AAAAAAAAAAA": bien}}, "un video que no está en datos/ (como lo usará el panel)", conocidos={MARCADO})
repetido = '{"videos": {"%s": %s, "%s": %s}}' % (MARCADO, json.dumps(bien), MARCADO, json.dumps(bien))
try:
    con_marcas(repetido, marcas.leer)
    comprobar(False, "rechaza el mismo video escrito dos veces")
except marcas.MarcasMal as e:
    comprobar(True, f"rechaza el mismo video escrito dos veces ({e})")
try:
    marcas.leer()
    comprobar(True, "el archivo real recolector/marcas_videos.json es válido")
except marcas.MarcasMal as e:
    comprobar(False, f"el archivo real recolector/marcas_videos.json es válido ({e})")
comprobar(con_marcas(None, marcas.leer) == {}, "si no hay archivo, no hay marcas (sin error)")

print("2. Datos reales de datos/")
medidas = generar_web.leer_mediciones(generar_web.DATOS)
marcado = None   # el video marcado tal como sale en Global sin marcas (ver abajo)
if not medidas:
    comprobar(False, "hay mediciones en datos/ (en la nube, hacer git pull)")
else:
    sin = con_marcas(SIN_MARCAS, lambda: generar_web.convertir(medidas))
    con = con_marcas(SOLO_MARCADO, lambda: generar_web.convertir(medidas))
    shorts = lambda x: ids(x["records_youtube"]["short"])
    comprobar(MARCADO in ids(sin["youtube"]), "sin marcas, sale en Global (si no, la prueba no probaría nada)")
    comprobar(MARCADO in shorts(sin), "sin marcas, sale en el récord de Shorts")
    comprobar(MARCADO not in ids(con["youtube"]), "con la marca, no sale en Global")
    comprobar(MARCADO not in shorts(con) + ids(con["records_youtube"]["video"]), "con la marca, no sale en los récords")
    comprobar(MARCADO not in ids(con["youtube_es"]), "con la marca, no sale en Español")
    # Global muestra hasta generar_web.VIDEOS de cada tipo (videos y Shorts): al marcar uno, entra
    # el siguiente de su tipo solo si la última medición (la búsqueda de esa hora más los videos que
    # se siguen midiendo) trae uno de reserva que pase el filtro. Antes se comprobaba
    # "la misma cantidad" con el tope real, y fallaba (21 nov) cuando la búsqueda trajo menos
    # Shorts que el tope: no había reserva, y eso es lo correcto, no un fallo.
    def de_tipo(lista, es_short):
        return [v for v in ids(lista) if (next(x for x in lista if x["id"] == v).get("short") is True) == es_short]
    # Si el marcado ya no sale en Global (se mide cada hora), lo avisa "sin marcas, sale en Global"
    # de arriba; lo que sigue se salta en vez de caerse (así la parte 3 corre igual).
    marcado = next((v for v in sin["youtube"] if v["id"] == MARCADO), None)
if marcado:
    es_short = marcado.get("short") is True
    tipo_sin, tipo_con = de_tipo(sin["youtube"], es_short), de_tipo(con["youtube"], es_short)
    quitado = [v for v in tipo_sin if v != MARCADO]
    comprobar(tipo_con[:len(quitado)] == quitado and len(tipo_con) - len(quitado) in (0, 1)
              and de_tipo(con["youtube"], not es_short) == de_tipo(sin["youtube"], not es_short),
              "con la marca, Global solo pierde ese video (y, si había, entra uno de su tipo al final)")
    # Con un tope más chico hay reserva segura (el que quedaba fuera): ahí debe entrar el siguiente.
    tope = tipo_sin.index(MARCADO) + 1
    if tope < len(tipo_sin):
        original = generar_web.VIDEOS
        generar_web.VIDEOS = tope
        try:
            sin2 = con_marcas(SIN_MARCAS, lambda: generar_web.convertir(medidas))
            con2 = con_marcas(SOLO_MARCADO, lambda: generar_web.convertir(medidas))
        finally:
            generar_web.VIDEOS = original
        t2 = de_tipo(con2["youtube"], es_short)
        comprobar(len(t2) == len(de_tipo(sin2["youtube"], es_short)) == tope and t2[-1] == tipo_sin[tope]
                  and t2[:-1] == [x for x in tipo_sin[:tope] if x != MARCADO],
                  f"con reserva, Global sigue con la misma cantidad: entra el siguiente (tope de prueba {tope})")
    else:   # no es un fallo, pero tampoco "bien": la parte 3 lo prueba igual con datos inventados
        print("  AVISO con estos datos el marcado es el último de su tipo: no se prueba aquí que entre el siguiente")

print("3. Mediciones inventadas solo para esta prueba")
def video(i, titulo):
    return {"id": i, "titulo": titulo, "canal": "x", "visitas": 100, "short": False,
            "temas": ["Video_game_culture"], "idioma": "es"}
falsa = {"v": 1, "t": "2026-11-18T12:07:00Z", "twitch": {"error": "prueba"},
         "youtube_es": {"videos": [video(MARCADO, "Lamine Yamal x GTA 6"), video("OTROvideo01", "GTA 6 en español")]},
         "youtube_tendencias": {"regiones": {"CL": {
             "en_lista": 50, "primero": {"puesto": 1, "id": "PRIMEROxxxx", "titulo": "x", "canal": "x", "visitas": 1},
             "gta": [{"puesto": 3, "id": "OTROvideo01", "titulo": "GTA 6", "canal": "x", "visitas": 1},
                     {"puesto": 7, "id": MARCADO, "titulo": "Lamine Yamal x GTA 6", "canal": "x", "visitas": 1}]}},
             "rockstar": {}}}
sin = con_marcas(SIN_MARCAS, lambda: generar_web.convertir([falsa]))
t = con_marcas(SOLO_MARCADO, lambda: generar_web.convertir([falsa]))
comprobar(MARCADO in ids(sin["youtube_es"]), "sin marcas, sale en Español")
comprobar(ids(t["youtube_es"]) == ["OTROvideo01"], "con la marca, Español solo trae el otro video")
comprobar(sin["mediciones"][0]["tendencias"] == {"CL": 2} and t["mediciones"][0]["tendencias"] == {"CL": 1},
          "el conteo de Tendencias en Chile baja de 2 a 1")
cl = t["comparacion"]["youtube"]["regiones"]["CL"]
comprobar(ids(cl["gta"]) == ["OTROvideo01"], "la lista de Tendencias de Chile ya no lo trae")
comprobar(cl["primero"]["id"] == "PRIMEROxxxx" and cl["en_lista"] == 50, "el n.º 1 y el total de la lista no cambian")
comprobar(aborta(lambda: con_marcas('{"videos": {"malo": 1}}', lambda: generar_web.convertir([falsa]))),
          "generar_web.py aborta (código 2) con un archivo de marcas mal escrito")
comprobar(aborta(lambda: con_marcas("{no es json", lambda: generar_web.convertir([falsa]))),
          "generar_web.py aborta (código 2) con un archivo de marcas que no es JSON")
viejo = {"modo": "estricto", "excluir_palabras": [], "ocultar": []}
comprobar(aborta(lambda: con_archivo((generar_web, "FILTRO"), viejo, lambda: generar_web.convertir([falsa]))),
          "generar_web.py aborta si filtro_videos.json todavía trae 'ocultar'")
otro = {"videos": {"NOESTAxxxxx": {"motivos": ["dudoso"], "fecha": "2026-11-18"}}}
comprobar(not aborta(lambda: con_marcas(otro, lambda: generar_web.convertir([falsa]))),
          "un código que no está en los datos solo avisa: no frena la publicación de cada hora")
# "Entra el siguiente", sin depender de los datos del día (abogado del diablo, 21 nov): tres Shorts,
# tope 2; al marcar el segundo, entra el tercero y el primero no se mueve.
def short(i, visitas):
    return {"id": i, "titulo": "GTA 6 short " + i, "canal": "x", "visitas": visitas, "short": True, "temas": ["Video_game_culture"]}
tres = {"v": 1, "t": "2026-11-18T12:07:00Z", "twitch": {"error": "prueba"},
        "youtube": {"videos": [short("PRIMEROshor", 300), short(MARCADO, 200), short("TERCEROshor", 100)]}}
original = generar_web.VIDEOS
generar_web.VIDEOS = 2
try:
    sin3 = con_marcas(SIN_MARCAS, lambda: generar_web.convertir([tres]))
    con3 = con_marcas(SOLO_MARCADO, lambda: generar_web.convertir([tres]))
finally:
    generar_web.VIDEOS = original
comprobar(ids(sin3["youtube"]) == ["PRIMEROshor", MARCADO] and ids(con3["youtube"]) == ["PRIMEROshor", "TERCEROshor"],
          "con tope 2 y un Short de reserva: al marcar uno, entra el siguiente y el resto no se mueve")

print("4. Rescatar y configuraciones (10.3)")
rechaza({"videos": {MARCADO: bien}, "rescatados": {MARCADO: "2026-11-18"}}, "un video marcado y rescatado a la vez")
rechaza({"videos": {}, "revisados": {MARCADO: "2026-11-18"}, "rescatados": {MARCADO: "2026-11-18"}}, "un video revisado y rescatado a la vez")
rechaza({"videos": {}, "rescatados": {MARCADO: "ayer"}}, "un rescate con fecha mal escrita")
conf = {"nombre": "Con Roblox", "modo": "estricto", "excluir_palabras": []}
rechaza({"videos": {}, "configuraciones": {"Con Roblox": conf}}, "una configuración con clave en mayúsculas o espacios")
rechaza({"videos": {}, "configuraciones": {"rust": conf}}, "una configuración propia con la clave de una fija")
rechaza({"videos": {}, "configuraciones": {"a": conf, "b": dict(conf)}}, "dos configuraciones con el mismo nombre")
rechaza({"videos": {}, "configuraciones": {"a": {**conf, "nombre": "el de rust"}}}, "una configuración con el nombre de una fija")
rechaza({"videos": {}, "configuraciones": {"a": {**conf, "modo": "raro"}}}, "una configuración con un modo desconocido")
rechaza({"videos": {}, "configuraciones": {"a": {**conf, "excluir_palabras": ["x", "X"]}}}, "una palabra excluida repetida")
rechaza({"videos": {}, "configuraciones": {"a": {**conf, "extra": 1}}}, "una configuración con claves de más")
try:
    t_ = marcas.validar_todo({"videos": {}, "rescatados": {MARCADO: "2026-11-18"}, "configuraciones": {"con-roblox": conf}})
    comprobar(t_["rescatados"] == {MARCADO: "2026-11-18"} and "con-roblox" in t_["configuraciones"], "acepta un rescate y una configuración bien escritos")
except marcas.MarcasMal as e:
    comprobar(False, f"acepta un rescate y una configuración bien escritos ({e})")

def vid(i, titulo, visitas, short=False):
    return {"id": i, "titulo": titulo, "canal": "x", "visitas": visitas, "short": short, "temas": ["Video_game_culture"]}
vieja = {"v": 1, "t": "2026-11-17T12:07:00Z", "twitch": {"error": "prueba"},
         "youtube": {"videos": [vid("VIEJOdescar", "Un video sin el nombre del juego", 9_000_000), vid("BUENOvideo1", "GTA 6 gameplay", 100)]}}
nueva = {"v": 1, "t": "2026-11-18T12:07:00Z", "twitch": {"error": "prueba"},
         "youtube": {"videos": [vid("BUENOvideo1", "GTA 6 gameplay", 200), vid("NUEVOdescar", "Otro sin nombrarlo #gta6", 150)]}}
solo_rescate = lambda ids: {"videos": {}, "rescatados": {i: "2026-11-18" for i in ids}}
sin_r = con_marcas(SIN_MARCAS, lambda: generar_web.convertir([vieja, nueva]))
con_r = con_marcas(solo_rescate(["NUEVOdescar", "VIEJOdescar"]), lambda: generar_web.convertir([vieja, nueva]))
comprobar(ids(sin_r["youtube"]) == ["BUENOvideo1"], "sin rescates, el filtro deja fuera los dos videos que no nombran GTA 6 en el título")
comprobar(set(ids(con_r["youtube"])) == {"BUENOvideo1", "NUEVOdescar"}, "rescatado y en la última medición: sale en la lista")
comprobar("VIEJOdescar" not in ids(con_r["youtube"]), "rescatado pero solo en una medición vieja: no sale en la lista")
comprobar("VIEJOdescar" in ids(con_r["records_youtube"]["video"]) and "VIEJOdescar" not in ids(sin_r["records_youtube"]["video"]),
          "rescatado pero solo en una medición vieja: sí cuenta para el récord")

print()
if fallos:
    print(f"FALLARON {len(fallos)}:")
    for f in fallos:
        print("  - " + f)
    sys.exit(1)
print("Todo bien.")
