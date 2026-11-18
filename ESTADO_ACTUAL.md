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

*(2026-11-17, noche, hora de Chile.)*

**La página está lista para el lanzamiento y publicada** en
<https://rust-max-bot.github.io/Documentaci-n-Gta-6-19-de-nombiembre/> (la publica
`publicar-pagina.yml` tras cada medición). Hechas las fases 0, 1, 3, casi toda la 2 (falta la
2.5, TikTok), la 4.1 y 4.2, la 6 (menos 6.1, 6.6 Instagram y 6.8), la 7 (menos 7.1, 7.4 y 7.13)
y la 9 de la 9.1 a la 9.12, salvo 9.3, 9.4 y 9.11 (b). Qué tiene la página, sección por
sección: `historial/ESTADO_2026-11-17.md` y `README.md`.

**El recolector funciona solo.** Lo lanza el despertador de Cloudflare (Worker
`despertador-recolector`, horario `7,37 * * * *` y, para la 6.1, `41 15 21-24 11 *`; el minuto
37 solo mide del 17 nov 00:07 al 22 nov 00:07 UTC). Se apaga, enciende o alarga en
`recolector/interruptor.json` (por defecto, hasta el 19 dic). La clave de GitHub del Worker
caduca después del 19 dic. **Si un día faltan mediciones:** mirar el registro del Worker en
Cloudflare (*Observability*); lo más probable sería la clave.

**Tráilers oficiales (2026-11-17, pedido de Bruno):** "Logros y récords" mide ahora 7 videos de
GTA VI del canal principal de Rockstar (antes 4). Los 3 nuevos aparecen en la página desde la
primera medición con el cambio; su "+N desde…" empieza ese día.

**Para ver la página en el PC:** doble clic en `ver_pagina.bat`. `web/datos.js`, `web/dias/` y
`web/version.json` los genera `recolector/generar_web.py`: no se editan a mano ni van a git.
Desde la nube no se abre `github.io` ni cargan las fotos de YouTube y Twitch (red bloqueada).

**Fase 10, panel de control de videos (18 nov, en curso, sin código):** entrevista hecha y
plan en `PANEL_VIDEOS.md`; revisado por dos agentes (a favor y en contra) y sus arreglos
técnicos ya escritos ahí. **Todas las preguntas respondidas** (18 nov): Tendencias usa las
marcas; `ocultar` se quita; rescatar solo llega a las listas si el video está en la última
medición; configuración y motivos son perillas separadas; los descartados van en un archivo
aparte cargado a pedido. Detalle en `PANEL_VIDEOS.md`. Falta: la tanda 10.1 cuando Bruno la
pida (después del lanzamiento).

**Avisos vigentes:**
- **El 21 nov:** comprobar que la 6.1 se guardó (se lanza sola del 21 al 24 nov).
- `recolector/` se tocó el 17 nov (9.10 fotos de Kick, tráilers y 9.3 menos alarmas): si algo
  raro pasa, `git revert` del commit que corresponda.
- Un aviso **amarillo** en "Recolectar datos" es un fallo suelto de Google: no hace falta hacer
  nada. **Rojo** sí merece mirar.
- Freno de emergencia de la portada para el 19 si va lenta: `portada: false` en `ACTIVAS` de
  `web/animaciones.js`.
- Álbum (7.7): vacío hasta que Bruno suba fotos a `web/album/` (guía en `web/album/LEEME.md`).
- La revisión automática de Impeccable está **apagada** (`.impeccable/config.json`); se puede
  correr a mano con `impeccable detect`.

**Fecha límite:** lanzamiento el 19 de noviembre de 2026, 00:00 de Santiago.

**Reglas en pausa:** ninguna. "Paso a paso con permiso" está activa **por tandas** (ver
`CLAUDE.md`). Última tanda (17 nov, pedida por Bruno, **terminada**): dejar todo listo para el
lanzamiento (revisión completa y menos alarmas por Google). Antes: 9.12 y más tráilers.

## Últimos cambios

- 2026-11-17: estado anterior archivado en historial/ESTADO_2026-11-17.md
- 2026-11-18: Kick en "GTA frente a lo más visto" (pedido de Bruno, sin opciones de diseño): puesto de GTA VI en el recuadro y barras de categorías bajo las de Twitch. Fuente nueva `kick_ranking`: Kick no tiene ranking, así que lee todos sus directos (~12.500, 13 páginas) y suma el público por categoría. Probada en GitHub sin guardar en una rama de prueba (ya borrada); el recolector no se detuvo. Se ve desde la primera medición con el cambio. Si falla, `git revert` de su commit.
- 2026-11-18: directos de YouTube descartados por ahora (Bruno: datos poco limpios; motivos en `PLAN.md`). La página lo explica en la nota de "Espectadores en Twitch y Kick". Probado a 1280 y 384 px en los dos estilos: todo bien.
- 2026-11-18: la previa de Trends de las 11:15 UTC no corrió (GitHub no lanzó el horario: no hay ninguna ejecución "schedule"; GitHub no garantiza sus horarios). Un lanzamiento a mano a las 12:53 sin la casilla "previa" terminó en verde sin hacer nada ("fuera del 20-25 nov"). Lanzada a mano con "previa" a las 12:57 UTC: guardada en `datos/trends_previa/2026-11-18T1257Z.json`, con las 5 preguntas. Reparado: lanzado a mano fuera del 20-25 nov sin "previa" ahora sale en rojo con el aviso de marcarla; el respaldo de la 6.1 pasa a tres horas (18:41, 20:41 y 22:41 UTC); quitado el horario de la previa del 18.
- 2026-11-17: tres horas cero (pedido de Bruno): fuegos, reflectores y "¡Ya salió GTA 6 en Nueva Zelanda!" al salir allí (18 nov, 8:00 de Chile), y de nuevo en Chile y en Miami, para todos los que tengan la página abierta. Aviso de cada salida (opción C de Bruno, píldora bajo el lema que flota arriba al bajar). La fiesta sigue si se cambia de Miami 1986 a 2026 o de día a noche. Probado simulando cada hora cero, en Edge y Firefox, a 1280 y 384 px. Se prueba con `?probar-fecha=2026-11-18T10:59:55Z`.
- 2026-11-17: revisión para el lanzamiento (pedido de Bruno): pruebas de la página en Edge y Firefox, con hora cero y con la fecha simulada después de cada salida (Nueva Zelanda, Chile, Miami), y del despertador: todo bien. 9.3 en parte: Noticias reintenta una vez si Google da 429/503, y un fallo suelto de Google (Noticias o Trends) ya no pone la ejecución en rojo, solo un aviso amarillo (rojo si se repite o si falla otra fuente). Probado en GitHub sin guardar: todas las fuentes respondieron.
- 2026-11-17: 9.12 hecha: `web/compartir.jpg` rehecha con la portada actual (opción C). Más tráilers en "Logros y récords" (Bruno: "solo oficiales"): `YOUTUBE_TRAILERS` de `recolector/fuentes.py` pasa de 4 a 7 con "Official Cover Art Reveal" (`EiQEBYDox_k`), "An Extended Look Coming August 27" (`qq76pQsI1iw`) y "Pre-Load Now" (`_yl5ELcmugI`): todos los videos de GTA VI de la pestaña "Videos" de @RockstarGames, sin Shorts (versiones verticales) ni canales regionales.

## Pendiente

La lista completa y su orden están en `PLAN.md`. Resumen (2026-11-17):

- **(2026-11-17):** 9.11 (b) administrar qué se anima en toda la página (lo demás, después del
  22). 6.8 diseñar la sección de la 6.1 desde el 20 nov. **Reddit:** quitado (6.9): solo
  volvería con la clave oficial.
0. **(2026-11-16, orden de Bruno):** 9.4 optimizar la página (eje y `partes()` hechos; lo
   grande, después del 22) y lo que falta de la 9.3 (resumen de huecos en `revisar.py`, después del 22). Descartados
   (Bruno): la 9.2 "¿Cuánta gente faltó?", Cloudflare Radar, redes de descarga de las consolas y
   "qué tan popular es GTA 6 en YouTube". Detalle en `PLAN.md`.
1. **7.4:** "Lo que espero" ya está en la página. Después del lanzamiento, Bruno escribe "Lo que
   me pareció" en `web/capsula.js`.
2. **Fase 4:** 4.3 análisis de datos (necesita varios días de datos).
3. **Fase 6:** 6.1 más Google Trends, **una sola vez entre el 20 y el 25 nov**, fuera del
   recolector de cada hora (programa listo y probado, con las palabras de Bruno; se lanza sola
   del 21 al 24 nov; falta mostrarlo: 6.8). 6.6 Instagram (parece difícil; ver `PLAN.md`).
4. **Fase 7:** 7.1 rebobinar (después del lanzamiento); 7.13 sección de memes (requiere
   investigación). Cuando Take-Two publique las ventas, escribirlas en `gta6` de
   `web/lanzamientos.js`. **Fase 8 (GTA 6 en PC):** dormida hasta que Bruno avise con
   confirmación oficial.
5. **Fase 5** (después del lanzamiento): búsqueda calmada.
   **Fase 10** (después del lanzamiento): panel de control de videos, en 4 partes
   (entrevista hecha el 18 nov; detalle en `PANEL_VIDEOS.md`).
6. **Ideas sueltas:** 2.5 TikTok (sin acceso fácil); D6 (Bruno pidió ignorarla por ahora).
7. **Bruno:**
   - si quiere, borrar en GitHub la ejecución fallida 43541223135 de "Publicar página" (falló
     porque Pages aún no estaba activado; Actions → la ejecución → "…" → Delete workflow run);
   - pedir a soporte de GitHub que borre la referencia del PR #1 (deja alcanzable el primer
     commit, con su correo de Outlook);
   - activar en GitHub "Keep my email addresses private" y "Block command line pushes that
     expose my email". Los commits "Merge pull request…" que crea GitHub al unir desde la web
     llevan el correo de Outlook de Bruno y están en `main`, que es público. **Bruno lo deja
     para después** (2026-11-13): no volver a proponerlo hasta que él lo retome. Quitar el
     correo de esos commits exige reescribir `main` con `--force`: solo si Bruno lo autoriza;
   - borrar en GitHub las ramas ya unidas: `claude/project-thread-en9qib`,
     `claude/project-thread-odgsms`, `revision/resumen-imagen` (la nube no puede borrar ramas)
     y, cuando se una su último PR, `claude/project-thread-yceo71`.
8. **Para después (Bruno, 2026-11-17):** configurar Impeccable para que revise lo que importa en
   este proyecto (mientras tanto, su revisión automática queda apagada).
