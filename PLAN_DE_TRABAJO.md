# Plan de trabajo

Creado el 2026-11-12 a partir de la lista "Cosas que quiero para mi app" de Bruno y de lo que
ya estaba acordado y faltaba. **Es la lista ordenada de qué hacer y en qué orden.**

- Las decisiones y sus motivos siguen en `PLAN.md`; el estado vivo, en `ESTADO_ACTUAL.md`.
- Una tarea se marca `[x]` solo cuando está hecha **y verificada** sin errores. Si queda a
  medias o con un fallo conocido, sigue en `[ ]` y se anota el fallo al lado.
- Orden pedido por Bruno: primero lo más importante que ya estaba acordado; después su
  lista, de lo más sencillo y rápido a lo más largo y complicado.
- Códigos entre paréntesis: `A1`…`A8` son los puntos de la lista "para mi app" y `D1`…`D6`
  los de "diseño", con la numeración original de Bruno.

## Fechas que mandan

- **18 de noviembre de 2026:** el recolector tiene que llevar días funcionando solo.
- **19 de noviembre de 2026, 00:00 de Santiago:** lanzamiento.
- Cada día sin recolector es un día de "interés previo" que no se registra (A4), sobre todo
  en Twitch y YouTube, que no guardan historial. Por eso la Fase 1 va antes que todo.

## Fase 0 — Claves y fuentes

- [x] Bruno crea las tres claves y las guarda como secretos de GitHub.
- [x] Probar Twitch y YouTube con consultas reales desde GitHub (A1). Hecho el 2026-11-12:
      las dos funcionan. Resultados en `PLAN.md`, sección 5.
- [x] Repetir desde GitHub las fuentes sin clave. Google Trends, titulares, PlayStation y
      Xbox funcionan; Rockstar no responde a programas.

## Fase 1 — Recolector funcionando (lo más importante)

Incluye tres puntos de la lista de Bruno que no se pueden separar del recolector: dónde se
guardan los datos (A2), empezar cuanto antes (A4) y el periodo de un mes con interruptor (A6).

- [x] **1.1 Confirmar con Bruno cómo se guardan los datos (A2).** Bruno aceptó el
      2026-11-12: archivos de texto, uno por día, en `datos/` (una línea por medición), en
      vez de una base de datos SQL. Motivos en "Avisos para Bruno", punto 1.
- [x] **1.2 Programar el recolector** (`recolector/`): Twitch, YouTube, Google Trends,
      titulares, PlayStation y Xbox. Cada fuente es una pieza independiente; si una falla, se
      anota el hueco y siguen las demás. Guarda también lo necesario para A7 y A8 (enlaces y
      miniaturas), para no tener que volver a recolectar después.
- [x] **1.3 Interruptor y periodo (A6):** archivo de configuración con "activo: sí/no" y
      fecha de fin (por defecto, un mes: hasta el 19 de diciembre de 2026). Bruno puede
      apagarlo, encenderlo o alargarlo cambiando una línea.
- [x] **1.4 Ejecución programada en GitHub** cada 30 minutos, con validaciones antes de
      guardar (regla "datos por programa"). **Fallo pendiente (2026-11-12):** las
      ejecuciones manuales funcionan, pero hasta las 17:56 de Santiago GitHub no lanzó
      ninguna programada (se saltó las de 16:37, 17:07 y 17:37). Investigado el 2026-11-12:
      sin causa propia, coincide con un fallo de GitHub en repositorios privados nuevos. Se
      reescribió el `cron` (no bastó) y Bruno decidió hacer público el repositorio, con el
      historial limpio de sus datos personales. Horario nuevo: cada hora, y cada 30 minutos
      del 17 al 21 nov. Ya público, tampoco lanzó ninguna (00:07 y 01:07 UTC del 13 nov):
      el 2026-11-13 se montó el despertador de Cloudflare (`despertador/`). El turno de las
      01:37 UTC corrió bien (y no midió, como debe fuera de la semana del lanzamiento).
      **Verificado el 2026-11-13:** el despertador lanzó el recolector cada hora (minuto 7)
      de 02:07 a 13:07 UTC, 12 seguidas, todas bien y con su medición guardada. GitHub sí
      lanzó dos programadas, tarde (03:23 y 12:05), que midieron dos veces esos turnos; se
      quitó el `schedule` de `recolectar.yml`.
- [x] **1.5 Dejarlo funcionando y revisar la primera hora (A4)** (cambiado por Bruno el
      2026-11-12: en vez de vigilar 24 horas, que exigiría el PC encendido y gastaría
      tokens). Basta con que dos ejecuciones programadas arranquen solas y guarden bien.
      Hecho el 2026-11-13: 12 seguidas lanzadas por el despertador (ver 1.4).
- [x] **1.5b Opcional: revisión única de las primeras 24 horas** en la siguiente sesión, con
      `python recolector/revisar.py --horas 24`: cambio de archivo a medianoche UTC, cupo de
      YouTube, bloqueos de Google Trends y ejecuciones que GitHub se haya saltado. Los datos
      quedan guardados igual; es solo mirar. **Hecha el 2026-11-13 (~13:30 UTC):** 21
      mediciones, las seis fuentes respondieron en todas (0 huecos, 0 bloqueos de Trends,
      0 errores de servidor). Cada archivo del día tiene solo horas de su fecha UTC. YouTube
      gasta 101 unidades por medición, siempre las mismas (100 la búsqueda y 1 la consulta
      de videos; `recolector/fuentes.py`): 48 al día serían 4.848 de 10.000. *(Corregido en
      la 1.7: al principio se anotó ~59, mal calculado; el cupo se cuenta por día de
      California, no por día UTC.)* Peso ~25 KB por medición (~35 MB en 30 días). Faltan 00:07 y 01:07
      UTC del 13 nov (antes del despertador). **Fallo de `revisar.py`:** sigue suponiendo una
      medición cada 30 minutos, así que marca como "hueco" cada hora normal y espera el
      doble de mediciones; no sabe del horario nuevo (cada hora, y cada 30 min del 17 al 21
      nov).
- [x] **1.6 Conectar la página con los datos reales** (`web/datos.js` generado por
      programa). La página deja de mostrar el aviso de "datos de ejemplo". Hecho el
      2026-11-12: `recolector/generar_web.py` y `ver_pagina.bat`; verificado con Playwright
      a 1280 y 384 px en los dos estilos, sin errores ni desborde.
- [x] **1.7 Prueba completa antes del 18 de noviembre.** Lista aprobada por Bruno el
      2026-11-13; hecha ese día (~14:30 UTC). El fallo del eje (punto 3) se corrigió el
      mismo día, a pedido de Bruno: líneas en números redondos (0, 1, 2, 3, 4, 5 mil) y un
      decimal bajo los 100 mil; verificado a 1280 y 384 px en los dos estilos.
      1. Despertador en la semana del lanzamiento: el código real de `despertador/worker.js`
         probado en Edge (Playwright) con 13 horas simuladas y un GitHub falso: el minuto 37
         mide solo del 17 nov 00:00 al 22 nov 00:00 UTC, el 7 siempre; la orden a GitHub va
         bien formada; sin clave o con respuesta 401 da error. Todo bien. *No verificado:* que
         el código pegado en Cloudflare sea idéntico a esta copia (hace falta entrar en
         Cloudflare).
      2. `revisar.py` sigue ahora el horario del despertador (turnos que faltan, dobles y a
         mano); probado con los datos reales y con datos inventados de la semana.
      3. Cadena completa con la medición automática de las 14:07 UTC (en vez de una a mano,
         para no medir dos veces ese turno): despertador → GitHub → `datos/` →
         `generar_web.py` → página. Página a 1280 y 384 px en los dos estilos: sin errores
         de consola, sin desborde, sin aviso de ejemplo, y sale la medición de las 14:07.
         **Fallo encontrado:** el eje del gráfico de Twitch redondea a miles enteros: con un
         tope de 4.500 las marcas (1.125, 2.250, 3.375, 4.500) salen como "1 mil, 2 mil,
         3 mil, 5 mil" (`compacto()` en `web/app.js`). Engaña al leer el gráfico.
         Corregido (ver arriba).
      4. Interruptor, en una copia fuera del repositorio: apagado y periodo terminado no
         miden ni crean nada (código 0); `activo` o fecha mal escritos y archivo roto abortan
         sin guardar (código 2, la ejecución sale en rojo en GitHub).
      5. Límites: YouTube, 101 unidades por medición → 4.848 de 10.000 al día en la semana
         del lanzamiento. Clave del despertador: caduca después del 19 dic (31 ene 2027 según
         la sesión que la creó; Bruno cree que puso ~1 mar 2027; da igual para el periodo).
         Minutos de GitHub: gratis (repositorio público). Peso: ~20 MB en el mes.

## Fase 2 — Mejoras rápidas

- [x] **2.1 Enlaces que se abren en el navegador (A7):** videos, transmisiones y noticias.
      Hecho el 2026-11-13: el título de cada video lleva a YouTube y el canal de la tabla de
      Twitch a su canal (los titulares ya enlazaban); se abren en otra pestaña. Verificado
      a 1280 y 384 px en los dos estilos.
- [ ] **2.2 Miniaturas (A8):** de videos y transmisiones. Las de noticias, solo si la fuente
      las entrega (por verificar). **Esperando a Bruno (2026-11-13):** elegir entre dos
      formas para los videos (miniatura pequeña en la fila de la tabla, o tarjetas como los
      titulares). Verificado: Google Noticias no entrega imágenes (la 2.2 no puede tenerlas
      para titulares); las miniaturas de YouTube funcionan; las de Twitch son una foto del
      directo en ese momento y, cuando el canal deja de transmitir, Twitch muestra una imagen
      genérica (ya pasa con el canal del máximo del 12 nov). Alternativa para Twitch: la foto
      de perfil del canal, que no cambia, pero pide tocar el recolector.
- [x] **2.3 Arreglar el parpadeo del suelo de Miami 1986 (D1).** Es un error, no una
      decisión de diseño. Hecho el 2026-11-13: el suelo avanzaba repintando una capa enorme
      en cada cuadro y, cerca del horizonte, las líneas quedaban tan juntas que titilaban.
      Ahora se mueve la capa entera (sin repintar) y el suelo se funde con el fondo junto al
      horizonte. Medido con 40 capturas seguidas: el salto máximo de brillo bajó de 1,8 a
      0,9. Falta que Bruno lo confirme a la vista en su PC.
- [ ] **2.4 Que las rayas del sol de 1986 no se confundan con las líneas de neón de los
      edificios (D2).** Cambia cómo se ve: presentar opciones con capturas.

## Fase 3 — Mejoras medianas

- [ ] **3.1 Miami 2026 con colores más vivos e intensos (D3).** Presentar 2 o 3 opciones con
      capturas. La paleta se inspira en un Miami soleado y saturado; no se copia arte del juego.
- [ ] **3.2 Reddit (A5).** Primero verificar con una consulta real si se puede leer gratis
      desde GitHub. Si exige pago, se descarta (decisión de Bruno). Ver "Avisos", punto 3.
- [ ] **3.3 Edificios que reflejan el paso del tiempo (D4):** en 2026 siguen los hoteles de
      1986 y aparecen torres nuevas detrás. Presentar opciones con capturas.

## Fase 4 — Mejoras largas

- [ ] **4.1 Modo día y noche en los dos Miami (D5),** elegible por el usuario.
- [ ] **4.2 Modo dinámico (D5):** el cielo cambia con la hora real, según la hora de Miami o
      la de Santiago, a elección.
- [ ] **4.3 Análisis de datos (A3):** estadísticas e "datos interesantes" (popularidad,
      visitas, cuánto dura el interés después del lanzamiento, comparación antes y después).
      Va al final porque necesita varios días de datos reales para tener algo que mostrar.

## Fase 5 — Lo que ya estaba acordado para después del lanzamiento

- [ ] Búsqueda calmada: completar y contrastar datos, memes, cifras oficiales (`PLAN.md`, sección 4).

## Sin definir

- [ ] **D6:** en la lista de Bruno quedó cortado ("El miami actual de…"). **Bruno pidió
      ignorarlo por ahora** (2026-11-12); no se pregunta hasta que él lo retome.

## Avisos para Bruno (cosas donde su idea tiene un límite o un fallo)

1. **Base de datos SQL (A2).** En GitHub no hay un servidor de base de datos encendido; lo
   único que perdura entre ejecuciones son los archivos del repositorio. Una base de datos en
   un solo archivo (SQLite) se puede guardar ahí, pero git la vuelve a guardar entera en cada
   cambio: con 48 cambios al día el repositorio crecería muy rápido. Los archivos de texto por
   día solo añaden líneas, casi no pesan, se pueden leer a simple vista y no se corrompen. Para
   el análisis (A3) se pueden cargar en una base de datos en el PC cuando haga falta.
2. **Peso de los datos (A3).** Medido el 2026-11-12 en las primeras mediciones reales: unos
   15 KB por medición (la primera pesó 86 KB porque guardó los 100 titulares; después solo
   se guardan los nuevos). Con 48 al día durante un mes, unos 20 a 25 MB sin comprimir; git
   los comprime. GitHub admite repositorios de cientos de MB, así que el guardado no debería
   detenerse por tamaño. El día del lanzamiento habrá más canales y titulares: se revisa.
3. **Lo que sí puede quedarse corto en un mes (A6):** los minutos gratuitos de GitHub para
   repositorios privados (2.000 al mes, hasta donde sé; por verificar en la cuenta de Bruno).
   Un mes cada 30 minutos son unas 1.440 ejecuciones. Cada una tarda unos 15 segundos, pero
   GitHub cobra cada ejecución como un minuto entero: unos 1.440 minutos al mes. Cabe, pero
   justo. Si no alcanza: medir cada 30 minutos la semana del lanzamiento y cada hora el resto.
   El gasto real solo se ve en github.com/settings/billing (con `gh` hace falta un permiso
   extra que Bruno tendría que dar con `gh auth refresh -h github.com -s user`).
   YouTube no es problema: 101 unidades por medición, unas 4.850 de las 10.000 diarias.
4. **Reddit (A5).** Tiene acceso gratuito para uso personal, pero pide registrar una
   aplicación (otra clave, gratis). La lectura sin clave suele estar bloqueada desde
   servidores como los de GitHub. Nada de esto está verificado todavía.
5. **Estado de Rockstar.** No se puede leer con programas, ni desde la nube ni desde GitHub.
   Las caídas de Rockstar se anotan a mano en `web/eventos.js`.
6. **Diseño más vivo (D3).** Se puede y se debe ser más atrevido, pero sin copiar el arte
   oficial del juego: se toma la idea (colores saturados de Florida), no las imágenes.
