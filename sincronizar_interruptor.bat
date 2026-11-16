@echo off
rem Doble clic aqui para APAGAR o ENCENDER la sincronizacion automatica de los datos
rem (la tarea "Recuerdo GTA 6 - sincronizar datos"). Si esta encendida la apaga, y al reves.
rem No borra nada: apagada, los datos se siguen guardando en GitHub y llegan al PC al encenderla
rem o al abrir ver_pagina.bat.
chcp 65001 >nul
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0sincronizar_datos.ps1" -Alternar
echo.
pause
