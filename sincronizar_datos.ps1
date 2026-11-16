# Sincroniza este PC con GitHub sin perder nada (pedido de Bruno, 2026-11-16).
#
# GitHub guarda una medición cada hora en datos/. Este programa las trae al PC solo, cada 30
# minutos, con una tarea de Windows. Reglas para no perder ni chocar con nada:
#   - Solo avanza "hacia adelante" (fast-forward): nunca reescribe ni borra commits.
#   - Si hay commits del PC sin subir, no toca nada: los sube la próxima sesión de trabajo
#     (git pull --rebase y push, como dice CLAUDE.md) y entonces llegan los datos.
#   - Si hay archivos cambiados sin guardar, los aparta un momento y los vuelve a poner
#     (--autostash). Si no se pudieran volver a poner, quedan guardados en "git stash list".
#   - Si git está ocupado (otra operación a medias) o no hay internet, espera a la próxima vez.
#   - Después rehace web/datos.js para que la página del PC muestre lo último.
# Lo que hace queda anotado en %LOCALAPPDATA%\recuerdo-gta6\sincronizar.log (fuera del repositorio).
#
# Uso:  powershell -ExecutionPolicy Bypass -File sincronizar_datos.ps1            (una vez)
#       powershell -ExecutionPolicy Bypass -File sincronizar_datos.ps1 -Instalar  (crea la tarea)
#       powershell -ExecutionPolicy Bypass -File sincronizar_datos.ps1 -Quitar    (borra la tarea)
param([switch]$Instalar, [switch]$Quitar)

$TAREA = "Recuerdo GTA 6 - sincronizar datos"
$carpetaLog = Join-Path $env:LOCALAPPDATA "recuerdo-gta6"
$log = Join-Path $carpetaLog "sincronizar.log"
New-Item -ItemType Directory -Force $carpetaLog | Out-Null
function Anotar([string]$t) { Add-Content -Path $log -Value ("{0:yyyy-MM-dd HH:mm:ss}  {1}" -f (Get-Date), $t) -Encoding utf8 }

if ($Quitar) {
    Unregister-ScheduledTask -TaskName $TAREA -Confirm:$false -ErrorAction SilentlyContinue
    Write-Output "Tarea '$TAREA' quitada."
    exit 0
}
if ($Instalar) {
    $accion = New-ScheduledTaskAction -Execute "powershell.exe" `
        -Argument ('-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{0}"' -f $PSCommandPath)
    # Cada 30 minutos, a los :15 y :45 (las mediciones se guardan a los :07 y, del 17 al 21 nov, a los :37).
    $inicio = (Get-Date).Date.AddMinutes(15)
    $disparo = New-ScheduledTaskTrigger -Once -At $inicio -RepetitionInterval (New-TimeSpan -Minutes 30)
    $ajustes = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries `
        -ExecutionTimeLimit (New-TimeSpan -Minutes 10) -MultipleInstances IgnoreNew
    Register-ScheduledTask -TaskName $TAREA -Action $accion -Trigger $disparo -Settings $ajustes `
        -Description "Trae de GitHub las mediciones nuevas del proyecto Recuerdo GTA 6 (solo avanza, nunca borra)." -Force | Out-Null
    Write-Output "Tarea '$TAREA' creada: cada 30 minutos. Registro en $log"
    exit 0
}

Set-Location $PSScriptRoot
$git = Join-Path $PSScriptRoot ".git"
if ((Test-Path "$git\index.lock") -or (Test-Path "$git\rebase-merge") -or (Test-Path "$git\rebase-apply") -or (Test-Path "$git\MERGE_HEAD")) {
    Anotar "git está ocupado con otra operación: se intenta la próxima vez."; exit 0
}
$rama = (git rev-parse --abbrev-ref HEAD).Trim()
if ($rama -ne "main") { Anotar "el PC está en la rama '$rama', no en main: no se toca nada."; exit 0 }

git fetch --quiet origin main 2>$null
if ($LASTEXITCODE -ne 0) { Anotar "no se pudo consultar GitHub (¿sin internet?)."; exit 0 }

$atras = [int](git rev-list --count HEAD..origin/main)
$adelante = [int](git rev-list --count origin/main..HEAD)
if ($atras -eq 0) { exit 0 }   # ya está al día: no se anota nada
if ($adelante -gt 0) {
    Anotar "hay $adelante commit(s) del PC sin subir y $atras nuevo(s) en GitHub: no se toca nada (se unen al guardar el trabajo)."
    exit 0
}

$salida = git merge --ff-only --autostash origin/main 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) {
    Anotar ("no se pudo avanzar sin riesgo; no se cambió nada. Git dijo: " + $salida.Trim())
    exit 0
}
if ($salida -match "conflict|conflicto") {
    Anotar "se trajeron $atras commit(s), pero los cambios sin guardar del PC no se pudieron volver a poner: están a salvo en 'git stash list'."
} else {
    Anotar "se trajeron $atras commit(s) de GitHub."
}

# Que la página del PC muestre lo último (si falla, la página sigue con los datos anteriores).
python recolector\generar_web.py *> $null
if ($LASTEXITCODE -ne 0) { Anotar "aviso: no se pudo rehacer web/datos.js (la página usa los datos anteriores)." }
