# Revisión a mano de `CLAUDE.md` (2026-11-24)

Paso 2 del instructivo para mejorar la configuración. Compara `CLAUDE.md` (251 líneas) con el
estado real del proyecto (`ESTADO_ACTUAL.md`, `PLAN.md`, `git log` y los archivos). Parte del
informe automático (`AUDITORIA_PROMPTS.md`). **Todavía no se cambió nada:** Bruno elige qué se
aplica.

Cada punto tiene un número para poder elegir ("aplica 1, 3 y 5").

## 1. Forma de trabajo: más rápida, pero con resultados a la vista

**Qué pasa hoy:**

- Hay dos reglas que se contradicen:
  - `CLAUDE.md:47-53` dice que Claude encadena toda la tanda sin parar.
  - La memoria "pasos cortos" dice un paso por respuesta, y vive fuera del proyecto.
- Además, la sesión siempre espera la confirmación de Bruno al empezar (`CLAUDE.md:26-27`).
- "Las decisiones de verdad" no dice cuáles son, así que se pregunta casi todo.

**Lo que pidió Bruno (2026-11-24):** trabajar más rápido y que no le pregunten por todo, pero sin
que Claude trabaje mucho rato sin un resultado real. Y que quede claro cuánto se hizo y qué quedó
claro.

**Propuesta** (reemplaza `CLAUDE.md:47-53`; texto para revisar):

> - **Por tandas, con entregas cortas** (decisión de Bruno). Bruno dice qué hacer. Antes de empezar,
>   Claude escribe el plan en 3 a 5 pasos de pocos minutos cada uno y luego los hace seguidos, sin
>   esperar permiso entre uno y otro. Al terminar cada paso, escribe una o dos líneas: qué quedó
>   hecho y qué se comprobó.
> - **Se para antes** si un paso se complica o se alarga mucho más de lo previsto: cuenta qué
>   intentó y qué falta.
> - **Claude decide solo** lo que está dentro de lo pedido y se puede deshacer con `git revert`.
>   Lo anota en "Decisiones que tomé".
> - **Pregunta a Bruno** (una sola pregunta) solo cuando:
>   - cambia cómo se ve la página;
>   - toca `datos/`;
>   - es algo que no se deshace o que sale afuera (borrar, publicar, `--force`);
>   - sale de lo pedido;
>   - hay dos caminos razonables y elegir mal costaría rehacer trabajo.
>
>   Mientras espera la respuesta, sigue con lo que no depende de ella.
> - **Al terminar la tanda**, la respuesta dice siempre:
>   - lo hecho;
>   - lo comprobado (y cómo);
>   - lo que falta;
>   - las decisiones que tomó;
>   - lo que necesita de Bruno.

**Decisiones que acompañan a esta regla:**

- **Pruebas** (`CLAUDE.md:59-63`):
  - en cada paso, solo las de lo cambiado;
  - la prueba completa (`probar_pagina.py`), una vez al final de la tanda, si se tocó la página.
- **Al iniciar** (`CLAUDE.md:26-27`): si el primer mensaje de Bruno ya dice qué hacer, Claude
  resume en pocas líneas y empieza sin esperar. Solo espera si el estado dice algo que choca con
  lo pedido.
- **La memoria "pasos cortos"** (en `~/.claude`) quedaría contradiciendo la regla nueva. Hay que
  borrarla o cambiarla, pero eso se pregunta aparte, porque está fuera del proyecto.

## 2. Reglas escritas como historia

Se deja solo la regla actual, con "pedido de Bruno" donde dice quién la decidió. La historia queda
en `git log`.

| Línea | Hoy | Queda |
|---|---|---|
| 30-31 | "(un solo plan desde el 2026-11-16, pedido de Bruno: antes eran `PLAN.md` y `PLAN_DE_TRABAJO.md`)" | "(los `PLAN_DE_TRABAJO_*.md` de `historial/` son planes viejos)", para que se entiendan esos archivos |
| 45 | "*(Reglas traídas del proyecto "Ayuda para el inglés" y adaptadas…)*" | Se quita |
| 47-48 | "ACTIVA… reemplaza la pausa que se había acordado ese mismo día" | Se va con el punto 1 |
| 146 | "ya pasó dos veces y GitHub lo avisa en cada ejecución" | "GitHub avisa en cada ejecución" |
| 174 | "(instaladas el 2026-11-17, decisión de Bruno, tarea 9.11)" | "(decisión de Bruno)" |

**Se quedan tal cual:** los "Nunca `--force`" (línea 82) y "pedir permiso para forzar el grafo"
(línea 168), porque protegen algo que no se deshace. Las fechas de esas autorizaciones únicas
también se quedan: dicen que fue **una** vez.

## 3. Datos que ya no son ciertos o están incompletos

- **Líneas 175-177:** `prototype` y `review-animations` no se activan solas (tienen
  `disable-model-invocation: true`). Texto nuevo: "`prototype` (…; sirve para las opciones de
  diseño que se le presentan a Bruno: solo la lanza Bruno con `/prototype`, así que Claude se la
  propone cuando toque)" y "`review-animations` (solo con `/review-animations`)".
- **Línea 148:** "Hoy: `actions/checkout@v5` y `actions/setup-python@v6`". Faltan
  `actions/upload-pages-artifact@v5` y `actions/deploy-pages@v5`, que también se usan en
  `publicar-pagina.yml` (todas con Node.js 24, así que están bien). Agregarlas a la lista.
- **Animación:** `animate` y `find-animation-opportunities` mandan a `improve-animations`, que no
  está instalada. Recomendado: instalarla del mismo repositorio (`emilkowalski/skills`) con su
  `ORIGEN.txt`, como las otras.
- **Comprobado y bien:**
  - todas las rutas (`ESTADO_ACTUAL.md`, `PLAN.md`, `NUBE.md`, `pruebas/LEEME.md`,
    `pruebas/requisitos.txt`, `recolector/generar_web.py`, los 3 hooks, `.gitattributes`,
    `.graphifyignore`, `graphify-out/`, `historial/`);
  - los flags `--seccion` y `--firefox`;
  - la versión 0.9.111 de Graphify;
  - el commit de cada hora en `datos/`.

## 4. Pasos rígidos para algo que requiere juicio

- **Líneas 26-27, "espera su confirmación antes de trabajar":** va en el punto 1.
- **Línea 66, "Usar Graphify siempre que se pueda":** pasaría a "para saber dónde está algo o cómo
  se relacionan partes del proyecto, preguntar primero al grafo". La excepción de la línea 69 se
  queda.

## 5. Detalles que solo sirven en un caso raro

`CLAUDE.md` tiene 251 líneas; el instructivo dice que bajo 200 está bien. Estos bloques se cargan en
cada sesión, pero solo sirven a veces. Dónde van se decide en el paso 3; aquí solo se marcan:

| Líneas | Qué es | Cuándo sirve |
|---|---|---|
| 146-152 | Acciones de GitHub sin Node.js 20 | Solo al tocar `.github/workflows/` |
| 165-173 | Graphify: qué hacer si falla, forzar el grafo, choques al unir | Solo cuando Graphify falla |
| 174-184 | Cómo actualizar las skills de animación e Impeccable | Solo al actualizarlas |
| 186-194 | Python 3.14 para Graphify, `gh` | Solo en el PC y al instalar |

Lo de "Si el trabajo cambia código, correr `graphify update .`" (160-162) se queda en `CLAUDE.md`,
porque hace falta en cualquier sesión.

## 6. Repeticiones (opcional, prioridad baja)

Estas repeticiones dicen lo mismo, así que no causan errores:

- 200-203 repite el `git pull` (21) y el guardado (74-88);
- 220-221 repite el `git pull --rebase` (83);
- 227-237 repite "ejemplo: true" (56-58) y las pruebas (59-63).

Se pueden juntar al rehacer el archivo en el paso 4. La sección `## graphify` en inglés
(241-250) la escribe el instalador de Graphify: **se deja** aunque repita la línea 66.

## 7. Lo que se deja como está

- **Fuera del proyecto** (`~/.claude/`): la copia vieja de Impeccable, la línea de graphify y la
  memoria. Se pregunta aparte.
- **Skills de terceros** (graphify, Emil Kowalski, Impeccable): no se editan, porque se sobrescriben
  al actualizarlas. El grito "MANDATORY" de graphify queda.
- **`.claude/CLAUDE.md`:** lo escribe Graphify.
- **El saludo "Bruno,", el español, la privacidad, la máquina y la nube:** valen en todas las
  sesiones.

## Para elegir

Bruno dice qué números aplica (1 a 6). En el punto 1, además, si el texto propuesto le sirve o qué
le cambia. Con eso sigue el paso 3 (dónde va cada regla).
