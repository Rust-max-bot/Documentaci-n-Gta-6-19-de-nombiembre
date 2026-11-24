# Cambios propuestos a `CLAUDE.md`: para elegir

**Este es el archivo que hay que revisar.** `AUDITORIA_PROMPTS.md` es solo el informe de fondo; no
hace falta leerlo.

**Cómo usarlo:** cada cambio muestra el texto de hoy, cómo quedaría y qué cambia en la práctica.
Marca `[x]` en los que quieras. Lo que no marques no se toca. Si quieres un cambio pero con otras
palabras, escríbelo al lado.

Todavía no se cambió nada (2026-11-24). Los números de línea son los del `CLAUDE.md` de hoy.

---

## A. Forma de trabajo: más rápida, pero con resultados a la vista

- [x] Aplicar A

**Por qué:** hoy hay dos reglas que se contradicen. `CLAUDE.md` dice "encadena toda la tanda sin
parar" y la memoria "pasos cortos" dice "un paso por respuesta". Además, Claude te pregunta casi
todo, porque "las decisiones de verdad" no dice cuáles son. Tú pediste ir más rápido, pero sin que
Claude trabaje mucho rato sin un resultado, y que siempre quede claro cuánto se hizo.

**Hoy (líneas 47-53):**

> **Paso a paso con permiso explícito: ACTIVA, por tandas** (decisión de Bruno, 2026-11-12;
> reemplaza la pausa que se había acordado ese mismo día). Bruno dice qué pasos hay que hacer
> (por ejemplo, "de la 1.2 a la 1.5") y Claude los encadena sin detenerse entre uno y otro hasta
> completarlos todos; al terminar la tanda, se detiene y espera, aunque haya salido bien. Fuera de
> lo pedido, nada por iniciativa propia; cada extra, cuando Bruno lo pide. Cada paso terminado se
> sigue guardando (…) y las decisiones de verdad se le siguen preguntando a Bruno, aunque sea en
> mitad de la tanda.

**Quedaría:**

> **Por tandas, con entregas cortas** (decisión de Bruno). Bruno dice qué hacer.
>
> - **Antes de empezar:** Claude escribe el plan en 3 a 5 pasos de pocos minutos cada uno.
> - **Durante la tanda:** hace los pasos seguidos, sin esperar permiso. Al terminar cada uno
>   escribe una o dos líneas: qué quedó hecho y qué se comprobó. Cada paso terminado se guarda (ver
>   "Guardado al terminar cada paso").
> - **Se para antes** si un paso se complica o se alarga mucho más de lo previsto: cuenta qué
>   intentó y qué falta.
> - **Claude decide solo** lo que está dentro de lo pedido y se puede deshacer con `git revert`.
>   Lo anota.
> - **Pregunta a Bruno** (una sola pregunta) solo si:
>   - cambia cómo se ve la página;
>   - toca `datos/`;
>   - es algo que no se deshace o que sale afuera (borrar, publicar, `--force`);
>   - sale de lo pedido;
>   - hay dos caminos razonables y elegir mal obligaría a rehacer trabajo.
>
>   Mientras espera la respuesta, sigue con lo que no depende de ella.
> - **Al terminar la tanda**, se detiene y su respuesta dice siempre:
>   - **Hecho**;
>   - **Comprobado** (y cómo);
>   - **Falta**;
>   - **Decidí yo**;
>   - **Necesito de ti**.
> - Fuera de lo pedido, nada por iniciativa propia.

**En la práctica:** si pides "haz la 9.13", Claude escribe un plan de 4 pasos, los hace avisando una
línea por paso, no te pregunta por detalles chicos y al final te da el resumen de 5 partes. Si un
paso se enreda, para y te cuenta, en vez de seguir media hora.

**Van junto con A** (si marcas A, cambian también):

- **Pruebas** (líneas 59-63):
  - **Hoy:** cada vez, Playwright completo a 1280 y 384 px, en los dos estilos.
  - **Quedaría:** en cada paso, solo las pruebas de lo cambiado; la prueba completa
    (`python pruebas/probar_pagina.py`), una vez al final de la tanda, si se tocó la página.
- **Al iniciar una sesión** (líneas 26-27):
  - **Hoy:** "Resume a Bruno … y espera su confirmación antes de trabajar".
  - **Quedaría:** si tu primer mensaje ya dice qué hacer, Claude resume en pocas líneas y empieza
    sin esperar. Solo espera si el estado choca con lo que pediste.
- **La memoria "pasos cortos"** (está en `~/.claude/`, fuera del proyecto): quedaría
  contradiciendo la regla nueva. Se pregunta aparte si se borra.

---

## B. `prototype` y `review-animations` no se activan solas

- [x] Aplicar B

**Por qué:** `CLAUDE.md` dice que Claude use `prototype`, pero esa skill (igual que
`review-animations`) solo funciona si **tú** escribes `/prototype`. Claude no puede lanzarla, así
que hoy esa regla no se puede cumplir.

**Hoy (líneas 175-177):**

> `prototype` (arma 3 a 5 versiones distintas de una pieza con un selector para elegir en vivo;
> usarla para las opciones de diseño que se le presentan a Bruno), … `review-animations` y …

**Quedaría:**

> `prototype` (arma 3 a 5 versiones distintas de una pieza con un selector para elegir en vivo;
> sirve para las opciones de diseño que se le presentan a Bruno. Solo la lanza Bruno con
> `/prototype`, así que Claude se la propone cuando toque), … `review-animations` (solo con
> `/review-animations`) y …

**En la práctica:** cuando haya que elegir un diseño, Claude te dirá "escribe `/prototype …`", en
vez de intentar algo que no puede hacer.

---

## C. Graphify: decir cuándo sirve, no "siempre"

- [x] Aplicar C

**Por qué:** "siempre que se pueda" hace que Claude consulte el grafo también cuando no ayuda. Por
ejemplo, para leer un archivo que ya conoce, lo que gasta tiempo. Los avisos automáticos ya le
recuerdan Graphify en cada búsqueda.

**Hoy (líneas 66-67):**

> **Usar Graphify siempre que se pueda, para ahorrar tokens y tiempo** (pedido de Bruno,
> 2026-11-12): antes de abrir o buscar en archivos del proyecto, preguntar al grafo …

**Quedaría:**

> **Graphify para ahorrar tokens y tiempo** (pedido de Bruno): para saber dónde está algo o cómo se
> relacionan partes del proyecto, preguntar primero al grafo …

El resto de la regla (línea 69: "No hace falta si la tarea ya dice qué archivo tocar") se queda.

---

## D. Quitar frases de historia

- [x] Aplicar D

**Por qué:** una sesión nueva lee "antes era así" y puede creer que lo viejo sigue valiendo. La
historia ya está en `git log`.

| Línea | Hoy | Quedaría |
|---|---|---|
| 30-31 | "(un solo plan desde el 2026-11-16, pedido de Bruno: antes eran `PLAN.md` y `PLAN_DE_TRABAJO.md`)" | "(los `PLAN_DE_TRABAJO_*.md` de `historial/` son planes viejos)" |
| 45 | "*(Reglas traídas del proyecto "Ayuda para el inglés" y adaptadas, decisión de Bruno, 2026-11-12.)*" | *(se quita)* |
| 146 | "(pedido de Bruno, 2026-11-13; ya pasó dos veces y GitHub lo avisa en cada ejecución)" | "(pedido de Bruno, para que GitHub no muestre avisos de obsolescencia: Claude tiende a escribir versiones viejas)" |
| 174 | "(instaladas el 2026-11-17, decisión de Bruno, tarea 9.11)" | "(decisión de Bruno)" |

**No se tocan:** "Nunca `--force`" (línea 82) ni "pedir permiso para forzar el grafo" (línea 168),
con sus fechas, porque protegen cosas que no se deshacen.

---

## E. Lista de acciones de GitHub incompleta

- [x] Aplicar E

**Por qué:** la lista no menciona dos acciones que el proyecto sí usa. No hay ningún fallo: todas
usan Node.js 24. Solo falta que la lista esté completa.

**La regla en sí no cambia** (aclaración de Bruno, 2026-11-24): nació porque, al crear los
primeros workflows, Claude escribía por defecto versiones de las acciones que usaban Node.js 20,
y GitHub avisaba que eso ya está retirado. Sigue igual que hoy: usar siempre versiones con
Node.js 24 o más nuevo, comprobarlo en el `action.yml` de cada acción antes de usarla y revisar
los avisos ("Annotations") de cada ejecución.

**Hoy (línea 148-149):**

> Hoy: `actions/checkout@v5` y `actions/setup-python@v6`.

**Quedaría:**

> Hoy: `actions/checkout@v5`, `actions/setup-python@v6`, `actions/upload-pages-artifact@v5` y
> `actions/deploy-pages@v5`.

---

## F. Instalar la skill `improve-animations`

- [x] Aplicar F

**Por qué:** las skills `animate` y `find-animation-opportunities` mandan a `improve-animations`,
que no se instaló con las demás. Así, cuando Claude intenta seguir esa referencia, no encuentra
nada.

**Qué se haría:** copiar `improve-animations` del repositorio `emilkowalski/skills` a
`.claude/skills/improve-animations/`, con su `ORIGEN.txt`, igual que las otras 6. Después,
sumarla a la lista de la línea 177 de `CLAUDE.md`. No cambia la página.

---

## Para más adelante (no hay que marcar nada ahora)

- **Paso 3 del instructivo:** `CLAUDE.md` tiene 251 líneas y el instructivo dice que bajo 200 está
  bien. Hay bloques que solo sirven a veces y que en el paso 3 se pueden mover a archivos que se
  cargan solos cuando hacen falta:
  - acciones de GitHub (146-152), solo al tocar `.github/workflows/`;
  - qué hacer si Graphify falla (165-173);
  - cómo actualizar las skills (174-184);
  - Python y `gh` en el PC (186-194).
- **Repeticiones** (prioridad baja): 200-203, 220-221 y 227-237 repiten reglas que ya están más
  arriba. No causan errores; se pueden juntar al rehacer el archivo.
- **Fuera del proyecto** (`~/.claude/`, se pregunta aparte): la copia vieja de Impeccable y la
  memoria "pasos cortos".
