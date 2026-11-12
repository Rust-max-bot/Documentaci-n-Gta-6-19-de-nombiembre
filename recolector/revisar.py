"""Revisa cómo va la recolección. Solo LEE datos/ (no escribe nada).

Uso:  python recolector/revisar.py            (todo lo guardado)
      python recolector/revisar.py --horas 24 (solo las últimas 24 horas)

Muestra: mediciones, intervalos y huecos de tiempo, fallos por fuente, unidades de YouTube
por día (el cupo se reinicia a medianoche de California) y el peso de los datos.
"""
import json
import statistics
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path

DATOS = Path(__file__).resolve().parent.parent / "datos"
CALIFORNIA = timezone(timedelta(hours=-8))   # el cupo de YouTube se reinicia a las 00:00 del Pacífico
SANTIAGO = timezone(timedelta(hours=-3))
HUECO_MIN = 45                               # minutos entre mediciones a partir de los que se avisa


def fecha(x):
    return datetime.strptime(x, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    carpeta = Path(sys.argv[sys.argv.index("--carpeta") + 1]) if "--carpeta" in sys.argv else DATOS
    horas = float(sys.argv[sys.argv.index("--horas") + 1]) if "--horas" in sys.argv else None
    archivos = sorted(carpeta.glob("*.jsonl"))
    if not archivos:
        print("Todavía no hay mediciones en", carpeta)
        return
    medidas = []
    for p in archivos:
        for linea in p.read_text(encoding="utf-8").splitlines():
            medidas.append((json.loads(linea), len(linea.encode("utf-8")) + 1))
    if horas:
        desde = datetime.now(timezone.utc) - timedelta(hours=horas)
        medidas = [(m, b) for m, b in medidas if fecha(m["t"]) >= desde]
    if not medidas:
        print("No hay mediciones en ese rango.")
        return

    ts = [fecha(m["t"]) for m, _ in medidas]
    local = lambda t: t.astimezone(SANTIAGO).strftime("%d-%m %H:%M")
    print(f"Mediciones: {len(medidas)}  (de {local(ts[0])} a {local(ts[-1])}, hora de Santiago)")
    print(f"Origen: {dict(Counter(m.get('origen') for m, _ in medidas))}")
    if len(ts) > 1:
        inter = [(b - a).total_seconds() / 60 for a, b in zip(ts, ts[1:])]
        print(f"Minutos entre mediciones: mínimo {min(inter):.0f}, mediana {statistics.median(inter):.0f}, máximo {max(inter):.0f}")
        huecos = [(a, b) for a, b in zip(ts, ts[1:]) if (b - a) > timedelta(minutes=HUECO_MIN)]
        for a, b in huecos:
            print(f"  hueco de tiempo: {local(a)} -> {local(b)} ({(b - a).total_seconds() / 60:.0f} min sin medir)")
        transcurrido = (ts[-1] - ts[0]).total_seconds() / 3600
        print(f"Esperadas cada 30 min en ese tiempo: {int(transcurrido * 2) + 1}")

    print("\nFuentes (respondió / hueco):")
    for fuente in [k for k in medidas[-1][0] if isinstance(medidas[-1][0][k], dict)]:
        errores = [m[fuente]["error"] for m, _ in medidas if "error" in m.get(fuente, {"error": "falta"})]
        print(f"  {fuente:12} {len(medidas) - len(errores):4} / {len(errores):<4}"
              + (f"  último error: {errores[-1]}" if errores else ""))

    unidades = defaultdict(int)
    for m, _ in medidas:
        unidades[fecha(m["t"]).astimezone(CALIFORNIA).date()] += m.get("youtube", {}).get("unidades", 0)
    print("\nUnidades de YouTube por día (cupo: 10.000):", {str(d): u for d, u in unidades.items()})

    tw = [(m["twitch"]["espectadores"], m["t"]) for m, _ in medidas if "espectadores" in m.get("twitch", {})]
    if tw:
        mx = max(tw)
        print(f"Twitch: máximo {mx[0]} espectadores ({local(fecha(mx[1]))}); último {tw[-1][0]}")
    print(f"Titulares nuevos guardados: {sum(len(m.get('noticias', {}).get('nuevas', [])) for m, _ in medidas)}")
    caidas = [(f, m["t"]) for m, _ in medidas for f in ("playstation", "xbox") if m.get(f, {}).get("ok") is False]
    print(f"Mediciones con problemas en servidores: {len(caidas)}" + (f" (última: {caidas[-1][0]} {local(fecha(caidas[-1][1]))})" if caidas else ""))

    total = sum(b for _, b in medidas)
    print(f"\nPeso: {total / 1024:.0f} KB en {len(medidas)} mediciones; media {total / len(medidas) / 1024:.1f} KB")
    print(f"Estimación para 30 días a 48 por día: {total / len(medidas) * 48 * 30 / 1024 / 1024:.1f} MB")
    print(f"Peso total de la carpeta: {sum(p.stat().st_size for p in archivos) / 1024:.0f} KB en {len(archivos)} archivos")


if __name__ == "__main__":
    main()
