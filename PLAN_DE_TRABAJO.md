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
- [ ] **1.2 Programar el recolector** (`recolector/`): Twitch, YouTube, Google Trends,
      titulares, PlayStation y Xbox. Cada fuente es una pieza independiente; si una falla, se
      anota el hueco y siguen las demás. Guarda también lo necesario para A7 y A8 (enlaces y
      miniaturas), para no tener que volver a recolectar después.
- [ ] **1.3 Interruptor y periodo (A6):** archivo de configuración con "activo: sí/no" y
      fecha de fin (por defecto, un mes: hasta el 19 de diciembre de 2026). Bruno puede
      apagarlo, encenderlo o alargarlo cambiando una línea.
- [ ] **1.4 Ejecución programada en GitHub** cada 30 minutos, con validaciones antes de
      guardar (regla "datos por programa").
- [ ] **1.5 Dejarlo funcionando y vigilar las primeras 24 horas (A4):** contar mediciones,
      huecos, minutos de GitHub gastados y unidades de YouTube.
- [ ] **1.6 Conectar la página con los datos reales** (`web/datos.js` generado por
      programa). La página deja de mostrar el aviso de "datos de ejemplo".
- [ ] **1.7 Prueba completa antes del 18 de noviembre.**

## Fase 2 — Mejoras rápidas

- [ ] **2.1 Enlaces que se abren en el navegador (A7):** videos, transmisiones y noticias.
- [ ] **2.2 Miniaturas (A8):** de videos y transmisiones. Las de noticias, solo si la fuente
      las entrega (por verificar).
- [ ] **2.3 Arreglar el parpadeo del suelo de Miami 1986 (D1).** Es un error, no una
      decisión de diseño.
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
- [ ] Después del 18 de noviembre: preguntar a Bruno si se reactiva "paso a paso con permiso".

## Sin definir

- [ ] **D6:** en la lista de Bruno quedó cortado ("El miami actual de…"). Falta que Bruno lo complete.

## Avisos para Bruno (cosas donde su idea tiene un límite o un fallo)

1. **Base de datos SQL (A2).** En GitHub no hay un servidor de base de datos encendido; lo
   único que perdura entre ejecuciones son los archivos del repositorio. Una base de datos en
   un solo archivo (SQLite) se puede guardar ahí, pero git la vuelve a guardar entera en cada
   cambio: con 48 cambios al día el repositorio crecería muy rápido. Los archivos de texto por
   día solo añaden líneas, casi no pesan, se pueden leer a simple vista y no se corrompen. Para
   el análisis (A3) se pueden cargar en una base de datos en el PC cuando haga falta.
2. **Peso de los datos (A3).** Estimación, por verificar en la tarea 1.5: unos 5 a 10 KB por
   medición; con 48 al día durante un mes, entre 7 y 15 MB. GitHub admite repositorios de
   cientos de MB, así que el guardado no debería detenerse por tamaño.
3. **Lo que sí puede quedarse corto en un mes (A6):** los minutos gratuitos de GitHub para
   repositorios privados (2.000 al mes, hasta donde sé; por verificar en la cuenta de Bruno).
   Un mes cada 30 minutos son unas 1.440 ejecuciones de cerca de un minuto: cabe, pero justo.
   Si no alcanza: medir cada 30 minutos la semana del lanzamiento y cada hora el resto.
   YouTube no es problema: unas 4.800 de las 10.000 unidades diarias.
4. **Reddit (A5).** Tiene acceso gratuito para uso personal, pero pide registrar una
   aplicación (otra clave, gratis). La lectura sin clave suele estar bloqueada desde
   servidores como los de GitHub. Nada de esto está verificado todavía.
5. **Estado de Rockstar.** No se puede leer con programas, ni desde la nube ni desde GitHub.
   Las caídas de Rockstar se anotan a mano en `web/eventos.js`.
6. **Diseño más vivo (D3).** Se puede y se debe ser más atrevido, pero sin copiar el arte
   oficial del juego: se toma la idea (colores saturados de Florida), no las imágenes.
