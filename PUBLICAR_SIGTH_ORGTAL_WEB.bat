@echo off
setlocal

set "PROJECT_DIR=C:\Users\Edwyn\OneDrive\Documentos\New project\orgtalsigth-app"
set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"

echo.
echo SIGTH_ORGTAL - Publicacion web
echo ==============================
echo.

if not exist "%GIT_EXE%" (
  echo No se encontro Git en: %GIT_EXE%
  echo Instala Git para Windows x64 y vuelve a intentarlo.
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%"

echo Revisando archivos del proyecto...
"%GIT_EXE%" status --short
echo.

echo Guardando version actual en Git...
"%GIT_EXE%" add .
if errorlevel 1 (
  echo.
  echo No se pudieron preparar los archivos.
  echo Sugerencia: cierra OneDrive temporalmente o ejecuta este archivo como administrador.
  pause
  exit /b 1
)

"%GIT_EXE%" commit -m "Prepara publicacion web de SIGTH_ORGTAL"
if errorlevel 1 (
  echo.
  echo No se creo un commit nuevo. Si Git dice que no hay cambios, puedes continuar.
)

echo.
echo Ahora pega aqui la URL del repositorio GitHub.
echo Ejemplo: https://github.com/TU_USUARIO/sigth_orgtal.git
echo.
set /p REPO_URL=URL de GitHub: 

if "%REPO_URL%"=="" (
  echo.
  echo No se agrego repositorio remoto. Crea el repositorio en GitHub y vuelve a ejecutar este archivo.
  pause
  exit /b 0
)

"%GIT_EXE%" remote remove origin >nul 2>nul
"%GIT_EXE%" remote add origin "%REPO_URL%"
"%GIT_EXE%" branch -M main

echo.
echo Subiendo SIGTH_ORGTAL a GitHub...
"%GIT_EXE%" push -u origin main
if errorlevel 1 (
  echo.
  echo No se pudo subir a GitHub.
  echo Revisa que el repositorio exista y que hayas iniciado sesion en Git.
  pause
  exit /b 1
)

echo.
echo Listo. SIGTH_ORGTAL quedo subido a GitHub.
echo Siguiente paso: entra a Vercel e importa ese repositorio.
pause
