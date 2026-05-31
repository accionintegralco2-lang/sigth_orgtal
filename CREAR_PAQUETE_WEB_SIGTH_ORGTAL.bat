@echo off
setlocal

set "PROJECT_DIR=C:\Users\Edwyn\OneDrive\Documentos\New project\orgtalsigth-app"
set "PACKAGE_DIR=%PROJECT_DIR%\_PUBLICAR_SIGTH_ORGTAL_WEB"
set "ZIP_FILE=%PROJECT_DIR%\SIGTH_ORGTAL_WEB_PUBLICAR.zip"

echo.
echo SIGTH_ORGTAL - Crear paquete web
echo =================================
echo.

if exist "%PACKAGE_DIR%" (
  echo Limpiando paquete anterior...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -LiteralPath '%PACKAGE_DIR%' -Recurse -Force"
)

if exist "%ZIP_FILE%" (
  echo Eliminando ZIP anterior...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -LiteralPath '%ZIP_FILE%' -Force"
)

echo Copiando archivos necesarios...
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$source='%PROJECT_DIR%'; $dest='%PACKAGE_DIR%';" ^
  "New-Item -ItemType Directory -Path $dest | Out-Null;" ^
  "$exclude=@('.git','.next','node_modules','.npm-cache','tsconfig.tsbuildinfo','_PUBLICAR_SIGTH_ORGTAL_WEB','SIGTH_ORGTAL_WEB_PUBLICAR.zip');" ^
  "Get-ChildItem -LiteralPath $source -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $dest -Recurse -Force }"

if errorlevel 1 (
  echo.
  echo No se pudo crear la carpeta limpia.
  pause
  exit /b 1
)

echo Creando archivo ZIP...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '%PACKAGE_DIR%\*' -DestinationPath '%ZIP_FILE%' -Force"

if errorlevel 1 (
  echo.
  echo No se pudo crear el ZIP.
  pause
  exit /b 1
)

echo.
echo Listo. Se creo:
echo %ZIP_FILE%
echo.
echo Puedes subir ese ZIP o la carpeta _PUBLICAR_SIGTH_ORGTAL_WEB a GitHub.
pause
