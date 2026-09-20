-- Habilita los cambios de las secciones relacionadas del detalle del envío.
-- No modifica RLS ni datos. Se puede ejecutar más de una vez.
do $$
begin
  if to_regclass('public.shipment_items') is not null
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'shipment_items'
     ) then
    alter publication supabase_realtime add table public.shipment_items;
  end if;

  if to_regclass('public.shipment_contact_methods') is not null
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'shipment_contact_methods'
     ) then
    alter publication supabase_realtime add table public.shipment_contact_methods;
  end if;

  if to_regclass('public.shipment_status_history') is not null
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'shipment_status_history'
     ) then
    alter publication supabase_realtime add table public.shipment_status_history;
  end if;
end;
$$;

-- Verificación de las tablas del detalle que Realtime debe escuchar.
select pubname, schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and schemaname = 'public'
  and tablename in (
    'shipments',
    'shipment_items',
    'shipment_contact_methods',
    'shipment_status_history'
  )
order by tablename;
