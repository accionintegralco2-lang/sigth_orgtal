create extension if not exists pgcrypto;

create table if not exists dependencias (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  nombre text not null,
  jefe_responsable text,
  mision text,
  procesos text[] default '{}',
  numero_personas integer default 0,
  criticidad text default 'Media',
  estado text default 'En diagnostico',
  observaciones text,
  created_at timestamptz default now()
);

create table if not exists personal (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  codigo text,
  nombre text not null,
  cargo text,
  dependencia text,
  perfil_profesional text,
  experiencia text,
  competencias text[] default '{}',
  tiempo_en_cargo text,
  numero_funciones integer default 0,
  complejidad text default 'Media',
  competencia_tecnica integer,
  competencia_digital integer,
  competencia_comportamental integer,
  autonomia integer,
  disponibilidad integer,
  fortalezas text,
  carga_laboral_estimada integer default 0,
  created_at timestamptz default now()
);

create table if not exists funciones (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  codigo text,
  nombre text not null,
  origen text default 'manual',
  tipo text default 'asignada',
  responsable text,
  respaldo text,
  proceso text,
  producto text,
  frecuencia text,
  criticidad integer,
  frecuencia_valor integer,
  complejidad_valor integer,
  horas_semana numeric,
  ipf numeric,
  nivel_ipf text,
  estado text,
  observaciones text,
  ranking_ipf integer,
  complejidad integer default 0,
  tiempo_estimado integer default 0,
  impacto integer default 0,
  riesgo text default 'moderado',
  created_at timestamptz default now()
);

create table if not exists entrevistas (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  nombre text not null,
  dirigido_a text,
  respuestas integer default 0,
  estado text default 'pendiente',
  impacto text default 'Medio',
  objetivo text,
  created_at timestamptz default now()
);

create table if not exists encuesta_respuestas (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  target text default 'Personal',
  respondent text,
  average numeric default 0,
  answers jsonb default '[]',
  created_at_label text,
  interpretation text,
  created_at timestamptz default now()
);

create table if not exists alertas_trazabilidad (
  id uuid primary key default gen_random_uuid(),
  alerta_id uuid,
  alerta_client_id text unique,
  estado text default 'Abierta',
  responsable text,
  fecha_seguimiento date,
  evidencia text,
  accion_tomada text,
  created_at timestamptz default now()
);

create table if not exists reportes (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  nombre text not null,
  tipo text default 'PDF',
  fecha_label text,
  estado text default 'Generado',
  calidad integer default 0,
  riesgo text default 'moderado',
  dependencias integer default 0,
  personal integer default 0,
  funciones integer default 0,
  alertas integer default 0,
  contenido jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists evidencias (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  dependencia text,
  nombre text not null,
  url text,
  tipo text,
  asociado_a text,
  estado text default 'Pendiente',
  fecha date,
  observaciones text,
  created_at timestamptz default now()
);

alter table dependencias enable row level security;
alter table personal enable row level security;
alter table funciones enable row level security;
alter table entrevistas enable row level security;
alter table encuesta_respuestas enable row level security;
alter table alertas_trazabilidad enable row level security;
alter table reportes enable row level security;
alter table evidencias enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on dependencias to anon, authenticated;
grant select, insert, update, delete on personal to anon, authenticated;
grant select, insert, update, delete on funciones to anon, authenticated;
grant select, insert, update, delete on entrevistas to anon, authenticated;
grant select, insert, update, delete on encuesta_respuestas to anon, authenticated;
grant select, insert, update, delete on alertas_trazabilidad to anon, authenticated;
grant select, insert, update, delete on reportes to anon, authenticated;
grant select, insert, update, delete on evidencias to anon, authenticated;

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
    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'ORGTAL lectura publica'
    ) then
      execute format(
        'create policy "ORGTAL lectura publica" on %I for select using (true)',
        table_name
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'ORGTAL registro publico'
    ) then
      execute format(
        'create policy "ORGTAL registro publico" on %I for insert with check (true)',
        table_name
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'ORGTAL actualizacion publica'
    ) then
      execute format(
        'create policy "ORGTAL actualizacion publica" on %I for update using (true) with check (true)',
        table_name
      );
    end if;

    if not exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = table_name
        and policyname = 'ORGTAL eliminacion publica'
    ) then
      execute format(
        'create policy "ORGTAL eliminacion publica" on %I for delete using (true)',
        table_name
      );
    end if;
  end loop;
end $$;

notify pgrst, 'reload schema';

