# Graph Report - Documentación Gta 6  (2026-11-13)

## Corpus Check
- 26 files · ~21,847 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .jsonl 2, .bat 1)

## Summary
- 256 nodes · 397 edges · 18 communities (14 shown, 4 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e2e0b74b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Fuentes, fases y claves
- Código de la página (app.js)
- Relevo entre sesiones
- steps
- Diseño Miami y estilos
- revisar.py
- fuentes.py
- Línea de estado git
- Freno de guardado
- steps
- generar_web.py
- validar.py
- Plan de trabajo
- Recolector
- worker.js
- Despertador del recolector (Cloudflare)

## God Nodes (most connected - your core abstractions)
1. `Falla` - 14 edges
2. `main()` - 11 edges
3. `Plan de trabajo` - 10 edges
4. `dibujar()` - 9 edges
5. `pedir()` - 9 edges
6. `exigir()` - 8 edges
7. `a_iso()` - 8 edges
8. `pedir_json()` - 8 edges
9. `Resultado de las pruebas reales (12 nov 2026)` - 8 edges
10. `main()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  PLAN_DE_TRABAJO.md → web/app.js
- `Instrucciones para Claude (CLAUDE.md)` --semantically_similar_to--> `Instrucción Graphify (.claude/CLAUDE.md)`  [INFERRED] [semantically similar]
  CLAUDE.md → .claude/CLAUDE.md
- `Gráfico espectadores Twitch (#g-twitch)` --shares_data_with--> `Fuente Twitch`  [INFERRED]
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

## Communities (18 total, 4 thin omitted)

### Community 0 - "Fuentes, fases y claves"
Cohesion: 0.07
Nodes (31): Fecha límite: recolector en main antes del 18 nov 2026, Lista de pendientes, Clave de Twitch (Client ID y Client Secret), Clave de API de YouTube Data API v3, GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY), Guía para crear las claves de Twitch y YouTube, Carpeta datos/ (mediciones), Criterios para saber si salió bien (+23 more)

### Community 1 - "Código de la página (app.js)"
Cohesion: 0.22
Nodes (14): compacto(), deSantiago(), desfase(), dia(), grafico(), dibujar(), mover(), hora() (+6 more)

### Community 2 - "Relevo entre sesiones"
Cohesion: 0.20
Nodes (10): Instrucción Graphify (.claude/CLAUDE.md), .gitattributes con finales LF para .sh, Línea de estado estado-git.sh, Hook Stop revisar-guardado.sh, Instrucciones para Claude (CLAUDE.md), Skill Graphify, Estado actual del proyecto (ESTADO_ACTUAL.md), Plan del proyecto (PLAN.md) (+2 more)

### Community 3 - "steps"
Cohesion: 0.09
Nodes (22): concurrency, cancel-in-progress, group, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, jobs, recolectar (+14 more)

### Community 4 - "Diseño Miami y estilos"
Cohesion: 0.12
Nodes (19): Entorno en la nube recuerdo-gta6, Revisión visual con Playwright de ambos estilos, Skill Impeccable (diseño), Dónde quedamos, Diseño Miami con dos estilos (1986 / 2026), Estado de PlayStation (SCEA.json), Estado de Rockstar (no funciona), Fuente estado de servidores (Rockstar, PSN, Xbox) (+11 more)

### Community 5 - "revisar.py"
Cohesion: 0.25
Nodes (4): fecha(), main(), revisar_turnos(), turnos()

### Community 6 - "fuentes.py"
Cohesion: 0.10
Nodes (19): _mensaje_youtube(), noticias(), playstation(), trends(), twitch(), xbox(), youtube(), pedir() (+11 more)

### Community 11 - "steps"
Cohesion: 0.10
Nodes (19): TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, jobs, probar, name, on, workflow_dispatch (+11 more)

### Community 12 - "generar_web.py"
Cohesion: 0.32
Nodes (7): abortar(), comprobar(), convertir(), estado_servidor(), leer_mediciones(), main(), ultima_hora_completa()

### Community 13 - "validar.py"
Cohesion: 0.28
Nodes (11): a_fecha(), es_entero(), es_iso(), exigir(), Invalida, medicion(), _noticias(), _servidor() (+3 more)

### Community 14 - "Plan de trabajo"
Cohesion: 0.18
Nodes (10): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 0 — Claves y fuentes, Fase 1 — Recolector funcionando (lo más importante), Fase 2 — Mejoras rápidas, Fase 3 — Mejoras medianas, Fase 4 — Mejoras largas, Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fechas que mandan (+2 more)

### Community 15 - "Recolector"
Cohesion: 0.25
Nodes (7): Archivos, Comprobaciones, De `datos/` a la página (`generar_web.py`), Formato de cada línea, Interruptor (`interruptor.json`), Probar en el PC, Recolector

### Community 16 - "worker.js"
Cohesion: 0.43
Nodes (6): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir()

### Community 17 - "Despertador del recolector (Cloudflare)"
Cohesion: 0.40
Nodes (4): Apagarlo, Comprobar que funciona, Despertador del recolector (Cloudflare), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada)

## Knowledge Gaps
- **12 isolated node(s):** `Carga de scripts (datos-ejemplo.js, datos.js, eventos.js, app.js)`, `Gráfico Google Trends (#g-trends)`, `Gráfico espectadores Twitch (#g-twitch)`, `Tabla Twitch (#t-twitch)`, `Tabla videos YouTube (#t-youtube)` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 100 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Resultado de las pruebas reales (12 nov 2026)` connect `Diseño Miami y estilos` to `Fuentes, fases y claves`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `dibujar()` (e.g. with `mover()` and `salir()`) actually correct?**
  _`dibujar()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Carga de scripts (datos-ejemplo.js, datos.js, eventos.js, app.js)`, `Gráfico Google Trends (#g-trends)`, `Gráfico espectadores Twitch (#g-twitch)` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Fuentes, fases y claves` be split into smaller, more focused modules?**
  _Cohesion score 0.06827880512091039 - nodes in this community are weakly interconnected._
- **Why does `Dónde quedamos` connect `Diseño Miami y estilos` to `Relevo entre sesiones`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `steps` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `Diseño Miami y estilos` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._