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

alter table dependencias add column if not exists client_id text unique;
alter table dependencias add column if not exists estado text default 'En diagnostico';

create table if not exists cargos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  dependencia_id uuid references dependencias(id) on delete set null,
  perfil_requerido text,
  nivel_responsabilidad text,
  created_at timestamptz default now()
);

create table if not exists personal (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  codigo text,
  nombre text not null,
  cargo text,
  dependencia text,
  cargo_id uuid references cargos(id) on delete set null,
  dependencia_id uuid references dependencias(id) on delete set null,
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

alter table personal add column if not exists client_id text unique;
alter table personal add column if not exists codigo text;
alter table personal add column if not exists cargo text;
alter table personal add column if not exists dependencia text;
alter table personal add column if not exists numero_funciones integer default 0;
alter table personal add column if not exists complejidad text default 'Media';
alter table personal add column if not exists competencia_tecnica integer;
alter table personal add column if not exists competencia_digital integer;
alter table personal add column if not exists competencia_comportamental integer;
alter table personal add column if not exists autonomia integer;
alter table personal add column if not exists disponibilidad integer;
alter table personal add column if not exists fortalezas text;

create table if not exists funciones (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  codigo text,
  nombre text not null,
  cargo_id uuid references cargos(id) on delete set null,
  persona_id uuid references personal(id) on delete set null,
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

alter table funciones add column if not exists client_id text unique;
alter table funciones add column if not exists codigo text;
alter table funciones add column if not exists responsable text;
alter table funciones add column if not exists respaldo text;
alter table funciones add column if not exists proceso text;
alter table funciones add column if not exists producto text;
alter table funciones add column if not exists criticidad integer;
alter table funciones add column if not exists frecuencia_valor integer;
alter table funciones add column if not exists complejidad_valor integer;
alter table funciones add column if not exists horas_semana numeric;
alter table funciones add column if not exists ipf numeric;
alter table funciones add column if not exists nivel_ipf text;
alter table funciones add column if not exists estado text;
alter table funciones add column if not exists observaciones text;
alter table funciones add column if not exists ranking_ipf integer;

create table if not exists competencias (
  id uuid primary key default gen_random_uuid(),
  persona_id uuid references personal(id) on delete cascade,
  competencia text not null,
  nivel text default 'medio',
  brecha text,
  accion_sugerida text,
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

alter table entrevistas add column if not exists client_id text unique;
alter table entrevistas add column if not exists respuestas integer default 0;
alter table entrevistas add column if not exists impacto text default 'Medio';
alter table entrevistas add column if not exists objetivo text;

create table if not exists preguntas (
  id uuid primary key default gen_random_uuid(),
  entrevista_id uuid references entrevistas(id) on delete cascade,
  pregunta text not null,
  tipo_respuesta text default 'texto',
  orden integer default 0
);

create table if not exists respuestas (
  id uuid primary key default gen_random_uuid(),
  pregunta_id uuid references preguntas(id) on delete cascade,
  persona_id uuid references personal(id) on delete set null,
  respuesta text,
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

alter table encuesta_respuestas add column if not exists client_id text unique;
alter table encuesta_respuestas add column if not exists target text default 'Personal';
alter table encuesta_respuestas add column if not exists respondent text;
alter table encuesta_respuestas add column if not exists average numeric default 0;
alter table encuesta_respuestas add column if not exists answers jsonb default '[]';
alter table encuesta_respuestas add column if not exists created_at_label text;
alter table encuesta_respuestas add column if not exists interpretation text;

create table if not exists alertas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  nivel text default 'moderado',
  origen text,
  estado text default 'activa',
  created_at timestamptz default now()
);

create table if not exists reportes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text default 'PDF',
  contenido jsonb default '{}',
  created_at timestamptz default now()
);

create table if not exists evidencias (
  id uuid primary key default gen_random_uuid(),
  client_id text unique,
  dependencia_id uuid references dependencias(id) on delete set null,
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

alter table evidencias add column if not exists client_id text unique;
alter table evidencias add column if not exists dependencia text;

create table if not exists usuarios (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid,
  nombre text not null,
  correo text,
  rol text not null default 'Analista TH',
  dependencia_id uuid references dependencias(id) on delete set null,
  estado text default 'Activo',
  created_at timestamptz default now()
);

create table if not exists alertas_trazabilidad (
  id uuid primary key default gen_random_uuid(),
  alerta_id uuid references alertas(id) on delete cascade,
  estado text default 'Abierta',
  responsable text,
  fecha_seguimiento date,
  evidencia text,
  accion_tomada text,
  created_at timestamptz default now()
);

create table if not exists encuestas_respuestas (
  id uuid primary key default gen_random_uuid(),
  instrumento text not null,
  poblacion text not null,
  respondiente text,
  promedio numeric,
  respuestas jsonb default '[]',
  interpretacion text,
  created_at timestamptz default now()
);

insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', true)
on conflict (id) do nothing;

alter table dependencias enable row level security;
alter table personal enable row level security;
alter table funciones enable row level security;
alter table entrevistas enable row level security;
alter table encuesta_respuestas enable row level security;
alter table evidencias enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dependencias'
      and policyname = 'Lectura publica de dependencias'
  ) then
    create policy "Lectura publica de dependencias"
    on dependencias for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'personal'
      and policyname = 'Lectura publica de personal'
  ) then
    create policy "Lectura publica de personal"
    on personal for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'funciones'
      and policyname = 'Lectura publica de funciones'
  ) then
    create policy "Lectura publica de funciones"
    on funciones for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'entrevistas'
      and policyname = 'Lectura publica de entrevistas'
  ) then
    create policy "Lectura publica de entrevistas"
    on entrevistas for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'entrevistas'
      and policyname = 'Registro publico de entrevistas'
  ) then
    create policy "Registro publico de entrevistas"
    on entrevistas for insert
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'entrevistas'
      and policyname = 'Actualizacion publica de entrevistas'
  ) then
    create policy "Actualizacion publica de entrevistas"
    on entrevistas for update
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'entrevistas'
      and policyname = 'Eliminacion publica de entrevistas'
  ) then
    create policy "Eliminacion publica de entrevistas"
    on entrevistas for delete
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'encuesta_respuestas'
      and policyname = 'Lectura publica de respuestas de encuesta'
  ) then
    create policy "Lectura publica de respuestas de encuesta"
    on encuesta_respuestas for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'encuesta_respuestas'
      and policyname = 'Registro publico de respuestas de encuesta'
  ) then
    create policy "Registro publico de respuestas de encuesta"
    on encuesta_respuestas for insert
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'encuesta_respuestas'
      and policyname = 'Actualizacion publica de respuestas de encuesta'
  ) then
    create policy "Actualizacion publica de respuestas de encuesta"
    on encuesta_respuestas for update
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'funciones'
      and policyname = 'Registro publico de funciones'
  ) then
    create policy "Registro publico de funciones"
    on funciones for insert
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'funciones'
      and policyname = 'Actualizacion publica de funciones'
  ) then
    create policy "Actualizacion publica de funciones"
    on funciones for update
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'funciones'
      and policyname = 'Eliminacion publica de funciones'
  ) then
    create policy "Eliminacion publica de funciones"
    on funciones for delete
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'personal'
      and policyname = 'Registro publico de personal'
  ) then
    create policy "Registro publico de personal"
    on personal for insert
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'personal'
      and policyname = 'Actualizacion publica de personal'
  ) then
    create policy "Actualizacion publica de personal"
    on personal for update
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'personal'
      and policyname = 'Eliminacion publica de personal'
  ) then
    create policy "Eliminacion publica de personal"
    on personal for delete
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dependencias'
      and policyname = 'Registro publico de dependencias'
  ) then
    create policy "Registro publico de dependencias"
    on dependencias for insert
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dependencias'
      and policyname = 'Actualizacion publica de dependencias'
  ) then
    create policy "Actualizacion publica de dependencias"
    on dependencias for update
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'dependencias'
      and policyname = 'Eliminacion publica de dependencias'
  ) then
    create policy "Eliminacion publica de dependencias"
    on dependencias for delete
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'evidencias'
      and policyname = 'Lectura publica de evidencias'
  ) then
    create policy "Lectura publica de evidencias"
    on evidencias for select
    using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'evidencias'
      and policyname = 'Registro publico de evidencias'
  ) then
    create policy "Registro publico de evidencias"
    on evidencias for insert
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'evidencias'
      and policyname = 'Actualizacion publica de evidencias'
  ) then
    create policy "Actualizacion publica de evidencias"
    on evidencias for update
    using (true)
    with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'evidencias'
      and policyname = 'Eliminacion publica de evidencias'
  ) then
    create policy "Eliminacion publica de evidencias"
    on evidencias for delete
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Lectura publica de evidencias'
  ) then
    create policy "Lectura publica de evidencias"
    on storage.objects for select
    using (bucket_id = 'evidencias');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Carga autenticada de evidencias'
  ) then
    create policy "Carga autenticada de evidencias"
    on storage.objects for insert
    with check (bucket_id = 'evidencias');
  end if;
end $$;
