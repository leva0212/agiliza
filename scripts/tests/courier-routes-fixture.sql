-- Fixture aislado reconstruido del esquema compartido el 22/09/2026. Nunca ejecutar en producción.
do $$ begin
  if not exists(select 1 from pg_roles where rolname='anon') then create role anon; end if;
  if not exists(select 1 from pg_roles where rolname='authenticated') then create role authenticated; end if;
  if not exists(select 1 from pg_roles where rolname='service_role') then create role service_role bypassrls; end if;
end $$;
create schema auth; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth, public to authenticated, anon;
create extension if not exists "uuid-ossp";
create type public.user_role as enum ('super_admin','company_admin','courier','seller');
create table auth.users(id uuid primary key);
create table public.companies(id uuid primary key, is_owner_company boolean);
create table public.neighborhoods(id bigint primary key);
create sequence public.route_coverage_id_seq;
create table public.profiles (id uuid not null,
company_id uuid,
role user_role not null,
full_name text not null,
phone text,
active bool default true,
created_at timestamptz default now(),
email text,
is_system_user bool default false,
must_change_password bool default true not null,
created_by uuid,
last_password text,
can_view_all_company_shipments bool default false,
can_deliver bool default false not null,
delivery_pay numeric default 0 not null,
failed_pay numeric default 0 not null);
create table public.routes (id uuid default uuid_generate_v4() not null,
name text not null,
company_delivery_charge numeric default 0 not null,
courier_delivery_pay numeric default 0 not null,
company_failed_charge numeric default 0 not null,
courier_failed_pay numeric default 0 not null,
active bool default true,
created_at timestamptz default now(),
estimated_hours int4 default 24 not null);
create table public.couriers (id uuid default uuid_generate_v4() not null,
profile_id uuid not null,
notes text,
created_at timestamptz default now(),
active bool default true not null);
create table public.courier_routes (id uuid default uuid_generate_v4() not null,
courier_id uuid not null,
route_id uuid not null);
create table public.route_coverage (id int8 default nextval('route_coverage_id_seq'::regclass) not null,
route_id uuid not null,
neighborhood_id int8 not null,
created_at timestamptz default now());
create table public.permissions (id text not null,
description text not null);
create table public.profile_permissions (profile_id uuid not null,
permission_id text not null,
created_at timestamptz default now() not null);
alter table public.courier_routes add constraint courier_routes_pkey PRIMARY KEY (id);
alter table public.couriers add constraint couriers_pkey PRIMARY KEY (id);
alter table public.permissions add constraint permissions_pkey PRIMARY KEY (id);
alter table public.profile_permissions add constraint profile_permissions_pkey PRIMARY KEY (profile_id, permission_id);
alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);
alter table public.route_coverage add constraint route_coverage_pkey PRIMARY KEY (id);
alter table public.routes add constraint routes_pkey PRIMARY KEY (id);
alter table public.courier_routes add constraint courier_routes_courier_id_fkey FOREIGN KEY (courier_id) REFERENCES couriers(id) ON DELETE CASCADE;
alter table public.courier_routes add constraint courier_routes_courier_id_route_id_key UNIQUE (courier_id, route_id);
alter table public.courier_routes add constraint courier_routes_route_id_fkey FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE;
alter table public.couriers add constraint couriers_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id);
alter table public.profile_permissions add constraint profile_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE;
alter table public.profile_permissions add constraint profile_permissions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE;
alter table public.profiles add constraint profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES companies(id);
alter table public.profiles add constraint profiles_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);
alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.route_coverage add constraint route_coverage_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id);
alter table public.route_coverage add constraint route_coverage_route_id_fkey FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE;
alter table public.route_coverage add constraint route_coverage_unique UNIQUE (route_id, neighborhood_id);
create function public.is_owner_company_user() returns boolean language sql security definer as $$ select exists(select 1 from public.profiles p join public.companies c on c.id=p.company_id where p.id=auth.uid() and c.is_owner_company) $$;
create function public.current_profile_company_id() returns uuid language sql security definer as $$ select company_id from public.profiles where id=auth.uid() $$;
alter table public.profiles enable row level security;
create policy profiles_select_company_privacy on public.profiles for select to authenticated using (((id = auth.uid()) OR is_owner_company_user() OR (company_id = current_profile_company_id())));
grant all on all tables in schema public to anon, authenticated, service_role;
