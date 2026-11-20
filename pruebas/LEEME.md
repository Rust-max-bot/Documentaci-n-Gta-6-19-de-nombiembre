# Pruebas de la página y del despertador

Programas para la regla "verificar de verdad" de `CLAUDE.md`. Funcionan igual en el PC de
Bruno (usan Edge) y en la nube (usan el Chromium de Playwright). No escriben nada fuera de
`pruebas/capturas/`, que no se sube a git.

Instalar lo que usan: `pip install -r pruebas/requisitos.txt` (en la nube lo hace solo
`.claude/hooks/preparar-nube.sh`; si el Chromium de Playwright no está, `navegador.py` usa el
que trae la máquina de la nube, `/opt/pw-browsers/chromium`; en el PC hace falta además tener Edge, que ya viene con
Windows).

| Programa | Qué hace |
| --- | --- |
| `probar_pagina.py` | Abre `web/index.html` a 1280 y 384 px en los dos estilos, baja por toda la página (para que los gráficos se dibujen) y revisa errores de consola, desborde horizontal, textos encimados en los ejes de los gráficos (9.4) y captura de cada caso. Las fotos de internet que la red de la máquina bloquea se avisan aparte, no cuentan como fallo. Con `--seccion "#videos"` captura además esa parte de cerca. Con `--firefox` hace lo mismo en el Firefox de Playwright (capturas con `firefox_` delante; instalarlo una vez con `python -m playwright install firefox`). Con `--param "probar-formato=24"` abre la página con ese parámetro. |
| `hacer_compartir.py` | Hace `web/compartir.jpg` (la imagen al compartir el enlace, 1200×630) con la portada real: `--opcion C --guardar` es la elegida por Bruno (2026-11-16). Sin `--guardar`, solo deja la vista previa en `capturas/`. Volver a correrlo si cambia la portada. |
| `probar_marcas.py` | Fase 10: revisa que `recolector/marcas.py` rechace archivos de marcas mal escritos y que, con los datos reales, el video marcado `_LVLtceZy3I` no salga en Global, Español, récords ni Tendencias (y que sin marcas sí salga). No toca `datos/` ni `web/`. |
| `probar_panel.py` | Fase 10: el panel de videos con un GitHub falso (nunca el real): seguridad del servidor (clave, Host, Origin, JSON), "Publicar" (solo sube el archivo de marcas, se junta con mediciones nuevas, se niega fuera de `main` o con otros cambios sin subir, conserva el borrador si falla) y el panel en Edge a 1280 y 384 px. |
| `probar_selector.py` | Fase 10: el selector de videos del visitante en la página (antes, `generar_web.py`): con la elección de siempre no descarga `videos-extra.js`; "Desde cero" sin ocultar nada trae el video marcado; "Volver a lo de siempre"; elecciones rotas; series de visitas; 1280 y 384 px en los dos estilos. |
| `probar_despertador.py` | Prueba `despertador/worker.js` con horas simuladas y un GitHub falso (no llama a nadie): minuto 7 siempre, minuto 37 solo del 17 al 21 nov. |
| `medir_carga.py` | 9.4: mide cuánto tarda en cargar la página en un celular lento (384 px, CPU 4×, 1,6 Mbps, 150 ms), mediana de 3 cargas: peso de `datos.js`, primer dibujo, carga completa y bloqueo. Sirve una copia de `web/` con gzip en `capturas/medir/`. Con `--simular 1000` usa mediciones inventadas (marcadas) para ver cómo cargará el 19 dic. |
| `medir_parpadeo.py` | Mide si una parte animada parpadea (40 capturas seguidas). Por defecto, el suelo de Miami 1986. Sirve para comparar antes y después de un cambio. |

Antes de `probar_pagina.py`, generar los datos reales con `python recolector/generar_web.py`
(si no, la página muestra los de ejemplo y la prueba lo dice).
