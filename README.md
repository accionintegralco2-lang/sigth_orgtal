# SIGTH_ORGTAL

Sistema Organizacional de Gestion del Talento Humano, Funciones y Cargas Laborales.

Esta primera version es una app web institucional creada con Next.js y preparada para conectarse a Supabase. Incluye dashboard ejecutivo, modulos base, datos de prueba, calculos de carga laboral, alertas automaticas y modelo inicial de base de datos.

## Modulos incluidos

- Dashboard ejecutivo
- Dependencias
- Personal
- Funciones
- Cargas laborales
- Perfiles y competencias
- Entrevistas
- Alertas
- Reportes

## Instalacion

```bash
npm install
npm run dev
```

Luego abre `http://localhost:3000`.

## Supabase

1. Crea un proyecto en Supabase.
2. Ejecuta el script `supabase/schema.sql` en el SQL Editor.
3. Copia `.env.example` como `.env.local`.
4. Completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET=evidencias
```

La app funciona con datos de prueba aunque Supabase aun no este conectado.

## Publicacion web

La guia de publicacion esta en `PUBLICACION_WEB.md`.

Resumen:

1. Subir el proyecto a GitHub.
2. Crear proyecto Supabase.
3. Publicar en Vercel como app Next.js.
4. Agregar variables de entorno.
5. Probar la URL publica antes de mostrarla a jueces.

Comando recomendado de validacion:

```bash
npm run deploy:check
```
