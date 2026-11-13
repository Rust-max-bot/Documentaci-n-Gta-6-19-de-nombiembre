# Trabajar con Claude en la nube

Guía corta para Bruno: cómo lanzar una sesión de Claude Code en la nube (claude.ai/code) para
que siga con el trabajo del proyecto. Las reglas para Claude están en `CLAUDE.md`.

## Antes de empezar

1. En claude.ai/code, elegir este repositorio y el entorno **`recuerdo-gta6`** (deja pasar
   los sitios de las fuentes de datos; con "Default" se bloquean).
2. No hace falta instalar nada: al arrancar, `.claude/hooks/preparar-nube.sh` instala
   Playwright, Chromium y Graphify, y prepara los datos de la página. Lo primero que diga la
   sesión debe incluir qué quedó listo y qué falta.
3. No trabajar a la vez en el PC y en la nube sobre lo mismo (ver "Trabajar en la nube y en
   el PC" en `CLAUDE.md`).

## Qué escribirle

Un mensaje así (cambiando las tareas):

> Lee CLAUDE.md, ESTADO_ACTUAL.md y PLAN_DE_TRABAJO.md, resúmeme dónde quedamos y, cuando te
> confirme, haz la tanda de la 2.4 a la 3.3. Si una tarea necesita que yo decida algo,
> pregúntame con capturas y mientras tanto sigue con las tareas de la tanda que no dependan
> de esa decisión.

## Cómo ver lo que hace

- Cada paso terminado se guarda con un commit y se sube a GitHub, como en el PC.
- Si la nube no puede subir a `main`, trabaja en su propia rama y abre un *pull request*:
  hay que unirlo desde GitHub para que el cambio quede en `main`.
- Las capturas para decidir un diseño las sube a una rama `revision/...` y da los enlaces
  de GitHub para verlas (no van a `main`).
- Para ver la página con lo último: en el PC, doble clic en `ver_pagina.bat`.
