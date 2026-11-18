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
