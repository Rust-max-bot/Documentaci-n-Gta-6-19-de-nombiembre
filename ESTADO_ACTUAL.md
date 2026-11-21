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

*(2026-11-20, noche, hora de Chile. Se sigue en otro chat.)*

**Para seguir:** trabajar en la rama **`rebobinar-7-1`** (`git checkout rebobinar-7-1`; no está
unida a `main`). Animaciones al rebobinar (7.1 (a)): **hecha la 1, números que cuentan** (en
todas las secciones que viajan), la única que pidió Bruno de las 4 propuestas (las otras 3, solo si él las pide; ver `PLAN.md`).
**Pendiente (21 nov, pedido de Bruno):** gráficos animados al rebobinar; se le preguntó qué
forma quiere. Después, Bruno prueba la rama y decide unirla a `main`.

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

**Fase 10, panel de control de videos: terminada y unida a `main` (18 nov, pedido de Bruno).**
Las cuatro partes (10.1 marcas, 10.2 panel, 10.3 rescatar y configuraciones, 10.4 selector del
visitante) están en la página publicada. Para marcar videos: doble clic en `panel_videos.bat`
(solo en el PC, con `main`). Detalle en `PANEL_VIDEOS.md`. Las ramas `panel-videos-10-1` a
`-10-4` ya no hacen falta (Bruno puede borrarlas en GitHub).

**7.1 Rebobinar el lanzamiento: hecha en la rama `rebobinar-7-1` (20 nov, pedido de Bruno), sin
unir a `main`.** Barra para revivir la página media hora por media hora del 18 nov 08:00 al 20 nov
12:00 UTC. Revisada con `/code-review` y un abogado del diablo; `pruebas/probar_rebobinar.py`,
`probar_pagina.py` y `probar_selector.py`: todo bien (Edge y Firefox). Diseño **"Pulso"**
(elegido por Bruno entre 3 prototipos): la pista es la curva de espectadores de Twitch. Portada y
línea de tiempo también viajan; titulares por hora de publicación (Bruno). Cómo funciona por
dentro: bloque "Rebobinar el lanzamiento" al final de `web/app.js` (las secciones que viajan se
dibujan con una "vista": `HOY` o un momento; para sumar otra, llamarla en `pintarVista()`) y
`rebobinado()` en `recolector/generar_web.py` (arma `web/rebobinar.js`, que no va a git).
Números que cuentan al cambiar de momento: `CONTEO` y `cifra()`, junto a `pintarFichas` en
`web/app.js` (para que otro número cuente, escribirlo con `cifra(clave, valor)`).
Falta que Bruno la pruebe y la una a `main`.

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
- 2026-11-21: 7.1 (a), pedido de Bruno: en "Twitch y Kick, medición por medición", la fila que llega cuenta desde el número de la medición anterior (`cifra(…, desde)`). `probar_rebobinar.py` (Edge y Firefox), `probar_pagina.py` y `probar_selector.py`: todo bien.
- 2026-11-21: 7.1 (a), pedido de Bruno: cuentan también los números de récords (el récord y los tráilers), línea de tiempo (máximos y filtros), videos (visitas y "+"), GTA frente a lo más visto (puestos, barras, tendencias), titulares (resumen, medios, días) y el valor de Twitch en la barra Pulso. Solo los de las secciones a la vista (IntersectionObserver); medir cada número hacía la parada el doble de lenta. Con la CPU 4x, una parada tarda como antes; los cuadros mientras cuenta, ~27 ms (antes ~13). `probar_rebobinar.py` (Edge y Firefox), `probar_pagina.py` (Edge y Firefox), `probar_selector.py` y `probar_marcas.py`: todo bien.
- 2026-11-20: 7.1 (a), opción 1 elegida por Bruno (de 4 propuestas con `find-animation-opportunities`): al rebobinar, los números de las fichas y el "En ese momento" de los récords cuentan en 250 ms desde el valor anterior en vez de saltar. Al instante al arrastrar la barra, con "reducir movimiento" y en la primera parada. `probar_rebobinar.py` lo comprueba (Edge y Firefox), `probar_pagina.py` y `probar_selector.py`: todo bien.
- 2026-11-20: 7.1, pedido de Bruno: al rebobinar también viajan la portada (cuenta, lugares con ✓, lema, aviso "¡GTA 6 ya salió en…!" y su fiesta con fuegos y reflectores al pasar por una hora cero) y la línea de tiempo (crece al avanzar y se achica al retroceder, conservando su filtro). Titulares: siguen por hora de publicación (decisión de Bruno). Pruebas: todo bien.
- 2026-11-20: 7.1, diseño "Pulso" en la barra del rebobinado (Bruno lo eligió entre 3 prototipos hechos con la skill `prototype`; descartados "Reproductor" y "Videograbadora"): la pista es la curva de Twitch con las horas cero; "contar desde", saltar, velocidad y copiar enlace en "⋯". ~170 px en el celular (antes ~310). ~78 ms por parada con CPU 4x. Prototipo borrado. Pruebas: todo bien.
- 2026-11-20: 7.1 Rebobinar el lanzamiento en la rama `rebobinar-7-1` (entrevista con Bruno): tramo 18 nov 08:00 → 20 nov 12:00 UTC, 104 paradas; viajan fichas, récords, gráficos de Twitch/Kick y Trends, tabla, videos, comparación y titulares; las demás quedan tenues. `web/rebobinar.js` (~690 KB, solo al abrir; no va a git). Arreglos de `/code-review` (récords de YouTube sin visitas del futuro, filtro del visitante, un fallo del rebobinado no frena la publicación) y del abogado del diablo (Trends con la escala de ese momento, fuegos que seguían, récord "creció en una hora" que bajaba, lo abierto se mantiene, foco). Más rápido: ~130 ms por parada en celular lento simulado (antes ~260). Pruebas: todo bien.
- 2026-11-20: PLAN.md archivado en historial/PLAN_2026-11-20.md (pasó de 20.000 bytes). 9.4 preparada en la rama `optimizar-9-4` (`pruebas/medir_carga.py` y plan corregido por un abogado del diablo): Hechos en la rama: preload, estilo y cielo antes del primer dibujo (`web/inicio.js`); B y `content-visibility` descartados. Página armada ~5,3 → ~3,7 s. Revisada dos veces por un abogado del diablo; pruebas bien. **Unida a `main` el 20 nov** (Bruno la probó); la rama ya no hace falta. Pendiente de la 9.4: el fallo de la recarga automática (ver `PLAN.md`).
- 2026-11-20: README al día (pedido de Bruno): sección "Estado" con los máximos reales (Twitch 3.189.635 y Kick 1.433.865, 18 nov) y lo que falta; Kick, 7 tráilers, Shorts, selector de videos, Doomsday, Próximamente, tres rayas de lanzamiento, panel de videos, Trends extra automática, Reddit quitado y documentos nuevos.
- 2026-11-20: gráficos de Twitch/Kick y de Trends con tres rayas de lanzamiento (medianoche del 19 nov en Nueva Zelanda, Chile y Miami; antes solo Chile), pedido de Bruno: el gran pico llegó tras la hora cero de Nueva Zelanda. En pantallas angostas los nombres van en escalera. `probar_pagina.py`: todo bien.
- 2026-11-18: Fase 10 unida a `main` (pedido de Bruno). Antes de subir, con `main` al día: `probar_marcas.py`, `probar_selector.py`, `probar_pagina.py` y `probar_panel.py`, todo bien.
- 2026-11-18: 10.4 (rama `panel-videos-10-4`): selector de videos del visitante en la página ("Botón con panel", Bruno): configuración y motivos, recordados en el navegador; `web/videos-extra.js` solo se carga si hace falta (`datos.js` no crece). Pruebas: `probar_selector.py`, `probar_pagina.py` (Edge y Firefox), `probar_marcas.py`, `probar_panel.py`: todo bien.
- 2026-11-18: Kick en "GTA frente a lo más visto" (pedido de Bruno, sin opciones de diseño): puesto de GTA VI en el recuadro y barras de categorías bajo las de Twitch. Fuente nueva `kick_ranking`: Kick no tiene ranking, así que lee todos sus directos (~12.500, 13 páginas) y suma el público por categoría. Probada en GitHub sin guardar en una rama de prueba (ya borrada); el recolector no se detuvo. Se ve desde la primera medición con el cambio. Si falla, `git revert` de su commit.
- 2026-11-18: directos de YouTube descartados por ahora (Bruno: datos poco limpios; motivos en `PLAN.md`). La página lo explica en la nota de "Espectadores en Twitch y Kick". Probado a 1280 y 384 px en los dos estilos: todo bien.
- 2026-11-18: la previa de Trends de las 11:15 UTC no corrió (GitHub no lanzó el horario: no hay ninguna ejecución "schedule"; GitHub no garantiza sus horarios). Un lanzamiento a mano a las 12:53 sin la casilla "previa" terminó en verde sin hacer nada ("fuera del 20-25 nov"). Lanzada a mano con "previa" a las 12:57 UTC: guardada en `datos/trends_previa/2026-11-18T1257Z.json`, con las 5 preguntas. Reparado: lanzado a mano fuera del 20-25 nov sin "previa" ahora sale en rojo con el aviso de marcarla; el respaldo de la 6.1 pasa a tres horas (18:41, 20:41 y 22:41 UTC); quitado el horario de la previa del 18.

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
4. **Fase 7:** 7.1 rebobinar (hecha en la rama `rebobinar-7-1`: diseño Pulso y números que cuentan; falta que Bruno la pruebe y la una a `main`); 7.13 sección de memes (requiere
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
