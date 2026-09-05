@echo off
REM Kill any running Java processes
taskkill /IM java.exe /F /T 2>nul
taskkill /IM javaw.exe /F /T 2>nul
timeout /t 5 /nobreak

REM Clear old database
del /Q ".\.data\*" 2>nul

REM Set local profile and start backend
setlocal enabledelayedexpansion
set "SPRING_PROFILES_ACTIVE=local"
call mvnw.cmd -q spring-boot:run

