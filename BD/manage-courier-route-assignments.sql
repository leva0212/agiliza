-- Fase 1. Ejecutar antes de desplegar el código que usa estas RPC.
-- Reutiliza courier_routes y sus FK/UNIQUE existentes. No modifica route_coverage.
begin;

-- No fusionar automáticamente mensajeros duplicados: pueden tener inventario/tarifas.
do $$ begin
  if exists (select 1 from public.couriers group by profile_id having count(*) > 1) then
    raise exception 'Hay varios couriers para un profile_id. Resolverlos antes de continuar.';
  end if;
end $$;
create unique index if not exists couriers_profile_id_unique on public.couriers(profile_id);
create index if not exists courier_routes_route_id_idx on public.courier_routes(route_id);

-- Sin borrar asignaciones: solo sincroniza la disponibilidad operativa.
create or replace function public.sync_courier_profile_availability()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  update public.couriers set active = (new.active is true and new.can_deliver is true)
    where profile_id = new.id;
  return new;
end;
$$;
revoke all on function public.sync_courier_profile_availability() from public, anon, authenticated;
drop trigger if exists sync_courier_profile_availability on public.profiles;
create trigger sync_courier_profile_availability after update of active, can_deliver on public.profiles
  for each row execute function public.sync_courier_profile_availability();

create or replace function public.can_manage_courier_routes()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.profiles p
    where p.id = auth.uid() and p.active is true and p.role = 'super_admin');
$$;

-- Lectura operativa interna, lectura propia y administración. Evita recursión RLS.
create or replace function public.can_read_courier(p_courier_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles viewer
    left join public.companies company on company.id = viewer.company_id
    join public.couriers courier on courier.id = p_courier_id
    where viewer.id = auth.uid() and viewer.active is true
      and (viewer.role = 'super_admin' or (company.is_owner_company is true and viewer.role <> 'courier')
        or courier.profile_id = viewer.id)
  );
$$;

alter table public.couriers enable row level security;
alter table public.courier_routes enable row level security;
revoke all on public.couriers, public.courier_routes from anon, authenticated;
grant select on public.couriers, public.courier_routes to authenticated;
drop policy if exists couriers_read_assignments on public.couriers;
create policy couriers_read_assignments on public.couriers for select to authenticated
  using (public.can_read_courier(id));
drop policy if exists courier_routes_read_assignments on public.courier_routes;
create policy courier_routes_read_assignments on public.courier_routes for select to authenticated
  using (public.can_read_courier(courier_id));

-- Devuelve únicamente las rutas vigentes del usuario autenticado.
-- Preparada para la fase 2; no cambia aún las políticas de envíos/inventario/rutas.
create or replace function public.current_courier_route_ids()
returns setof uuid language sql stable security definer set search_path = '' as $$
  select cr.route_id from public.courier_routes cr
  join public.couriers c on c.id = cr.courier_id
  join public.profiles p on p.id = c.profile_id
  join public.routes r on r.id = cr.route_id
  where p.id = auth.uid() and p.active is true and p.can_deliver is true
    and c.active is true and r.active is true;
$$;

-- Guardado N:N por cualquiera de los dos lados. Todo se confirma o revierte junto.
-- expected_ids impide sobrescribir silenciosamente cambios de otro administrador.
create or replace function public.save_courier_route_assignments(
  p_axis text, p_subject_id uuid, p_ids uuid[], p_expected_ids uuid[]
) returns void language plpgsql security definer set search_path = '' as $$
declare
  v_current uuid[];
  v_ids uuid[];
  v_expected uuid[];
begin
  if not public.can_manage_courier_routes() then
    raise exception 'Solo un administrador activo puede administrar las asignaciones.' using errcode = '42501';
  end if;
  if p_axis is null or p_axis not in ('courier','route') or p_subject_id is null
    or p_ids is null or p_expected_ids is null
    or array_position(p_ids, null) is not null or array_position(p_expected_ids, null) is not null then
    raise exception 'Solicitud de asignación inválida.';
  end if;
  -- Serializa las dos direcciones para evitar cambios perdidos entre pantallas.
  perform pg_catalog.pg_advisory_xact_lock(726431, 1);
  select coalesce(array_agg(distinct x order by x), '{}'::uuid[]) into v_ids from unnest(p_ids) x;
  select coalesce(array_agg(distinct x order by x), '{}'::uuid[]) into v_expected from unnest(p_expected_ids) x;
  if p_axis = 'courier' then
    perform 1 from public.couriers where id = p_subject_id for share;
    if not found then raise exception 'El mensajero ya no existe.'; end if;
    select coalesce(array_agg(route_id order by route_id), '{}'::uuid[]) into v_current
      from public.courier_routes where courier_id = p_subject_id;
  else
    perform 1 from public.routes where id = p_subject_id for share;
    if not found then raise exception 'La ruta ya no existe.'; end if;
    select coalesce(array_agg(courier_id order by courier_id), '{}'::uuid[]) into v_current
      from public.courier_routes where route_id = p_subject_id;
  end if;
  if v_current <> v_expected then
    raise exception 'Las asignaciones cambiaron. Recargue los datos antes de guardar.' using errcode = '40001';
  end if;

  -- Bloquea los candidatos mientras valida. Los inactivos ya vinculados se conservan
  -- y pueden desvincularse; nunca se admiten nuevas asignaciones inactivas.
  if p_axis = 'courier' then
    perform 1 from public.profiles p join public.couriers c on c.profile_id = p.id
      where c.id = p_subject_id for share of p, c;
    perform 1 from public.routes where id = any(v_ids) order by id for share;
    if exists (
      select 1 from unnest(v_ids) x
      where not (x = any(v_current)) and not exists (
        select 1 from public.routes r, public.couriers c join public.profiles p on p.id = c.profile_id
        where r.id = x and r.active is true and c.id = p_subject_id
          and c.active is true and p.active is true and p.can_deliver is true
      )
    ) then raise exception 'Solo puede agregar rutas activas a un mensajero activo habilitado para entregar.'; end if;
    delete from public.courier_routes where courier_id = p_subject_id and not (route_id = any(v_ids));
    insert into public.courier_routes(courier_id, route_id)
      select p_subject_id, x from unnest(v_ids) x where not (x = any(v_current));
  else
    perform 1 from public.couriers c join public.profiles p on p.id = c.profile_id
      where c.id = any(v_ids) order by c.id for share of c, p;
    if exists (
      select 1 from unnest(v_ids) x
      where not (x = any(v_current)) and not exists (
        select 1 from public.couriers c join public.profiles p on p.id = c.profile_id,
          public.routes r where c.id = x and c.active is true and p.active is true
          and p.can_deliver is true and r.id = p_subject_id and r.active is true
      )
    ) then raise exception 'Solo puede agregar mensajeros activos habilitados para entregar a una ruta activa.'; end if;
    delete from public.courier_routes where route_id = p_subject_id and not (courier_id = any(v_ids));
    insert into public.courier_routes(courier_id, route_id)
      select x, p_subject_id from unnest(v_ids) x where not (x = any(v_current));
  end if;
end;
$$;

revoke all on function public.can_manage_courier_routes() from public, anon;
revoke all on function public.can_read_courier(uuid) from public, anon;
revoke all on function public.current_courier_route_ids() from public, anon;
revoke all on function public.save_courier_route_assignments(text,uuid,uuid[],uuid[]) from public, anon;
grant execute on function public.can_manage_courier_routes() to authenticated;
grant execute on function public.can_read_courier(uuid) to authenticated;
grant execute on function public.current_courier_route_ids() to authenticated;
grant execute on function public.save_courier_route_assignments(text,uuid,uuid[],uuid[]) to authenticated;
commit;
