alter table public.shipment_attachments
  add column if not exists notes_updated_at timestamptz;

drop function if exists public.update_shipment_attachment_notes(uuid, text);

create function public.update_shipment_attachment_notes(
  p_attachment_id uuid,
  p_notes text
)
returns table(attachment_id uuid, notes text, notes_updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_role text;
  normalized_notes text := trim(coalesce(p_notes, ''));
begin
  select role
    into current_role
    from public.profiles
   where id = auth.uid()
     and active = true;

  if current_role is null then
    raise exception 'Debe iniciar sesión con un usuario activo.';
  end if;

  if length(normalized_notes) > 500 then
    raise exception 'El comentario no puede superar 500 caracteres.';
  end if;

  if not exists (
    select 1
    from public.shipment_attachments attachment
   where attachment.id = p_attachment_id
     and attachment.deleted_at is null
     and (
       attachment.created_by = auth.uid()
       or current_role = 'super_admin'
     )
  ) then
    raise exception 'No tiene permiso para editar este comentario.';
  end if;

  return query
    update public.shipment_attachments attachment
       set notes = normalized_notes,
           notes_updated_at = case
             when attachment.notes is distinct from normalized_notes then now()
             else attachment.notes_updated_at
           end
     where attachment.id = p_attachment_id
    returning attachment.id, attachment.notes, attachment.notes_updated_at;
end;
$$;

revoke all on function public.update_shipment_attachment_notes(uuid, text) from public;
grant execute on function public.update_shipment_attachment_notes(uuid, text) to authenticated;
