# Instrucciones para Claude en este repositorio

## Respuestas

Empieza siempre cada respuesta con "Bruno," seguido de lo que vas a contestar (por ejemplo:
"Bruno, esto es lo que encontré..."). Hazlo en todas las respuestas, en el chat normal y en
Claude Code, en el PC y en la nube.

## Qué es el proyecto

Recuerdo del lanzamiento de GTA 6 (19 de noviembre de 2026): una página web con línea de
tiempo y tablas de números de Twitch, YouTube y Google Trends. Es un proyecto por diversión.

- **Repo:** GitHub privado `Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre`, rama `main`.
  En el PC: `%USERPROFILE%\Proyectos\Documentación Gta 6`.
- **Propósito del sistema de relevo:** si una conversación se pierde o se degrada, cualquier
  sesión nueva sigue desde donde quedó sin que Bruno tenga que volver a explicar nada.

## Al iniciar una sesión

1. Trae los últimos cambios con `git pull`.
2. Lee `ESTADO_ACTUAL.md` entero (es corto). Lee `PLAN.md` cuando la tarea toque una decisión,
   una fuente de datos, un riesgo o la estructura de carpetas.
3. Si algo no te queda claro, pregúntalo antes de resumir: no rellenes huecos.
4. Resume a Bruno qué está hecho, qué está pendiente y dónde quedó el trabajo (no como si se
   empezara de cero) y espera su confirmación antes de trabajar.

**Fuentes de verdad:** las reglas, aquí; el estado vivo, en `ESTADO_ACTUAL.md`; las decisiones,
fases y riesgos, en `PLAN.md`; qué se hizo y por qué, en `git log`. Si un chat viejo contradice
a estos archivos, ganan los archivos.

## Cómo comunicarse con Bruno

- Responder siempre en español.
- Lenguaje simple y directo. Usar términos técnicos solo cuando hagan falta, y explicarlos.
- Ser honesto: distinguir lo verificado de lo que es una suposición. No inventar datos.
- Si una idea de Bruno tiene un fallo, decirlo antes de ejecutarla.
- Hacer una sola pregunta a la vez cuando haya que decidir algo.

## Guardado al terminar cada paso

Cada paso terminado y verificado se guarda solo, sin que Bruno lo pida:

1. Actualizar `ESTADO_ACTUAL.md` si cambió el estado, un pendiente o "Dónde quedamos";
   `PLAN.md` si se tomó una decisión; y este archivo si cambió una regla.
2. Commit en español que diga **qué y por qué**, con el detalle en el cuerpo.
3. `git fetch` y push. Nunca `--force`. Si hay cambios remotos, `git pull --rebase` y avisar
   si hay conflicto. Si el push falla, avisar.

No se guarda trabajo a medias: si el paso espera una decisión de Bruno, se dice en la respuesta
y se termina sin guardar. Para deshacer, `git revert`. `ESTADO_ACTUAL.md` se mantiene corto
borrando lo viejo (ya está en `git log`).

**Avisos automáticos** (`.claude/settings.json`, en el repo):

- Línea de estado `.claude/hooks/estado-git.sh`: `✓` todo guardado y subido, `●` archivos sin
  guardar, `↑` commits sin subir.
- Hook `Stop` `.claude/hooks/revisar-guardado.sh`: frena el final de una respuesta si quedan
  cambios sin commit o sin push, y recuerda esta regla (avisa una sola vez por respuesta).
- `.gitattributes` fuerza finales de línea LF en los `.sh` para que funcionen en Windows y en
  la nube.

## Reglas del proyecto

- **Nunca escribir claves ni contraseñas en archivos del repositorio.** Las claves de Twitch
  y YouTube van en los "Secrets" de GitHub. En el PC, en un archivo `.env` (ya ignorado por git).
- Verificar cada fuente de datos con una consulta real antes de afirmar que funciona.
- Guardar siempre las horas en UTC dentro de los datos. La conversión a hora local se hace
  solo al mostrar la página.
- No borrar ni reescribir archivos de `datos/`: son el recuerdo y no se pueden volver a obtener.
- Las ejecuciones programadas de GitHub solo corren desde `main`.
- Graphify (mapa del proyecto para gastar menos tokens) está instalado: la skill en
  `.claude/skills/graphify/`, el grafo en `graphify-out/` (`graph.html` para verlo,
  `GRAPH_REPORT.md` el informe) y `.graphifyignore` deja fuera las skills de terceros.
  El programa `graphify` (paquete `graphifyy` de PyPI, repositorio oficial
  `Graphify-Labs/graphify`) está instalado en el PC con Python 3.14 (Python 3.15 no puede
  compilarlo). Si `graphify` no está disponible (por ejemplo, en la nube o si no está en el
  PATH), saltarse sus reglas y trabajar con búsqueda normal: los avisos automáticos de
  Graphify en `.claude/settings.json` no hacen nada en ese caso.
- La skill Impeccable (diseño) está en `.claude/skills/impeccable/` (versión en
  `scripts/VERSION`). Para actualizarla, copiar `.claude/skills/impeccable/` del repositorio
  oficial `pbakaus/impeccable` encima de la carpeta, o usar `npx impeccable update`.

## Trabajar en la nube y en el PC

El repositorio de GitHub es la única fuente de verdad. Para no perder trabajo ni crear conflictos:

1. Al empezar a trabajar (nube o PC): traer los últimos cambios con `git pull`.
2. Al terminar: guardar con `git commit` y subir con `git push` (ver "Guardado al terminar
   cada paso").
3. No dejar cambios sin subir en un sitio antes de ponerse a trabajar en el otro.

En la nube, el entorno se borra al terminar la sesión: lo que no se sube con `git push` se pierde.

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
- Para revisar cambios visuales: abrir `web/index.html` con Playwright y mirar una captura
  de cada estilo (botón "Miami 1986" / "Miami 2026").
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
