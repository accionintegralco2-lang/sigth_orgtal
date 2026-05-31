@echo off
setlocal

set "SOURCE_DIR=C:\Users\Edwyn\OneDrive\Documentos\New project\orgtalsigth-app"
set "TARGET_PARENT=C:\Desarrollo"
set "TARGET_DIR=C:\Desarrollo\SIGTH_ORGTAL"

echo.
echo SIGTH_ORGTAL - Mover fuera de OneDrive
echo =====================================
echo.
echo Recomendado: pausa OneDrive antes de ejecutar este archivo.
echo.

if not exist "%TARGET_PARENT%" mkdir "%TARGET_PARENT%"

if exist "%TARGET_DIR%" (
  echo Ya existe:
  echo %TARGET_DIR%
  echo Cambia el nombre o elimina esa carpeta si quieres volver a copiar.
  pause
  exit /b 1
)

echo Copiando proyecto sin node_modules, .next ni cache...
robocopy "%SOURCE_DIR%" "%TARGET_DIR%" /E /XD ".git" ".next" "node_modules" ".npm-cache" "_PUBLICAR_SIGTH_ORGTAL_WEB" /XF "SIGTH_ORGTAL_WEB_PUBLICAR.zip" "tsconfig.tsbuildinfo"

echo.
echo Creando Git limpio en la nueva ubicacion...
cd /d "%TARGET_DIR%"
"C:\Program Files\Git\cmd\git.exe" init
"C:\Program Files\Git\cmd\git.exe" add .
"C:\Program Files\Git\cmd\git.exe" commit -m "Version web inicial de SIGTH_ORGTAL"

echo.
echo Listo. Nueva carpeta:
echo %TARGET_DIR%
echo.
echo Abriendo carpeta nueva...
start "" "%TARGET_DIR%"
pause
