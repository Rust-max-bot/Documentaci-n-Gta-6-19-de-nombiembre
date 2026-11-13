# Estado actual del proyecto

> Estado **vivo** y corto. Las reglas y la forma de trabajo están en `CLAUDE.md`; las
> decisiones, fases y riesgos, en `PLAN.md`; la lista ordenada de tareas, en
> `PLAN_DE_TRABAJO.md`. Al iniciar una sesión se lee este archivo entero.

## Cómo usar este archivo

- Se actualiza en el mismo commit del paso, solo si cambia el estado, un pendiente o
  "Dónde quedamos" (ver "Guardado al terminar cada paso" en `CLAUDE.md`). Nada de reglas aquí.
- **Tiene que seguir siendo corto.** "Últimos cambios" guarda unas 8 entradas de una línea;
  las viejas se borran porque ya están en `git log`.
- Si pasa de 20.000 bytes, se archiva en `historial/` y se empieza uno nuevo (ver
  "Archivar `ESTADO_ACTUAL.md`" en `CLAUDE.md`).

## Dónde quedamos

*(2026-11-13, ~13:20 UTC.)*

**Tanda 1.2 a 1.5 terminada** (más la 1.6, pedida aparte). Esperando que Bruno diga la
siguiente tanda; lo que sigue en orden es la 1.5b (opcional) y la 1.7.

**El recolector funciona solo.** Lo lanza el despertador de Cloudflare (Worker
`despertador-recolector`, horario `7,37 * * * *`, clave de GitHub en su secreto
`GITHUB_TOKEN`, caduca el 31 ene 2027). Verificado el 2026-11-13: 12 ejecuciones seguidas,
cada hora de 02:07 a 13:07 UTC, todas bien y con su commit "Medición automática". GitHub
también lanzó dos programadas, tarde (03:23 y 12:05 UTC), que midieron dos veces esos turnos
(quedan en los datos; no se borran). Por eso se quitó el `schedule` de `recolectar.yml`: ahora
solo lo lanza el despertador (o una ejecución manual). El repositorio es público desde el
2026-11-12 (detalle en `PLAN.md`, "Visibilidad del repositorio").

**Para ver la página:** doble clic en `ver_pagina.bat` (trae las mediciones, prepara
`web/datos.js`, que no va a git, y abre la página).

**Si un día faltan mediciones:** mirar el registro del Worker en Cloudflare
(*Observability*); lo más probable sería la clave (caducada o sin permiso).

**Pendiente de Bruno:** pedir a soporte de GitHub que borre la referencia del PR #1 (deja
alcanzable el primer commit, con su correo de Outlook); activar en GitHub "Keep my email
addresses private" y "Block command line pushes that expose my email".

**Hecho:**

- La página (`web/`) con dos estilos de Miami, conectada a los datos reales (tarea 1.6).
- Las tres claves están guardadas como secretos de GitHub (`TWITCH_CLIENT_ID`,
  `TWITCH_CLIENT_SECRET`, `YOUTUBE_API_KEY`).
- **Todas las fuentes probadas desde GitHub** con el workflow "Probar fuentes"
  (`recolector/probar_fuentes.py`, se lanza con `gh workflow run probar-fuentes.yml`):
  Twitch, YouTube, Google Trends, titulares, PlayStation y Xbox funcionan; Rockstar no.
  Ese archivo ya tiene escritas las consultas que el recolector debe reutilizar.
- Sistema de trabajo: relevo entre sesiones, guardado automático, archivo del estado a los
  20.000 bytes, reglas de trabajo, Graphify e Impeccable instalados.

**Ya se guardan datos reales** desde el 2026-11-12 (interés previo al lanzamiento). Se
apaga, enciende o alarga en `recolector/interruptor.json` (por defecto, hasta el 19 dic).

**Bruno entregó una lista de cosas que quiere** (2026-11-12): un mes de datos con interruptor
manual, análisis, Reddit, enlaces, miniaturas y varios cambios de diseño. Está ordenada en
`PLAN_DE_TRABAJO.md`, con avisos sobre los límites de algunas ideas. El punto D6 quedó
cortado: Bruno pidió ignorarlo por ahora.

**Fecha límite:** el recolector tiene que llevar días funcionando antes del 18 de noviembre
de 2026. Lanzamiento: 19 de noviembre, 00:00 de Santiago.

**Reglas en pausa:** ninguna. "Paso a paso con permiso" está activa **por tandas**: Bruno
dice qué pasos hacer y Claude no para hasta completarlos (ver `CLAUDE.md`). Tanda actual:
ninguna (la 1.2 a 1.5 terminó el 2026-11-13).

## Últimos cambios

- 2026-11-13: despertador verificado (12 turnos bien); `schedule` quitado; tareas 1.4 y 1.5 hechas.
- 2026-11-13: despertador de Cloudflare montado (tarea 1.4).
- 2026-11-12: historial limpio de datos personales y repositorio público (tarea 1.4); cada hora.
- 2026-11-12: `cron` reescrito (mismo horario) para que GitHub lance las programadas (no bastó).
- 2026-11-12: página conectada a los datos reales (tarea 1.6); `ver_pagina.bat` para verla.
- 2026-11-12: recolector en GitHub (tareas 1.2 y 1.3); primeras mediciones reales guardadas.
- 2026-11-12: "paso a paso con permiso" vuelve, por tandas que define Bruno; D6 se ignora por ahora.
- 2026-11-12: Bruno decidió guardar los datos en archivos de texto por día (tarea 1.1 hecha).
- 2026-11-12: `PLAN_DE_TRABAJO.md` creado con la lista de Bruno ordenada; decisiones nuevas en `PLAN.md`.

## Pendiente

La lista completa y su orden están en `PLAN_DE_TRABAJO.md`. Lo inmediato:

1. Bruno: pedir a soporte de GitHub que borre la referencia del PR #1 y activar el correo privado.
2. Tarea 1.5b (opcional): revisar las primeras 24 horas con `python recolector/revisar.py --horas 24`.
3. Tarea 1.7: prueba completa antes del 18 de noviembre.
4. Opcional: el hook de diseño de Impeccable (Bruno ejecuta `npx impeccable install` en el PC).
