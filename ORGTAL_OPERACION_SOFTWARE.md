# ORGTAL - mejoras para pasar de prototipo a software operativo

Este documento resume las siete mejoras aplicadas para que ORGTAL avance de demostracion academica a aplicacion institucional mas segura, mantenible y vendible.

## 1. Seguridad del front-end y cabeceras

Se desactivaron los source maps publicos de produccion y se agregaron cabeceras de seguridad: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `Content-Security-Policy`.

## 2. RLS y separacion por diagnostico

ORGTAL conserva `diagnostico_id` para separar trabajos por dependencia, entidad o diagnostico. Los scripts de Supabase incluyen modo demo publica y endurecimiento para usuarios autenticados.

## 3. Control de versiones

La carpeta maestra es `_publish_orgtal_brand`. GitHub y Vercel deben sincronizarse desde esa carpeta para evitar publicar versiones historicas.

## 4. APIs controladas

Se agregaron endpoints internos:

- `/api/health`: estado basico de la app.
- `/api/security`: chequeo tecnico de variables publicas, source maps y rate limiting.

## 5. Hosting, despliegue y cache

La app usa Vercel con dominio `https://orgtal.vercel.app`. Los recursos estaticos tienen cache largo y las APIs usan `no-store`.

## 6. Rate limiting

Las rutas `/api` tienen un limite basico por IP y ruta. Esto protege futuras funciones con costo, como IA, reportes pesados o integraciones externas.

## 7. Monitoreo inicial

Se agrego captura local de errores del navegador en `localStorage`, como primera capa para detectar fallas durante pruebas.

## Siguiente nivel recomendado

1. Activar autenticacion obligatoria.
2. Ejecutar `supabase/security_hardening.sql`.
3. Cerrar permisos publicos de demo.
4. Crear auditoria por usuario.
5. Conectar monitoreo externo.
6. Crear backups programados.
7. Separar ambientes de desarrollo, pruebas y produccion.
