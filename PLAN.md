# Plan del proyecto: recuerdo del lanzamiento de GTA 6

Última actualización: 12 de noviembre de 2026.
Aquí van las decisiones, fases y riesgos. El estado vivo (dónde quedamos y qué falta)
está en `ESTADO_ACTUAL.md`.

## 1. Qué es esto

Un recuerdo del 19 de noviembre de 2026, día en que sale GTA 6.
Es un proyecto por diversión, sin fin productivo.

Resultado final: **una página web** con:

- Una línea de tiempo del día (qué pasó y a qué hora).
- Tablas y gráficos de números a lo largo del día.

## 2. Decisiones ya tomadas

| Tema | Decisión |
|---|---|
| Formato del recuerdo | Página web con línea de tiempo y tablas de números |
| Fuentes imprescindibles | Twitch, YouTube y Google Trends |
| Dónde se ejecuta el programa | En GitHub, dentro de este repositorio (ejecuciones programadas). **2026-11-12:** con el repositorio privado GitHub no lanzó ninguna programada; Bruno decidió hacerlo público (ver "Visibilidad del repositorio"). **2026-11-13:** ya público, siguió sin lanzar ninguna en 2 horas; Bruno pidió montar el plan B, un despertador en Cloudflare (`despertador/`), que lanza el workflow por la API de GitHub. Verificado el 2026-11-13 (12 turnos seguidos bien); el `schedule` de GitHub se quitó para no medir dos veces. Se descartó pasar el recolector entero a Cloudflare gratis: admite solo 50 consultas y 10 ms de cálculo por ejecución, y el día del lanzamiento Twitch puede pasarse; el plan de pago (5 USD/mes) queda como opción |
| Cada cuánto se guardan datos | **Cambiado el 2026-11-12 (Bruno):** cada hora (minuto 7), y también al minuto 37 del 17 al 21 de noviembre (UTC), la semana del lanzamiento. Motivo: gastar menos sin perder los picos cortos del lanzamiento. Antes era cada 30 minutos siempre |
| Qué días | **Cambiado el 2026-11-12:** un mes, empezando cuanto antes (para registrar el interés previo) y hasta el 19 de diciembre de 2026 por defecto. Con interruptor manual para apagar, encender o alargar. Antes eran solo del 18 al 20 de noviembre |
| Claves de Twitch y YouTube | Las creó Bruno con la guía paso a paso (`GUIA_CLAVES.md`) y están guardadas como secretos de GitHub (`TWITCH_CLIENT_ID`, `TWITCH_CLIENT_SECRET`, `YOUTUBE_API_KEY`). Probadas el 2026-11-12 y en uso cada hora desde entonces |
| Visibilidad de la página | Privada por ahora: se abre como archivo en el PC, sin enlace público. Se puede hacer pública más adelante |
| Visibilidad del repositorio | **Decidido por Bruno el 2026-11-12: público.** Motivos: con el repositorio privado GitHub no lanzaba las ejecuciones programadas, y en los públicos los minutos son gratis. Antes se limpió el historial (con `--force`, autorizado por Bruno solo para esto): sus correos pasaron al correo anónimo de GitHub y las rutas de su PC a `%USERPROFILE%`. Respaldo del historial original solo en el PC: `%USERPROFILE%\Proyectos\respaldo-historial-gta6-2026-11-12.git`. Pendiente: pedir a soporte de GitHub que borre la referencia del PR #1, que deja alcanzable el primer commit con el correo de Outlook |
| Eventos de la línea de tiempo | Ambos: automáticos (deducidos de los números, como el máximo de espectadores) y escritos a mano por Bruno en un archivo simple |
| Orden de las listas de la página | **Decidido por Bruno el 2026-11-13:** lo más nuevo arriba y lo más viejo abajo en la línea de tiempo, la tabla de Twitch (y sus botones de día) y los titulares. Los gráficos siguen de izquierda (viejo) a derecha (nuevo) y los videos de YouTube, por visitas |
| Videos de YouTube en la página | **Decidido por Bruno el 2026-11-13 (tarea 2.2):** tarjetas con miniatura, como los titulares (opción B), en vez de la tabla. Se ven más; las cifras al inicio y al final quedan al pasar el ratón |
| Imagen de los canales de Twitch | **Decidido por Bruno el 2026-11-13 (tarea 2.2):** la foto de perfil del canal, que guarda el recolector desde ese día. La miniatura de Twitch es una foto del directo que se pierde al terminar la transmisión. Las mediciones anteriores quedan sin foto |
| Titulares por páginas | **Pedido de Bruno el 2026-11-13:** la sección de titulares no crece sin fin: 12 por página, del más nuevo al más viejo, con botones "Más nuevos", números de página y "Más viejos", como en una tienda o un buscador. **Muestra todos los titulares guardados** (Bruno, 2026-11-13; antes solo los 60 más nuevos): unos 150 al día. Idea para después: filtro por día |
| Números del eje de los gráficos | **2026-11-13 (pedido de Bruno, al encontrar el fallo en la 1.7):** líneas en números redondos (1, 2, 2,5 o 5 por una potencia de 10; unas 5 líneas) y un decimal bajo los 100 mil ("2,5 mil"). Antes se redondeaba a miles enteros y engañaba ("3 mil" era 3.375) |
| Zona horaria de la página | Santiago de Chile (`America/Santiago`). Los datos se guardan en UTC y la página convierte al mostrar |
| Si una fuente falla | El programa sigue con las demás, anota el fallo con su hora (hueco visible, nunca un dato inventado), reintenta en la siguiente medición y GitHub avisa por correo |
| Tecnología | Dos piezas: **Python** recoge los datos (Bruno no lo ve, corre en GitHub) y **HTML, CSS y JavaScript** forman la página que Bruno abre en el navegador. No es una aplicación instalable |
| Dónde se trabaja | En la nube (Claude Code web) y también en el PC, indistintamente |
| Cómo se guardan los datos | **Decidido por Bruno el 2026-11-12:** archivos de texto, uno por día, en `datos/` (una línea por medición), en vez de una base de datos SQL. Motivo: en GitHub solo perduran los archivos del repositorio, y una base de datos en un archivo (SQLite) se guardaría entera en cada cambio, inflando el repositorio. Para el análisis se pueden cargar en una base de datos en el PC |

## Diseño de la página

- Debe ser vistoso, con animaciones, al nivel de los diseños que la gente muestra en X.
- Temática Miami, con **dos estilos que se cambian con un botón**:
  1. **Miami actual (2026)**: el ambiente de GTA 6.
  2. **Miami de los años 80**: el ambiente de GTA Vice City (neón, atardecer, estilo retro).
- Diseño **original inspirado en Miami**. No se copian logotipos, tipografías, imágenes
  ni arte de los juegos de Rockstar.
- Ambiente buscado: la avenida de hoteles art déco de Miami Beach (fachadas pastel de día,
  neones de noche), palmeras, mar y atardecer. Los edificios y palmeras son dibujos propios.
- Tipografías de Google Fonts, de licencia libre: Monoton, Rajdhani, Limelight y Outfit.
- Se aplicaron pautas de la skill de diseño Impeccable (leídas de su repositorio oficial,
  `pbakaus/impeccable`, licencia Apache 2.0). **Desde el 2026-11-12 la skill está en el
  repositorio** (`.claude/skills/impeccable/`, versión 0.1.22, copia manual), así que la
  usan también las sesiones en la nube. Falta solo el hook de diseño, que revisa cada archivo
  de la página que se modifica: para tenerlo, Bruno ejecuta `npx impeccable install` en su PC.
- El diseño se construye **pronto y con datos de ejemplo**, sin esperar a las claves ni a
  los datos reales. Motivo: Bruno tiene acceso al modelo actual solo esta semana.
- Las animaciones no deben impedir leer los datos; debe funcionar fluido en el PC de Bruno.

## 3. Qué se descartó y por qué

- **Tabla de jugadores en vivo**: descartada. GTA 6 sale en PS5 y Xbox Series,
  y esas plataformas no publican cuánta gente está jugando. Si la empresa anuncia
  cifras de ventas, se pueden añadir a mano después.
- **Tendencias de X (Twitter)**: fuera del plan. Leerlas de forma automática es de pago.

## 4. Fases del proyecto

**Fase 1 — En tiempo real (18 al 20 de noviembre).**
El programa guarda los números cada 30 minutos. Al terminar el día 20, se detiene.

**Fase 2 — Búsqueda calmada (después de la semana del lanzamiento).**
Sin prisa y sin mediciones hora a hora. Se buscan datos del mismo rango de fechas usando
herramientas y fuentes que guardan historial, para completar y contrastar lo recogido.
También entran aquí:

- Memes y capturas de pantalla.
- Lo que pase en la semana posterior a la salida.
- Cifras oficiales que se anuncien después (por ejemplo, ventas).

Límite importante de la Fase 2: no todo se puede recuperar después.

- Google Trends: sí guarda historial. Recuperable.
- Twitch: el acceso oficial solo da el número del momento. El historial depende de
  páginas de terceros, que pueden o no tener el detalle. Por verificar.
- YouTube: solo da las visitas actuales de un video, no las que tenía a cada hora del día 19.

Por eso la Fase 2 complementa a la Fase 1, pero no la reemplaza.

## 5. Qué se mide en cada fuente

Esto es una propuesta. Cada punto se verificará con una prueba real antes de darlo por hecho.

- **Twitch**: espectadores totales de la categoría GTA 6 y los canales con más público.
- **YouTube**: los videos más vistos sobre GTA 6 y sus visitas.
- **Google Trends**: interés de búsqueda de "GTA 6" hora por hora.

### Fuentes adicionales (si alcanza el tiempo, después de las tres imprescindibles)

- **Estado de servidores** (sección "¿se cayeron? sí/no"). Servicios que podrían fallar:
  los de Rockstar, PlayStation Network y la red de Xbox. Las tres empresas tienen páginas
  oficiales de estado. Por verificar: si un programa puede leerlas. Límite: las páginas
  oficiales a veces tardan en reconocer una caída. Los reportes de usuarios (tipo
  Downdetector) probablemente no se pueden leer gratis de forma automática; se anotarían a mano.
- **Noticias sobre GTA 6** (sección pequeña con titulares). Hay fuentes gratuitas de
  titulares recientes. Límite: no existe una medida fiable de "las más populares";
  se mostrarían los titulares más recientes o destacados de cada medición.

### Orden de prioridad

1. Twitch, YouTube y Google Trends.
2. Estado de servidores.
3. Noticias.

Principio de diseño: **simple pero ampliable.** Cada fuente es una pieza independiente.
Añadir una fuente nueva no obliga a tocar las demás.

### Resultado de las pruebas reales (12 de noviembre de 2026)

Hechas desde la sesión en la nube, sin claves. Falta repetirlas desde GitHub, cuyos
servidores pueden recibir un trato distinto.

| Fuente | Resultado | Dirección consultada |
|---|---|---|
| Titulares (Google Noticias) | Funciona. 100 titulares con fecha y medio | `news.google.com/rss/search?q="GTA 6"&hl=es-419&gl=CL&ceid=CL:es-419` |
| Estado de PlayStation | Funciona. Lista de servicios por país (incluye Chile); lista vacía significa sin problemas | `status.playstation.com/data/statuses/region/SCEA.json` |
| Estado de Xbox | Funciona. Estado general y por categoría; `None` significa sin problemas | `xnotify.xboxlive.com/servicestatusv6/US/en-US` |
| Google Trends | Funciona con condiciones. Método no oficial en tres pasos: abrir la página para recibir una cookie, pedir `api/explore` y luego `api/widgetdata/multiline`. Sin la cookie responde "demasiadas peticiones" (429). Dio 169 puntos, uno por hora, de los últimos 7 días | `trends.google.com/trends/api/...` |
| Estado de Rockstar | **No funciona.** La conexión se abre pero el sitio no responde a programas (se agota la espera). Probablemente protección contra robots | `support.rockstargames.com/servicestatus` |
| Twitch | **Funciona** (probado desde GitHub el 2026-11-12). Categoría "Grand Theft Auto VI", id `1867279146`. Entrega espectadores por transmisión; el total se obtiene sumando páginas de 100 | `api.twitch.tv/helix/streams?game_id=1867279146` |
| YouTube | **Funciona** (probado desde GitHub el 2026-11-12). Una búsqueda cuesta 100 unidades de las 10.000 diarias; las estadísticas, 1 | `googleapis.com/youtube/v3/search` y `/videos` |

El 2026-11-12 se repitieron todas desde los servidores de GitHub (workflow "Probar fuentes"):
mismo resultado que desde la nube. Google Trends también responde desde GitHub.

Consecuencias:

- Google Trends entrega datos por hora, no cada 30 minutos. Y como guarda 7 días de
  historial, cada ejecución puede rellenar huecos de las anteriores.
- El estado de Rockstar se anotará a mano, salvo que desde GitHub sí responda.
- Solo se ha visto el formato "sin problemas" de PlayStation y Xbox. El formato exacto
  de una caída no se ha visto todavía; el recolector debe guardar la respuesta original
  cuando no sea "sin problemas", para poder interpretarla después.

### Lista de Bruno del 2026-11-12

Bruno pidió más cosas: guardado que no pierda datos, análisis, Reddit, enlaces, miniaturas y
cambios de diseño. Están ordenadas en `PLAN_DE_TRABAJO.md`, con los avisos sobre sus límites.
Decisiones que salen de esa lista: el periodo pasa a un mes con interruptor manual; Reddit se
descarta si es de pago; el diseño de 2026 debe ser más vivo, sin copiar arte del juego.

### Reddit (decisión de Bruno, 2026-11-13)

Probado desde GitHub el 2026-11-13: el JSON sin clave (`www`, `old` y `api.reddit.com`) da
403. El RSS de `r/GTA6/new/.rss` responde, pero solo con título, autor, fecha y enlace.
**Bruno eligió el RSS** (sin votos ni comentarios); la clave de Reddit, que daría esos
números, queda para después. El recolector guarda solo las publicaciones nuevas de cada
medición, como con los titulares. Probado con el recolector completo desde GitHub (ejecución
43473711427): 100 publicaciones, todas validadas. **Ojo:** Reddit responde 429 ("demasiadas
consultas") a la segunda consulta seguida desde la misma máquina; el recolector consulta una
sola vez (y reintenta una vez a los 20 s), así que lo normal es que funcione. Si alguna hora
sale 429, queda como hueco de Reddit y las demás fuentes siguen igual.

## 6. Riesgos conocidos

1. **Queda poco tiempo.** El programa debe estar probado antes del 18 de noviembre.
2. **Google Trends es la fuente más frágil.** No tiene un acceso oficial abierto.
   Respaldo: descargar los datos a mano desde su web; siguen disponibles días después.
3. **GitHub no es puntual.** Las ejecuciones programadas se atrasan a menudo varios
   minutos y alguna puede no ejecutarse. Cada medición guardará su hora real.
   **Pasó de verdad (2026-11-12):** con el repositorio privado no lanzó ninguna. Se hizo
   público y tampoco las lanzó en 2 horas: el 2026-11-13 se montó el despertador de
   Cloudflare (`despertador/`), que funciona; GitHub después lanzó alguna programada,
   con 15-20 minutos de atraso.
4. **Las ejecuciones programadas de GitHub solo funcionan desde la rama principal (`main`).**
   El trabajo tiene que estar unido a `main` antes del 18 de noviembre.
5. **Límite diario de YouTube.** El acceso gratuito tiene un tope de consultas por día.
   Hay que confirmar que 48 mediciones diarias caben.
6. **(Resuelto el 2026-11-12: el repositorio es público y los minutos son gratis.)**
   **Si el repositorio es privado, GitHub da un tope mensual gratuito de minutos de ejecución.**
   Unas 144 ejecuciones cortas deberían caber, pero hay que confirmarlo.
7. **Las claves nunca se escriben en los archivos del repositorio.** Se guardan en los
   "Secrets" de GitHub.

## 7. Decisiones pendientes

- [x] Instalar y usar Graphify (mapa del proyecto para gastar menos tokens). Hecho el
      2026-11-12: instalado en el proyecto y primer grafo en `graphify-out/`.

## 8. Pasos siguientes

Se movieron a la sección "Pendiente" de `ESTADO_ACTUAL.md` (2026-11-12), para tener una sola
lista al día.

## 9. Estructura de carpetas

```
web/                  la página (ya existe)
  index.html          estructura de la página
  estilos.css         los dos estilos (variables de color al inicio del archivo)
  app.js              lee los datos y dibuja fichas, línea de tiempo, gráficos y tablas
  datos-ejemplo.js    datos inventados para probar el diseño
  eventos.js          eventos que Bruno anota a mano (hora de Santiago)
  datos.js            datos reales, generados en el PC por recolector/generar_web.py (no va a git)
recolector/           programa en Python que consulta las fuentes (formato y uso en recolector/LEEME.md)
  interruptor.json    encender, apagar o alargar la recolección
datos/                mediciones: un archivo de texto por día UTC (AAAA-MM-DD.jsonl), una línea por medición
.github/workflows/    recolectar.yml (cada hora; cada 30 min la semana del lanzamiento) y probar-fuentes.yml (prueba manual)
despertador/          Worker de Cloudflare que lanza el recolector a su hora (montado el 2026-11-13, sin verificar; LEEME.md)
```

**Cómo ver la página:** doble clic en `ver_pagina.bat` (en la carpeta del proyecto): trae las
mediciones nuevas de GitHub, prepara `web/datos.js` con `recolector/generar_web.py` y abre
`web/index.html`. No necesita servidor. Abrir `web/index.html` directamente también funciona,
pero con los datos de la última vez que se preparó (o de ejemplo, si nunca se preparó).
`web/datos.js` no se sube a git (decisión del 2026-11-12, tarea 1.6): se rehace entero cada
vez y subirlo cada 30 minutos inflaría el repositorio, el mismo problema que la base SQL.
Por eso los datos se cargan como archivos `.js` y no como `.json`: un navegador no deja leer
archivos `.json` sueltos cuando la página se abre con doble clic.

**Formato de los datos:** `web/datos.js` debe definir `window.DATOS` con la misma forma que
`window.DATOS_EJEMPLO` en `web/datos-ejemplo.js`. Si `datos.js` existe, la página lo usa y
deja de mostrar el aviso de "datos de ejemplo". Estado de servidores: `"ok"`, `"problemas"`
o `null` (sin dato).

## 10. Criterios para saber si salió bien

- Del 18 al 20 de noviembre hay mediciones cada 30 minutos, con pocos huecos.
- Ningún dato es inventado: donde falló una fuente, se ve "sin dato".
- La página se abre en el PC, muestra horas de Santiago y se entiende sin explicación.
- El botón cambia entre los dos estilos de Miami sin romper nada.
- Añadir una fuente nueva no obliga a rehacer lo existente.
