# Plan del proyecto: recuerdo del lanzamiento de GTA 6

> **Plan anterior archivado** el 2026-11-18 en `historial/PLAN_2026-11-18-3.md` (pasó de 20.000
> bytes; tiene las decisiones y los riesgos con más detalle). Antes: `historial/PLAN_2026-11-18-2.md`,
> `PLAN_2026-11-18.md`, `PLAN_2026-11-17-2.md`, `PLAN_2026-11-17.md`, `PLAN_2026-11-16.md` y
> `PLAN_DE_TRABAJO_*.md`. Un solo plan desde el 2026-11-16 (pedido de Bruno).

Un recuerdo del 19 de noviembre de 2026, día en que sale GTA 6, por diversión: una página web
con línea de tiempo, tablas y gráficos de Twitch, Kick, YouTube, Google Trends y titulares
(Reddit se midió del 13 al 17 nov y se quitó, 6.9). El estado vivo (dónde quedamos) está en
`ESTADO_ACTUAL.md`; las reglas, en `CLAUDE.md`.

## Cómo se usa este archivo

- Aquí van **las tareas que faltan, las decisiones vigentes y los riesgos**, en corto. El
  detalle va en el commit.
- Una tarea se marca `[x]` solo cuando está hecha **y verificada**. Si queda a medias o con un
  fallo, sigue en `[ ]` con el fallo anotado. Las hechas se resumen en "Lo ya hecho".
- Orden pedido por Bruno: primero lo acordado más importante; después su lista, de lo más
  sencillo a lo más largo. Códigos `A1`…`A8` y `D1`…`D6`: puntos de las listas originales de Bruno.
- Si pasa de 20.000 bytes, se archiva en `historial/` (ver `CLAUDE.md`).

## Fechas que mandan

- **19 de noviembre de 2026, 00:00 de Santiago:** lanzamiento. El recolector ya funciona solo
  (desde el 13 nov) y mide también al minuto 37 del 17 al 21 nov (UTC).
- **Entre el 20 y el 25 nov:** 6.1, una sola vez (se lanza sola, ver la tarea).
- **19 dic 2026:** fin de la medición por defecto (`recolector/interruptor.json`). La clave de
  GitHub del despertador de Cloudflare caduca después (31 ene 2027, o ~1 mar según Bruno).

## Tareas que faltan

### Antes o justo después del lanzamiento

- [ ] **7.4 Cápsula del tiempo.** "Lo que espero" ya está (texto de Bruno, 2026-11-15; diseño
      de cintas de casete, opción C). **Falta "Lo que me pareció"**, después del lanzamiento, en
      `web/capsula.js`. Lo escribe Bruno: Claude no inventa ese contenido.
- [ ] **6.8 Diseño de la sección nueva con lo de la 6.1** (pedido de Bruno, 2026-11-17). Desde el
      20 nov, con los datos ya guardados, diseñar cómo se ve la sección (países, búsquedas en
      aumento, GTA 6 frente a otros juegos, mes a mes desde 2013, Doomsday): opciones con
      capturas para Bruno antes de hacerla. Va junto con el punto (2) de la 6.1.
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
      dobles y con 25 min de tiempo. Recordatorios en el Google Calendar de Bruno el 21 y el 24 nov
      (16:30 de Santiago). **Falta:** (1) comprobar el 21 que se guardó; (2) mostrarlo en la página, con opciones y capturas; (3) idea sin
      decidir: repetir lo de Doomsday en enero, después de su estreno (18 dic).
- [ ] **9.11 Skill de animación y forma de administrarlas** (Bruno, 2026-11-17). (a) **Hecho
      (2026-11-17):** instaladas seis skills de `emilkowalski/skills` (MIT): `prototype`,
      `find-animation-opportunities`, `animate`, `choreograph`, `review-animations` y
      `animation-performance` (ver `CLAUDE.md`). (b) **Hecho en parte (2026-11-17, tras un debate entre dos agentes):** interruptor `portada` en `ACTIVAS` (pausa el movimiento continuo; con CPU 4× pasa de 19-38 cuadros largos a 0; probar con `?sin-anim=portada`) y fundido de Titulares al cambiar de página o de día. **Después del 22, con la 9.4:** "Personalizar" y "Ver N más" con cortina y la tabla por grupos completa; la Cápsula y el Álbum, cuando haya fotos. Portada optimizada sin quitar movimiento (2026-11-17, ver `ESTADO_ACTUAL.md`). **Falta además:** una forma sencilla de decidir qué
      elementos animan y cuáles no en TODA la página: hoy `web/animaciones.js` (`ACTIVAS`) cubre
      solo lo de la 9.8 y la 9.9. Siguiente paso: inventario con `find-animation-opportunities` y,
      con lo que elija Bruno, sumar el resto a esa tabla. Se puede enlazar con el "Panel de control".
- [ ] **9.4 Optimizar la página** (Bruno, 2026-11-16). Medido sin cambiar nada (Edge, gzip local;
      "celular lento" = 384 px, CPU 4×, 1,6 Mbps, 150 ms; ~1.000 mediciones simuladas = 19 dic).
      **Hecho (2026-11-16):** eje de los gráficos sin textos encimados (opción C: fechas y horas
      cortas según el espacio); `partes()` guarda lo ya calculado (480 → 40 ms; "Personalizar"
      460 → 30 ms); `probar_pagina.py` revisa textos encimados en los ejes. **Falta, después del
      22:** (a) `datos.js` pasará de 182 KB a ~1,6 MB (~320 KB comprimido; carga en el celular
      lento de 3,7 a 5,5 s): partirlo o aligerarlo. (b) ~750 ms fijos al cargar leyendo medidas
      de la página (`gota`, `estado` de los Shorts): moverlo después del primer dibujo.
      **Preparado el 20 nov en la rama `optimizar-9-4`** (Bruno, con abogado del diablo):
      `pruebas/medir_carga.py`. Hoy carga en 4,7 s y con 1.000 mediciones en 4,9 s (datos.js casi
      no influye). Lo lento es que los 8 `<script>` bajan uno tras otro (también en GitHub Pages)
      y ~1,7 s de CPU al arrancar. Plan corregido, **espera la decisión de Bruno:** (1) `preload`
      de los scripts en el `<head>` (`defer` no: rompe el `document.write` de
      `filtro-videos.js:116`); (2) quitar lecturas de medidas repetidas solo si una traza lo
      justifica; (3) aplicar el estilo y el lugar guardados en el `<head>`, para que no se vea
      Miami 1986 unos segundos (cambio visible: con permiso); (4) no partir las mediciones ni
      mover las fotos de Twitch (casi sin ganancia).
- [ ] **9.3 Menos alarmas por Google** (Bruno, 2026-11-16). **Hecho el 17 nov** (Bruno pidió
      "menos fallos" para el lanzamiento): Noticias reintenta una vez a los 20 s si Google da 429/503,
      y un 429/503 suelto de Noticias o Trends deja aviso amarillo con la ejecución en verde (rojo si
      se repite en la medición siguiente o si falla otra cosa). Del 17 nov: 10 de 30 ejecuciones en
      rojo, todas por Google o Reddit, sin perder datos. Probado en GitHub sin guardar. **Falta
      (después del 22):** resumen de huecos por fuente, hora, día y código en `recolector/revisar.py`.
- [ ] **6.6 Instagram** (Kick ya está hecho; ver "Lo ya hecho"). Parece difícil: la API de Meta
      solo funciona con una cuenta de empresa o creador propia unida a una página de Facebook, y
      la búsqueda por hashtag da pocas publicaciones, no el total, con límite semanal. Si no
      sirve, anotar a mano lo llamativo como evento. Verificar con una consulta real antes de
      afirmar nada.
      **2026-11-16:** formulario de la app de Meta revisado (caso de uso "Administrar mensajes y
      contenido en Instagram", sin portfolio, sin requisitos); no se creó: Bruno lo deja para después.

### Después del lanzamiento

- [ ] **7.1 Rebobinar el lanzamiento.** Una barra para mover la página hora por hora y revivir
      el 19 nov: números, gráfico y titulares de esa hora. Los datos ya quedan guardados.
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

### Fase 10 — Panel de control de videos (después del lanzamiento)

Entrevista con Bruno del 2026-11-18. Lo decidido y el detalle de cada parte, en
`PANEL_VIDEOS.md`. Panel local en el PC de Bruno para marcar videos con motivos ("no trata de
GTA", "hecho con IA", "dudoso") o rescatarlos; el visitante elige configuración y motivos.
Cada parte termina usable y verificada; se hacen en orden.

**Revisión de cada parte** (Bruno, 2026-11-18; él no es ingeniero y no tiene Codex):
`/code-review` al terminar cada tanda; en la 10.2, además `/security-review` (servidor local
que publica). Como segunda opinión, en vez de Codex, un **agente revisor nuevo** que no vio
cómo se hizo: recibe solo el código, `PANEL_VIDEOS.md` y la orden de buscar fallos (no de
aprobar), con otro modelo de Claude (por ejemplo Sonnet) para que no piense igual; cada fallo
que diga se comprueba de verdad antes de aceptarlo o descartarlo. Diseño: `impeccable` antes
de mostrar opciones. Al final de cada tanda, una **lista corta de comprobaciones visibles**
para que Bruno las haga él (por ejemplo: marcar un video, "Publicar" y ver que desaparece).

- **Hechas el 18 nov, las cuatro (unidas a `main` el mismo día):** 10.1 marcas, 10.2 panel ("Tabla"), 10.3
  rescatar y configuraciones propias, 10.4 selector del visitante ("Botón con panel"; rescates en
  "el de Rust" y las propias). "Publicar" del panel solo funciona desde `main`. Detalle en
  `PANEL_VIDEOS.md`.

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

## Lo ya hecho (detalle en `historial/PLAN_2026-11-18-3.md`, los anteriores y `git log`)

- **Fases 0 y 1:** hechas (1.1 a 1.7). **Fase 2:** 2.1 a 2.4 y 2.6 a 2.15 (falta 2.5). **Fase 3:**
  hecha (3.1 a 3.3). **Fase 4:** 4.1 y 4.2 (falta 4.3).
- **Fase 6:** 6.2 a 6.5; 6.6 Kick; 6.7 GTA 6 frente a Doomsday (previas del 17 y 18 nov en
  `datos/trends_previa/`); 6.9 quitar Reddit (para volver, `git revert`).
- **Fase 7:** 7.2, 7.3 y 7.5 a 7.12. **Fase 9:** 9.1, 9.5 a 9.10 y 9.12; tres horas cero con aviso
  de cada salida (C); Kick en "GTA frente a lo más visto" (fuente `kick_ranking`, 18 nov).
- **Fase 10:** 10.1 a 10.4, unidas a `main` el 18 nov.
- **Herramientas:** Graphify y sincronización del PC con GitHub (`sincronizar_datos.ps1`).
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
  Próximamente 7.11 C; menú flotante 2.12 B.
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

## Estructura de carpetas

`web/` (la página; `datos.js` y `dias/` se generan), `recolector/` (Python, LEEME.md), `datos/`
(un archivo por día UTC; solo los escribe GitHub), `despertador/` (Worker de Cloudflare),
`.github/workflows/`, `pruebas/` (LEEME.md; `capturas/` no va a git), `diseno/` (dibuja la
portada), `historial/` (versiones viejas); `PANEL_VIDEOS.md`, la Fase 10. Para ver la página en el PC: `ver_pagina.bat`.
