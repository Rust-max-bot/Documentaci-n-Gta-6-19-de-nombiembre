@echo off
rem Doble clic aqui para abrir el panel de videos (Fase 10): marcar videos y publicar.
rem Solo funciona en este PC. Para cerrarlo, cierra esta ventana negra.
chcp 65001 >nul
cd /d "%~dp0"
title Panel de videos - cierra esta ventana para cerrar el panel
python panel\servidor.py
if errorlevel 1 (
  echo.
  echo El panel se cerro con un error. Copia lo de arriba y muestraselo a Claude.
  pause
)
