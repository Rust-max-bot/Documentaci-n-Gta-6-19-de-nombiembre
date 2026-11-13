# Pruebas de la página y del despertador

Programas para la regla "verificar de verdad" de `CLAUDE.md`. Funcionan igual en el PC de
Bruno (usan Edge) y en la nube (usan el Chromium de Playwright). No escriben nada fuera de
`pruebas/capturas/`, que no se sube a git.

Instalar lo que usan: `pip install -r pruebas/requisitos.txt` (en la nube lo hace solo
`.claude/hooks/preparar-nube.sh`; en el PC hace falta además tener Edge, que ya viene con
Windows).

| Programa | Qué hace |
| --- | --- |
| `probar_pagina.py` | Abre `web/index.html` a 1280 y 384 px en los dos estilos: errores de consola, desborde horizontal y captura de cada caso. Con `--seccion "#videos"` captura además esa parte de cerca. |
| `probar_despertador.py` | Prueba `despertador/worker.js` con horas simuladas y un GitHub falso (no llama a nadie): minuto 7 siempre, minuto 37 solo del 17 al 21 nov. |
| `medir_parpadeo.py` | Mide si una parte animada parpadea (40 capturas seguidas). Por defecto, el suelo de Miami 1986. Sirve para comparar antes y después de un cambio. |

Antes de `probar_pagina.py`, generar los datos reales con `python recolector/generar_web.py`
(si no, la página muestra los de ejemplo y la prueba lo dice).
