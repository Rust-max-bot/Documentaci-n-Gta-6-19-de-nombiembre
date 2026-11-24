# Estado actual del proyecto

> Estado **vivo** y corto. Las reglas y la forma de trabajo están en `CLAUDE.md`; las
> tareas, decisiones vigentes y riesgos, en `PLAN.md` (un solo plan desde el 2026-11-16). Al iniciar una sesión se lee este archivo entero.

## Cómo usar este archivo

- Se actualiza en el mismo commit del paso, solo si cambia el estado, un pendiente o
  "Dónde quedamos" (ver "Guardado al terminar cada paso" en `CLAUDE.md`). Nada de reglas aquí.
- **Tiene que seguir siendo corto.** "Últimos cambios" guarda unas 8 entradas de una línea;
  las viejas se borran porque ya están en `git log`.
- Si pasa de 30.000 bytes, se archiva en `historial/` y se empieza uno nuevo (skill
  `archivar`).

## Dónde quedamos

*(2026-11-21, ~15:30 de Chile. Bruno sigue en otro chat.)*

**Para seguir:** se trabaja en `main`, todo guardado y subido; la página publicada está al día.
Hecho el 21 nov: **7.1 Rebobinar unida a `main`** (con números que cuentan y gráficos "La línea
avanza"), **6.1 comprobada** (guardada a las 15:41 UTC) y **6.8 publicada** (sección "¿Qué tan
grande es GTA 6?", `#trends61`), y arreglada la prueba `probar_marcas.py`. Siguiente tarea: la
que elija Bruno. **Hecho el 21 nov:** la 9.3 y el fallo de la recarga automática de la 9.4
(subidos), con el abogado del diablo corto hecho. Siguiente tarea: la que elija Bruno (en pasos
cortos). La 9.4 quedó terminada el 21 nov (también los enlaces `#sección` en Miami 1986 y la barra de desplazamiento). Para después del 22 nov: revisar el peso de `datos/` y la 9.11 (b).
La rama `rebobinar-7-1` ya no hace falta (Bruno puede borrarla en GitHub).

**La página está lista para el lanzamiento y publicada** en
<https://rust-max-bot.github.io/Documentaci-n-Gta-6-19-de-nombiembre/> (la publica
`publicar-pagina.yml` tras cada medición). Hechas las fases 0, 1, 3, casi toda la 2 (falta la
2.5, TikTok), la 4.1 y 4.2, la 6 (menos 6.6 Instagram; de la 6.1 queda una idea), la 7 (menos 7.4 y 7.13)
y la 9 de la 9.1 a la 9.12, salvo la 9.11 (b). Qué tiene la página, sección por
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

**7.1 Rebobinar el lanzamiento: hecha (20 y 21 nov, pedido de Bruno) y unida a `main` el 21 nov.** Barra para revivir la página media hora por media hora del 18 nov 08:00 al 20 nov
12:00 UTC. Revisada con `/code-review` y un abogado del diablo; `pruebas/probar_rebobinar.py`,
`probar_pagina.py` y `probar_selector.py`: todo bien (Edge y Firefox). Diseño **"Pulso"**
(elegido por Bruno entre 3 prototipos): la pista es la curva de espectadores de Twitch. Portada y
línea de tiempo también viajan; titulares por hora de publicación (Bruno). Cómo funciona por
dentro: bloque "Rebobinar el lanzamiento" al final de `web/app.js` (las secciones que viajan se
dibujan con una "vista": `HOY` o un momento; para sumar otra, llamarla en `pintarVista()`) y
`rebobinado()` en `recolector/generar_web.py` (arma `web/rebobinar.js`, que no va a git).
Números que cuentan al cambiar de momento: `CONTEO` y `cifra()`, junto a `pintarFichas` en
`web/app.js` (para que otro número cuente, escribirlo con `cifra(clave, valor)`). Gráficos que
avanzan: bloque "La línea avanza" en `grafico()` (`lineas()`, `tramosHasta()`, `previo`).

**Avisos vigentes:**
- **6.1 guardada** el 21 nov a las 15:41 UTC (`datos/trends_extra/2026-11-21T1541Z.json`, las 5
  preguntas sin error). Los días 22 a 24 el programa ve que ya existe y termina sin guardar otra.
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

**Reglas en pausa:** ninguna. Forma de trabajo: **por tandas, con entregas cortas** (ver
`CLAUDE.md`, desde el 2026-11-24). Última tanda (17 nov, pedida por Bruno, **terminada**): dejar todo listo para el
lanzamiento (revisión completa y menos alarmas por Google). Antes: 9.12 y más tráilers.

## Últimos cambios

- 2026-11-17: estado anterior archivado en historial/ESTADO_2026-11-17.md
- 2026-11-24: mejorar la configuración de Claude Code (instructivo del proyecto de inglés), pasos 1 y 2: informe `AUDITORIA_PROMPTS.md` y revisión `REVISION_CLAUDE_MD.md` (sin cambiar `CLAUDE.md`). Bruno eligió aplicar los 6 cambios (A a F); se aplican en el borrador del paso 4. Paso 3 hecho (Bruno marcó 3.1 a 3.7 y pidió el tope de 30.000 bytes, cambio G). Paso 4 hecho: borrador en `borrador-claude/` (ver su `LEEME.md`), sin tocar la configuración en uso. Paso 5 hecho: no se pierde ninguna regla. Paso 6 hecho: aplicado (`CLAUDE.md` nuevo, `.claude/rules/`, skills `archivar` e `improve-animations`, bloqueos en `.claude/settings.json`, tope 30.000). Paso 7: bloqueos y reglas comprobados; hueco: `git -C … push -f` y `push origin +main` no se bloquean (decide Bruno si se suman). Falta en sesión nueva: ver las skills con `/` y repetir `/doctor prompt-audit`. Después, paso 8 (borrar el borrador).
- 2026-11-23: anotadas en `PLAN.md` la 9.13 (Kick se cortaba en 5.000 directos: faltaba hasta un 29 % en las horas fuertes; Twitch, un 6 %) y la 9.14 (corregir con matemáticas datos imprecisos; Bruno eligió ajustar una curva). Después, la 9.15 (horas vistas en total). Bruno aprobó el arreglo de la 9.13 y pidió dejarlo para después: no se tocó el recolector.
- 2026-11-22: arreglado (pedido de Bruno): la tabla "Twitch y Kick, medición por medición" y "Resumen del día" se abrían siempre en el 19 nov (regla de la primera versión), también tras "Volver a hoy" del rebobinado. Ahora abren en el día más nuevo; al rebobinar, la tabla sigue en el día del momento elegido. `probar_rebobinar.py` comprueba el día al abrir y tras "Volver a hoy" (falla con lo de antes); `probar_rebobinar.py` y `probar_pagina.py`: todo bien.
- 2026-11-21: 9.4 terminada (pedido de Bruno). (1) Enlace a una sección (`index.html#seccion-noticias`): a 384 px en Miami 1986 el navegador bajaba con la animación suave mientras lo de arriba cambiaba de alto y se pasaba 1.200 px o no llegaba (ya pasaba antes); ahora usa la misma corrección que la recarga. (2) Barra de desplazamiento o "buscar en la página" durante la corrección: si la página salta más de 40 px sin que la mueva el código y con la página ya cargada, se suelta. (3) "auto" se devuelve recién tras el evento load (antes, el navegador podía tirar a la persona de vuelta). `probar_recarga.py` (8 casos, con "barra" nuevo: falla con lo de antes), `probar_saltos.py` y `probar_pagina.py`: todo bien.
- 2026-11-21: 9.4, abogado del diablo corto (pedido de Bruno) sobre el arreglo de la recarga: si la persona recargaba ella misma durante los 5 s de corrección, `history.scrollRestoration` quedaba en "manual" y sus F5 siguientes no volvían a su altura. Arreglado (al irse, vuelve "auto", salvo otra recarga sola). Caso nuevo "recarga a mano" en `probar_recarga.py`: falla sin el arreglo y pasa con él. Queda, menor: la barra de desplazamiento no detiene la corrección.
- 2026-11-21: 9.4, arreglado el fallo de la recarga automática (pedido de Bruno): volvía 1.700 a 4.600 px más arriba porque `app.js` hacía un `scrollTo` suave cuando la página aún no tenía su alto. Ahora `recargar()` guarda la sección de arriba y cuánto se bajó dentro, con `history.scrollRestoration = "manual"`; al volver se corrige sin animación 5 s (para si la persona mueve la página) y con la pestaña oculta espera a que vuelva a la vista (lo vio un revisor de `/code-review`: ahí no corre `requestAnimationFrame` y una 2.ª recarga oculta guardaba el lugar sin corregir). Prueba nueva `pruebas/probar_recarga.py` (6 casos; falla con el código de antes): todo bien. `probar_pagina.py` (Edge y Firefox), `probar_selector.py` y `probar_rebobinar.py`, con el primer arreglo (el último cambio solo toca la pestaña oculta): todo bien; `probar_saltos.py` falla en un caso que ya fallaba antes (ver `PLAN.md`).
- 2026-11-21: 9.3 terminada (pedido de Bruno): `recolector/revisar.py` muestra, de cada fuente con huecos, por código (en Trends, también el paso), por día (huecos/mediciones), por hora de Santiago y la racha más larga seguida, y cuántas mediciones tuvieron algún hueco cada día. Cada fuente cuenta solo entre su primera y su última medición (Reddit: "ya no se mide"). Probado con los datos reales y con datos inventados; `/code-review` (4 revisores): sin problemas.
- 2026-11-21: 6.8 hecha (pedido de Bruno, opción A "Tablero" de 3 prototipos, apta para celular): sección "¿Qué tan grande es GTA 6?" (`#trends61`, tras "Interés en Google Trends") con la 6.1: cifras (5,9× Minecraft, el que más se acercó en la semana; 1,6× el mejor mes de GTA 5; 66 países, Chile 22.º), los 5 juegos hora por hora en la misma escala, totales y hora más alta, países, mes a mes desde 2013 y búsquedas. Revisada con `/code-review` (4 revisores) y un abogado del diablo; arreglados: barras que casi desaparecían entre 760 y 980 px, "66 países con búsquedas" (son los que lista Google), la cifra 1,6× poco clara, contraste en "Miami 2026", "aumento puntual" visible, se oculta si la consulta no es la del lanzamiento, menú sin secciones ocultas. `probar_pagina.py` (Edge y Firefox; la captura de sección ya no se corta en 1400 px), `probar_rebobinar.py`, `probar_selector.py`, `probar_marcas.py`: todo bien.
- 2026-11-21: arreglado el fallo de `probar_marcas.py` (pedido de Bruno, con `/code-review` y un abogado del diablo): la página estaba bien; la prueba suponía que siempre hay un video de reserva, y la última medición traía 19 Shorts que pasan el filtro (tope 20). Ahora comprueba que al marcar solo se va ese video, y que entra el siguiente con un tope más chico y con datos inventados (no depende del día). Un error inventado (marcas después del tope) lo detectan las dos comprobaciones nuevas. `probar_marcas.py`: todo bien.
- 2026-11-21: 7.1 unida a `main` (pedido de Bruno). Antes de subir, con `main` al día y los datos del 21 nov: `generar_web.py`, `probar_rebobinar.py`, `probar_pagina.py` y `probar_selector.py`, todo bien; `probar_marcas.py` falla en una comprobación que también falla en el `main` de antes (ver "Dónde quedamos").

## Pendiente

La lista completa y su orden están en `PLAN.md`. Resumen (2026-11-17):

- **(2026-11-23):** 9.13 arreglar el conteo de Twitch y Kick (aprobado, para después) y 9.14
  corregir datos imprecisos ajustando una curva (investigar); 9.15 horas vistas en total. Ver `PLAN.md`.
- **(2026-11-17):** 9.11 (b) administrar qué se anima en toda la página (lo demás, después del
  22). **Reddit:** quitado (6.9): solo
  volvería con la clave oficial.
0. **(2026-11-16, orden de Bruno):** 9.3 y 9.4 hechas (21 nov). Descartados
   (Bruno): la 9.2 "¿Cuánta gente faltó?", Cloudflare Radar, redes de descarga de las consolas y
   "qué tan popular es GTA 6 en YouTube". Detalle en `PLAN.md`.
1. **7.4:** "Lo que espero" ya está en la página. Después del lanzamiento, Bruno escribe "Lo que
   me pareció" en `web/capsula.js`.
2. **Fase 4:** 4.3 análisis de datos (necesita varios días de datos).
3. **Fase 6:** 6.1 guardada y mostrada (6.8); solo queda la idea de repetir lo de Doomsday en
   enero. 6.6 Instagram (parece difícil; ver `PLAN.md`).
4. **Fase 7:** 7.13 sección de memes (requiere
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
