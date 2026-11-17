# Plan del proyecto: recuerdo del lanzamiento de GTA 6

> **Plan anterior archivado** el 2026-11-17 en `historial/PLAN_2026-11-17.md` (pasó de 20.000
> bytes). Antes: `historial/PLAN_2026-11-16.md` (decisiones, fuentes y riesgos con su detalle) y
> `historial/PLAN_DE_TRABAJO_*.md` (tareas). Un solo plan desde el 2026-11-16 (pedido de Bruno).

Un recuerdo del 19 de noviembre de 2026, día en que sale GTA 6, por diversión: una página web
con línea de tiempo, tablas y gráficos de Twitch, Kick, YouTube, Google Trends, titulares y
Reddit. El estado vivo (dónde quedamos) está en `ESTADO_ACTUAL.md`; las reglas, en `CLAUDE.md`.

## Cómo se usa este archivo

- Aquí van **las tareas que faltan, las decisiones vigentes y los riesgos**, en corto. El
  detalle va en el commit y, si es largo, se resume aquí en una o dos líneas.
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
- [ ] **6.7 GTA 6 frente a Doomsday ya, antes del 19** (pedido de Bruno, 2026-11-17). Mostrar en la
      página, desde ahora, la popularidad de GTA 6 frente a Avengers: Doomsday en Trends (día por
      día, últimos 90 días), sin esperar a la 6.1. Pasos: (1) guardar una primera consulta con
      `trends_extra.py` (no toca el recolector de cada hora); (2) opciones con capturas para que
      Bruno elija cómo se ve; (3) cuando salga la 6.1 (21-24 nov), cambiarla por la nueva, que ya
      trae los días del lanzamiento. Probada el 17 nov desde el PC, sin guardar: GTA 6 llega a
      100 y Doomsday a 5 (90 días); mes a mes desde 2013, GTA 6 76 frente al 100 de GTA 5.
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
      y, de respaldo, un `schedule` de GitHub a las 18:41 UTC. Guarda solo la primera vez (paso
      "decidir": si ya hay archivo o es fuera del 20-25 nov 2026, termina en verde), sin ejecuciones
      dobles y con 25 min de tiempo. Recordatorios en el Google Calendar de Bruno el 21 y el 24 nov
      (16:30 de Santiago). **Falta:** (1) comprobar el 21 que se guardó; (2) mostrarlo en la página, con opciones y capturas; (3) idea sin
      decidir: repetir lo de Doomsday en enero, después de su estreno (18 dic).
- [ ] **9.4 Optimizar la página** (Bruno, 2026-11-16). Medido sin cambiar nada (Edge, gzip local;
      "celular lento" = 384 px, CPU 4×, 1,6 Mbps, 150 ms; ~1.000 mediciones simuladas = 19 dic).
      **Hecho (2026-11-16):** eje de los gráficos sin textos encimados (opción C: fechas y horas
      cortas según el espacio); `partes()` guarda lo ya calculado (480 → 40 ms; "Personalizar"
      460 → 30 ms); `probar_pagina.py` revisa textos encimados en los ejes. **Falta, después del
      22:** (a) `datos.js` pasará de 182 KB a ~1,6 MB (~320 KB comprimido; carga en el celular
      lento de 3,7 a 5,5 s): partirlo o aligerarlo. (b) ~750 ms fijos al cargar leyendo medidas
      de la página (`gota`, `estado` de los Shorts): moverlo después del primer dibujo.
- [ ] **9.3 Menos alarmas por Google** (Bruno, 2026-11-16; después del 22: toca el
      recolector). Hasta el 16 nov, 6 huecos en 101 mediciones, todos de Google (Trends 429 ×4,
      Noticias 429 y 503) y ninguno perdió datos (la siguiente medición los trae). Posible patrón:
      14:07 y 21:07 UTC fallaron dos veces cada una (pocos casos). Plan: resumen de huecos por fuente,
      hora, día y código en `recolector/revisar.py` (el registro ya está en `datos/`); un reintento
      a los 20 s para Noticias, como Reddit; y aviso amarillo (no rojo) si solo falla Google con
      429/503, dejando el rojo para claves caducadas o fallos varias horas seguidas.
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
      interés, antes y después. Necesita varios días de datos reales.
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

### Ideas para después, sin fecha

- [ ] **2.5 TikTok.** Sin acceso oficial para un proyecto personal (la API de investigación es
      solo para instituciones académicas; Creative Center no tiene API y bloquea servidores).
      Probar una consulta real desde el PC y desde GitHub, o anotar lo llamativo a mano.
- [ ] **Clave de Reddit.** **Ahora hace falta para seguir midiendo Reddit:** desde el 17 nov,
      18:37 UTC, Reddit bloquea su RSS público (404/403, también en otros subreddits; antes un
      429). Lo guardado no se pierde. Daría además votos y comentarios. Desde nov 2025 se pide con el formulario
      de soporte para desarrolladores; tarda ~7 días y no está garantizada.
- [ ] **IA barata para filtrar videos** (Bruno, 2026-11-15): que lea título, descripción y
      etiquetas para decidir si un video es de GTA 6. No Claude, por el costo. Antes, un plan pequeño.
- [ ] **Panel de control** (Bruno, 2026-11-15, trabajo extra): ajustar la página y marcar cada
      video como "es de GTA 6" o "no" (va a `ocultar` de `recolector/filtro_videos.json`; nada se
      borra de `datos/`). Riesgo: la página es pública y sin servidor, un panel en ella lo podría
      usar cualquiera. Opciones: panel solo en el PC de Bruno, o que guarde en GitHub con su cuenta.
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

## Lo ya hecho (detalle en `historial/PLAN_2026-11-17.md` y en `git log`)

- **Fase 0 y 1:** hechas, 1.1 a 1.7 (claves, fuentes, recolector, interruptor, despertador, página).
- **Fase 2:** 2.1 a 2.4 y 2.6 a 2.15. **Fase 3:** 3.1 a 3.3. **Fase 4:** 4.1 y 4.2.
- **Fase 6:** 6.2 a 6.5 y 6.6 Kick (categoría 13155, cada hora desde el 16 nov, opción B).
- **Fase 7:** 7.2, 7.3 y 7.5 a 7.12.
- **9.1** servidores más cortos (opción C); **línea de tiempo nueva** (2026-11-17, A); **Rockstar
  a mano** en los servidores (2026-11-17, C); **íconos pequeños** (2026-11-17, C); **Trends sin
  huecos** (2026-11-16, A).
- **9.5 a 9.7 (2026-11-17, opciones A):** tarjetas de videos y Shorts de alto fijo, gráfico con
  cifras al inicio y ahora, y "GTA frente a lo más visto" con GTA VI al centro. Detalle en `DISENO_VISUAL.md`.
- **Vidrio y neón (2026-11-17):** fichas y menú de vidrio, borde neón en 1986 al pasar el mouse.
- **Herramientas:** Graphify y sincronización del PC con GitHub (`sincronizar_datos.ps1`).
- Descartado por Bruno: app en el celular; Cloudflare Radar; redes de descarga de PlayStation y
  Xbox; la 9.2 "¿Cuánta gente faltó?".

## Decisiones vigentes

Cada una, en corto. El porqué y las opciones descartadas, en `historial/PLAN_2026-11-16.md`.

### Datos y recolección

- Fuentes: Twitch, YouTube y Google Trends (imprescindibles); además Kick, titulares de Google
  Noticias, Reddit por RSS (r/GTA6, sin votos), estado de PlayStation y Xbox, ranking de Twitch,
  tendencias de YouTube y los 4 videos oficiales de GTA VI. Rockstar no responde a programas:
  sus caídas se anotan a mano en `web/eventos.js`.
- Medición cada hora (minuto 7) y también al 37 del 17 al 21 nov (UTC), hasta el 19 dic, con
  interruptor manual. La lanza el despertador de Cloudflare (`despertador/`), no el `schedule`.
- Datos en archivos de texto, uno por día UTC (`datos/AAAA-MM-DD.jsonl`), no SQL. Horas en UTC;
  la página muestra hora de Santiago.
- Si una fuente falla: hueco visible con su hora, nunca un dato inventado; las demás siguen.
- YouTube: las tres búsquedas (global, español, 4 a 20 min) como mucho una vez por hora; las
  visitas en cada turno (~7.500 de 10.000 unidades diarias).
- Filtro de videos (`recolector/filtro_videos.json`, modo `estricto`): título sin hashtags que
  nombra GTA 6 + tema de videojuegos de YouTube, sin "roblox", más la lista `ocultar`. Solo
  decide qué se muestra; `datos/` no cambia.
- Comparaciones con otros juegos: solo el **arranque** (primeros días), cada cifra con su fuente
  y su plazo, copias y dólares por separado, sin escenarios inventados.

### Página

- HTML, CSS y JavaScript sin librerías ni compilación. Pública en GitHub Pages (desde el
  14 nov), la publica `publicar-pagina.yml` tras cada medición. Repositorio público (12 nov).
- Diseño original inspirado en Miami, dos estilos (1986 y 2026) y día, atardecer y noche según
  la hora de Miami. Sin logotipos, tipografías ni arte de Rockstar. Letras: Monoton, Rajdhani,
  Limelight y Outfit. Descripción de lo visual en `DISENO_VISUAL.md`.
- Toda decisión que cambie cómo se ve: opciones con capturas para Bruno antes de aplicarla.
- Formato de la hora: automático según el dispositivo (12 h o 24 h), sin botón; en 24 h la
  cuenta regresiva aclara en palabras. Para probar: `?probar-formato=12` o `=24`.
- Listas: lo más nuevo arriba; gráficos de viejo (izquierda) a nuevo (derecha).
- Opciones elegidas por Bruno (resumen): portada 7.12 A; Twitch y Kick juntos 6.6 B; videos en
  tarjetas con pestañas y tira de Shorts (6.4 A, 6.5 B); récords en vitrina 6.2 A; titulares como
  resumen B; GTA frente a lo más visto con GTA VI al centro 9.7 A; cápsula en
  cintas 7.4 C; copias por plazo 7.10 B; Próximamente como camino 7.11 C; menú flotante 2.12 B.
- Muchas visitas: `datos.js` lleva lo necesario al abrir; titulares y Reddit de cada día van en
  `web/dias/`. GitHub Pages admite ~100 GB al mes; plan B solo si avisa: Cloudflare Pages.

### Trabajo

- Sincronización del PC: tarea de Windows cada 30 min; se enciende o apaga con
  `sincronizar_interruptor.bat`; **Bruno la dejó apagada el 2026-11-16**. Cómo reconocerla
  como legítima: cabecera de `sincronizar_datos.ps1`.

## Riesgos y avisos vigentes

1. **Lo que no se guarda el 19 nov no se recupera** (espectadores en vivo, visitas de esa hora).
   Trends sí se puede pedir después.
2. **Google Trends es frágil:** sin acceso oficial; responde 429 si se le pregunta mucho
   (desde GitHub, ~1 de cada 25 mediciones). Defensas: reintento, serie de 7 días guardada y
   medición a los :37 la semana del lanzamiento. Respaldo: descargar a mano desde su web.
3. **El "máximo en Google Trends" siempre vale 100:** no sirve como logro sin otra cosa con qué
   comparar (eso es la 6.1).
4. **Peso de los datos:** ~20 a 25 KB por medición (más el día del lanzamiento); del orden de 20
   a 35 MB en el mes. GitHub lo admite.
5. **Las ejecuciones programadas solo corren desde `main`** y las claves nunca van en archivos
   del repositorio: van en los Secrets de GitHub (Twitch, YouTube y Kick).
6. **Seguridad de las cuentas (hecho por Bruno, 2026-11-17):** clave de YouTube restringida a
   "YouTube Data API v3"; ruleset "proteger main" (solo `deletion` y `non_fast_forward`: no
   pedir pull request ni historial lineal, o el recolector no podría subir datos); "Secret
   scanning" + "Push protection" activados. Para un `--force` autorizado, desactivar el ruleset.

## Estructura de carpetas

```text
web/                 la página: index.html, estilos.css, app.js, datos-ejemplo.js,
                     eventos.js (a mano), capsula.js (textos de Bruno), lanzamientos.js
                     (récords con fuente), album/ (fotos de Bruno), datos.js y dias/ (generados)
recolector/          Python: fuentes, validación, generar_web.py, trends_extra.py (LEEME.md)
datos/               mediciones, un archivo por día UTC; solo las escribe GitHub
despertador/         Worker de Cloudflare que lanza el recolector a su hora
.github/workflows/   recolectar, probar-fuentes, probar-kick, trends-extra, publicar-pagina
pruebas/             probar_pagina.py y otras pruebas (LEEME.md); capturas/ no va a git
historial/           versiones viejas de ESTADO_ACTUAL.md y del plan
```

Para ver la página en el PC: doble clic en `ver_pagina.bat` (trae las mediciones, prepara
`web/datos.js` y abre la página). `datos.js` no va a git: se rehace entero cada vez.
