@echo off
chcp 65001 >nul
title Сияние 40+ — сервер приложения
powershell.exe -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
