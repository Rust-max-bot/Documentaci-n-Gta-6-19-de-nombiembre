---
paths:
  - "datos/**"
  - "recolector/**"
---

# Reglas de los datos

- **Datos por programa, no a mano:** lo que se escriba en `datos/` lo hace un programa con
  validaciones que abortan si algo no cuadra. Antes de cualquier cambio masivo, se hace una copia
  fuera del proyecto. Editar `datos/` a mano está bloqueado (`permissions.deny` en
  `.claude/settings.json`).
- **No borrar ni reescribir archivos de `datos/`:** son el recuerdo y no se pueden volver a
  obtener.
- **Horas en UTC** dentro de los datos. La conversión a hora local se hace solo al mostrar la
  página.
- **Verificar cada fuente de datos con una consulta real** antes de afirmar que funciona.
