# Configuracion de Supabase para ORGTAL

Esta guia conecta la app publica ORGTAL con una base de datos real. La app puede seguir mostrando datos piloto, pero al activar Supabase tambien puede guardar dependencias nuevas, personal, funciones, entrevistas, reportes y evidencias reales.

## Estado verificado 2026-05-31

Proyecto Supabase:

```bash
wflfroecchxgfswuwpnp
```

Web principal:

```bash
https://orgtal.vercel.app
```

Estado actual:

- Variables de entorno en Vercel: configuradas.
- Despliegue principal en Vercel: activo.
- Archivo local `.env.local`: configurado en este PC.
- Tablas principales en Supabase: creadas y con lectura disponible para el prototipo.
- Bucket `evidencias`: creado y responde correctamente.
- Permisos publicos de prueba: habilitados para sustentacion y validacion del prototipo.

Nota de seguridad: los permisos amplios son utiles para demostrar el prototipo ante jueces o tutores. Para uso institucional con usuarios externos permanentes, deben cerrarse por roles reales: Administrador, Director, Jefe de dependencia, Analista, Experto validador y Personal.

## 1. Crear o abrir el proyecto

Entrar a Supabase y abrir el proyecto destinado a ORGTAL:

```bash
https://supabase.com/dashboard/project/wflfroecchxgfswuwpnp
```

## 2. Crear tablas y permisos

Si se instala el proyecto en una base nueva, ejecutar en Supabase el archivo:

```bash
supabase/schema.sql
```

Ese archivo crea o actualiza las tablas principales que la app necesita:

- `dependencias`
- `personal`
- `funciones`
- `entrevistas`
- `encuesta_respuestas`
- `alertas_trazabilidad`
- `reportes`
- `evidencias`

Tambien habilita politicas de acceso para que el prototipo pueda leer, guardar, actualizar y eliminar registros durante la demostracion.

## 3. Revisar Storage

En Storage debe existir un bucket llamado:

```bash
evidencias
```

Este bucket guarda documentos, soportes, anexos, actas, manuales, organigramas y evidencias asociadas al diagnostico. Si la carga de evidencias falla con un mensaje de permisos, revisar las politicas del bucket o ejecutar el script de restauracion publica para la demo:

```bash
supabase/restore_public_evidence_upload.sql
```

## 4. Configurar Vercel

En Vercel, abrir el proyecto ORGTAL y entrar a Settings > Environment Variables.

Verificar estas variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_LLAVE_ANON_PUBLICA
NEXT_PUBLIC_SUPABASE_EVIDENCE_BUCKET=evidencias
```

Despues de cambiar variables, hacer redeploy del proyecto en Vercel.

## 5. Probar en la app

Abrir la app publica:

```bash
https://orgtal.vercel.app
```

Luego:

1. Entrar a Configuracion.
2. Usar el boton `Probar conexion`.
3. Usar el boton `Prueba integral Supabase`.
4. Entrar a Evidencias.
5. Registrar una evidencia de prueba.
6. Confirmar en Supabase que se creo el registro en la tabla `evidencias`.

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

Si todos los puntos aparecen como `Listo`, ORGTAL queda preparado para guardar datos reales de dependencias nuevas.

## Estado funcional

Los modulos conectados a Supabase son Dependencias, Personal, Funciones, Entrevistas, Encuestas, Alertas, Reportes y Evidencias. Los demas modulos siguen usando calculos locales y datos del diagnostico activo para evitar que el sistema se vuelva pesado.

Para uso real, se recomienda avanzar en este orden:

1. Mantener la version publica estable para sustentacion.
2. Activar autenticacion real de usuarios.
3. Cerrar permisos por rol.
4. Separar cada diagnostico por dependencia o entidad.
5. Validar carga masiva y evidencias con datos reales.
