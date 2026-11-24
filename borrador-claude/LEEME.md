# Borrador de la nueva configuración de Claude Code (paso 4)

Esto es solo un borrador: **nada de esta carpeta está en uso todavía.** Los nombres están puestos
para que Claude Code no los cargue (`CLAUDE.nuevo.md`, `rules/` y `skills/` fuera de `.claude/`).
Se aplica en el paso 6, si Bruno lo aprueba. En el paso 8 se borra esta carpeta.

Qué cambios trae: los elegidos en `REVISION_CLAUDE_MD.md` (A a G y 3.1 a 3.7).

## Qué hay y adónde va

| Archivo del borrador | Adónde va en el paso 6 | Qué es |
|---|---|---|
| `CLAUDE.nuevo.md` | Reemplaza a `CLAUDE.md` | El `CLAUDE.md` nuevo: **231 líneas** (hoy 250). El paso 3 calculaba 160-170, pero la forma de trabajo nueva (A) suma unas 25 líneas y se dejó en listas para que se lea fácil. Ver "Qué cambió en `CLAUDE.md`" abajo |
| `rules/datos.md` | `.claude/rules/datos.md` | Reglas de los datos (3.1). Se carga al abrir algo de `datos/` o `recolector/` |
| `rules/github.md` | `.claude/rules/github.md` | Node.js 24, con la lista completa (3.2, E). Se carga al abrir un workflow |
| `rules/pagina.md` | `.claude/rules/pagina.md` | Reglas de la página (3.3). Se carga al abrir algo de `web/` o `pruebas/` |
| `skills/archivar/SKILL.md` | `.claude/skills/archivar/SKILL.md` | El procedimiento de archivar, con el tope de 30.000 (3.5, G). Claude la puede lanzar sola |
| `skills/LEEME-skills.md` | `.claude/skills/LEEME.md` | De dónde viene cada skill y cómo actualizarla (3.4) |
| `skills/improve-animations/` | `.claude/skills/improve-animations/` | La skill que faltaba (F), descargada del commit `64eb3de` de `emilkowalski/skills`, el mismo de las otras 6. Con `LICENSE` (MIT) y `ORIGEN.txt` |

**Sobre `improve-animations`** (leída entera antes de traerla; no trae nada raro):

- No modifica el código: arma un informe y planes de mejora.
- Escribe esos planes en una carpeta `plans/` del proyecto.
- En su modo normal reparte el trabajo en hasta 4 subagentes. Para que sea corto, se le puede
  pedir `quick`.

## Cambios en otros archivos (se hacen en el paso 6)

**1. Bloqueos (3.6 y 3.7)**, en `.claude/settings.json`. Se agregan conservando lo que el archivo
ya tiene (hooks y línea de estado):

```json
"permissions": {
  "deny": [
    "Bash(git push --force*)", "Bash(git push -f*)",
    "Bash(git push * --force*)", "Bash(git push * -f*)",
    "PowerShell(git push --force*)", "PowerShell(git push -f*)",
    "PowerShell(git push * --force*)", "PowerShell(git push * -f*)",
    "Edit(**/datos/**)"
  ]
}
```

- `Edit(...)` cubre también `Write`.
- El recolector sigue escribiendo en `datos/`, porque corre con `python`.
- En el proyecto no hay otra carpeta llamada `datos`, así que `**/datos/**` solo toca esa.

**2. Aviso automático** `.claude/hooks/revisar-guardado.sh` (G y 3.5). Al ser código, se corre
`graphify update .` en el mismo commit.

```diff
-LIMITE=20000
+LIMITE=30000
-... Archivalo segun CLAUDE.md, seccion 'Archivar ESTADO_ACTUAL.md y PLAN.md': muevelo a historial/ y crea uno nuevo con lo esencial. "
+... Archivalo con la skill archivar (.claude/skills/archivar/SKILL.md): muevelo a historial/ y crea uno nuevo con lo esencial. "
```

**3. Notas del tope** (G):

- `ESTADO_ACTUAL.md:12` y `PLAN.md:17`: "20.000" pasa a "30.000", y "(ver `CLAUDE.md`)" pasa a
  "(skill `archivar`)".
- `PLAN.md:3` queda igual, porque cuenta por qué se archivó el plan anterior.

## Qué cambió en `CLAUDE.md`

**Cambios elegidos:**

- **A:** forma de trabajo por tandas con entregas cortas; al iniciar, empezar sin esperar si ya
  está claro qué hacer; pruebas de lo cambiado en cada paso y la completa al final.
- **B:** `prototype` y `review-animations` solo las lanza Bruno.
- **C:** Graphify "para saber dónde está algo", en vez de "siempre que se pueda".
- **D:** sin frases de historia:
  - "Reglas traídas del proyecto…";
  - "reemplaza la pausa…";
  - "antes eran `PLAN.md` y `PLAN_DE_TRABAJO.md`";
  - "ya pasó dos veces";
  - "(instaladas el 2026-11-17… tarea 9.11)".
- **E:** la lista de acciones de GitHub, completa (ahora en `rules/github.md`).
- **F:** `improve-animations` en la lista de skills.
- **G:** tope de 30.000 bytes, y "el tope no es permiso para llenarlos".

**Lo que salió y adónde fue:**

- **Archivar** (90-117):
  - el procedimiento pasó a `skills/archivar/`;
  - en `CLAUDE.md` quedan el tope y las tres reglas de `historial/` que valen siempre (no se
    edita, no se lee al iniciar, ganan los vivos).
- **Datos por programa, UTC, verificar fuentes** (70-72 y 141-143): pasaron a `rules/datos.md`.
  "No borrar `datos/`" queda también en `CLAUDE.md`.
- **Node.js 24 y "programadas solo desde `main`"** (145-152): pasaron a `rules/github.md`. "Mirar
  los avisos" queda también en `CLAUDE.md`.
- **Sin librerías, diseño original y `generar_web.py` antes de revisar** (231-237): pasaron a
  `rules/pagina.md`.
- **Cómo actualizar las skills** (174-184): pasó a `skills/LEEME-skills.md`.
- **Versión e instalación de Graphify** (156 y 162): pasaron a "Máquina y herramientas".

**Repeticiones juntadas** (no se pierde ninguna regla):

- "Relevo entre sesiones" (223-239):
  - "otro modelo" pasó al propósito del relevo;
  - lo demás ya estaba en "Guardado", "Forma de trabajo" o las reglas nuevas;
  - el entorno `recuerdo-gta6` pasó a "Sesiones en la nube".
- "`datos/` recibe un commit cada hora" (220-221): pasó al paso 3 de "Guardado", donde se usa.
- "Tandas largas en la nube" (218-219): ahora vale siempre, dentro de A ("mientras espera,
  sigue con lo que no depende de ella").
- "Al empezar y al terminar" (198-203): se acortó y remite a "Al iniciar" y "Guardado".

**Nuevo:**

- en "Fuentes de verdad", que también hay reglas en `.claude/rules/`;
- en "Avisos automáticos", los bloqueos.

**Sin tocar:**

- el saludo;
- qué es el proyecto;
- comunicación;
- diseño con permiso;
- no inventar;
- privacidad y "Rust";
- claves;
- "Nunca `--force`" con su fecha;
- forzar el grafo con su fecha;
- máquina;
- la sección `## graphify` en inglés, que la escribe el instalador.

## Paso 5: comprobación de que no se pierde nada (2026-11-24)

**Primera comprobación, la del instructivo:** se listaron los 103 nombres entre comillas
invertidas del `CLAUDE.md` de hoy y se buscó cada uno en el borrador (`CLAUDE.nuevo.md`, las 3
reglas y las skills). Faltan 9, y todos están explicados:

| Falta | Por qué |
|---|---|
| `.claude/skills/impeccable/`, `ORIGEN.txt`, `emilkowalski/skills`, `npx impeccable update`, `pbakaus/impeccable`, `scripts/VERSION` | Es cómo actualizar las skills: está en `skills/LEEME-skills.md` (3.4). `scripts/VERSION` aparece como `impeccable/scripts/VERSION` |
| `.claude/skills/<nombre>/` | Escrito distinto: "en `.claude/skills/`" |
| `PLAN_DE_TRABAJO.md` | Cambio D: ahora dice `PLAN_DE_TRABAJO_*.md` de `historial/` |
| `git commit` | Escrito distinto: "commit y push (ver Guardado…)" |

Contando también `skills/LEEME-skills.md`, solo faltan los 4 de "escrito distinto".

**Segunda comprobación, extra:** lo mismo con las 35 frases en negrita, que son los nombres de las
reglas. Faltan 5, todas cambiadas a propósito:

- **20.000 bytes:** ahora dice 30.000 (G).
- **Acciones de GitHub sin Node.js 20:** ahora es "Acciones sin Node.js 20", en `rules/github.md`.
- **Paso a paso con permiso explícito: ACTIVA, por tandas:** ahora es "Por tandas, con entregas
  cortas" (A).
- **Skills de animación de Emil Kowalski:** ahora es "De animación (de Emil Kowalski…)", en la
  lista de skills.
- **Usar Graphify siempre que se pueda:** ahora es "Graphify para ahorrar tokens y tiempo" (C).

**Revisión a mano:** este `CLAUDE.md` no tiene reglas numeradas, así que se revisaron las reglas
escritas sin negrita ni comillas. Siguen todas, por ejemplo:

- "las ejecuciones programadas solo corren desde `main`";
- "verificar cada fuente con una consulta real";
- "si falta Chromium, nada visual se da por verificado";
- "para deshacer, `git revert`";
- "fuera de lo pedido, nada por iniciativa propia".

Solo una frase se juntó con otra: "cada extra, cuando Bruno lo pide" quedó dentro de A, que dice
que Claude pregunta si algo sale de lo pedido.

**Resultado:** no se pierde ninguna regla.
