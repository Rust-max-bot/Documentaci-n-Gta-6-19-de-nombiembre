#!/bin/bash
# Linea de estado de Claude Code: dice si el trabajo esta guardado (commit) y subido (push).
# Solo lee git; no cambia nada. No hace `git fetch` (seria lento en cada refresco):
# compara contra lo ultimo que se sabe de GitHub, que se actualiza con cada push.
cat >/dev/null
cd "$(dirname "$0")/../.." 2>/dev/null || exit 0

sucios=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
sin_subir=$(git rev-list --count '@{u}..HEAD' 2>/dev/null || echo 0)

if [ "$sucios" -gt 0 ]; then
    echo "● $sucios archivo(s) sin guardar en git"
elif [ "$sin_subir" -gt 0 ]; then
    echo "↑ $sin_subir commit(s) sin subir a GitHub"
else
    echo "✓ Todo guardado y subido a GitHub"
fi
