# Recuerdo del lanzamiento de GTA 6 (19 de noviembre de 2026)

Quiero recordar un evento histórico: la salida de GTA 6 el 19 de noviembre de 2026. Este
repositorio es para documentarlo. No busco hacer algo productivo, solo divertirme.

**Ver la página:** <https://rust-max-bot.github.io/Documentaci-n-Gta-6-19-de-nombiembre/>
(se abre en el celular o en el PC y se actualiza sola después de cada medición).

## Cómo se hizo

**Este proyecto está hecho con Claude**, una inteligencia artificial de Anthropic (con
Claude Code). Yo, Bruno, tuve la idea, planeé el proyecto, decidí qué medir y cómo debía
verse la página, y elegí entre las opciones que me presentaba. **El código, los textos y las
pruebas no los escribí yo:** los escribió Claude, siguiendo lo que yo le pedía. Las reglas con
las que trabaja están en `CLAUDE.md`.

## Qué es

Un proyecto personal, hecho por diversión, que guarda **cómo se vivió el lanzamiento en
internet**: cuánta gente lo miraba en Twitch, qué videos se subían a YouTube, cuánto se
buscaba en Google, qué decían los titulares y qué se publicaba en Reddit, antes, durante y
después del día.

El resultado es **una página web** con dos estilos visuales, "Miami 1986" y "Miami 2026", y
un diseño original inspirado en Miami (no usa logotipos, tipografías ni arte de los juegos).
El cielo cambia entre día, atardecer y noche según la hora real de Miami. Todas las horas de
la página están en hora de Santiago de Chile.

## Qué tiene la página

- **Cuenta regresiva** hasta la medianoche del 19 nov en Nueva Zelanda, Chile o Miami (con
  botones para elegir). Al llegar la hora cero de Chile hay fuegos artificiales y reflectores.
- **Fichas** con el máximo de espectadores en Twitch, el máximo en Google Trends y cuántas
  mediciones hay guardadas.
- **Logros y récords**: lo más alto que se ha medido (espectadores, directos, videos,
  titulares, Reddit) y las visitas de los 4 videos oficiales de GTA VI.
- **Línea de tiempo**: eventos que el programa detecta solo (récords, cifras redondas, hora
  cero de cada lugar, caídas de servidores) y eventos anotados a mano en `web/eventos.js`.
- **Resumen del día**: una tarjeta por día con lo más importante.
- **Gráficos** de espectadores en Twitch y de interés en Google Trends.
- **¿Se cayeron los servidores?**: estado de PlayStation Network y de la red de Xbox.
- **Twitch, medición por medición**, con un filtro por día.
- **Videos más vistos en YouTube**, con pestañas "Global" y "En español".
- **GTA frente a lo más visto**: el puesto de GTA en Twitch y los videos de GTA en
  tendencias de YouTube (Chile y EE. UU.).
- **Titulares** de Google Noticias, por páginas, con barras por día para filtrarlos.
- **Reddit (r/GTA6)**: publicaciones por hora y las últimas publicadas.
- **Cápsula del tiempo**: lo que espero del juego (escrito antes del 19 nov) y lo que me
  pareció (después).

## Qué se mide

| Fuente | Qué se guarda |
| --- | --- |
| Twitch | Espectadores y transmisiones de GTA VI, los canales con más público y el puesto de GTA VI y GTA V entre todas las categorías |
| YouTube | Los videos más vistos sobre "GTA 6" (en todo el mundo y en español), las visitas de los 4 videos oficiales, los videos de GTA en tendencias de Chile y EE. UU. y los suscriptores del canal de Rockstar |
| Google Trends | Interés de búsqueda por hora (es relativo: 100 es el máximo de esos días) |
| Google Noticias | Titulares sobre el juego |
| Reddit | Publicaciones nuevas en r/GTA6 (por RSS: sin votos ni comentarios) |
| PlayStation y Xbox | Si sus servicios en línea tienen problemas |

Se mide **cada hora**, y **cada 30 minutos** del 17 al 21 de noviembre, la semana del
lanzamiento. La recolección empezó el 12 de noviembre de 2026 y dura, en principio, hasta
el 19 de diciembre. Si una fuente falla, se anota el hueco y siguen las demás: **nunca se
inventa un dato**.

Algunas cosas no se pueden medir con un programa (por ejemplo, el estado de los servidores
de Rockstar Games). Esas se anotan a mano.

## Cómo funciona

1. **El despertador** (`despertador/`): un Worker de Cloudflare que, a los minutos 7 y 37 de
   cada hora (UTC), le pide a GitHub que lance el recolector. Existe porque GitHub no
   lanzaba a tiempo sus ejecuciones programadas.
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
  relacionadas y comparaciones), que se lanzan a mano una sola vez después del lanzamiento.

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
| `PLAN_DE_TRABAJO.md` | La lista ordenada de tareas |
| `PLAN.md` | Las decisiones tomadas, las fuentes de datos y los riesgos |
| `CLAUDE.md` | Las reglas de trabajo para Claude, el asistente que ayuda con el proyecto |
| `NUBE.md` | Cómo trabajar en el proyecto desde una sesión en la nube |
| `GUIA_CLAVES.md` | Cómo se crearon las claves de Twitch y YouTube |
| `historial/` | Versiones viejas de `ESTADO_ACTUAL.md` y `PLAN_DE_TRABAJO.md` |

## Aviso legal

Proyecto de fans, sin fines comerciales y no afiliado, patrocinado ni aprobado por
Rockstar Games ni por Take-Two Interactive. Los datos vienen de fuentes públicas (Twitch,
YouTube, Google, Reddit, PlayStation y Xbox) y pertenecen a sus dueños.

Grand Theft Auto® y Rockstar Games® son marcas registradas de Take-Two Interactive
Software, Inc.
