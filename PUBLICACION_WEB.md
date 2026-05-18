# Publicacion web de SIGTH_ORGTAL

Esta guia prepara la app para mostrarse a jueces y usuarios externos como una web publica.

## Objetivo

Publicar SIGTH_ORGTAL en internet con dos usos:

- Modo demostracion: datos piloto para jueces.
- Modo produccion: carga real de dependencias nuevas.

## Estado actual

La app ya esta preparada para publicarse como una web Next.js. Puede abrir en modo demostracion sin Supabase y tambien queda lista para conectar base de datos real cuando se configuren las variables.

En este PC puede aparecer `spawn EPERM` al ejecutar la construccion local, especialmente por permisos de Windows o sincronizacion de OneDrive. La compilacion de codigo ya fue validada con TypeScript; la publicacion recomendada debe hacerse en Vercel desde GitHub para evitar ese bloqueo local.

## Ruta recomendada

1. Guardar el proyecto en GitHub.
2. Crear un proyecto en Supabase.
3. Ejecutar `supabase/schema.sql` en Supabase.
4. Crear el bucket `evidencias`.
5. Publicar la app en Vercel.
6. Configurar variables de entorno en Vercel.
7. Probar la URL publica.

## Variables necesarias

Usar los valores reales de Supabase:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_LLAVE_ANON_PUBLICA
NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET=evidencias
```

## Comandos de produccion

```bash
npm install
npm run deploy:check
npm run start
```

## Despliegue en Vercel

En Vercel:

- Framework: Next.js
- Build command: `npm run deploy:check`
- Install command: `npm install`
- Output: automatico

Luego agregar las variables de entorno de `.env.production.example`.

## Paso a paso simple

1. Entrar a GitHub y crear un repositorio llamado `sigth_orgtal`.
2. Subir esta carpeta del proyecto al repositorio.
3. Entrar a Vercel e importar el repositorio desde GitHub.
4. Confirmar que Vercel detecte Next.js.
5. En variables de entorno, copiar los valores de Supabase.
6. Publicar y abrir la URL que entrega Vercel.
7. Revisar dashboard, dependencias, matriz, encuestas, evidencias, calidad de datos y reportes.

## Atajos creados en este PC

Para facilitar el proceso:

- `ABRIR_PUBLICACION_SIGTH_ORGTAL.bat`: abre GitHub, Vercel, Supabase, la carpeta del proyecto y esta guia.
- `PUBLICAR_SIGTH_ORGTAL_WEB.bat`: guarda la version actual en Git, pide la URL del repositorio GitHub y sube el proyecto.
- `CREAR_PAQUETE_WEB_SIGTH_ORGTAL.bat`: crea un ZIP limpio para subir manualmente si Git se bloquea por OneDrive o permisos.

Orden recomendado:

1. Ejecutar `ABRIR_PUBLICACION_SIGTH_ORGTAL.bat`.
2. Crear en GitHub el repositorio `sigth_orgtal`.
3. Ejecutar `PUBLICAR_SIGTH_ORGTAL_WEB.bat`.
4. Pegar la URL del repositorio cuando el asistente la pida.
5. Importar ese repositorio en Vercel.

Si Git vuelve a bloquearse, usar la ruta manual explicada en `SUBIR_WEB_MANUAL.md`.

Si Windows bloquea cualquier carpeta `.git`, usar `PUBLICAR_SIGTH_ORGTAL_REPO_INTERNO.bat`. Ese archivo publica desde `C:\Desarrollo\SIGTH_ORGTAL` usando un repositorio interno separado que evita el bloqueo.

## Reparar bloqueo de OneDrive con Git

Si aparece `Permission denied` o `index.lock`, usar este orden:

1. Ejecutar `REPARAR_GIT_ONEDRIVE_ADMIN.bat` como administrador.
2. Si sigue fallando, pausar OneDrive.
3. Ejecutar `MOVER_A_C_DESARROLLO_SIGTH_ORGTAL.bat` para copiar el proyecto a `C:\Desarrollo\SIGTH_ORGTAL`.
4. Si Git queda bloqueado en la nueva carpeta, ejecutar `REPARAR_GIT_C_DESARROLLO_ADMIN.bat` como administrador.
5. Si todavia aparece una regla `DENY`, ejecutar `DESBLOQUEAR_DENY_GIT_C_DESARROLLO_ADMIN.bat` como administrador.
6. Trabajar desde la nueva carpeta fuera de OneDrive.

## Supabase para produccion

En Supabase se debe ejecutar el archivo `supabase/schema.sql`. Ese archivo crea las tablas principales y el bucket `evidencias` para documentos.

Para la demostracion ante jueces, se puede publicar primero sin Supabase y usar los datos piloto. Para uso real con nuevas dependencias, se recomienda conectar Supabase antes de entregar usuarios externos.

## Activar evidencias reales

La primera conexion real con Supabase queda aplicada a los modulos de dependencias, personal, funciones, entrevistas, encuestas, alertas y evidencias. Cuando las variables de Supabase esten configuradas, las dependencias nuevas, los funcionarios, las funciones, los instrumentos, las respuestas externas, la trazabilidad de alertas y los registros de evidencias se guardan en la base de datos. Si Supabase todavia no esta conectado, la app sigue funcionando con datos locales para la demostracion.

Pasos:

1. Entrar al proyecto en Supabase.
2. Abrir SQL Editor.
3. Copiar y ejecutar el contenido completo de `supabase/schema.sql`.
4. Confirmar que exista el bucket `evidencias`.
5. En Vercel, abrir Settings > Environment Variables.
6. Agregar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET`.
7. Redeploy del proyecto en Vercel.
8. En la app, entrar a Configuracion y probar la conexion.

Nota: para la sustentacion se dejan permisos amplios en evidencias para facilitar la prueba publica. Cuando se activen usuarios reales y roles, esos permisos deben cerrarse por rol.

## Recomendacion para jueces

Antes de la sustentacion:

- Mantener cargados los datos piloto.
- Crear usuario o acceso de demostracion.
- Probar dashboard, dependencias, matriz, encuestas, calidad de datos y reportes.
- Verificar que el reporte avise si faltan datos criticos.
- Tener preparada una segunda dependencia de ejemplo para demostrar que el sistema no depende solo de la prueba piloto.

## Siguiente paso despues de publicar

Cuando la URL publica funcione, se prepara la version PWA y luego el paquete Android para Play Store.
