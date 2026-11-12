# Graph Report - Documentación Gta 6  (2026-11-12)

## Corpus Check
- 14 files · ~11,284 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: (none) 3, .css 1)

## Summary
- 133 nodes · 168 edges · 13 communities (8 shown, 5 thin omitted)
- Extraction: 81% EXTRACTED · 19% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5184c50`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Fuentes, fases y claves
- Código de la página (app.js)
- Relevo entre sesiones
- Decisiones y reglas de datos
- Diseño Miami y estilos
- Pruebas de fuentes sin clave
- probar_fuentes.py
- Línea de estado git
- Freno de guardado
- probar-fuentes.yml
- steps

## God Nodes (most connected - your core abstractions)
1. `dibujar()` - 8 edges
2. `Resultado de las pruebas reales (12 nov 2026)` - 8 edges
3. `Decisiones ya tomadas` - 7 edges
4. `Recolector de datos en Python (recolector/)` - 7 edges
5. `steps` - 6 edges
6. `pintar()` - 6 edges
7. `Diseño Miami con dos estilos (1986 / 2026)` - 6 edges
8. `GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY)` - 5 edges
9. `Fuente Twitch` - 5 edges
10. `Estado actual del proyecto (ESTADO_ACTUAL.md)` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Instrucciones para Claude (CLAUDE.md)` --semantically_similar_to--> `Instrucción Graphify (.claude/CLAUDE.md)`  [INFERRED] [semantically similar]
  CLAUDE.md → .claude/CLAUDE.md
- `Gráfico espectadores Twitch (#g-twitch)` --shares_data_with--> `Fuente Twitch`  [INFERRED]
  web/index.html → PLAN.md
- `Tabla Twitch (#t-twitch)` --shares_data_with--> `Fuente Twitch`  [INFERRED]
  web/index.html → PLAN.md
- `Sección línea de tiempo (#linea)` --implements--> `Decisiones ya tomadas`  [INFERRED]
  web/index.html → PLAN.md
- `Sección estado de servidores (#servidores)` --shares_data_with--> `Fuente estado de servidores (Rockstar, PSN, Xbox)`  [INFERRED]
  web/index.html → PLAN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Flujo de relevo entre sesiones** — claude_sistema_de_relevo, claude_inicio_de_sesion, claude_guardado_al_terminar_cada_paso, estado_actual_estado_actual, claude_hook_revisar_guardado, claude_hook_estado_git [EXTRACTED 1.00]
- **Pipeline de datos: fuentes, recolector, datos y página** — plan_fuente_twitch, plan_fuente_youtube, plan_fuente_google_trends, plan_recolector, plan_carpeta_datos, plan_formato_datos_window_datos, web_index_carga_scripts [INFERRED 0.85]
- **Implementación de los dos estilos de Miami** — plan_diseno_miami_dos_estilos, web_index_escena_80, web_index_escena_26, web_index_boton_cambio_estilo, web_index_simbolo_edificios, web_index_simbolo_palmera [INFERRED 0.95]

## Communities (13 total, 5 thin omitted)

### Community 0 - "Fuentes, fases y claves"
Cohesion: 0.10
Nodes (23): Fecha límite: recolector en main antes del 18 nov 2026, Lista de pendientes, Clave de Twitch (Client ID y Client Secret), Clave de API de YouTube Data API v3, GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY), Guía para crear las claves de Twitch y YouTube, Carpeta datos/ (mediciones), Criterios para saber si salió bien (+15 more)

### Community 1 - "Código de la página (app.js)"
Cohesion: 0.24
Nodes (13): compacto(), deSantiago(), desfase(), dia(), grafico(), dibujar(), mover(), hora() (+5 more)

### Community 2 - "Relevo entre sesiones"
Cohesion: 0.20
Nodes (10): Instrucción Graphify (.claude/CLAUDE.md), .gitattributes con finales LF para .sh, Línea de estado estado-git.sh, Hook Stop revisar-guardado.sh, Instrucciones para Claude (CLAUDE.md), Skill Graphify, Estado actual del proyecto (ESTADO_ACTUAL.md), Plan del proyecto (PLAN.md) (+2 more)

### Community 3 - "Decisiones y reglas de datos"
Cohesion: 0.18
Nodes (8): Decisiones ya tomadas, Formato de datos: window.DATOS igual a window.DATOS_EJEMPLO, Tecnología: Python recolector + HTML/CSS/JS página, Zona horaria America/Santiago, Aviso de datos de ejemplo (#aviso-ejemplo), Carga de scripts (datos-ejemplo.js, datos.js, eventos.js, app.js), Sección línea de tiempo (#linea), Sección estado de servidores (#servidores)

### Community 4 - "Diseño Miami y estilos"
Cohesion: 0.23
Nodes (11): Revisión visual con Playwright de ambos estilos, Skill Impeccable (diseño), Dónde quedamos, Diseño Miami con dos estilos (1986 / 2026), Tipografías Monoton, Rajdhani, Limelight, Outfit, Botón de cambio de estilo (data-poner), Escena Miami actual, Escena Miami años 80 (+3 more)

### Community 5 - "Pruebas de fuentes sin clave"
Cohesion: 0.28
Nodes (8): Entorno en la nube recuerdo-gta6, Estado de PlayStation (SCEA.json), Estado de Rockstar (no funciona), Fuente estado de servidores (Rockstar, PSN, Xbox), Estado de Xbox (servicestatusv6), Fuente titulares Google Noticias (RSS), Resultado de las pruebas reales (12 nov 2026), Sección titulares (#noticias)

### Community 11 - "probar-fuentes.yml"
Cohesion: 0.20
Nodes (9): jobs, probar, name, on, workflow_dispatch, permissions, contents, runs-on (+1 more)

### Community 12 - "steps"
Cohesion: 0.20
Nodes (10): TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, steps, env, name, run, uses (+2 more)

## Knowledge Gaps
- **12 isolated node(s):** `Gráfico Google Trends (#g-trends)`, `Gráfico espectadores Twitch (#g-twitch)`, `Tabla Twitch (#t-twitch)`, `Tabla videos YouTube (#t-youtube)`, `.gitattributes con finales LF para .sh` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 53 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Resultado de las pruebas reales (12 nov 2026)` connect `Pruebas de fuentes sin clave` to `Fuentes, fases y claves`, `Diseño Miami y estilos`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `dibujar()` (e.g. with `mover()` and `salir()`) actually correct?**
  _`dibujar()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Gráfico Google Trends (#g-trends)`, `Gráfico espectadores Twitch (#g-twitch)`, `Tabla Twitch (#t-twitch)` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Fuentes, fases y claves` be split into smaller, more focused modules?**
  _Cohesion score 0.09846153846153846 - nodes in this community are weakly interconnected._
- **Why does `Dónde quedamos` connect `Diseño Miami y estilos` to `Relevo entre sesiones`, `Pruebas de fuentes sin clave`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Resultado de las pruebas reales (12 nov 2026)` (e.g. with `Entorno en la nube recuerdo-gta6` and `Regla: verificar cada fuente con consulta real`) actually correct?**
  _`Resultado de las pruebas reales (12 nov 2026)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Should `probar_fuentes.py` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._