# Subida manual de SIGTH_ORGTAL a la web

Esta ruta sirve si Git se bloquea en el PC por permisos de Windows o OneDrive.

## 1. Crear paquete limpio

Ejecuta:

```bash
CREAR_PAQUETE_WEB_SIGTH_ORGTAL.bat
```

Esto genera:

```bash
C:\Users\Edwyn\OneDrive\Documentos\New project\orgtalsigth-app\SIGTH_ORGTAL_WEB_PUBLICAR.zip
```

Ese paquete no incluye `node_modules`, `.next`, `.git` ni archivos temporales.

## 2. Subir a GitHub

1. Entra a GitHub.
2. Crea un repositorio llamado `sigth_orgtal`.
3. Sube los archivos del paquete limpio.
4. Verifica que aparezcan `package.json`, `app`, `components`, `data`, `lib`, `supabase` y `vercel.json`.

## 3. Publicar en Vercel

1. Entra a Vercel.
2. Importa el repositorio `sigth_orgtal`.
3. Confirma:
   - Framework: Next.js
   - Install command: `npm install`
   - Build command: `npm run deploy:check`
4. Publica.

## 4. Supabase

Para la demo ante jueces, la app puede abrir con datos piloto.

Para produccion real:

1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql`.
3. En Vercel agrega:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET=evidencias
```

## 5. Validacion final

Antes de compartir la URL:

- Abrir dashboard.
- Revisar dependencias.
- Revisar matriz funcion-persona.
- Probar encuestas.
- Probar evidencias.
- Revisar calidad de datos.
- Generar reporte.
