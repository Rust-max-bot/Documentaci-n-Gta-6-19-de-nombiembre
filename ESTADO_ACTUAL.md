# Estado actual del proyecto

> Estado **vivo** y corto. Las reglas y la forma de trabajo están en `CLAUDE.md`; las
> tareas, decisiones vigentes y riesgos, en `PLAN.md` (un solo plan desde el 2026-11-16). Al iniciar una sesión se lee este archivo entero.

## Cómo usar este archivo

- Se actualiza en el mismo commit del paso, solo si cambia el estado, un pendiente o
  "Dónde quedamos" (ver "Guardado al terminar cada paso" en `CLAUDE.md`). Nada de reglas aquí.
- **Tiene que seguir siendo corto.** "Últimos cambios" guarda unas 8 entradas de una línea;
  las viejas se borran porque ya están en `git log`.
- Si pasa de 20.000 bytes, se archiva en `historial/` y se empieza uno nuevo (ver
  "Archivar `ESTADO_ACTUAL.md` y `PLAN.md`" en `CLAUDE.md`).

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
- la cápsula del tiempo (7.4) como dos cintas de casete al final ("Cara A" y "Cara B", con "Leer todo");
- "Última medición hace X min" y actualización sola si la página queda abierta (2.10), imagen
  propia al compartir el enlace y en la pestaña (2.11) y botón flotante "☰ Secciones" (2.12);
- titulares y Reddit de cada día en archivos aparte que se cargan al mostrarlos (2.13), para
  aguantar muchas visitas (2.14); revisión de seguridad hecha (2.15);
- "GTA 6 frente a otros lanzamientos" con barras (7.9), el resumen del día descargable como
  imagen cuadrada (7.8) y el álbum de momentos (7.7).

**Álbum (7.7):** está vacío hasta que Bruno suba fotos a `web/album/` con el nombre
`AAAA-MM-DD HH-MM texto.jpg` (hora de Santiago). Guía paso a paso, también desde el celular,
en `web/album/LEEME.md`. La foto aparece en la página en la siguiente publicación.

**Cápsula (7.4):** "Lo que espero" ya está en `web/capsula.js` (2026-11-15, texto de Bruno
con la ortografía corregida por Claude y aprobado por él; en el PR de la rama
`claude/project-thread-wk5yjx` hasta que Bruno lo una). Falta "Lo que me pareció", después del
lanzamiento: la 7.4 sigue en `[ ]`. El recordatorio del 17 nov ya no hace falta.

**El recolector funciona solo.** Lo lanza el despertador de Cloudflare (Worker
`despertador-recolector`, horario `7,37 * * * *` y, para la 6.1, `41 15 21-24 11 *`; el minuto 37 solo mide del 17 nov 00:07 al
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
vez por hora: la primera, a las 22:07 UTC, trajo 25 videos. La página la muestra con la pestaña "En español" de los videos. **Desde el 15 nov (6.5, pedido de Bruno, en el PR de la rama `claude/project-thread-ff8vqi` hasta que Bruno lo una):** cada video guarda si es Short, su duración y sus temas; hay una tercera búsqueda, de videos de 4 a 20 minutos (`youtube_largos`), y las tres búsquedas se hacen como mucho una vez por hora (unas 7.500 unidades al día). La página filtra lo que no es de GTA 6 (`recolector/filtro_videos.json`: se puede apagar) y muestra los Shorts en una tira aparte. Se apaga, enciende o
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

**Tanda del 14 nov por la tarde (pedida por Bruno, terminada):** 7.10 "Copias vendidas en los
primeros días" (13 juegos con fuente, Ocarina incluido, opción B: barras por plazo; GTA 6 espera
su cifra oficial en `gta6` de `web/lanzamientos.js`), 7.11 "Próximamente" (opción C: camino
hacia adelante) y la pregunta 5 de la 6.1 (GTA 6 frente a Avengers: Doomsday, día por día;
probada sin guardar). La **Fase 8 (GTA 6 en PC)** queda anotada y dormida hasta que Bruno
avise con una confirmación oficial.

**Reglas en pausa:** ninguna. "Paso a paso con permiso" está activa **por tandas**: Bruno
dice qué pasos hacer y Claude no para hasta completarlos (ver `CLAUDE.md`). Última tanda
(14 nov, pedida por Bruno, **terminada**): 2.13 datos por días, 2.14 muchas visitas, 2.15
seguridad, 7.8 resumen como imagen, 7.7 álbum y 7.9 comparar lanzamientos. Antes: las tres mejoras 2.10 a 2.12; antes, README, publicar la página
y la nota "hecho con Claude", 2.7 a 2.9). Antes, ese día: 7.6, 7.5,
la línea de tiempo (PR #16) y el filtro por día de los titulares (2.6, PR #17), unidos. Quedan 7.1 (después del lanzamiento) y 7.4 (el texto de Bruno). La 6.1 se ejecuta una vez entre el 20 y el 25 nov: el programa
(`recolector/trends_extra.py`, workflow "Trends extra (6.1)") quedó listo y probado el 13 nov;
Bruno ya eligió las palabras de la comparación.

## Últimos cambios

- 2026-11-17: hechas 9.5, 9.6 y 9.7 (opciones A de Bruno): los Shorts y los videos ya no cambian de alto ni de lugar al pasar de Global a En español; el gráfico de cada tarjeta muestra las visitas al inicio y las de ahora; "GTA frente a lo más visto" pone a GTA VI al centro (puesto en Twitch y videos en tendencia, con su historial) y ya no deja un hueco bajo Twitch.
- 2026-11-17: anotadas en `PLAN.md` tres mejoras de diseño pedidas por Bruno, sin hacer aún: 9.5 Shorts del mismo alto en Global y En español, 9.6 gráficos de las tarjetas más claros y 9.7 rediseño de "GTA frente a lo más visto". `PLAN.md` pasó de 20.000 bytes: el anterior quedó en `historial/PLAN_2026-11-17.md`.
- 2026-11-17: línea de tiempo rediseñada (opción A de Bruno): agrupada por día, la hora arriba del texto (ya no choca), puntos alineados con el ícono del tipo, filtros por tipo, "Ver los N eventos" (8 a la vista) y enlace a la sección de cada evento.
- 2026-11-17: Rockstar a mano en "¿Se cayeron los servidores?" (opción C de Bruno): las revisiones que anota la skill `anotar-rockstar` en `web/eventos.js` salen como puntos verdes o rojos sobre una línea punteada, en un recuadro "a mano", con la última revisión y "No se vio caída / Sí, tuvo problemas" contando revisiones. La skill no cambia: la página lee sus dos textos fijos.
- 2026-11-17: revisión de seguridad de las cuentas hecha por Bruno (2.15): clave de YouTube restringida a "YouTube Data API v3", ruleset "proteger main" (no se puede borrar ni reescribir `main`; las subidas normales del recolector siguen funcionando) y "Secret scanning" + "Push protection" activados. Comprobado por Claude con la API de GitHub y con la medición de las 15:07 UTC (YouTube trae sus videos).
- 2026-11-17: íconos pequeños propios (opción C de Bruno): en los títulos de Twitch y Kick, Trends, servidores, videos, titulares y Reddit, en "Videos" y "Shorts" y en la tabla (solo PC). No son los logotipos de las plataformas (sus reglas de marca no lo permiten). Ese día, las mediciones del minuto 37 funcionan (29 seguidas); Google Noticias dio 429 en 5 de 29 (lo arregla la 9.3, después del 22).
- 2026-11-16: 9.4, segunda tanda: eje de los gráficos sin textos encimados (opción C de Bruno: fechas y horas cortas según el espacio), `partes()` 12 veces más rápida con muchos datos y `probar_pagina.py` revisa textos encimados. Queda para después del 22: aligerar `datos.js` y las medidas al cargar.
- 2026-11-16: 9.4 optimizar la página, primera tanda (solo medir, sin cambios): eje de horas del gráfico de Twitch encimado a 384 px (ya hoy), `partes()` lenta con muchos datos y `datos.js` de ~1,6 MB el 19 dic. Detalle y próximos pasos en `PLAN.md`.
- 2026-11-16: 9.2 "¿Cuánta gente faltó?" descartada (decisión de Bruno); queda la 9.3 (después del 22).
- 2026-11-16: 9.1 hecha (opción C de Bruno): "¿Se cayeron los servidores?" con caja "Ahora" (verde o rojo, con la hora de la última medición) y, por servicio, un cuadro por día y cada medición de las últimas 24 h; ya no crece sin fin. Se prueba con `?probar-servidores-mal`.
- 2026-11-16: tres planes nuevos en `PLAN.md`, en este orden (Bruno): 9.1 servidores más cortos (antes del 19), 9.2 "¿Cuánta gente faltó?" y 9.3 menos alarmas por Google (después del 22). El fallo de las 21:07 UTC fue Noticias 429: la medición se guardó y no se perdió nada.
- 2026-11-16: Graphify actualizado de 0.9.107 a 0.9.111 (programa en Python 3.14, skill del proyecto y la del usuario); "Trends sin huecos" marcada como hecha en `PLAN.md` (pedido de Bruno).
- 2026-11-16: página probada en Firefox 159 (pedido de Bruno): sin errores ni desborde a 1280 y 384 px en los dos estilos. Nueva opción `python pruebas/probar_pagina.py --firefox` (necesita `python -m playwright install firefox`); el aviso de Firefox sobre la letra Rajdhani de Google Fonts no cuenta como fallo.
- 2026-11-16: pestañas Global / En español de los videos sin cambios de tamaño (pedido de Bruno): las dos se dibujan una vez, apiladas en el mismo lugar, y la sección mide siempre lo de la más alta (también la nota de arriba). Al cambiar, la vieja se desvanece y las tarjetas de la nueva entran en cascada con las miniaturas enfocándose (~0,5 s).
- 2026-11-16: imagen del Resumen del día: botón "Personalizar" con vista previa y casillas (diseño A de Bruno; todo marcado por defecto), Kick en la imagen y en la tarjeta, lema de 1986 legible y emojis que ya no se cortan a la mitad.
- 2026-11-16: imagen al compartir nueva (opción C de Bruno): un solo título grande sobre las dos portadas al día (con suelo), lema en franja legible y "Twitch · Kick · YouTube · Google Trends"; la hace `pruebas/hacer_compartir.py --opcion C --guardar`. Kick agregado al texto de la vista previa.
- 2026-11-16: la 6.1 se lanza sola: el despertador de Cloudflare (nuevo horario `41 15 21-24 11 *`, puesto por Claude a pedido de Bruno) del 21 al 24 nov, con respaldo de GitHub a las 18:41 UTC; guarda una sola vez. Recordatorios en el calendario de Bruno el 21 y el 24.
- 2026-11-16: gráfico de Trends por hora (opción A de Bruno): cada hora con el valor de la medición más nueva que la trae; sin huecos y la última semana en una sola escala.
- 2026-11-16: Trends más resistente al 429 (pedido de Bruno): guarda la serie de 7 días (~169 puntos) en vez de 24 y reintenta una vez a los 20 s. Falta en la página: serie por hora y el problema de la escala (ver "Trends sin huecos" en `PLAN.md`).
- 2026-11-16: anotada en el plan la API alfa de Google Trends; Bruno envió el formulario él mismo (falta saber si responden).
- 2026-11-16: titulares como resumen (opción B de Bruno): los 8 medios que más publican y los 6 últimos; la lista completa y el filtro por día quedan tras el botón "Ver los N titulares". El resumen lo deja hecho `generar_web.py` en `datos.js`.

## Pendiente

La lista completa y su orden están en `PLAN.md`. Resumen (2026-11-14):

0. **(2026-11-16, orden de Bruno):** 9.4 optimizar la página (eje y `partes()` hechos; lo
   grande, después del 22), 9.1 servidores más cortos (**hecha**, opción C) y 9.3
   menos alarmas por Google (después del 22). Descartados (Bruno): la 9.2 "¿Cuánta gente
   faltó?", Cloudflare Radar y medir las redes de descarga de las consolas. Detalle en `PLAN.md`.
1. **7.4:** "Lo que espero" ya está en la página (PR #25, unido el 15 nov). Después del lanzamiento, Bruno
   escribe "Lo que me pareció" en `web/capsula.js`.
2. **Fase 4:** 4.3 análisis de datos (necesita varios días de datos).
3. **Fase 6** (ideas de Bruno): 6.1 más Google Trends, **una sola vez entre el 20 y el 25 nov**,
   fuera del recolector de cada hora (decisión de Bruno, 2026-11-13; ver `PLAN.md`). Programa
   listo y probado, con las palabras que eligió Bruno; falta ejecutarlo y mostrarlo. **Trends sin huecos** (16 nov): hecho. La 6.1 se lanza sola del 21 al 24 nov (Cloudflare + GitHub); el 21, comprobar que se guardó. 6.2 y 6.3, hechas. 6.4 videos en español, hecha (pestañas en la página). 6.6 Kick e Instagram (pedido de Bruno; Kick investigada: Bruno crea la app en kick.com/settings/developer y guarda las claves en los Secrets; si se quiere el día del lanzamiento, antes del 19 nov).
4. **Fase 7:** 7.1 rebobinar (después del lanzamiento); 7.13 sección de memes (requiere investigación); 7.3 y 7.5 a 7.11, hechas. Cuando Take-Two publique las ventas, escribirlas en `gta6` de `web/lanzamientos.js`.
   **Fase 8 (GTA 6 en PC):** dormida hasta que Bruno avise con confirmación oficial.
5. **Fase 5** (después del lanzamiento): búsqueda calmada; clave de Reddit.
6. **Ideas sueltas:** 2.5 TikTok (sin acceso fácil); D6 (Bruno pidió ignorarla por ahora).
7. **Bruno:**
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
     `claude/project-thread-odgsms`, `revision/resumen-imagen` (capturas de opciones ya
     elegidas; la nube no puede borrar ramas) y, cuando se una su último PR,
     `claude/project-thread-yceo71`.
8. **Opcional:** el hook de Impeccable (`npx impeccable install` en el PC).
