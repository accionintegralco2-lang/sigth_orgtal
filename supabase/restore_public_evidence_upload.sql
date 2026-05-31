-- ORGTAL - Restaurar carga publica de evidencias para demo web
-- Uso: ejecutar este script si la app publica usa NEXT_PUBLIC_SUPABASE_ANON_KEY
-- y la subida al bucket `evidencias` falla por politicas RLS en storage.objects.

insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', true)
on conflict (id) do update
set public = true;

drop policy if exists "ORGTAL evidencias lectura autenticada" on storage.objects;
drop policy if exists "ORGTAL evidencias carga gestores" on storage.objects;
drop policy if exists "ORGTAL evidencias actualizacion gestores" on storage.objects;
drop policy if exists "ORGTAL evidencias eliminacion administradores" on storage.objects;
drop policy if exists "Lectura publica de evidencias" on storage.objects;
drop policy if exists "Carga autenticada de evidencias" on storage.objects;
drop policy if exists "ORGTAL lectura publica evidencias" on storage.objects;
drop policy if exists "ORGTAL carga publica evidencias" on storage.objects;
drop policy if exists "ORGTAL actualizacion publica evidencias" on storage.objects;
drop policy if exists "ORGTAL eliminacion publica evidencias" on storage.objects;

create policy "ORGTAL lectura publica evidencias"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'evidencias');

create policy "ORGTAL carga publica evidencias"
on storage.objects for insert
to anon, authenticated
with check (bucket_id = 'evidencias');

create policy "ORGTAL actualizacion publica evidencias"
on storage.objects for update
to anon, authenticated
using (bucket_id = 'evidencias')
with check (bucket_id = 'evidencias');

create policy "ORGTAL eliminacion publica evidencias"
on storage.objects for delete
to anon, authenticated
using (bucket_id = 'evidencias');

