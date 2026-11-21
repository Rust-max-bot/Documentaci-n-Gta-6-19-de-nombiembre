# Graph Report - Documentación Gta 6  (2026-11-21)

## Corpus Check
- 79 files · ~195,244 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 18 file(s) not represented in the graph (top: .jsonl 10, (none) 3, .bat 3)

## Summary
- 1183 nodes · 2182 edges · 82 communities (64 shown, 18 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 164 edges (avg confidence: 0.88)
- Token cost: 183,861 input · 0 output

## Graph Freshness
- Built from commit: `8c499e5a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Despertador y plan de trabajo
- poner
- Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)
- Estado actual del proyecto (ESTADO_ACTUAL.md)
- steps
- medir_carga.py
- Workflow Recolectar datos
- Workflow Probar fuentes
- app.js
- trends_extra.py
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
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- Decisiones ya tomadas
- Álbum de momentos (tarea 7.7)
- Plan de trabajo
- Estado actual del proyecto
- Diseño visual de la página
- steps
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- publicar
- Plan de trabajo
- generar_web.py
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- dia
- limpio
- Plan del proyecto (PLAN.md)
- Resultado de las pruebas reales de fuentes (12 nov 2026)
- sincronizar_datos.ps1
- cargar
- Hoteles
- dibujar
- probar_recarga.py
- Diseño Miami con dos estilos (Miami 2026 y Miami años 80)
- Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/)
- Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY)
- fuentes.py
- marcas.py
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- trends_extra.py
- panel.js
- lista.py
- json
- publicar.py
- fuentes.py
- probar_fuentes.py
- filtro-videos.js
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- revisar.py
- Plan de trabajo
- Plan del proyecto: recuerdo del lanzamiento de GTA 6
- pintarBarra
- probar_marcas.py
- servidor.py
- sys
- youtube_tendencias
- gota
- hacer_compartir.py
- Tareas que faltan
- abrir
- Estado actual del proyecto
- probar_panel.py
- manejador
- probar_saltos.py
- inicio.js
- Falla

## God Nodes (most connected - your core abstractions)
1. `Falla` - 26 edges
2. `pintar()` - 25 edges
3. `dia()` - 23 edges
4. `Hoteles` - 23 edges
5. `pintarRecords()` - 21 edges
6. `limpio()` - 19 edges
7. `pedir()` - 19 edges
8. `exigir()` - 18 edges
9. `hora()` - 17 edges
10. `partes()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `Pendiente` --references--> `partes()`  [INFERRED]
  historial/ESTADO_2026-11-17.md → web/app.js
- `Fase 1 — Recolector funcionando (lo más importante)` --references--> `compacto()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-13.md → web/app.js
- `Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones (lo que queda)` --references--> `kick()`  [INFERRED]
  historial/PLAN_DE_TRABAJO_2026-11-16.md → recolector/fuentes.py
- `Antes o justo después del lanzamiento` --references--> `gota()`  [INFERRED]
  historial/PLAN_2026-11-17-2.md → web/app.js
- `Antes o justo después del lanzamiento` --references--> `gota()`  [INFERRED]
  historial/PLAN_2026-11-18-2.md → web/app.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Fuentes de datos probadas del recolector** — plan_fuente_twitch, plan_fuente_youtube, plan_fuente_google_trends, plan_fuente_estado_servidores, plan_fuente_titulares, plan_fuente_estado_rockstar [EXTRACTED 1.00]
- **Archivos y reglas del sistema de relevo entre sesiones** — claude_sistema_relevo, claude_fuentes_de_verdad, estado_actual_estado_actual, plan_plan_del_proyecto, claude_guardado_al_terminar_paso, claude_archivar_estado_actual [EXTRACTED 1.00]
- **Flujo de claves: crear en Twitch/YouTube y guardar en GitHub Secrets** — guia_claves_clave_twitch, guia_claves_clave_youtube, guia_claves_github_secrets, estado_actual_secretos_github, claude_claves_fuera_del_repo [INFERRED 0.85]
- **Garantías de no inventar datos al guardar mediciones** — recolector_leeme_hueco, recolector_leeme_comprobaciones, recolector_leeme_formato_linea_jsonl, recolector_leeme_interruptor [INFERRED 0.85]
- **Implementación de los dos estilos de Miami** — plan_diseno_miami_dos_estilos, web_index_escena_80, web_index_escena_26, web_index_boton_cambio_estilo, web_index_simbolo_edificios, web_index_simbolo_palmera [INFERRED 0.95]

## Communities (82 total, 18 thin omitted)

### Community 0 - "Despertador y plan de trabajo"
Cohesion: 0.09
Nodes (28): Apagarlo, Comprobar que funciona, Cron Trigger 7,37 * * * * (UTC), Despertador del recolector (Cloudflare), Secreto GITHUB_TOKEN (solo Actions: Read and write, caduca 31 ene 2027), Montar el despertador (pasos en el navegador), Montarlo (lo hace Bruno en el navegador; no hace falta instalar nada), Semana del lanzamiento (SEMANA_INICIO / SEMANA_FIN) (+20 more)

### Community 1 - "poner"
Cohesion: 0.25
Nodes (7): aplicar(), claveDia(), flechasShorts(), nombreDia(), pintarFiltro(), poner(), preparar()

### Community 2 - "Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)"
Cohesion: 0.13
Nodes (16): Skill Impeccable (.claude/skills/impeccable/), Dónde quedamos (2026-11-13), Eje del gráfico de Twitch con números redondos, Fase 1 terminada (tareas 1.1 a 1.7), Secreto GITHUB_TOKEN del Worker (caduca 31 ene 2027 o ~1 mar 2027, por verificar), Pendiente (fase 2 de PLAN_DE_TRABAJO, verificar Worker, hook Impeccable), Pendiente de Bruno: borrar referencia del PR #1 y activar correo privado, recolectar.yml sin schedule (solo despertador o manual) (+8 more)

### Community 3 - "Estado actual del proyecto (ESTADO_ACTUAL.md)"
Cohesion: 0.15
Nodes (8): Línea de estado .claude/hooks/estado-git.sh, .gitattributes fuerza LF en los .sh, Instrucciones para Claude (CLAUDE.md), Repositorio GitHub público Rust-max-bot/Documentaci-n-Gta-6-19-de-nombiembre (rama main), Hook Stop .claude/hooks/revisar-guardado.sh, Estado actual del proyecto (ESTADO_ACTUAL.md), Reglas en pausa: ninguna; tanda actual: ninguna, Últimos cambios

### Community 4 - "steps"
Cohesion: 0.07
Nodes (27): concurrency, cancel-in-progress, group, previa, jobs, trends_extra, name, on (+19 more)

### Community 5 - "medir_carga.py"
Cohesion: 0.15
Nodes (5): copiar_web(), _Cuerpo, main(), medir_una(), Servidor

### Community 6 - "Workflow Recolectar datos"
Cohesion: 0.08
Nodes (24): concurrency, cancel-in-progress, group, KICK_CLIENT_ID, KICK_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY (+16 more)

### Community 7 - "Workflow Probar fuentes"
Cohesion: 0.07
Nodes (32): KICK_CLIENT_ID, KICK_CLIENT_SECRET, TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY, solo_trends_extra, jobs, probar (+24 more)

### Community 8 - "app.js"
Cohesion: 0.08
Nodes (42): abrir(), abrirMenu(), ahora(), alMover(), alSalir(), auto(), contar(), cuenta() (+34 more)

### Community 9 - "trends_extra.py"
Cohesion: 0.21
Nodes (20): comprobar(), comprobar_serie(), a_fecha(), es_entero(), es_iso(), exigir(), Invalida, _kick() (+12 more)

### Community 10 - "Trabajar con Claude en la nube"
Cohesion: 0.40
Nodes (4): Antes de empezar, Cómo ver lo que hace, Qué escribirle, Trabajar con Claude en la nube

### Community 11 - "Worker del despertador"
Cohesion: 0.31
Nodes (8): despertar(), fetch(), scheduled(), SEMANA_FIN, SEMANA_INICIO, tocaMedir(), TRENDS_FIN, TRENDS_INICIO

### Community 23 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.15
Nodes (12): Antes o justo después del lanzamiento, Cómo se usa este archivo, Decisiones vigentes, Después del lanzamiento, Estructura de carpetas, Fase 10 — Panel de control de videos (después del lanzamiento), Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan (+4 more)

### Community 24 - "Decisiones ya tomadas"
Cohesion: 0.15
Nodes (10): Listas de la página con lo más nuevo arriba, Criterios para saber si salió bien, Decisiones ya tomadas, Eventos de la línea de tiempo: automáticos y escritos a mano, Formato window.DATOS igual a window.DATOS_EJEMPLO, Orden de las listas: lo más nuevo arriba (2026-11-13), Tecnología: Python recolecta, HTML/CSS/JS forman la página, Visibilidad de la página: privada, se abre como archivo en el PC (+2 more)

### Community 25 - "Álbum de momentos (tarea 7.7)"
Cohesion: 0.50
Nodes (3): Cuidado, Cómo subir una foto, Álbum de momentos (tarea 7.7)

### Community 27 - "Plan de trabajo"
Cohesion: 0.17
Nodes (11): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 0 — Claves y fuentes, Fase 1 — Recolector funcionando (lo más importante), Fase 2 — Mejoras rápidas, Fase 3 — Mejoras medianas, Fase 4 — Mejoras largas, Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable (+3 more)

### Community 28 - "Estado actual del proyecto"
Cohesion: 0.33
Nodes (5): Cómo usar este archivo, Dónde quedamos, Estado actual del proyecto, Pendiente, Últimos cambios

### Community 30 - "Diseño visual de la página"
Cohesion: 0.11
Nodes (19): 1. Qué es la página, 2. Reglas que cualquier sugerencia tiene que respetar, 3. Estructura de la página, de arriba abajo, 4. Los dos estilos, 4b. Los hoteles de la portada (rediseño del 2026-11-17), 5. Día, atardecer y noche, 6. La "hora cero" (el momento del lanzamiento), 7. Letras, colores y medidas (+11 more)

### Community 31 - "steps"
Cohesion: 0.11
Nodes (18): KICK_CLIENT_ID, KICK_CLIENT_SECRET, jobs, probar, name, on, workflow_dispatch, permissions (+10 more)

### Community 32 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.12
Nodes (16): 10. Criterios para saber si salió bien, 1. Qué es esto, 2. Decisiones ya tomadas, 3. Qué se descartó y por qué, 4. Fases del proyecto, 5. Qué se mide en cada fuente, 6. Riesgos conocidos, 7. Decisiones pendientes (+8 more)

### Community 33 - "publicar"
Cohesion: 0.05
Nodes (38): concurrency, cancel-in-progress, group, name, url, jobs, preparar, publicar (+30 more)

### Community 34 - "Plan de trabajo"
Cohesion: 0.17
Nodes (11): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 2 — Mejoras rápidas (lo que queda), Fase 4 — Mejoras largas (lo que queda), Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones (lo que queda), Fase 7 — Ideas para que la página sea memorable (lo que queda), Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan (+3 more)

### Community 35 - "generar_web.py"
Cohesion: 0.05
Nodes (39): Decisiones (Bruno, 2026-11-18), Panel de control de videos (Fase 10), Para después, Para qué sirve, Partes (cada una termina usable y verificada, nunca a medias), Requisitos técnicos (revisión a favor y en contra, 2026-11-18), abortar(), armar_comparacion() (+31 more)

### Community 36 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.18
Nodes (10): Cómo se usa este archivo, Datos y recolección, Decisiones vigentes, Estructura de carpetas, Fechas que mandan, Lo ya hecho (detalle en `historial/` y en `git log`), Plan del proyecto: recuerdo del lanzamiento de GTA 6, Página (+2 more)

### Community 37 - "dia"
Cohesion: 0.13
Nodes (23): clase(), contarFichas(), paso(), dia(), estado(), estadoRev(), filaRockstar(), mover() (+15 more)

### Community 38 - "limpio"
Cohesion: 0.11
Nodes (33): armar(), barrasKick(), cuenta(), juego(), cifra(), cinta(), compacto(), contenido() (+25 more)

### Community 39 - "Plan del proyecto (PLAN.md)"
Cohesion: 0.16
Nodes (13): Fecha límite: recolector funcionando antes del 18 nov 2026, Lista de deseos de Bruno (2026-11-12), D6 cortado, Fase 1: en tiempo real (18 al 20 nov), Fase 2: búsqueda calmada (historial, memes, ventas), Fuente Google Trends (método no oficial en tres pasos con cookie), Fuente YouTube (search 100 unidades, videos 1, de 10.000 diarias), Plan del proyecto (PLAN.md), Recuerdo del lanzamiento de GTA 6 (19 nov 2026): página con línea de tiempo y tablas (+5 more)

### Community 40 - "Resultado de las pruebas reales de fuentes (12 nov 2026)"
Cohesion: 0.24
Nodes (10): Entorno de nube recuerdo-gta6, Workflow Probar fuentes (recolector/probar_fuentes.py), Estado de Rockstar: no funciona (se anota a mano), Fuente estado de servidores (PlayStation y Xbox funcionan), Fuente titulares de Google Noticias (RSS), Fuente Twitch (categoría Grand Theft Auto VI, id 1867279146, helix/streams), Resultado de las pruebas reales de fuentes (12 nov 2026), Gráfico espectadores Twitch (#g-twitch) (+2 more)

### Community 42 - "cargar"
Cohesion: 0.29
Nodes (8): cargar(), cargarScript(), diaUTC(), isoDe(), maximoEn(), ultimosHasta(), videoEn(), vista()

### Community 43 - "Hoteles"
Cohesion: 0.07
Nodes (17): antena(), bezier(), bloque(), caseta(), Dibujo, Hoteles, junta(), main() (+9 more)

### Community 44 - "dibujar"
Cohesion: 0.11
Nodes (25): aPantalla(), clave(), conLetras(), cuadro(), cuadrosImagen(), deSantiago(), desfase(), dibujar() (+17 more)

### Community 45 - "probar_recarga.py"
Cohesion: 0.23
Nodes (6): Callado, caso(), ignorable(), ir(), main(), Servidor

### Community 46 - "Diseño Miami con dos estilos (Miami 2026 y Miami años 80)"
Cohesion: 0.24
Nodes (8): Diseño Miami con dos estilos (Miami 2026 y Miami años 80), Tipografías Google Fonts: Monoton, Rajdhani, Limelight y Outfit, Botón de cambio de estilo (data-poner), Escena Miami actual, Escena Miami años 80, web/index.html (página del recuerdo), Símbolo SVG edificios art déco, Símbolo SVG palmera

### Community 47 - "Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/)"
Cohesion: 0.29
Nodes (5): recolector/interruptor.json (apagar, encender o alargar; hasta 19 dic), ver_pagina.bat (trae mediciones, prepara web/datos.js y abre la página), Estructura de carpetas (web/, recolector/, datos/, .github/workflows/, despertador/), Periodo de un mes hasta el 19 dic 2026 con interruptor manual, web/datos.js generado por recolector/generar_web.py (no va a git)

### Community 48 - "Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY)"
Cohesion: 0.43
Nodes (5): Secretos de GitHub TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY guardados, Clave de Twitch (Client ID y Client Secret, dev.twitch.tv), Clave de API de YouTube Data API v3 (Google Cloud), Guardar claves en GitHub Secrets (TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, YOUTUBE_API_KEY), Guía para crear las claves de Twitch y YouTube

### Community 49 - "fuentes.py"
Cohesion: 0.13
Nodes (13): Lo ya hecho (detalle en `historial/PLAN_2026-11-18.md`, los anteriores y `git log`), Lo ya hecho (detalle en `historial/PLAN_2026-11-18-2.md`, los anteriores y `git log`), Lo ya hecho (detalle en `historial/PLAN_2026-11-18-3.md`, los anteriores y `git log`), _cabeceras_kick(), _cabeceras_twitch(), _foto_kick(), _fotos_de_perfil(), kick() (+5 more)

### Community 50 - "marcas.py"
Cohesion: 0.16
Nodes (10): _codigo(), _configuraciones(), desconocidos(), _fecha(), leer(), leer_todo(), MarcasMal, sin_repetidos() (+2 more)

### Community 51 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.18
Nodes (10): Cómo se usa este archivo, Datos y recolección, Decisiones vigentes, Estructura de carpetas, Fechas que mandan, Lo ya hecho (detalle en `historial/PLAN_2026-11-17.md` y en `git log`), Plan del proyecto: recuerdo del lanzamiento de GTA 6, Página (+2 more)

### Community 52 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.17
Nodes (11): Cómo se usa este archivo, Decisiones vigentes, Después del lanzamiento, Fase 10 — Panel de control de videos, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan, Ideas para después, sin fecha, Lo ya hecho (detalle en `historial/` y `git log`) (+3 more)

### Community 53 - "trends_extra.py"
Cohesion: 0.20
Nodes (9): a_iso(), abortar(), main(), paises(), preguntar(), relacionadas(), serie(), Trends (+1 more)

### Community 54 - "panel.js"
Cohesion: 0.13
Nodes (32): api(), aviso(), bien(), cambiado(), cambios(), cargar(), confsCambiadas(), copia() (+24 more)

### Community 55 - "lista.py"
Cohesion: 0.22
Nodes (4): armar(), conocidos(), descartados(), leer_todo()

### Community 57 - "json"
Cohesion: 0.29
Nodes (7): _segundos(), abortar(), leer_estado(), leer_interruptor(), main(), mensaje_seguro(), resumen()

### Community 58 - "publicar.py"
Cohesion: 0.17
Nodes (12): contenido_completo(), descartar_borrador(), git(), guardar_borrador(), leer_borrador(), NoSePudo, por_subir(), publicar() (+4 more)

### Community 59 - "fuentes.py"
Cohesion: 0.23
Nodes (9): Dónde quedamos, Diseño de la página, _datos_video(), _mensaje_youtube(), _toca_buscar(), youtube(), youtube_es(), youtube_largos() (+1 more)

### Community 61 - "filtro-videos.js"
Cohesion: 0.20
Nodes (5): lista(), montarUI(), alertaSin(), elegir(), oculto()

### Community 62 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.15
Nodes (12): Antes o justo después del lanzamiento, Cómo se usa este archivo, Decisiones vigentes, Después del lanzamiento, Estructura de carpetas, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan, Ideas para después, sin fecha (+4 more)

### Community 63 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.17
Nodes (11): Antes o justo después del lanzamiento, Cómo se usa este archivo, Decisiones vigentes, Después del lanzamiento, Estructura de carpetas, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan, Ideas para después, sin fecha (+3 more)

### Community 64 - "revisar.py"
Cohesion: 0.21
Nodes (7): codigo(), fecha(), hueco(), main(), resumen_huecos(), revisar_turnos(), turnos()

### Community 65 - "Plan de trabajo"
Cohesion: 0.20
Nodes (9): Avisos para Bruno (cosas donde su idea tiene un límite o un fallo), Fase 2 — Mejoras rápidas (lo que queda), Fase 4 — Mejoras largas (lo que queda), Fase 5 — Lo que ya estaba acordado para después del lanzamiento, Fase 7 — Ideas para que la página sea memorable, Fechas que mandan, Lo ya hecho (detalle en el historial), Plan de trabajo (+1 more)

### Community 66 - "Plan del proyecto: recuerdo del lanzamiento de GTA 6"
Cohesion: 0.15
Nodes (12): Antes o justo después del lanzamiento, Cómo se usa este archivo, Decisiones vigentes, Después del lanzamiento, Estructura de carpetas, Fase 10 — Panel de control de videos (después del lanzamiento), Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Fechas que mandan (+4 more)

### Community 67 - "pintarBarra"
Cohesion: 0.22
Nodes (7): activar(), enChile(), horaLocal(), medirBarra(), pintarBarra(), pintarPulso(), primeroDesde()

### Community 68 - "probar_marcas.py"
Cohesion: 0.18
Nodes (6): comprobar(), con_archivo(), con_marcas(), de_tipo(), ids(), rechaza()

### Community 69 - "servidor.py"
Cohesion: 0.19
Nodes (3): arrancar(), main(), Panel

### Community 71 - "youtube_tendencias"
Cohesion: 0.29
Nodes (4): Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, Fase 6 — Ideas nuevas de Bruno: más estadísticas, logros y comparaciones, twitch_ranking(), youtube_tendencias()

### Community 72 - "gota"
Cohesion: 0.27
Nodes (10): Antes o justo después del lanzamiento, Después del lanzamiento, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Ideas para después, sin fecha, Tareas que faltan, Antes o justo después del lanzamiento, gota(), actualizar() (+2 more)

### Community 73 - "hacer_compartir.py"
Cohesion: 0.26
Nodes (5): escena(), hacer(), main(), titulo(), main()

### Community 74 - "Tareas que faltan"
Cohesion: 0.40
Nodes (5): Antes o justo después del lanzamiento, Después del lanzamiento, Fase 8 — Segundo lanzamiento: GTA 6 en PC (dormida), Ideas para después, sin fecha, Tareas que faltan

### Community 75 - "abrir"
Cohesion: 0.29
Nodes (5): abrir(), preparar_salida(), main(), main(), recorrer()

### Community 76 - "Estado actual del proyecto"
Cohesion: 0.40
Nodes (4): Cómo usar este archivo, Estado actual del proyecto, Pendiente, Últimos cambios

### Community 77 - "probar_panel.py"
Cohesion: 0.31
Nodes (4): git(), otra_copia(), pedir(), repositorio_falso()

### Community 78 - "manejador"
Cohesion: 0.57
Nodes (7): manejador(), do_GET(), do_POST(), error(), leer_crudo(), permitido(), responder()

### Community 79 - "probar_saltos.py"
Cohesion: 0.39
Nodes (5): ancla(), main(), menu(), preparar(), subir()

### Community 81 - "Falla"
Cohesion: 0.16
Nodes (8): noticias(), _serie_trends(), trends(), _Trends429, xbox(), main(), Falla, pedir()

## Knowledge Gaps
- **31 isolated node(s):** `Estilos visuales Miami 1986 y Miami 2026`, `Enlaces y miniaturas guardados (tareas 2.1 y 2.2)`, `Series continuas de YouTube (25 más vistos + re-medición)`, `Aviso legal (proyecto de fans, no afiliado a Rockstar/Take-Two)`, `Python 3.14 para Graphify (no desinstalar)` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 495 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Diseño de la página` connect `fuentes.py` to `Plan del proyecto: recuerdo del lanzamiento de GTA 6`, `limpio`?**
  _High betweenness centrality (0.175) - this node is a cross-community bridge._
- **What connects `Estilos visuales Miami 1986 y Miami 2026`, `Enlaces y miniaturas guardados (tareas 2.1 y 2.2)`, `Series continuas de YouTube (25 más vistos + re-medición)` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Despertador y plan de trabajo` be split into smaller, more focused modules?**
  _Cohesion score 0.08817204301075268 - nodes in this community are weakly interconnected._
- **Why does `limpio()` connect `limpio` to `app.js`, `poner`, `fuentes.py`, `dibujar`?**
  _High betweenness centrality (0.169) - this node is a cross-community bridge._
- **Should `Worker de Cloudflare despertador-recolector (horario 7,37 * * * *)` be split into smaller, more focused modules?**
  _Cohesion score 0.1286549707602339 - nodes in this community are weakly interconnected._
- **Why does `partes()` connect `dibujar` to `poner`, `Plan del proyecto: recuerdo del lanzamiento de GTA 6`, `dia`, `limpio`, `gota`, `app.js`, `Tareas que faltan`, `Estado actual del proyecto`, `Plan del proyecto: recuerdo del lanzamiento de GTA 6`, `Plan del proyecto: recuerdo del lanzamiento de GTA 6`, `Plan del proyecto: recuerdo del lanzamiento de GTA 6`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `steps` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._