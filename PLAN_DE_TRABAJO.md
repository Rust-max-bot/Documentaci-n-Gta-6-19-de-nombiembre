# Plan de trabajo

> El plan anterior, con el detalle de las tareas hechas hasta el 2026-11-14 (2.6 a 2.15, 6.2 a
> 6.4, 7.3, 7.5 a 7.9), está en `historial/PLAN_DE_TRABAJO_2026-11-14.md` (archivado el
> 2026-11-14 al pasar de 20.000 bytes). El de antes, en `historial/PLAN_DE_TRABAJO_2026-11-13.md`.

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
- **Antes del 19 nov** (después ya no sirve): 7.4, Cápsula del tiempo: Bruno escribe lo que
  espera del juego. (Ya hechas: 7.2 hora cero y 7.6 hora cero en Nueva Zelanda y Miami.)
- **Entre el 20 y el 25 nov:** 6.1, una sola vez, cuando Bruno diga.

## Lo ya hecho (detalle en el historial)

- **Fase 0 — Claves y fuentes:** hecha (claves en GitHub; fuentes probadas).
- **Fase 1 — Recolector funcionando:** hecha, 1.1 a 1.7 (datos en `datos/`, interruptor,
  despertador de Cloudflare, página con datos reales, prueba completa).
- **Fase 2 — Mejoras rápidas:** hechas 2.1 a 2.4 y 2.6 a 2.15 (filtro por día de titulares,
  README, página publicada en GitHub Pages, nota "hecho con Claude", actualización sola, vista
  previa al compartir, menú de secciones, datos por días, muchas visitas y revisión de
  seguridad). Queda la 2.5 (abajo).
- **Fase 3 — Mejoras medianas:** hecha, 3.1 a 3.3 (paleta B de 2026, Reddit por RSS,
  torres de Miami).
- **Fase 4:** hechas 4.1 y 4.2 (día, atardecer y noche según la hora de Miami). Queda la 4.3.
- **Fase 6:** hechas 6.2 (logros y récords), 6.3 (GTA frente a lo más visto), 6.4 (videos en
  español) y 6.5 (videos y Shorts separados, filtro "¿es de GTA 6?" y búsqueda de videos de 4 a
  20 minutos; pedido de Bruno, 2026-11-15, opciones en `PLAN.md`). Queda la 6.1.
  **Idea a futuro (Bruno, 2026-11-15), sin fecha:** una IA barata que lea título, descripción
  y etiquetas de cada video para filtrar mejor (no Claude, por el costo). Antes, un plan pequeño.
  **Idea a futuro (Bruno, 2026-11-15), sin fecha, trabajo extra:** un panel de control para
  ajustar la página y, en la lista de lo más visto, marcar cada video como "es de GTA 6" (se
  queda) o "no lo es" (se oculta: va a `ocultar` de `recolector/filtro_videos.json`, no se
  borra nada de `datos/`). Detalle y riesgos en `PLAN.md`.
- **Fase 7:** hechas 7.2 (hora cero; se prueba con `?probar-hora-cero`), 7.3 (viaje en el
  tiempo), 7.5 (resumen del día), 7.6 (hora cero en cada lugar; se prueba con
  `?probar-fecha=2026-11-18T12:30Z`), la línea de tiempo con eventos nuevos, 7.7 (álbum de
  momentos), 7.8 (resumen como imagen) y 7.9 (comparar con otros lanzamientos). Quedan 7.1,
  7.4. Hechas también 7.10 (arranque frente a los más grandes) y 7.11 (Próximamente).
- *Idea 4 (instalarla como app en el celular): descartada por Bruno el 2026-11-14 ("prefiero
  que simplemente sea una página web").*

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

## Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones (lo que queda)

*(Pedido de Bruno, 2026-11-13. Cada fuente nueva se verifica con una consulta real antes de
usarla. Ver el aviso 7, sobre la fecha del lanzamiento.)*

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
  - **Programa listo y probado el 2026-11-13** (Bruno pidió avanzarlo): `recolector/trends_extra.py`
    y el workflow "Trends extra (6.1)", que se lanza a mano. Prueba sin guardar desde GitHub
    (ejecución 43517928828): 7 consultas, sin bloqueo; salieron las 4 respuestas (25+ países,
    25 búsquedas más buscadas y 20 en aumento, 169 horas, 167 meses). Detalle en
    `recolector/LEEME.md`.
  - **Palabras elegidas por Bruno (2026-11-13):** hora por hora, GTA 6, GTA 5, Minecraft,
    Fortnite y Marvel Rivals; mes a mes desde 2013, GTA 6, GTA 5, Ocarina of Time (remake,
    5 nov 2026) y Avengers Doomsday (18 dic 2026).
  - **Pregunta 5, pedida por Bruno el 2026-11-14: GTA 6 frente a Avengers: Doomsday, día
    por día** (solo esas dos palabras). En la página se muestra solo esa comparación directa,
    nada más de la película. El estreno de la película es el 18 dic: si se quiere ver, hay
    que repetir la pregunta después (ver el punto 3 de abajo). Probada sin guardar desde GitHub
    el 2026-11-14 (ejecución 43616477908): 93 días, sin bloqueo, junto con las otras 4.
  - Falta: (1) ejecutarlo de verdad entre el 20 y el 25 nov, cuando Bruno diga; (2) mostrarlo
    en la página, con opciones y capturas; (3) idea: repetir la pregunta en enero, para que
    salga el estreno de Doomsday (sin decidir). Queda en `[ ]`.
- [ ] **6.6 Estadísticas de Kick e Instagram** (pedido de Bruno, 2026-11-15: "si es posible";
      para hacerla más adelante). Nada de esto está verificado todavía: lo que sigue es lo que
      Claude cree y hay que probarlo con una consulta real antes de dar nada por hecho.
  - **Kick:** parece la más posible. Kick tiene una API oficial para desarrolladores (hay que
    registrar una app y pedir una clave). Idea: espectadores en vivo de GTA 6 en Kick, como ya
    se hace con Twitch, y Kick frente a Twitch en la página. La clave iría en los Secrets de
    GitHub.
    **Investigado el 2026-11-15 (documentación oficial, docs.kick.com):** gratis y sin
    aprobación (la documentación no menciona costo ni revisión). Pasos de Bruno: cuenta de
    Kick con verificación en dos pasos activada → kick.com/settings/developer → crear app
    (da Client ID y Client Secret; la dirección de retorno puede ser cualquiera, no se usa) →
    guardar los dos en los Secrets de GitHub (`KICK_CLIENT_ID`, `KICK_CLIENT_SECRET`). El
    programa pide una clave temporal con `POST https://id.kick.com/oauth/token`
    (`grant_type=client_credentials`), busca el número de la categoría con
    `GET https://api.kick.com/public/v2/categories?name=...` y lista los directos de esa
    categoría con `GET /public/v2/livestreams?category_id=...` (hasta 1000 por página, con
    `viewer_count` de cada uno; se suman). Comprobado: sin clave, la API responde 401
    "Unauthorized", así que la consulta real con datos queda para cuando Bruno cree la app.
    Falta saber el nombre exacto de la categoría de GTA 6 en Kick.
  - **Instagram:** parece difícil. La API oficial de Meta solo funciona con una cuenta de
    empresa o creador propia, unida a una página de Facebook, y la búsqueda por hashtag da
    pocas publicaciones y no el total (además, tiene límite de hashtags por semana). Si no
    sirve, la alternativa es anotar a mano lo llamativo como evento, como con TikTok (2.5).
  - **Ojo con la fecha (aviso 7):** lo que se mide en vivo (espectadores de Kick) solo se puede
    guardar mientras pasa. Si se quiere tener Kick el día del lanzamiento, hay que hacerla
    antes del 19 nov; después, solo se medirá desde el día en que empiece.
  - Si cambia la página, opciones con capturas antes de aplicarla.

## Fase 7 — Ideas para que la página sea memorable (lo que queda)

*(Sugerencias de Claude que Bruno aprobó el 2026-11-13: "las 5 me gustan". Cambian cómo se ve
la página, así que cada una se presenta con opciones y capturas antes de aplicarla.)*

- [ ] **7.1 Rebobinar el lanzamiento.** Una barra para mover la página hora por hora (con cada
      medición guardada) y revivir el 19 nov: los números, el gráfico y los titulares cambian
      a esa hora. Se puede hacer después del lanzamiento: los datos ya quedan guardados.
- [ ] **7.4 Cápsula del tiempo.** Un texto de Bruno con lo que espera del juego, escrito
      **antes del 19 nov**, y otro después con lo que le pareció. Los escribe Bruno: Claude
      no inventa ese contenido. La página los muestra uno al lado del otro.
      **Página lista el 2026-11-13** (opción B, postales de Miami; ver `PLAN.md`). **"Lo que
      espero" ya está** (2026-11-15): texto de Bruno, con la ortografía y la redacción
      corregidas por Claude y aprobado por Bruno; la Cara A se titula "Lo que espero de GTA 6
      (mi opinión)". El mismo día, diseño nuevo: cintas de casete con "Leer todo" (opción C
      de Bruno), porque el texto largo estiraba las postales. **Falta "Lo que me pareció"**, después del lanzamiento; la 7.4 queda en
      `[ ]` hasta entonces. El recordatorio del 17 nov, 19:00 de Chile, ya no hace falta.

- [x] **7.10 GTA 6 frente a los juegos más grandes: el arranque** (pedido de Bruno,
      2026-11-14). Ventas de los primeros días o semanas de los juegos más esperados y
      vendidos, cada una con su fuente y con cuántos días son, y un hueco de GTA 6 "esperando
      cifra oficial". Copias y dólares van separados. Incluye Ocarina of Time (5,2 M en 4
      días, "el único que se atrevió a salir el mismo mes que GTA 6"). Nada de ventas totales
      de toda la vida (eso es la Fase 8). **Hecha el 2026-11-14** con 13 juegos y la opción B de
      Bruno (barras por plazo). Falta solo, cuando Take-Two la publique, escribir la cifra de GTA 6
      en `gta6` de `web/lanzamientos.js`.
- [x] **7.11 "Próximamente"** (idea de Bruno, 2026-11-14). Una lista de lo que la página
      mostrará más adelante, donde cada cosa se llena sola cuando llega su momento: ventas
      oficiales de GTA 6, análisis del primer mes (4.3), rebobinar (7.1) y "GTA 6 en PC: sin
      fecha oficial". **Hecha el 2026-11-14** con la opción C de Bruno (camino hacia adelante).
      Al terminar la 4.3, la 7.1 o la Fase 8, marcar su punto como listo en `web/app.js`.
- [ ] **7.12 Una portada con más lógica: que Miami tenga suelo** (idea de Bruno, 2026-11-15;
      sin fecha, es una posibilidad). Hoy los hoteles y las palmeras están parados directo sobre
      el mar (2026) o sobre la rejilla de neón (1986), y los troncos de las palmeras terminan en
      el agua. Idea: poner tierra entre los hoteles y el mar, como en Ocean Drive (una calle,
      una vereda y la arena antes del agua), y que las palmeras estén plantadas en la vereda o
      la arena, o que la base de su tronco quede oculta detrás de algo (un muro bajo, una
      baranda), para que la escena se vea más viva y creíble. En 1986, lo mismo a su manera (por
      ejemplo, una calle de neón antes de la rejilla). Tiene que funcionar en los 2 estilos, los
      3 momentos del día y a 1280 y 384 px, y la portada no puede crecer tanto que tape la
      cuenta regresiva. Cambia cómo se ve la página: antes, opciones con capturas para Bruno.
      **Condición de Bruno (2026-11-15): el suelo se agrega sin quitar el mar.** El mar sigue
      en la escena; el suelo va entre los hoteles y el agua.
- [ ] **7.13 Sección de memes** (pedido de Bruno, 2026-11-15: "si es posible"; requiere
      investigación antes de hacer nada). Va de la mano con la "búsqueda calmada" de la
      Fase 5, que ya incluía memes (`PLAN.md`, sección 4). Lo que hay que investigar primero:
  - **De dónde salen:** por ejemplo, las publicaciones de Reddit que ya se guardan (las que
    son imagen), Know Your Meme, o memes que Bruno elija y suba él mismo (como el álbum, 7.7).
  - **Derechos de autor:** la página es pública; copiar imágenes de otros tiene riesgo. Lo
    más seguro es enlazar a la publicación original (con su miniatura, si el sitio lo
    permite) en vez de guardar la imagen, y siempre decir de dónde viene.
  - **Contenido:** algunos memes pueden ser ofensivos; habría que elegirlos, no mostrarlos
    todos solos.
  - **No inventar:** Claude no crea memes ni dice que algo es "el meme del día" sin una fuente.
  - Resultado de la investigación: un plan corto con opciones para Bruno. La sección cambia
    cómo se ve la página: opciones con capturas antes de aplicarla.

## Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida)

*(Decisión de Bruno, 2026-11-14. No se empieza hasta que Bruno avise con una confirmación
oficial de la versión de PC. Todo lo anterior es la fase 1, consolas, y no se toca.)*

- [ ] **8.1 Apenas Bruno avise:** alargar el recolector en `recolector/interruptor.json` (hoy
      mide hasta el 19 dic) y renovar la clave de GitHub del despertador de Cloudflare, que
      caduca después del 19 dic (31 ene 2027, o ~1 mar 2027 según recuerda Bruno). Revisar
      la cuota de YouTube.
- [ ] **8.2 Fuente nueva: Steam.** Jugadores a la vez (API oficial y gratis de Steam, sin
      clave). Es la cifra estrella de un lanzamiento en PC; en consolas no existe. Se
      verifica con una consulta real cuando el juego tenga su página en Steam (hace falta su
      número de app). Rockstar Games Launcher y Epic no publican cifras.
- [ ] **8.3 La página:** cuenta regresiva y hora cero del lanzamiento en PC, y "consolas
      frente a PC" (Twitch, YouTube y Trends de los dos lanzamientos). Diseño con opciones y
      capturas.
- [ ] **8.4 Los más vendidos de la historia** (pedido de Bruno, 2026-11-14): ventas totales
      de toda la vida (Tetris, Minecraft, GTA V, RDR2…), con las cifras al día y su fuente,
      para ver dónde queda GTA 6 meses después. Ojo: el documento que trajo Bruno el 14 nov
      tenía cifras viejas (GTA V iba en más de 230 M y RDR2 en más de 87 M en ago 2026).

## Sin definir

- [ ] **D6:** en la lista de Bruno quedó cortado ("El miami actual de…"). **Bruno pidió
      ignorarlo por ahora** (2026-11-12); no se pregunta hasta que él lo retome.

## Avisos para Bruno (cosas donde su idea tiene un límite o un fallo)

Se conserva la numeración de los planes anteriores. Los avisos 1, 3 y 4 ya están resueltos
(texto completo en el historial).

1. *(Resuelto: Bruno aceptó archivos de texto por día en vez de una base de datos SQL.)*
2. **Peso de los datos (A3).** Unos 20 a 25 KB por medición; en el mes, del orden de 20 a
   35 MB sin comprimir (git los comprime). GitHub lo admite. El día del lanzamiento habrá
   más canales y titulares: se revisa.
3. *(Resuelto: el repositorio es público, así que los minutos de GitHub son gratis.)* YouTube
   no es problema: desde el 15 nov, las tres búsquedas (global, español y videos de 4 a 20
   minutos, 6.5) se hacen como mucho una vez por hora y las visitas se miden en cada turno: unas
   7.500 de las 10.000 diarias, también la semana del lanzamiento.
4. *(Resuelto: Reddit se lee por RSS; la clave queda en la Fase 5.)*
5. **Estado de Rockstar.** No se puede leer con programas, ni desde la nube ni desde GitHub.
   Las caídas de Rockstar se anotan a mano en `web/eventos.js`. Vuelto a probar desde GitHub el
   2026-11-14: sigue sin responder, aunque en el navegador de Bruno carga sin "no soy un robot".
6. **Diseño más vivo (D3).** Se puede y se debe ser más atrevido, pero sin copiar el arte
   oficial del juego: se toma la idea (colores saturados de Florida), no las imágenes.
7. **Fase 6 y la fecha del lanzamiento.** Un dato que no se guardó el 19 nov no se puede
   recuperar después. Lo de la 6.3 ya se guarda desde el 13 nov. Sí se puede pedir a Trends
   más tarde: el interés por país, la comparación con otras palabras y la histórica. Los
   récords de la 6.2 salen de lo que ya se guarda.
8. **"Máximo en Google Trends" siempre vale 100.** Es el punto más alto del periodo, por
   definición, así que no sirve como logro. Para que diga algo hay que compararlo con otra
   cosa (otras palabras, otros países u otros lanzamientos): eso es la 6.1.
