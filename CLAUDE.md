# Instrucciones para Claude en este repositorio

## Respuestas

Empieza siempre cada respuesta con "Bruno," seguido de lo que vas a contestar (por ejemplo:
"Bruno, esto es lo que encontré..."). Hazlo en todas las respuestas, en el chat normal y en
Claude Code, en el PC y en la nube.

## Qué es el proyecto

Recuerdo del lanzamiento de GTA 6 (19 de noviembre de 2026): una página web con línea de
tiempo y tablas de números de Twitch, YouTube y Google Trends. Es un proyecto por diversión.

- **Repo:** GitHub **público** (desde el 2026-11-12) `Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre`, rama `main`.
  En el PC: `%USERPROFILE%\Proyectos\Documentación Gta 6`.
- **Propósito del sistema de relevo:** si una conversación se pierde o se degrada, cualquier
  sesión nueva, o con otro modelo, sigue desde donde quedó sin que Bruno tenga que volver a
  explicar nada.

## Al iniciar una sesión

1. Trae los últimos cambios con `git pull`.
2. Lee `ESTADO_ACTUAL.md` entero (es corto) y, de `PLAN.md`, las tareas que faltan. Lee el
   resto de `PLAN.md` cuando la tarea toque una decisión, una fuente de datos, un riesgo o la
   estructura de carpetas.
3. Si algo no te queda claro, pregúntalo antes de resumir: no rellenes huecos.
4. Resume a Bruno en pocas líneas qué está hecho, qué está pendiente, qué reglas están en pausa
   (si hay) y dónde quedó el trabajo (no como si se empezara de cero). Si su primer mensaje ya
   dice qué hacer, empieza sin esperar; espera su confirmación solo si el estado choca con lo
   que pidió.

**Fuentes de verdad:**

- **Las reglas:** aquí y en `.claude/rules/`, que se cargan solas al abrir archivos de ciertas
  carpetas.
- **El estado vivo:** en `ESTADO_ACTUAL.md`.
- **La lista de tareas, las decisiones vigentes y los riesgos:** en `PLAN.md`. Los
  `PLAN_DE_TRABAJO_*.md` de `historial/` son planes viejos.
- **Qué se hizo y por qué:** en `git log`.

Si un chat viejo contradice a estos archivos, ganan los archivos.

## Cómo comunicarse con Bruno

- Responder siempre en español.
- Lenguaje simple y directo. Usar términos técnicos solo cuando hagan falta, y explicarlos.
- Ser honesto: distinguir lo verificado de lo que es una suposición. No inventar datos.
- Si una idea de Bruno tiene un fallo, decirlo antes de ejecutarla.
- Hacer una sola pregunta a la vez cuando haya que decidir algo.

## Forma de trabajo

- **Por tandas, con entregas cortas** (decisión de Bruno). Bruno dice qué hacer.
  - **Antes de empezar:** Claude escribe el plan en 3 a 5 pasos de pocos minutos cada uno.
  - **Durante la tanda:** hace los pasos seguidos, sin esperar permiso entre uno y otro. Al
    terminar cada paso, escribe una o dos líneas: qué quedó hecho y qué se comprobó. Cada paso
    terminado se guarda (ver "Guardado al terminar cada paso").
  - **Se para antes** si un paso se complica o se alarga mucho más de lo previsto: cuenta qué
    intentó y qué falta.
  - **Claude decide solo** lo que está dentro de lo pedido y se puede deshacer con
    `git revert`, y lo anota.
  - **Pregunta a Bruno** (una sola pregunta) solo si:
    - cambia cómo se ve la página;
    - toca `datos/`;
    - es algo que no se deshace o que sale afuera (borrar, publicar, `--force`);
    - sale de lo pedido;
    - hay dos caminos razonables y elegir mal obligaría a rehacer trabajo.

    Mientras espera la respuesta, sigue con lo que no depende de ella.
  - **Al terminar la tanda**, se detiene y su respuesta dice siempre:
    - **Hecho**;
    - **Comprobado** (y cómo);
    - **Falta**;
    - **Decidí yo**;
    - **Necesito de ti**.
  - Fuera de lo pedido, nada por iniciativa propia.
- **Sin decisiones de diseño nuevas sin permiso:** si un cambio altera cómo se ve la página, se
  le presentan a Bruno opciones con capturas antes de aplicarlo.
- **No inventar contenido:** todo lo que genera Claude (datos de ejemplo, textos, eventos,
  agrupaciones) se marca como tal, en el propio dato (`ejemplo: true`) o en la cabecera del
  archivo. Nunca se presenta como real.
- **Verificar de verdad:**
  - En cada paso, correr las pruebas de lo cambiado. Al final de la tanda, si se tocó la
    página, la prueba completa: `python pruebas/probar_pagina.py`.
  - La prueba completa usa Playwright a 1280 y 384 px de ancho, en los dos estilos ("Miami
    1986" y "Miami 2026"), sin errores en la consola ni desborde horizontal, y con capturas de
    lo nuevo. `--seccion "#id"` captura una parte de cerca y `--firefox` repite la prueba en
    Firefox.
  - Si se toca el despertador, `python pruebas/probar_despertador.py`. Detalle en
    `pruebas/LEEME.md`.
  - Los fallos se reportan tal cual.
- **Seguir las tareas de `PLAN.md` en orden.** Una tarea se marca `[x]` solo cuando está hecha y
  verificada sin errores; si queda a medias, sigue en `[ ]` con el fallo anotado al lado.
- **Graphify para ahorrar tokens y tiempo** (pedido de Bruno): para saber dónde está algo o cómo
  se relacionan partes del proyecto, preguntar primero al grafo (`graphify query "<pregunta>"`,
  `graphify explain "<cosa>"`) y abrir después solo los archivos o líneas que señale. No hace
  falta si la tarea ya dice qué archivo tocar.

## Guardado al terminar cada paso

Cada paso terminado y verificado se guarda solo, sin que Bruno lo pida:

1. Actualizar `ESTADO_ACTUAL.md` si cambió el estado, un pendiente o "Dónde quedamos";
   `PLAN.md` si se tomó una decisión o cambió una tarea (en corto: el detalle va en el commit);
   y este archivo (o la regla de `.claude/rules/` que toque) si cambió una regla.
2. Commit en español que diga **qué y por qué**, con el detalle en el cuerpo.
3. `git fetch`, `git pull --rebase` (`datos/` recibe un commit cada hora desde GitHub) y push.
   Avisar si hay conflicto o si el push falla. Nunca `--force` (Bruno lo autorizó una sola vez,
   el 2026-11-12, para limpiar su información personal del historial).

No se guarda trabajo a medias: si el paso espera una decisión de Bruno, se dice en la respuesta
y ese paso no se guarda. Para deshacer, `git revert`.

**`ESTADO_ACTUAL.md` y `PLAN.md` se mantienen cortos**, borrando lo viejo (ya está en
`git log`). Cuando uno pasa de **30.000 bytes**, se archiva con la skill `archivar`. El tope no es
permiso para llenarlos: solo dice cuándo archivar.

- Los archivos de `historial/` no se editan, salvo para corregir un error factual, y anotándolo
  en el propio archivo.
- Al iniciar una sesión no se lee `historial/`: solo se consulta si hace falta un detalle viejo
  (con búsquedas o `git log`, no entero).
- Si algo de `historial/` contradice a los archivos vivos, ganan los vivos.

**Avisos automáticos** (`.claude/settings.json`, en el repo):

- Línea de estado `.claude/hooks/estado-git.sh`: `✓` todo guardado y subido, `●` archivos sin
  guardar, `↑` commits sin subir.
- Hook `Stop` `.claude/hooks/revisar-guardado.sh`: frena el final de una respuesta si quedan
  cambios sin commit o sin push, y recuerda esta regla (avisa una sola vez por respuesta).
  También avisa si `ESTADO_ACTUAL.md` o `PLAN.md` pasó de 30.000 bytes.
- Bloqueos (`permissions.deny`): `git push --force` y editar `datos/` a mano no se pueden hacer,
  aunque se pidan.
- `.gitattributes` fuerza finales de línea LF en los `.sh` para que funcionen en Windows y en
  la nube.

## Reglas del proyecto

- **El repositorio es público: nada personal de Bruno en él.** Ni correos, ni rutas de su PC
  (escribir `%USERPROFILE%` en vez de la carpeta de usuario), ni datos de sus cuentas. Los
  commits se firman con el correo anónimo de GitHub
  (`188891192+Rust-max-bot@users.noreply.github.com`, ya configurado en el repo del PC).
- **En lo que se ve en público (la página y el README), Bruno aparece como "Rust"**, no con su
  nombre (pedido de Bruno, 2026-11-14). Los comentarios del código y los documentos de trabajo
  pueden seguir diciendo "Bruno".
- **Nunca escribir claves ni contraseñas en archivos del repositorio.** Las claves de Twitch
  y YouTube van en los "Secrets" de GitHub. En el PC, en un archivo `.env` (ya ignorado por git).
- No borrar ni reescribir archivos de `datos/`: son el recuerdo y no se pueden volver a obtener.
  Las demás reglas de los datos están en `.claude/rules/datos.md`.
- Al revisar una ejecución de GitHub, mirar también sus avisos ("Annotations"), no solo si salió
  en verde. Las reglas para escribir workflows están en `.claude/rules/github.md`.
- **Graphify** (mapa del proyecto para gastar menos tokens):
  - **Dónde está:** la skill en `.claude/skills/graphify/` y el grafo en `graphify-out/`
    (`graph.html` para verlo, `GRAPH_REPORT.md` el informe). `.graphifyignore` deja fuera las
    skills de terceros.
  - **El grafo se sube a git** para que las sesiones en la nube lo usen: `graph.json`,
    `graph.html`, `GRAPH_REPORT.md`, `manifest.json` y las etiquetas. La caché y las rutas
    propias de cada máquina quedan fuera (`.gitignore`).
  - **Si el trabajo cambia código** (`.js`, `.py`, `.sh`), antes del último commit correr
    `graphify update .` y subir `graphify-out/` en el mismo commit. No gasta tokens.
  - **Con cambios solo en documentos** no hace falta: `graphify update` no los vuelve a leer.
    Volver a leerlos (`/graphify --update`) **sí gasta tokens: avisar a Bruno antes.**
  - **Si `graphify update` falla o se niega a achicar el grafo:** no usar `--force`; dejarlo
    como está y decirlo. Al volver a leer documentos (`/graphify --update`) el freno suele
    saltar porque los conceptos salen con otros nombres internos, aunque el grafo crezca:
    entonces pedir permiso a Bruno para forzar solo el grafo (lo autorizó una vez, el
    2026-11-13). Lo leído queda en la caché de `graphify-out/cache/`: repetirlo no gasta
    tokens otra vez.
  - **Si `graphify-out/` choca al unir cambios:** no resolverlo a mano; tomar la versión de
    `main` y volver a correr `graphify update .`.
  - **Si `graphify` no se puede usar:** trabajar con búsqueda normal. Los avisos automáticos de
    Graphify en `.claude/settings.json` no hacen nada si el programa no existe.
- **Skills del proyecto** (en `.claude/skills/`; cómo actualizarlas y de dónde vienen, en
  `.claude/skills/LEEME.md`):
  - **De animación** (de Emil Kowalski, decisión de Bruno):
    - las que Claude puede usar solo: `find-animation-opportunities` (qué debería animarse y
      qué no), `animate`, `choreograph`, `animation-performance` e `improve-animations` (plan
      de mejoras de toda la página);
    - las que **solo lanza Bruno**: `prototype` (arma 3 a 5 versiones distintas de una pieza
      con un selector para elegir en vivo; sirve para las opciones de diseño que se le
      presentan a Bruno) y `review-animations`. Se lanzan con `/prototype` y
      `/review-animations`; Claude se las propone cuando toque.
  - **Impeccable** (diseño).
  - **`archivar`** (ver "Guardado al terminar cada paso").

## Máquina y herramientas (PC de Bruno)

- **El proyecto no va en OneDrive** (en el proyecto de inglés no terminaba de sincronizar
  `.git`). Está en `%USERPROFILE%\Proyectos\` y el respaldo es GitHub.
- **Python:** `python` abre Python 3.15. **Graphify vive en Python 3.14**
  (`%USERPROFILE%\AppData\Local\Programs\Python\Python314\`), porque con 3.15 no se puede
  compilar: **no desinstalar Python 3.14.** Su carpeta `Scripts` está en el PATH del usuario,
  por eso `graphify` funciona por su nombre.
- **Graphify:** paquete `graphifyy` 0.9.111 de PyPI (repositorio oficial
  `Graphify-Labs/graphify`). En la nube, instalarlo si falta: `pip install graphifyy==0.9.111`.
- **`gh`** (GitHub CLI) está en el PATH (`C:\Program Files\GitHub CLI\gh.exe`).

## Trabajar en la nube y en el PC

El repositorio de GitHub es la única fuente de verdad:

- Al empezar, `git pull` (ver "Al iniciar una sesión").
- Al terminar, commit y push (ver "Guardado al terminar cada paso").
- No dejar cambios sin subir en un sitio antes de ponerse a trabajar en el otro.

En la nube, el entorno se borra al terminar la sesión: lo que no se sube con `git push` se pierde.

**Sesiones en la nube** (Bruno las lanza con la guía de `NUBE.md`):

- **El entorno:** la sesión debe usar `recuerdo-gta6`, que permite los sitios de las fuentes. Con
  el entorno "Default", todas las consultas a las fuentes se bloquean.
- **Al arrancar:** el hook `SessionStart` corre `.claude/hooks/preparar-nube.sh` (solo con
  `CLAUDE_CODE_REMOTE=true`). Instala `pruebas/requisitos.txt`, Chromium para Playwright y
  Graphify, y genera `web/datos.js`.
  - Su mensaje dice qué quedó listo y qué falta: incluirlo en el resumen inicial a Bruno.
  - Si falta Chromium, nada visual se da por verificado.
- **Ramas:** trabajar en `main` como en el PC. Si la nube no deja subir a `main`, trabajar en su
  rama, abrir un *pull request* y decírselo a Bruno (él lo une desde GitHub).
- **Capturas para que Bruno decida un diseño:** él no ve los archivos de la nube. Subirlas a una
  rama `revision/<tema>` (carpeta `revision/`), darle los enlaces de GitHub y borrar la rama
  cuando decida. Nunca a `main`.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
