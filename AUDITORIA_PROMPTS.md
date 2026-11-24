# Auditoría de las instrucciones de Claude Code (2026-11-24)

Paso 1 del instructivo para mejorar la configuración. Lo escribió Claude con `/doctor prompt-audit`
y **no cambió ningún archivo**: esto es solo el informe y lo que se recomienda. Bruno elige qué se
aplica (pasos 2 y siguientes, en `REVISION_CLAUDE_MD.md`).

## Qué se revisó

- **Del proyecto:** `CLAUDE.md`, `.claude/CLAUDE.md` y las 8 skills de `.claude/skills/`.
- **De Bruno, fuera del proyecto** (`~/.claude/`, afecta a todos sus proyectos): `CLAUDE.md`, 4 skills,
  el comando `tomd` y la memoria de este proyecto. Solo se informa: **no se toca nada de ahí**.
- **Plugins** (superpowers y otros, 503 archivos): solo una búsqueda de patrones, sin proponer cambios.
- **No se leyeron**, a propósito: los `settings*.json` y `.mcp.json` (pueden tener claves).
- No hay `AGENTS.md`, `CLAUDE.local.md`, `rules/`, `agents/` ni `output-styles/`.
- Modelo de referencia: Claude Opus 5.5.

## En resumen

Casi todo está bien escrito y al día: se comprobaron las rutas, los flags de `probar_pagina.py`, las
versiones de las acciones de GitHub y la de Graphify, y todo cuadra. Los problemas de verdad son tres:

1. `CLAUDE.md` manda usar dos skills que Claude no puede lanzar solo.
2. La regla de "paso a paso por tandas" choca con la memoria "pasos cortos".
3. Hay dos copias distintas de la skill Impeccable.

## Hallazgos

Confianza: **alta** = el propio proyecto lo contradice; **media** = patrón conocido de los modelos
actuales; **baja** = solo un aviso.

| # | Dónde | Qué pasa | Confianza | Qué se recomienda |
|---|---|---|---|---|
| 1 | `CLAUDE.md:175-177` | Dice "usarla [`prototype`] para las opciones de diseño", pero `prototype` y `review-animations` tienen `disable-model-invocation: true`: solo se activan si Bruno escribe `/prototype` o `/review-animations`. | Alta | Escribir que las lanza Bruno y que Claude se las propone cuando toque. |
| 2 | Skills `animate` y `find-animation-opportunities` (descripción y líneas 16, 26 y 135) | Mandan a `improve-animations`, que no está instalada, y a `review-animations`, que Claude no puede lanzar. | Alta | **Instalar `improve-animations`** del mismo repositorio (no hay que tocar las skills, que se sobrescriben al actualizarlas). Si no, cambiar esas frases. |
| 3 | `CLAUDE.md:47-53` y la memoria `pasos-cortos` (en `~/.claude`) | `CLAUDE.md`: encadenar los pasos de la tanda sin parar y pasar la prueba completa. Memoria (más nueva, 21 nov): un paso por respuesta y solo las pruebas de lo cambiado. Además, la memoria no llega a la nube. | Alta (el choque) | Decidirlo Bruno y dejar una sola regla en `CLAUDE.md`. Propuesta en `REVISION_CLAUDE_MD.md`, punto 1. |
| 4 | Skill Impeccable | Hay dos copias: la del proyecto (4.9.2) y la de `~/.claude` (4.8.2). Según la documentación de Claude Code, gana la personal, así que en el PC se usaría la vieja (no se pudo comprobar en la sesión). | Media | Aparte (está en `~/.claude`): borrar o actualizar la copia personal. |
| 5 | `CLAUDE.md:66` | "Usar Graphify siempre que se pueda": "usa esta herramienta por defecto" hace que se use también cuando no sirve, y los avisos automáticos ya lo recuerdan en cada búsqueda. | Media | Decir cuándo sirve: para saber dónde está algo o cómo se relacionan partes del proyecto. |
| 6 | `.claude/skills/graphify/SKILL.md:226` (y su copia en `~/.claude`) | "MANDATORY: You MUST… forbidden… you are doing this wrong": un tono así lleva a cumplir la orden de más. | Media | Es de terceros: se sobrescribe al reinstalar. Mejor dejarla. |
| 7 | `.claude/CLAUDE.md` (y la línea igual de `~/.claude/CLAUDE.md`) | "When the user types /graphify, use the skill": Claude Code ya lo hace solo. | Media | Inofensivo. `graphify install` lo vuelve a escribir, así que se puede dejar. |
| 8 | `CLAUDE.md:47-48` | "reemplaza la pausa que se había acordado ese mismo día": la regla está escrita como un cambio sobre otra regla que la sesión nueva no conoce. | Media | Dejar solo la regla actual (ver `REVISION_CLAUDE_MD.md`). |
| 9 | `CLAUDE.md:30-31` y `45` | Notas de historia ("antes eran PLAN.md y PLAN_DE_TRABAJO.md", "Reglas traídas del proyecto…"). | Baja | Inofensivas. Se ven en el paso 2. |
| 10 | Skill graphify | Números de incidencia (#1392…) en los comentarios de los comandos. | Baja | Nada: es una guía de comandos exactos. |

**Plugins (solo informativo):**

- `using-superpowers` se carga al inicio de **cada** sesión con "1% chance… ABSOLUTELY MUST… YOU DO
  NOT HAVE A CHOICE". `brainstorming` dice "You MUST use this before any creative work".
- Ese tono hace que se lancen skills sin que nadie las pida. Choca con "Fuera de lo pedido, nada por
  iniciativa propia" (`CLAUDE.md:51`).
- Si molesta, desactivar el plugin para este proyecto es una decisión de Bruno.

## No aplica

- Descripciones de herramientas: el proyecto no define ninguna.
- Código que llama a la API de Claude: no hay.
