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

*(2026-11-13, ~16:00 UTC.)*

**Fase 1 terminada** (tareas 1.1 a 1.7). La página ya muestra lo más nuevo arriba y el eje de
Twitch con números redondos (decisiones en `PLAN.md`).

**Tanda en curso: 2.1, 2.2 y 2.3** (pedida el 2026-11-13). 2.1 hecha (enlaces a YouTube y
Twitch). 2.3 hecha (parpadeo del suelo de 1986), falta que Bruno lo confirme a la vista.
**2.2 esperando a Bruno:** elegir entre dos formas de mostrar las miniaturas de los videos
(capturas hechas); y Twitch no guarda miniaturas útiles (detalle en `PLAN_DE_TRABAJO.md`).

**El recolector funciona solo.** Lo lanza el despertador de Cloudflare (Worker
`despertador-recolector`, horario `7,37 * * * *`, clave de GitHub en su secreto
`GITHUB_TOKEN`; caduca el 31 ene 2027, o ~1 mar 2027 según recuerda Bruno: por verificar,
pero ambas fechas pasan del 19 dic). Verificado el 2026-11-13: 12 ejecuciones seguidas,
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
2.1, 2.2 y 2.3.

## Últimos cambios

- 2026-11-13: grafo de Graphify al día también con los documentos (forzado con permiso de Bruno).
- 2026-11-13: enlaces a videos y canales (2.1) y suelo de 1986 sin parpadeo (2.3).
- 2026-11-13: página: eje de Twitch con números redondos y lo más nuevo arriba (tarea 1.7 cerrada).
- 2026-11-13: prueba completa (tarea 1.7): todo bien salvo el eje del gráfico de Twitch.
- 2026-11-13: `revisar.py` sigue el horario del despertador.
- 2026-11-13: revisión de las primeras 24 horas (tarea 1.5b): sin fallos; `revisar.py` desfasado.
- 2026-11-13: despertador verificado (12 turnos bien); `schedule` quitado; tareas 1.4 y 1.5 hechas.
- 2026-11-13: despertador de Cloudflare montado (tarea 1.4).
- 2026-11-12: historial limpio de datos personales y repositorio público (tarea 1.4); cada hora.
- 2026-11-12: `cron` reescrito (mismo horario) para que GitHub lance las programadas (no bastó).
- 2026-11-12: página conectada a los datos reales (tarea 1.6); `ver_pagina.bat` para verla.

## Pendiente

La lista completa y su orden están en `PLAN_DE_TRABAJO.md`. Lo inmediato:

1. Bruno: pedir a soporte de GitHub que borre la referencia del PR #1 y activar el correo privado.
2. Tarea 2.2: Bruno elige cómo mostrar las miniaturas (y qué hacer con las de Twitch).
3. Opcional: comprobar en Cloudflare que el código del Worker es igual a `despertador/worker.js`.
4. Opcional: el hook de diseño de Impeccable (Bruno ejecuta `npx impeccable install` en el PC).
