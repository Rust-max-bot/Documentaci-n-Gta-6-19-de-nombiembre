@echo off
rem Doble clic aqui para ver la pagina con los datos mas recientes:
rem 1) trae de GitHub las mediciones nuevas, 2) prepara web\datos.js, 3) abre la pagina.
chcp 65001 >nul
cd /d "%~dp0"
echo Trayendo las mediciones nuevas de GitHub...
git pull --quiet
if errorlevel 1 echo (No se pudieron traer las novedades: se usa lo que ya hay en el PC.)
echo Preparando los datos de la pagina...
python recolector\generar_web.py
if errorlevel 1 (
  echo.
  echo Algo fallo al preparar los datos. La pagina se abre con los datos anteriores.
  pause
)
start "" "web\index.html"
