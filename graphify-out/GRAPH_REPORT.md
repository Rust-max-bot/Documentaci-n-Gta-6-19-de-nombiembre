# Graph Report - Documentación Gta 6  (2026-11-12)

## Corpus Check
- Corpus is ~9,368 words - fits in a single context window. You may not need a graph.

## Summary
- 97 nodes · 134 edges · 11 communities (7 shown, 4 thin omitted)
- Extraction: 77% EXTRACTED · 23% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Fuentes, fases y claves
- Código de la página (app.js)
- Relevo entre sesiones
- Decisiones y reglas de datos
- Diseño Miami y estilos
- Pruebas de fuentes sin clave
- Recolector y carpeta de datos
- Línea de estado git
- Freno de guardado

## God Nodes (most connected - your core abstractions)
1. `dibujar()` - 8 edges
2. `Resultado de las pruebas reales (12 nov 2026)` - 8 edges
3. `Decisiones ya tomadas` - 7 edges
4. `Recolector de datos en Python (recolector/)` - 7 edges
5. `pintar()` - 6 edges
6. `Diseño Miami con dos estilos (1986 / 2026)` - 6 edges
7. `Guardado al terminar cada paso` - 5 edges
8. `Estado actual del proyecto (ESTADO_ACTUAL.md)` - 5 edges
9. `Lista de pendientes` - 5 edges
10. `GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Instrucciones para Claude (CLAUDE.md)` --semantically_similar_to--> `Instrucción Graphify (.claude/CLAUDE.md)`  [INFERRED] [semantically similar]
  CLAUDE.md → .claude/CLAUDE.md
- `Sección línea de tiempo (#linea)` --implements--> `Decisiones ya tomadas`  [INFERRED]
  web/index.html → PLAN.md
- `Botón de cambio de estilo (data-poner)` --implements--> `Diseño Miami con dos estilos (1986 / 2026)`  [INFERRED]
  web/index.html → PLAN.md
- `Gráfico espectadores Twitch (#g-twitch)` --shares_data_with--> `Fuente Twitch`  [INFERRED]
  web/index.html → PLAN.md
- `Tabla Twitch (#t-twitch)` --shares_data_with--> `Fuente Twitch`  [INFERRED]
  web/index.html → PLAN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo de relevo entre sesiones** — claude_sistema_de_relevo, claude_inicio_de_sesion, claude_guardado_al_terminar_cada_paso, estado_actual_estado_actual, claude_hook_revisar_guardado, claude_hook_estado_git [EXTRACTED 1.00]
- **Pipeline de datos: fuentes, recolector, datos y página** — plan_fuente_twitch, plan_fuente_youtube, plan_fuente_google_trends, plan_recolector, plan_carpeta_datos, plan_formato_datos_window_datos, web_index_carga_scripts [INFERRED 0.85]
- **Implementación de los dos estilos de Miami** — plan_diseno_miami_dos_estilos, web_index_escena_80, web_index_escena_26, web_index_boton_cambio_estilo, web_index_simbolo_edificios, web_index_simbolo_palmera [INFERRED 0.95]

## Communities (11 total, 4 thin omitted)

### Community 0 - "Fuentes, fases y claves"
Cohesion: 0.13
Nodes (16): Clave de Twitch (Client ID y Client Secret), Clave de API de YouTube Data API v3, GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY), Criterios para saber si salió bien, Fase 1: en tiempo real, Fase 2: búsqueda calmada, Fuente Google Trends, Fuente Twitch (+8 more)

### Community 1 - "Código de la página (app.js)"
Cohesion: 0.24
Nodes (13): compacto(), deSantiago(), desfase(), dia(), grafico(), dibujar(), mover(), hora() (+5 more)

### Community 2 - "Relevo entre sesiones"
Cohesion: 0.20
Nodes (10): Instrucción Graphify (.claude/CLAUDE.md), .gitattributes con finales LF para .sh, Línea de estado estado-git.sh, Hook Stop revisar-guardado.sh, Instrucciones para Claude (CLAUDE.md), Skill Graphify, Estado actual del proyecto (ESTADO_ACTUAL.md), Plan del proyecto (PLAN.md) (+2 more)

### Community 3 - "Decisiones y reglas de datos"
Cohesion: 0.18
Nodes (8): Fecha límite: recolector en main antes del 18 nov 2026, Decisiones ya tomadas, Ejecuciones programadas de GitHub (solo desde main), Tecnología: Python recolector + HTML/CSS/JS página, Zona horaria America/Santiago, Aviso de datos de ejemplo (#aviso-ejemplo), Sección línea de tiempo (#linea), Sección estado de servidores (#servidores)

### Community 4 - "Diseño Miami y estilos"
Cohesion: 0.23
Nodes (11): Revisión visual con Playwright de ambos estilos, Skill Impeccable (diseño), Dónde quedamos, Diseño Miami con dos estilos (1986 / 2026), Tipografías Monoton, Rajdhani, Limelight, Outfit, Botón de cambio de estilo (data-poner), Escena Miami actual, Escena Miami años 80 (+3 more)

### Community 5 - "Pruebas de fuentes sin clave"
Cohesion: 0.28
Nodes (8): Entorno en la nube recuerdo-gta6, Estado de PlayStation (SCEA.json), Estado de Rockstar (no funciona), Fuente estado de servidores (Rockstar, PSN, Xbox), Estado de Xbox (servicestatusv6), Fuente titulares Google Noticias (RSS), Resultado de las pruebas reales (12 nov 2026), Sección titulares (#noticias)

### Community 6 - "Recolector y carpeta de datos"
Cohesion: 0.32
Nodes (7): Lista de pendientes, Guía para crear las claves de Twitch y YouTube, Carpeta datos/ (mediciones), Estructura de carpetas (web/, recolector/, datos/, .github/workflows/), Formato de datos: window.DATOS igual a window.DATOS_EJEMPLO, Recolector de datos en Python (recolector/), Carga de scripts (datos-ejemplo.js, datos.js, eventos.js, app.js)

## Knowledge Gaps
- **12 isolated node(s):** `Línea de estado estado-git.sh`, `.gitattributes con finales LF para .sh`, `Entorno en la nube recuerdo-gta6`, `Guía para crear las claves de Twitch y YouTube`, `Tecnología: Python recolector + HTML/CSS/JS página` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 28 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Resultado de las pruebas reales (12 nov 2026)` connect `Pruebas de fuentes sin clave` to `Fuentes, fases y claves`, `Diseño Miami y estilos`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `dibujar()` (e.g. with `mover()` and `salir()`) actually correct?**
  _`dibujar()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Línea de estado estado-git.sh`, `.gitattributes con finales LF para .sh`, `Entorno en la nube recuerdo-gta6` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Fuentes, fases y claves` be split into smaller, more focused modules?**
  _Cohesion score 0.13071895424836602 - nodes in this community are weakly interconnected._
- **Why does `Dónde quedamos` connect `Diseño Miami y estilos` to `Relevo entre sesiones`, `Pruebas de fuentes sin clave`?**
  _High betweenness centrality (0.116) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Resultado de las pruebas reales (12 nov 2026)` (e.g. with `Entorno en la nube recuerdo-gta6` and `Regla: verificar cada fuente con consulta real`) actually correct?**
  _`Resultado de las pruebas reales (12 nov 2026)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Why does `Decisiones ya tomadas` connect `Decisiones y reglas de datos` to `Fuentes, fases y claves`?**
  _High betweenness centrality (0.109) - this node is a cross-community bridge._