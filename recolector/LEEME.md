# Recolector

Programa en Python (solo biblioteca estándar) que mide las fuentes y guarda **una línea de
texto por medición** en `datos/AAAA-MM-DD.jsonl`. Decisión de Bruno del 2026-11-12: archivos
de texto por día en vez de una base de datos SQL (motivos en `PLAN.md`).

## Archivos

| Archivo | Qué hace |
|---|---|
| `recolectar.py` | Programa principal: lee el interruptor, mide cada fuente, valida y añade la línea |
| `fuentes.py` | Una función por fuente (Twitch, YouTube, Google Trends, titulares, PlayStation, Xbox) |
| `validar.py` | Comprobaciones antes de guardar. Si algo no cuadra, no se guarda nada |
| `red.py` | Piezas comunes para pedir datos a internet |
| `interruptor.json` | **Encender, apagar o alargar** la recolección |
| `filtro_videos.json` | Qué videos de YouTube muestra la página (filtro "¿es de GTA 6?"; se puede apagar) |
| `revisar.py` | Resumen de cómo va: mediciones, huecos, fallos, cupo de YouTube y peso |
| `generar_web.py` | Convierte `datos/` en `web/datos.js`, `web/dias/` y `web/version.json` para la página (lo usa `ver_pagina.bat`) |
| `probar_fuentes.py` | Prueba suelta de las fuentes (workflow "Probar fuentes"); no guarda nada |
| `trends_extra.py` | Tarea 6.1: 5 preguntas extra a Google Trends, **una sola vez** (ver abajo) |

El workflow `.github/workflows/recolectar.yml` corre en GitHub al minuto 7 de cada hora,
y también al 37 del 17 al 21 de noviembre (UTC), la semana del lanzamiento. Lo lanza el
despertador de Cloudflare (`despertador/`), porque GitHub no lanzaba a tiempo sus
ejecuciones programadas. Sube la línea nueva con un commit "Medición automática …".

## Interruptor (`interruptor.json`)

- `"activo": true` mide; `false` deja de medir (no borra nada).
- `"ultimo_dia": "2026-12-19"`: último día que se mide, en fecha de Santiago. Para alargar,
  poner una fecha posterior.
- Se puede editar en la web de GitHub (en `main`) o en el PC: **`git pull` antes**, porque
  GitHub sube una medición cada hora (cada 30 minutos del 17 al 21 nov), y commit y push
  después.

## Formato de cada línea

Una medición = un objeto JSON en una sola línea. Horas siempre en UTC (`2026-11-19T03:00:00Z`).
Los archivos se parten por día **UTC** (el día de Santiago empieza a las 03:00 UTC).

```text
v            versión del formato (1)
t            hora de inicio de la medición
origen       "github" (las de prueba en el PC nunca llegan a datos/)
ejecucion    número de la ejecución de GitHub
duracion_s   segundos que tardó
twitch       espectadores (suma de todas las transmisiones de la categoría), transmisiones,
             completo (false si había más páginas de las leídas), canales: los 20 con más
             público (login, nombre, espectadores, titulo, idioma, inicio, miniatura y,
             desde el 2026-11-13, foto: la foto de perfil). Si la consulta de fotos falla,
             los canales van sin foto y se anota error_fotos (la medición no se pierde)
kick         (desde el 2026-11-16) espectadores, transmisiones, completo, canales: los 10 con más
             público (canal, espectadores, idioma y, desde el 2026-11-17, foto: la foto de perfil, solo
             si es de files.kick.com)
youtube      busqueda, unidades gastadas, videos (hasta 50): id, titulo, canal, canal_id,
             publicado, visitas, me_gusta, comentarios, en_vivo, miniatura, puesto (en la
             búsqueda de esa medición; null si ya no sale pero se sigue midiendo). Desde el
             15 nov: busco (la búsqueda se hace como mucho una vez por hora; en los otros
             turnos solo se vuelven a medir los anteriores) y, en cada video, duracion
             (segundos), temas (los que YouTube asigna solo al video), short (true o false)
             y short_por: "url" (youtube.com/shorts/<id> responde 200 si es Short y redirige
             si no), "duracion" (más de 3 minutos: no puede ser Short) o "forma" (youtube.com
             no respondió: se adivina por duración y forma del reproductor, y se vuelve a
             preguntar en la siguiente medición). youtube_es y youtube_largos traen lo mismo
trends       palabra, rango, puntos_en_fuente, puntos: la serie de 7 días {t, interes, parcial}
             (hasta el 16 nov, solo las últimas 24 horas). Ante un 429, un reintento a los 20 s.
noticias     en_fuente, nuevas: solo titulares que no estaban en los 3 días anteriores
             {titulo, medio, medio_url, url, t}
playstation  ok, servicios_chile, region, problemas (+ original si hay problemas)
xbox         ok, general, estados (+ original si hay problemas)
twitch_ranking   (desde el 13 nov, tarea 6.3) leidas (categorías leídas, 100), puesto_gta6 y
             puesto_gta5 (null si no están entre las 100), top: las 10 primeras {id, nombre,
             puesto}, comparadas: las 5 primeras + GTA VI + GTA V {id, nombre, puesto,
             espectadores_top100, transmisiones_top100}. Twitch da el orden del ranking, no
             el número: los espectadores son la suma de las 100 transmisiones con más público
             de cada categoría (la misma aproximación para todas)
youtube_tendencias   (desde el 13 nov, tarea 6.3) unidades (3), regiones: {CL, US} con
             en_lista, primero {puesto, id, titulo, canal, visitas} y gta (los de la lista
             cuyo título dice GTA, Grand Theft Auto o Rockstar Games), rockstar: id, nombre,
             suscriptores (YouTube los redondea), visitas, videos del canal
youtube_es   (desde el 13 nov, tarea 6.4) como youtube, pero con idioma preferido español
             (relevanceLanguage=es: preferencia, no filtro) y en el orden de relevancia de
             YouTube (por visitas, YouTube ignoraba el idioma: 3 de 25 en español; por
             relevancia, 19 de 25, prueba del 13 nov). "puesto" es el de esa búsqueda. Además: idioma "es", busco (true si
             esa medición hizo la búsqueda; se busca como mucho una vez por hora, y en los otros
             turnos solo se vuelven a medir los videos anteriores) e idioma de cada video (el que
             declara el video; null si no lo declara)
youtube_largos   (desde el 15 nov, pedido de Bruno) como youtube, pero solo videos de 4 a
             20 minutos (videoDuration=medium), para tener videos normales en "Global": en la
             búsqueda por visitas, 45 de 50 eran Shorts. Además: duracion "4-20 min" y busco
             (como mucho una vez por hora)
youtube_trailers     (desde el 13 nov, tarea 6.2) unidades (1), pedidos (cuántos videos se
             pidieron, 4), videos: los videos oficiales de GTA VI del canal de Rockstar,
             medidos por su enlace fijo (lista en fuentes.py, YOUTUBE_TRAILERS) {id, titulo,
             canal, publicado, visitas, me_gusta, comentarios}
```

- **Hueco:** si una fuente falla, en su lugar va `{"error": "mensaje"}`. Nunca se inventa un
  dato. GitHub marca la ejecución en rojo y avisa por correo, pero la medición se guarda.
  Excepción (9.3): un 429/503 suelto de Google (Noticias o Trends) deja solo un aviso amarillo y
  la ejecución en verde; si se repite en la medición siguiente, vuelve a ser rojo.
- **Google Trends es relativo:** 100 es el máximo de los últimos 7 días, así que el mismo
  punto puede valer distinto en mediciones distintas.
- **YouTube:** tres búsquedas de "GTA 6" de los últimos 7 días (la global por visitas, la de
  español y la de videos de 4 a 20 minutos), cada una como mucho una vez por hora (100
  unidades). En cada medición se vuelven a medir los videos anteriores de las tres (1 unidad
  cada una), para tener series continuas, más 4 de las tendencias (6.3) y los tráilers (6.2).
  Unas 7.500 de las 10.000 unidades diarias, también la semana del lanzamiento, que mide dos
  veces por hora (decisión de Bruno, 2026-11-15).
- Enlaces (tarea 2.1): Twitch `https://www.twitch.tv/<login>`, YouTube
  `https://www.youtube.com/watch?v=<id>`, noticias en `url`.
- Miniaturas (tarea 2.2): la de Twitch (`miniatura`, con `{width}x{height}` que hay que
  reemplazar) es una foto del directo y, al terminar la transmisión, Twitch muestra una
  imagen genérica: por eso la página usa la foto de perfil (`foto`), que no cambia. Las de
  YouTube funcionan. Google Noticias no trae imágenes.

## Trends extra (`trends_extra.py`, tarea 6.1)

Se ejecuta **una sola vez**, a mano, entre el 20 y el 25 nov (decisión de Bruno, 2026-11-13),
fuera del recolector de cada hora: si Google bloquea por exceso de consultas (429), la
medición normal no se pierde. Hace 5 preguntas con 20 segundos de pausa entre cada una (si
Google pide esperar, reintenta a los 60 y a los 180 segundos):

1. `paises`: en qué países se busca más "GTA 6" (últimos 7 días).
2. `relacionadas`: qué más se busca junto con "GTA 6": `mas_buscadas` y `en_aumento`.
3. `comparacion`: "GTA 6" junto a otras palabras, hora por hora, últimos 7 días.
4. `historica`: GTA V frente a GTA 6, mes a mes, desde enero de 2013.
5. `pelicula`: GTA 6 frente a Avengers: Doomsday, día por día, últimos 90 días (pedido de
   Bruno, 2026-11-14; en la página va solo esta comparación).

Cada pregunta tiene su propia escala de 0 a 100 (100 = su punto más alto): los números de
dos preguntas distintas no se comparan. Guarda **un archivo nuevo**,
`datos/trends_extra/AAAA-MM-DDTHHMMZ.json`, y nunca sobrescribe. Si algo no cuadra, no
guarda nada. Las palabras están en `COMPARAR`, `HISTORICA` (elegidas por Bruno el 2026-11-13) y `PELICULA`
(2026-11-14).

- **De verdad:** workflow "Trends extra (6.1)", botón *Run workflow* en GitHub.
- **Para probar sin guardar:** workflow "Probar fuentes" con la casilla de Trends extra
  marcada, o en el PC `python recolector/trends_extra.py --carpeta <carpeta temporal>`.
  Probado desde GitHub el 2026-11-13 (ejecuciones 43517928828 y 43519671457, la segunda con
  las palabras de Bruno): 7 consultas cada una, sin bloqueo.

## De `datos/` a la página (`generar_web.py`)

`generar_web.py` escribe tres cosas en `web/`, que no se suben a git (en GitHub las prepara
`publicar-pagina.yml` antes de publicar):

- `web/datos.js` (`"formato": 2`): lo que la página necesita al abrir. Es como
  `web/datos-ejemplo.js`, con dos diferencias para que pese menos (2026-11-14): de los
  titulares solo trae sus horas (`noticias_t`, en segundos desde 1970, de la más vieja a la más
  nueva) y las series de visitas de los videos van como `[segundos, visitas]`.
  `dias` dice qué días hay y la huella de cada archivo.
- `web/dias/AAAA-MM-DD.js`: los titulares (cada uno con su número `i`, su posición en
  `noticias_t`) completos de un día UTC. La página los carga solo
  cuando tiene que mostrarlos.
- `web/version.json`: solo la fecha `generado`. La página lo mira cada 2 minutos para saber si
  hay datos nuevos.

Qué toma de cada medición:

- Twitch: total de espectadores y los 3 canales con más público (con su foto, si la hay).
- Google Trends: una serie **por hora** (`trends_horas`), con cada hora tomada de la medición
  más nueva que la trae completa (desde el 2026-11-16, opción A de Bruno). Así una medición
  fallida no deja hueco y la última semana queda en una sola escala. Cada fila de medición
  lleva el interés de su última hora completa (`hora`). Las horas de hace más de 7 días quedan
  en la escala de la última medición que las vio: valores muy separados no se comparan del todo.
- Servidores: `ok`, `problemas` o sin dato. Rockstar siempre sin dato: se anota a mano.
- YouTube: de la última medición, los que pasan el filtro de `filtro_videos.json` (pedido de
  Bruno, 2026-11-15): hasta 20 videos normales y 20 Shorts, con la serie de visitas de cada
  uno. "Global" junta la búsqueda por visitas y la de 4 a 20 minutos. El filtro: título sin
  hashtags que nombra GTA 6, tema de videojuegos según YouTube, sin las palabras de
  `excluir_palabras` y sin los videos de `ocultar`. Con `"modo": "ninguno"` se muestran todos.
- Noticias: todos los titulares guardados (la página los muestra por páginas de 12).

## Comprobaciones

Antes de añadir la línea, `validar.py` revisa tipos y rangos de cada fuente, que la hora sea
la de ahora y posterior a la última guardada, que no haya ninguna clave dentro, que no lleve
la marca de ejemplo y que no pese demasiado. También se aborta si el archivo del día termina
a medias. Si una fuente entrega datos que no cuadran, se guarda como hueco con el motivo.

## Probar en el PC

```bash
python recolector/recolectar.py --carpeta <carpeta temporal>   # nunca escribe en datos/
python recolector/revisar.py --horas 24                         # resumen de lo guardado
```

El programa no lee `.env`: en el PC, Twitch y YouTube salen como hueco salvo que las claves
estén puestas como variables de entorno. En GitHub usan los secretos.
