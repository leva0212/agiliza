-- Adjuntos generales de un envío. Se conservan los registros eliminados
-- para mantener trazabilidad de usuario, empresa y fecha.
create table if not exists public.shipment_attachments (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  storage_path text not null,
  file_url text not null,
  original_filename text not null,
  mime_type text,
  file_size bigint,
  notes text not null default '' check (length(notes) <= 500),
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_company_id uuid not null references public.companies(id) on delete restrict,
  deleted_at timestamptz,
  deleted_by uuid references public.profiles(id) on delete set null
);

create index if not exists shipment_attachments_shipment_created_at_idx
  on public.shipment_attachments(shipment_id, created_at desc);

create index if not exists shipment_attachments_shipment_deleted_at_idx
  on public.shipment_attachments(shipment_id, deleted_at, created_at desc);

alter table public.shipment_attachments enable row level security;

drop policy if exists "shipment_attachments_select_by_company" on public.shipment_attachments;
create policy "shipment_attachments_select_by_company"
on public.shipment_attachments
for select
to authenticated
using (
  public.is_owner_company_user()
  or created_company_id = public.current_profile_company_id()
);

drop policy if exists "shipment_attachments_insert_own_user" on public.shipment_attachments;
create policy "shipment_attachments_insert_own_user"
on public.shipment_attachments
for insert
to authenticated
with check (
  created_by = auth.uid()
  and created_company_id = public.current_profile_company_id()
);

-- A bucket dedicated to documents and non-photo files.
insert into storage.buckets (id, name, public)
values ('shipment-attachments', 'shipment-attachments', true)
on conflict (id) do nothing;

drop policy if exists "shipment_attachments_storage_upload" on storage.objects;
create policy "shipment_attachments_storage_upload"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'shipment-attachments');

drop policy if exists "shipment_attachments_storage_delete_own" on storage.objects;
create policy "shipment_attachments_storage_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'shipment-attachments'
  and exists (
    select 1
    from public.shipment_attachments attachment
    where attachment.storage_path = name
      and attachment.created_by = auth.uid()
  )
);

drop function if exists public.soft_delete_shipment_attachments(uuid[]);

create function public.soft_delete_shipment_attachments(
  p_attachment_ids uuid[]
)
returns table(attachment_id uuid, attachment_storage_path text)
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_count integer;
  permitted_count integer;
begin
  if auth.uid() is null then
    raise exception 'Debe iniciar sesión para eliminar adjuntos.';
  end if;

  requested_count := coalesce(cardinality(p_attachment_ids), 0);

  if requested_count = 0 then
    return;
  end if;

  select count(*)
    into permitted_count
    from public.shipment_attachments attachment
   where attachment.id = any(p_attachment_ids)
     and attachment.created_by = auth.uid()
     and attachment.deleted_at is null;

  if permitted_count <> requested_count then
    raise exception 'Solo puede eliminar archivos que usted mismo subió.';
  end if;

  return query
    update public.shipment_attachments attachment
       set deleted_at = now(),
           deleted_by = auth.uid()
     where attachment.id = any(p_attachment_ids)
       and attachment.created_by = auth.uid()
       and attachment.deleted_at is null
    returning attachment.id, attachment.storage_path;
end;
$$;

revoke all on function public.soft_delete_shipment_attachments(uuid[]) from public;
grant execute on function public.soft_delete_shipment_attachments(uuid[]) to authenticated;
