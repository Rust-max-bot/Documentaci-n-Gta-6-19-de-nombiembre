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
    comprobar(len(con["youtube"]) == len(sin["youtube"]), "Global sigue con la misma cantidad (entra el siguiente)")

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

print()
if fallos:
    print(f"FALLARON {len(fallos)}:")
    for f in fallos:
        print("  - " + f)
    sys.exit(1)
print("Todo bien.")
