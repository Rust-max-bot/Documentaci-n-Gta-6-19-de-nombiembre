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

*(2026-11-12.)*

**Tarea 1.6 hecha:** la página ya muestra los datos reales. Para verla, doble clic en
`ver_pagina.bat` (trae las mediciones, prepara `web/datos.js`, que no va a git, y abre la
página).

**Tarea 1.4: repositorio hecho público el 2026-11-12 (~23:10 UTC), decisión de Bruno.** Con
el repositorio privado GitHub no lanzó ninguna programada (de 19:37 a 22:37 UTC), aunque todo
lo propio estaba bien. Coincide con un fallo de GitHub en repositorios privados nuevos, sin
causa oficial. Reescribir el `cron` no bastó. Antes de hacerlo público se limpió el historial
(con `--force`, autorizado por Bruno): correos al anónimo de GitHub y rutas del PC a
`%USERPROFILE%`. Se borraron las ejecuciones viejas. Detalle en `PLAN.md` ("Visibilidad del
repositorio"). Horario nuevo: cada hora (minuto 7) y además al minuto 37 del 17 al 21 nov.

**2026-11-13 (~01:30 UTC): despertador de Cloudflare montado** (plan B), porque ya público
GitHub tampoco lanzó ninguna programada (00:07 y 01:07 UTC). Claude creó el Worker
`despertador-recolector`, pegó `despertador/worker.js` y puso el horario `7,37 * * * *` desde el
Chrome de Bruno; Bruno creó la clave de GitHub (solo Actions, este repo, caduca 31 ene 2027) y
la guardó como secreto `GITHUB_TOKEN`. El turno de 01:37 UTC corrió bien en Cloudflare y no
midió, como debe (minuto 37 fuera de la semana del lanzamiento). El plugin de Cloudflare para
Claude Code ya estaba instalado; su MCP pide iniciar sesión con `/mcp` (no hace falta aquí).

**Siguiente paso:** `gh run list --workflow recolectar.yml --limit 10`.

- Si desde las 02:07 UTC del 13 nov hay ejecuciones `workflow_dispatch` cada hora (minuto 7)
  con su commit "Medición automática": el despertador funciona. Entonces quitar el
  `schedule` de `.github/workflows/recolectar.yml` (para no medir dos veces) y marcar 1.4 y
  1.5 `[x]`.
- Si no hay ninguna: mirar el registro del Worker en Cloudflare (*Observability*); lo más
  probable sería la clave (permiso o repositorio mal elegido).
- **Pendiente de Bruno:** pedir a soporte de GitHub que borre la referencia del PR #1 (deja
  alcanzable el primer commit, con su correo de Outlook); activar en GitHub "Keep my email
  addresses private" y "Block command line pushes that expose my email".

**Tanda en curso: 1.2 a 1.5** (más la 1.6, pedida aparte y ya hecha). 1.2 y 1.3 hechas.
El recolector está en GitHub (workflow "Recolectar datos"; formato y uso en
`recolector/LEEME.md`). Las mediciones reales de
`datos/2026-11-12.jsonl` son todas manuales, con las seis fuentes respondiendo. La 1.5 la
cambió Bruno: basta con dos ejecuciones programadas que arranquen solas, sin vigilar 24 horas.

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
tareas 1.2 a 1.5.

## Últimos cambios

- 2026-11-13: despertador de Cloudflare montado (tarea 1.4); falta ver la primera medición.
- 2026-11-12: historial limpio de datos personales y repositorio público (tarea 1.4); cada hora.
- 2026-11-12: `cron` reescrito (mismo horario) para que GitHub lance las programadas (no bastó).
- 2026-11-12: página conectada a los datos reales (tarea 1.6); `ver_pagina.bat` para verla.
- 2026-11-12: recolector en GitHub (tareas 1.2 y 1.3); primeras mediciones reales guardadas.
- 2026-11-12: "paso a paso con permiso" vuelve, por tandas que define Bruno; D6 se ignora por ahora.
- 2026-11-12: Bruno decidió guardar los datos en archivos de texto por día (tarea 1.1 hecha).
- 2026-11-12: `PLAN_DE_TRABAJO.md` creado con la lista de Bruno ordenada; decisiones nuevas en `PLAN.md`.
- 2026-11-12: Twitch y YouTube probados desde GitHub con las claves reales; funcionan.

## Pendiente

La lista completa y su orden están en `PLAN_DE_TRABAJO.md`. Lo inmediato:

1. Tarea 1.4: confirmar que el despertador lanza el recolector (desde 02:07 UTC del 13 nov);
   si sí, quitar el `schedule` de `recolectar.yml`.
2. Bruno: pedir a soporte de GitHub que borre la referencia del PR #1 y activar el correo privado.
3. Tarea 1.5: confirmar dos ejecuciones programadas seguidas; 1.5b opcional (revisar 24 horas).
4. Tarea 1.7: prueba completa antes del 18 de noviembre.
5. Opcional: el hook de diseño de Impeccable (Bruno ejecuta `npx impeccable install` en el PC).
