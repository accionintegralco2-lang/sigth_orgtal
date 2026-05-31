-- ORGTAL - Endurecimiento de seguridad para operacion real
-- Ejecutar cuando el sistema pase de demo publica a usuarios autenticados.

alter table dependencias add column if not exists diagnostico_id text default 'orgtal-demo';
alter table personal add column if not exists diagnostico_id text default 'orgtal-demo';
alter table funciones add column if not exists diagnostico_id text default 'orgtal-demo';
alter table entrevistas add column if not exists diagnostico_id text default 'orgtal-demo';
alter table encuesta_respuestas add column if not exists diagnostico_id text default 'orgtal-demo';
alter table alertas_trazabilidad add column if not exists diagnostico_id text default 'orgtal-demo';
alter table reportes add column if not exists diagnostico_id text default 'orgtal-demo';
alter table evidencias add column if not exists diagnostico_id text default 'orgtal-demo';

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  nombre text not null default 'Usuario ORGTAL',
  email text,
  rol text not null default 'Personal',
  estado text not null default 'Activo',
  diagnostico_id text not null default 'orgtal-demo',
  creado_en timestamptz not null default now()
);

alter table usuarios add column if not exists auth_user_id uuid unique;
alter table usuarios add column if not exists diagnostico_id text default 'orgtal-demo';

insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', false)
on conflict (id) do update set public = false;

revoke all on dependencias from anon;
revoke all on personal from anon;
revoke all on funciones from anon;
revoke all on entrevistas from anon;
revoke all on encuesta_respuestas from anon;
revoke all on alertas_trazabilidad from anon;
revoke all on reportes from anon;
revoke all on evidencias from anon;

grant usage on schema public to authenticated;
grant select, insert, update, delete on dependencias to authenticated;
grant select, insert, update, delete on personal to authenticated;
grant select, insert, update, delete on funciones to authenticated;
grant select, insert, update, delete on entrevistas to authenticated;
grant select, insert, update, delete on encuesta_respuestas to authenticated;
grant select, insert, update, delete on alertas_trazabilidad to authenticated;
grant select, insert, update, delete on reportes to authenticated;
grant select, insert, update, delete on evidencias to authenticated;

alter table dependencias enable row level security;
alter table personal enable row level security;
alter table funciones enable row level security;
alter table entrevistas enable row level security;
alter table encuesta_respuestas enable row level security;
alter table alertas_trazabilidad enable row level security;
alter table reportes enable row level security;
alter table evidencias enable row level security;
alter table usuarios enable row level security;

create schema if not exists orgtal_private;
revoke all on schema orgtal_private from public;
grant usage on schema orgtal_private to authenticated;

create or replace function orgtal_private.current_role()
returns text
language sql
security definer
set search_path = public, auth
stable
as $$
  select coalesce(
    (select rol from public.usuarios where auth_user_id = auth.uid() and estado = 'Activo' limit 1),
    'Personal'
  )
$$;

create or replace function orgtal_private.current_diagnosis_id()
returns text
language sql
security definer
set search_path = public, auth
stable
as $$
  select coalesce(
    (select diagnostico_id from public.usuarios where auth_user_id = auth.uid() and estado = 'Activo' limit 1),
    'orgtal-demo'
  )
$$;

create or replace function orgtal_private.can_manage()
returns boolean
language sql
security definer
set search_path = public, auth
stable
as $$
  select orgtal_private.current_role() in ('Administrador', 'Analista TH', 'Jefe de dependencia')
$$;

grant execute on function orgtal_private.current_role() to authenticated;
grant execute on function orgtal_private.current_diagnosis_id() to authenticated;
grant execute on function orgtal_private.can_manage() to authenticated;

drop policy if exists "ORGTAL usuarios lectura propia" on usuarios;
drop policy if exists "ORGTAL usuarios administradores gestionan" on usuarios;
drop policy if exists "ORGTAL usuarios administradores insertan" on usuarios;
drop policy if exists "ORGTAL usuarios administradores actualizan" on usuarios;
drop policy if exists "ORGTAL usuarios administradores eliminan" on usuarios;

create policy "ORGTAL usuarios lectura propia"
on usuarios for select to authenticated
using (auth_user_id = (select auth.uid()) or orgtal_private.current_role() = 'Administrador');

create policy "ORGTAL usuarios administradores insertan"
on usuarios for insert to authenticated
with check (orgtal_private.current_role() = 'Administrador');

create policy "ORGTAL usuarios administradores actualizan"
on usuarios for update to authenticated
using (orgtal_private.current_role() = 'Administrador')
with check (orgtal_private.current_role() = 'Administrador');

create policy "ORGTAL usuarios administradores eliminan"
on usuarios for delete to authenticated
using (orgtal_private.current_role() = 'Administrador');

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'dependencias',
    'personal',
    'funciones',
    'entrevistas',
    'encuesta_respuestas',
    'alertas_trazabilidad',
    'reportes',
    'evidencias'
  ]
  loop
    execute format('drop policy if exists "Lectura publica de %s" on %I', table_name, table_name);
    execute format('drop policy if exists "Registro publico de %s" on %I', table_name, table_name);
    execute format('drop policy if exists "Actualizacion publica de %s" on %I', table_name, table_name);
    execute format('drop policy if exists "Eliminacion publica de %s" on %I', table_name, table_name);
    execute format('drop policy if exists "ORGTAL lectura publica" on %I', table_name);
    execute format('drop policy if exists "ORGTAL registro publico" on %I', table_name);
    execute format('drop policy if exists "ORGTAL actualizacion publica" on %I', table_name);
    execute format('drop policy if exists "ORGTAL eliminacion publica" on %I', table_name);
    execute format('drop policy if exists "ORGTAL autenticados leen %s" on %I', table_name, table_name);
    execute format('drop policy if exists "ORGTAL gestores insertan %s" on %I', table_name, table_name);
    execute format('drop policy if exists "ORGTAL gestores actualizan %s" on %I', table_name, table_name);
    execute format('drop policy if exists "ORGTAL administradores eliminan %s" on %I', table_name, table_name);

    execute format(
      'create policy "ORGTAL autenticados leen %1$I" on %1$I for select to authenticated using ((select auth.uid()) is not null and (diagnostico_id = orgtal_private.current_diagnosis_id() or orgtal_private.current_role() = ''Administrador''))',
      table_name
    );
    execute format(
      'create policy "ORGTAL gestores insertan %1$I" on %1$I for insert to authenticated with check (orgtal_private.can_manage() and (diagnostico_id = orgtal_private.current_diagnosis_id() or orgtal_private.current_role() = ''Administrador''))',
      table_name
    );
    execute format(
      'create policy "ORGTAL gestores actualizan %1$I" on %1$I for update to authenticated using (orgtal_private.can_manage() and (diagnostico_id = orgtal_private.current_diagnosis_id() or orgtal_private.current_role() = ''Administrador'')) with check (orgtal_private.can_manage() and (diagnostico_id = orgtal_private.current_diagnosis_id() or orgtal_private.current_role() = ''Administrador''))',
      table_name
    );
    execute format(
      'create policy "ORGTAL administradores eliminan %1$I" on %1$I for delete to authenticated using (orgtal_private.current_role() = ''Administrador'')',
      table_name
    );
  end loop;
end $$;

drop policy if exists "Lectura publica de evidencias" on storage.objects;
drop policy if exists "Carga autenticada de evidencias" on storage.objects;
drop policy if exists "ORGTAL lectura publica evidencias" on storage.objects;
drop policy if exists "ORGTAL carga publica evidencias" on storage.objects;
drop policy if exists "ORGTAL actualizacion publica evidencias" on storage.objects;
drop policy if exists "ORGTAL eliminacion publica evidencias" on storage.objects;
drop policy if exists "ORGTAL evidencias lectura autenticada" on storage.objects;
drop policy if exists "ORGTAL evidencias carga gestores" on storage.objects;
drop policy if exists "ORGTAL evidencias actualizacion gestores" on storage.objects;
drop policy if exists "ORGTAL evidencias eliminacion administradores" on storage.objects;

create policy "ORGTAL evidencias lectura autenticada"
on storage.objects for select to authenticated
using (bucket_id = 'evidencias');

create policy "ORGTAL evidencias carga gestores"
on storage.objects for insert to authenticated
with check (bucket_id = 'evidencias' and orgtal_private.can_manage());

create policy "ORGTAL evidencias actualizacion gestores"
on storage.objects for update to authenticated
using (bucket_id = 'evidencias' and orgtal_private.can_manage())
with check (bucket_id = 'evidencias' and orgtal_private.can_manage());

create policy "ORGTAL evidencias eliminacion administradores"
on storage.objects for delete to authenticated
using (bucket_id = 'evidencias' and orgtal_private.current_role() = 'Administrador');

