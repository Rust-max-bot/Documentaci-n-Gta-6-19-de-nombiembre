"""Recolector: mide cada fuente y añade UNA línea al archivo de texto del día en datos/.

- En GitHub lo ejecuta el workflow "Recolectar datos" cada 30 minutos.
- En el PC, solo para probar: python recolector/recolectar.py --carpeta <carpeta temporal>
  (en el PC nunca escribe en datos/: esa carpeta es el recuerdo y solo la escribe GitHub).

Formato y uso: recolector/LEEME.md. Solo usa la biblioteca estándar de Python.

Códigos de salida: 0 = medición guardada (aunque alguna fuente haya fallado, el fallo queda
anotado como hueco) o interruptor apagado; 2 = una comprobación falló y NO se guardó nada.
"""
import json
import os
import re
import sys
import time
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import validar
from fuentes import FUENTES
from red import Falla, a_iso

RAIZ = Path(__file__).resolve().parent.parent
INTERRUPTOR = RAIZ / "recolector" / "interruptor.json"
DATOS = RAIZ / "datos"
# Santiago está en horario de verano (UTC-3) de septiembre a abril: cubre todo el proyecto.
SANTIAGO = timezone(timedelta(hours=-3))
NOMBRE_ARCHIVO = re.compile(r"^\d{4}-\d{2}-\d{2}\.jsonl$")
DIAS_DE_ESTADO = 3                # archivos recientes que se leen para no repetir titulares
TAMANO_MAX_FUENTE = 100_000       # caracteres; si una fuente entrega más, se guarda como hueco
SECRETOS = ("TWITCH_CLIENT_ID", "TWITCH_CLIENT_SECRET", "YOUTUBE_API_KEY")


def abortar(mensaje):
    print(f"ABORTADO, no se guardó nada: {mensaje}")
    sys.exit(2)


def leer_interruptor():
    try:
        c = json.loads(INTERRUPTOR.read_text(encoding="utf-8"))
        activo, ultimo = c["activo"], date.fromisoformat(c["ultimo_dia"])
    except (OSError, ValueError, KeyError, TypeError) as e:
        abortar(f"recolector/interruptor.json no se puede leer ({type(e).__name__})")
    if not isinstance(activo, bool):
        abortar("en interruptor.json, 'activo' debe ser true o false")
    fin = datetime(ultimo.year, ultimo.month, ultimo.day, tzinfo=SANTIAGO) + timedelta(days=1)
    return activo, ultimo, fin


def leer_estado(carpeta):
    """Lee los archivos más recientes. Si alguno está dañado, aborta: no se añade nada encima."""
    estado = {"ultima_t": None, "youtube_previos": [], "noticias_vistas": set()}
    archivos = sorted(p for p in carpeta.glob("*.jsonl"))
    for p in archivos:
        if not NOMBRE_ARCHIVO.match(p.name):
            abortar(f"archivo con nombre inesperado en la carpeta de datos: {p.name}")
    ultima, videos = None, []
    for p in archivos[-DIAS_DE_ESTADO:]:
        texto = p.read_text(encoding="utf-8")
        if texto and not texto.endswith("\n"):
            abortar(f"{p.name} termina a medias (la última línea no está completa)")
        for n, linea in enumerate(texto.splitlines(), 1):
            try:
                m = json.loads(linea)
            except ValueError:
                abortar(f"{p.name}, línea {n}: no es una medición válida")
            ultima = m
            for nota in m.get("noticias", {}).get("nuevas", []):
                estado["noticias_vistas"].add(nota["url"])
            # videos de la última medición en que YouTube respondió (si la última fue hueco)
            videos = m.get("youtube", {}).get("videos") or videos
    if ultima:
        estado["ultima_t"] = ultima["t"]
        estado["youtube_previos"] = [v["id"] for v in sorted(videos, key=lambda v: v.get("visitas") or 0, reverse=True)]
    return estado


def mensaje_seguro(e, secretos):
    texto = str(e) if isinstance(e, Falla) else f"{type(e).__name__}: {e}"
    for s in secretos:
        if s:
            texto = texto.replace(s, "***")
    return texto[:300] or type(e).__name__


def resumen(nombre, r):
    if "error" in r:
        return f"HUECO: {r['error']}"
    if nombre == "twitch":
        return f"{r['espectadores']} espectadores en {r['transmisiones']} transmisiones"
    if nombre == "youtube":
        v = r["videos"][0]
        return f"{len(r['videos'])} videos ({r['unidades']} unidades); el más visto: {v['visitas']} visitas"
    if nombre == "trends":
        p = r["puntos"][-1]
        return f"{len(r['puntos'])} puntos; último {p['t']} = {p['interes']}"
    if nombre == "noticias":
        return f"{len(r['nuevas'])} titulares nuevos de {r['en_fuente']}"
    return "sin problemas" if r["ok"] else "CON PROBLEMAS"


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    en_github = os.environ.get("GITHUB_ACTIONS") == "true"
    if "--carpeta" in sys.argv:
        carpeta = Path(sys.argv[sys.argv.index("--carpeta") + 1]).resolve()
        if carpeta == DATOS.resolve():
            abortar("--carpeta no puede ser datos/: para probar, usa una carpeta temporal")
    elif en_github:
        carpeta = DATOS
    else:
        abortar("en el PC usa --carpeta <carpeta temporal>; datos/ solo lo escribe GitHub")

    ahora = datetime.now(timezone.utc).replace(microsecond=0)
    activo, ultimo, fin = leer_interruptor()
    if not activo:
        print("Interruptor apagado (recolector/interruptor.json): no se mide.")
        return 0
    if ahora >= fin:
        print(f"El periodo terminó (último día: {ultimo}, hora de Santiago). No se mide.")
        return 0

    carpeta.mkdir(parents=True, exist_ok=True)
    estado = leer_estado(carpeta)
    secretos = [os.environ.get(n, "") for n in SECRETOS]
    m = {"v": validar.VERSION, "t": a_iso(ahora), "origen": "github" if en_github else "prueba",
         "ejecucion": os.environ.get("GITHUB_RUN_ID")}
    fallos, inicio = [], time.monotonic()
    for nombre, medir in FUENTES.items():
        try:
            r = medir(estado)
            validar.CHEQUEOS[nombre](r)
            if len(json.dumps(r, ensure_ascii=False)) > TAMANO_MAX_FUENTE:
                raise Falla("la respuesta es demasiado grande para guardarla")
        except validar.Invalida as e:
            r = {"error": f"datos que no cuadran: {e}"}
        except Exception as e:   # cualquier otra cosa: hueco con mensaje, y se sigue con las demás
            r = {"error": mensaje_seguro(e, secretos)}
        if "error" in r:
            fallos.append(nombre)
        m[nombre] = r
        print(f"{nombre:12} {resumen(nombre, r)}")
    m["duracion_s"] = round(time.monotonic() - inicio, 1)

    linea = json.dumps(m, ensure_ascii=False, separators=(",", ":"))
    try:
        validar.medicion(m, linea, ahora, FUENTES, secretos, estado["ultima_t"])
    except validar.Invalida as e:
        abortar(str(e))

    archivo = carpeta / f"{ahora:%Y-%m-%d}.jsonl"   # un archivo por día UTC
    with open(archivo, "a", encoding="utf-8", newline="\n") as fh:
        fh.write(linea + "\n")
    if archivo.read_text(encoding="utf-8").splitlines()[-1] != linea:
        abortar(f"después de escribir, la última línea de {archivo.name} no coincide")
    print(f"Guardado en {archivo.name}: {len(linea.encode('utf-8'))} bytes, {m['duracion_s']} s."
          + (f" Fuentes con hueco: {', '.join(fallos)}." if fallos else " Todas las fuentes respondieron."))

    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as fh:
            fh.write(f"fallos={','.join(fallos)}\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
