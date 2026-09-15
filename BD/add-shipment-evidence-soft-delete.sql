-- Conserva el contexto de una evidencia eliminada sin conservarla como imagen visible.
alter table public.shipment_evidences
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create index if not exists shipment_evidences_shipment_deleted_at_idx
  on public.shipment_evidences(shipment_id, deleted_at, created_at desc);

-- La operación se hace en la base de datos para que un usuario no pueda
-- eliminar evidencia de otra persona aunque manipule la interfaz.
drop function if exists public.soft_delete_shipment_evidences(uuid[]);

create or replace function public.soft_delete_shipment_evidences(
  p_evidence_ids uuid[]
)
returns table(evidence_id uuid, evidence_storage_path text)
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_count integer;
  permitted_count integer;
begin
  if auth.uid() is null then
    raise exception 'Debe iniciar sesión para eliminar evidencias.';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and active = true
  ) then
    raise exception 'Su usuario no está habilitado para eliminar evidencias.';
  end if;

  requested_count := coalesce(cardinality(p_evidence_ids), 0);

  if requested_count = 0 then
    return;
  end if;

  select count(*)
    into permitted_count
    from public.shipment_evidences evidence
   where evidence.id = any(p_evidence_ids)
     and evidence.created_by = auth.uid()
     and evidence.deleted_at is null;

  if permitted_count <> requested_count then
    raise exception 'Solo puede eliminar archivos que usted mismo subió.';
  end if;

  return query
    update public.shipment_evidences evidence
       set deleted_at = now(),
           deleted_by = auth.uid()
     where evidence.id = any(p_evidence_ids)
       and evidence.created_by = auth.uid()
       and evidence.deleted_at is null
    returning evidence.id, evidence.storage_path;
end;
$$;

revoke all on function public.soft_delete_shipment_evidences(uuid[]) from public;
grant execute on function public.soft_delete_shipment_evidences(uuid[]) to authenticated;
