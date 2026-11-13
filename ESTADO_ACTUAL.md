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
  "Archivar `ESTADO_ACTUAL.md` y `PLAN_DE_TRABAJO.md`" en `CLAUDE.md`).

## Dónde quedamos

*(2026-11-13, ~21:30 UTC.)*

**La página está lista para el lanzamiento.** Hechas las fases 0, 1, 2 (menos la 2.5, para
después), 3 y las tareas 4.1, 4.2 y 7.2. Lo que tiene:
- dos estilos de Miami (1986 y 2026, paleta B "Atardecer encendido") con torres de Miami;
- día, atardecer y noche según la hora de Miami, con botones;
- hora cero con fuegos y reflectores (se prueba con `?probar-hora-cero`);
- videos y Twitch con miniaturas y enlaces; titulares por páginas; Reddit por RSS;
- la cápsula del tiempo (7.4) como dos postales al final.

**Lo único con fecha:** Bruno escribe "Lo que espero" en `web/capsula.js` antes del 19 nov
(o se lo pasa a Claude para ponerlo). La 7.4 queda en `[ ]` hasta entonces.

**El recolector funciona solo.** Lo lanza el despertador de Cloudflare (Worker
`despertador-recolector`, horario `7,37 * * * *`; el minuto 37 solo mide del 17 nov 00:07 al
22 nov 00:07 UTC). Revisado el 2026-11-13: cada hora desde las 02:07 UTC, sin huecos en
ninguna fuente. GitHub ya no lo lanza por su cuenta (se quitó el `schedule` de
`recolectar.yml`). **Revisado en Cloudflare el 2026-11-13 (~21:30 UTC):** el código activo
es igual, línea por línea, a `despertador/worker.js`; el horario es `7,37 * * * *` y el
secreto `GITHUB_TOKEN` existe (su valor no se ve ni está en el repositorio). La clave de GitHub del Worker caduca después del 19 dic (31 ene 2027, o
~1 mar 2027 según recuerda Bruno). Desde el 13 nov también guarda lo de la 6.3 (puesto de GTA
en Twitch y tendencias de YouTube), que la página ya muestra en "GTA frente a lo más visto"; y,
desde el PR #11 (unido el 2026-11-13), las visitas de los 4 videos oficiales de GTA VI
(fuente `youtube_trailers`, tarea 6.2), que se ven en "Logros y récords". Se apaga, enciende o
alarga en `recolector/interruptor.json` (por defecto, hasta el 19 dic).

**Si un día faltan mediciones:** mirar el registro del Worker en Cloudflare
(*Observability*); lo más probable sería la clave (caducada o sin permiso).

**Para ver la página:** doble clic en `ver_pagina.bat` (trae las mediciones, prepara
`web/datos.js` y abre la página). `web/datos.js` lo genera `recolector/generar_web.py`: no
se edita a mano ni va a git.

**Trabajo en PC y nube:** revisado el 2026-11-13. El PC y GitHub están iguales y no hay pull
requests abiertos. El grafo de Graphify está al día en el código. La parte de los documentos
puede ir atrasada: volver a leerlos gasta tokens, así que solo si Bruno lo pide. Guía para
la nube en `NUBE.md`. En la nube, las fotos de YouTube y Twitch no cargan (su red bloquea
esos sitios): no es un fallo de la página.

**Fecha límite:** lanzamiento el 19 de noviembre de 2026, 00:00 de Santiago.

**Reglas en pausa:** ninguna. "Paso a paso con permiso" está activa **por tandas**: Bruno
dice qué pasos hacer y Claude no para hasta completarlos (ver `CLAUDE.md`). Tanda actual:
ninguna (la de la 6.3 y 6.2 terminó el 2026-11-13). Lo siguiente: explicarle a Bruno los
problemas de la 6.1 y sus soluciones, y esperar si sigue.

## Últimos cambios

- 2026-11-13: sección "Logros y récords" en la página, con los tráilers oficiales (6.2, opción A de Bruno).
- 2026-11-13: la página muestra "GTA frente a lo más visto" (6.3, opción A de Bruno) y el recolector mide los 4 videos oficiales de GTA VI (6.2).
- 2026-11-13: estado anterior archivado en historial/ESTADO_2026-11-13.md
- 2026-11-13: revisado el despertador: sin claves ni datos de Bruno en el repositorio; el Worker de Cloudflare es igual a la copia. Hallado: el correo de Outlook en las uniones de PR hechas desde la web.
- 2026-11-13: `PLAN_DE_TRABAJO.md` archivado en `historial/PLAN_DE_TRABAJO_2026-11-13.md` y reescrito con lo pendiente; regla nueva: también se archiva al pasar de 20.000 bytes (decisión de Bruno).
- 2026-11-13: cápsula del tiempo en la página, como dos postales de Miami (7.4, opción B de Bruno); falta su texto.
- 2026-11-13: hora cero con fuegos y reflectores (7.2) y escena de día, atardecer y noche (4.1 y 4.2).
- 2026-11-13: el recolector guarda el puesto de GTA en Twitch y las tendencias de YouTube (6.3).

## Pendiente

La lista completa y su orden están en `PLAN_DE_TRABAJO.md`. Resumen (2026-11-13):

1. **Antes del 19 nov:** 7.4, Bruno escribe sus expectativas en `web/capsula.js`.
2. **Fase 4:** 4.3 análisis de datos (necesita varios días de datos).
3. **Fase 6** (ideas de Bruno): 6.1 más Google Trends (**Bruno pidió parar antes y que se le
   expliquen los problemas y soluciones**). 6.2 y 6.3, hechas.
4. **Fase 7:** 7.1 rebobinar; 7.3 viaje en el tiempo; 7.5 resumen del día.
5. **Fase 5** (después del lanzamiento): búsqueda calmada; clave de Reddit.
6. **Ideas sueltas:** 2.5 TikTok (sin acceso fácil); un filtro por día en los titulares
   (idea de Bruno, sin tarea todavía); D6 (Bruno pidió ignorarla por ahora).
7. **Bruno:**
   - pedir a soporte de GitHub que borre la referencia del PR #1 (deja alcanzable el primer
     commit, con su correo de Outlook);
   - activar en GitHub "Keep my email addresses private" y "Block command line pushes that
     expose my email". Revisado el 2026-11-13: los 9 commits "Merge pull request #2…#10"
     que crea GitHub al unir desde la web llevan el correo de Outlook de Bruno y están en
     `main`, que es público; cada unión nueva desde la web suma otro. **Bruno lo deja para
     después** (2026-11-13: lo peor sería recibir correos no deseados). No volver a
     proponerlo hasta que él lo retome. Quitar el correo de esos commits exige reescribir
     `main` con `--force`: solo si Bruno lo autoriza;
   - borrar en GitHub las ramas ya unidas o de capturas: `claude/project-thread-dpdy9p`,
     `claude/project-thread-en9qib`, `claude/project-thread-mi5ckb`,
     `claude/project-thread-odgsms`, `revision/hora-cero` y `revision/dia-noche` (revisado
     el 2026-11-13: no tienen nada que falte en `main`; las de `revision/` solo tienen
     capturas).
8. **Opcional:** el hook de Impeccable (`npx impeccable install` en el PC).
