# Recuerdo del lanzamiento de GTA 6 (19 de noviembre de 2026)

Quiero recordar un evento histórico: la salida de GTA 6 el 19 de noviembre de 2026. Este
repositorio es para documentarlo. No busco hacer algo productivo, solo divertirme.

**Ver la página:** <https://rust-max-bot.github.io/Documentaci-n-Gta-6-19-de-nombiembre/>
(se abre en el celular o en el PC y se actualiza sola después de cada medición).

## Estado (20 de noviembre de 2026)

**GTA 6 ya salió** y la página sigue midiendo. Lo más alto medido hasta ahora:

- **Twitch:** 3.189.635 espectadores el 18 nov a las 13:07 (hora de Chile), cinco horas
  después de la medianoche del 19 nov en Nueva Zelanda, el primer lugar donde salió el juego.
- **Kick:** 1.433.865 espectadores el 18 nov a las 13:37 (hora de Chile).

La recolección sigue, en principio, hasta el 19 de diciembre. Lo que falta:

- Las preguntas extra a Google Trends (por país, búsquedas en aumento, comparaciones): se
  lanzan solas una vez entre el 21 y el 24 de noviembre, y después se mostrarán en la página
  junto con la sección "GTA 6 frente a Avengers: Doomsday".
- "Lo que me pareció" en la Cápsula del tiempo, y fotos y memes en el Álbum.
- Ideas para después: una barra para "rebobinar" el lanzamiento hora por hora y una mirada a
  cuánto duró el interés.

## Cómo se hizo

**Este proyecto está hecho con Claude**, una inteligencia artificial de Anthropic (con
Claude Code). Yo, Rust, tuve la idea, planeé el proyecto, decidí qué medir y cómo debía
verse la página, y elegí entre las opciones que me presentaba. **El código, los textos y las
pruebas no los escribí yo:** los escribió Claude, siguiendo lo que yo le pedía. Las reglas con
las que trabaja están en `CLAUDE.md`.

## Qué es

Un proyecto personal, hecho por diversión, que guarda **cómo se vivió el lanzamiento en
internet**: cuánta gente lo miraba en Twitch, qué videos se subían a YouTube, cuánto se
buscaba en Google y qué decían los titulares, antes, durante y después del día.

El resultado es **una página web** con dos estilos visuales, "Miami 1986" y "Miami 2026", y
un diseño original inspirado en Miami (no usa logotipos, tipografías ni arte de los juegos).
El cielo cambia entre día, atardecer y noche según la hora real de Miami. Todas las horas de
la página están en hora de Santiago de Chile.

## Qué tiene la página

- **Menú de secciones**: un botón "☰ Secciones" abajo a la derecha para saltar a cualquier
  parte. Arriba de las fichas dice cuándo fue la última medición, y si la página queda
  abierta se actualiza sola.
- **Cuenta regresiva** hasta la medianoche del 19 nov en Nueva Zelanda, Chile o Miami (con
  botones para elegir). Al llegar la hora cero hay fuegos artificiales y reflectores; ya
  pasada, cuenta el tiempo desde que salió el juego.
- **Fichas** con el máximo de espectadores en Twitch, el máximo en Google Trends y cuántas
  mediciones hay guardadas.
- **Logros y récords**: lo más alto que se ha medido (espectadores en Twitch y Kick,
  directos, videos, Shorts y titulares) y las visitas de los 7 tráilers oficiales de GTA VI.
- **Línea de tiempo**: eventos que el programa detecta solo (récords, cifras redondas, hora
  cero de cada lugar, caídas de servidores) y eventos anotados a mano en `web/eventos.js`.
- **Resumen del día**: una tarjeta por día con lo más importante, que se puede descargar como
  imagen cuadrada para compartir.
- **Gráficos** de espectadores en Twitch y Kick y de interés en Google Trends. Tres rayas
  punteadas marcan la medianoche del 19 nov en Nueva Zelanda, Chile y Miami, porque el juego
  salió a esa hora en cada país.
- **¿Se cayeron los servidores?**: estado de PlayStation Network y de la red de Xbox.
- **Twitch y Kick, medición por medición**, con un filtro por día.
- **Videos más vistos en YouTube**, con pestañas "Global" y "En español", videos largos y
  Shorts, y un botón para que cada visitante elija qué filtro de videos ver.
- **GTA frente a lo más visto**: el puesto de GTA en Twitch y en Kick y los videos de GTA en
  tendencias de YouTube (Chile y EE. UU.).
- **GTA 6 frente a Avengers: Doomsday** (aparece cuando lleguen los datos extra de Google
  Trends): el interés de búsqueda de los dos estrenos, día por día.
- **Titulares** de Google Noticias, por páginas, con barras por día para filtrarlos.
- **GTA 6 frente a otros lanzamientos**: espectadores en Twitch el día de la salida de otros
  juegos y otros récords de la saga, cada dato con su fuente.
- **Álbum de momentos**: capturas y memes del día del lanzamiento, cada uno con su hora.
- **Cápsula del tiempo**: lo que espero del juego (escrito antes del 19 nov) y lo que me
  pareció (después).
- **Próximamente**: lo que todavía falta agregar y cuándo llega.

Al compartir el enlace se ve una imagen de la portada (`web/compartir.jpg`).

## Qué se mide

| Fuente | Qué se guarda |
| --- | --- |
| Twitch | Espectadores y transmisiones de GTA VI, los canales con más público y el puesto de GTA VI y GTA V entre todas las categorías |
| Kick (desde el 16 nov) | Espectadores y transmisiones de GTA VI, los canales con más público y, desde el 18 nov, el puesto de GTA VI entre todos los directos |
| YouTube | Los videos más vistos sobre "GTA 6" (en todo el mundo y en español, largos y Shorts), las visitas, "me gusta" y comentarios de los 7 tráilers oficiales, los videos de GTA en tendencias de Chile y EE. UU. y los suscriptores del canal de Rockstar |
| Google Trends | Interés de búsqueda por hora (es relativo: 100 es el máximo de esos días) |
| Google Noticias | Titulares sobre el juego |
| PlayStation y Xbox | Si sus servicios en línea tienen problemas |

Se mide **cada hora**, y **cada 30 minutos** del 17 al 21 de noviembre, la semana del
lanzamiento. La recolección empezó el 12 de noviembre de 2026 y dura, en principio, hasta
el 19 de diciembre. Si una fuente falla, se anota el hueco y siguen las demás: **nunca se
inventa un dato**.

Reddit se midió del 13 al 17 de noviembre y después se quitó; lo guardado sigue en `datos/`.
Los directos de YouTube no se cuentan: YouTube no los agrupa por juego como Twitch y Kick.

Algunas cosas no se pueden medir con un programa (por ejemplo, el estado de los servidores
de Rockstar Games). Esas se anotan a mano.

## Cómo funciona

1. **El despertador** (`despertador/`): un Worker de Cloudflare (un programa pequeño que corre
   en los servidores de Cloudflare con un horario) que, a los minutos 7 y 37 de cada hora
   (UTC), le pide a GitHub que lance el recolector. Existe porque GitHub retrasaba o se
   saltaba sus ejecuciones programadas; el horario de Cloudflare se cumple a tiempo. El
   trabajo lo sigue haciendo GitHub: Cloudflare solo "toca el timbre".
2. **El recolector** (`recolector/`): un programa en Python que corre en GitHub Actions
   (`.github/workflows/recolectar.yml`), consulta las fuentes, revisa que todo cuadre y
   guarda una línea nueva en `datos/`. Se enciende, apaga o alarga en
   `recolector/interruptor.json`.
3. **Los datos** (`datos/`): un archivo de texto por día (en UTC), con una línea por
   medición en formato JSON. Es el recuerdo: no se borra ni se reescribe. El formato está
   explicado en `recolector/LEEME.md`.
4. **La página** (`web/`): solo HTML, CSS y JavaScript, sin librerías ni compilación.
   `recolector/generar_web.py` convierte `datos/` en `web/datos.js`, que es lo que lee la
   página.
5. **La publicación** (`.github/workflows/publicar-pagina.yml`): después de cada medición, y
   cuando cambia la página, GitHub prepara `web/datos.js` y publica `web/` en GitHub Pages.

Además:

- **`pruebas/`**: pruebas automáticas de la página (a 1280 y 384 px, en los dos estilos) y
  del despertador, con Playwright. Detalle en `pruebas/LEEME.md`.
- **`recolector/trends_extra.py`**: preguntas extra a Google Trends (por país, búsquedas
  relacionadas y comparaciones). Se piden una sola vez, después del lanzamiento: el
  despertador las lanza del 21 al 24 nov y solo se guarda el primer intento que salga bien
  (en `datos/trends_extra/`).
- **El panel de videos** (`panel/`, `panel_videos.bat`): un panel que solo se abre en el PC
  de Rust para corregir a mano qué videos de YouTube son de verdad sobre GTA 6 (el filtro
  automático solo lee títulos y temas). Detalle en `PANEL_VIDEOS.md`.

Las claves de acceso a Twitch y YouTube no están en el repositorio: se guardan como
secretos de GitHub (y la del despertador, como secreto de Cloudflare).

## Cómo ver la página

- **Desde el celular o cualquier navegador:** en la dirección de arriba. La publica GitHub
  Pages (activado en *Settings → Pages → Source: GitHub Actions*).
- **En el PC con Windows, sin internet:** doble clic en `ver_pagina.bat`. Trae las mediciones
  nuevas, prepara `web/datos.js` y abre `web/index.html` en el navegador. En otro sistema:

  ```sh
  python recolector/generar_web.py
  ```

  y después abrir `web/index.html`. Sin ese paso, la página muestra datos de ejemplo
  (marcados como tales).

## Documentos del proyecto

| Archivo | Qué tiene |
| --- | --- |
| `ESTADO_ACTUAL.md` | Dónde quedó el trabajo, los últimos cambios y lo pendiente |
| `PLAN.md` | Las tareas que faltan, las decisiones vigentes y los riesgos |
| `CLAUDE.md` | Las reglas de trabajo para Claude, el asistente que ayuda con el proyecto |
| `NUBE.md` | Cómo trabajar en el proyecto desde una sesión en la nube |
| `GUIA_CLAVES.md` | Cómo se crearon las claves de Twitch y YouTube |
| `PANEL_VIDEOS.md` | Cómo funciona el panel para clasificar videos |
| `DISENO_VISUAL.md` | Cómo se ve la página, para pedir opiniones de diseño |
| `graphify-out/` | Un mapa del proyecto (qué archivo usa a cuál) que Claude consulta para trabajar más rápido; `graph.html` se abre en el navegador |
| `historial/` | Versiones viejas de `ESTADO_ACTUAL.md` y del plan |

## Aviso legal

Proyecto de fans, sin fines comerciales y no afiliado, patrocinado ni aprobado por
Rockstar Games ni por Take-Two Interactive. Los datos vienen de fuentes públicas (Twitch,
YouTube, Kick, Google, Reddit, PlayStation y Xbox) y pertenecen a sus dueños.

Grand Theft Auto® y Rockstar Games® son marcas registradas de Take-Two Interactive
Software, Inc.
