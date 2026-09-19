-- Privacidad de identidades y aislamiento entre empresas.
-- Ejecutar una vez en Supabase SQL Editor.
--
-- Resultado:
--   * Agiliza puede consultar todos los perfiles y empresas.
--   * Una empresa cliente solo puede consultar sus propios perfiles y empresa.
--   * Un cliente no puede consultar nombres de empleados de Agiliza ni datos
--     de otra empresa cliente directamente mediante la API de Supabase.

alter table public.profiles enable row level security;
alter table public.companies enable row level security;

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and cmd in ('SELECT', 'ALL')
  loop
    execute format('drop policy if exists %I on public.profiles', policy_record.policyname);
  end loop;
end
$$;

create policy "profiles_select_company_privacy"
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_owner_company_user()
  or company_id = public.current_profile_company_id()
);

do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'companies'
      and cmd in ('SELECT', 'ALL')
  loop
    execute format('drop policy if exists %I on public.companies', policy_record.policyname);
  end loop;
end
$$;

create policy "companies_select_company_privacy"
on public.companies
for select
to authenticated
using (
  public.is_owner_company_user()
  or id = public.current_profile_company_id()
);

-- Verificación rápida de las políticas resultantes.
select schemaname, tablename, policyname, cmd
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'companies')
order by tablename, policyname;