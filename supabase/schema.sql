create table if not exists dependencias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  jefe_responsable text,
  mision text,
  procesos text[] default '{}',
  numero_personas integer default 0,
  criticidad text default 'Media',
  observaciones text,
  created_at timestamptz default now()
);

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
  nombre text not null,
  cargo_id uuid references cargos(id) on delete set null,
  dependencia_id uuid references dependencias(id) on delete set null,
  perfil_profesional text,
  experiencia text,
  competencias text[] default '{}',
  tiempo_en_cargo text,
  carga_laboral_estimada integer default 0,
  created_at timestamptz default now()
);

create table if not exists funciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cargo_id uuid references cargos(id) on delete set null,
  persona_id uuid references personal(id) on delete set null,
  origen text default 'manual',
  tipo text default 'asignada',
  frecuencia text,
  complejidad integer default 0,
  tiempo_estimado integer default 0,
  impacto integer default 0,
  riesgo text default 'moderado',
  created_at timestamptz default now()
);

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
  nombre text not null,
  dirigido_a text,
  estado text default 'pendiente',
  created_at timestamptz default now()
);

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
  dependencia_id uuid references dependencias(id) on delete set null,
  nombre text not null,
  url text,
  tipo text,
  asociado_a text,
  estado text default 'Pendiente',
  fecha date,
  observaciones text,
  created_at timestamptz default now()
);

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
