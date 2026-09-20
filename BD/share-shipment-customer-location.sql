-- Ubicación compartida voluntariamente por el cliente con enlace temporal de un solo uso.
alter table public.shipments add column if not exists customer_latitude double precision;
alter table public.shipments add column if not exists customer_longitude double precision;
alter table public.shipments add column if not exists customer_location_accuracy_meters double precision;
alter table public.shipments add column if not exists customer_location_received_at timestamptz;
create table if not exists public.shipment_customer_location_requests (
  id uuid primary key default gen_random_uuid(), shipment_id uuid not null references public.shipments(id) on delete cascade,
  token_hash text not null unique check (length(token_hash)=64), created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(), expires_at timestamptz not null, used_at timestamptz
);
create index if not exists shipment_customer_location_requests_shipment_idx on public.shipment_customer_location_requests(shipment_id, used_at);
alter table public.shipment_customer_location_requests enable row level security;
revoke all on public.shipment_customer_location_requests from anon, authenticated;
create or replace function public.create_shipment_customer_location_request(p_shipment_id uuid,p_token_hash text)
returns timestamptz language plpgsql security definer set search_path=public as $$
declare v_expiry timestamptz:=now()+interval '24 hours'; v_allowed boolean;
begin
 if auth.uid() is null then raise exception 'Debe iniciar sesión.'; end if;
 if p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'Token inválido.'; end if;
 select coalesce(c.is_owner_company,false) or coalesce(c.is_system_company,false) into v_allowed from profiles p join companies c on c.id=p.company_id where p.id=auth.uid() and p.active=true;
 if not coalesce(v_allowed,false) then raise exception 'Solo un usuario de Agiliza puede solicitar ubicación al cliente.'; end if;
 if not exists(select 1 from shipments s where s.id=p_shipment_id) then raise exception 'El envío no existe.'; end if;
 delete from shipment_customer_location_requests where shipment_id=p_shipment_id and used_at is null;
 insert into shipment_customer_location_requests(shipment_id,token_hash,created_by,expires_at) values(p_shipment_id,p_token_hash,auth.uid(),v_expiry);
 return v_expiry;
end; $$;
create or replace function public.get_public_shipment_customer_location_request(p_token_hash text)
returns table(tracking_number text,customer_name text,expires_at timestamptz) language sql security definer set search_path=public as $$
 select s.tracking_number,s.customer_name,r.expires_at from shipment_customer_location_requests r join shipments s on s.id=r.shipment_id where r.token_hash=p_token_hash and r.used_at is null and r.expires_at>now() limit 1;
$$;
create or replace function public.submit_public_shipment_customer_location(p_token_hash text,p_latitude double precision,p_longitude double precision,p_accuracy_meters double precision)
returns void language plpgsql security definer set search_path=public as $$
declare v_request shipment_customer_location_requests%rowtype;
begin
 if p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'Enlace inválido o vencido.'; end if;
 if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then raise exception 'Coordenadas inválidas.'; end if;
 if p_accuracy_meters is null or p_accuracy_meters<0 or p_accuracy_meters>100000 then raise exception 'Precisión GPS inválida.'; end if;
 select * into v_request from shipment_customer_location_requests where token_hash=p_token_hash and used_at is null and expires_at>now() for update;
 if not found then raise exception 'Este enlace ya fue usado o venció.'; end if;
 update shipments set customer_latitude=p_latitude,customer_longitude=p_longitude,customer_location_accuracy_meters=p_accuracy_meters,customer_location_received_at=now() where id=v_request.shipment_id;
 update shipment_customer_location_requests set used_at=now() where id=v_request.id;
end; $$;
revoke all on function public.create_shipment_customer_location_request(uuid,text) from public,anon;
grant execute on function public.create_shipment_customer_location_request(uuid,text) to authenticated;
revoke all on function public.get_public_shipment_customer_location_request(text) from public;
grant execute on function public.get_public_shipment_customer_location_request(text) to anon,authenticated,service_role;
revoke all on function public.submit_public_shipment_customer_location(text,double precision,double precision,double precision) from public;
grant execute on function public.submit_public_shipment_customer_location(text,double precision,double precision,double precision) to anon,authenticated,service_role;