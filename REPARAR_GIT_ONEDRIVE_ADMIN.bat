@echo off
setlocal

set "PROJECT_DIR=C:\Users\Edwyn\OneDrive\Documentos\New project\orgtalsigth-app"
set "GIT_DIR=%PROJECT_DIR%\.git"
set "DENY_SID=S-1-5-21-3106375840-3568315950-3711601858-1403355842"

echo.
echo SIGTH_ORGTAL - Reparar permisos de Git
echo ======================================
echo.
echo IMPORTANTE: ejecuta este archivo como Administrador.
echo.

if not exist "%GIT_DIR%" (
  echo No se encontro la carpeta .git en:
  echo %GIT_DIR%
  pause
  exit /b 1
)

echo Eliminando archivo de bloqueo si existe...
if exist "%GIT_DIR%\index.lock" del /f /q "%GIT_DIR%\index.lock"

echo.
echo Quitando solo lectura...
attrib -R "%GIT_DIR%" /S /D

echo.
echo Intentando quitar regla DENY que bloquea escritura...
icacls "%GIT_DIR%" /remove:d "%DENY_SID%" /T

echo.
echo Dando control total al usuario actual...
icacls "%GIT_DIR%" /grant "%USERNAME%":(OI)(CI)F /T
icacls "%PROJECT_DIR%" /grant "%USERNAME%":(OI)(CI)F /T

echo.
echo Estado final de permisos:
icacls "%GIT_DIR%"

echo.
echo Probando Git...
cd /d "%PROJECT_DIR%"
"C:\Program Files\Git\cmd\git.exe" status --short

echo.
echo Si Git ya no muestra Permission denied, puedes ejecutar PUBLICAR_SIGTH_ORGTAL_WEB.bat.
pause
