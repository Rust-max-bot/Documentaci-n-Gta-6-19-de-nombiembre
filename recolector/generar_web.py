"""Convierte las mediciones de datos/ en web/datos.js, el archivo que lee la página.

Uso:  python recolector/generar_web.py
      (o doble clic en ver_pagina.bat, que además trae los datos nuevos y abre la página)

Solo LEE datos/ y solo escribe web/datos.js. Ese archivo no se sube a git (.gitignore):
se rehace entero cada vez, y subirlo cada 30 minutos inflaría el repositorio.
Si algo no cuadra, se detiene y deja web/datos.js como estaba.
"""
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos"
SALIDA = RAIZ / "web" / "datos.js"
NOMBRE_ARCHIVO = re.compile(r"^\d{4}-\d{2}-\d{2}\.jsonl$")
VIDEOS = 20         # videos de YouTube que se muestran (los más vistos en la última medición)
NOTICIAS = 60       # titulares que se muestran (los más recientes)
CANALES = 3         # canales de Twitch por medición


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


def ultima_hora_completa(trends):
    """Interés de la última hora completa de esa medición (la hora en curso viene a medias)."""
    puntos = [p for p in trends.get("puntos", []) if not p.get("parcial")]
    return puntos[-1]["interes"] if puntos else None


def estado_servidor(r):
    if not r or "error" in r:
        return None            # sin dato: la página lo muestra como hueco
    return "ok" if r["ok"] else "problemas"


def convertir(medidas):
    mediciones, series, ultimo_video, vistas, noticias = [], {}, {}, set(), []
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
        interes = None if "error" in tr else ultima_hora_completa(tr)
        fila["trends"] = {"interes": interes} if interes is not None else {"error": tr.get("error", "sin hora completa")}
        fila["servidores"] = {
            "rockstar": None,   # no se puede medir con programas; sus caídas se anotan en web/eventos.js
            "playstation": estado_servidor(m.get("playstation")),
            "xbox": estado_servidor(m.get("xbox")),
        }
        mediciones.append(fila)

        for v in m.get("youtube", {}).get("videos", []):
            if isinstance(v.get("visitas"), int):
                series.setdefault(v["id"], []).append({"t": m["t"], "visitas": v["visitas"]})
                ultimo_video[v["id"]] = v
        for n in m.get("noticias", {}).get("nuevas", []):
            if n["url"] not in vistas:
                vistas.add(n["url"])
                noticias.append({"t": n.get("t") or m["t"], "titulo": n["titulo"], "medio": n.get("medio") or "", "url": n["url"]})

    # Los videos que aparecen en la última medición en que YouTube respondió, de más a menos visto.
    ultima_yt = next((m["youtube"]["videos"] for m in reversed(medidas) if m.get("youtube", {}).get("videos")), [])
    youtube = [{
        "id": v["id"],
        "titulo": ultimo_video[v["id"]]["titulo"],
        "canal": ultimo_video[v["id"]]["canal"],
        "miniatura": ultimo_video[v["id"]].get("miniatura", ""),
        "serie": series[v["id"]],
    } for v in ultima_yt if v["id"] in series][:VIDEOS]

    noticias.sort(key=lambda n: n["t"])
    return {"mediciones": mediciones, "youtube": youtube, "noticias": noticias[-NOTICIAS:]}


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
    for v in d["youtube"]:
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
    d["generado"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    d["eventos"] = []   # los eventos a mano están en web/eventos.js
    texto = ("/* DATOS REALES generados por recolector/generar_web.py a partir de datos/.\n"
             "   No editar a mano: se rehace entero cada vez. No se sube a git. */\n"
             "window.DATOS = " + json.dumps(d, ensure_ascii=False, separators=(",", ":")) + ";\n")
    temporal = SALIDA.with_suffix(".js.tmp")
    temporal.write_text(texto, encoding="utf-8", newline="\n")
    os.replace(temporal, SALIDA)   # se cambia de golpe: nunca queda un archivo a medias
    print(f"web/datos.js listo: {len(d['mediciones'])} mediciones (de {medidas[0]['t']} a {medidas[-1]['t']} UTC), "
          f"{len(d['youtube'])} videos, {len(d['noticias'])} titulares, {len(texto.encode('utf-8')) // 1024} KB.")


if __name__ == "__main__":
    main()
