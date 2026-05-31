insert into storage.buckets (id, name, public)
values ('evidencias', 'evidencias', true)
on conflict (id) do update
set public = true;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'ORGTAL lectura publica evidencias'
  ) then
    create policy "ORGTAL lectura publica evidencias"
    on storage.objects for select
    using (bucket_id = 'evidencias');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'ORGTAL carga publica evidencias'
  ) then
    create policy "ORGTAL carga publica evidencias"
    on storage.objects for insert
    with check (bucket_id = 'evidencias');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'ORGTAL actualizacion publica evidencias'
  ) then
    create policy "ORGTAL actualizacion publica evidencias"
    on storage.objects for update
    using (bucket_id = 'evidencias')
    with check (bucket_id = 'evidencias');
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'ORGTAL eliminacion publica evidencias'
  ) then
    create policy "ORGTAL eliminacion publica evidencias"
    on storage.objects for delete
    using (bucket_id = 'evidencias');
  end if;
end $$;

