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

*(2026-11-14, ~05:00 UTC.)*

**La página está lista para el lanzamiento.** Hechas las fases 0, 1, 2 (menos la 2.5, para
después), 3 y las tareas 2.6 a 2.15, 4.1, 4.2, 6.2, 6.3, 6.4, 7.2, 7.3 y 7.5 a 7.9. **La página está
publicada en internet** (2.8) y dice en el pie y en el README que está hecha con Claude a
pedido de Bruno (2.9). Lo que tiene:
- dos estilos de Miami (1986 y 2026, paleta B "Atardecer encendido") con torres de Miami que
  suben una por una al pasar a 2026;
- día, atardecer y noche según la hora de Miami, con botones;
- hora cero con fuegos y reflectores (se prueba con `?probar-hora-cero`);
- cuenta regresiva con botones Nueva Zelanda, Chile y Miami (7.6; se prueba con
  `?probar-fecha=2026-11-18T12:30Z`);
- línea de tiempo con eventos automáticos (cifras de Twitch, video más visto, tráilers, hora
  cero de cada lugar) y "Resumen del día", una tarjeta por día (7.5);
- videos y Twitch con miniaturas y enlaces; titulares por páginas, con barras por día para
  filtrarlos (2.6); Reddit por RSS;
- la cápsula del tiempo (7.4) como dos postales al final;
- "Última medición hace X min" y actualización sola si la página queda abierta (2.10), imagen
  propia al compartir el enlace y en la pestaña (2.11) y botón flotante "☰ Secciones" (2.12);
- titulares y Reddit de cada día en archivos aparte que se cargan al mostrarlos (2.13), para
  aguantar muchas visitas (2.14); revisión de seguridad hecha (2.15);
- "GTA 6 frente a otros lanzamientos" con barras (7.9), el resumen del día descargable como
  imagen cuadrada (7.8) y el álbum de momentos (7.7).

**Álbum (7.7):** está vacío hasta que Bruno suba fotos a `web/album/` con el nombre
`AAAA-MM-DD HH-MM texto.jpg` (hora de Santiago). Guía paso a paso, también desde el celular,
en `web/album/LEEME.md`. La foto aparece en la página en la siguiente publicación.

**Lo único con fecha:** Bruno escribe "Lo que espero" en `web/capsula.js` antes del 19 nov
(o se lo pasa a Claude para ponerlo). La 7.4 queda en `[ ]` hasta entonces. Bruno lo dejó
para después (2026-11-14) y pidió que se le recuerde: recordatorio el 17 nov, 19:00 de Chile.

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
(fuente `youtube_trailers`, tarea 6.2), que se ven en "Logros y récords". Desde el PR #12 (unido el
2026-11-13), también una búsqueda de videos en español (fuente `youtube_es`, tarea 6.4), una
vez por hora: la primera, a las 22:07 UTC, trajo 25 videos. La página la muestra con la pestaña "En español" de los videos. Se apaga, enciende o
alarga en `recolector/interruptor.json` (por defecto, hasta el 19 dic).

**Si un día faltan mediciones:** mirar el registro del Worker en Cloudflare
(*Observability*); lo más probable sería la clave (caducada o sin permiso).

**Para ver la página:** en internet, en
<https://rust-max-bot.github.io/Documentaci-n-Gta-6-19-de-nombiembre/> (tarea 2.8; la publica
`publicar-pagina.yml` tras cada medición; Pages activado por Bruno el 14 nov). Desde la nube
no se puede abrir `github.io` (la red lo bloquea): para revisarla, mirar la ejecución del
workflow en GitHub. En el PC, doble clic en `ver_pagina.bat` (trae las
mediciones, prepara `web/datos.js` y abre la página). `web/datos.js` lo genera
`recolector/generar_web.py` (junto con `web/dias/`, los titulares y Reddit de cada día, y
`web/version.json`): no se editan a mano ni van a git.

**Trabajo en PC y nube:** revisado el 2026-11-13. El PC y GitHub están iguales y no hay pull
requests abiertos. El grafo de Graphify está al día en el código. La parte de los documentos
puede ir atrasada: volver a leerlos gasta tokens, así que solo si Bruno lo pide. Guía para
la nube en `NUBE.md`. En la nube, las fotos de YouTube y Twitch no cargan (su red bloquea
esos sitios): no es un fallo de la página.

**Fecha límite:** lanzamiento el 19 de noviembre de 2026, 00:00 de Santiago.

**Reglas en pausa:** ninguna. "Paso a paso con permiso" está activa **por tandas**: Bruno
dice qué pasos hacer y Claude no para hasta completarlos (ver `CLAUDE.md`). Última tanda
(14 nov, pedida por Bruno, **terminada**): 2.13 datos por días, 2.14 muchas visitas, 2.15
seguridad, 7.8 resumen como imagen, 7.7 álbum y 7.9 comparar lanzamientos. Antes: las tres mejoras 2.10 a 2.12; antes, README, publicar la página
y la nota "hecho con Claude", 2.7 a 2.9). Antes, ese día: 7.6, 7.5,
la línea de tiempo (PR #16) y el filtro por día de los titulares (2.6, PR #17), unidos. Quedan 7.1 (después del lanzamiento) y 7.4 (el texto de Bruno). La 6.1 se ejecuta una vez entre el 20 y el 25 nov: el programa
(`recolector/trends_extra.py`, workflow "Trends extra (6.1)") quedó listo y probado el 13 nov;
Bruno ya eligió las palabras de la comparación.

## Últimos cambios

- 2026-11-14: álbum de momentos (7.7, fotos instantáneas, opción B de Bruno), resumen del día como imagen cuadrada (7.8, opción A) y GTA 6 frente a otros lanzamientos con barras (7.9, opción A); `PLAN_DE_TRABAJO.md` archivado en `historial/PLAN_DE_TRABAJO_2026-11-14.md`.
- 2026-11-14: revisión de seguridad con el skill de Cloudflare (2.15): sin fallos confirmados; 4 refuerzos (comillas, miniaturas, CSP, clave del checkout) y 3 cosas para Bruno en sus cuentas (`PLAN.md`).
- 2026-11-14: datos por días (2.13: `datos.js` de 222 a 50 KB, los titulares de cada día se cargan al mostrarlos) y revisión de datos nuevos con `version.json` para aguantar muchas visitas (2.14).
- 2026-11-14: actualización sola con "Última medición hace X min" (2.10), vista previa al compartir con ícono propio (2.11, opción C de Bruno) y menú de secciones con botón flotante (2.12, opción B de Bruno).
- 2026-11-14: nota "hecho con Claude" en el README y en el pie de la página (2.9, pedido de Bruno); en lo público, Bruno aparece como "Rust" (regla nueva en `CLAUDE.md`).
- 2026-11-14: README al día (2.7) y página publicada en GitHub Pages para verla desde el celular (2.8, pedido de Bruno).
- 2026-11-14: filtro por día en los titulares con barras por día (2.6, opción C de Bruno).
- 2026-11-14: cuenta regresiva con botones Nueva Zelanda, Chile y Miami (7.6), "Resumen del día" (7.5) y más eventos automáticos en la línea de tiempo (pedido de Bruno); diseño de Claude porque Bruno pidió no preguntarle.
- 2026-11-13: las torres nuevas suben una por una al pasar a 2026 y bajan al volver a 1986 (7.3, opción B de Bruno).

## Pendiente

La lista completa y su orden están en `PLAN_DE_TRABAJO.md`. Resumen (2026-11-14):

1. **Antes del 19 nov:** 7.4, Bruno escribe sus expectativas en `web/capsula.js`.
   7.6 hecha y unida (PR #16).
2. **Fase 4:** 4.3 análisis de datos (necesita varios días de datos).
3. **Fase 6** (ideas de Bruno): 6.1 más Google Trends, **una sola vez entre el 20 y el 25 nov**,
   fuera del recolector de cada hora (decisión de Bruno, 2026-11-13; ver `PLAN.md`). Programa
   listo y probado, con las palabras que eligió Bruno; falta ejecutarlo y mostrarlo. 6.2 y 6.3, hechas. 6.4 videos en español, hecha (pestañas en la página).
4. **Fase 7:** 7.1 rebobinar (después del lanzamiento); 7.3 y 7.5 a 7.9, hechas.
5. **Fase 5** (después del lanzamiento): búsqueda calmada; clave de Reddit.
6. **Ideas sueltas:** 2.5 TikTok (sin acceso fácil); D6 (Bruno pidió ignorarla por ahora).
7. **Bruno:**
   - revisar en sus cuentas 3 cosas de la revisión de seguridad (2.15, detalle en `PLAN.md`):
     clave de YouTube restringida a "YouTube Data API v3", regla en GitHub para que `main` no
     se pueda borrar ni reescribir, y "Secret scanning" + "Push protection" activados;
   - si quiere, borrar en GitHub la ejecución fallida 43541223135 de "Publicar página" (falló
     porque Pages aún no estaba activado; Actions → la ejecución → "…" → Delete workflow run);
   - pedir a soporte de GitHub que borre la referencia del PR #1 (deja alcanzable el primer
     commit, con su correo de Outlook);
   - activar en GitHub "Keep my email addresses private" y "Block command line pushes that
     expose my email". Revisado el 2026-11-13: los 9 commits "Merge pull request #2…#10"
     que crea GitHub al unir desde la web llevan el correo de Outlook de Bruno y están en
     `main`, que es público; cada unión nueva desde la web suma otro. **Bruno lo deja para
     después** (2026-11-13: lo peor sería recibir correos no deseados). No volver a
     proponerlo hasta que él lo retome. Quitar el correo de esos commits exige reescribir
     `main` con `--force`: solo si Bruno lo autoriza;
   - borrar en GitHub las ramas ya unidas: `claude/project-thread-en9qib`,
     `claude/project-thread-odgsms` y, cuando se una su último PR, `claude/project-thread-yceo71`.
8. **Opcional:** el hook de Impeccable (`npx impeccable install` en el PC).
