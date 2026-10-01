-- SOLO LECTURA. Diagnóstico previo a la migración de usuarios/autenticación.
-- No modifica auth.users, perfiles, permisos ni contraseñas.
WITH profile_columns AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'column', column_name,
    'type', data_type,
    'nullable', is_nullable,
    'default', column_default
  ) ORDER BY ordinal_position), '[]'::jsonb) AS value
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'profiles'
), related_tables AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object('table', table_name) ORDER BY table_name), '[]'::jsonb) AS value
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND (table_name ILIKE '%password%' OR table_name ILIKE '%reset%' OR table_name ILIKE '%recovery%' OR table_name ILIKE '%notification%' OR table_name IN ('permissions', 'profile_permissions'))
), related_columns AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object('table', table_name, 'column', column_name, 'type', data_type, 'nullable', is_nullable) ORDER BY table_name, ordinal_position), '[]'::jsonb) AS value
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND (table_name ILIKE '%password%' OR table_name ILIKE '%reset%' OR table_name ILIKE '%recovery%' OR table_name ILIKE '%notification%' OR table_name IN ('permissions', 'profile_permissions'))
), policies AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object('table', tablename, 'policy', policyname, 'command', cmd, 'roles', roles, 'using', qual, 'check', with_check) ORDER BY tablename, policyname), '[]'::jsonb) AS value
  FROM pg_policies
  WHERE schemaname = 'public'
    AND (tablename IN ('profiles', 'profile_permissions', 'permissions') OR tablename ILIKE '%password%' OR tablename ILIKE '%reset%' OR tablename ILIKE '%recovery%' OR tablename ILIKE '%notification%')
), users_snapshot AS (
  SELECT coalesce(jsonb_agg(to_jsonb(row_data) ORDER BY row_data.created_at), '[]'::jsonb) AS value
  FROM (
    SELECT profile.id,
      profile.full_name,
      profile.role,
      profile.company_id,
      profile.active,
      profile.created_at,
      to_jsonb(profile) ->> 'username' AS username,
      to_jsonb(profile) ->> 'must_change_password' AS must_change_password,
      to_jsonb(profile) ->> 'recovery_email' AS recovery_email,
      to_jsonb(profile) ->> 'recovery_email_verified_at' AS recovery_email_verified_at,
      to_jsonb(profile) ->> 'can_reset_user_passwords' AS can_reset_user_passwords,
      auth_user.email AS auth_email,
      auth_user.email_confirmed_at,
      auth_user.confirmed_at AS auth_confirmed_at
    FROM public.profiles profile
    LEFT JOIN auth.users auth_user ON auth_user.id = profile.id
    ORDER BY profile.created_at
    LIMIT 250
  ) row_data
), email_dependencies AS (
  SELECT coalesce(jsonb_agg(jsonb_build_object('schema', routine_schema, 'function', routine_name, 'definition', routine_definition) ORDER BY routine_schema, routine_name), '[]'::jsonb) AS value
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND lower(coalesce(routine_definition, '')) LIKE '%email%'
)
SELECT jsonb_build_object(
  'profile_columns', (SELECT value FROM profile_columns),
  'related_tables', (SELECT value FROM related_tables),
  'related_columns', (SELECT value FROM related_columns),
  'rls_policies', (SELECT value FROM policies),
  'users_snapshot', (SELECT value FROM users_snapshot),
  'email_function_dependencies', (SELECT value FROM email_dependencies)
) AS auth_user_architecture;
