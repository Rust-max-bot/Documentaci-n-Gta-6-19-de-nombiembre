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

**LO PRIMERO EN LA PRÓXIMA SESIÓN (pedido de Bruno, 2026-11-12): revisar si GitHub ya
lanza solo las ejecuciones programadas.** Bruno cerró VS Code y dejó esta revisión para
después; la espera de fondo de la sesión anterior se cortó al cerrar.

1. `gh run list --workflow recolectar.yml --event schedule --limit 10`.
2. Si hay al menos dos seguidas con éxito: tarea 1.4 y 1.5 hechas (marcar `[x]`).
   Opcional (1.5b): `python recolector/revisar.py --horas 24`.
3. Si sigue sin haber ninguna: investigar la causa de la tarea 1.4. Dato verificado: hasta
   las 20:56 UTC del 2026-11-12 GitHub no lanzó ninguna (se saltó 19:37, 20:07 y 20:37 UTC).
   El workflow figura activo, está en `main` y el `cron` está bien escrito. Las manuales
   (`gh workflow run recolectar.yml`) funcionan y guardan bien.

**Tanda en curso: 1.2 a 1.5** (más la 1.6, pedida aparte y ya hecha). 1.2 y 1.3 hechas.
El recolector está en GitHub (workflow "Recolectar datos", minutos 7 y 37 de cada hora;
formato y uso en `recolector/LEEME.md`). Hay 3 mediciones reales en
`datos/2026-11-12.jsonl`, todas manuales, con las seis fuentes respondiendo. La 1.5 la
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

- 2026-11-12: página conectada a los datos reales (tarea 1.6); `ver_pagina.bat` para verla.
- 2026-11-12: recolector en GitHub (tareas 1.2 y 1.3); primeras mediciones reales guardadas.
- 2026-11-12: "paso a paso con permiso" vuelve, por tandas que define Bruno; D6 se ignora por ahora.
- 2026-11-12: Bruno decidió guardar los datos en archivos de texto por día (tarea 1.1 hecha).
- 2026-11-12: `PLAN_DE_TRABAJO.md` creado con la lista de Bruno ordenada; decisiones nuevas en `PLAN.md`.
- 2026-11-12: Twitch y YouTube probados desde GitHub con las claves reales; funcionan.
- 2026-11-12: reglas de trabajo traídas del proyecto de inglés; "paso a paso" en pausa hasta el 18 nov.
- 2026-11-12: regla para archivar `ESTADO_ACTUAL.md` en `historial/` al pasar de 20.000 bytes.
- 2026-11-12: Graphify instalado en el proyecto y primer grafo generado (`graphify-out/`).
- 2026-11-12: sistema de relevo entre sesiones y skill Impeccable 0.1.22.
- 2026-11-12: página rediseñada con hoteles art déco de Miami; pruebas de fuentes sin clave.

## Pendiente

La lista completa y su orden están en `PLAN_DE_TRABAJO.md`. Lo inmediato:

1. Tarea 1.4: lograr que GitHub lance solo las ejecuciones programadas (fallo pendiente).
2. Tarea 1.5: confirmar dos ejecuciones programadas seguidas; 1.5b opcional (revisar 24 horas).
3. Tarea 1.7: prueba completa antes del 18 de noviembre.
4. Opcional: el hook de diseño de Impeccable (Bruno ejecuta `npx impeccable install` en el PC).
