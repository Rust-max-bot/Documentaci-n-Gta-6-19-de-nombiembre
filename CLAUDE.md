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
  sesión nueva sigue desde donde quedó sin que Bruno tenga que volver a explicar nada.

## Al iniciar una sesión

1. Trae los últimos cambios con `git pull`.
2. Lee `ESTADO_ACTUAL.md` entero (es corto) y la fase en curso de `PLAN_DE_TRABAJO.md`. Lee
   `PLAN.md` cuando la tarea toque una decisión, una fuente de datos, un riesgo o la
   estructura de carpetas.
3. Si algo no te queda claro, pregúntalo antes de resumir: no rellenes huecos.
4. Resume a Bruno qué está hecho, qué está pendiente, qué reglas están en pausa (si hay) y dónde quedó
   el trabajo (no como si se empezara de cero) y espera su confirmación antes de trabajar.

**Fuentes de verdad:** las reglas, aquí; el estado vivo, en `ESTADO_ACTUAL.md`; la lista
ordenada de tareas, en `PLAN_DE_TRABAJO.md`; las decisiones, fases y riesgos, en `PLAN.md`;
qué se hizo y por qué, en `git log`. Si un chat viejo contradice
a estos archivos, ganan los archivos.

## Cómo comunicarse con Bruno

- Responder siempre en español.
- Lenguaje simple y directo. Usar términos técnicos solo cuando hagan falta, y explicarlos.
- Ser honesto: distinguir lo verificado de lo que es una suposición. No inventar datos.
- Si una idea de Bruno tiene un fallo, decirlo antes de ejecutarla.
- Hacer una sola pregunta a la vez cuando haya que decidir algo.

## Forma de trabajo

*(Reglas traídas del proyecto "Ayuda para el inglés" y adaptadas, decisión de Bruno, 2026-11-12.)*

- **Paso a paso con permiso explícito: ACTIVA, por tandas** (decisión de Bruno, 2026-11-12;
  reemplaza la pausa que se había acordado ese mismo día). Bruno dice qué pasos hay que hacer
  (por ejemplo, "de la 1.2 a la 1.5") y Claude los encadena sin detenerse entre uno y otro
  hasta completarlos todos; al terminar la tanda, se detiene y espera, aunque haya salido bien.
  Fuera de lo pedido, nada por iniciativa propia; cada extra, cuando Bruno lo pide. Cada paso
  terminado se sigue guardando (ver "Guardado al terminar cada paso") y las decisiones de verdad
  se le siguen preguntando a Bruno, aunque sea en mitad de la tanda.
- **Sin decisiones de diseño nuevas sin permiso:** si un cambio altera cómo se ve la página, se
  le presentan a Bruno opciones con capturas antes de aplicarlo.
- **No inventar contenido:** todo lo que genera Claude (datos de ejemplo, textos, eventos,
  agrupaciones) se marca como tal, en el propio dato (`ejemplo: true`) o en la cabecera del
  archivo. Nunca se presenta como real.
- **Verificar de verdad:** Playwright a 1280 y 384 px de ancho, en los dos estilos ("Miami
  1986" y "Miami 2026"), sin errores en la consola ni desborde horizontal, y capturas de lo
  nuevo. Los fallos se reportan tal cual. Con `python pruebas/probar_pagina.py` (hace todo
  eso; `--seccion "#id"` captura una parte de cerca) y, si se toca el despertador,
  `python pruebas/probar_despertador.py`. Detalle en `pruebas/LEEME.md`.
- **Seguir `PLAN_DE_TRABAJO.md` en orden.** Una tarea se marca `[x]` solo cuando está hecha y
  verificada sin errores; si queda a medias, sigue en `[ ]` con el fallo anotado al lado.
- **Usar Graphify siempre que se pueda, para ahorrar tokens y tiempo** (pedido de Bruno,
  2026-11-12): antes de abrir o buscar en archivos del proyecto, preguntar al grafo
  (`graphify query "<pregunta>"`, `graphify explain "<cosa>"`) y abrir después solo los
  archivos o líneas que señale. No hace falta si la tarea ya dice qué archivo tocar.
- **Datos por programa, no a mano:** lo que se escriba en `datos/` lo hace un programa con
  validaciones que abortan si algo no cuadra, y antes de cualquier cambio masivo se hace una
  copia fuera del proyecto.

## Guardado al terminar cada paso

Cada paso terminado y verificado se guarda solo, sin que Bruno lo pida:

1. Actualizar `ESTADO_ACTUAL.md` si cambió el estado, un pendiente o "Dónde quedamos";
   `PLAN.md` si se tomó una decisión; y este archivo si cambió una regla.
2. Commit en español que diga **qué y por qué**, con el detalle en el cuerpo.
3. `git fetch` y push. Nunca `--force` (Bruno lo autorizó una sola vez, el 2026-11-12, para
   limpiar su información personal del historial). Si hay cambios remotos, `git pull --rebase` y avisar
   si hay conflicto. Si el push falla, avisar.

No se guarda trabajo a medias: si el paso espera una decisión de Bruno, se dice en la respuesta
y se termina sin guardar. Para deshacer, `git revert`. `ESTADO_ACTUAL.md` se mantiene corto
borrando lo viejo (ya está en `git log`).

## Archivar `ESTADO_ACTUAL.md`

Cuando `ESTADO_ACTUAL.md` pasa de **20.000 bytes**, se archiva en vez de seguir creciendo
(el freno automático avisa al terminar una respuesta):

1. Moverlo con `git mv` a `historial/ESTADO_AAAA-MM-DD.md` (fecha del día; si ya existe
   uno con esa fecha, añadir `-2`, `-3`…). Los archivos de `historial/` no se editan, salvo
   para corregir un error factual, y anotándolo en el propio archivo.
2. Crear un `ESTADO_ACTUAL.md` nuevo con la misma estructura, conservando solo lo esencial:
   "Dónde quedamos" (reescrito corto), la fecha límite, "Pendiente" completo y las decisiones
   o avisos que sigan vigentes. "Últimos cambios" empieza con una sola línea:
   `- AAAA-MM-DD: estado anterior archivado en historial/ESTADO_AAAA-MM-DD.md`.
3. Comprobar que no se perdió ningún pendiente ni aviso vigente comparando los dos archivos.
4. Guardar y subir en un solo commit ("Archivar ESTADO_ACTUAL.md…").

Al iniciar una sesión no se lee `historial/`: solo se consulta si hace falta un detalle viejo
(con búsquedas o `git log`, no entero). Si algo de `historial/` contradice a los archivos
vivos, ganan los vivos.

**Avisos automáticos** (`.claude/settings.json`, en el repo):

- Línea de estado `.claude/hooks/estado-git.sh`: `✓` todo guardado y subido, `●` archivos sin
  guardar, `↑` commits sin subir.
- Hook `Stop` `.claude/hooks/revisar-guardado.sh`: frena el final de una respuesta si quedan
  cambios sin commit o sin push, y recuerda esta regla (avisa una sola vez por respuesta).
  También avisa si `ESTADO_ACTUAL.md` pasó de 20.000 bytes (ver "Archivar `ESTADO_ACTUAL.md`").
- `.gitattributes` fuerza finales de línea LF en los `.sh` para que funcionen en Windows y en
  la nube.

## Reglas del proyecto

- **El repositorio es público: nada personal de Bruno en él.** Ni correos, ni rutas de su PC
  (escribir `%USERPROFILE%` en vez de la carpeta de usuario), ni datos de sus cuentas. Los
  commits se firman con el correo anónimo de GitHub
  (`188891192+Rust-max-bot@users.noreply.github.com`, ya configurado en el repo del PC).
- **Nunca escribir claves ni contraseñas en archivos del repositorio.** Las claves de Twitch
  y YouTube van en los "Secrets" de GitHub. En el PC, en un archivo `.env` (ya ignorado por git).
- Verificar cada fuente de datos con una consulta real antes de afirmar que funciona.
- Guardar siempre las horas en UTC dentro de los datos. La conversión a hora local se hace
  solo al mostrar la página.
- No borrar ni reescribir archivos de `datos/`: son el recuerdo y no se pueden volver a obtener.
- Las ejecuciones programadas de GitHub solo corren desde `main`.
- **Graphify** (mapa del proyecto para gastar menos tokens): la skill en
  `.claude/skills/graphify/`, el grafo en `graphify-out/` (`graph.html` para verlo,
  `GRAPH_REPORT.md` el informe) y `.graphifyignore` deja fuera las skills de terceros.
  Programa: paquete `graphifyy` 0.9.107 de PyPI (repositorio oficial `Graphify-Labs/graphify`).
  - **El grafo se sube a git** para que las sesiones en la nube lo usen: `graph.json`,
    `graph.html`, `GRAPH_REPORT.md`, `manifest.json` y las etiquetas. La caché y las rutas
    propias de cada máquina quedan fuera (`.gitignore`).
  - **Si el trabajo cambia código** (`.js`, `.py`, `.sh`), antes del último commit correr
    `graphify update .` y subir `graphify-out/` en el mismo commit. No gasta tokens. En la nube,
    instalarlo antes si falta: `pip install graphifyy==0.9.107`.
  - **Con cambios solo en documentos** no hace falta: `graphify update` no los vuelve a leer.
    Volver a leerlos (`/graphify --update`) **sí gasta tokens: avisar a Bruno antes.**
  - **Si `graphify update` falla o se niega a achicar el grafo:** no usar `--force`; dejarlo
    como está y decirlo. Al volver a leer documentos (`/graphify --update`) el freno suele
    saltar porque los conceptos salen con otros nombres internos, aunque el grafo crezca:
    entonces pedir permiso a Bruno para forzar solo el grafo (lo autorizó una vez, el
    2026-11-13). Lo leído queda en la caché de `graphify-out/cache/`: repetirlo no gasta
    tokens otra vez. **Si `graphify-out/` choca al unir cambios:** no resolverlo a mano;
    tomar la versión de `main` y volver a correr `graphify update .`.
  - **Si `graphify` no se puede usar:** trabajar con búsqueda normal. Los avisos automáticos de
    Graphify en `.claude/settings.json` no hacen nada si el programa no existe.
- La skill Impeccable (diseño) está en `.claude/skills/impeccable/` (versión en
  `scripts/VERSION`). Para actualizarla, copiar `.claude/skills/impeccable/` del repositorio
  oficial `pbakaus/impeccable` encima de la carpeta, o usar `npx impeccable update`.

## Máquina y herramientas (PC de Bruno)

- **El proyecto no va en OneDrive** (en el proyecto de inglés no terminaba de sincronizar
  `.git`). Está en `%USERPROFILE%\Proyectos\` y el respaldo es GitHub.
- **Python:** `python` abre Python 3.15. **Graphify vive en Python 3.14**
  (`%USERPROFILE%\AppData\Local\Programs\Python\Python314\`), porque con 3.15 no se puede
  compilar: **no desinstalar Python 3.14.** Su carpeta `Scripts` está en el PATH del usuario,
  por eso `graphify` funciona por su nombre.
- **`gh`** (GitHub CLI) está en el PATH (`C:\Program Files\GitHub CLI\gh.exe`).

## Trabajar en la nube y en el PC

El repositorio de GitHub es la única fuente de verdad. Para no perder trabajo ni crear conflictos:

1. Al empezar a trabajar (nube o PC): traer los últimos cambios con `git pull`.
2. Al terminar: guardar con `git commit` y subir con `git push` (ver "Guardado al terminar
   cada paso").
3. No dejar cambios sin subir en un sitio antes de ponerse a trabajar en el otro.

En la nube, el entorno se borra al terminar la sesión: lo que no se sube con `git push` se pierde.

**Sesiones en la nube** (Bruno las lanza con la guía de `NUBE.md`):

- Al arrancar, el hook `SessionStart` corre `.claude/hooks/preparar-nube.sh` (solo con
  `CLAUDE_CODE_REMOTE=true`): instala `pruebas/requisitos.txt`, Chromium para Playwright y
  Graphify, y genera `web/datos.js`. Su mensaje dice qué quedó listo y qué falta; incluirlo
  en el resumen inicial a Bruno. Si falta Chromium, nada visual se da por verificado.
- Ramas: trabajar en `main` como en el PC. Si la nube no deja subir a `main`, trabajar en su
  rama, abrir un *pull request* y decírselo a Bruno (él lo une desde GitHub).
- Capturas para que Bruno decida un diseño: él no ve los archivos de la nube. Subirlas a una
  rama `revision/<tema>` (carpeta `revision/`), darle los enlaces de GitHub y borrar la rama
  cuando decida. Nunca a `main`.
- Tandas largas: si una tarea espera una decisión de Bruno, preguntarle y, mientras tanto,
  seguir con las tareas de la tanda que no dependan de esa decisión.
- `datos/` recibe un commit cada hora desde GitHub: hacer `git pull --rebase` antes de cada
  push (ya está en "Guardado al terminar cada paso").

## Relevo entre sesiones y modelos

Este proyecto puede continuarlo otra sesión u otro modelo. Para que el relevo funcione:

- `ESTADO_ACTUAL.md` es el estado real del proyecto: mantener al día "Dónde quedamos",
  "Últimos cambios" y "Pendiente" al terminar cada paso. `PLAN.md` guarda las decisiones
  tomadas, las pendientes y los riesgos: si se toma una decisión nueva, actualizarlo en el
  mismo cambio.
- La página (`web/`) no usa librerías ni paso de compilación. Mantenerlo así.
- Los datos de ejemplo deben seguir marcados como ejemplo (`ejemplo: true`). Nunca presentar
  datos inventados como reales.
- Diseño: original, inspirado en Miami. No copiar logotipos, tipografías ni arte de los juegos.
- Para revisar cambios visuales: `python pruebas/probar_pagina.py` (antes,
  `python recolector/generar_web.py` para tener los datos reales) y mirar las capturas de
  `pruebas/capturas/`.
- En la nube, la sesión debe usar el entorno `recuerdo-gta6`, que permite los sitios de las
  fuentes. Con el entorno "Default" todas las consultas a las fuentes se bloquean.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
