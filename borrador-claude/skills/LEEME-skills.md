# Skills del proyecto: de dónde vienen y cómo actualizarlas

Claude Code no carga este archivo solo. Se lee cuando se va a instalar o actualizar una skill. Las
skills de terceros **no se editan**: se sobrescriben al actualizarlas.

| Skill | Origen | Cómo actualizarla | Quién la lanza |
|---|---|---|---|
| `animate`, `animation-performance`, `choreograph`, `find-animation-opportunities`, `improve-animations` | `emilkowalski/skills`, MIT (decisión de Bruno, tarea 9.11). Versión: commit en el `ORIGEN.txt` de cada una | Copiar de nuevo esas carpetas del repositorio oficial y cambiar el commit en `ORIGEN.txt` | Claude, cuando toca |
| `prototype`, `review-animations` | Igual que las anteriores | Igual | **Solo Bruno**, con `/prototype` o `/review-animations` (tienen `disable-model-invocation: true`) |
| `impeccable` | `pbakaus/impeccable`, Apache 2.0. Versión en `impeccable/scripts/VERSION` | Copiar `.claude/skills/impeccable/` del repositorio oficial encima de la carpeta, o usar `npx impeccable update` | Claude o Bruno (`/impeccable`) |
| `graphify` | La instala Graphify (paquete `graphifyy`). Versión en `graphify/.graphify_version` | La reinstala el propio programa | Claude o Bruno (`/graphify`) |
| `archivar` | Propia del proyecto | Se edita aquí | Claude, cuando el aviso dice que un archivo pasó de 30.000 bytes |

**Nota:** en el PC de Bruno hay también una copia más vieja de Impeccable en
`~/.claude/skills/impeccable` (4.8.2, frente a la 4.9.2 del proyecto). Según la documentación de
Claude Code, la personal tiene prioridad. Eso se decide aparte, porque está fuera del proyecto.

Todas las skills de esta carpeta quedan fuera del grafo (`.graphifyignore`).
