@echo off
setlocal

set "PROJECT_DIR=C:\Users\Edwyn\OneDrive\Documentos\New project\orgtalsigth-app"
set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"

echo.
echo SIGTH_ORGTAL - Activacion de Git
echo ================================
echo.

if not exist "%GIT_EXE%" (
  echo No se encontro Git en: %GIT_EXE%
  echo Revisa que Git para Windows x64 este instalado.
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"

if not exist ".git" (
  echo Creando repositorio Git...
  "%GIT_EXE%" init
)

set "GIT_AUTHOR_NAME=Edwyn Lopez"
set "GIT_AUTHOR_EMAIL=edwyn.lopez@orgtalsigth.local"
set "GIT_COMMITTER_NAME=Edwyn Lopez"
set "GIT_COMMITTER_EMAIL=edwyn.lopez@orgtalsigth.local"

echo.
echo Preparando archivos del proyecto...
"%GIT_EXE%" add .
if errorlevel 1 (
  echo.
  echo No se pudieron preparar los archivos.
  echo Cierra OneDrive temporalmente o ejecuta este archivo como administrador.
  pause
  exit /b 1
)

echo.
echo Creando version guardada...
"%GIT_EXE%" commit -m "Prepara publicacion web de SIGTH_ORGTAL"
if errorlevel 1 (
  echo.
  echo No se creo commit. Puede que no haya cambios nuevos o falte algun dato de Git.
  "%GIT_EXE%" status
  pause
  exit /b 1
)

echo.
echo Listo. Git quedo activo y con la version actual guardada.
"%GIT_EXE%" status
pause
