# Configuracion de Supabase para SIGTH_ORGTAL

Esta guia conecta la app publica con una base de datos real. La app puede seguir mostrando datos piloto, pero al activar Supabase empieza a guardar evidencias reales.

## 1. Crear o abrir el proyecto

Entrar a Supabase y abrir el proyecto destinado a SIGTH_ORGTAL.

## 2. Crear tablas y permisos

En Supabase:

1. Abrir SQL Editor.
2. Crear una nueva consulta.
3. Copiar el contenido completo de `supabase/schema.sql`.
4. Ejecutar la consulta.

Ese archivo crea las tablas institucionales, la tabla `evidencias` y el bucket `evidencias`.

## 3. Revisar Storage

En Storage debe existir un bucket llamado:

```bash
evidencias
```

Si no aparece, volver a ejecutar `supabase/schema.sql`.

## 4. Configurar Vercel

En Vercel, abrir el proyecto SIGTH_ORGTAL y entrar a Settings > Environment Variables.

Agregar:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_LLAVE_ANON_PUBLICA
NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET=evidencias
```

Despues hacer redeploy.

## 5. Probar en la app

Abrir la app publica:

```bash
https://sigth-orgtal.vercel.app
```

Luego:

1. Entrar a Configuracion.
2. Probar conexion con Supabase.
3. Entrar a Evidencias.
4. Registrar una evidencia.
5. Confirmar en Supabase que se creo el registro en la tabla `evidencias`.

## 6. Prueba integral

En Configuracion usar el boton:

```bash
Prueba integral Supabase
```

La app revisa:

- Variables de entorno.
- Lectura de tablas principales.
- Acceso al bucket `evidencias`.
- Creacion y eliminacion de un registro temporal en `dependencias`.

Si todos los puntos aparecen como `Listo`, la app queda preparada para guardar
datos reales de dependencias nuevas.

## Estado actual

Los primeros modulos conectados a Supabase son Dependencias, Personal, Funciones, Entrevistas, Encuestas, Alertas, Reportes y Evidencias. Los demas modulos siguen funcionando con datos piloto/locales y se pueden conectar uno por uno para evitar que el sistema se atasque.
