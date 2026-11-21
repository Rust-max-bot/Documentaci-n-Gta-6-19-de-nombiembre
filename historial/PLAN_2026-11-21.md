# Plan del proyecto: recuerdo del lanzamiento de GTA 6

> **Plan anterior archivado** el 2026-11-20 en `historial/PLAN_2026-11-20.md` (pasó de 20.000
> bytes; tiene el detalle de la Fase 10, la estructura de carpetas y las medidas viejas de la
> 9.4). Antes: `historial/PLAN_2026-11-18-3.md` y los anteriores. Un solo plan desde el
> 2026-11-16 (pedido de Bruno).

Un recuerdo del 19 de noviembre de 2026, día en que salió GTA 6, por diversión: una página web
con línea de tiempo, tablas y gráficos de Twitch, Kick, YouTube, Google Trends y titulares
(Reddit se midió del 13 al 17 nov y se quitó, 6.9). El estado vivo está en `ESTADO_ACTUAL.md`;
las reglas, en `CLAUDE.md`.

## Cómo se usa este archivo

- Aquí van **las tareas que faltan, las decisiones vigentes y los riesgos**, en corto. El
  detalle va en el commit. Una tarea se marca `[x]` solo hecha **y verificada**; si queda a
  medias, sigue en `[ ]` con el fallo anotado. Códigos `A1`…`A8` y `D1`…`D6`: listas de Bruno.
- Si pasa de 20.000 bytes, se archiva en `historial/` (ver `CLAUDE.md`).

## Fechas que mandan

- **19 nov 2026, 00:00 de Santiago:** lanzamiento (ya pasó). Medición al minuto 37 hasta el
  22 nov 00:07 UTC.
- **Entre el 20 y el 25 nov:** 6.1, una sola vez (se lanza sola del 21 al 24, ver la tarea).
- **19 dic 2026:** fin de la medición por defecto (`recolector/interruptor.json`). La clave de
  GitHub del despertador de Cloudflare caduca el 31 ene 2027.

## Tareas que faltan

### Antes o justo después del lanzamiento

- [ ] **7.4 Cápsula del tiempo.** "Lo que espero" ya está (texto de Bruno, 2026-11-15; diseño
      de cintas de casete, opción C). **Falta "Lo que me pareció"**, después del lanzamiento, en
      `web/capsula.js`. Lo escribe Bruno: Claude no inventa ese contenido.
- [ ] **6.1 Más Google Trends.** Una sola vez, **entre el 20 y el 25 nov** (antes del 26: Trends
      solo da el detalle por hora de 7 días), fuera del recolector de cada hora para no arriesgar
      un bloqueo (429) el día 19. Programa listo y probado sin guardar (13 y 14 nov):
      `recolector/trends_extra.py`, workflow "Trends extra (6.1)", que se lanza a mano y guarda en
      `datos/trends_extra/`. Cinco preguntas: interés por país; búsquedas relacionadas y en
      aumento; hora por hora GTA 6, GTA 5, Minecraft, Fortnite y Marvel Rivals; mes a mes desde
      2013 GTA 6, GTA 5, Ocarina of Time (remake, 5 nov 2026) y Avengers Doomsday; y GTA 6 frente
      a Doomsday día por día (en la página, solo esa comparación). **Se lanza sola** (Bruno, 2026-11-16, tras un
      debate entre dos agentes): el despertador de Cloudflare el 21, 22, 23 y 24 nov a las 15:41 UTC
      y, de respaldo, un `schedule` de GitHub a las 18:41, 20:41 y 22:41 UTC (GitHub se salta horarios: 18 nov). Guarda solo la primera vez (paso
      "decidir": si ya hay archivo o es fuera del 20-25 nov 2026, termina en verde), sin ejecuciones
      dobles y con 25 min de tiempo. **Guardada** el 21 nov 15:41 UTC (5 preguntas bien) y
      **mostrada** (6.8, hecha el 21 nov: sección `#trends61`, opción A "Tablero"; si se repite la
      consulta, la sección se oculta sola). **Falta:** solo una idea sin decidir: repetir lo de
      Doomsday en enero, después de su estreno (18 dic); si se hace, que `#trends61` siga usando la del 21 nov.
- [ ] **9.11 Skill de animación y forma de administrarlas** (Bruno, 2026-11-17). (a) **Hecho
      (2026-11-17):** instaladas seis skills de `emilkowalski/skills` (MIT): `prototype`,
      `find-animation-opportunities`, `animate`, `choreograph`, `review-animations` y
      `animation-performance` (ver `CLAUDE.md`). (b) **Hecho en parte (2026-11-17, tras un debate entre dos agentes):** interruptor `portada` en `ACTIVAS` (pausa el movimiento continuo; con CPU 4× pasa de 19-38 cuadros largos a 0; probar con `?sin-anim=portada`) y fundido de Titulares al cambiar de página o de día. **Después del 22, con la 9.4:** "Personalizar" y "Ver N más" con cortina y la tabla por grupos completa; la Cápsula y el Álbum, cuando haya fotos. Portada optimizada sin quitar movimiento (2026-11-17, ver `ESTADO_ACTUAL.md`). **Falta además:** una forma sencilla de decidir qué
      elementos animan y cuáles no en TODA la página: hoy `web/animaciones.js` (`ACTIVAS`) cubre
      solo lo de la 9.8 y la 9.9. Siguiente paso: inventario con `find-animation-opportunities` y,
      con lo que elija Bruno, sumar el resto a esa tabla. Se puede enlazar con el "Panel de control".
- [ ] **9.4 Optimizar la página** (Bruno, 2026-11-16). **Hecho (16 nov):** eje de los gráficos sin
      textos encimados (opción C), `partes()` con memoria, `probar_pagina.py` revisa los ejes.
      **Preparado el 20 nov en la rama `optimizar-9-4`** (Bruno, con abogado del diablo):
      `pruebas/medir_carga.py` (celular lento: 384 px, CPU 4×, 1,6 Mbps, 150 ms). Hoy carga en
      4,7 s y con 1.000 mediciones simuladas en 4,9 s (datos.js casi no influye). Lo lento: los 8
      `<script>` bajan uno tras otro (también en GitHub Pages) y ~1,7 s de CPU al arrancar
      (`gota`/`actualizar` y `estado` de los Shorts fuerzan el diseño). Revisado por el abogado del diablo.
      **Hecho en la rama (20 nov, Bruno pidió A, B y C), falta unir a
      `main`:** (A) `preload` de 7 scripts en el `<head>` (sin datos.js: atrasaba el primer
      dibujo 0,3 s); página armada 4,34 → ~3,1 s. (B) quitar las lecturas de `gota`/Shorts **no
      sirvió** (la traza mostró que el costo solo pasó a otras funciones): revertido; sí `aria-pressed`
      solo si cambia. (C) + cielo (Bruno, 20 nov): `web/inicio.js` en el `<head>` pone el estilo
      guardado y día/atardecer/noche antes del primer dibujo (la fórmula del sol se mudó ahí;
      app.js la usa; respaldo si no llega). Abogado del diablo (2.ª vuelta): fórmula idéntica
      (105.120 horas comparadas). Medido junto a `main`: página armada ~5,3 → ~3,7 s; primer
      dibujo +0,1 a 0,15 s. **Unida a `main` el 20 nov** (Bruno la probó en su PC).
      **Recarga automática: arreglada el 21 nov** (volvía 1.700 a 4.600 px más arriba: un
      `scrollTo` suave antes de que la página tuviera su alto). Ahora vuelve a la sección y se
      corrige 5 s; con la pestaña oculta espera a que vuelva. Prueba: `pruebas/probar_recarga.py`.
      Abogado del diablo (21 nov): arreglado que "manual" quedaba pegado si la persona recargaba
      durante la corrección. **Queda, menor:** arrastrar la barra de desplazamiento o "buscar en la
      página" no detiene la corrección (solo dura 5 s). **Fallo aparte, ya existía:** a 384
      px en Miami 1986, abrir `index.html#seccion-noticias` no deja la sección arriba
      (`probar_saltos.py`, 2 de 2 veces también con el código de antes; en Miami 2026, bien).
      Descartado: `defer` (rompe `filtro-videos.js:116`), partir mediciones, mover fotos y
      `content-visibility` (~7 % de CPU; rompía los enlaces #sección en Edge y copiar todo en Firefox).
- [x] **9.3 Menos alarmas por Google** (Bruno, 2026-11-16). **Hecho el 17 nov** (Bruno pidió
      "menos fallos" para el lanzamiento): Noticias reintenta una vez a los 20 s si Google da 429/503,
      y un 429/503 suelto de Noticias o Trends deja aviso amarillo con la ejecución en verde (rojo si
      se repite en la medición siguiente o si falla otra cosa). Del 17 nov: 10 de 30 ejecuciones en
      rojo, todas por Google o Reddit, sin perder datos. Probado en GitHub sin guardar. **Hecho el
      21 nov:** resumen de huecos en `recolector/revisar.py` (por código, día, hora y racha).
- [ ] **6.6 Instagram** (Kick ya está hecho; ver "Lo ya hecho"). Parece difícil: la API de Meta
      solo funciona con una cuenta de empresa o creador propia unida a una página de Facebook, y
      la búsqueda por hashtag da pocas publicaciones, no el total, con límite semanal. Si no
      sirve, anotar a mano lo llamativo como evento. Verificar con una consulta real antes de
      afirmar nada.
      **2026-11-16:** formulario de la app de Meta revisado (caso de uso "Administrar mensajes y
      contenido en Instagram", sin portfolio, sin requisitos); no se creó: Bruno lo deja para después.

### Después del lanzamiento

- [ ] **4.3 Análisis de datos (A3).** Datos interesantes: popularidad, visitas, cuánto dura el
      interés, antes y después. Necesita varios días de datos reales. **Sin IA** (Bruno, 2026-11-18): un
      programa normal, como `generar_web.py`, que corre solo con cada medición. En unos días.
      **Filtro de videos sin dolores de cabeza** (Bruno, 2026-11-18): (1) partir siempre de los
      datos crudos de `datos/`, nunca de lo que muestra la página; el filtro es un paso aparte;
      (2) cada resultado dice con qué configuración y marcas de qué fecha se sacó; (3) lo
      importante de YouTube se calcula con todos los videos y con "el de Rust" (si difieren
      mucho, eso es un dato); (4) lo principal, con Twitch y Kick por categoría.
- [ ] **7.13 Sección de memes** (pedido de Bruno, 2026-11-15; investigar antes de hacer nada).
      Va con la "búsqueda calmada". A investigar: de dónde salen (imágenes de Reddit ya
      guardadas, Know Your Meme, o memes que Bruno suba como en el álbum); derechos de autor (la
      página es pública: mejor enlazar el original y decir de dónde viene); contenido ofensivo
      (elegirlos, no mostrarlos todos solos); no inventar ("meme del día" solo con fuente).
      Resultado: un plan corto con opciones; después, diseño con capturas.
- [ ] **Búsqueda calmada (antes "Fase 2" del plan original).** Sin mediciones hora a hora:
      completar y contrastar con fuentes que guardan historial, lo que pase la semana siguiente y
      cifras oficiales (ventas). Límite: Trends sí se recupera; Twitch y YouTube no dan el
      pasado (solo terceros o las visitas actuales). Complementa lo medido, no lo reemplaza.
- [ ] **Revisar el peso de `datos/` y guardar menos (después del 22 nov, pedido de Bruno, 2026-11-16).**
      Medido el 16 nov: ~4,6 MB en 97 mediciones, `.git` 41 MB; YouTube es el 72 % (las tres
      búsquedas repiten títulos y miniaturas), Twitch 16 %, titulares 6 %. Antes del 19 no se toca
      el recolector. Después: que YouTube guarde solo lo que cambió y, si el repositorio pasa de
      ~200 MB, un archivo externo (p. ej. Cloudflare R2). Solo afecta a mediciones nuevas.
- [ ] **País e idioma de los canales** (Bruno, 2026-11-16, sin decidir): Twitch y Kick dan el
      idioma, no el país; YouTube da el país del canal (`channels.list`, 1 unidad). Hoy se
      guardan solo 20 canales de Twitch y 10 de Kick. Cambia lo que se guarda: pedir permiso.
- [ ] **Ventas oficiales de GTA 6:** cuando Take-Two las publique, escribirlas en `gta6` de
      `web/lanzamientos.js` (el punto de "Próximamente" se marca solo).

### Fase 10 — Panel de control de videos

Hecha (10.1 a 10.4, unidas a `main` el 18 nov). Detalle en `PANEL_VIDEOS.md` y en
`historial/PLAN_2026-11-20.md` (cómo se revisó cada parte).

### Ideas para después, sin fecha

- [ ] **2.5 TikTok.** Sin acceso oficial para un proyecto personal (la API de investigación es
      solo para instituciones académicas; Creative Center no tiene API y bloquea servidores).
      Probar una consulta real desde el PC y desde GitHub, o anotar lo llamativo a mano.
- [ ] **Clave de Reddit** (en pausa: Reddit se quitó en la 6.9). **Haría falta para volver a medir Reddit:** desde el 17 nov,
      18:37 UTC, Reddit bloquea su RSS público (404/403, también en otros subreddits; antes un
      429). Lo guardado no se pierde. Daría además votos y comentarios. Desde nov 2025 se pide con el formulario
      de soporte para desarrolladores; tarda ~7 días y no está garantizada.
- [ ] **Directos de YouTube: poco probable** (Bruno, 2026-11-18; vio ~1,7 millones de personas
      en directos de GTA 6, pero no se pueden contar limpio). Se haría con `search.list` en vivo
      (100 unidades, 50 directos como mucho) + `concurrentViewers` de `videos.list`. Motivos para
      no hacerlo: YouTube no tiene categoría de juego en su API (solo búsqueda por palabras: cifra
      incompleta y mezclada con otros temas), canales que ocultan sus espectadores, y la cuota
      (ya se usan ~7.500 de 10.000 al día). YouTube Analytics solo da historial del canal propio:
      el pasado no se recupera. Sin probar con una consulta real. La página explica por qué no se
      cuentan (nota de "Espectadores en Twitch y Kick"). **Para el análisis (4.3), Bruno quiere
      datos lo menos contaminados posible:** Twitch y Kick (por categoría del juego).
- [ ] **IA barata para filtrar videos** (Bruno, 2026-11-15): que lea título, descripción y
      etiquetas para decidir si un video es de GTA 6. No Claude, por el costo. Idea (18 nov, para
      después): Gemini, que puede ver el video. Antes, un plan pequeño.
- [ ] **API alfa de Google Trends** (idea de Bruno, 2026-11-16; para después, sin apuro). Google
      abrió una prueba alfa de una API oficial de Trends (developers.google.com/search/apis/trends):
      se pide con un formulario y solo la dan a un grupo limitado; no se sabe si aceptarán a Bruno.
      Da 5 años de datos (la 6.1 pide desde 2013, no cabría), cifras sin escalar a 100, varios
      términos juntos y regiones. **Estado:** Bruno puso el ID de su proyecto de Google Cloud y
      **envió el formulario él mismo el 2026-11-16**. Claude no vio la confirmación (el navegador
      se desconectó): falta saber si responden. La respuesta llegaría al Gmail de Bruno.
      **Si lo aceptan:** conversar con Bruno qué hacer (¿reemplaza el 429 de `trends`? ¿qué
      pasa con la 6.1?) antes de tocar el recolector. No cuenta para el 19 nov.
- [ ] **D6:** quedó cortado en la lista de Bruno ("El miami actual de…"). Bruno pidió ignorarlo
      (2026-11-12): no se pregunta hasta que él lo retome.

### Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida)

No se empieza hasta que Bruno avise con una confirmación oficial de la versión de PC
(decisión del 2026-11-14). Lo de consolas no se toca: queda como recuerdo.

- [ ] **8.1** Alargar el recolector (`interruptor.json`), renovar la clave de GitHub del
      despertador de Cloudflare y revisar la cuota de YouTube.
- [ ] **8.2 Steam:** jugadores a la vez (API oficial gratis, sin clave), con el número de app
      cuando el juego tenga página. Rockstar Games Launcher y Epic no publican cifras.
- [ ] **8.3 La página:** cuenta regresiva y hora cero del lanzamiento en PC, y "consolas frente
      a PC". Diseño con opciones y capturas.
- [ ] **8.4 Los más vendidos de la historia** (Tetris, Minecraft, GTA V, RDR2…) con cifras al día
      y su fuente. Ojo: el documento de Bruno del 14 nov tenía cifras viejas.

## Lo ya hecho (detalle en `historial/` y `git log`)

- **Fases 0, 1 y 3:** hechas. **Fase 2:** 2.1 a 2.4 y 2.6 a 2.15 (falta 2.5). **Fase 4:** 4.1 y
  4.2 (falta 4.3). **Fase 6:** 6.2 a 6.5, 6.6 Kick, 6.7 Doomsday, 6.8 sección de la 6.1, 6.9 quitar Reddit.
- **Fase 7:** 7.1 a 7.3 y 7.5 a 7.12 (7.1 unida a `main` el 21 nov; animaciones sin hacer, solo
  si Bruno las pide: videos que se deslizan, entrada de lo nuevo, destello de récord). **Fase 9:** 9.1, 9.5 a 9.10 y 9.12. **Fase 10:** hecha.
- **20 nov:** tres rayas de lanzamiento (Nueva Zelanda, Chile y Miami) en los gráficos de Twitch
  y Trends; README al día.
- Descartado por Bruno: app en el celular; Cloudflare Radar; redes de descarga de PlayStation y
  Xbox; la 9.2 "¿Cuánta gente faltó?"; "qué tan popular es GTA 6 en YouTube".

## Decisiones vigentes

El porqué y las opciones descartadas, en `historial/PLAN_2026-11-18-3.md` y `historial/PLAN_2026-11-16.md`.

- **Fuentes:** Twitch, YouTube y Google Trends (imprescindibles); además Kick, Google Noticias,
  PlayStation y Xbox, ranking de Twitch y Kick, tendencias de YouTube y los 7 videos oficiales de
  GTA VI. Las caídas de Rockstar se anotan a mano en `web/eventos.js`.
- **Medición** cada hora (minuto 7; también al 37 del 17 al 21 nov UTC) hasta el 19 dic, con
  interruptor manual; la lanza el despertador de Cloudflare (`despertador/`), no el `schedule`.
- **Datos:** un archivo de texto por día UTC (`datos/AAAA-MM-DD.jsonl`), horas en UTC; si una
  fuente falla, hueco visible, nunca un dato inventado.
- **YouTube:** las tres búsquedas como mucho una vez por hora; visitas en cada turno (~7.500 de
  10.000 unidades diarias).
- **Filtro de videos** (`recolector/filtro_videos.json`, modo `estricto`): título sin hashtags que
  nombra GTA 6 + tema de videojuegos, sin "roblox"; Bruno lo corrige en
  `recolector/marcas_videos.json` (marcados y rescatados, Fase 10). Solo decide qué se muestra.
- **Comparaciones con otros juegos:** solo el arranque, cada cifra con su fuente y plazo, sin
  escenarios inventados.
- **Página:** HTML, CSS y JavaScript sin librerías ni compilación, en GitHub Pages
  (`publicar-pagina.yml`); diseño original inspirado en Miami, estilos 1986 y 2026 y día,
  atardecer y noche (`DISENO_VISUAL.md`). Todo cambio visual: opciones con capturas antes.
- **Hora** automática según el dispositivo (12 h o 24 h). Listas con lo más nuevo arriba;
  gráficos de viejo a nuevo.
- **Opciones elegidas por Bruno:** portada 7.12 A; Twitch y Kick 6.6 B; videos 6.4 A y 6.5 B;
  récords 6.2 A; titulares B; GTA frente a lo más visto 9.7 A; cápsula 7.4 C; copias 7.10 B;
  Próximamente 7.11 C; menú flotante 2.12 B; "¿Qué tan grande es GTA 6?" 6.8 A (apta para celular; las búsquedas de Google van tal cual, sin filtrar: Bruno, 21 nov).
- **Rebobinar (7.1, Bruno, 2026-11-20):** del 18 nov 08:00 al 20 nov 12:00 UTC, una parada por
  medición (cada media hora); viajan portada, fichas, récords, línea de tiempo, gráficos, tabla,
  videos, comparación y titulares (por hora de publicación; las demás, tenues); controles: arrastrar, saltar a las 3 horas cero, reproducir
  1x/2x/4x, ±30 min, copiar enlace, volver a hoy; hora del visitante + "desde la salida" en NZ,
  Chile o Miami; fichas y récords: valor del momento y récord hasta ahí; marco fijo; fuente caída
  = último dato bueno con aviso; fiesta al pasar una hora cero. Datos en `web/rebobinar.js`.
  Barra "Pulso"; números que cuentan y gráficos "La línea avanza" (250 ms; al instante al
  arrastrar y con "reducir movimiento").
  Diseño "Pulso" (descartados "Reproductor" y "Videograbadora").
- **Muchas visitas:** `datos.js` lleva lo necesario al abrir; titulares por día en `web/dias/`.
  Plan B solo si GitHub avisa: Cloudflare Pages.
- **Sincronización del PC** (`sincronizar_interruptor.bat`): **apagada por Bruno el 2026-11-16**.

## Riesgos y avisos vigentes

1. **Lo que no se guarda el 19 nov no se recupera** (espectadores en vivo, visitas de esa hora).
2. **Google Trends es frágil** (429, ~1 de cada 25 mediciones): reintento, serie de 7 días y
   medición a los :37. Respaldo: descargar a mano desde su web.
3. **El "máximo en Google Trends" siempre vale 100:** no sirve como logro sin comparación (6.1).
4. **Peso de los datos:** ~20 a 25 KB por medición; 20 a 35 MB en el mes.
5. **Las ejecuciones programadas solo corren desde `main`**; las claves van en los Secrets de
   GitHub (Twitch, YouTube y Kick), nunca en archivos.
6. **Seguridad (Bruno, 2026-11-17):** clave de YouTube restringida; ruleset "proteger main"
   (solo `deletion` y `non_fast_forward`); "Secret scanning" y "Push protection" activados. Para
   un `--force` autorizado, desactivar el ruleset.
7. **Cloudflare Observability cobra por GB desde el 1 dic 2026** (correo del 20 nov): el plan
   gratuito da 0,5 GB/día; el despertador escribe una línea por turno (muy por debajo). Si se
   llegara al límite, solo se pausan los registros, no el despertador. Registros: 7 días.
