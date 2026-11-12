#!/bin/bash
# Hook "Stop" de Claude Code: red de seguridad para que ningun cambio quede sin guardar.
# Si al terminar una respuesta quedan archivos sin commit o commits sin push, no deja
# terminar y le recuerda a Claude la regla del proyecto. Solo avisa una vez por respuesta
# (stop_hook_active), para no entrar en un bucle si Claude tiene un motivo para no guardar.
# Tambien avisa si ESTADO_ACTUAL.md paso el limite de tamano y hay que archivarlo.
entrada=$(cat)
if echo "$entrada" | grep -q '"stop_hook_active" *: *true'; then
    exit 0
fi
cd "$(dirname "$0")/../.." 2>/dev/null || exit 0

LIMITE_ESTADO=20000
tam_estado=$(wc -c < ESTADO_ACTUAL.md 2>/dev/null | tr -d ' ')
tam_estado=${tam_estado:-0}
sucios=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
sin_subir=$(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)

aviso_estado=""
if [ "$tam_estado" -gt "$LIMITE_ESTADO" ]; then
    aviso_estado="ESTADO_ACTUAL.md mide $tam_estado bytes y el limite es $LIMITE_ESTADO. Archivalo segun CLAUDE.md, seccion 'Archivar ESTADO_ACTUAL.md': muevelo a historial/ y crea uno nuevo con lo esencial. "
fi

if [ "$sucios" -eq 0 ] && [ "$sin_subir" -eq 0 ]; then
    if [ -n "$aviso_estado" ]; then
        printf '{"decision":"block","reason":"%s"}\n' "$aviso_estado"
    fi
    exit 0
fi

motivo="${aviso_estado}Quedan $sucios archivo(s) sin commit y $sin_subir commit(s) sin subir. Regla del proyecto (CLAUDE.md, seccion 'Guardado al terminar cada paso'): al terminar un paso verificado, actualiza ESTADO_ACTUAL.md si cambio el estado o un pendiente, PLAN.md si hubo una decision y CLAUDE.md si cambio una regla; haz commit con un mensaje que explique que se hizo y por que; y haz push (git fetch antes, nunca --force). Si el paso no esta terminado porque esperas una decision de Bruno, dilo en tu respuesta y termina sin guardar."
printf '{"decision":"block","reason":"%s"}\n' "$motivo"
