create table if not exists public.tracking_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  company_id uuid not null references public.companies(id),
  full_name text not null check (length(trim(full_name)) > 0),
  identification text not null check (length(trim(identification)) > 0),
  province_id integer not null references public.provinces(id),
  status text not null default 'EN RUTA' check (status in (
    'ENTREGADO',
    'CANCELADA DTS',
    'SIN COBERTURA',
    'RECHAZADA POR CTE',
    'EN RUTA',
    'ILOCALIZABLE 1',
    'ILOCALIZABLE 2',
    'INTENTO FALLIDO'
  )),
  comment text,
  constraint tracking_records_comment_length check (comment is null or length(comment) <= 500)
);

create index if not exists tracking_records_company_created_at_idx
  on public.tracking_records(company_id, created_at desc);

create index if not exists tracking_records_province_created_at_idx
  on public.tracking_records(province_id, created_at desc);

alter table public.tracking_records enable row level security;

create or replace function public.current_profile_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id
  from public.profiles
  where id = auth.uid()
    and active = true
  limit 1;
$$;

create or replace function public.is_owner_company_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles profile
    join public.companies company on company.id = profile.company_id
    where profile.id = auth.uid()
      and profile.active = true
      and company.is_owner_company = true
  );
$$;

create or replace function public.enforce_tracking_record_permissions()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if not public.is_owner_company_user() then
      if new.company_id is distinct from public.current_profile_company_id()
        or new.status is distinct from 'EN RUTA'
        or new.comment is not null then
        raise exception 'No tiene permiso para definir empresa, estatus o comentario.';
      end if;
    end if;

    return new;
  end if;

  if new.created_at is distinct from old.created_at then
    raise exception 'La fecha de creación no se puede modificar.';
  end if;

  if not public.is_owner_company_user() then
    if new.company_id is distinct from old.company_id
      or new.status is distinct from old.status
      or new.comment is distinct from old.comment then
      raise exception 'Solo puede modificar nombre, cédula y provincia.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_tracking_record_permissions on public.tracking_records;
create trigger enforce_tracking_record_permissions
before insert or update on public.tracking_records
for each row execute function public.enforce_tracking_record_permissions();

create policy "tracking_records_select_by_company"
on public.tracking_records
for select
to authenticated
using (
  public.is_owner_company_user()
  or company_id = public.current_profile_company_id()
);

create policy "tracking_records_insert_by_company"
on public.tracking_records
for insert
to authenticated
with check (
  public.is_owner_company_user()
  or company_id = public.current_profile_company_id()
);

create policy "tracking_records_update_by_company"
on public.tracking_records
for update
to authenticated
using (
  public.is_owner_company_user()
  or company_id = public.current_profile_company_id()
)
with check (
  public.is_owner_company_user()
  or company_id = public.current_profile_company_id()
);
