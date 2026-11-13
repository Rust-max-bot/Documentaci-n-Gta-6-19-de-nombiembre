# Recuerdo del lanzamiento de GTA 6 (19 de noviembre de 2026)

Quiero recordar un evento histórico: la salida de GTA 6 el 19 de noviembre de 2026. Este
repositorio es para documentarlo. No busco hacer algo productivo, solo divertirme.

## Qué es

Un proyecto personal, hecho por diversión, que guarda **cómo se vivió el lanzamiento en
internet**: cuánta gente lo miraba en Twitch, qué videos se subían a YouTube, cuánto se
buscaba en Google y qué decían los titulares, antes, durante y después del día.

El resultado es **una página web** con una línea de tiempo del día y tablas y gráficos de
esos números. Tiene dos estilos visuales, "Miami 1986" y "Miami 2026", con un diseño
original inspirado en Miami (no usa logotipos, tipografías ni arte de los juegos).

## Qué se mide

| Fuente | Qué se guarda |
| --- | --- |
| Twitch | Espectadores y transmisiones en la categoría del juego, y los canales con más público |
| YouTube | Videos recientes sobre "GTA 6" y sus visitas, "me gusta" y comentarios |
| Google Trends | Interés de búsqueda por hora (es relativo: 100 es el máximo de esos días) |
| Google Noticias | Titulares nuevos sobre el juego |
| PlayStation y Xbox | Si sus servicios en línea tienen problemas |

Se mide **cada hora**, y **cada 30 minutos** del 17 al 21 de noviembre, la semana del
lanzamiento. La recolección empezó el 12 de noviembre de 2026 y dura, en principio, hasta
el 19 de diciembre.

Algunas cosas no se pueden medir con un programa (por ejemplo, el estado de los servidores
de Rockstar Games). Esas se anotan a mano.

## Cómo funciona

- **`recolector/`**: programa en Python que consulta las fuentes. Lo ejecuta GitHub Actions
  según el horario de `.github/workflows/recolectar.yml`. Si una fuente falla, se anota el
  hueco y siguen las demás: nunca se inventa un dato.
- **`datos/`**: las mediciones, un archivo de texto por día (en UTC), con una línea por
  medición en formato JSON. El formato está explicado en `recolector/LEEME.md`.
- **`web/`**: la página, hecha solo con HTML, CSS y JavaScript, sin librerías ni compilación.
- **`despertador/`**: un Worker de Cloudflare que lanza el recolector a su hora, porque
  GitHub no lanzaba solas las ejecuciones programadas (funciona desde el 13 de noviembre).

Las claves de acceso a Twitch y YouTube no están en el repositorio: se guardan como
secretos de GitHub.

## Cómo ver la página

En Windows, doble clic en `ver_pagina.bat`: trae las mediciones nuevas, prepara
`web/datos.js` y abre `web/index.html` en el navegador. En otro sistema:

```sh
python recolector/generar_web.py
```

y después abrir `web/index.html`. Sin ese paso, la página muestra datos de ejemplo
(marcados como tales).

## Aviso legal

Proyecto de fans, sin fines comerciales y no afiliado, patrocinado ni aprobado por
Rockstar Games ni por Take-Two Interactive. Los datos vienen de fuentes públicas (Twitch,
YouTube, Google, PlayStation y Xbox) y pertenecen a sus dueños.

Grand Theft Auto® y Rockstar Games® son marcas registradas de Take-Two Interactive
Software, Inc.
