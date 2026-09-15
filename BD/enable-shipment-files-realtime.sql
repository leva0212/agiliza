-- Ejecutar después de crear shipment_attachments.
-- Agrega las tablas a Realtime sin duplicarlas si ya estaban publicadas.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shipment_evidences'
  ) then
    alter publication supabase_realtime add table public.shipment_evidences;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'shipment_attachments'
  ) then
    alter publication supabase_realtime add table public.shipment_attachments;
  end if;
end;
$$;
