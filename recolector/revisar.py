"""Revisa cómo va la recolección. Solo LEE datos/ (no escribe nada).

Uso:  python recolector/revisar.py            (todo lo guardado)
      python recolector/revisar.py --horas 24 (solo las últimas 24 horas)

Muestra: mediciones, turnos del horario que faltan o se midieron dos veces, fallos por
fuente, unidades de YouTube por día (el cupo se reinicia a medianoche de California) y el
peso de los datos.

Horario (el del despertador, despertador/worker.js): minuto 7 de cada hora, y además minuto
37 la semana del lanzamiento (17 al 21 nov, UTC). Si se cambia allí, cambiarlo aquí también.
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
SEMANA_INICIO = datetime(2026, 11, 17, tzinfo=timezone.utc)   # igual que SEMANA_INICIO/FIN
SEMANA_FIN = datetime(2026, 11, 22, tzinfo=timezone.utc)      # de despertador/worker.js
# Una medición cuenta para un turno si empieza entre 10 min antes y 20 min después
# (GitHub tarda unos segundos en arrancar; los turnos de la semana van cada 30 min).
ANTES, DESPUES = timedelta(minutes=10), timedelta(minutes=20)


def fecha(x):
    return datetime.strptime(x, "%Y-%m-%dT%H:%M:%SZ").replace(tzinfo=timezone.utc)


def turnos(desde, hasta):
    """Horas en que tocaba medir entre 'desde' y 'hasta', según el horario del despertador."""
    hora = desde.replace(minute=0, second=0, microsecond=0)
    lista = []
    while hora <= hasta:
        for minuto in (7, 37):
            t = hora.replace(minute=minuto)
            if desde <= t <= hasta and (minuto == 7 or SEMANA_INICIO <= t < SEMANA_FIN):
                lista.append(t)
        hora += timedelta(hours=1)
    return lista


def revisar_turnos(ts, desde, hasta, local):
    """Cruza las mediciones con los turnos: cuáles faltan, cuáles se midieron dos veces."""
    lista = turnos(desde, hasta)
    por_turno = {t: [x for x in ts if t - ANTES <= x < t + DESPUES] for t in lista}
    en_turno = {x for xs in por_turno.values() for x in xs}
    faltan = [t for t in lista if not por_turno[t]]
    dobles = [t for t in lista if len(por_turno[t]) > 1]
    print(f"Turnos del horario en ese tiempo: {len(lista)}; medidos: {len(lista) - len(faltan)}; "
          f"faltan: {len(faltan)}; medidos dos veces: {len(dobles)}; "
          f"mediciones fuera de turno (a mano): {sum(1 for x in ts if x not in en_turno)}")
    # Los turnos que faltan seguidos se muestran juntos, para que la lista no sea eterna.
    grupos = []
    for t in faltan:
        if grupos and lista.index(t) == lista.index(grupos[-1][-1]) + 1:
            grupos[-1].append(t)
        else:
            grupos.append([t])
    for g in grupos:
        print(f"  falta: {local(g[0])}" + (f" a {local(g[-1])} ({len(g)} turnos)" if len(g) > 1 else ""))
    for t in dobles:
        print(f"  dos veces: turno de {local(t)}")
    if faltan:
        print("  (Si el interruptor estaba apagado, esos turnos también salen como faltantes.)")


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
    # --ahora AAAA-MM-DDTHH:MM:SSZ hace como si fuera esa hora (para probar con datos inventados).
    ahora = fecha(sys.argv[sys.argv.index("--ahora") + 1]) if "--ahora" in sys.argv else datetime.now(timezone.utc)
    if horas:
        desde = ahora - timedelta(hours=horas)
        medidas = [(m, b) for m, b in medidas if desde <= fecha(m["t"]) <= ahora]
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
    # Hasta "ahora" (no hasta la última medición), para notar si el recolector dejó de medir.
    # Los turnos de los últimos 20 minutos no se cuentan: su medición puede estar en camino.
    # Ojo: en el PC, hacer antes "git pull", o los turnos recientes saldrán como faltantes.
    revisar_turnos(ts, desde if horas else ts[0] - ANTES, ahora - DESPUES, local)

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
    # Un mes: 25 días a 24 mediciones y los 5 de la semana del lanzamiento a 48.
    print(f"Estimación para un mes (24 al día; 48 la semana del lanzamiento): "
          f"{total / len(medidas) * (25 * 24 + 5 * 48) / 1024 / 1024:.1f} MB")
    print(f"Peso total de la carpeta: {sum(p.stat().st_size for p in archivos) / 1024:.0f} KB en {len(archivos)} archivos")


if __name__ == "__main__":
    main()
