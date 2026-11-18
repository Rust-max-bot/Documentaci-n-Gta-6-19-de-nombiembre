# Panel de control de videos (Fase 10)

> Especificación del panel para clasificar los videos de YouTube. Sale de la entrevista con
> Bruno del 2026-11-18. Las tareas y su estado están en `PLAN.md` (Fase 10); aquí va el detalle
> de lo decidido. Si algo de aquí cambia, se actualiza en el mismo commit.

## Para qué sirve

El filtro automático (`recolector/filtro_videos.json`) solo lee el título y los temas que pone
YouTube, así que no ve el contenido. Ejemplo que lo motivó: el Short `_LVLtceZy3I` ("Lamine
Yamal x GTA 6", animación hecha con IA que no depende de GTA) pasa porque el título nombra
GTA 6 y YouTube le puso temas de videojuegos. Al revés, videos que sí tratan de GTA 6 pero solo
lo nombran en hashtags quedan fuera. El panel deja que Bruno corrija las dos cosas a mano.

## Decisiones (Bruno, 2026-11-18)

- **Solo Bruno lo controla, solo desde su PC.** Un `.bat` (como `ver_pagina.bat`) abre el panel
  en el navegador; no se publica en internet (descartado: habría que protegerlo con su cuenta).
  No hace falta un repositorio nuevo: en el público solo Bruno puede escribir.
- **Sincronización:** al abrir, `git pull`. Botón **"Publicar"**: guarda las marcas en un
  archivo propio de `recolector/`, commit, `pull --rebase` y push; no choca con `datos/`. Si
  falla, las marcas quedan en el PC y las sube una sesión de Claude.
- **Una sola lista**, sin una pestaña por sección. Cada video aparece una vez, con etiquetas de
  dónde sale (Global, Español, Tendencias, récords, descartado por el filtro) y filtros por
  lugar, por tipo (video o Short) y por estado (sin revisar, marcado, rescatado). Abre en
  "sin revisar".
- **La marca va en el video** (su código), así vale en todas las listas a la vez: un video que
  sale en Global y en Español se marca una sola vez.
- **Motivos**, uno o varios por video: "no trata de GTA", "hecho con IA", "dudoso".
- **Rescatar:** Bruno puede devolver a la página un video que el filtro automático descartó.
- **Toda marca se puede deshacer.** Nada se borra de `datos/`.
- **Configuraciones guardadas:** "desde cero" (sin filtro), "filtro automático" (el de hoy:
  título sin hashtags, tema de videojuegos, sin "roblox") y "el de Rust" (el automático
  corregido por Bruno en los dos sentidos). Bruno puede guardar otras.
- **El visitante** elige la configuración y qué motivos ver, en todas las listas y récords de
  YouTube. La primera vez: "el de Rust" con los tres motivos ocultos. Su navegador recuerda la
  elección. Las marcas son públicas (la página las necesita), pero nadie más puede cambiarlas.

## Requisitos técnicos (revisión a favor y en contra, 2026-11-18)

Salen de dos agentes que revisaron el plan contra el código (uno a favor, uno en contra);
Claude comprobó los puntos graves.

- **Publicar de verdad:** `publicar-pagina.yml` hoy solo se lanza con cambios en `web/**`,
  `recolector/generar_web.py` y el propio workflow (líneas 26-31). Añadir el archivo de marcas
  (y `recolector/filtro_videos.json`) a esos `paths` en la 10.1; si no, las marcas solo se ven
  con la siguiente medición, y nunca si la medición está apagada.
- **Servidor local protegido** (10.2): una página abierta como archivo no puede guardar ni
  correr git, así que el `.bat` arranca un servidor en Python **solo con la librería estándar**,
  que escucha **solo en 127.0.0.1**, con una **clave al azar** en la URL que abre el `.bat`,
  revisa las cabeceras `Origin` y `Host`, acepta solo JSON y se cierra con su ventana. Así
  ninguna otra página web abierta puede ordenarle "publicar" (CSRF).
- **El panel no va en `web/`** (se publica entera): carpeta propia `panel/`, sin librerías.
- **Borrador fuera del repositorio** (o en un archivo ignorado por git): así las marcas sin
  publicar no ensucian el repo, no frenan el hook `Stop` ni la sincronización del PC.
  "Publicar" copia el borrador al archivo de marcas y hace `git commit -- <ese archivo>` (solo
  ese), `pull --rebase --autostash` (si choca, `rebase --abort` y avisar) y push. Al abrir,
  `git pull --ff-only`. Los commits heredan el correo anónimo ya configurado en el repo.
- **Una sola validación** de marcas, en un módulo que usan `generar_web.py` y el panel; el panel
  la corre antes del commit, para que un archivo mal escrito no frene la publicación.
- **Pruebas propias:** una de `generar_web.py` que compruebe que `_LVLtceZy3I` sale de las
  listas y de los récords (10.1); una de Playwright para el panel (10.2); el selector del
  visitante, con `probar_pagina.py` a 1280 y 384 px (10.4). Marcas de ejemplo en
  `web/datos-ejemplo.js` con `ejemplo: true`.
- **Graphify:** `graphify update .` al programar el panel, no en cada "Publicar".

**Lo que se sabe de los datos:** cada medición guarda los 50 videos que da YouTube, también
los descartados (186 mediciones, 701 videos distintos al 18 nov). Las listas salen solo de la
última medición; los récords "Video/Short más visto", de todo el historial de Global; "creció
en una hora" y el resumen del día se calculan en el navegador con lo que llega en `datos.js`
(358 KB hoy, ~108 KB de YouTube).

**Decidido (Bruno, 18 nov): Tendencias también usa las marcas** (los tráilers no: son
oficiales). Como la marca va en el código del video, vale en la lista donde salga: un video
puede estar en Global y no en Tendencias, o al revés, así que el panel debe mostrar también los
de Tendencias para poder marcarlos. Ojo al construirlo: Tendencias guarda conteos por región en
el historial; si filtrar cambia esos conteos, hay que recalcularlos (revisar en la 10.1).

**Decidido (Bruno, 18 nov, últimas preguntas):**

- **`ocultar` se quita** de `filtro_videos.json` y de `generar_web.py` en la 10.1 (estaba
  vacía): para esconder videos sueltos queda un solo sistema, las marcas. El filtro automático
  (`modo` y `excluir_palabras`) no se toca.
- **Límite de rescatar:** se puede rescatar cualquier video, pero solo sale en una lista si
  está entre los 50 de la última medición; uno más viejo solo cuenta para los récords.
- **Configuraciones y marcas son dos perillas separadas:** la configuración elige el filtro
  base y las casillas de motivos qué marcas se esconden. Las marcas valen también en "desde
  cero" si el visitante deja los motivos marcados ("desde cero" sin motivos = todo). Una
  configuración guardada por Bruno es **solo otro filtro base**: las marcas son una sola lista
  que vale en todas.
- **Peso:** `datos.js` sigue llevando solo "el de Rust". Los descartados van en un archivo
  aparte que la página carga solo si el visitante cambia de configuración o de motivos (sin
  librerías; debe funcionar también abriendo la página como archivo con `ver_pagina.bat`).

## Partes (cada una termina usable y verificada, nunca a medias)

1. **10.1 Marcas en la página, sin panel.** Archivo de marcas con validaciones que abortan si
   algo no cuadra; `generar_web.py` aplica "el de Rust" en todas las listas y récords. Se
   estrena marcando `_LVLtceZy3I`. Al terminar: la página ya muestra la lista corregida (el
   archivo se edita a mano o con Claude, como hoy `ocultar`).
2. **10.2 Panel para marcar y publicar.** El `.bat`, la lista única con filtros, los motivos,
   deshacer y "Publicar" (con su plan de contingencia), sobre los videos que hoy pasan el
   filtro. Antes, opciones del aspecto del panel con capturas. Al terminar: Bruno clasifica
   sin tocar archivos.
3. **10.3 Rescatar y configuraciones.** El panel muestra también los descartados (recalculados
   desde `datos/`) para rescatarlos, y guarda configuraciones con sus botones de restablecer.
   Al terminar: "el de Rust" corrige en los dos sentidos.
4. **10.4 Selector del visitante.** Antes, opciones con capturas. Configuración y motivos en la
   página, recordados en el navegador. Revisar cuánto crece `web/datos.js` con "desde cero"
   (lleva más videos). Al terminar: el visitante elige qué ver.

Cada parte se prueba con `python pruebas/probar_pagina.py` (si toca la página) y con una prueba
propia del panel o del archivo de marcas, y se guarda y sube antes de empezar la siguiente.

## Para después

- Gemini, que puede ver el video, para sugerir marcas (idea de Bruno, 18 nov; ver "IA barata
  para filtrar videos" en `PLAN.md`).
