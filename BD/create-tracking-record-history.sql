create table if not exists public.tracking_record_history (
  id bigint generated always as identity primary key,
  tracking_record_id uuid not null references public.tracking_records(id) on delete cascade,
  changed_at timestamptz not null default now(),
  changed_by_profile_id uuid references public.profiles(id) on delete set null,
  field_name text not null,
  previous_value text,
  new_value text
);

create index if not exists tracking_record_history_record_changed_at_idx
  on public.tracking_record_history(tracking_record_id, changed_at desc);

alter table public.tracking_record_history enable row level security;

drop policy if exists "tracking_record_history_select_owner_company" on public.tracking_record_history;
create policy "tracking_record_history_select_owner_company"
on public.tracking_record_history
for select
to authenticated
using (public.is_owner_company_user());

create or replace function public.log_tracking_record_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  old_province_name text;
  new_province_name text;
  old_company_name text;
  new_company_name text;
begin
  if old.full_name is distinct from new.full_name then
    insert into public.tracking_record_history (
      tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value
    ) values (
      new.id, auth.uid(), 'Nombre', old.full_name, new.full_name
    );
  end if;

  if old.identification is distinct from new.identification then
    insert into public.tracking_record_history (
      tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value
    ) values (
      new.id, auth.uid(), 'Cédula', old.identification, new.identification
    );
  end if;

  if old.province_id is distinct from new.province_id then
    select name into old_province_name from public.provinces where id = old.province_id;
    select name into new_province_name from public.provinces where id = new.province_id;

    insert into public.tracking_record_history (
      tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value
    ) values (
      new.id, auth.uid(), 'Provincia', old_province_name, new_province_name
    );
  end if;

  if old.status is distinct from new.status then
    insert into public.tracking_record_history (
      tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value
    ) values (
      new.id, auth.uid(), 'Estatus', old.status, new.status
    );
  end if;

  if old.comment is distinct from new.comment then
    insert into public.tracking_record_history (
      tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value
    ) values (
      new.id, auth.uid(), 'Comentario', old.comment, new.comment
    );
  end if;

  if old.company_id is distinct from new.company_id then
    select coalesce(nullif(trim(trade_name), ''), name)
      into old_company_name
      from public.companies
      where id = old.company_id;
    select coalesce(nullif(trim(trade_name), ''), name)
      into new_company_name
      from public.companies
      where id = new.company_id;

    insert into public.tracking_record_history (
      tracking_record_id, changed_by_profile_id, field_name, previous_value, new_value
    ) values (
      new.id, auth.uid(), 'Empresa', old_company_name, new_company_name
    );
  end if;

  return new;
end;
$$;

drop trigger if exists log_tracking_record_changes on public.tracking_records;
create trigger log_tracking_record_changes
after update on public.tracking_records
for each row execute function public.log_tracking_record_changes();
