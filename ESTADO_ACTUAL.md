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

**Siguiente tarea: `PLAN_DE_TRABAJO.md`, tarea 1.2** — programar el recolector. La tarea
1.1 quedó resuelta: Bruno aceptó guardar los datos en archivos de texto, uno por día, en
`datos/` (una línea por medición).

**Hecho:**

- La página (`web/`) con dos estilos de Miami, todavía con datos de ejemplo.
- Las tres claves están guardadas como secretos de GitHub (`TWITCH_CLIENT_ID`,
  `TWITCH_CLIENT_SECRET`, `YOUTUBE_API_KEY`).
- **Todas las fuentes probadas desde GitHub** con el workflow "Probar fuentes"
  (`recolector/probar_fuentes.py`, se lanza con `gh workflow run probar-fuentes.yml`):
  Twitch, YouTube, Google Trends, titulares, PlayStation y Xbox funcionan; Rockstar no.
  Ese archivo ya tiene escritas las consultas que el recolector debe reutilizar.
- Sistema de trabajo: relevo entre sesiones, guardado automático, archivo del estado a los
  20.000 bytes, reglas de trabajo, Graphify e Impeccable instalados.

**Falta lo principal: el recolector no existe todavía y no se está guardando ningún dato.**
Bruno quiere empezar a registrar cuanto antes, para comparar el interés previo con el del
lanzamiento.

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

1. Tareas 1.2 a 1.5: recolector, interruptor, ejecución cada 30 minutos y vigilancia de las
   primeras 24 horas.
2. Tareas 1.6 y 1.7: conectar la página con datos reales y prueba completa antes del 18.
3. Opcional: el hook de diseño de Impeccable (Bruno ejecuta `npx impeccable install` en el PC).
