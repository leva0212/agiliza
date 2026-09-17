-- Confirma una entrega usando exclusivamente columnas existentes de shipments.
-- No crea tablas ni duplica la información de la entrega.
drop function if exists public.complete_shipment_delivery(
  uuid, uuid, text, numeric, numeric, double precision, double precision
);
drop function if exists public.complete_shipment_delivery(
  uuid, uuid, text, numeric, numeric, text, double precision, double precision
);

create or replace function public.complete_shipment_delivery(
  p_shipment_id uuid,
  p_delivered_by uuid,
  p_receiver_type text,
  p_deposit_amount numeric,
  p_shipping_fee numeric,
  p_observations text,
  p_latitude double precision,
  p_longitude double precision
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_is_system_company boolean;
  previous_status public.shipment_status;
  assigned_deposit numeric;
  assigned_shipping_fee numeric;
  delivery_time timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'Debe iniciar sesión para confirmar una entrega.';
  end if;

  select coalesce(company.is_owner_company, false)
      or coalesce(company.is_system_company, false)
    into actor_is_system_company
    from public.profiles profile
    join public.companies company on company.id = profile.company_id
   where profile.id = auth.uid()
     and profile.active = true;

  if coalesce(actor_is_system_company, false) is not true then
    raise exception 'Solo la empresa del sistema puede confirmar entregas.';
  end if;

  if p_receiver_type not in ('owner', 'authorized') then
    raise exception 'El tipo de receptor no es válido.';
  end if;

  if p_deposit_amount is null or p_deposit_amount < 0
    or p_shipping_fee is null or p_shipping_fee < 0 then
    raise exception 'Los montos de la entrega no son válidos.';
  end if;

  if length(coalesce(p_observations, '')) > 500 then
    raise exception 'Las observaciones no pueden superar 500 caracteres.';
  end if;

  if p_latitude is null or p_latitude not between -90 and 90
    or p_longitude is null or p_longitude not between -180 and 180 then
    raise exception 'Las coordenadas de la entrega no son válidas.';
  end if;

  if not exists (
    select 1
      from public.couriers courier
      join public.profiles profile on profile.id = courier.profile_id
      join public.companies company on company.id = profile.company_id
     where courier.id = p_delivered_by
       and courier.active = true
       and profile.active = true
       and profile.can_deliver = true
       and (
         coalesce(company.is_owner_company, false)
         or coalesce(company.is_system_company, false)
       )
  ) then
    raise exception 'El usuario seleccionado no está habilitado para realizar entregas.';
  end if;

  select shipment.status
    into previous_status
    from public.shipments shipment
   where shipment.id = p_shipment_id
   for update;

  if not found then
    raise exception 'El envío no existe.';
  end if;

  if previous_status = 'delivered' then
    raise exception 'El envío ya fue marcado como entregado.';
  end if;

  select
    coalesce(sum(item.deposit_amount), 0),
    coalesce(sum(item.shipping_fee), 0)
    into assigned_deposit, assigned_shipping_fee
    from public.shipment_items item
   where item.shipment_id = p_shipment_id;

  if assigned_deposit = 0 and p_deposit_amount <> 0 then
    raise exception 'Este envío no tiene depósito asignado.';
  end if;

  if assigned_shipping_fee = 0 and p_shipping_fee <> 0 then
    raise exception 'Este envío no tiene costo de envío asignado.';
  end if;

  update public.shipments
     set status = 'delivered',
         delivered_at = delivery_time,
         delivered_by_courier_id = p_delivered_by,
         receiver_type = p_receiver_type::public.receiver_type,
         deposit_collected = case
           when assigned_deposit > 0 then p_deposit_amount
           else 0
         end,
         shipping_collected = case
           when assigned_shipping_fee > 0 then p_shipping_fee
           else 0
         end,
         latitude = p_latitude,
         longitude = p_longitude,
         last_update_at = delivery_time,
         last_update_message = 'Entrega confirmada'
   where id = p_shipment_id;

  insert into public.shipment_status_history (
    shipment_id, previous_status, status, notes, created_by
  )
  values (
    p_shipment_id,
    previous_status,
    'delivered',
    nullif(trim(coalesce(p_observations, '')), ''),
    auth.uid()
  );
end;
$$;

revoke all on function public.complete_shipment_delivery(
  uuid, uuid, text, numeric, numeric, text, double precision, double precision
) from public;

grant execute on function public.complete_shipment_delivery(
  uuid, uuid, text, numeric, numeric, text, double precision, double precision
) to authenticated;
