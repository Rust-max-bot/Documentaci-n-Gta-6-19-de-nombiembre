# Instrucciones para Claude en este repositorio

## Qué es el proyecto

Recuerdo del lanzamiento de GTA 6 (19 de noviembre de 2026): una página web con línea de
tiempo y tablas de números de Twitch, YouTube y Google Trends. Es un proyecto por diversión.

**Antes de hacer cualquier cosa, lee `PLAN.md`.** Ahí están las decisiones tomadas, las
pendientes y los riesgos. Si se toma una decisión nueva, actualiza `PLAN.md` en el mismo cambio.

## Cómo comunicarse con Bruno

- Responder siempre en español y empezar cada respuesta con "Bruno,".
- Lenguaje simple y directo. Usar términos técnicos solo cuando hagan falta, y explicarlos.
- Ser honesto: distinguir lo verificado de lo que es una suposición. No inventar datos.
- Si una idea de Bruno tiene un fallo, decirlo antes de ejecutarla.
- Hacer una sola pregunta a la vez cuando haya que decidir algo.

## Reglas del proyecto

- **Nunca escribir claves ni contraseñas en archivos del repositorio.** Las claves de Twitch
  y YouTube van en los "Secrets" de GitHub. En el PC, en un archivo `.env` (ya ignorado por git).
- Verificar cada fuente de datos con una consulta real antes de afirmar que funciona.
- Guardar siempre las horas en UTC dentro de los datos. La conversión a hora local se hace
  solo al mostrar la página.
- No borrar ni reescribir archivos de `datos/`: son el recuerdo y no se pueden volver a obtener.
- Las ejecuciones programadas de GitHub solo corren desde `main`.
- Bruno quiere usar la skill Graphify (mapa del proyecto para gastar menos tokens), pero solo
  cuando ya haya archivos de código listos. Antes de instalarla, verificar su repositorio oficial.

## Trabajar en la nube y en el PC

El repositorio de GitHub es la única fuente de verdad. Para no perder trabajo ni crear conflictos:

1. Al empezar a trabajar (nube o PC): traer los últimos cambios con `git pull`.
2. Al terminar: guardar con `git commit` y subir con `git push`.
3. No dejar cambios sin subir en un sitio antes de ponerse a trabajar en el otro.

En la nube, el entorno se borra al terminar la sesión: lo que no se sube con `git push` se pierde.

## Relevo entre sesiones y modelos

Este proyecto puede continuarlo otra sesión u otro modelo. Para que el relevo funcione:

- `PLAN.md` es el estado real del proyecto. Mantener al día "Estado", "Pasos siguientes" y
  "Decisiones pendientes" al terminar cada sesión.
- La página (`web/`) no usa librerías ni paso de compilación. Mantenerlo así.
- Los datos de ejemplo deben seguir marcados como ejemplo (`ejemplo: true`). Nunca presentar
  datos inventados como reales.
- Diseño: original, inspirado en Miami. No copiar logotipos, tipografías ni arte de los juegos.
- Para revisar cambios visuales: abrir `web/index.html` con Playwright y mirar una captura
  de cada estilo (botón "Miami 1986" / "Miami 2026").
