# Despertador del recolector (Cloudflare)

> **Montado el 2026-11-13 (~01:30 UTC).** Ya público el repositorio, GitHub seguía sin
> lanzar las ejecuciones programadas (ninguna en 2 horas), así que Bruno pidió montarlo.
> Claude creó el Worker, pegó el código y puso el horario desde el navegador de Bruno; Bruno
> creó la clave de GitHub y la guardó como secreto (antes de las 01:33 UTC). El primer turno
> (01:37 UTC) se ejecutó bien y, como debe, no midió: era un minuto 37 fuera de la semana del
> lanzamiento. **Falta verificar** el primer turno que sí mide (02:07 UTC del 13 nov):
> `gh run list --workflow recolectar.yml --limit 5`. Cuando funcione, hay que quitar el
> `schedule` de `.github/workflows/recolectar.yml` para que no se mida dos veces en el
> mismo turno.

GitHub no lanzaba solas las ejecuciones programadas del recolector (tarea 1.4, 2026-11-12).
Un Worker gratuito de Cloudflare hace de despertador: le pide a GitHub que ejecute el
workflow "Recolectar datos". El recolector sigue siendo el mismo (Python, en GitHub); el
Worker solo lo lanza.

**Frecuencia** (decisión de Bruno, 2026-11-12): **cada hora** (minuto 7), y **cada 30
minutos** (minutos 7 y 37) del 17 al 21 de noviembre de 2026 en UTC, la semana del
lanzamiento. Cloudflare despierta al Worker en los dos turnos; fuera de esa semana el del
minuto 37 no hace nada. Las fechas están en `SEMANA_INICIO` y `SEMANA_FIN` de `worker.js`.
Gasto en GitHub: unos 550 minutos en noviembre y unos 460 en diciembre (hasta el 19), de
los ~2.000 gratuitos al mes.

- `worker.js`: el código del Worker. Es la copia de referencia de lo que está en Cloudflare.
- Nombre del Worker en Cloudflare: `despertador-recolector`.
- Horario (Cron Trigger, hora UTC): `7,37 * * * *`.
- Secreto del Worker: `GITHUB_TOKEN`, una clave de GitHub de grano fino que **solo** tiene
  "Actions: Read and write" sobre este repositorio. Caduca el 31 de enero de 2027: si se
  alarga la recolección más allá de esa fecha, hay que crear otra y cambiar el secreto.

## Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada)

1. **Clave de GitHub:** <https://github.com/settings/personal-access-tokens/new>
   - Token name: `despertador recolector`. Expiration: *Custom*, 31 de enero de 2027.
   - Repository access: *Only select repositories* → `Documentaci-n-Gta-6-19-de-nombiembre`.
   - Repository permissions → **Actions: Read and write**. Nada más.
   - *Generate token* y copiarla (empieza por `github_pat_`; solo se muestra una vez).
2. **Crear el Worker:** <https://dash.cloudflare.com> → *Workers & Pages* → *Create* →
   empezar con "Hello World" → nombre `despertador-recolector` → *Deploy*.
3. **Poner el código:** *Edit code* → borrar todo y pegar el contenido de `worker.js` →
   *Deploy*.
4. **Guardar la clave:** en el Worker, *Settings* → *Variables and Secrets* → *Add* →
   tipo **Secret**, nombre `GITHUB_TOKEN`, valor la clave → *Deploy*.
5. **Poner el horario:** *Settings* → *Trigger events* (o *Triggers*) → *Add* →
   *Cron Triggers* → expresión `7,37 * * * *` → *Add*.

## Comprobar que funciona

En el PC: `gh run list --workflow recolectar.yml --limit 5`. Después del minuto 7 o 37
tiene que aparecer una ejecución nueva (`workflow_dispatch`), y unos segundos después un
commit "Medición automática". Los errores del Worker se ven en Cloudflare: Worker →
*Observability* (o *Logs*).

## Apagarlo

Para dejar de medir no hace falta tocar el Worker: basta con el interruptor
(`recolector/interruptor.json`). Para quitar el despertador del todo: borrar el Cron Trigger
en Cloudflare y borrar la clave en <https://github.com/settings/personal-access-tokens>.
