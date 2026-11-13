# Graph Report - Documentaci-n-Gta-6-19-de-nombiembre  (2026-11-13)

## Corpus Check
- 34 files · ~35,906 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .jsonl 2, .bat 1)

## Summary
- 390 nodes · 639 edges · 27 communities (14 shown, 13 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 85 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d5127575`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Despertador y plan de trabajo
- Fuentes de datos (fuentes.py)
- Reglas de datos y estado actual
- Claves y fases del plan
- Diseño Miami con dos estilos (Miami 2026 y Miami años 80)
- Generar la página (generar_web.py)
- Workflow Recolectar datos
- Workflow Probar fuentes
- Código de la página (app.js)
- Validaciones (validar.py)
- Trabajar con Claude en la nube
- Worker del despertador
- Graphify
- Línea de estado git
- Freno de guardado
- Instrucción Graphify
- Aviso de ejemplo
- Carga de scripts
- Sección titulares
- preparar-nube.sh
- pruebas/LEEME.md
- generar_web.py
- Estado actual del proyecto (ESTADO_ACTUAL.md)

## God Nodes (most connected - your core abstractions)
1. `Falla` - 17 edges
2. `Decisiones ya tomadas` - 14 edges
3. `pintar()` - 13 edges
4. `Plan de trabajo` - 13 edges
5. `Recolector` - 13 edges
6. `Plan del proyecto (PLAN.md)` - 13 edges
7. `Despertador del recolector (Cloudflare)` - 12 edges
8. `main()` - 11 edges
9. `pedir()` - 11 edges
10. `pedir_json()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  PLAN_DE_TRABAJO.md → web/app.js
- `Horario de medición (cada hora; cada 30 min del 17 al 21 nov)` --semantically_similar_to--> `Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN)`  [INFERRED] [semantically similar]
  README.md → despertador/LEEME.md
- `Aviso: base de datos SQL frente a archivos de texto` --rationale_for--> `Formato de cada línea (datos/AAAA-MM-DD.jsonl, horas UTC)`  [INFERRED]
  PLAN_DE_TRABAJO.md → recolector/LEEME.md
- `Sección línea de tiempo (#linea)` --implements--> `Decisiones ya tomadas`  [INFERRED]
  web/index.html → PLAN.md
- `Gráfico espectadores Twitch (#g-twitch)` --shares_data_with--> `Fuente Twitch (categoría Grand Theft Auto VI, id 1867279146, helix/streams)`  [INFERRED]
  web/index.html → PLAN.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Cadena completa: despertador → GitHub → datos/ → generar_web.py → página** — despertador_leeme_worker_despertador_recolector, recolector_leeme_recolector, recolector_leeme_formato_linea_jsonl, recolector_leeme_de_datos_a_la_pagina, readme_ver_pagina_bat [EXTRACTED 1.00]
- **Fuentes de datos probadas del recolector** — plan_fuente_twitch, plan_fuente_youtube, plan_fuente_google_trends, plan_fuente_estado_servidores, plan_fuente_titulares, plan_fuente_estado_rockstar [EXTRACTED 1.00]
- **Archivos y reglas del sistema de relevo entre sesiones** — claude_sistema_relevo, claude_fuentes_de_verdad, estado_actual_estado_actual, plan_plan_del_proyecto, claude_guardado_al_terminar_paso, claude_archivar_estado_actual [EXTRACTED 1.00]
- **Flujo de claves: crear en Twitch/YouTube y guardar en GitHub Secrets** — guia_claves_clave_twitch, guia_claves_clave_youtube, guia_claves_github_secrets, estado_actual_secretos_github, claude_claves_fuera_del_repo [INFERRED 0.85]
- **Horario de medición (cada hora, cada 30 min la semana del lanzamiento)** — readme_horario_medicion, despertador_leeme_cron_trigger, despertador_leeme_semana_lanzamiento, plan_de_trabajo_tarea_1_4_ejecucion_programada [INFERRED 0.85]
- **Garantías de no inventar datos al guardar mediciones** — recolector_leeme_hueco, recolector_leeme_comprobaciones, recolector_leeme_formato_linea_jsonl, recolector_leeme_interruptor [INFERRED 0.85]
- **Implementación de los dos estilos de Miami** — plan_diseno_miami_dos_estilos, web_index_escena_80, web_index_escena_26, web_index_boton_cambio_estilo, web_index_simbolo_edificios, web_index_simbolo_palmera [INFERRED 0.95]

## Communities (27 total, 13 thin omitted)

### Community 0 - "Despertador y plan de trabajo"
Cohesion: 0.05
Nodes (51): Apagarlo, Comprobar que funciona, Cron Trigger 7,37 * * * * (UTC), Despertador del recolector (Cloudflare), Secreto GITHUB_TOKEN (solo Actions: Read and write, caduca 31 ene 2027), Montar el despertador (pasos en el navegador), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada), Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN) (+43 more)

### Community 1 - "Fuentes de datos (fuentes.py)"
Cohesion: 0.08
Nodes (24): _cabeceras_twitch(), _fotos_de_perfil(), _mensaje_youtube(), noticias(), playstation(), reddit(), trends(), twitch() (+16 more)

### Community 2 - "Reglas de datos y estado actual"
Cohesion: 0.08
Nodes (22): Secreto GITHUB_TOKEN del Worker (caduca 31 ene 2027 o ~1 mar 2027, por verificar), recolector/interruptor.json (apagar, encender o alargar; hasta 19 dic), Listas de la página con lo más nuevo arriba, recolectar.yml sin schedule (solo despertador o manual), ver_pagina.bat (trae mediciones, prepara web/datos.js y abre la página), Worker de Cloudflare despertador-recolector (horario 7,37 * * * *), Criterios para saber si salió bien, Decisiones ya tomadas (+14 more)

### Community 3 - "Claves y fases del plan"
Cohesion: 0.10
Nodes (27): Entorno de nube recuerdo-gta6, Fecha límite: recolector funcionando antes del 18 nov 2026, Lista de deseos de Bruno (2026-11-12), D6 cortado, Workflow Probar fuentes (recolector/probar_fuentes.py), Secretos de GitHub TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY guardados, Clave de Twitch (Client ID y Client Secret, dev.twitch.tv), Clave de API de YouTube Data API v3 (Google Cloud), Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY) (+19 more)

### Community 4 - "Diseño Miami con dos estilos (Miami 2026 y Miami años 80)"
Cohesion: 0.24
Nodes (8): Diseño Miami con dos estilos (Miami 2026 y Miami años 80), Tipografías Google Fonts: Monoton, Rajdhani, Limelight y Outfit, Botón de cambio de estilo (data-poner), Escena Miami actual, Escena Miami años 80, web/index.html (página del recuerdo), Símbolo SVG edificios art déco, Símbolo SVG palmera

### Community 5 - "Generar la página (generar_web.py)"
Cohesion: 0.13
Nodes (10): main(), abrir(), preparar_salida(), main(), main(), recorrer(), fecha(), main() (+2 more)

### Community 6 - "Workflow Recolectar datos"
Cohesion: 0.09
Nodes (22): concurrency, cancel-in-progress, group, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, jobs, recolectar (+14 more)

### Community 7 - "Workflow Probar fuentes"
Cohesion: 0.10
Nodes (19): TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, jobs, probar, name, on, workflow_dispatch (+11 more)

### Community 8 - "Código de la página (app.js)"
Cohesion: 0.10
Nodes (33): ahora(), aPantalla(), boton(), compacto(), cuadro(), cuenta(), deSantiago(), desfase() (+25 more)

### Community 9 - "Validaciones (validar.py)"
Cohesion: 0.25
Nodes (14): a_fecha(), es_entero(), es_iso(), exigir(), Invalida, medicion(), _noticias(), _reddit() (+6 more)

### Community 10 - "Trabajar con Claude en la nube"
Cohesion: 0.40
Nodes (4): Antes de empezar, Cómo ver lo que hace, Qué escribirle, Trabajar con Claude en la nube

### Community 11 - "Worker del despertador"
Cohesion: 0.43
Nodes (6): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir()

### Community 24 - "generar_web.py"
Cohesion: 0.35
Nodes (7): abortar(), comprobar(), convertir(), estado_servidor(), leer_mediciones(), main(), ultima_hora_completa()

### Community 25 - "Estado actual del proyecto (ESTADO_ACTUAL.md)"
Cohesion: 0.08
Nodes (18): Línea de estado .claude/hooks/estado-git.sh, .gitattributes fuerza LF en los .sh, Skill Impeccable (.claude/skills/impeccable/), Instrucciones para Claude (CLAUDE.md), Repositorio GitHub público Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre (rama main), Hook Stop .claude/hooks/revisar-guardado.sh, Dónde quedamos (2026-11-13), Eje del gráfico de Twitch con números redondos (+10 more)

## Knowledge Gaps
- **32 isolated node(s):** `Estado de Rockstar (anotado a mano en web/eventos.js)`, `Fallo del eje de Twitch (compacto() en web/app.js)`, `Reddit (A5)`, `Fase 5 — Búsqueda calmada tras el lanzamiento`, `Aviso legal (proyecto de fans, no afiliado a Rockstar/Take-Two)` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 145 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Plan del proyecto (PLAN.md)` connect `Claves y fases del plan` to `Estado actual del proyecto (ESTADO_ACTUAL.md)`, `Reglas de datos y estado actual`, `Diseño Miami con dos estilos (Miami 2026 y Miami años 80)`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **What connects `Estado de Rockstar (anotado a mano en web/eventos.js)`, `Fallo del eje de Twitch (compacto() en web/app.js)`, `Reddit (A5)` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Despertador y plan de trabajo` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Why does `Fase 1 — Recolector funcionando (lo más importante)` connect `Despertador y plan de trabajo` to `Código de la página (app.js)`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `Fuentes de datos (fuentes.py)` be split into smaller, more focused modules?**
  _Cohesion score 0.08270676691729323 - nodes in this community are weakly interconnected._
- **Should `Reglas de datos y estado actual` be split into smaller, more focused modules?**
  _Cohesion score 0.08172043010752689 - nodes in this community are weakly interconnected._
- **Should `Claves y fases del plan` be split into smaller, more focused modules?**
  _Cohesion score 0.10098522167487685 - nodes in this community are weakly interconnected._