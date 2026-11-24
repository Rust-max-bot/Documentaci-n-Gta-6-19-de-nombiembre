---
name: archivar
description: Archiva ESTADO_ACTUAL.md o PLAN.md cuando uno pasa de 30.000 bytes (lo dice el aviso automático al terminar una respuesta). Lo mueve a historial/ y crea uno nuevo con lo esencial.
---

# Archivar `ESTADO_ACTUAL.md` o `PLAN.md`

Se usa cuando uno de los dos pasa de **30.000 bytes** (tope decidido por Bruno). El tope solo dice
cuándo archivar: los dos archivos se mantienen cortos igual, borrando lo viejo.

1. **Mover el archivo** con `git mv` a `historial/ESTADO_AAAA-MM-DD.md` o
   `historial/PLAN_AAAA-MM-DD.md`, con la fecha del día. Si ya existe uno con esa fecha, añadir
   `-2`, `-3`… Los archivos de `historial/` no se editan, salvo para corregir un error factual, y
   anotándolo en el propio archivo.
2. **Crear uno nuevo** con la misma estructura, conservando solo lo necesario para seguir:
   - **`ESTADO_ACTUAL.md`:**
     - "Dónde quedamos", reescrito corto;
     - la fecha límite;
     - "Pendiente", completo;
     - las decisiones o avisos que sigan vigentes;
     - "Últimos cambios", que empieza con una sola línea:
       `- AAAA-MM-DD: estado anterior archivado en historial/ESTADO_AAAA-MM-DD.md`.
   - **`PLAN.md`:**
     - arriba, una línea que diga dónde quedó el plan anterior;
     - la cabecera y las fechas que mandan;
     - **todas las tareas `[ ]` con su texto completo**: lo que falta, los fallos anotados y lo
       que ya existe para ellas;
     - una línea por fase con lo ya hecho (por ejemplo, "Fase 1: hecha, 1.1 a 1.7");
     - las decisiones vigentes, en una o dos líneas cada una;
     - los riesgos y avisos que sigan vigentes.
3. **Comprobar** que no se perdió ninguna tarea pendiente ni aviso vigente, comparando los dos
   archivos.
4. **Guardar y subir** en un solo commit ("Archivar ESTADO_ACTUAL.md…" o "Archivar PLAN.md…").
