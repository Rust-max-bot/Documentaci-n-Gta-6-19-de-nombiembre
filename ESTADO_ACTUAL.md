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
  filtrarlos (2.6);
- la cápsula del tiempo (7.4) como dos cintas de casete al final ("Cara A" y "Cara B", con "Leer todo");
- "Última medición hace X min" y actualización sola si la página queda abierta (2.10), imagen
  propia al compartir el enlace y en la pestaña (2.11) y botón flotante "☰ Secciones" (2.12);
- titulares de cada día en archivos aparte que se cargan al mostrarlos (2.13), para
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
`recolector/generar_web.py` (junto con `web/dias/`, los titulares de cada día, y
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

- 2026-11-17: `PLAN.md` archivado en `historial/PLAN_2026-11-17-2.md` (pasó de 20.000 bytes); el nuevo conserva todas las tareas pendientes con su texto, las decisiones y los riesgos vigentes.
- 2026-11-17: 9.8 hecha (opción A de Bruno): animación al cambiar de día en el Resumen del día y en la tabla de Twitch y Kick (`web/animaciones.js`, apagable con `ACTIVAS`; respeta "reducir movimiento"). Arreglado lo que Bruno notó: cuadros que tardaban (ahora entran casi juntos), hora cortada en la tabla (las filas de Twitch y Kick de una medición se animan juntas) y fotos que saltaban (fundido). Medido: sin desborde a 384 px ni errores de consola.
- 2026-11-17: anotadas en `PLAN.md` cinco tareas pedidas por Bruno, sin hacer aún: 9.8 animaciones al cambiar de día (Resumen del día y tabla de Twitch y Kick), 9.9 animar mostrar/ocultar de Titulares, 9.10 fotos de perfil de Kick, 9.11 buscar una skill de animación y 9.12 rehacer `compartir.jpg` (queda para después).
- 2026-11-17: hotel "HOTEL" (2.ª corrección, pedido de Bruno): la línea blanca del remate del techo ya no cruza el letrero entre la O y la T, y la hoja de la palmera derecha que colgaba como una antena hasta el techo del hotel es más corta.
- 2026-11-17: hotel "HOTEL" de la portada corregido (pedido de Bruno, con captura): la marquesina flotaba sobre la puerta (su sombra quedaba tapada por la planta baja) y la planta baja era 2 unidades más angosta que los pisos de arriba. Ahora la marquesina se apoya en el dintel con su sombra visible y la planta baja tiene el ancho del edificio.
- 2026-11-17: menú "☰ Secciones": ya no asoma la barra de desplazamiento al abrirlo y cerrarlo en el PC (fallo visto por Bruno). Solo aparece si la lista no cabe, en pantallas bajas, y cuando ya terminó de abrirse.
- 2026-11-17: programada una consulta previa de Trends para el 18 nov a las 11:15 UTC (8:15 de Chile), justo después de la salida en Nueva Zelanda (pedido de Bruno). Va en `datos/trends_previa/`; la sección de Doomsday la toma sola. **El 18, revisar que corrió** (Actions → "Trends extra (6.1)"); si no, lanzarla a mano con la casilla "previa".
- 2026-11-17: 6.7 hecha (opción B de Bruno): sección "GTA 6 frente a Avengers: Doomsday" con la consulta previa de Trends (`datos/trends_previa/`, desde GitHub; no bloquea la 6.1). Cuando llegue la 6.1 (21-24 nov), la página la usa sola.
- 2026-11-17: 6.9 hecha (decisión de Bruno; PR de la rama `claude/project-thread-fwlw7x` hasta que Bruno lo una): Reddit fuera de la página (sección, menú, récord, cuadro del Resumen del día, imagen descargable y textos) y del recolector. Lo guardado sigue en `datos/`. Con 7 cuadros, "Mediciones" ocupa toda la última fila del resumen (igual que ya pasaba los días sin Kick).
- 2026-11-17: revisado para la hora cero de Nueva Zelanda (18 nov, 11:00 UTC): mediciones cada 30 min, sin fallos salvo Reddit (RSS bloqueado por Reddit desde las 18:37 UTC). Consulta de la 6.1 probada desde el PC sin guardar (Doomsday funciona). Anotadas 6.7 y 6.8 en `PLAN.md`.
- 2026-11-17: rediseño de la portada (pedido de Bruno, hecho en la rama `rediseno/portada` y aprobado y unido a `main` el mismo día): nueve hoteles distintos, torres con vidrio, tres palmeras distintas, calle con paso de cebra, caseta de salvavidas, nubes, pelícanos y mar nuevos. El dibujo lo escribe `diseno/dibujar_portada.py` (no editar a mano el bloque `PORTADA` de `index.html`). Detalle en `DISENO_VISUAL.md`.
- 2026-11-17: Impeccable actualizado a 0.1.25 y, de la propuesta de mejoras visuales de Bruno, hechas las tres que elegió: fichas de la portada y menú "Secciones" de vidrio, y borde neón al pasar el mouse en 1986. Lo demás de la propuesta ya existía; el "aparecer al bajar" se descartó (genérico, según Impeccable).
- 2026-11-17: portada arreglada: con el zoom alejado o en pantallas anchas los edificios ya no se cortan por arriba (se ve la grúa) y las palmeras salen de la arena, no del agua. `web/compartir.jpg` rehecha.
- 2026-11-17: hechas 9.5, 9.6 y 9.7 (opciones A de Bruno): los Shorts y los videos ya no cambian de alto ni de lugar al pasar de Global a En español; el gráfico de cada tarjeta muestra las visitas al inicio y las de ahora; "GTA frente a lo más visto" pone a GTA VI al centro (puesto en Twitch y videos en tendencia, con su historial) y ya no deja un hueco bajo Twitch.
- 2026-11-17: anotadas en `PLAN.md` tres mejoras de diseño pedidas por Bruno, sin hacer aún: 9.5 Shorts del mismo alto en Global y En español, 9.6 gráficos de las tarjetas más claros y 9.7 rediseño de "GTA frente a lo más visto". `PLAN.md` pasó de 20.000 bytes: el anterior quedó en `historial/PLAN_2026-11-17.md`.
- 2026-11-17: línea de tiempo rediseñada (opción A de Bruno): agrupada por día, la hora arriba del texto (ya no choca), puntos alineados con el ícono del tipo, filtros por tipo, "Ver los N eventos" (8 a la vista) y enlace a la sección de cada evento.

## Pendiente

La lista completa y su orden están en `PLAN.md`. Resumen (2026-11-14):

- **(2026-11-17, nuevo):** 9.9 a 9.12 (animar Titulares, fotos de Kick, skill de animación, `compartir.jpg`; ver `PLAN.md`). 6.8 diseñar la sección de la 6.1 desde el 20 nov. **Reddit:** quitado (6.9, hecha el 17 nov): Reddit bloqueó su RSS público; solo volvería con la clave oficial.
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
5. **Fase 5** (después del lanzamiento): búsqueda calmada.
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
8. **Para después (Bruno, 2026-11-17):** configurar Impeccable para que revise lo que importa en este proyecto. Mientras tanto, su revisión automática queda **apagada** (`.impeccable/config.json`, `hook.enabled: false`): sus avisos chocaban con decisiones de Bruno (neón de 1986, brillos, rebotes). Se puede correr a mano con `impeccable detect`.
