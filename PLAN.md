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
| Dónde se ejecuta el programa | En GitHub, dentro de este repositorio (ejecuciones programadas) |
| Cada cuánto se guardan datos | Cada 30 minutos |
| Qué días | **Cambiado el 2026-11-12:** un mes, empezando cuanto antes (para registrar el interés previo) y hasta el 19 de diciembre de 2026 por defecto. Con interruptor manual para apagar, encender o alargar. Antes eran solo del 18 al 20 de noviembre |
| Claves de Twitch y YouTube | Las crea Bruno con una guía paso a paso. Aún no existen |
| Visibilidad de la página | Privada por ahora: se abre como archivo en el PC, sin enlace público. Se puede hacer pública más adelante |
| Eventos de la línea de tiempo | Ambos: automáticos (deducidos de los números, como el máximo de espectadores) y escritos a mano por Bruno en un archivo simple |
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

## 6. Riesgos conocidos

1. **Queda poco tiempo.** El programa debe estar probado antes del 18 de noviembre.
2. **Google Trends es la fuente más frágil.** No tiene un acceso oficial abierto.
   Respaldo: descargar los datos a mano desde su web; siguen disponibles días después.
3. **GitHub no es puntual.** Las ejecuciones programadas se atrasan a menudo varios
   minutos y alguna puede no ejecutarse. Cada medición guardará su hora real.
4. **Las ejecuciones programadas de GitHub solo funcionan desde la rama principal (`main`).**
   El trabajo tiene que estar unido a `main` antes del 18 de noviembre.
5. **Límite diario de YouTube.** El acceso gratuito tiene un tope de consultas por día.
   Hay que confirmar que 48 mediciones diarias caben.
6. **Si el repositorio es privado, GitHub da un tope mensual gratuito de minutos de ejecución.**
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
  datos.js            datos reales; todavía no existe, lo creará el recolector
recolector/           programa en Python que consulta las fuentes (formato y uso en recolector/LEEME.md)
  interruptor.json    encender, apagar o alargar la recolección
datos/                mediciones: un archivo de texto por día UTC (AAAA-MM-DD.jsonl), una línea por medición
.github/workflows/    recolectar.yml (cada 30 minutos) y probar-fuentes.yml (prueba manual)
```

**Cómo ver la página:** abrir `web/index.html` con doble clic en el PC. No necesita servidor.
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
