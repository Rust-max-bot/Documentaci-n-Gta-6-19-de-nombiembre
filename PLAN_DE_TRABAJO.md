# Plan de trabajo

> El plan anterior, con el detalle de todas las tareas ya hechas, está en
> `historial/PLAN_DE_TRABAJO_2026-11-13.md` (archivado el 2026-11-13 al pasar de 20.000 bytes).

Creado el 2026-11-12 a partir de la lista "Cosas que quiero para mi app" de Bruno y de lo que
ya estaba acordado y faltaba. **Es la lista ordenada de qué hacer y en qué orden.**

- Las decisiones y sus motivos siguen en `PLAN.md`; el estado vivo, en `ESTADO_ACTUAL.md`.
- Una tarea se marca `[x]` solo cuando está hecha **y verificada** sin errores. Si queda a
  medias o con un fallo conocido, sigue en `[ ]` y se anota el fallo al lado.
- Orden pedido por Bruno: primero lo más importante que ya estaba acordado; después su
  lista, de lo más sencillo y rápido a lo más largo y complicado.
- Códigos entre paréntesis: `A1`…`A8` son los puntos de la lista "para mi app" y `D1`…`D6`
  los de "diseño", con la numeración original de Bruno.
- Si este archivo pasa de 20.000 bytes, se archiva en `historial/` (ver `CLAUDE.md`).

## Fechas que mandan

- **18 de noviembre de 2026:** el recolector tiene que llevar días funcionando solo (cumplido:
  funciona solo desde el 13 nov).
- **19 de noviembre de 2026, 00:00 de Santiago:** lanzamiento.
- **Antes del 19 nov** (después ya no sirve):
  - 7.4, Cápsula del tiempo: Bruno escribe lo que espera del juego.
  - (Ya hechas: 7.2 Hora cero, en `main` por el PR #9; y el recolector ya guarda lo de la
    6.3 desde el 13 nov.)

## Lo ya hecho (detalle en el historial)

- **Fase 0 — Claves y fuentes:** hecha (claves en GitHub; fuentes probadas).
- **Fase 1 — Recolector funcionando:** hecha, 1.1 a 1.7 (datos en `datos/`, interruptor,
  despertador de Cloudflare, página con datos reales, prueba completa).
- **Fase 2 — Mejoras rápidas:** hechas 2.1 a 2.4 (enlaces, miniaturas, suelo de 1986 sin
  parpadeo, rayas del sol). Queda la 2.5 (abajo).
- **Fase 3 — Mejoras medianas:** hecha, 3.1 a 3.3 (paleta B de 2026, Reddit por RSS,
  torres de Miami).
- **Fase 4:** hechas 4.1 y 4.2 (día, atardecer y noche según la hora de Miami). Queda la 4.3.
- **Fase 7:** hecha la 7.2 (hora cero; se prueba con `?probar-hora-cero`).

## Fase 2 — Mejoras rápidas (lo que queda)

- [ ] **2.5 (idea para después, pedida por Bruno el 2026-11-13) TikTok.** No hay acceso
      oficial para un proyecto personal: la API de investigación es solo para instituciones
      académicas sin fines de lucro, y TikTok Creative Center (hashtags con visitas) no tiene
      API y bloquea consultas desde servidores. Caminos: probarlo con una consulta real desde
      el PC y desde GitHub, o anotar a mano lo llamativo como evento. Bruno lo dejó para
      después.

## Fase 4 — Mejoras largas (lo que queda)

- [ ] **4.3 Análisis de datos (A3):** estadísticas e "datos interesantes" (popularidad,
      visitas, cuánto dura el interés después del lanzamiento, comparación antes y después).
      Va al final porque necesita varios días de datos reales para tener algo que mostrar.

## Fase 5 — Lo que ya estaba acordado para después del lanzamiento

- [ ] Búsqueda calmada: completar y contrastar datos, memes, cifras oficiales (`PLAN.md`, sección 4).
- [ ] **Clave de Reddit (idea para después, Bruno, 2026-11-13).** Pedir permiso a Reddit
      (formulario de soporte para desarrolladores) para guardar votos y comentarios. Tarda
      ~7 días y no está garantizado: ver `PLAN.md`, "Clave de Reddit".

## Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones

*(Pedido de Bruno, 2026-11-13. Se hace poco a poco, **después de terminar la Fase 4**. Nada de
esto está probado todavía, salvo lo que se dice en la 6.3: cada fuente nueva se verifica con
una consulta real antes de usarla. Ver el aviso 7, sobre la fecha del lanzamiento.)*

- [ ] **6.1 Más estadísticas de Google Trends.** Hoy se guarda solo "GTA 6" en todo el mundo,
      hora por hora, últimos 7 días. Lo que se podría agregar, cada cosa con su consulta aparte:
  - Interés por país (lista o mapa: en qué países se busca más).
  - Búsquedas relacionadas "en aumento" (qué más busca la gente junto con GTA 6).
  - GTA 6 junto a otras palabras en la misma escala (por ejemplo, GTA 5 u otros juegos), para
    que el 0 a 100 tenga con qué compararse.
  - Comparación histórica: el lanzamiento de GTA V (septiembre de 2013) frente al de GTA 6, en
    una sola consulta de 2013 a 2026 (puntos por mes).
  - Límites: Trends no dice cuántas búsquedas hubo, solo de 0 a 100. Además, cada consulta de
    más aumenta el riesgo de bloqueo (429), que ya pasó en pruebas el 13 nov (dos veces).
  - **Decisión de Bruno (2026-11-13): una sola vez, entre el 20 y el 25 nov,** con consultas
    sueltas y pausas, **fuera del recolector de cada hora**, para no arriesgar la medición
    del 19. Antes del 26 nov, porque Trends solo da el detalle hora por hora de los últimos
    7 días. No se empieza sin que Bruno diga cuándo.
- [x] **6.2 Sección de logros y récords (que se actualiza sola).** **En la página desde el
      2026-11-13** (opción A de Bruno, "vitrina"; ver `PLAN.md`). El recolector mide los 4
      videos oficiales de GTA VI desde el PR #11. Quedaron fuera, a propósito: "la hora con
      más interés en Trends" (siempre vale 100, aviso 8) y los récords históricos de los
      tráilers (no se buscó una fuente verificada; idea para después si Bruno la quiere).
  - Con los datos que ya se guardan, sin fuentes nuevas:
    - el máximo de espectadores en Twitch y cuándo fue;
    - el canal con más espectadores en un solo directo;
    - el máximo de transmisiones a la vez;
    - el video más visto de los medidos (título y enlace) y el que más creció en una hora;
    - la hora con más interés en Trends;
    - el día con más titulares;
    - la hora con más publicaciones en r/GTA6.
  - Cada récord muestra su fecha y un aviso de "nuevo récord" cuando se supera, con la lista
    de récords anteriores.
  - Dato nuevo, barato: las visitas de los tráilers oficiales, medidas por su enlace fijo, sin
    búsqueda, casi sin gastar cuota de YouTube. Los récords históricos de esos tráilers se
    anotan solo con fuente verificada.
- [x] **6.3 GTA comparado con lo más visto en Twitch y YouTube.** **En la página desde el
      2026-11-13** (opción A de Bruno, "dos columnas"; ver `PLAN.md`).
  - **Guardado desde el 2026-11-13** (Bruno eligió empezar antes del 19 nov). Hay dos fuentes
    nuevas en el recolector, `twitch_ranking` y `youtube_tendencias` (formato en
    `recolector/LEEME.md`). Se probaron con una consulta real desde GitHub (ejecución
    43499158586): GTA V iba en el puesto 4, GTA VI aún fuera de las 100 primeras, 5 videos de
    GTA en tendencias de Chile y 4 en las de EE. UU., y Rockstar con 14 millones de
    suscriptores.
  - Twitch:
    - en qué puesto está GTA VI entre todas las categorías (Twitch da el orden, no el número);
    - los espectadores de las 5 primeras, contados aparte;
    - GTA VI frente a GTA V.
  - YouTube:
    - cuántos videos de GTA hay entre los videos en tendencia de Chile y de EE. UU., y en qué
      puesto (1 unidad de cuota por país);
    - los suscriptores del canal de Rockstar (1 unidad).

- [ ] **6.4 Videos de YouTube en español (pedido de Bruno, 2026-11-13).** Hoy la búsqueda es
      "GTA 6" en todo el mundo, de más a menos visto: salen sobre todo videos en inglés. En la
      medición del 13 nov, 21:07 UTC, solo 5 de 50 parecían en español (casi todos shorts).
      Bruno quiere seguir viendo lo global y, además, a los creadores hispanohablantes (Chile,
      España, etc.; por ejemplo, si el Rubius sube un video muy visto).
  - Propuesta: una segunda búsqueda con idioma preferido español (`relevanceLanguage=es`).
    Es una preferencia de YouTube, no un filtro: puede traer algunos en inglés. Probado:
    solo funciona en el orden de relevancia (19 de 25 en español), no por visitas (3 de 25).
  - Cuota: cada búsqueda cuesta 100 unidades. La semana del lanzamiento se mide 2 veces por
    hora (48 × 105 = 5.040 al día); con la búsqueda en español en cada turno (101 unidades con
    sus estadísticas) serían ~9.900,
    demasiado cerca del límite de 10.000 (si se pasa, YouTube no responde nada más ese día).
    Por eso, la búsqueda en español solo en el turno del minuto 7 (24 al día): ~7.500.
  - Orden: el recolector, antes del 19 nov (el crecimiento hora por hora de esos videos el
    día del lanzamiento no se puede medir después). Cómo mostrarlo en la página (por
    ejemplo, pestañas "Global" y "En español"), con opciones y capturas, sin apuro.
  - Se verifica con una consulta real desde GitHub antes de usarla.
  - **Decisión de Bruno (2026-11-13): el recolector ahora, la página después.** Recolector
    hecho el 2026-11-13 (fuente `youtube_es`). Falta mostrarlo en la página, con opciones y
    capturas; queda en `[ ]` hasta entonces.

## Fase 7 — Ideas para que la página sea memorable

*(Sugerencias de Claude que Bruno aprobó el 2026-11-13: "las 5 me gustan". Cambian cómo se ve
la página, así que cada una se presenta con opciones y capturas antes de aplicarla.)*

- [ ] **7.1 Rebobinar el lanzamiento.** Una barra para mover la página hora por hora (con cada
      medición guardada) y revivir el 19 nov: los números, el gráfico y los titulares cambian
      a esa hora. Se puede hacer después del lanzamiento: los datos ya quedan guardados.
- [ ] **7.3 Viaje en el tiempo.** Al cambiar de Miami 1986 a 2026, las torres nuevas (tarea
      3.3) suben detrás de los hoteles, y al volver a 1986 bajan. Sin fecha límite.
- [ ] **7.4 Cápsula del tiempo.** Un texto de Bruno con lo que espera del juego, escrito
      **antes del 19 nov**, y otro después con lo que le pareció. Los escribe Bruno: Claude
      no inventa ese contenido. La página los muestra uno al lado del otro.
      **Página lista el 2026-11-13** (opción B, postales de Miami; ver `PLAN.md`). **Falta el
      texto de Bruno** en `web/capsula.js`, antes del 19 nov; queda en `[ ]` hasta entonces.
- [ ] **7.5 Resumen del día.** Una tarjeta automática por día con lo más importante: máximo de
      espectadores, video más visto, interés en Trends, cantidad de titulares y de
      publicaciones. Sale de los datos ya guardados. Sin fecha límite.

## Sin definir

- [ ] **D6:** en la lista de Bruno quedó cortado ("El miami actual de…"). **Bruno pidió
      ignorarlo por ahora** (2026-11-12); no se pregunta hasta que él lo retome.

## Avisos para Bruno (cosas donde su idea tiene un límite o un fallo)

Se conserva la numeración del plan anterior. Los avisos 1, 3 y 4 ya están resueltos (texto
completo en el historial).

1. *(Resuelto: Bruno aceptó archivos de texto por día en vez de una base de datos SQL.)*
2. **Peso de los datos (A3).** Unos 20 a 25 KB por medición; en el mes, del orden de 20 a
   35 MB sin comprimir (git los comprime). GitHub lo admite. El día del lanzamiento habrá
   más canales y titulares: se revisa.
3. *(Resuelto: el repositorio es público, así que los minutos de GitHub son gratis.)* YouTube
   no es problema: 105 unidades por medición desde la 6.3 y los tráilers de la 6.2, más la
   búsqueda en español de la 6.4 una vez por hora: unas 7.500 de las 10.000 diarias la semana
   del lanzamiento.
4. *(Resuelto: Reddit se lee por RSS; la clave queda en la Fase 5.)*
5. **Estado de Rockstar.** No se puede leer con programas, ni desde la nube ni desde GitHub.
   Las caídas de Rockstar se anotan a mano en `web/eventos.js`.
6. **Diseño más vivo (D3).** Se puede y se debe ser más atrevido, pero sin copiar el arte
   oficial del juego: se toma la idea (colores saturados de Florida), no las imágenes.
7. **Fase 6 y la fecha del lanzamiento.** Un dato que no se guardó el 19 nov no se puede
   recuperar después. Lo de la 6.3 ya se guarda desde el 13 nov. Sí se puede pedir a Trends
   más tarde: el interés por país, la comparación con otras palabras y la histórica. Los
   récords de la 6.2 salen de lo que ya se guarda.
8. **"Máximo en Google Trends" siempre vale 100.** Es el punto más alto del periodo, por
   definición, así que no sirve como logro. Para que diga algo hay que compararlo con otra
   cosa (otras palabras, otros países u otros lanzamientos): eso es la 6.1.
