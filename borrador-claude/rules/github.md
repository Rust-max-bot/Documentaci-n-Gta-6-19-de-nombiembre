---
paths:
  - ".github/workflows/**"
---

# Reglas de los workflows de GitHub

- **Acciones sin Node.js 20** (pedido de Bruno). El objetivo es que GitHub no muestre avisos de
  obsolescencia, porque Claude tiende a escribir versiones viejas de las acciones.
  - Node.js 20 está retirado en GitHub: toda acción de un workflow (`uses:`) debe ir en una
    versión que use Node.js 24 o más nuevo.
  - Hoy se usan `actions/checkout@v5`, `actions/setup-python@v6`,
    `actions/upload-pages-artifact@v5` y `actions/deploy-pages@v5`.
  - Antes de añadir o cambiar una acción, comprobar en su `action.yml` (línea `using:`) que no
    diga `node20`, y anotar al lado la versión de Node que usa.
- **Las ejecuciones programadas** de GitHub (`schedule`) solo corren desde `main`.
- **Al revisar una ejecución,** mirar también sus avisos ("Annotations"), no solo si salió en
  verde.
