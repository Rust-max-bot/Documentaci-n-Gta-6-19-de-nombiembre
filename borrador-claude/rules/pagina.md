---
paths:
  - "web/**"
  - "pruebas/**"
---

# Reglas de la página

- **Sin librerías:** la página (`web/`) no usa librerías ni paso de compilación. Mantenerlo así.
- **Diseño original,** inspirado en Miami. No copiar logotipos, tipografías ni arte de los juegos.
- **Horas en UTC:** los datos traen las horas en UTC; se pasan a hora local solo al mostrarlas.
- **Para revisar cambios visuales:**
  1. `python recolector/generar_web.py`, para tener los datos reales.
  2. `python pruebas/probar_pagina.py`.
  3. Mirar las capturas de `pruebas/capturas/`.
