--
-- PostgreSQL database dump
--

\restrict Xy5EfpaJAWLfUqaXmKgSgpAEZqN50IHxUIi5ikpqC1gUUlkwVxVXAanwsn4ZN4l

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.4

-- Started on 2026-09-30 21:15:32

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 21 (class 2615 OID 16498)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- TOC entry 12 (class 2615 OID 16392)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- TOC entry 19 (class 2615 OID 16578)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- TOC entry 18 (class 2615 OID 16567)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- TOC entry 11 (class 2615 OID 16390)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- TOC entry 135 (class 2615 OID 16559)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- TOC entry 22 (class 2615 OID 16546)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- TOC entry 16 (class 2615 OID 16607)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- TOC entry 2 (class 3079 OID 16393)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 4 (class 3079 OID 16447)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 5 (class 3079 OID 16608)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 3 (class 3079 OID 16436)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1294 (class 1247 OID 16744)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- TOC entry 1318 (class 1247 OID 16885)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- TOC entry 1291 (class 1247 OID 16738)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1288 (class 1247 OID 16732)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone',
    'recovery_code'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1336 (class 1247 OID 16988)
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1348 (class 1247 OID 17061)
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1330 (class 1247 OID 16966)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1339 (class 1247 OID 16998)
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1324 (class 1247 OID 16927)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1420 (class 1247 OID 25424)
-- Name: receiver_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.receiver_type AS ENUM (
    'owner',
    'authorized',
    'other'
);


ALTER TYPE public.receiver_type OWNER TO postgres;

--
-- TOC entry 1423 (class 1247 OID 25430)
-- Name: settlement_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.settlement_status AS ENUM (
    'open',
    'closed'
);


ALTER TYPE public.settlement_status OWNER TO postgres;

--
-- TOC entry 1417 (class 1247 OID 25408)
-- Name: shipment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.shipment_status AS ENUM (
    'created',
    'assigned',
    'in_route',
    'delivered',
    'failed_attempt',
    'rejected',
    'cancelled'
);


ALTER TYPE public.shipment_status OWNER TO postgres;

--
-- TOC entry 1414 (class 1247 OID 25401)
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'super_admin',
    'company_admin',
    'courier',
    'seller'
);


ALTER TYPE public.user_role OWNER TO postgres;

--
-- TOC entry 1426 (class 1247 OID 25436)
-- Name: week_day; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.week_day AS ENUM (
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
);


ALTER TYPE public.week_day OWNER TO postgres;

--
-- TOC entry 1378 (class 1247 OID 17408)
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_realtime_admin;

--
-- TOC entry 1387 (class 1247 OID 17176)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_realtime_admin;

--
-- TOC entry 1390 (class 1247 OID 17191)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_realtime_admin;

--
-- TOC entry 1405 (class 1247 OID 17450)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_realtime_admin;

--
-- TOC entry 1408 (class 1247 OID 17421)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_realtime_admin;

--
-- TOC entry 1393 (class 1247 OID 17330)
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- TOC entry 633 (class 1255 OID 16544)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 633
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 531 (class 1255 OID 16714)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- TOC entry 632 (class 1255 OID 16543)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 632
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 639 (class 1255 OID 16542)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 639
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 628 (class 1255 OID 16551)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 628
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 548 (class 1255 OID 16572)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 548
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 518 (class 1255 OID 16553)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 518
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 480 (class 1255 OID 16563)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- TOC entry 493 (class 1255 OID 16564)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- TOC entry 539 (class 1255 OID 16574)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- TOC entry 5372 (class 0 OID 0)
-- Dependencies: 539
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 536 (class 1255 OID 16665)
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- TOC entry 496 (class 1255 OID 16391)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- TOC entry 631 (class 1255 OID 30009)
-- Name: add_route_bulk_coverage(uuid, bigint[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_route_bulk_coverage(p_route_id uuid, p_district_ids bigint[]) RETURNS TABLE(added_neighborhoods integer, affected_districts integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE v_added integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND active = true AND role = 'super_admin') THEN RAISE EXCEPTION 'No autorizado para modificar cobertura de rutas.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM routes WHERE id = p_route_id) THEN RAISE EXCEPTION 'Ruta no encontrada.'; END IF;
  WITH targets AS (SELECT DISTINCT unnest(p_district_ids) AS id), inserted AS (
    INSERT INTO route_coverage (route_id, neighborhood_id)
    SELECT p_route_id, n.id FROM neighborhoods n JOIN targets t ON t.id = n.district_id
    ON CONFLICT (route_id, neighborhood_id) DO NOTHING RETURNING neighborhood_id
  ) SELECT count(*) INTO v_added FROM inserted;
  RETURN QUERY SELECT v_added, (SELECT count(*)::integer FROM (SELECT DISTINCT unnest(p_district_ids)) t);
END; $$;


ALTER FUNCTION public.add_route_bulk_coverage(p_route_id uuid, p_district_ids bigint[]) OWNER TO postgres;

--
-- TOC entry 521 (class 1255 OID 30010)
-- Name: add_route_bulk_coverage_with_neighborhoods(uuid, bigint[], bigint[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) RETURNS TABLE(added_neighborhoods integer, affected_districts integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE v_added integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND active = true AND role = 'super_admin') THEN RAISE EXCEPTION 'No autorizado para modificar cobertura de rutas.'; END IF;
  WITH targets AS (SELECT DISTINCT unnest(coalesce(p_district_ids, '{}'::bigint[])) AS id), chosen AS (
    SELECT n.id FROM neighborhoods n JOIN targets t ON t.id = n.district_id
    UNION SELECT DISTINCT n.id FROM neighborhoods n WHERE n.id = ANY(coalesce(p_neighborhood_ids, '{}'::bigint[]))
  ), inserted AS (
    INSERT INTO route_coverage(route_id, neighborhood_id) SELECT p_route_id, id FROM chosen ON CONFLICT(route_id, neighborhood_id) DO NOTHING RETURNING neighborhood_id
  ) SELECT count(*) INTO v_added FROM inserted;
  RETURN QUERY SELECT v_added, (SELECT count(DISTINCT district_id)::integer FROM neighborhoods WHERE id = ANY(coalesce(p_neighborhood_ids, '{}'::bigint[])) OR district_id = ANY(coalesce(p_district_ids, '{}'::bigint[])));
END; $$;


ALTER FUNCTION public.add_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) OWNER TO postgres;

--
-- TOC entry 567 (class 1255 OID 30231)
-- Name: add_support_participant(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.add_support_participant() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.chat_conversation_participants(conversation_id, profile_id)
  SELECT NEW.conversation_id, NEW.author_id
  FROM public.chat_conversations c
  JOIN public.profiles author ON author.id = NEW.author_id
  WHERE c.id = NEW.conversation_id
    AND c.category = 'support'
    AND author.company_id = c.owner_company_id
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.add_support_participant() OWNER TO postgres;

--
-- TOC entry 538 (class 1255 OID 30047)
-- Name: adjust_inventory(uuid, uuid, uuid, integer, integer, integer, text, text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.adjust_inventory(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_change integer, p_low_stock integer, p_medium_stock integer, p_reason text, p_notes text DEFAULT NULL::text, p_created_by uuid DEFAULT NULL::uuid) RETURNS TABLE(inventory_id uuid, quantity_after integer)
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
  current_inventory public.inventory%ROWTYPE;
  next_quantity integer;
BEGIN
  IF p_quantity_change = 0 THEN RAISE EXCEPTION 'El ajuste debe cambiar la cantidad.'; END IF;
  IF p_low_stock < 0 OR p_medium_stock <= p_low_stock THEN RAISE EXCEPTION 'Los niveles de alerta no son válidos.'; END IF;

  SELECT * INTO current_inventory
  FROM public.inventory
  WHERE courier_id = p_courier_id AND company_id = p_company_id AND product_id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.inventory (courier_id, company_id, product_id, quantity, low_stock, medium_stock)
    VALUES (p_courier_id, p_company_id, p_product_id, p_quantity_change, p_low_stock, p_medium_stock)
    RETURNING * INTO current_inventory;

    INSERT INTO public.inventory_movements (inventory_id, quantity_before, quantity_change, quantity_after, reason, notes, created_by)
    VALUES (current_inventory.id, 0, p_quantity_change, p_quantity_change, p_reason, nullif(trim(coalesce(p_notes, '')), ''), p_created_by);
  ELSE
    next_quantity := current_inventory.quantity + p_quantity_change;
    UPDATE public.inventory
      SET quantity = next_quantity, low_stock = p_low_stock, medium_stock = p_medium_stock, updated_at = now()
      WHERE id = current_inventory.id;

    INSERT INTO public.inventory_movements (inventory_id, quantity_before, quantity_change, quantity_after, reason, notes, created_by)
    VALUES (current_inventory.id, current_inventory.quantity, p_quantity_change, next_quantity, p_reason, nullif(trim(coalesce(p_notes, '')), ''), p_created_by);
  END IF;

  RETURN QUERY SELECT current_inventory.id, coalesce(next_quantity, p_quantity_change);
END;
$$;


ALTER FUNCTION public.adjust_inventory(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_change integer, p_low_stock integer, p_medium_stock integer, p_reason text, p_notes text, p_created_by uuid) OWNER TO postgres;

--
-- TOC entry 607 (class 1255 OID 30008)
-- Name: apply_route_bulk_schedule(uuid, bigint[], integer, integer, text[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.apply_route_bulk_schedule(p_route_id uuid, p_district_ids bigint[], p_min_hours integer, p_max_hours integer, p_days text[]) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_count integer;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND active = true AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'No autorizado para modificar configuraciones de rutas.';
  END IF;

  IF p_min_hours NOT IN (0, 24, 48, 72) OR p_max_hours NOT IN (0, 24, 48, 72, 96) THEN
    RAISE EXCEPTION 'El tiempo seleccionado no es válido.';
  END IF;

  WITH target_districts AS (
    SELECT DISTINCT district_id
    FROM unnest(p_district_ids) AS district_id
  )
  SELECT count(*) INTO v_count
  FROM target_districts target
  WHERE EXISTS (
    SELECT 1
    FROM route_coverage coverage
    JOIN neighborhoods neighborhood ON neighborhood.id = coverage.neighborhood_id
    WHERE coverage.route_id = p_route_id
      AND neighborhood.district_id = target.district_id
  );

  IF v_count <> cardinality(ARRAY(SELECT DISTINCT unnest(p_district_ids))) THEN
    RAISE EXCEPTION 'Uno o más distritos no tienen cobertura en esta ruta.';
  END IF;

  DELETE FROM route_district_delivery_times
  WHERE route_id = p_route_id AND district_id = ANY(p_district_ids);

  DELETE FROM route_district_visit_days
  WHERE route_id = p_route_id AND district_id = ANY(p_district_ids);

  INSERT INTO route_district_delivery_times (route_id, district_id, min_hours, max_hours)
  SELECT p_route_id, district_id, p_min_hours, CASE WHEN p_min_hours = 0 THEN 0 ELSE p_max_hours END
  FROM (SELECT DISTINCT unnest(p_district_ids) AS district_id) targets;

  IF cardinality(p_days) > 0 THEN
    INSERT INTO route_district_visit_days (route_id, district_id, day)
    SELECT p_route_id, target.district_id, day_value
    FROM (SELECT DISTINCT unnest(p_district_ids) AS district_id) target
    CROSS JOIN unnest(p_days) AS day_value;
  END IF;

  RETURN v_count;
END;
$$;


ALTER FUNCTION public.apply_route_bulk_schedule(p_route_id uuid, p_district_ids bigint[], p_min_hours integer, p_max_hours integer, p_days text[]) OWNER TO postgres;

--
-- TOC entry 541 (class 1255 OID 30501)
-- Name: assign_financial_record_to_settlement(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_financial_record_to_settlement(p_record_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  record_row public.shipment_delivery_financial_records%ROWTYPE;
  schedule_row public.settlement_schedules%ROWTYPE;
  subject_type text;
  subject_id uuid;
  start_date date;
  end_date date;
  period_id uuid;
  period_status text;
  days_per_period integer;
BEGIN
  SELECT * INTO record_row FROM public.shipment_delivery_financial_records WHERE id = p_record_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'El registro financiero no existe.'; END IF;

  subject_type := CASE WHEN record_row.record_type = 'company_delivery_charge' THEN 'company' ELSE 'courier' END;
  subject_id := CASE WHEN subject_type = 'company' THEN record_row.company_id ELSE record_row.courier_id END;
  IF subject_id IS NULL THEN RETURN; END IF;

  SELECT * INTO schedule_row
  FROM public.settlement_schedules schedule
  WHERE schedule.active
    AND schedule.party_type = subject_type
    AND (schedule.party_id = subject_id OR schedule.party_id IS NULL)
  ORDER BY (schedule.party_id IS NOT NULL) DESC
  LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  IF schedule_row.frequency = 'monthly' THEN
    start_date := date_trunc('month', record_row.occurred_at AT TIME ZONE 'America/Costa_Rica')::date;
    end_date := (start_date + interval '1 month')::date;
  ELSE
    days_per_period := CASE schedule_row.frequency WHEN 'weekly' THEN 7 WHEN 'biweekly' THEN 14 ELSE schedule_row.interval_days END;
    start_date := schedule_row.anchor_date + floor(((record_row.occurred_at AT TIME ZONE 'America/Costa_Rica')::date - schedule_row.anchor_date)::numeric / days_per_period)::integer * days_per_period;
    end_date := start_date + days_per_period;
  END IF;

  SELECT period.id INTO period_id
  FROM public.settlement_periods period
  WHERE period.schedule_id = schedule_row.id
    AND period.party_id = subject_id
    AND period.starts_at = (start_date::timestamp AT TIME ZONE 'America/Costa_Rica')
  FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.settlement_periods(
  schedule_id,
  party_type,
  party_id,
  starts_at,
  ends_at,
  status
)
VALUES (
  schedule_row.id,
  subject_type,
  subject_id,
  (start_date::timestamp AT TIME ZONE 'America/Costa_Rica'),
  (end_date::timestamp AT TIME ZONE 'America/Costa_Rica'),
  'open'
)
RETURNING id INTO period_id;
  END IF;

  SELECT period.status::text INTO period_status
  FROM public.settlement_periods period
  WHERE period.id = period_id;
  IF period_status IS DISTINCT FROM 'open' THEN
    RAISE EXCEPTION 'El período financiero correspondiente no está abierto. Período: % · Estado: %.', period_id, coalesce(period_status, 'no encontrado');
  END IF;

  INSERT INTO public.settlement_period_items(period_id, shipment_id, company_id, courier_id, financial_record_id, original_amount, final_amount)
  SELECT period_id, record_row.shipment_id, record_row.company_id, record_row.courier_id, record_row.id, record_row.original_amount, record_row.amount
  WHERE NOT EXISTS (
    SELECT 1 FROM public.settlement_period_items item
    WHERE item.financial_record_id = record_row.id
  );
END;
$$;


ALTER FUNCTION public.assign_financial_record_to_settlement(p_record_id uuid) OWNER TO postgres;

--
-- TOC entry 556 (class 1255 OID 30554)
-- Name: assign_unassigned_financial_records_to_current_period(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.assign_unassigned_financial_records_to_current_period(p_party_type text) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  financial record;
  schedule_row settlement_schedules%ROWTYPE;
  v_subject_id uuid;
  v_period_id uuid;
  v_start_date date;
  v_end_date date;
  v_days integer;
  v_assigned integer := 0;
  v_schedule_found boolean := false;
BEGIN
  IF p_party_type NOT IN ('company','courier') THEN
    RAISE EXCEPTION 'Tipo de liquidación no válido.';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM profiles profile
    JOIN companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid()
      AND profile.active
      AND profile.role IN ('super_admin','company_admin')
      AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para recuperar registros de liquidación.';
  END IF;

  FOR financial IN
    SELECT financial_record.*
    FROM shipment_delivery_financial_records financial_record
    WHERE financial_record.status = 'pending'
      AND financial_record.record_type = CASE WHEN p_party_type = 'company' THEN 'company_delivery_charge' ELSE 'courier_delivery_payment' END
      AND NOT EXISTS (
        SELECT 1 FROM settlement_period_items item
        WHERE item.financial_record_id = financial_record.id
      )
    ORDER BY financial_record.occurred_at, financial_record.id
  LOOP
    v_subject_id := CASE WHEN p_party_type = 'company' THEN financial.company_id ELSE financial.courier_id END;
    IF v_subject_id IS NULL THEN CONTINUE; END IF;

    SELECT schedule.* INTO schedule_row
    FROM settlement_schedules schedule
    WHERE schedule.active
      AND schedule.party_type = p_party_type
      AND (schedule.party_id = v_subject_id OR schedule.party_id IS NULL)
    ORDER BY (schedule.party_id IS NOT NULL) DESC
    LIMIT 1;
    IF NOT FOUND THEN CONTINUE; END IF;
    v_schedule_found := true;

    IF schedule_row.frequency = 'monthly' THEN
      v_start_date := date_trunc('month', now() AT TIME ZONE 'America/Costa_Rica')::date;
      v_end_date := (v_start_date + interval '1 month')::date;
    ELSE
      v_days := CASE schedule_row.frequency WHEN 'weekly' THEN 7 WHEN 'biweekly' THEN 14 ELSE schedule_row.interval_days END;
      v_start_date := schedule_row.anchor_date + floor(((now() AT TIME ZONE 'America/Costa_Rica')::date - schedule_row.anchor_date)::numeric / v_days)::integer * v_days;
      v_end_date := v_start_date + v_days;
    END IF;

    SELECT period.id INTO v_period_id
    FROM settlement_periods period
    WHERE period.schedule_id = schedule_row.id
      AND period.party_id = v_subject_id
      AND period.starts_at = (v_start_date::timestamp AT TIME ZONE 'America/Costa_Rica')
    FOR UPDATE;

    IF NOT FOUND THEN
      INSERT INTO settlement_periods(schedule_id, party_type, party_id, starts_at, ends_at, status)
      VALUES (schedule_row.id, p_party_type, v_subject_id,
        (v_start_date::timestamp AT TIME ZONE 'America/Costa_Rica'),
        (v_end_date::timestamp AT TIME ZONE 'America/Costa_Rica'), 'open')
      RETURNING id INTO v_period_id;
    END IF;

    IF (SELECT period.status FROM settlement_periods period WHERE period.id = v_period_id) <> 'open' THEN
      RAISE EXCEPTION 'El período actual de % ya está cerrado.', p_party_type;
    END IF;

    INSERT INTO settlement_period_items(period_id, shipment_id, company_id, courier_id, financial_record_id, original_amount, final_amount)
    SELECT v_period_id, financial.shipment_id, financial.company_id, financial.courier_id, financial.id, financial.original_amount, financial.amount
    WHERE NOT EXISTS (
      SELECT 1 FROM settlement_period_items item
      WHERE item.financial_record_id = financial.id
    );
    IF FOUND THEN v_assigned := v_assigned + 1; END IF;
  END LOOP;

  IF NOT v_schedule_found AND EXISTS (
    SELECT 1 FROM shipment_delivery_financial_records financial_record
    WHERE financial_record.status = 'pending'
      AND financial_record.record_type = CASE WHEN p_party_type = 'company' THEN 'company_delivery_charge' ELSE 'courier_delivery_payment' END
      AND NOT EXISTS (SELECT 1 FROM settlement_period_items item WHERE item.financial_record_id = financial_record.id)
  ) THEN
    RAISE EXCEPTION 'No existe un cronograma activo para %. Cree un cronograma antes de recuperar estos registros.', CASE WHEN p_party_type = 'company' THEN 'DTS' ELSE 'mensajeros' END;
  END IF;

  RETURN v_assigned;
END;
$$;


ALTER FUNCTION public.assign_unassigned_financial_records_to_current_period(p_party_type text) OWNER TO postgres;

--
-- TOC entry 566 (class 1255 OID 30127)
-- Name: can_access_chat(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_access_chat(p_conversation_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.chat_is_enabled_for_current_user() AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = p_conversation_id AND p.active
      AND (p.company_id = c.client_company_id OR p.company_id = c.owner_company_id)
  );
$$;


ALTER FUNCTION public.can_access_chat(p_conversation_id uuid) OWNER TO postgres;

--
-- TOC entry 569 (class 1255 OID 29947)
-- Name: can_manage_courier_routes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_manage_courier_routes() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists(select 1 from public.profiles p
    where p.id = auth.uid() and p.active is true and p.role = 'super_admin');
$$;


ALTER FUNCTION public.can_manage_courier_routes() OWNER TO postgres;

--
-- TOC entry 596 (class 1255 OID 29948)
-- Name: can_read_courier(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_read_courier(p_courier_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select exists (
    select 1 from public.profiles viewer
    left join public.companies company on company.id = viewer.company_id
    join public.couriers courier on courier.id = p_courier_id
    where viewer.id = auth.uid() and viewer.active is true
      and (viewer.role = 'super_admin' or (company.is_owner_company is true and viewer.role <> 'courier')
        or courier.profile_id = viewer.id)
  );
$$;


ALTER FUNCTION public.can_read_courier(p_courier_id uuid) OWNER TO postgres;

--
-- TOC entry 571 (class 1255 OID 30128)
-- Name: can_write_chat(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.chat_is_enabled_for_current_user() AND EXISTS (
    SELECT 1 FROM public.chat_conversations c
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE c.id = p_conversation_id AND p.active
      AND (p.company_id = c.client_company_id OR (p.company_id = c.owner_company_id AND (p.role <> 'courier' OR p.can_chat_directly_with_clients OR p_template_key IS NOT NULL)))
  );
$$;


ALTER FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text) OWNER TO postgres;

--
-- TOC entry 612 (class 1255 OID 30684)
-- Name: chat_is_enabled_for_current_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.chat_is_enabled_for_current_user() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.companies c ON c.id = p.company_id
    WHERE p.id = auth.uid()
      AND p.active
      AND (
        coalesce(c.is_owner_company, false)
        OR coalesce(c.is_system_company, false)
        OR coalesce((SELECT s.dts_chat_enabled FROM public.system_settings s WHERE s.id = true), true)
      )
  );
$$;


ALTER FUNCTION public.chat_is_enabled_for_current_user() OWNER TO postgres;

--
-- TOC entry 497 (class 1255 OID 30504)
-- Name: close_settlement_period(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.close_settlement_period(p_period_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles profile JOIN public.companies company ON company.id = profile.company_id WHERE profile.id = auth.uid() AND profile.active AND profile.role IN ('super_admin','company_admin') AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))) THEN RAISE EXCEPTION 'No tiene permiso para cerrar períodos.'; END IF;
  UPDATE public.settlement_periods SET status = 'closed', closed_at = now(), closed_by = auth.uid() WHERE id = p_period_id AND status = 'open';
  IF NOT FOUND THEN RAISE EXCEPTION 'El período no existe o ya está cerrado.'; END IF;
END;
$$;


ALTER FUNCTION public.close_settlement_period(p_period_id uuid) OWNER TO postgres;

--
-- TOC entry 576 (class 1255 OID 30520)
-- Name: complete_shipment_delivery(uuid, uuid, text, numeric, numeric, jsonb, text, double precision, double precision); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.complete_shipment_delivery(p_shipment_id uuid, p_delivered_by uuid, p_receiver_type text, p_deposit_amount numeric, p_shipping_fee numeric, p_delivered_items jsonb, p_observations text, p_latitude double precision, p_longitude double precision) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  actor_is_system_company boolean;
  actor_role text;
  actor_courier_id uuid;
  previous_status public.shipment_status;
  assigned_deposit numeric;
  assigned_shipping_fee numeric;
  delivery_time timestamptz := now();
  delivery_item record;
  inventory_row record;
  shipment_tracking_number text;
  shipment_company_id uuid;
  shipment_route_id uuid;
  shipment_neighborhood_id bigint;
  resolved_district_id bigint;
  resolved_canton_id bigint;
  resolved_province_id bigint;
  shipment_company_name text;
  shipment_customer_name text;
  company_default_charge numeric;
  shipment_route_name text;
  delivered_courier_name text;
  courier_default_pay numeric;
  company_rate_id uuid;
  company_rate_amount numeric;
  company_rate_scope text;
  courier_rate_id uuid;
  courier_rate_amount numeric;
  courier_rate_scope text;
  financial_event_id uuid := gen_random_uuid();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debe iniciar sesión para confirmar una entrega.'; END IF;

  SELECT coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false), profile.role
    INTO actor_is_system_company, actor_role
    FROM public.profiles profile JOIN public.companies company ON company.id = profile.company_id
   WHERE profile.id = auth.uid() AND profile.active = true;
  IF coalesce(actor_is_system_company, false) IS NOT TRUE THEN RAISE EXCEPTION 'Solo la empresa del sistema puede confirmar entregas.'; END IF;

  IF actor_role = 'courier' THEN
    SELECT courier.id INTO actor_courier_id FROM public.couriers courier WHERE courier.profile_id = auth.uid() AND courier.active = true;
    IF actor_courier_id IS NULL OR p_delivered_by IS DISTINCT FROM actor_courier_id THEN RAISE EXCEPTION 'Un mensajero solo puede registrarse a sí mismo como quien entregó.'; END IF;
  END IF;
  IF p_receiver_type NOT IN ('owner', 'authorized') THEN RAISE EXCEPTION 'El tipo de receptor no es válido.'; END IF;
  IF p_deposit_amount IS NULL OR p_deposit_amount < 0 OR p_shipping_fee IS NULL OR p_shipping_fee < 0 THEN RAISE EXCEPTION 'Los montos de la entrega no son válidos.'; END IF;
  IF length(coalesce(p_observations, '')) > 500 THEN RAISE EXCEPTION 'Las observaciones no pueden superar 500 caracteres.'; END IF;
  IF (p_latitude IS NULL) <> (p_longitude IS NULL) THEN RAISE EXCEPTION 'Las coordenadas de la entrega están incompletas.'; END IF;
  IF p_latitude IS NOT NULL AND (p_latitude NOT BETWEEN -90 AND 90 OR p_longitude NOT BETWEEN -180 AND 180) THEN RAISE EXCEPTION 'Las coordenadas de la entrega no son válidas.'; END IF;
  IF p_delivered_items IS NULL OR jsonb_typeof(p_delivered_items) <> 'array' THEN RAISE EXCEPTION 'Debe indicar las cantidades entregadas de cada artículo.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) WHERE d.item_id IS NULL OR d.quantity IS NULL OR d.quantity < 0) THEN RAISE EXCEPTION 'Las cantidades entregadas deben ser enteros iguales o mayores que cero.'; END IF;
  IF EXISTS (SELECT d.item_id FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) GROUP BY d.item_id HAVING count(*) > 1) THEN RAISE EXCEPTION 'Un artículo fue enviado más de una vez en la entrega.'; END IF;

  SELECT shipment.status, shipment.tracking_number, shipment.company_id, shipment.route_id,
         shipment.neighborhood_id, coalesce(neighborhood.district_id, shipment.district_id), district.canton_id, canton.province_id,
         company.name, shipment.customer_name, company.delivery_charge, route.name
    INTO previous_status, shipment_tracking_number, shipment_company_id, shipment_route_id,
         shipment_neighborhood_id, resolved_district_id, resolved_canton_id, resolved_province_id,
         shipment_company_name, shipment_customer_name, company_default_charge, shipment_route_name
    FROM public.shipments shipment
    JOIN public.companies company ON company.id = shipment.company_id
    LEFT JOIN public.routes route ON route.id = shipment.route_id
    LEFT JOIN public.neighborhoods neighborhood ON neighborhood.id = shipment.neighborhood_id
    LEFT JOIN public.districts district ON district.id = coalesce(neighborhood.district_id, shipment.district_id)
    LEFT JOIN public.cantons canton ON canton.id = district.canton_id
   WHERE shipment.id = p_shipment_id FOR UPDATE OF shipment;
  IF NOT FOUND THEN RAISE EXCEPTION 'El envío no existe.'; END IF;
  IF previous_status = 'delivered' THEN RAISE EXCEPTION 'El envío ya fue marcado como entregado.'; END IF;

  IF (SELECT count(*) FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer)) <> (SELECT count(*) FROM public.shipment_items WHERE shipment_id = p_shipment_id) THEN RAISE EXCEPTION 'Debe indicar la cantidad entregada de todos los artículos del envío.'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) LEFT JOIN public.shipment_items item ON item.id = d.item_id AND item.shipment_id = p_shipment_id WHERE item.id IS NULL) THEN RAISE EXCEPTION 'Uno o más artículos no pertenecen a este envío.'; END IF;

  SELECT profile.full_name, profile.delivery_pay INTO delivered_courier_name, courier_default_pay
    FROM public.couriers courier JOIN public.profiles profile ON profile.id = courier.profile_id JOIN public.companies company ON company.id = profile.company_id
   WHERE courier.id = p_delivered_by AND courier.active = true AND profile.active = true AND profile.can_deliver = true
     AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false));
  IF delivered_courier_name IS NULL THEN RAISE EXCEPTION 'El usuario seleccionado no está habilitado para realizar entregas.'; END IF;

  SELECT coalesce(sum(item.deposit_amount), 0), coalesce(sum(item.shipping_fee), 0) INTO assigned_deposit, assigned_shipping_fee FROM public.shipment_items item WHERE item.shipment_id = p_shipment_id;
  IF assigned_deposit = 0 AND p_deposit_amount <> 0 THEN RAISE EXCEPTION 'Este envío no tiene depósito asignado.'; END IF;
  IF assigned_shipping_fee = 0 AND p_shipping_fee <> 0 THEN RAISE EXCEPTION 'Este envío no tiene costo de envío asignado.'; END IF;

  FOR delivery_item IN SELECT item.id, item.product_id, d.quantity FROM public.shipment_items item JOIN jsonb_to_recordset(p_delivered_items) AS d(item_id uuid, quantity integer) ON d.item_id = item.id WHERE item.shipment_id = p_shipment_id LOOP
    IF delivery_item.quantity > 0 THEN
      SELECT inventory.id, inventory.quantity INTO inventory_row FROM public.inventory inventory WHERE inventory.courier_id = p_delivered_by AND inventory.company_id = shipment_company_id AND inventory.product_id = delivery_item.product_id FOR UPDATE;
      IF inventory_row.id IS NULL THEN
        INSERT INTO public.inventory (courier_id, company_id, product_id, quantity, low_stock, medium_stock, updated_at) VALUES (p_delivered_by, shipment_company_id, delivery_item.product_id, -delivery_item.quantity, 5, 10, delivery_time) RETURNING id, quantity INTO inventory_row;
      ELSE
        UPDATE public.inventory SET quantity = inventory_row.quantity - delivery_item.quantity, updated_at = delivery_time WHERE id = inventory_row.id RETURNING quantity INTO inventory_row.quantity;
      END IF;
      INSERT INTO public.inventory_movements (inventory_id, quantity_before, quantity_change, quantity_after, reason, notes, created_by) VALUES (inventory_row.id, inventory_row.quantity + delivery_item.quantity, -delivery_item.quantity, inventory_row.quantity, 'Entrega de envío', format('Guía %s · Cantidad entregada: %s', shipment_tracking_number, delivery_item.quantity), auth.uid());
    END IF;
    UPDATE public.shipment_items SET delivered_quantity = delivery_item.quantity WHERE id = delivery_item.id;
  END LOOP;

  UPDATE public.shipments SET status = 'delivered', delivered_at = delivery_time, delivered_by_courier_id = p_delivered_by,
      receiver_type = p_receiver_type::public.receiver_type,
      deposit_collected = CASE WHEN assigned_deposit > 0 THEN p_deposit_amount ELSE 0 END,
      shipping_collected = CASE WHEN assigned_shipping_fee > 0 THEN p_shipping_fee ELSE 0 END,
      latitude = p_latitude, longitude = p_longitude, last_update_at = delivery_time,
      last_update_message = CASE WHEN p_latitude IS NULL THEN 'Entrega confirmada sin ubicación GPS' ELSE 'Entrega confirmada' END
    WHERE id = p_shipment_id;
  INSERT INTO public.shipment_status_history (shipment_id, previous_status, status, notes, created_by)
  VALUES (p_shipment_id, previous_status, 'delivered', nullif(concat_ws(' · ', nullif(trim(coalesce(p_observations, '')), ''), CASE WHEN p_latitude IS NULL THEN 'Ubicación de entrega no disponible' ELSE NULL END), ''), auth.uid());

  -- Precedencia: barrio > distrito > cantón > provincia > ruta > tarifa por defecto.
  SELECT rate.id, rate.delivery_charge,
      CASE WHEN rate.neighborhood_id IS NOT NULL THEN 'neighborhood' WHEN rate.district_id IS NOT NULL THEN 'district' WHEN rate.canton_id IS NOT NULL THEN 'canton' WHEN rate.province_id IS NOT NULL THEN 'province' ELSE 'route' END
    INTO company_rate_id, company_rate_amount, company_rate_scope
    FROM public.delivery_rates rate
   WHERE rate.company_id = shipment_company_id AND rate.route_id = shipment_route_id AND rate.active = true
     AND (rate.province_id IS NULL OR rate.province_id = resolved_province_id) AND (rate.canton_id IS NULL OR rate.canton_id = resolved_canton_id)
     AND (rate.district_id IS NULL OR rate.district_id = resolved_district_id) AND (rate.neighborhood_id IS NULL OR rate.neighborhood_id = shipment_neighborhood_id)
   ORDER BY (rate.neighborhood_id IS NOT NULL) DESC, (rate.district_id IS NOT NULL) DESC, (rate.canton_id IS NOT NULL) DESC, (rate.province_id IS NOT NULL) DESC, rate.created_at DESC, rate.id DESC LIMIT 1;

  SELECT rate.id, rate.delivery_pay,
      CASE WHEN rate.neighborhood_id IS NOT NULL THEN 'neighborhood' WHEN rate.district_id IS NOT NULL THEN 'district' WHEN rate.canton_id IS NOT NULL THEN 'canton' WHEN rate.province_id IS NOT NULL THEN 'province' ELSE 'route' END
    INTO courier_rate_id, courier_rate_amount, courier_rate_scope
    FROM public.courier_delivery_rates rate
   WHERE rate.courier_id = p_delivered_by AND rate.route_id = shipment_route_id AND rate.active = true
     AND (rate.province_id IS NULL OR rate.province_id = resolved_province_id) AND (rate.canton_id IS NULL OR rate.canton_id = resolved_canton_id)
     AND (rate.district_id IS NULL OR rate.district_id = resolved_district_id) AND (rate.neighborhood_id IS NULL OR rate.neighborhood_id = shipment_neighborhood_id)
   ORDER BY (rate.neighborhood_id IS NOT NULL) DESC, (rate.district_id IS NOT NULL) DESC, (rate.canton_id IS NOT NULL) DESC, (rate.province_id IS NOT NULL) DESC, rate.created_at DESC, rate.id DESC LIMIT 1;

  -- Sin excepción aplicable, se conserva la tarifa por defecto del DTS o mensajero.
  INSERT INTO public.shipment_delivery_financial_records (event_id, shipment_id, operation_type, record_type, status, company_id, courier_id, route_id, delivery_rate_id, tracking_number, customer_name, company_name, courier_name, route_name, rate_scope, original_amount, amount, occurred_at, created_by)
  VALUES (financial_event_id, p_shipment_id, 'delivery', 'company_delivery_charge', CASE WHEN company_rate_id IS NOT NULL OR company_default_charge IS NOT NULL THEN 'pending' ELSE 'unrated' END, shipment_company_id, p_delivered_by, shipment_route_id, company_rate_id, shipment_tracking_number, shipment_customer_name, shipment_company_name, delivered_courier_name, shipment_route_name, coalesce(company_rate_scope, 'default'), coalesce(company_rate_amount, company_default_charge, 0), coalesce(company_rate_amount, company_default_charge, 0), delivery_time, auth.uid());
  INSERT INTO public.shipment_delivery_financial_records (event_id, shipment_id, operation_type, record_type, status, company_id, courier_id, route_id, courier_delivery_rate_id, tracking_number, customer_name, company_name, courier_name, route_name, rate_scope, original_amount, amount, occurred_at, created_by)
  VALUES (financial_event_id, p_shipment_id, 'delivery', 'courier_delivery_payment', CASE WHEN courier_rate_id IS NOT NULL OR courier_default_pay IS NOT NULL THEN 'pending' ELSE 'unrated' END, shipment_company_id, p_delivered_by, shipment_route_id, courier_rate_id, shipment_tracking_number, shipment_customer_name, shipment_company_name, delivered_courier_name, shipment_route_name, coalesce(courier_rate_scope, 'default'), coalesce(courier_rate_amount, courier_default_pay, 0), coalesce(courier_rate_amount, courier_default_pay, 0), delivery_time, auth.uid());
END;
$$;


ALTER FUNCTION public.complete_shipment_delivery(p_shipment_id uuid, p_delivered_by uuid, p_receiver_type text, p_deposit_amount numeric, p_shipping_fee numeric, p_delivered_items jsonb, p_observations text, p_latitude double precision, p_longitude double precision) OWNER TO postgres;

--
-- TOC entry 544 (class 1255 OID 29872)
-- Name: create_shipment_customer_location_request(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_shipment_customer_location_request(p_shipment_id uuid, p_token_hash text) RETURNS timestamp with time zone
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
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
end; $_$;


ALTER FUNCTION public.create_shipment_customer_location_request(p_shipment_id uuid, p_token_hash text) OWNER TO postgres;

--
-- TOC entry 469 (class 1255 OID 29951)
-- Name: current_courier_route_ids(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_courier_route_ids() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO ''
    AS $$
  select cr.route_id from public.courier_routes cr
  join public.couriers c on c.id = cr.courier_id
  join public.profiles p on p.id = c.profile_id
  join public.routes r on r.id = cr.route_id
  where p.id = auth.uid() and p.active is true and p.can_deliver is true
    and c.active is true and r.active is true;
$$;


ALTER FUNCTION public.current_courier_route_ids() OWNER TO postgres;

--
-- TOC entry 641 (class 1255 OID 29472)
-- Name: current_profile_company_id(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.current_profile_company_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select company_id
  from public.profiles
  where id = auth.uid()
    and active = true
  limit 1;
$$;


ALTER FUNCTION public.current_profile_company_id() OWNER TO postgres;

--
-- TOC entry 611 (class 1255 OID 30316)
-- Name: delete_chat_message(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_chat_message(p_message_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_conversation_id uuid;
  v_author_id uuid;
  v_deleted_at timestamptz;
  v_previous_body text;
  v_viewer_company uuid;
  v_owner_company uuid;
  v_viewer_role public.user_role;
BEGIN
  SELECT m.conversation_id, m.author_id, m.deleted_at, m.body, viewer.company_id, c.owner_company_id, viewer.role
    INTO v_conversation_id, v_author_id, v_deleted_at, v_previous_body, v_viewer_company, v_owner_company, v_viewer_role
  FROM public.chat_messages m
  JOIN public.chat_conversations c ON c.id = m.conversation_id
  JOIN public.profiles viewer ON viewer.id = auth.uid()
  WHERE m.id = p_message_id;
  IF v_conversation_id IS NULL OR NOT public.can_access_chat(v_conversation_id) THEN RAISE EXCEPTION 'No tiene acceso a este mensaje.'; END IF;
  IF v_deleted_at IS NOT NULL THEN RETURN; END IF;
  IF v_author_id <> auth.uid() AND NOT (v_viewer_company = v_owner_company AND v_viewer_role IN ('super_admin', 'company_admin')) THEN
    RAISE EXCEPTION 'No tiene permiso para eliminar este mensaje.';
  END IF;
  INSERT INTO public.chat_message_audit(message_id, action, previous_body, actor_id)
  VALUES(p_message_id, 'deleted', v_previous_body, auth.uid());
  UPDATE public.chat_messages SET deleted_at = now(), deleted_by = auth.uid() WHERE id = p_message_id;
END;
$$;


ALTER FUNCTION public.delete_chat_message(p_message_id uuid) OWNER TO postgres;

--
-- TOC entry 602 (class 1255 OID 29993)
-- Name: delete_route_with_optional_shipment_reassignment(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_route_with_optional_shipment_reassignment(p_route_id uuid, p_successor_route_id uuid DEFAULT NULL::uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_old_route_name text;
  v_successor_route_name text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND active = true AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'No autorizado para eliminar rutas.';
  END IF;

  SELECT name INTO v_old_route_name FROM routes WHERE id = p_route_id;
  IF v_old_route_name IS NULL THEN
    RAISE EXCEPTION 'Ruta no encontrada.';
  END IF;

  IF p_successor_route_id = p_route_id THEN
    RAISE EXCEPTION 'La ruta destino debe ser diferente de la ruta eliminada.';
  END IF;
  IF p_successor_route_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM routes WHERE id = p_successor_route_id AND active = true
  ) THEN
    RAISE EXCEPTION 'La ruta destino no existe o está inactiva.';
  END IF;
  IF p_successor_route_id IS NOT NULL THEN
    SELECT name INTO v_successor_route_name FROM routes WHERE id = p_successor_route_id;

    INSERT INTO shipment_status_history (shipment_id, previous_status, status, notes, created_by)
    SELECT id, status, status,
      format('Ruta reasignada de "%s" a "%s" al eliminar la ruta original.', v_old_route_name, v_successor_route_name),
      auth.uid()
    FROM shipments
    WHERE route_id = p_route_id;

    UPDATE shipments SET route_id = p_successor_route_id WHERE route_id = p_route_id;
  END IF;
  DELETE FROM routes WHERE id = p_route_id;
END;
$$;


ALTER FUNCTION public.delete_route_with_optional_shipment_reassignment(p_route_id uuid, p_successor_route_id uuid) OWNER TO postgres;

--
-- TOC entry 557 (class 1255 OID 30315)
-- Name: edit_chat_message(uuid, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.edit_chat_message(p_message_id uuid, p_body text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_conversation_id uuid;
  v_author_id uuid;
  v_created_at timestamptz;
  v_deleted_at timestamptz;
  v_previous_body text;
BEGIN
  SELECT conversation_id, author_id, created_at, deleted_at, body
    INTO v_conversation_id, v_author_id, v_created_at, v_deleted_at, v_previous_body
  FROM public.chat_messages WHERE id = p_message_id;
  IF v_conversation_id IS NULL OR NOT public.can_access_chat(v_conversation_id) THEN RAISE EXCEPTION 'No tiene acceso a este mensaje.'; END IF;
  IF v_author_id <> auth.uid() THEN RAISE EXCEPTION 'Solo puede editar sus propios mensajes.'; END IF;
  IF v_deleted_at IS NOT NULL THEN RAISE EXCEPTION 'No puede editar un mensaje eliminado.'; END IF;
  IF v_created_at < now() - interval '15 minutes' THEN RAISE EXCEPTION 'El plazo de 15 minutos para editar este mensaje ya venció.'; END IF;
  IF nullif(btrim(p_body), '') IS NULL THEN RAISE EXCEPTION 'El mensaje no puede quedar vacío.'; END IF;
  IF btrim(p_body) IS NOT DISTINCT FROM v_previous_body THEN RETURN; END IF;
  INSERT INTO public.chat_message_audit(message_id, action, previous_body, actor_id)
  VALUES(p_message_id, 'edited', v_previous_body, auth.uid());
  UPDATE public.chat_messages SET body = btrim(p_body), edited_at = now() WHERE id = p_message_id;
END;
$$;


ALTER FUNCTION public.edit_chat_message(p_message_id uuid, p_body text) OWNER TO postgres;

--
-- TOC entry 504 (class 1255 OID 29474)
-- Name: enforce_tracking_record_permissions(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.enforce_tracking_record_permissions() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


ALTER FUNCTION public.enforce_tracking_record_permissions() OWNER TO postgres;

--
-- TOC entry 635 (class 1255 OID 27517)
-- Name: generate_tracking_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_tracking_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    next_num bigint;
BEGIN
    next_num := nextval('shipment_tracking_seq');

    RETURN 'E-' || LPAD(next_num::text, 8, '0');
END;
$$;


ALTER FUNCTION public.generate_tracking_number() OWNER TO postgres;

--
-- TOC entry 467 (class 1255 OID 30263)
-- Name: get_chat_conversation_previews(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_chat_conversation_previews() RETURNS TABLE(conversation_id uuid, preview text, received_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT
    c.id AS conversation_id,
    COALESCE(last_message.body, 'Ubicación o adjunto') AS preview,
    last_message.created_at AS received_at
  FROM public.chat_conversations c
  JOIN LATERAL (
    SELECT m.body, m.created_at
    FROM public.chat_messages m
    WHERE m.conversation_id = c.id
      AND m.author_id <> auth.uid()
      AND m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_message ON true
  WHERE public.can_access_chat(c.id);
$$;


ALTER FUNCTION public.get_chat_conversation_previews() OWNER TO postgres;

--
-- TOC entry 583 (class 1255 OID 30365)
-- Name: get_chat_messages(uuid, integer, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_chat_messages(p_conversation_id uuid, p_limit integer DEFAULT 40, p_before timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS TABLE(id uuid, body text, created_at timestamp with time zone, edited_at timestamp with time zone, deleted_at timestamp with time zone, is_mine boolean, can_edit boolean, can_delete boolean, sender_label text, deleted_by_label text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_viewer_company_id uuid;
  v_owner_company_id uuid;
  v_viewer_role public.user_role;
BEGIN
  IF NOT public.can_access_chat(p_conversation_id) THEN RAISE EXCEPTION 'No tiene acceso a esta conversación.'; END IF;
  SELECT p.company_id, c.owner_company_id, p.role
    INTO v_viewer_company_id, v_owner_company_id, v_viewer_role
  FROM public.profiles p JOIN public.chat_conversations c ON c.id = p_conversation_id
  WHERE p.id = auth.uid();

  RETURN QUERY
  WITH page AS (
    SELECT m.* FROM public.chat_messages m
    WHERE m.conversation_id = p_conversation_id
      AND (p_before IS NULL OR m.created_at < p_before)
    ORDER BY m.created_at DESC
    LIMIT LEAST(GREATEST(COALESCE(p_limit, 40), 1), 100)
  )
  SELECT
    m.id,
    CASE WHEN m.deleted_at IS NULL THEN m.body ELSE 'Mensaje eliminado' END,
    m.created_at,
    m.edited_at,
    m.deleted_at,
    m.author_id = auth.uid(),
    m.deleted_at IS NULL AND m.author_id = auth.uid() AND m.created_at >= now() - interval '15 minutes',
    m.deleted_at IS NULL AND (m.author_id = auth.uid() OR (v_viewer_company_id = v_owner_company_id AND v_viewer_role IN ('super_admin', 'company_admin'))),
    CASE
      WHEN m.author_id = auth.uid() THEN 'Tú'
      WHEN v_viewer_company_id = v_owner_company_id THEN COALESCE(author.full_name, 'Usuario DTS')
      ELSE CONCAT(CASE author.role
        WHEN 'courier' THEN 'Mensajero'
        WHEN 'company_admin' THEN 'Supervisor'
        WHEN 'seller' THEN 'Vendedor'
        WHEN 'super_admin' THEN 'Administrador'
        ELSE 'Equipo' END, ' ', COALESCE(author_company.name, 'Agiliza'))
    END,
    CASE
      WHEN m.deleted_at IS NULL OR m.deleted_by IS NULL OR m.deleted_by = m.author_id THEN NULL
      WHEN v_viewer_company_id = v_owner_company_id THEN COALESCE(deleter.full_name, 'Administrador EPS')
      ELSE CONCAT('un ', CASE deleter.role
        WHEN 'company_admin' THEN 'supervisor'
        WHEN 'super_admin' THEN 'administrador'
        ELSE 'administrador'
      END)
    END
  FROM page m
  JOIN public.profiles author ON author.id = m.author_id
  LEFT JOIN public.companies author_company ON author_company.id = author.company_id
  LEFT JOIN public.profiles deleter ON deleter.id = m.deleted_by
  ORDER BY m.created_at ASC;
END;
$$;


ALTER FUNCTION public.get_chat_messages(p_conversation_id uuid, p_limit integer, p_before timestamp with time zone) OWNER TO postgres;

--
-- TOC entry 609 (class 1255 OID 30468)
-- Name: get_courier_delivery_payment_amount_changes(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_courier_delivery_payment_amount_changes(p_financial_record_id uuid) RETURNS TABLE(previous_amount numeric, new_amount numeric, justification text, changed_at timestamp with time zone, changed_by_name text)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid() AND profile.active = true
      AND profile.role IN ('super_admin', 'company_admin')
      AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para consultar el historial de pagos.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.shipment_delivery_financial_records
    WHERE id = p_financial_record_id AND record_type = 'courier_delivery_payment'
  ) THEN
    RAISE EXCEPTION 'El pago no existe.';
  END IF;
  RETURN QUERY
  SELECT change.previous_amount, change.new_amount, change.justification, change.changed_at,
         coalesce(profile.full_name, 'Usuario eliminado')
    FROM public.shipment_delivery_financial_amount_changes change
    LEFT JOIN public.profiles profile ON profile.id = change.changed_by
   WHERE change.financial_record_id = p_financial_record_id
   ORDER BY change.changed_at DESC;
END;
$$;


ALTER FUNCTION public.get_courier_delivery_payment_amount_changes(p_financial_record_id uuid) OWNER TO postgres;

--
-- TOC entry 597 (class 1255 OID 30690)
-- Name: get_current_company_context(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_current_company_context() RETURNS TABLE(company_id uuid, code text, is_owner_company boolean, is_system_company boolean, is_courier boolean)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT company.id, company.code, coalesce(company.is_owner_company, false),
         coalesce(company.is_system_company, false), profile.role = 'courier'
  FROM public.profiles profile
  JOIN public.companies company ON company.id = profile.company_id
  WHERE profile.id = auth.uid() AND profile.active = true;
$$;


ALTER FUNCTION public.get_current_company_context() OWNER TO postgres;

--
-- TOC entry 561 (class 1255 OID 30527)
-- Name: get_delivery_financial_records_page(text, text, text, text, text, text, timestamp with time zone, timestamp with time zone, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_delivery_financial_records_page(p_record_type text, p_company text DEFAULT NULL::text, p_courier text DEFAULT NULL::text, p_route text DEFAULT NULL::text, p_tracking_number text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_to timestamp with time zone DEFAULT NULL::timestamp with time zone, p_limit integer DEFAULT 25, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, shipment_id uuid, occurred_at timestamp with time zone, tracking_number text, customer_name text, company_name text, courier_name text, route_name text, rate_scope text, amount numeric, status text, total_count bigint, total_amount numeric)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF p_record_type NOT IN ('company_delivery_charge', 'courier_delivery_payment') THEN
    RAISE EXCEPTION 'El tipo de reporte no es válido.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
      FROM public.profiles profile
      JOIN public.companies company ON company.id = profile.company_id
     WHERE profile.id = auth.uid()
       AND profile.active = true
       AND profile.role IN ('super_admin', 'company_admin')
       AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para consultar reportes financieros.';
  END IF;

  RETURN QUERY
  WITH filtered AS (
    SELECT record.*
      FROM public.shipment_delivery_financial_records record
     WHERE record.record_type = p_record_type
       AND (p_company IS NULL OR coalesce(record.company_name, '') ILIKE '%' || p_company || '%')
       AND (p_courier IS NULL OR coalesce(record.courier_name, '') ILIKE '%' || p_courier || '%')
       AND (p_route IS NULL OR coalesce(record.route_name, '') ILIKE '%' || p_route || '%')
       AND (p_tracking_number IS NULL OR record.tracking_number ILIKE '%' || p_tracking_number || '%')
       AND (p_status IS NULL OR record.status = p_status)
       AND (p_from IS NULL OR record.occurred_at >= p_from)
       AND (p_to IS NULL OR record.occurred_at <= p_to)
  )
  SELECT record.id, record.shipment_id, record.occurred_at, record.tracking_number, record.customer_name, record.company_name,
         record.courier_name, record.route_name, record.rate_scope, record.amount,
         record.status, count(*) OVER (), coalesce(sum(record.amount) OVER (), 0)
    FROM filtered record
   ORDER BY record.occurred_at DESC, record.created_at DESC
   LIMIT greatest(p_limit, 1)
  OFFSET greatest(p_offset, 0);
END;
$$;


ALTER FUNCTION public.get_delivery_financial_records_page(p_record_type text, p_company text, p_courier text, p_route text, p_tracking_number text, p_status text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 478 (class 1255 OID 26172)
-- Name: get_district_neighborhoods(bigint, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_district_neighborhoods(p_district_id bigint, p_route_id uuid DEFAULT NULL::uuid) RETURNS TABLE(id bigint, name text, has_coverage boolean)
    LANGUAGE sql
    AS $$

select

  n.id,

  n.name,

  case

    -- MODO CLIENTE:
    -- cualquier ruta activa cuenta

    when p_route_id is null then

      exists (

        select 1

        from route_coverage rc

        join routes r
          on r.id = rc.route_id

        where rc.neighborhood_id = n.id

        and r.active = true

      )

    -- MODO ADMIN:
    -- la ruta específica, aunque esté inactiva, debe mostrarse

    else

      exists (

        select 1

        from route_coverage rc

        where rc.neighborhood_id = n.id

        and rc.route_id = p_route_id

      )

  end as has_coverage

from neighborhoods n

where n.district_id = p_district_id

order by n.name;

$$;


ALTER FUNCTION public.get_district_neighborhoods(p_district_id bigint, p_route_id uuid) OWNER TO postgres;

--
-- TOC entry 547 (class 1255 OID 30013)
-- Name: get_filtered_shipment_ids(uuid, uuid, uuid, integer, text, text, text, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_filtered_shipment_ids(p_company_id uuid DEFAULT NULL::uuid, p_route_id uuid DEFAULT NULL::uuid, p_courier_id uuid DEFAULT NULL::uuid, p_delivery_hours integer DEFAULT NULL::integer, p_visit_day text DEFAULT NULL::text, p_status text DEFAULT NULL::text, p_search text DEFAULT NULL::text, p_limit integer DEFAULT 20, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, total_count bigint)
    LANGUAGE sql
    SET search_path TO 'public'
    AS $$
  WITH filtered AS (
    SELECT s.id, s.created_at
    FROM public.shipments s
    WHERE (p_company_id IS NULL OR s.company_id = p_company_id)
      AND (p_route_id IS NULL OR s.route_id = p_route_id)
      AND (
        p_courier_id IS NULL
        OR EXISTS (
          SELECT 1
          FROM public.couriers courier
          WHERE courier.id = p_courier_id
            AND courier.profile_id = s.courier_id
        )
        OR EXISTS (
          SELECT 1
          FROM public.courier_routes courier_route
          WHERE courier_route.route_id = s.route_id
            AND courier_route.courier_id = p_courier_id
        )
      )
      AND (p_status IS NULL OR s.status::text = p_status)
      AND (p_search IS NULL OR s.search_text ILIKE '%' || p_search || '%')
      AND (
        p_delivery_hours IS NULL OR EXISTS (
          SELECT 1
          FROM public.route_district_delivery_times rdt
          WHERE rdt.route_id = s.route_id
            AND rdt.district_id = s.district_id
            AND rdt.min_hours = p_delivery_hours
        )
      )
      AND (
        p_visit_day IS NULL OR EXISTS (
          SELECT 1
          FROM public.route_district_visit_days rvd
          WHERE rvd.route_id = s.route_id
            AND rvd.district_id = s.district_id
            AND rvd.day::text = p_visit_day
        )
      )
  )
  SELECT filtered.id, count(*) OVER () AS total_count
  FROM filtered
  ORDER BY filtered.created_at DESC
  LIMIT GREATEST(p_limit, 1)
  OFFSET GREATEST(p_offset, 0);
$$;


ALTER FUNCTION public.get_filtered_shipment_ids(p_company_id uuid, p_route_id uuid, p_courier_id uuid, p_delivery_hours integer, p_visit_day text, p_status text, p_search text, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 477 (class 1255 OID 30048)
-- Name: get_inventory_movements_page(text, text, text, text, text, timestamp with time zone, timestamp with time zone, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_inventory_movements_page(p_company text DEFAULT NULL::text, p_courier text DEFAULT NULL::text, p_product text DEFAULT NULL::text, p_search text DEFAULT NULL::text, p_movement_type text DEFAULT NULL::text, p_from timestamp with time zone DEFAULT NULL::timestamp with time zone, p_to timestamp with time zone DEFAULT NULL::timestamp with time zone, p_limit integer DEFAULT 25, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, created_at timestamp with time zone, quantity_before integer, quantity_change integer, quantity_after integer, reason text, notes text, company_name text, courier_name text, product_name text, total_count bigint)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  WITH viewer AS (
    SELECT profile.id, profile.company_id, profile.role,
      coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false) AS is_owner_company
    FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid() AND profile.active = true
  ), filtered AS (
    SELECT m.*, c.name AS company_name, profile.full_name AS courier_name, p.name AS product_name
    FROM public.inventory_movements m
    JOIN public.inventory i ON i.id = m.inventory_id
    LEFT JOIN public.companies c ON c.id = i.company_id
    LEFT JOIN public.products p ON p.id = i.product_id
    LEFT JOIN public.couriers courier ON courier.id = i.courier_id
    LEFT JOIN public.profiles profile ON profile.id = courier.profile_id
    CROSS JOIN viewer v
    WHERE (
        (v.is_owner_company AND v.role IN ('super_admin', 'company_admin'))
        OR (v.is_owner_company AND v.role = 'courier' AND courier.profile_id = v.id)
        OR (NOT v.is_owner_company AND i.company_id = v.company_id)
      )
      AND (p_company IS NULL OR c.name ILIKE '%' || p_company || '%')
      AND (p_courier IS NULL OR profile.full_name ILIKE '%' || p_courier || '%')
      AND (p_product IS NULL OR p.name ILIKE '%' || p_product || '%')
      AND (p_search IS NULL OR m.reason ILIKE '%' || p_search || '%' OR coalesce(m.notes,'') ILIKE '%' || p_search || '%')
      AND (p_movement_type IS NULL OR (p_movement_type = 'entry' AND m.quantity_change > 0) OR (p_movement_type = 'exit' AND m.quantity_change < 0))
      AND (p_from IS NULL OR m.created_at >= p_from)
      AND (p_to IS NULL OR m.created_at <= p_to)
  )
  SELECT id, created_at, quantity_before, quantity_change, quantity_after, reason, notes, company_name, courier_name, product_name, count(*) over()
  FROM filtered ORDER BY created_at DESC LIMIT greatest(p_limit,1) OFFSET greatest(p_offset,0);
$$;


ALTER FUNCTION public.get_inventory_movements_page(p_company text, p_courier text, p_product text, p_search text, p_movement_type text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 601 (class 1255 OID 30040)
-- Name: get_inventory_page(uuid, uuid, uuid, text, integer, integer, text, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_inventory_page(p_courier_id uuid DEFAULT NULL::uuid, p_company_id uuid DEFAULT NULL::uuid, p_product_id uuid DEFAULT NULL::uuid, p_quantity_operator text DEFAULT NULL::text, p_quantity_value integer DEFAULT NULL::integer, p_quantity_value2 integer DEFAULT NULL::integer, p_stock_status text DEFAULT NULL::text, p_limit integer DEFAULT 10, p_offset integer DEFAULT 0) RETURNS TABLE(id uuid, courier_id uuid, company_id uuid, product_id uuid, quantity integer, low_stock integer, medium_stock integer, updated_at timestamp with time zone, courier_name text, company_name text, product_name text, stock_status text)
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
  WITH classified AS (
    SELECT inventory.*, CASE WHEN quantity < low_stock THEN 'low' WHEN quantity < medium_stock THEN 'medium' ELSE 'high' END AS stock_status
    FROM public.inventory inventory
    WHERE (p_courier_id IS NULL OR courier_id = p_courier_id)
      AND (p_company_id IS NULL OR company_id = p_company_id)
      AND (p_product_id IS NULL OR product_id = p_product_id)
      AND (p_quantity_operator IS NULL OR p_quantity_operator = '' OR (p_quantity_operator = '=' AND quantity = p_quantity_value) OR (p_quantity_operator = '<' AND quantity < p_quantity_value) OR (p_quantity_operator = '<=' AND quantity <= p_quantity_value) OR (p_quantity_operator = '>' AND quantity > p_quantity_value) OR (p_quantity_operator = '>=' AND quantity >= p_quantity_value) OR (p_quantity_operator = 'between' AND quantity BETWEEN p_quantity_value AND p_quantity_value2))
  )
  SELECT i.id, i.courier_id, i.company_id, i.product_id, i.quantity, i.low_stock, i.medium_stock, i.updated_at, profile.full_name, company.name, product.name, i.stock_status
  FROM classified i
  LEFT JOIN public.companies company ON company.id = i.company_id
  LEFT JOIN public.products product ON product.id = i.product_id
  LEFT JOIN public.couriers courier ON courier.id = i.courier_id
  LEFT JOIN public.profiles profile ON profile.id = courier.profile_id
  WHERE p_stock_status IS NULL OR i.stock_status = p_stock_status
  ORDER BY i.updated_at DESC
  LIMIT greatest(p_limit, 1) OFFSET greatest(p_offset, 0);
$$;


ALTER FUNCTION public.get_inventory_page(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text, p_limit integer, p_offset integer) OWNER TO postgres;

--
-- TOC entry 603 (class 1255 OID 30039)
-- Name: get_inventory_summary(uuid, uuid, uuid, text, integer, integer, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_inventory_summary(p_courier_id uuid DEFAULT NULL::uuid, p_company_id uuid DEFAULT NULL::uuid, p_product_id uuid DEFAULT NULL::uuid, p_quantity_operator text DEFAULT NULL::text, p_quantity_value integer DEFAULT NULL::integer, p_quantity_value2 integer DEFAULT NULL::integer, p_stock_status text DEFAULT NULL::text) RETURNS TABLE(total_quantity bigint, total_records bigint, low_records bigint, medium_records bigint, high_records bigint, low_couriers bigint, low_companies bigint, low_products bigint)
    LANGUAGE sql STABLE
    SET search_path TO 'public'
    AS $$
  WITH classified AS (
    SELECT inventory.*, CASE WHEN quantity < low_stock THEN 'low' WHEN quantity < medium_stock THEN 'medium' ELSE 'high' END AS stock_status
    FROM public.inventory inventory
    WHERE (p_courier_id IS NULL OR courier_id = p_courier_id)
      AND (p_company_id IS NULL OR company_id = p_company_id)
      AND (p_product_id IS NULL OR product_id = p_product_id)
      AND (p_quantity_operator IS NULL OR p_quantity_operator = '' OR (p_quantity_operator = '=' AND quantity = p_quantity_value) OR (p_quantity_operator = '<' AND quantity < p_quantity_value) OR (p_quantity_operator = '<=' AND quantity <= p_quantity_value) OR (p_quantity_operator = '>' AND quantity > p_quantity_value) OR (p_quantity_operator = '>=' AND quantity >= p_quantity_value) OR (p_quantity_operator = 'between' AND quantity BETWEEN p_quantity_value AND p_quantity_value2))
  )
  SELECT coalesce(sum(quantity) FILTER (WHERE p_stock_status IS NULL OR stock_status = p_stock_status), 0)::bigint,
    count(*) FILTER (WHERE p_stock_status IS NULL OR stock_status = p_stock_status)::bigint,
    count(*) FILTER (WHERE stock_status = 'low')::bigint, count(*) FILTER (WHERE stock_status = 'medium')::bigint, count(*) FILTER (WHERE stock_status = 'high')::bigint,
    count(DISTINCT courier_id) FILTER (WHERE stock_status = 'low')::bigint, count(DISTINCT company_id) FILTER (WHERE stock_status = 'low')::bigint, count(DISTINCT product_id) FILTER (WHERE stock_status = 'low')::bigint
  FROM classified;
$$;


ALTER FUNCTION public.get_inventory_summary(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text) OWNER TO postgres;

--
-- TOC entry 593 (class 1255 OID 30552)
-- Name: get_open_settlement_summaries(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_open_settlement_summaries(p_party_type text) RETURNS TABLE(period_id uuid, party_name text, starts_at timestamp with time zone, ends_at timestamp with time zone, total_entregas numeric, total_envios_cobrados numeric, total_depositos numeric, pagos_extra numeric, total_deducciones numeric, total_liquidacion numeric)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF p_party_type NOT IN ('company','courier') THEN
    RAISE EXCEPTION 'Tipo no válido.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM profiles pr
    JOIN companies own ON own.id = pr.company_id
    WHERE pr.id = auth.uid()
      AND pr.active
      AND pr.role IN ('super_admin','company_admin')
      AND (coalesce(own.is_owner_company,false) OR coalesce(own.is_system_company,false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para consultar cierres.';
  END IF;

  RETURN QUERY
  WITH base AS (
    SELECT period.id AS settlement_period_id, period.starts_at, period.ends_at, record.*, item.excluded
    FROM settlement_periods period
    JOIN settlement_period_items item ON item.period_id = period.id
    JOIN shipment_delivery_financial_records record ON record.id = item.financial_record_id
    WHERE period.status = 'open'
      AND period.party_type = p_party_type
      AND NOT item.excluded
  ), sums AS (
    SELECT base.settlement_period_id,
      max(base.starts_at) AS starts_at,
      max(base.ends_at) AS ends_at,
      max(CASE WHEN p_party_type = 'company' THEN base.company_name ELSE base.courier_name END) AS party_name,
      coalesce(sum(base.amount),0) AS total_entregas,
      coalesce(sum(CASE WHEN base.operation_type = 'delivery' THEN shipment.shipping_collected ELSE 0 END),0) AS total_envios,
      coalesce(sum(CASE WHEN base.operation_type = 'delivery' THEN shipment.deposit_collected ELSE 0 END),0) AS total_depositos
    FROM base
    LEFT JOIN shipments shipment ON shipment.id = base.shipment_id
    GROUP BY base.settlement_period_id
  ), adjustments AS (
    SELECT adjustment.period_id,
      coalesce(sum(adjustment.amount) FILTER (WHERE adjustment.adjustment_type = 'extra'),0) AS extra,
      coalesce(sum(adjustment.amount) FILTER (WHERE adjustment.adjustment_type = 'deduction'),0) AS deduction
    FROM settlement_adjustments adjustment
    GROUP BY adjustment.period_id
  )
  SELECT sums.settlement_period_id, sums.party_name, sums.starts_at, sums.ends_at,
    sums.total_entregas, sums.total_envios, sums.total_depositos,
    coalesce(adjustments.extra,0), coalesce(adjustments.deduction,0),
    sums.total_entregas - sums.total_envios - sums.total_depositos + coalesce(adjustments.extra,0) - coalesce(adjustments.deduction,0)
  FROM sums
  LEFT JOIN adjustments ON adjustments.period_id = sums.settlement_period_id
  ORDER BY sums.party_name;
END;
$$;


ALTER FUNCTION public.get_open_settlement_summaries(p_party_type text) OWNER TO postgres;

--
-- TOC entry 486 (class 1255 OID 30555)
-- Name: get_open_settlement_summaries_filtered(text, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_open_settlement_summaries_filtered(p_party_type text, p_filter_party_id uuid DEFAULT NULL::uuid) RETURNS TABLE(period_id uuid, party_name text, starts_at timestamp with time zone, ends_at timestamp with time zone, total_entregas numeric, total_envios_cobrados numeric, total_depositos numeric, pagos_extra numeric, total_deducciones numeric, total_liquidacion numeric)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  WITH authorized AS (
    SELECT 1
    FROM profiles profile
    JOIN companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid()
      AND profile.active
      AND profile.role IN ('super_admin','company_admin')
      AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))
  ), base AS (
    SELECT period.id AS settlement_period_id, period.starts_at, period.ends_at,
      financial.company_id, financial.courier_id, financial.company_name, financial.courier_name,
      financial.operation_type, financial.amount, financial.shipment_id
    FROM settlement_periods period
    JOIN settlement_period_items item ON item.period_id = period.id
    JOIN shipment_delivery_financial_records financial ON financial.id = item.financial_record_id
    WHERE EXISTS (SELECT 1 FROM authorized)
      AND period.status = 'open'
      AND period.party_type = p_party_type
      AND (p_filter_party_id IS NULL OR period.party_id = p_filter_party_id)
      AND NOT item.excluded
  ), sums AS (
    SELECT base.settlement_period_id,
      max(base.starts_at) AS starts_at,
      max(base.ends_at) AS ends_at,
      max(CASE WHEN p_party_type = 'company' THEN base.company_name ELSE base.courier_name END) AS party_name,
      coalesce(sum(base.amount), 0) AS total_entregas,
      coalesce(sum(CASE WHEN base.operation_type = 'delivery' THEN shipment.shipping_collected ELSE 0 END), 0) AS total_envios,
      coalesce(sum(CASE WHEN base.operation_type = 'delivery' THEN shipment.deposit_collected ELSE 0 END), 0) AS total_depositos
    FROM base
    LEFT JOIN shipments shipment ON shipment.id = base.shipment_id
    GROUP BY base.settlement_period_id
  ), adjustments AS (
    SELECT adjustment.period_id,
      coalesce(sum(adjustment.amount) FILTER (WHERE adjustment.adjustment_type = 'extra'), 0) AS extra,
      coalesce(sum(adjustment.amount) FILTER (WHERE adjustment.adjustment_type = 'deduction'), 0) AS deduction
    FROM settlement_adjustments adjustment
    GROUP BY adjustment.period_id
  )
  SELECT sums.settlement_period_id, sums.party_name, sums.starts_at, sums.ends_at,
    sums.total_entregas, sums.total_envios, sums.total_depositos,
    coalesce(adjustments.extra, 0), coalesce(adjustments.deduction, 0),
    sums.total_entregas - sums.total_envios - sums.total_depositos
      + coalesce(adjustments.extra, 0) - coalesce(adjustments.deduction, 0)
  FROM sums
  LEFT JOIN adjustments ON adjustments.period_id = sums.settlement_period_id
  ORDER BY sums.party_name;
$$;


ALTER FUNCTION public.get_open_settlement_summaries_filtered(p_party_type text, p_filter_party_id uuid) OWNER TO postgres;

--
-- TOC entry 508 (class 1255 OID 30234)
-- Name: get_or_create_customer_service_chat(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_or_create_customer_service_chat(p_client_company_id uuid DEFAULT NULL::uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE v_viewer_company uuid; v_owner_company uuid; v_client_company uuid; v_viewer_role public.user_role; v_conversation uuid;
BEGIN
  SELECT company_id, role INTO v_viewer_company, v_viewer_role
  FROM public.profiles WHERE id = auth.uid() AND active = true;
  IF v_viewer_company IS NULL THEN RAISE EXCEPTION 'Usuario no autorizado.'; END IF;

  SELECT c.id INTO v_owner_company FROM public.companies c
    WHERE coalesce(c.is_owner_company, false) OR coalesce(c.is_system_company, false)
    ORDER BY c.created_at NULLS LAST LIMIT 1;
  IF v_owner_company IS NULL THEN RAISE EXCEPTION 'No existe una empresa propietaria configurada.'; END IF;

  IF v_viewer_company = v_owner_company THEN
    IF v_viewer_role NOT IN ('super_admin', 'company_admin') THEN
      RAISE EXCEPTION 'Solo administradores o supervisores EPS acceden a servicio al cliente.';
    END IF;
    IF p_client_company_id IS NULL OR p_client_company_id = v_owner_company THEN
      RAISE EXCEPTION 'Seleccione una empresa cliente válida.';
    END IF;
    v_client_company := p_client_company_id;
  ELSE
    v_client_company := v_viewer_company;
  END IF;

  SELECT id INTO v_conversation FROM public.chat_conversations
  WHERE owner_company_id = v_owner_company
    AND client_company_id = v_client_company
    AND shipment_id IS NULL
    AND category = 'customer_service'
  ORDER BY updated_at DESC LIMIT 1;

  IF v_conversation IS NULL THEN
    INSERT INTO public.chat_conversations(owner_company_id, client_company_id, subject, category)
    VALUES(v_owner_company, v_client_company, 'Servicio al cliente', 'customer_service')
    RETURNING id INTO v_conversation;
  END IF;
  RETURN v_conversation;
END;
$$;


ALTER FUNCTION public.get_or_create_customer_service_chat(p_client_company_id uuid) OWNER TO postgres;

--
-- TOC entry 507 (class 1255 OID 30143)
-- Name: get_or_create_shipment_chat(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_or_create_shipment_chat(p_shipment_id uuid) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE v_client_company uuid; v_owner_company uuid; v_conversation uuid;
BEGIN
  SELECT company_id INTO v_client_company FROM public.shipments WHERE id = p_shipment_id;
  IF v_client_company IS NULL THEN RAISE EXCEPTION 'El envío no existe.'; END IF;
  SELECT c.id INTO v_owner_company FROM public.companies c
    WHERE coalesce(c.is_owner_company, false) OR coalesce(c.is_system_company, false)
    ORDER BY c.created_at NULLS LAST LIMIT 1;
  IF v_owner_company IS NULL THEN RAISE EXCEPTION 'No existe una empresa propietaria configurada.'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.active AND p.company_id = v_owner_company
  ) THEN RAISE EXCEPTION 'Solo usuarios EPS pueden crear solicitudes de soporte.'; END IF;

  SELECT id INTO v_conversation FROM public.chat_conversations
  WHERE owner_company_id = v_owner_company
    AND client_company_id = v_client_company
    AND shipment_id = p_shipment_id
    AND category = 'support';
  IF v_conversation IS NULL THEN
    INSERT INTO public.chat_conversations(owner_company_id, client_company_id, shipment_id, subject, category)
    VALUES(v_owner_company, v_client_company, p_shipment_id, 'Soporte del envío', 'support')
    RETURNING id INTO v_conversation;
  END IF;

  INSERT INTO public.chat_conversation_participants(conversation_id, profile_id)
  VALUES(v_conversation, auth.uid())
  ON CONFLICT DO NOTHING;
  RETURN v_conversation;
END;
$$;


ALTER FUNCTION public.get_or_create_shipment_chat(p_shipment_id uuid) OWNER TO postgres;

--
-- TOC entry 616 (class 1255 OID 26402)
-- Name: get_province_coverage_counts(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_province_coverage_counts(p_province text) RETURNS TABLE(district_id bigint, canton text, district text, covered_count bigint, min_hours integer, max_hours integer, visit_days text[])
    LANGUAGE sql
    AS $$
  WITH province_districts AS (
    SELECT d.id AS district_id, c.name::text AS canton, d.name::text AS district
    FROM public.districts d
    JOIN public.cantons c ON c.id = d.canton_id
    JOIN public.provinces p ON p.id = c.province_id
    WHERE p.name = p_province
  ), active_coverage AS (
    SELECT n.district_id, count(DISTINCT rc.neighborhood_id)::bigint AS covered_count
    FROM public.route_coverage rc
    JOIN public.routes r ON r.id = rc.route_id AND r.active = true
    JOIN public.neighborhoods n ON n.id = rc.neighborhood_id
    GROUP BY n.district_id
  ), active_times AS (
    SELECT rdt.district_id,
      min(rdt.min_hours)::integer AS min_hours,
      max(rdt.max_hours)::integer AS max_hours
    FROM public.route_district_delivery_times rdt
    JOIN public.routes r ON r.id = rdt.route_id AND r.active = true
    GROUP BY rdt.district_id
  ), active_days AS (
    SELECT rvd.district_id,
      array_agg(DISTINCT rvd.day::text ORDER BY rvd.day::text) AS visit_days
    FROM public.route_district_visit_days rvd
    JOIN public.routes r ON r.id = rvd.route_id AND r.active = true
    GROUP BY rvd.district_id
  )
  SELECT pd.district_id, pd.canton, pd.district,
    coalesce(ac.covered_count, 0::bigint),
    coalesce(at.min_hours, 0),
    coalesce(at.max_hours, 0),
    coalesce(ad.visit_days, ARRAY[]::text[])
  FROM province_districts pd
  LEFT JOIN active_coverage ac ON ac.district_id = pd.district_id
  LEFT JOIN active_times at ON at.district_id = pd.district_id
  LEFT JOIN active_days ad ON ad.district_id = pd.district_id
  ORDER BY pd.canton, pd.district;
$$;


ALTER FUNCTION public.get_province_coverage_counts(p_province text) OWNER TO postgres;

--
-- TOC entry 572 (class 1255 OID 29873)
-- Name: get_public_shipment_customer_location_request(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_public_shipment_customer_location_request(p_token_hash text) RETURNS TABLE(tracking_number text, customer_name text, expires_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
 select s.tracking_number,s.customer_name,r.expires_at from shipment_customer_location_requests r join shipments s on s.id=r.shipment_id where r.token_hash=p_token_hash and r.used_at is null and r.expires_at>now() limit 1;
$$;


ALTER FUNCTION public.get_public_shipment_customer_location_request(p_token_hash text) OWNER TO postgres;

--
-- TOC entry 494 (class 1255 OID 26380)
-- Name: get_route_district_coverage(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_route_district_coverage(p_route_id uuid) RETURNS TABLE(district_id bigint, province text, canton text, district text, covered_count bigint, min_hours integer, max_hours integer)
    LANGUAGE sql
    AS $$

select

  d.id,

  p.name,

  c.name,

  d.name,

  count(*) as covered_count,

  coalesce(
    max(rdt.min_hours),
    0
  ) as min_hours,

  coalesce(
    max(rdt.max_hours),
    0
  ) as max_hours

from route_coverage rc

join neighborhoods n
  on n.id = rc.neighborhood_id

join districts d
  on d.id = n.district_id

join cantons c
  on c.id = d.canton_id

join provinces p
  on p.id = c.province_id

left join route_district_delivery_times rdt
  on rdt.district_id = d.id
  and rdt.route_id = p_route_id

where rc.route_id = p_route_id

group by

  d.id,
  p.name,
  c.name,
  d.name

order by

  p.name,
  c.name,
  d.name;

$$;


ALTER FUNCTION public.get_route_district_coverage(p_route_id uuid) OWNER TO postgres;

--
-- TOC entry 485 (class 1255 OID 30506)
-- Name: get_settlement_schedules(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_settlement_schedules() RETURNS TABLE(id uuid, party_type text, party_id uuid, party_name text, frequency text, interval_days integer, anchor_date date, auto_rollover boolean, active boolean)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT s.id,s.party_type,s.party_id,
    CASE WHEN s.party_id IS NULL THEN 'Todos' WHEN s.party_type='company' THEN c.name ELSE p.full_name END,
    s.frequency,s.interval_days,s.anchor_date,s.auto_rollover,s.active
  FROM settlement_schedules s LEFT JOIN companies c ON c.id=s.party_id AND s.party_type='company'
  LEFT JOIN couriers co ON co.id=s.party_id AND s.party_type='courier' LEFT JOIN profiles p ON p.id=co.profile_id
  WHERE EXISTS (SELECT 1 FROM profiles pr JOIN companies own ON own.id=pr.company_id WHERE pr.id=auth.uid() AND pr.active AND pr.role IN ('super_admin','company_admin') AND (coalesce(own.is_owner_company,false) OR coalesce(own.is_system_company,false)))
  ORDER BY s.party_type,s.party_id NULLS FIRST;
$$;


ALTER FUNCTION public.get_settlement_schedules() OWNER TO postgres;

--
-- TOC entry 513 (class 1255 OID 30553)
-- Name: get_unassigned_settlement_financial_records(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_unassigned_settlement_financial_records() RETURNS TABLE(company_records bigint, courier_records bigint)
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles profile
    JOIN companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid()
      AND profile.active
      AND profile.role IN ('super_admin','company_admin')
      AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para recuperar registros de liquidación.';
  END IF;

  RETURN QUERY
  SELECT
    count(*) FILTER (WHERE financial.record_type = 'company_delivery_charge'),
    count(*) FILTER (WHERE financial.record_type = 'courier_delivery_payment')
  FROM shipment_delivery_financial_records financial
  WHERE financial.status = 'pending'
    AND NOT EXISTS (
      SELECT 1 FROM settlement_period_items item
      WHERE item.financial_record_id = financial.id
    );
END;
$$;


ALTER FUNCTION public.get_unassigned_settlement_financial_records() OWNER TO postgres;

--
-- TOC entry 481 (class 1255 OID 30149)
-- Name: get_unread_chat_notifications(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_unread_chat_notifications() RETURNS TABLE(conversation_id uuid, subject text, tracking_number text, company_name text, unread_count bigint, last_message text, last_message_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  WITH pending AS (
    SELECT m.* FROM public.chat_messages m
    WHERE m.author_id <> auth.uid() AND m.deleted_at IS NULL AND public.can_access_chat(m.conversation_id)
      AND NOT EXISTS (SELECT 1 FROM public.chat_message_reads r WHERE r.message_id=m.id AND r.profile_id=auth.uid())
  )
  SELECT c.id, c.subject, s.tracking_number, company.name, count(p.id)::bigint,
    (array_agg(coalesce(p.body,'Ubicación o adjunto') ORDER BY p.created_at DESC))[1], max(p.created_at)
  FROM pending p JOIN public.chat_conversations c ON c.id=p.conversation_id
  LEFT JOIN public.shipments s ON s.id=c.shipment_id
  LEFT JOIN public.companies company ON company.id=c.client_company_id
  GROUP BY c.id,c.subject,s.tracking_number,company.name ORDER BY max(p.created_at) DESC;
$$;


ALTER FUNCTION public.get_unread_chat_notifications() OWNER TO postgres;

--
-- TOC entry 514 (class 1255 OID 30691)
-- Name: get_visible_company_directory(uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_visible_company_directory(p_company_ids uuid[] DEFAULT NULL::uuid[]) RETURNS TABLE(id uuid, code text, name text, display_name text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  WITH viewer AS (
    SELECT profile.id, profile.role, profile.company_id,
           coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false) AS is_eps
    FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid() AND profile.active = true
  ), visible AS (
    SELECT company.*
    FROM public.companies company
    CROSS JOIN viewer
    WHERE (p_company_ids IS NULL OR company.id = ANY(p_company_ids))
      AND (
        viewer.role <> 'courier'
        OR company.id = viewer.company_id
        OR EXISTS (
          SELECT 1
          FROM public.shipments shipment
          JOIN public.couriers courier ON courier.id = shipment.courier_id
          WHERE courier.profile_id = viewer.id
            AND shipment.company_id = company.id
        )
      )
  )
  SELECT company.id, company.code,
         CASE WHEN (SELECT role FROM viewer) = 'courier' THEN NULL ELSE company.name END,
         CASE WHEN (SELECT role FROM viewer) = 'courier' THEN company.code
              ELSE concat_ws(' - ', nullif(company.code, ''), nullif(company.name, '')) END
  FROM visible company;
$$;


ALTER FUNCTION public.get_visible_company_directory(p_company_ids uuid[]) OWNER TO postgres;

--
-- TOC entry 488 (class 1255 OID 29473)
-- Name: is_owner_company_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_owner_company_user() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists (
    select 1
    from public.profiles profile
    join public.companies company on company.id = profile.company_id
    where profile.id = auth.uid()
      and profile.active = true
      and company.is_owner_company = true
  );
$$;


ALTER FUNCTION public.is_owner_company_user() OWNER TO postgres;

--
-- TOC entry 577 (class 1255 OID 29504)
-- Name: log_tracking_record_changes(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.log_tracking_record_changes() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


ALTER FUNCTION public.log_tracking_record_changes() OWNER TO postgres;

--
-- TOC entry 606 (class 1255 OID 30150)
-- Name: mark_chat_conversation_read(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mark_chat_conversation_read(p_conversation_id uuid) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  INSERT INTO public.chat_message_reads(message_id,profile_id)
  SELECT m.id,auth.uid() FROM public.chat_messages m WHERE m.conversation_id=p_conversation_id AND m.author_id<>auth.uid() AND m.deleted_at IS NULL AND public.can_access_chat(p_conversation_id)
  ON CONFLICT DO NOTHING;
$$;


ALTER FUNCTION public.mark_chat_conversation_read(p_conversation_id uuid) OWNER TO postgres;

--
-- TOC entry 630 (class 1255 OID 30556)
-- Name: record_shipment_creation_history(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.record_shipment_creation_history() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.shipment_status_history (
    shipment_id,
    previous_status,
    status,
    notes,
    created_by
  ) VALUES (
    NEW.id,
    NULL,
    NEW.status,
    'Envío creado.',
    auth.uid()
  );

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.record_shipment_creation_history() OWNER TO postgres;

--
-- TOC entry 506 (class 1255 OID 27767)
-- Name: refresh_shipment_search_text(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.refresh_shipment_search_text(p_shipment_id uuid) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin

  update shipments s

  set search_text = lower(
    trim(
      concat_ws(
        ' ',

        coalesce(
          s.tracking_number,
          ''
        ),

        coalesce(
          s.customer_name,
          ''
        ),

        coalesce(
          s.customer_identification,
          ''
        ),

        coalesce(
          s.internal_reference,
          ''
        ),

        coalesce(
          (
            select string_agg(
              scm.value,
              ' '
            )

            from shipment_contact_methods scm

            where scm.shipment_id = s.id
          ),
          ''
        )

      )
    )
  )

  where s.id = p_shipment_id;

end;
$$;


ALTER FUNCTION public.refresh_shipment_search_text(p_shipment_id uuid) OWNER TO postgres;

--
-- TOC entry 562 (class 1255 OID 30483)
-- Name: register_shipment_failed_attempt(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.register_shipment_failed_attempt(p_shipment_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  previous_status public.shipment_status; shipment_company_id uuid; shipment_courier_id uuid; shipment_route_id uuid;
  tracking text; customer text; company_label text; courier_label text; route_label text;
  v_neighborhood_id bigint; v_district_id bigint; v_canton_id bigint; v_province_id bigint;
  company_default numeric; courier_default numeric; company_rate record; courier_rate record; event_id uuid := gen_random_uuid(); occurred timestamptz := now();
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debe iniciar sesión.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p JOIN public.companies c ON c.id=p.company_id WHERE p.id=auth.uid() AND p.active AND (coalesce(c.is_owner_company,false) OR coalesce(c.is_system_company,false))) THEN RAISE EXCEPTION 'Solo EPS puede registrar intentos fallidos.'; END IF;
  SELECT s.status,s.company_id,s.courier_id,s.route_id,s.tracking_number,s.customer_name,c.name,s.neighborhood_id,
         coalesce(n.district_id,s.district_id),d.canton_id,ca.province_id,c.delivery_charge,r.name
    INTO previous_status,shipment_company_id,shipment_courier_id,shipment_route_id,tracking,customer,company_label,v_neighborhood_id,v_district_id,v_canton_id,v_province_id,company_default,route_label
    FROM public.shipments s JOIN public.companies c ON c.id=s.company_id LEFT JOIN public.routes r ON r.id=s.route_id
    LEFT JOIN public.neighborhoods n ON n.id=s.neighborhood_id LEFT JOIN public.districts d ON d.id=coalesce(n.district_id,s.district_id)
    LEFT JOIN public.cantons ca ON ca.id=d.canton_id WHERE s.id=p_shipment_id FOR UPDATE OF s;
  IF NOT FOUND THEN RAISE EXCEPTION 'El envío no existe.'; END IF;
  IF shipment_courier_id IS NULL THEN RAISE EXCEPTION 'El envío no tiene mensajero asignado.'; END IF;
  SELECT p.full_name,p.failed_pay INTO courier_label,courier_default FROM public.couriers co JOIN public.profiles p ON p.id=co.profile_id WHERE co.id=shipment_courier_id AND co.active AND p.active;
  IF courier_label IS NULL THEN RAISE EXCEPTION 'El mensajero asignado no está habilitado.'; END IF;
  SELECT rate.id,rate.failed_charge,CASE WHEN rate.neighborhood_id IS NOT NULL THEN 'neighborhood' WHEN rate.district_id IS NOT NULL THEN 'district' WHEN rate.canton_id IS NOT NULL THEN 'canton' WHEN rate.province_id IS NOT NULL THEN 'province' ELSE 'route' END INTO company_rate FROM public.delivery_rates rate
   WHERE rate.company_id=shipment_company_id AND rate.route_id=shipment_route_id AND rate.active AND (rate.province_id IS NULL OR rate.province_id=v_province_id) AND (rate.canton_id IS NULL OR rate.canton_id=v_canton_id) AND (rate.district_id IS NULL OR rate.district_id=v_district_id) AND (rate.neighborhood_id IS NULL OR rate.neighborhood_id=v_neighborhood_id)
   ORDER BY (rate.neighborhood_id IS NOT NULL) DESC,(rate.district_id IS NOT NULL) DESC,(rate.canton_id IS NOT NULL) DESC,(rate.province_id IS NOT NULL) DESC,rate.created_at DESC LIMIT 1;
  SELECT rate.id,rate.failed_pay,CASE WHEN rate.neighborhood_id IS NOT NULL THEN 'neighborhood' WHEN rate.district_id IS NOT NULL THEN 'district' WHEN rate.canton_id IS NOT NULL THEN 'canton' WHEN rate.province_id IS NOT NULL THEN 'province' ELSE 'route' END INTO courier_rate FROM public.courier_delivery_rates rate
   WHERE rate.courier_id=shipment_courier_id AND rate.route_id=shipment_route_id AND rate.active AND (rate.province_id IS NULL OR rate.province_id=v_province_id) AND (rate.canton_id IS NULL OR rate.canton_id=v_canton_id) AND (rate.district_id IS NULL OR rate.district_id=v_district_id) AND (rate.neighborhood_id IS NULL OR rate.neighborhood_id=v_neighborhood_id)
   ORDER BY (rate.neighborhood_id IS NOT NULL) DESC,(rate.district_id IS NOT NULL) DESC,(rate.canton_id IS NOT NULL) DESC,(rate.province_id IS NOT NULL) DESC,rate.created_at DESC LIMIT 1;
  UPDATE public.shipments SET status='failed_attempt',last_update_at=occurred,last_update_message='Intento de entrega fallido registrado' WHERE id=p_shipment_id;
  INSERT INTO public.shipment_status_history(shipment_id,previous_status,status,notes,created_by) VALUES(p_shipment_id,previous_status,'failed_attempt','Intento fallido registrado para liquidación',auth.uid());
  INSERT INTO public.shipment_delivery_financial_records(event_id,shipment_id,operation_type,record_type,status,company_id,courier_id,route_id,delivery_rate_id,tracking_number,customer_name,company_name,courier_name,route_name,rate_scope,original_amount,amount,occurred_at,created_by)
  VALUES(event_id,p_shipment_id,'failed_attempt','company_delivery_charge',CASE WHEN company_rate.id IS NULL AND company_default IS NULL THEN 'unrated' ELSE 'pending' END,shipment_company_id,shipment_courier_id,shipment_route_id,company_rate.id,tracking,customer,company_label,courier_label,route_label,coalesce(company_rate.rate_scope,'default'),coalesce(company_rate.failed_charge,company_default,0),coalesce(company_rate.failed_charge,company_default,0),occurred,auth.uid());
  INSERT INTO public.shipment_delivery_financial_records(event_id,shipment_id,operation_type,record_type,status,company_id,courier_id,route_id,courier_delivery_rate_id,tracking_number,customer_name,company_name,courier_name,route_name,rate_scope,original_amount,amount,occurred_at,created_by)
  VALUES(event_id,p_shipment_id,'failed_attempt','courier_delivery_payment',CASE WHEN courier_rate.id IS NULL AND courier_default IS NULL THEN 'unrated' ELSE 'pending' END,shipment_company_id,shipment_courier_id,shipment_route_id,courier_rate.id,tracking,customer,company_label,courier_label,route_label,coalesce(courier_rate.rate_scope,'default'),coalesce(courier_rate.failed_pay,courier_default,0),coalesce(courier_rate.failed_pay,courier_default,0),occurred,auth.uid());
END; $$;


ALTER FUNCTION public.register_shipment_failed_attempt(p_shipment_id uuid) OWNER TO postgres;

--
-- TOC entry 479 (class 1255 OID 30011)
-- Name: remove_route_bulk_coverage_with_neighborhoods(uuid, bigint[], bigint[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.remove_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) RETURNS TABLE(removed_neighborhoods integer, affected_districts integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE v_removed integer;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND active = true AND role = 'super_admin') THEN RAISE EXCEPTION 'No autorizado para modificar cobertura de rutas.'; END IF;
  WITH targets AS (SELECT DISTINCT unnest(coalesce(p_district_ids, '{}'::bigint[])) AS id), removed AS (
    DELETE FROM route_coverage rc USING neighborhoods n
    WHERE rc.route_id = p_route_id AND rc.neighborhood_id = n.id
      AND (n.district_id IN (SELECT id FROM targets) OR n.id = ANY(coalesce(p_neighborhood_ids, '{}'::bigint[])))
    RETURNING n.district_id
  ) SELECT count(*) INTO v_removed FROM removed;
  DELETE FROM route_district_delivery_times WHERE route_id=p_route_id AND district_id=ANY(coalesce(p_district_ids, '{}'::bigint[]));
  DELETE FROM route_district_visit_days WHERE route_id=p_route_id AND district_id=ANY(coalesce(p_district_ids, '{}'::bigint[]));
  RETURN QUERY SELECT v_removed, (SELECT count(DISTINCT district_id)::integer FROM neighborhoods WHERE id = ANY(coalesce(p_neighborhood_ids, '{}'::bigint[])) OR district_id = ANY(coalesce(p_district_ids, '{}'::bigint[])));
END; $$;


ALTER FUNCTION public.remove_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) OWNER TO postgres;

--
-- TOC entry 483 (class 1255 OID 29952)
-- Name: save_courier_route_assignments(text, uuid, uuid[], uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.save_courier_route_assignments(p_axis text, p_subject_id uuid, p_ids uuid[], p_expected_ids uuid[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
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


ALTER FUNCTION public.save_courier_route_assignments(p_axis text, p_subject_id uuid, p_ids uuid[], p_expected_ids uuid[]) OWNER TO postgres;

--
-- TOC entry 529 (class 1255 OID 30507)
-- Name: save_settlement_schedule(text, uuid, text, integer, date, boolean); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.save_settlement_schedule(p_party_type text, p_party_id uuid, p_frequency text, p_interval_days integer, p_anchor_date date, p_auto_rollover boolean) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$ DECLARE v_id uuid; BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles pr JOIN companies own ON own.id=pr.company_id WHERE pr.id=auth.uid() AND pr.active AND pr.role IN ('super_admin','company_admin') AND (coalesce(own.is_owner_company,false) OR coalesce(own.is_system_company,false))) THEN RAISE EXCEPTION 'No tiene permiso para configurar cierres.'; END IF;
  IF p_party_type NOT IN ('company','courier') OR p_frequency NOT IN ('weekly','biweekly','monthly','custom_days') THEN RAISE EXCEPTION 'Configuración no válida.'; END IF;
  INSERT INTO settlement_schedules(name,target_type,frequency_days,include_all,party_type,party_id,frequency,interval_days,anchor_date,auto_rollover,created_by)
  VALUES(
    format('%s · %s', CASE WHEN p_party_type='company' THEN 'Cierre DTS' ELSE 'Cierre mensajeros' END, CASE p_frequency WHEN 'weekly' THEN 'semanal' WHEN 'biweekly' THEN 'quincenal' WHEN 'monthly' THEN 'mensual' ELSE format('cada %s días', p_interval_days) END),
    p_party_type,
    CASE p_frequency WHEN 'weekly' THEN 7 WHEN 'biweekly' THEN 14 WHEN 'monthly' THEN 30 ELSE p_interval_days END,
    p_party_id IS NULL,
    p_party_type,p_party_id,p_frequency,CASE WHEN p_frequency='custom_days' THEN p_interval_days ELSE NULL END,p_anchor_date,p_auto_rollover,auth.uid()
  ) RETURNING id INTO v_id; RETURN v_id; END; $$;


ALTER FUNCTION public.save_settlement_schedule(p_party_type text, p_party_id uuid, p_frequency text, p_interval_days integer, p_anchor_date date, p_auto_rollover boolean) OWNER TO postgres;

--
-- TOC entry 590 (class 1255 OID 30505)
-- Name: set_settlement_item_exclusion(uuid, boolean, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_settlement_item_exclusion(p_item_id uuid, p_excluded boolean, p_reason text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles profile JOIN public.companies company ON company.id = profile.company_id WHERE profile.id = auth.uid() AND profile.active AND profile.role IN ('super_admin','company_admin') AND (coalesce(company.is_owner_company,false) OR coalesce(company.is_system_company,false))) THEN RAISE EXCEPTION 'No tiene permiso para modificar períodos.'; END IF;
  UPDATE public.settlement_period_items item SET excluded = p_excluded,
      exclusion_reason = CASE WHEN p_excluded THEN nullif(trim(coalesce(p_reason,'')), '') ELSE NULL END,
      excluded_by = CASE WHEN p_excluded THEN auth.uid() ELSE NULL END,
      excluded_at = CASE WHEN p_excluded THEN now() ELSE NULL END
    FROM public.settlement_periods period
   WHERE item.id = p_item_id AND period.id = item.period_id AND period.status = 'open';
  IF NOT FOUND THEN RAISE EXCEPTION 'El ítem no existe o su período está cerrado.'; END IF;
END;
$$;


ALTER FUNCTION public.set_settlement_item_exclusion(p_item_id uuid, p_excluded boolean, p_reason text) OWNER TO postgres;

--
-- TOC entry 554 (class 1255 OID 25718)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

--
-- TOC entry 503 (class 1255 OID 27518)
-- Name: shipment_before_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.shipment_before_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN

    IF NEW.tracking_number IS NULL THEN
        NEW.tracking_number := generate_tracking_number();
    END IF;

    RETURN NEW;

END;
$$;


ALTER FUNCTION public.shipment_before_insert() OWNER TO postgres;

--
-- TOC entry 582 (class 1255 OID 27770)
-- Name: shipment_contact_search_text_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.shipment_contact_search_text_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin

  perform refresh_shipment_search_text(

    coalesce(
      new.shipment_id,
      old.shipment_id
    )

  );

  return coalesce(
    new,
    old
  );

end;
$$;


ALTER FUNCTION public.shipment_contact_search_text_trigger() OWNER TO postgres;

--
-- TOC entry 560 (class 1255 OID 27768)
-- Name: shipment_search_text_trigger(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.shipment_search_text_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin

  new.search_text := lower(
    trim(
      concat_ws(
        ' ',

        coalesce(
          new.tracking_number,
          ''
        ),

        coalesce(
          new.customer_name,
          ''
        ),

        coalesce(
          new.customer_identification,
          ''
        ),

        coalesce(
          new.internal_reference,
          ''
        ),

        coalesce(
          (
            select string_agg(
              scm.value,
              ' '
            )

            from shipment_contact_methods scm

            where scm.shipment_id = new.id
          ),
          ''
        )

      )
    )
  );

  return new;

end;
$$;


ALTER FUNCTION public.shipment_search_text_trigger() OWNER TO postgres;

--
-- TOC entry 626 (class 1255 OID 29650)
-- Name: soft_delete_shipment_attachments(uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.soft_delete_shipment_attachments(p_attachment_ids uuid[]) RETURNS TABLE(attachment_id uuid, attachment_storage_path text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  requested_count integer;
  permitted_count integer;
begin
  if auth.uid() is null then
    raise exception 'Debe iniciar sesión para eliminar adjuntos.';
  end if;

  requested_count := coalesce(cardinality(p_attachment_ids), 0);

  if requested_count = 0 then
    return;
  end if;

  select count(*)
    into permitted_count
    from public.shipment_attachments attachment
   where attachment.id = any(p_attachment_ids)
     and attachment.created_by = auth.uid()
     and attachment.deleted_at is null;

  if permitted_count <> requested_count then
    raise exception 'Solo puede eliminar archivos que usted mismo subió.';
  end if;

  return query
    update public.shipment_attachments attachment
       set deleted_at = now(),
           deleted_by = auth.uid()
     where attachment.id = any(p_attachment_ids)
       and attachment.created_by = auth.uid()
       and attachment.deleted_at is null
    returning attachment.id, attachment.storage_path;
end;
$$;


ALTER FUNCTION public.soft_delete_shipment_attachments(p_attachment_ids uuid[]) OWNER TO postgres;

--
-- TOC entry 520 (class 1255 OID 29600)
-- Name: soft_delete_shipment_evidences(uuid[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.soft_delete_shipment_evidences(p_evidence_ids uuid[]) RETURNS TABLE(evidence_id uuid, evidence_storage_path text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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


ALTER FUNCTION public.soft_delete_shipment_evidences(p_evidence_ids uuid[]) OWNER TO postgres;

--
-- TOC entry 558 (class 1255 OID 29874)
-- Name: submit_public_shipment_customer_location(text, double precision, double precision, double precision); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.submit_public_shipment_customer_location(p_token_hash text, p_latitude double precision, p_longitude double precision, p_accuracy_meters double precision) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $_$
declare v_request shipment_customer_location_requests%rowtype;
begin
 if p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'Enlace inválido o vencido.'; end if;
 if p_latitude not between -90 and 90 or p_longitude not between -180 and 180 then raise exception 'Coordenadas inválidas.'; end if;
 if p_accuracy_meters is null or p_accuracy_meters<0 or p_accuracy_meters>100000 then raise exception 'Precisión GPS inválida.'; end if;
 select * into v_request from shipment_customer_location_requests where token_hash=p_token_hash and used_at is null and expires_at>now() for update;
 if not found then raise exception 'Este enlace ya fue usado o venció.'; end if;
 update shipments set customer_latitude=p_latitude,customer_longitude=p_longitude,customer_location_accuracy_meters=p_accuracy_meters,customer_location_received_at=now() where id=v_request.shipment_id;
 update shipment_customer_location_requests set used_at=now() where id=v_request.id;
end; $_$;


ALTER FUNCTION public.submit_public_shipment_customer_location(p_token_hash text, p_latitude double precision, p_longitude double precision, p_accuracy_meters double precision) OWNER TO postgres;

--
-- TOC entry 492 (class 1255 OID 29945)
-- Name: sync_courier_profile_availability(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_courier_profile_availability() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  update public.couriers set active = (new.active is true and new.can_deliver is true)
    where profile_id = new.id;
  return new;
end;
$$;


ALTER FUNCTION public.sync_courier_profile_availability() OWNER TO postgres;

--
-- TOC entry 595 (class 1255 OID 30502)
-- Name: trigger_assign_financial_record_to_settlement(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_assign_financial_record_to_settlement() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  PERFORM public.assign_financial_record_to_settlement(NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_assign_financial_record_to_settlement() OWNER TO postgres;

--
-- TOC entry 592 (class 1255 OID 30463)
-- Name: update_courier_delivery_payment_amount(uuid, numeric, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_courier_delivery_payment_amount(p_financial_record_id uuid, p_new_amount numeric, p_justification text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  current_amount numeric;
BEGIN
  IF p_new_amount IS NULL OR p_new_amount < 0 THEN
    RAISE EXCEPTION 'El nuevo monto debe ser igual o mayor que cero.';
  END IF;
  IF length(trim(coalesce(p_justification, ''))) NOT BETWEEN 1 AND 500 THEN
    RAISE EXCEPTION 'Debe indicar una justificación de hasta 500 caracteres.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles profile
    JOIN public.companies company ON company.id = profile.company_id
    WHERE profile.id = auth.uid() AND profile.active = true
      AND profile.role IN ('super_admin', 'company_admin')
      AND (coalesce(company.is_owner_company, false) OR coalesce(company.is_system_company, false))
  ) THEN
    RAISE EXCEPTION 'No tiene permiso para modificar pagos de mensajeros.';
  END IF;

  SELECT amount INTO current_amount
    FROM public.shipment_delivery_financial_records
   WHERE id = p_financial_record_id
     AND record_type = 'courier_delivery_payment'
     AND status <> 'voided'
   FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'El pago no existe o está anulado.'; END IF;
  IF current_amount = p_new_amount THEN RAISE EXCEPTION 'El monto nuevo es igual al monto actual.'; END IF;

  UPDATE public.shipment_delivery_financial_records
     SET amount = p_new_amount
   WHERE id = p_financial_record_id;
  INSERT INTO public.shipment_delivery_financial_amount_changes (
    financial_record_id, previous_amount, new_amount, justification, changed_by
  ) VALUES (p_financial_record_id, current_amount, p_new_amount, trim(p_justification), auth.uid());
END;
$$;


ALTER FUNCTION public.update_courier_delivery_payment_amount(p_financial_record_id uuid, p_new_amount numeric, p_justification text) OWNER TO postgres;

--
-- TOC entry 540 (class 1255 OID 17443)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- TOC entry 527 (class 1255 OID 17522)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_realtime_admin;

--
-- TOC entry 565 (class 1255 OID 17455)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_realtime_admin;

--
-- TOC entry 526 (class 1255 OID 17405)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_realtime_admin;

--
-- TOC entry 638 (class 1255 OID 17400)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_realtime_admin;

--
-- TOC entry 636 (class 1255 OID 28650)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO supabase_realtime_admin;

--
-- TOC entry 519 (class 1255 OID 17451)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_realtime_admin;

--
-- TOC entry 475 (class 1255 OID 27592)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- TOC entry 604 (class 1255 OID 17207)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_realtime_admin;

--
-- TOC entry 586 (class 1255 OID 17521)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- TOC entry 614 (class 1255 OID 27601)
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- TOC entry 501 (class 1255 OID 17205)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    -- Normalize selected_columns order so ARRAY['a','b'] and ARRAY['b','a'] are treated
    -- as the same subscription group in apply_rls. Preserve an empty array as '{}'
    -- ("primary keys only") so it stays distinct from NULL ("all columns"); array_agg
    -- over an empty set would otherwise collapse '{}' back to NULL.
    if new.selected_columns is not null then
        new.selected_columns = coalesce(
            (
                select array_agg(c order by c)
                from unnest(new.selected_columns) c
            ),
            '{}'::text[]
        );
    end if;

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_realtime_admin;

--
-- TOC entry 627 (class 1255 OID 17432)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_realtime_admin;

--
-- TOC entry 490 (class 1255 OID 17515)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- TOC entry 555 (class 1255 OID 27591)
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_realtime_admin;

--
-- TOC entry 546 (class 1255 OID 17396)
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- TOC entry 599 (class 1255 OID 17395)
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- TOC entry 613 (class 1255 OID 17271)
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- TOC entry 578 (class 1255 OID 29903)
-- Name: enforce_bucket_lifecycle_service_role(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_lifecycle_service_role() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog'
    AS $$
BEGIN
  IF current_user::text IS DISTINCT FROM TG_ARGV[0]
     AND (
       OLD.lifecycle_configuration IS DISTINCT FROM NEW.lifecycle_configuration
       OR OLD.lifecycle_configuration_generation IS DISTINCT FROM NEW.lifecycle_configuration_generation
     ) THEN
    -- AFTER runs only after caller RLS has accepted the proposed row. The API
    -- recognizes this specific error after rolling back its permission probe;
    -- direct non-service writes still fail and cannot persist the change.
    RAISE EXCEPTION 'bucket control columns may only be changed by the configured storage service role'
      USING ERRCODE = 'PST01',
            SCHEMA = TG_TABLE_SCHEMA,
            TABLE = TG_TABLE_NAME,
            CONSTRAINT = TG_NAME;
  END IF;

  RETURN NULL;
END;
$$;


ALTER FUNCTION storage.enforce_bucket_lifecycle_service_role() OWNER TO supabase_storage_admin;

--
-- TOC entry 589 (class 1255 OID 17327)
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- TOC entry 553 (class 1255 OID 17246)
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 564 (class 1255 OID 17245)
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 568 (class 1255 OID 17244)
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 600 (class 1255 OID 17384)
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN p_delimiter <> ''
         AND position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(
        p_key,
        length(p_prefix)
            + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1))
            + length(p_delimiter) - 1
    )
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- TOC entry 585 (class 1255 OID 29915)
-- Name: get_size_by_bucket(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket(noncurrent_versions text DEFAULT 'include'::text, delete_markers text DEFAULT 'include'::text) RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'include');
    delete_markers := COALESCE(delete_markers, 'include');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'include';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'include';
    END IF;

    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        where (noncurrent_versions != 'exclude' OR obj.archived_at IS NULL)
          and (noncurrent_versions != 'only' OR obj.archived_at IS NOT NULL)
          and (delete_markers != 'exclude' OR NOT obj.is_delete_marker)
          and (delete_markers != 'only' OR obj.is_delete_marker)
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket(noncurrent_versions text, delete_markers text) OWNER TO supabase_storage_admin;

--
-- TOC entry 605 (class 1255 OID 29907)
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text, raw_prefix_param text DEFAULT NULL::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE sql STABLE
    AS $_$
WITH candidates AS (
    SELECT
        upload.key AS object_key,
        CASE
            WHEN position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1)) > 0
            THEN left(
                upload.key,
                length(coalesce($7, $2))
                    + position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1))
                    + length($3) - 1
            )
            ELSE upload.key
        END AS result_key,
        upload.id,
        upload.created_at,
        position($3 IN substring(upload.key FROM length(coalesce($7, $2)) + 1)) > 0 AS is_common_prefix
    FROM storage.s3_multipart_uploads AS upload
    WHERE upload.bucket_id = $1
      AND upload.key COLLATE "C" LIKE $2 || '%'
), filtered AS (
    SELECT candidate.*
    FROM candidates AS candidate
    WHERE $5 = ''
       OR candidate.result_key COLLATE "C" > $5
       OR (
           candidate.result_key COLLATE "C" = $5
           AND NOT candidate.is_common_prefix
           AND $6 <> ''
           -- A completed or aborted marker repeats the remaining same-key uploads.
           AND COALESCE(
               (candidate.created_at, candidate.id COLLATE "C") > (
                   SELECT marker.created_at, marker.id COLLATE "C"
                   FROM storage.s3_multipart_uploads AS marker
                   WHERE marker.bucket_id = $1
                     AND marker.key COLLATE "C" = $5
                     AND marker.id = $6
               ),
               TRUE
           )
       )
), ranked AS (
    SELECT
        filtered.*,
        row_number() OVER (
            PARTITION BY filtered.result_key COLLATE "C"
            ORDER BY filtered.created_at, filtered.id COLLATE "C"
        ) AS prefix_rank
    FROM filtered
)
SELECT ranked.result_key, ranked.id, ranked.created_at
FROM ranked
WHERE NOT ranked.is_common_prefix OR ranked.prefix_rank = 1
ORDER BY ranked.result_key COLLATE "C", ranked.created_at, ranked.id COLLATE "C"
LIMIT $4;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text, raw_prefix_param text) OWNER TO supabase_storage_admin;

--
-- TOC entry 471 (class 1255 OID 29908)
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text, text, text, timestamp with time zone, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, next_token_archived_at timestamp with time zone DEFAULT NULL::timestamp with time zone, next_token_version text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_start_relative TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;
    v_version_filter TEXT;

    -- true when noncurrent_versions can return >1 row per name; keeps them
    -- ordered most-recent-first and lets pagination resume mid-key
    v_multi_row BOOLEAN;
    v_name_order TEXT;
    v_exact_range_predicate TEXT;
    v_strict_range_predicate TEXT;
    v_inclusive_range_predicate TEXT;

    -- Seek state for the current name. archived_at is normalized to JavaScript's
    -- millisecond precision and version breaks ties within the same millisecond.
    -- Current rows use 'infinity'; NULL means no tiebreak has been established.
    v_next_seek TEXT;
    v_next_seek_at TIMESTAMPTZ;
    v_next_seek_version TEXT;
    v_next_seek_strict BOOLEAN := false;
    v_cursor_is_folder BOOLEAN;
    v_count INT := 0;
    v_previous_seek TEXT;
    v_previous_seek_at TIMESTAMPTZ;
    v_previous_seek_version TEXT;
    v_previous_count INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;
    v_batch_query_strict TEXT;
    v_delete_marker_peek_query TEXT;
    v_delete_marker_peek_query_strict TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);
    v_next_seek_at := NULL;
    v_next_seek_version := '';

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    v_multi_row := noncurrent_versions IN ('only', 'include');
    v_name_order := CASE WHEN v_is_asc THEN 'ASC' ELSE 'DESC' END;

    v_version_filter := '';
    IF noncurrent_versions = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NULL';
    ELSIF noncurrent_versions = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NOT NULL';
    END IF;
    IF delete_markers = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND NOT o.is_delete_marker';
    ELSIF delete_markers = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.is_delete_marker';
    END IF;

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Keep caller-provided cursors inside the requested prefix range.
    IF v_start <> '' AND v_upper_bound IS NOT NULL THEN
        IF v_is_asc THEN
            IF v_start COLLATE "C" < v_prefix COLLATE "C" THEN
                v_start := '';
            ELSIF v_start COLLATE "C" >= v_upper_bound COLLATE "C" THEN
                RETURN;
            END IF;
        ELSE
            IF v_start COLLATE "C" < v_prefix COLLATE "C" THEN
                RETURN;
            ELSIF v_start COLLATE "C" >= v_upper_bound COLLATE "C" THEN
                v_start := '';
            END IF;
        END IF;
    END IF;

    v_start_relative := substring(v_start FROM length(v_prefix) + 1);

    -- Direction affects only the indexed name range and its ordering. Cursor
    -- state transitions and within-key version ordering stay shared.
    IF v_is_asc THEN
        v_exact_range_predicate := 'TRUE';
        v_strict_range_predicate := 'o.name COLLATE "C" > $2';
        v_inclusive_range_predicate := 'o.name COLLATE "C" >= $2';
        IF v_upper_bound IS NOT NULL THEN
            v_exact_range_predicate := 'o.name COLLATE "C" < $3';
            v_strict_range_predicate := v_strict_range_predicate || ' AND o.name COLLATE "C" < $3';
            v_inclusive_range_predicate := v_inclusive_range_predicate || ' AND o.name COLLATE "C" < $3';
        END IF;
    ELSE
        v_exact_range_predicate := 'TRUE';
        v_strict_range_predicate := 'o.name COLLATE "C" < $2';
        v_inclusive_range_predicate := 'o.name COLLATE "C" < $2';
        IF v_prefix <> '' THEN
            v_exact_range_predicate := 'o.name COLLATE "C" >= $3';
            v_strict_range_predicate := v_strict_range_predicate || ' AND o.name COLLATE "C" >= $3';
            v_inclusive_range_predicate := v_inclusive_range_predicate || ' AND o.name COLLATE "C" >= $3';
        END IF;
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    -- The multi-row order matches the externally serialized cursor exactly:
    -- archived_at at millisecond precision, then version as the final tiebreak.
    --
    -- When v_multi_row, the seek is a keyset tuple comparison ("name > $2 OR
    -- (name = $2 AND tiebreak)") - Postgres won't split that OR into indexable
    -- form (confirmed even with fully literal values), so as one WHERE clause
    -- it forces a full bucket scan filtered row-by-row. Splitting it into two
    -- independently-indexable branches (exact name match with the tiebreak
    -- filter, vs. strictly-past names) combined with UNION ALL lets each
    -- branch keep name as a real index condition; the outer ORDER BY/LIMIT
    -- re-merges them into the same page the single query used to produce.
    IF v_multi_row THEN
        v_batch_query := format(
            $sql$
            SELECT *
            FROM (
                (
                    SELECT o.name, o.id, o.updated_at, o.created_at,
                           o.last_accessed_at, o.metadata, o.version,
                           o.archived_at, o.is_delete_marker, o.is_versioned
                    FROM storage.objects o
                    WHERE o.bucket_id = $1
                      AND o.name COLLATE "C" = $2
                      AND %s
                      AND NOT $7::boolean
                      AND (
                          $5::timestamptz IS NULL
                          OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < $5
                          OR (
                              COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = $5
                              AND COALESCE(o.version, '') > $6
                          )
                      )
                      %s
                    ORDER BY
                        COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC,
                        COALESCE(o.version, '') ASC
                    LIMIT $4
                )
                UNION ALL
                (
                    SELECT o.name, o.id, o.updated_at, o.created_at,
                           o.last_accessed_at, o.metadata, o.version,
                           o.archived_at, o.is_delete_marker, o.is_versioned
                    FROM storage.objects o
                    WHERE o.bucket_id = $1
                      AND %s
                      %s
                    ORDER BY
                        o.name COLLATE "C" %s,
                        COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC,
                        COALESCE(o.version, '') ASC
                    LIMIT $4
                )
            ) sub
            ORDER BY
                sub.name COLLATE "C" %s,
                COALESCE(date_trunc('milliseconds', sub.archived_at), 'infinity'::timestamptz) DESC,
                COALESCE(sub.version, '') ASC
            LIMIT $4
            $sql$,
            v_exact_range_predicate,
            v_version_filter,
            v_strict_range_predicate,
            v_version_filter,
            v_name_order,
            v_name_order
        );
    ELSE
        v_batch_query := format(
            $sql$
            SELECT o.name, o.id, o.updated_at, o.created_at,
                   o.last_accessed_at, o.metadata, o.version,
                   o.archived_at, o.is_delete_marker, o.is_versioned
            FROM storage.objects o
            WHERE o.bucket_id = $1
              AND %s
              %s
            ORDER BY o.name COLLATE "C" %s, o.archived_at DESC
            LIMIT $4
            $sql$,
            v_inclusive_range_predicate,
            v_version_filter,
            v_name_order
        );

        -- Strict counterpart of the query above: used once the single-row
        -- ASC batch advance (below) has left v_next_seek pointing at the
        -- last row already emitted, so an inclusive predicate would
        -- re-match it forever. Only single-row mode ever sets strict mode,
        -- so this variant is never needed when v_multi_row.
        v_batch_query_strict := format(
            $sql$
            SELECT o.name, o.id, o.updated_at, o.created_at,
                   o.last_accessed_at, o.metadata, o.version,
                   o.archived_at, o.is_delete_marker, o.is_versioned
            FROM storage.objects o
            WHERE o.bucket_id = $1
              AND %s
              %s
            ORDER BY o.name COLLATE "C" %s, o.archived_at DESC
            LIMIT $4
            $sql$,
            v_strict_range_predicate,
            v_version_filter,
            v_name_order
        );
    END IF;

    -- The static peek predicates cannot use the partial delete-marker index
    -- once PL/pgSQL switches to a generic plan because whether
    -- is_delete_marker is required remains parameter-dependent. Reuse the
    -- already-specialized batch query with a one-row limit for this sparse
    -- filter so the plan sees a literal `o.is_delete_marker` predicate.
    IF delete_markers = 'only' THEN
        v_delete_marker_peek_query :=
            'SELECT marker_page.name FROM (' || v_batch_query || ') marker_page LIMIT 1';
        IF NOT v_multi_row THEN
            v_delete_marker_peek_query_strict :=
                'SELECT marker_page.name FROM (' || v_batch_query_strict || ') marker_page LIMIT 1';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor performs one specialized initial seek so
            -- partial current-version and delete-marker indexes remain available.
            EXECUTE format(
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1%s%s ORDER BY o.name COLLATE "C" DESC LIMIT 1',
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND o.name COLLATE "C" >= $2 AND o.name COLLATE "C" < $3'
                    ELSE ''
                END,
                v_version_filter
            )
            INTO v_next_seek
            USING _bucket_id, v_prefix, v_upper_bound;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Folder continuation tokens retain their trailing delimiter. A
        -- delimiter-less startAfter is always a literal key boundary.
        v_cursor_is_folder := delimiter_param <> ''
            AND v_start_relative <> ''
            AND right(v_start_relative, length(delimiter_param)) = delimiter_param;

        IF v_cursor_is_folder THEN
            v_next_seek := CASE
                WHEN right(v_start, length(delimiter_param)) = delimiter_param
                    THEN v_start
                ELSE v_start || delimiter_param
            END;
            IF v_is_asc THEN
                v_next_seek := left(v_next_seek, -1)
                    || chr(ascii(right(v_next_seek, 1)) + 1);
            END IF;
            v_next_seek_strict := NOT v_is_asc;
        ELSE
            -- leaf object: when v_multi_row, stay on v_start with the
            -- caller-supplied tiebreak so a page boundary mid-key resumes
            -- that key's remaining rows instead of skipping them. Truncate
            -- to milliseconds like every other v_next_seek_at assignment -
            -- harmless today since object.ts's cursor always round-trips
            -- through JS Date first, but this shouldn't rely on that.
            IF v_multi_row THEN
                v_next_seek := v_start;
                v_next_seek_at := date_trunc('milliseconds', next_token_archived_at);
                v_next_seek_version := coalesce(next_token_version, '');
                v_next_seek_strict := coalesce(next_token, '') = '';
            ELSIF v_is_asc THEN
                v_next_seek := v_start;
                v_next_seek_strict := true;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        v_previous_seek := v_next_seek;
        v_previous_seek_at := v_next_seek_at;
        v_previous_seek_version := v_next_seek_version;
        v_previous_count := v_count;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        -- v_multi_row is branched here (rather than folded into the WHERE
        -- clause as a bound parameter) so each concrete query keeps an
        -- unconditional seek predicate - once PL/pgSQL switches to its
        -- cached generic plan (after 5 calls), a parameter-gated
        -- "(NOT v_multi_row AND name >= $x) OR (v_multi_row AND ...)"
        -- predicate stops the planner from using name as an index
        -- condition at all, degrading every subsequent peek to a full
        -- index scan filtered row-by-row instead of a bounded range scan.
        -- v_multi_row's seek predicate is a keyset tuple comparison
        -- ("name > x OR (name = x AND tiebreak)") - Postgres does not
        -- split this OR into indexable form even with fully literal
        -- values, so it falls back to a full scan filtered row-by-row.
        -- Splitting it into two independently-indexable branches (exact
        -- name match with the tiebreak filter, vs. strictly-past name)
        -- combined with UNION ALL lets each branch keep name as a real
        -- index condition; the outer ORDER BY/LIMIT picks whichever of
        -- the (at most 2) rows sorts first.
        IF delete_markers = 'only' THEN
            EXECUTE CASE WHEN v_next_seek_strict AND NOT v_multi_row
                THEN v_delete_marker_peek_query_strict
                ELSE v_delete_marker_peek_query
            END
                INTO v_peek_name
                USING _bucket_id, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END,
                    1, v_next_seek_at, v_next_seek_version, v_next_seek_strict;
        ELSIF v_multi_row THEN
            IF v_is_asc THEN
                IF v_upper_bound IS NOT NULL THEN
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND o.name COLLATE "C" < v_upper_bound
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" > v_next_seek AND o.name COLLATE "C" < v_upper_bound
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" ASC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" > v_next_seek
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" ASC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSE
                IF v_upper_bound IS NOT NULL THEN
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND o.name COLLATE "C" >= v_prefix
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" DESC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" DESC LIMIT 1;
                ELSE
                    SELECT sub.name INTO v_peek_name FROM (
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" = v_next_seek
                           AND NOT v_next_seek_strict
                           AND (v_next_seek_at IS NULL
                                OR COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) < v_next_seek_at
                                OR (COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) = v_next_seek_at
                                    AND COALESCE(o.version, '') > v_next_seek_version))
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY COALESCE(date_trunc('milliseconds', o.archived_at), 'infinity'::timestamptz) DESC, COALESCE(o.version, '') ASC LIMIT 1)
                        UNION ALL
                        (SELECT o.name FROM storage.objects o
                         WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                           AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                           AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                           AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                           AND (delete_markers != 'only' OR o.is_delete_marker)
                         ORDER BY o.name COLLATE "C" DESC LIMIT 1)
                    ) sub ORDER BY sub.name COLLATE "C" DESC LIMIT 1;
                END IF;
            END IF;
        ELSE
            -- Single-row mode is always noncurrent_versions='exclude'. Keep
            -- this predicate literal so generic plans use the current index.
            IF v_is_asc THEN
                IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" > v_next_seek
                      AND o.name COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSIF v_next_seek_strict THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" > v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSIF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" >= v_next_seek
                      AND o.name COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" >= v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSE
                IF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" < v_next_seek
                      AND o.name COLLATE "C" >= v_prefix
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" DESC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = _bucket_id
                      AND o.name COLLATE "C" < v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                      AND (delete_markers != 'only' OR o.is_delete_marker)
                    ORDER BY o.name COLLATE "C" DESC LIMIT 1;
                END IF;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := v_common_prefix;
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            version := NULL;
            archived_at := NULL;
            is_delete_marker := NULL;
            is_versioned := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1)
                    || chr(ascii(right(v_common_prefix, 1)) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
            v_next_seek_at := NULL;
            v_next_seek_version := '';
            v_next_seek_strict := NOT v_is_asc;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE CASE WHEN v_next_seek_strict AND NOT v_multi_row THEN v_batch_query_strict ELSE v_batch_query END
                USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size, v_next_seek_at, v_next_seek_version,
                v_next_seek_strict
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it. Reset
                    -- strict mode too it may have been set by an earlier
                    -- row in this same batch (see the single-row ASC advance
                    -- below), and v_next_seek here is the folder-triggering
                    -- row's own name, which the next peek must find inclusively.
                    v_next_seek := CASE
                        WHEN v_is_asc THEN v_current.name
                        ELSE v_current.name || delimiter_param
                    END;
                    v_next_seek_at := NULL;
                    v_next_seek_version := '';
                    v_next_seek_strict := false;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                version := v_current.version;
                archived_at := v_current.archived_at;
                is_delete_marker := v_current.is_delete_marker;
                is_versioned := v_current.is_versioned;
                RETURN NEXT;
                v_count := v_count + 1;

                -- when v_multi_row, stay on this name and record its
                -- archived_at as the new tiebreak so remaining rows for the
                -- same key are picked up before moving to the next name
                IF v_multi_row THEN
                    v_next_seek := v_current.name;
                    v_next_seek_at := COALESCE(date_trunc('milliseconds', v_current.archived_at), 'infinity'::timestamptz);
                    v_next_seek_version := COALESCE(v_current.version, '');
                    v_next_seek_strict := false;
                ELSIF v_is_asc THEN
                    -- Appending the delimiter as a fake lexical successor
                    -- would skip a real key like `name || '!'` (or any
                    -- character sorting below the delimiter), which sorts
                    -- between `name` and `name || delimiter`. Track the real
                    -- name and mark the next comparison strict instead.
                    v_next_seek := v_current.name;
                    v_next_seek_strict := true;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;

        IF v_count = v_previous_count
           AND v_next_seek IS NOT DISTINCT FROM v_previous_seek
           AND v_next_seek_at IS NOT DISTINCT FROM v_previous_seek_at
           AND v_next_seek_version IS NOT DISTINCT FROM v_previous_seek_version THEN
            RAISE EXCEPTION 'storage.list_objects_with_delimiter made no progress at seek (%, %, %)',
                v_next_seek, v_next_seek_at, v_next_seek_version;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text, noncurrent_versions text, delete_markers text, next_token_archived_at timestamp with time zone, next_token_version text) OWNER TO supabase_storage_admin;

--
-- TOC entry 500 (class 1255 OID 17326)
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- TOC entry 591 (class 1255 OID 29902)
-- Name: protect_bucket_control_columns(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_bucket_control_columns() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  configuration_changed boolean;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.lifecycle_configuration IS NOT NULL
       OR NEW.lifecycle_configuration_generation IS NOT NULL THEN
      IF NOT pg_has_role(current_user, TG_ARGV[0], 'MEMBER') THEN
        RAISE EXCEPTION 'only members of the configured storage service role may insert lifecycle policy state'
          USING ERRCODE = '42501',
                HINT = format(
                  'Insert with both lifecycle columns NULL and configure lifecycle through the Storage API afterward, or insert as a member of %I.',
                  TG_ARGV[0]
                );
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  configuration_changed =
    OLD.lifecycle_configuration IS DISTINCT FROM NEW.lifecycle_configuration
    OR OLD.lifecycle_configuration_generation IS DISTINCT FROM NEW.lifecycle_configuration_generation;

  IF NOT configuration_changed THEN
    RETURN NEW;
  END IF;

  IF NEW.type IS DISTINCT FROM 'STANDARD' THEN
    RAISE EXCEPTION 'bucket versioning and lifecycle controls require a Standard bucket'
      USING ERRCODE = '0A000';
  END IF;

  IF NEW.lifecycle_configuration IS NULL
     AND NEW.lifecycle_configuration_generation IS NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.lifecycle_configuration IS NULL
     OR NEW.lifecycle_configuration_generation IS NULL
     OR OLD.lifecycle_configuration IS NOT DISTINCT FROM NEW.lifecycle_configuration
     OR OLD.lifecycle_configuration_generation IS NOT DISTINCT FROM NEW.lifecycle_configuration_generation THEN
    RAISE EXCEPTION 'a changed lifecycle policy requires a new non-null generation'
      USING ERRCODE = '22023';
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION storage.protect_bucket_control_columns() OWNER TO supabase_storage_admin;

--
-- TOC entry 502 (class 1255 OID 17391)
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- TOC entry 524 (class 1255 OID 29910)
-- Name: search(text, text, integer, integer, integer, text, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_prefix_len INT;
    v_prefix_start INT;
    v_combined_levels INT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;
    v_version_filter TEXT;
    v_multi_row BOOLEAN;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;
    v_delete_marker_peek_query TEXT;
    v_delete_marker_peek_query_strict TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_next_seek_at TIMESTAMPTZ;
    v_next_seek_version TEXT;
    v_next_seek_strict BOOLEAN := false;
    v_count INT := 0;
    v_skipped INT := 0;
    v_previous_seek TEXT;
    v_previous_seek_at TIMESTAMPTZ;
    v_previous_seek_version TEXT;
    v_previous_count INT;
    v_previous_skipped INT;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_prefix_len := length(coalesce(prefix, ''));
    v_prefix_start := coalesce(array_length(string_to_array(coalesce(prefix, ''), v_delimiter), 1), 1);
    v_combined_levels := coalesce(array_length(string_to_array(v_prefix, v_delimiter), 1), 1);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);
    v_next_seek_at := NULL;
    v_next_seek_version := '';

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    v_multi_row := noncurrent_versions IN ('only', 'include');

    v_version_filter := '';
    IF noncurrent_versions = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NULL';
    ELSIF noncurrent_versions = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.archived_at IS NOT NULL';
    END IF;
    IF delete_markers = 'exclude' THEN
        v_version_filter := v_version_filter || ' AND NOT o.is_delete_marker';
    ELSIF delete_markers = 'only' THEN
        v_version_filter := v_version_filter || ' AND o.is_delete_marker';
    END IF;

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT array_to_string(path_tokens[$1:$2], '/') AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $3 || '%%'
                  AND bucket_id = $4
                  AND array_length(objects.path_tokens, 1) <> $2
                  AND ($7 != 'exclude' OR objects.archived_at IS NULL)
                  AND ($7 != 'only' OR objects.archived_at IS NOT NULL)
                  AND ($8 != 'exclude' OR NOT objects.is_delete_marker)
                  AND ($8 != 'only' OR objects.is_delete_marker)
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata,
                   NULL::text AS version,
                   NULL::timestamptz AS archived_at,
                   NULL::boolean AS is_delete_marker,
                   NULL::boolean AS is_versioned FROM folders)
            UNION ALL
            (SELECT array_to_string(path_tokens[$1:$2], '/') AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata,
                   version, archived_at, is_delete_marker, is_versioned
             FROM storage.objects
             WHERE objects.name ILIKE $3 || '%%'
               AND bucket_id = $4
               AND array_length(objects.path_tokens, 1) = $2
               AND ($7 != 'exclude' OR objects.archived_at IS NULL)
               AND ($7 != 'only' OR objects.archived_at IS NOT NULL)
               AND ($8 != 'exclude' OR NOT objects.is_delete_marker)
               AND ($8 != 'only' OR objects.is_delete_marker)
             -- name, then version, as tiebreaks so two versions of the same
             -- key tying on the sort column still sort deterministically
             ORDER BY %I %s, name COLLATE "C" %s, COALESCE(version, '') %s)
            LIMIT $5 OFFSET $6
            $sql$, v_sort_order, v_order_by, v_sort_order, v_sort_order, v_sort_order
        ) USING v_prefix_start, v_combined_levels, v_prefix, bucketname, v_limit, offsets, noncurrent_versions, delete_markers;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build a resume-safe batch query. The exact-name branch returns remaining
    -- versions after the current (archived_at, version) boundary; the strict
    -- name branch returns subsequent keys. UNION ALL keeps both predicates
    -- independently indexable.
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" > $2 AND lower(o.name) COLLATE "C" < $3' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" ASC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" > $2' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" ASC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 AND lower(o.name) COLLATE "C" >= $3' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" DESC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT * FROM (' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" = $2 AND ($5::timestamptz IS NULL OR COALESCE(o.archived_at, ''infinity''::timestamptz) < $5 OR (COALESCE(o.archived_at, ''infinity''::timestamptz) = $5 AND COALESCE(o.version, '''') > $6))' ||
                v_version_filter || ' ORDER BY COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4) UNION ALL ' ||
                '(SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata, o.version, o.archived_at, o.is_delete_marker, o.is_versioned FROM storage.objects o ' ||
                'WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2' || v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC, COALESCE(o.archived_at, ''infinity''::timestamptz) DESC, COALESCE(o.version, '''') ASC LIMIT $4)' ||
                ') sub ORDER BY lower(sub.name) COLLATE "C" DESC, COALESCE(sub.archived_at, ''infinity''::timestamptz) DESC, COALESCE(sub.version, '''') ASC LIMIT $4';
        END IF;
    END IF;

    -- Keep the delete-marker predicate literal so the cached generic
    -- plan can use idx_objects_delete_markers during the main-loop peek.
    IF delete_markers = 'only' THEN
        IF v_multi_row THEN
            v_delete_marker_peek_query :=
                'SELECT marker_page.name FROM (' || v_batch_query || ') marker_page LIMIT 1';
        ELSIF v_is_asc THEN
            -- Two separate literal query strings, not one gated by a bound
            -- boolean: folding "$n AND op1 OR NOT $n AND op2" into a single
            -- query defeats the generic plan's ability to push either
            -- comparison into the index. Branching in PL/pgSQL control flow
            -- instead keeps each query's index condition intact.
            v_delete_marker_peek_query :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" >= $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" < $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1';
            -- Strict variant: used once the single-row ASC batch advance
            -- (below) has left v_next_seek pointing at the last row already
            -- emitted, so a plain >= would re-match it forever.
            v_delete_marker_peek_query_strict :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" > $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" < $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1';
        ELSE
            v_delete_marker_peek_query :=
                'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1 ' ||
                'AND lower(o.name) COLLATE "C" < $2' ||
                CASE WHEN v_upper_bound IS NOT NULL
                    THEN ' AND lower(o.name) COLLATE "C" >= $3'
                    ELSE ''
                END ||
                v_version_filter ||
                ' ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC performs one specialized initial seek so partial current-version
        -- and delete-marker indexes remain available.
        EXECUTE format(
            'SELECT o.name FROM storage.objects o WHERE o.bucket_id = $1%s%s ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1',
            CASE WHEN v_upper_bound IS NOT NULL
                THEN ' AND lower(o.name) COLLATE "C" >= $2 AND lower(o.name) COLLATE "C" < $3'
                ELSE ''
            END,
            v_version_filter
        )
        INTO v_peek_name
        USING bucketname, v_prefix_lower, v_upper_bound;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch and
    -- the delete-marker-only path
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        v_previous_seek := v_next_seek;
        v_previous_seek_at := v_next_seek_at;
        v_previous_seek_version := v_next_seek_version;
        v_previous_count := v_count;
        v_previous_skipped := v_skipped;

        -- STEP 1: PEEK
        v_peek_name := NULL;
        IF delete_markers = 'only' THEN
            EXECUTE CASE WHEN v_next_seek_strict
                THEN v_delete_marker_peek_query_strict
                ELSE v_delete_marker_peek_query
            END
                INTO v_peek_name
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END,
                    1, v_next_seek_at, v_next_seek_version;
        ELSIF v_multi_row AND v_next_seek_at IS NOT NULL THEN
            SELECT o.name INTO v_peek_name
            FROM storage.objects o
            WHERE o.bucket_id = bucketname
              AND lower(o.name) COLLATE "C" = v_next_seek
              AND (COALESCE(o.archived_at, 'infinity'::timestamptz) < v_next_seek_at
                   OR (COALESCE(o.archived_at, 'infinity'::timestamptz) = v_next_seek_at
                       AND COALESCE(o.version, '') > v_next_seek_version))
              AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
              AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
              AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
              AND (delete_markers != 'only' OR o.is_delete_marker)
            ORDER BY COALESCE(o.archived_at, 'infinity'::timestamptz) DESC,
                     COALESCE(o.version, '') ASC
            LIMIT 1;

            -- The current key is exhausted. Clear its version boundary and
            -- make the following ASC name peek strict. Appending '/' is not a
            -- valid lexical successor because keys ending in characters such
            -- as '!' sort between the exhausted name and name || '/'.
            IF v_peek_name IS NULL THEN
                IF v_is_asc THEN
                    v_next_seek_strict := true;
                END IF;
                v_next_seek_at := NULL;
                v_next_seek_version := '';
            END IF;
        END IF;

        -- Single-row mode is always noncurrent_versions='exclude'. Keep the
        -- current-row predicate literal so generic plans use the current index.
        IF delete_markers != 'only' AND v_peek_name IS NULL AND NOT v_multi_row THEN
            IF v_is_asc THEN
                IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSIF v_next_seek_strict THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSIF v_upper_bound IS NOT NULL THEN
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                ELSE
                    SELECT o.name INTO v_peek_name FROM storage.objects o
                    WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                      AND o.archived_at IS NULL
                      AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                    ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
                END IF;
            ELSIF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                  AND o.archived_at IS NULL
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                  AND o.archived_at IS NULL
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        ELSIF delete_markers != 'only' AND v_peek_name IS NULL AND v_is_asc THEN
            IF v_next_seek_strict AND v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSIF v_next_seek_strict THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" > v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSIF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSIF delete_markers != 'only' AND v_peek_name IS NULL THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                  AND (noncurrent_versions != 'exclude' OR o.archived_at IS NULL)
                  AND (noncurrent_versions != 'only' OR o.archived_at IS NOT NULL)
                  AND (delete_markers != 'exclude' OR NOT o.is_delete_marker)
                  AND (delete_markers != 'only' OR o.is_delete_marker)
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- If the peek landed on a different key than we were tracking, any
        -- version boundary belongs to the OLD key and must not leak into the
        -- new one - e.g. the deleteMarkers='only' peek doesn't know or care
        -- whether it's continuing the same key or jumping to a new one, so
        -- it never clears these itself.
        IF lower(v_peek_name) IS DISTINCT FROM v_next_seek THEN
            v_next_seek_at := NULL;
            v_next_seek_version := '';
        END IF;

        -- The peek is authoritative for the next key to process. This is
        -- especially important after exhausting a multi-version key: the
        -- version boundary has been cleared, so executing the batch against
        -- a stale v_next_seek would replay every version of that old key.
        v_next_seek := lower(v_peek_name);
        v_next_seek_strict := false;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := substring(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter) from v_prefix_len + 1);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                version := NULL;
                archived_at := NULL;
                is_delete_marker := NULL;
                is_versioned := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
            v_next_seek_at := NULL;
            v_next_seek_version := '';
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size,
                    v_next_seek_at, v_next_seek_version
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it. Reset
                    -- strict mode too - it may have been set by an earlier
                    -- row in this same batch (see the single-row ASC advance
                    -- below), and v_next_seek here is the folder-triggering
                    -- row's own name, which the next peek must find inclusively.
                    v_next_seek := CASE
                        WHEN v_is_asc THEN lower(v_current.name)
                        ELSE lower(v_current.name) || v_delimiter
                    END;
                    v_next_seek_at := NULL;
                    v_next_seek_version := '';
                    v_next_seek_strict := false;
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := substring(v_current.name from v_prefix_len + 1);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    version := v_current.version;
                    archived_at := v_current.archived_at;
                    is_delete_marker := v_current.is_delete_marker;
                    is_versioned := v_current.is_versioned;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Multi-row mode must remain on this key until all of its
                -- versions have crossed the internal batch boundary.
                IF v_multi_row THEN
                    v_next_seek := lower(v_current.name);
                    v_next_seek_at := COALESCE(v_current.archived_at, 'infinity'::timestamptz);
                    v_next_seek_version := COALESCE(v_current.version, '');
                ELSIF v_is_asc THEN
                    -- Appending the delimiter as a fake lexical successor would
                    -- skip a real key like `name || '!'` (or any character
                    -- sorting below the delimiter), which sorts between `name`
                    -- and `name || delimiter`. Track the real name and mark the
                    -- next comparison strict instead - same fix as the
                    -- exhausted-key case above.
                    v_next_seek := lower(v_current.name);
                    v_next_seek_strict := true;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;

        IF v_count = v_previous_count
           AND v_skipped = v_previous_skipped
           AND v_next_seek IS NOT DISTINCT FROM v_previous_seek
           AND v_next_seek_at IS NOT DISTINCT FROM v_previous_seek_at
           AND v_next_seek_version IS NOT DISTINCT FROM v_previous_seek_version THEN
            RAISE EXCEPTION 'storage.search made no progress at seek (%, %, %)',
                v_next_seek, v_next_seek_at, v_next_seek_version;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text, noncurrent_versions text, delete_markers text) OWNER TO supabase_storage_admin;

--
-- TOC entry 581 (class 1255 OID 29912)
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, p_start_after_version text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
    v_prefix_pattern text;
    v_sort_order text;
    v_sort_column text;
    v_version_tiebreak text;
BEGIN
    v_prefix := coalesce(p_prefix, '');
    -- Keep the raw prefix for common-prefix calculations and escape only LIKE metacharacters.
    v_prefix_pattern := replace(v_prefix, chr(92), chr(92) || chr(92));
    v_prefix_pattern := replace(v_prefix_pattern, '%', chr(92) || '%');
    v_prefix_pattern := replace(v_prefix_pattern, '_', chr(92) || '_');

    -- COALESCE first: NULL NOT IN (...) evaluates to NULL (not TRUE), so a
    -- bare NOT IN check silently leaves an explicit NULL argument unreset.
    noncurrent_versions := COALESCE(noncurrent_versions, 'exclude');
    delete_markers := COALESCE(delete_markers, 'exclude');
    IF noncurrent_versions NOT IN ('exclude', 'only', 'include') THEN
        noncurrent_versions := 'exclude';
    END IF;
    IF delete_markers NOT IN ('exclude', 'only', 'include') THEN
        delete_markers := 'exclude';
    END IF;

    -- $9 is only populated in multi-row mode; it's always '' otherwise, so
    -- only use each row's real version as a tiebreak in multi-row mode.
    v_version_tiebreak := CASE WHEN noncurrent_versions IN ('only', 'include') THEN 'COALESCE(version, '''')' ELSE '''''' END;

    -- Defense-in-depth: this function is independently reachable and must
    -- not trust p_sort_order/p_sort_column to already be validated by a
    -- caller. Normalize to the same strict allow-list storage.search_v2
    -- uses before interpolating anything into dynamic SQL below.
    v_sort_order := lower(coalesce(p_sort_order, 'asc'));
    IF v_sort_order NOT IN ('asc', 'desc') THEN
        v_sort_order := 'asc';
    END IF;

    v_sort_column := lower(coalesce(p_sort_column, 'updated_at'));
    IF v_sort_column NOT IN ('updated_at', 'created_at') THEN
        v_sort_column := 'updated_at';
    END IF;

    IF v_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                o.version AS obj_version,
                o.archived_at AS obj_archived_at,
                o.is_delete_marker AS obj_is_delete_marker,
                o.is_versioned AS obj_is_versioned,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $10 || '%%'
              AND ($7 != 'exclude' OR o.archived_at IS NULL)
              AND ($7 != 'only' OR o.archived_at IS NOT NULL)
              AND ($8 != 'exclude' OR NOT o.is_delete_marker)
              AND ($8 != 'only' OR o.is_delete_marker)
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                common_prefix AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                NULL::text AS version,
                NULL::timestamptz AS archived_at,
                NULL::boolean AS is_delete_marker,
                NULL::boolean AS is_versioned,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                obj_version AS version,
                obj_archived_at AS archived_at,
                obj_is_delete_marker AS is_delete_marker,
                obj_is_versioned AS is_versioned,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz),
                    name COLLATE "C",
                    %s
                ) %s ROW(
                    -- truncated the same way as the stored value above
                    date_trunc('milliseconds', COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz)),
                    $5,
                    $9
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata,
            version,
            archived_at,
            is_delete_marker,
            is_versioned
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s,
            COALESCE(version, '') %s
        LIMIT $4
    $sql$,
        v_sort_column,
        v_version_tiebreak,
        v_cursor_op,
        v_sort_column,
        v_sort_order,
        v_sort_order,
        v_sort_order
    );

    -- version is the third tiebreak component for two versions of the same
    -- key tying on both timestamp and name (see filtered CTE / ORDER BY above)
    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after, noncurrent_versions, delete_markers, coalesce(p_start_after_version, ''), v_prefix_pattern;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text, noncurrent_versions text, delete_markers text, p_start_after_version text) OWNER TO supabase_storage_admin;

--
-- TOC entry 482 (class 1255 OID 29914)
-- Name: search_v2(text, text, integer, integer, text, text, text, text, text, text, timestamp with time zone, text, boolean); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text, noncurrent_versions text DEFAULT 'exclude'::text, delete_markers text DEFAULT 'exclude'::text, start_after_archived_at timestamp with time zone DEFAULT NULL::timestamp with time zone, start_after_version text DEFAULT ''::text, start_after_is_continuation boolean DEFAULT false) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb, version text, archived_at timestamp with time zone, is_delete_marker boolean, is_versioned boolean)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata,
            l.version,
            l.archived_at,
            l.is_delete_marker,
            l.is_versioned
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            CASE WHEN start_after_is_continuation THEN '' ELSE start_after END,
            CASE WHEN start_after_is_continuation THEN start_after ELSE '' END,
            v_sort_ord,
            noncurrent_versions,
            delete_markers,
            start_after_archived_at,
            start_after_version
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after,
            noncurrent_versions, delete_markers, start_after_version
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text, noncurrent_versions text, delete_markers text, start_after_archived_at timestamp with time zone, start_after_version text, start_after_is_continuation boolean) OWNER TO supabase_storage_admin;

--
-- TOC entry 476 (class 1255 OID 17261)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 353 (class 1259 OID 16529)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- TOC entry 5468 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 372 (class 1259 OID 17084)
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 366 (class 1259 OID 16889)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- TOC entry 5471 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- TOC entry 357 (class 1259 OID 16686)
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- TOC entry 5473 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 5474 (class 0 OID 0)
-- Dependencies: 357
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 352 (class 1259 OID 16522)
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- TOC entry 5476 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 361 (class 1259 OID 16776)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- TOC entry 5478 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 360 (class 1259 OID 16764)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- TOC entry 5480 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 359 (class 1259 OID 16751)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- TOC entry 5482 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 5483 (class 0 OID 0)
-- Dependencies: 359
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- TOC entry 443 (class 1259 OID 29707)
-- Name: mfa_recovery_code_sets; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_recovery_code_sets (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    mfa_factor_id uuid NOT NULL,
    failed_verification_count integer DEFAULT 0 NOT NULL,
    verification_locked_until timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT mfa_recovery_code_sets_failed_verification_count_check CHECK ((failed_verification_count >= 0))
);


ALTER TABLE auth.mfa_recovery_code_sets OWNER TO supabase_auth_admin;

--
-- TOC entry 444 (class 1259 OID 29730)
-- Name: mfa_recovery_codes; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_recovery_codes (
    id uuid NOT NULL,
    mfa_recovery_code_set_id uuid NOT NULL,
    code_hash text NOT NULL,
    consumed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE auth.mfa_recovery_codes OWNER TO supabase_auth_admin;

--
-- TOC entry 369 (class 1259 OID 17001)
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- TOC entry 371 (class 1259 OID 17074)
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- TOC entry 5488 (class 0 OID 0)
-- Dependencies: 371
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- TOC entry 368 (class 1259 OID 16971)
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- TOC entry 370 (class 1259 OID 17034)
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- TOC entry 367 (class 1259 OID 16939)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 351 (class 1259 OID 16511)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 5493 (class 0 OID 0)
-- Dependencies: 351
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 350 (class 1259 OID 16510)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- TOC entry 5495 (class 0 OID 0)
-- Dependencies: 350
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 364 (class 1259 OID 16818)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 5497 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 365 (class 1259 OID 16836)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- TOC entry 5499 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 354 (class 1259 OID 16537)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- TOC entry 5501 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 442 (class 1259 OID 29686)
-- Name: scim_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.scim_tokens (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    token_hash text NOT NULL,
    prefix text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    revoked_at timestamp with time zone,
    last_used_at timestamp with time zone,
    CONSTRAINT scim_tokens_expires_at_future CHECK (((expires_at IS NULL) OR (expires_at > created_at))),
    CONSTRAINT scim_tokens_revoked_after_created CHECK (((revoked_at IS NULL) OR (revoked_at >= created_at))),
    CONSTRAINT scim_tokens_token_hash_check CHECK ((token_hash ~ '^[0-9a-f]{64}$'::text))
);


ALTER TABLE auth.scim_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 441 (class 1259 OID 29655)
-- Name: scim_users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.scim_users (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    user_id uuid,
    resource jsonb NOT NULL,
    user_name text GENERATED ALWAYS AS (lower((resource ->> 'userName'::text))) STORED NOT NULL,
    external_id text GENERATED ALWAYS AS ((resource ->> 'externalId'::text)) STORED,
    active boolean GENERATED ALWAYS AS (COALESCE(((resource ->> 'active'::text))::boolean, true)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE auth.scim_users OWNER TO supabase_auth_admin;

--
-- TOC entry 358 (class 1259 OID 16716)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- TOC entry 5505 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 5506 (class 0 OID 0)
-- Dependencies: 358
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 5507 (class 0 OID 0)
-- Dependencies: 358
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- TOC entry 5508 (class 0 OID 0)
-- Dependencies: 358
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- TOC entry 363 (class 1259 OID 16803)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- TOC entry 5510 (class 0 OID 0)
-- Dependencies: 363
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 362 (class 1259 OID 16794)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 5512 (class 0 OID 0)
-- Dependencies: 362
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 5513 (class 0 OID 0)
-- Dependencies: 362
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 349 (class 1259 OID 16499)
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 349
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 5516 (class 0 OID 0)
-- Dependencies: 349
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 374 (class 1259 OID 17149)
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- TOC entry 373 (class 1259 OID 17126)
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- TOC entry 460 (class 1259 OID 30577)
-- Name: account_email_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_email_verifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    email text NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    invalidated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.account_email_verifications OWNER TO postgres;

--
-- TOC entry 461 (class 1259 OID 30594)
-- Name: account_password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_password_reset_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    invalidated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.account_password_reset_tokens OWNER TO postgres;

--
-- TOC entry 463 (class 1259 OID 30633)
-- Name: account_security_rate_limits; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.account_security_rate_limits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    action text NOT NULL,
    subject_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.account_security_rate_limits OWNER TO postgres;

--
-- TOC entry 419 (class 1259 OID 27195)
-- Name: admin_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text,
    full_name text NOT NULL,
    role text NOT NULL,
    company_id uuid,
    phone text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_users OWNER TO postgres;

--
-- TOC entry 405 (class 1259 OID 25803)
-- Name: cantons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cantons (
    id bigint NOT NULL,
    province_id bigint NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.cantons OWNER TO postgres;

--
-- TOC entry 404 (class 1259 OID 25802)
-- Name: cantons_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cantons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cantons_id_seq OWNER TO postgres;

--
-- TOC entry 5527 (class 0 OID 0)
-- Dependencies: 404
-- Name: cantons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cantons_id_seq OWNED BY public.cantons.id;


--
-- TOC entry 453 (class 1259 OID 30215)
-- Name: chat_conversation_participants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_conversation_participants (
    conversation_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_conversation_participants OWNER TO postgres;

--
-- TOC entry 448 (class 1259 OID 30064)
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    owner_company_id uuid NOT NULL,
    client_company_id uuid NOT NULL,
    shipment_id uuid,
    subject text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category text DEFAULT 'support'::text NOT NULL,
    CONSTRAINT chat_conversations_category_check CHECK ((category = ANY (ARRAY['support'::text, 'customer_service'::text]))),
    CONSTRAINT chat_conversations_check CHECK ((owner_company_id <> client_company_id))
);


ALTER TABLE public.chat_conversations OWNER TO postgres;

--
-- TOC entry 455 (class 1259 OID 30293)
-- Name: chat_message_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_message_audit (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid NOT NULL,
    action text NOT NULL,
    previous_body text,
    actor_id uuid NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_message_audit_action_check CHECK ((action = ANY (ARRAY['edited'::text, 'deleted'::text])))
);


ALTER TABLE public.chat_message_audit OWNER TO postgres;

--
-- TOC entry 450 (class 1259 OID 30111)
-- Name: chat_message_reads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_message_reads (
    message_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    read_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_message_reads OWNER TO postgres;

--
-- TOC entry 449 (class 1259 OID 30091)
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid NOT NULL,
    author_id uuid NOT NULL,
    body text,
    template_key text,
    latitude double precision,
    longitude double precision,
    location_accuracy_meters numeric,
    attachment_url text,
    attachment_type text,
    edited_at timestamp with time zone,
    deleted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_by uuid,
    CONSTRAINT chat_messages_check CHECK (((body IS NOT NULL) OR (template_key IS NOT NULL) OR (latitude IS NOT NULL) OR (attachment_url IS NOT NULL)))
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- TOC entry 390 (class 1259 OID 25451)
-- Name: companies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.companies (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    trade_name text,
    address text,
    is_system_company boolean DEFAULT false NOT NULL,
    is_owner_company boolean DEFAULT false NOT NULL,
    delivery_charge numeric DEFAULT 0 NOT NULL,
    failed_charge numeric DEFAULT 0 NOT NULL
);


ALTER TABLE public.companies OWNER TO postgres;

--
-- TOC entry 418 (class 1259 OID 27091)
-- Name: company_contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_contacts (
    company_id uuid NOT NULL,
    contact_id uuid NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_contacts OWNER TO postgres;

--
-- TOC entry 424 (class 1259 OID 27380)
-- Name: company_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_products (
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.company_products OWNER TO postgres;

--
-- TOC entry 417 (class 1259 OID 27068)
-- Name: contact_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contact_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    contact_id uuid NOT NULL,
    method_type text NOT NULL,
    value text NOT NULL,
    label text,
    is_primary boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.contact_methods OWNER TO postgres;

--
-- TOC entry 416 (class 1259 OID 27058)
-- Name: contacts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    full_name text NOT NULL,
    notes text,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "position" text,
    identification text
);


ALTER TABLE public.contacts OWNER TO postgres;

--
-- TOC entry 429 (class 1259 OID 27851)
-- Name: courier_delivery_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courier_delivery_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    route_id uuid NOT NULL,
    delivery_pay numeric(12,2) DEFAULT 0 NOT NULL,
    failed_pay numeric(12,2) DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    courier_id uuid NOT NULL,
    province_id bigint,
    canton_id bigint,
    district_id bigint,
    neighborhood_id bigint,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.courier_delivery_rates OWNER TO postgres;

--
-- TOC entry 396 (class 1259 OID 25538)
-- Name: courier_routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courier_routes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    courier_id uuid NOT NULL,
    route_id uuid NOT NULL
);


ALTER TABLE public.courier_routes OWNER TO postgres;

--
-- TOC entry 392 (class 1259 OID 25482)
-- Name: couriers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.couriers (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    profile_id uuid NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.couriers OWNER TO postgres;

--
-- TOC entry 430 (class 1259 OID 27902)
-- Name: delivery_rates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.delivery_rates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    route_id uuid NOT NULL,
    province_id bigint,
    canton_id bigint,
    district_id bigint,
    neighborhood_id bigint,
    delivery_charge numeric(12,2) DEFAULT 0 NOT NULL,
    failed_charge numeric(12,2) DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    company_id uuid NOT NULL,
    CONSTRAINT chk_delivery_rates_canton_hierarchy CHECK (((canton_id IS NULL) OR (province_id IS NOT NULL))),
    CONSTRAINT chk_delivery_rates_district_hierarchy CHECK (((district_id IS NULL) OR ((canton_id IS NOT NULL) AND (province_id IS NOT NULL)))),
    CONSTRAINT chk_delivery_rates_neighborhood_hierarchy CHECK (((neighborhood_id IS NULL) OR ((district_id IS NOT NULL) AND (canton_id IS NOT NULL) AND (province_id IS NOT NULL))))
);


ALTER TABLE public.delivery_rates OWNER TO postgres;

--
-- TOC entry 407 (class 1259 OID 25820)
-- Name: districts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.districts (
    id bigint NOT NULL,
    canton_id bigint NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.districts OWNER TO postgres;

--
-- TOC entry 406 (class 1259 OID 25819)
-- Name: districts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.districts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.districts_id_seq OWNER TO postgres;

--
-- TOC entry 5544 (class 0 OID 0)
-- Dependencies: 406
-- Name: districts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.districts_id_seq OWNED BY public.districts.id;


--
-- TOC entry 427 (class 1259 OID 27536)
-- Name: identification_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.identification_types (
    id smallint NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.identification_types OWNER TO postgres;

--
-- TOC entry 426 (class 1259 OID 27535)
-- Name: identification_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.identification_types_id_seq
    AS smallint
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.identification_types_id_seq OWNER TO postgres;

--
-- TOC entry 5547 (class 0 OID 0)
-- Dependencies: 426
-- Name: identification_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.identification_types_id_seq OWNED BY public.identification_types.id;


--
-- TOC entry 398 (class 1259 OID 25573)
-- Name: inventory; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    courier_id uuid NOT NULL,
    company_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    low_stock integer DEFAULT 20 NOT NULL,
    medium_stock integer DEFAULT 40 NOT NULL
);


ALTER TABLE public.inventory OWNER TO postgres;

--
-- TOC entry 399 (class 1259 OID 25598)
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_movements (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    inventory_id uuid NOT NULL,
    quantity_change integer NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    shipment_id uuid,
    notes text,
    quantity_before integer DEFAULT 0 NOT NULL,
    quantity_after integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- TOC entry 409 (class 1259 OID 25837)
-- Name: neighborhoods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.neighborhoods (
    id bigint NOT NULL,
    district_id bigint NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    type_code text,
    latitude double precision,
    longitude double precision,
    position_index integer DEFAULT 1
);


ALTER TABLE public.neighborhoods OWNER TO postgres;

--
-- TOC entry 408 (class 1259 OID 25836)
-- Name: neighborhoods_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.neighborhoods_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.neighborhoods_id_seq OWNER TO postgres;

--
-- TOC entry 5552 (class 0 OID 0)
-- Dependencies: 408
-- Name: neighborhoods_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.neighborhoods_id_seq OWNED BY public.neighborhoods.id;


--
-- TOC entry 462 (class 1259 OID 30611)
-- Name: password_reset_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    resolved_by uuid,
    resolution_note text,
    CONSTRAINT password_reset_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'cancelled'::text])))
);


ALTER TABLE public.password_reset_requests OWNER TO postgres;

--
-- TOC entry 422 (class 1259 OID 27259)
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- TOC entry 420 (class 1259 OID 27232)
-- Name: permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permissions (
    id text NOT NULL,
    description text NOT NULL
);


ALTER TABLE public.permissions OWNER TO postgres;

--
-- TOC entry 393 (class 1259 OID 25496)
-- Name: pricing_templates; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pricing_templates (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text DEFAULT 'default'::text NOT NULL,
    company_delivery_charge numeric(12,2) DEFAULT 0,
    courier_delivery_pay numeric(12,2) DEFAULT 0,
    company_failed_charge numeric(12,2) DEFAULT 0,
    courier_failed_pay numeric(12,2) DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.pricing_templates OWNER TO postgres;

--
-- TOC entry 397 (class 1259 OID 25556)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    sku text,
    default_deposit numeric(12,2) DEFAULT 0,
    default_shipping_fee numeric(12,2) DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    notes text
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 421 (class 1259 OID 27239)
-- Name: profile_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_permissions (
    profile_id uuid NOT NULL,
    permission_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.profile_permissions OWNER TO postgres;

--
-- TOC entry 391 (class 1259 OID 25463)
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    company_id uuid,
    role public.user_role NOT NULL,
    full_name text NOT NULL,
    phone text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    email text,
    is_system_user boolean DEFAULT false,
    must_change_password boolean DEFAULT true NOT NULL,
    created_by uuid,
    can_view_all_company_shipments boolean DEFAULT false,
    can_deliver boolean DEFAULT false NOT NULL,
    delivery_pay numeric DEFAULT 0 NOT NULL,
    failed_pay numeric DEFAULT 0 NOT NULL,
    can_chat_directly_with_clients boolean DEFAULT false NOT NULL,
    username text,
    recovery_email text,
    recovery_email_verified_at timestamp with time zone,
    can_reset_user_passwords boolean DEFAULT false NOT NULL,
    CONSTRAINT profiles_username_format_check CHECK (((username IS NULL) OR ((username = lower(username)) AND (username ~ '^[a-z0-9][a-z0-9._-]{2,31}$'::text))))
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- TOC entry 403 (class 1259 OID 25791)
-- Name: provinces; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provinces (
    id bigint NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.provinces OWNER TO postgres;

--
-- TOC entry 402 (class 1259 OID 25790)
-- Name: provinces_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.provinces_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provinces_id_seq OWNER TO postgres;

--
-- TOC entry 5562 (class 0 OID 0)
-- Dependencies: 402
-- Name: provinces_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.provinces_id_seq OWNED BY public.provinces.id;


--
-- TOC entry 411 (class 1259 OID 25949)
-- Name: route_coverage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_coverage (
    id bigint NOT NULL,
    route_id uuid NOT NULL,
    neighborhood_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.route_coverage OWNER TO postgres;

--
-- TOC entry 410 (class 1259 OID 25948)
-- Name: route_coverage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.route_coverage_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.route_coverage_id_seq OWNER TO postgres;

--
-- TOC entry 5565 (class 0 OID 0)
-- Dependencies: 410
-- Name: route_coverage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.route_coverage_id_seq OWNED BY public.route_coverage.id;


--
-- TOC entry 413 (class 1259 OID 26360)
-- Name: route_district_delivery_times; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_district_delivery_times (
    id bigint NOT NULL,
    route_id uuid NOT NULL,
    district_id bigint NOT NULL,
    min_hours integer NOT NULL,
    max_hours integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.route_district_delivery_times OWNER TO postgres;

--
-- TOC entry 412 (class 1259 OID 26359)
-- Name: route_district_delivery_times_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.route_district_delivery_times_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.route_district_delivery_times_id_seq OWNER TO postgres;

--
-- TOC entry 5568 (class 0 OID 0)
-- Dependencies: 412
-- Name: route_district_delivery_times_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.route_district_delivery_times_id_seq OWNED BY public.route_district_delivery_times.id;


--
-- TOC entry 415 (class 1259 OID 26382)
-- Name: route_district_visit_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_district_visit_days (
    id bigint NOT NULL,
    route_id uuid NOT NULL,
    district_id bigint NOT NULL,
    day text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.route_district_visit_days OWNER TO postgres;

--
-- TOC entry 414 (class 1259 OID 26381)
-- Name: route_district_visit_days_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.route_district_visit_days_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.route_district_visit_days_id_seq OWNER TO postgres;

--
-- TOC entry 5571 (class 0 OID 0)
-- Dependencies: 414
-- Name: route_district_visit_days_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.route_district_visit_days_id_seq OWNED BY public.route_district_visit_days.id;


--
-- TOC entry 395 (class 1259 OID 25525)
-- Name: route_visit_days; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.route_visit_days (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    route_id uuid NOT NULL,
    day public.week_day NOT NULL
);


ALTER TABLE public.route_visit_days OWNER TO postgres;

--
-- TOC entry 394 (class 1259 OID 25511)
-- Name: routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.routes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    company_delivery_charge numeric(12,2) DEFAULT 0 NOT NULL,
    courier_delivery_pay numeric(12,2) DEFAULT 0 NOT NULL,
    company_failed_charge numeric(12,2) DEFAULT 0 NOT NULL,
    courier_failed_pay numeric(12,2) DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    estimated_hours integer DEFAULT 24 NOT NULL
);


ALTER TABLE public.routes OWNER TO postgres;

--
-- TOC entry 458 (class 1259 OID 30528)
-- Name: settlement_adjustments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settlement_adjustments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    period_id uuid NOT NULL,
    adjustment_type text NOT NULL,
    amount numeric(14,2) NOT NULL,
    observation text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT settlement_adjustments_adjustment_type_check CHECK ((adjustment_type = ANY (ARRAY['extra'::text, 'deduction'::text]))),
    CONSTRAINT settlement_adjustments_amount_check CHECK ((amount > (0)::numeric)),
    CONSTRAINT settlement_adjustments_observation_check CHECK (((length(TRIM(BOTH FROM observation)) >= 1) AND (length(TRIM(BOTH FROM observation)) <= 500)))
);


ALTER TABLE public.settlement_adjustments OWNER TO postgres;

--
-- TOC entry 433 (class 1259 OID 28202)
-- Name: settlement_period_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settlement_period_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    period_id uuid NOT NULL,
    shipment_id uuid NOT NULL,
    company_id uuid NOT NULL,
    courier_id uuid,
    delivery_charge_original numeric(12,2),
    delivery_charge_final numeric(12,2),
    courier_amount_original numeric(12,2),
    courier_amount_final numeric(12,2),
    excluded boolean DEFAULT false NOT NULL,
    excluded_reason text,
    excluded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    modified_at timestamp with time zone,
    modified_by uuid,
    financial_record_id uuid,
    original_amount numeric(14,2),
    final_amount numeric(14,2),
    exclusion_reason text,
    excluded_by uuid
);


ALTER TABLE public.settlement_period_items OWNER TO postgres;

--
-- TOC entry 432 (class 1259 OID 28187)
-- Name: settlement_periods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settlement_periods (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    schedule_id uuid NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    party_type text,
    party_id uuid,
    closed_by uuid
);


ALTER TABLE public.settlement_periods OWNER TO postgres;

--
-- TOC entry 434 (class 1259 OID 28265)
-- Name: settlement_schedule_targets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settlement_schedule_targets (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    schedule_id uuid NOT NULL,
    courier_id uuid,
    company_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chk_settlement_schedule_target CHECK ((((courier_id IS NOT NULL) AND (company_id IS NULL)) OR ((courier_id IS NULL) AND (company_id IS NOT NULL))))
);


ALTER TABLE public.settlement_schedule_targets OWNER TO postgres;

--
-- TOC entry 431 (class 1259 OID 28166)
-- Name: settlement_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settlement_schedules (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    target_type text NOT NULL,
    frequency_days integer NOT NULL,
    auto_rollover boolean DEFAULT true NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    include_all boolean DEFAULT true NOT NULL,
    party_type text NOT NULL,
    party_id uuid,
    frequency text NOT NULL,
    interval_days integer,
    anchor_date date NOT NULL,
    created_by uuid
);


ALTER TABLE public.settlement_schedules OWNER TO postgres;

--
-- TOC entry 440 (class 1259 OID 29613)
-- Name: shipment_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_id uuid NOT NULL,
    storage_path text NOT NULL,
    file_url text NOT NULL,
    original_filename text NOT NULL,
    mime_type text,
    file_size bigint,
    notes text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    created_company_id uuid NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    storage_provider text DEFAULT 'supabase'::text NOT NULL,
    optimized_file_size bigint,
    optimized_at timestamp with time zone,
    CONSTRAINT shipment_attachments_notes_check CHECK ((length(notes) <= 500)),
    CONSTRAINT shipment_attachments_storage_provider_check CHECK ((storage_provider = ANY (ARRAY['supabase'::text, 'cloudinary'::text])))
);


ALTER TABLE public.shipment_attachments OWNER TO postgres;

--
-- TOC entry 428 (class 1259 OID 27553)
-- Name: shipment_contact_methods; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_contact_methods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_id uuid NOT NULL,
    method_type text NOT NULL,
    value text NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    label text,
    contact_name text,
    contact_type text,
    relationship text,
    can_receive boolean DEFAULT false NOT NULL,
    CONSTRAINT shipment_contact_methods_type_check CHECK ((method_type = ANY (ARRAY['phone'::text, 'email'::text, 'whatsapp'::text])))
);


ALTER TABLE public.shipment_contact_methods OWNER TO postgres;

--
-- TOC entry 445 (class 1259 OID 29849)
-- Name: shipment_customer_location_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_customer_location_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_id uuid NOT NULL,
    token_hash text NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used_at timestamp with time zone,
    CONSTRAINT shipment_customer_location_requests_token_hash_check CHECK ((length(token_hash) = 64))
);


ALTER TABLE public.shipment_customer_location_requests OWNER TO postgres;

--
-- TOC entry 457 (class 1259 OID 30436)
-- Name: shipment_delivery_financial_amount_changes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_delivery_financial_amount_changes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    financial_record_id uuid NOT NULL,
    previous_amount numeric(14,2) NOT NULL,
    new_amount numeric(14,2) NOT NULL,
    justification text NOT NULL,
    changed_by uuid,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT shipment_delivery_financial_amount_change_previous_amount_check CHECK ((previous_amount >= (0)::numeric)),
    CONSTRAINT shipment_delivery_financial_amount_changes_justification_check CHECK (((length(TRIM(BOTH FROM justification)) >= 1) AND (length(TRIM(BOTH FROM justification)) <= 500))),
    CONSTRAINT shipment_delivery_financial_amount_changes_new_amount_check CHECK ((new_amount >= (0)::numeric))
);


ALTER TABLE public.shipment_delivery_financial_amount_changes OWNER TO postgres;

--
-- TOC entry 456 (class 1259 OID 30367)
-- Name: shipment_delivery_financial_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_delivery_financial_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_id uuid NOT NULL,
    record_type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    company_id uuid,
    courier_id uuid,
    route_id uuid,
    delivery_rate_id uuid,
    courier_delivery_rate_id uuid,
    tracking_number text NOT NULL,
    company_name text,
    courier_name text,
    route_name text,
    rate_scope text,
    amount numeric(14,2) DEFAULT 0 NOT NULL,
    currency text DEFAULT 'CRC'::text NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    event_id uuid NOT NULL,
    operation_type text DEFAULT 'delivery'::text NOT NULL,
    customer_name text,
    original_amount numeric(14,2) DEFAULT 0 NOT NULL,
    CONSTRAINT shipment_delivery_financial_records_amount_check CHECK ((amount >= (0)::numeric)),
    CONSTRAINT shipment_delivery_financial_records_currency_check CHECK ((currency = 'CRC'::text)),
    CONSTRAINT shipment_delivery_financial_records_record_type_check CHECK ((record_type = ANY (ARRAY['company_delivery_charge'::text, 'courier_delivery_payment'::text]))),
    CONSTRAINT shipment_delivery_financial_records_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'settled'::text, 'voided'::text, 'unrated'::text])))
);


ALTER TABLE public.shipment_delivery_financial_records OWNER TO postgres;

--
-- TOC entry 436 (class 1259 OID 28335)
-- Name: shipment_evidences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_evidences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_id uuid NOT NULL,
    evidence_type text NOT NULL,
    file_url text,
    thumbnail_url text,
    original_filename text,
    mime_type text,
    file_size bigint,
    metadata jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    storage_path text,
    thumbnail_storage_path text,
    validated boolean DEFAULT false NOT NULL,
    validated_at timestamp with time zone,
    validated_by uuid,
    created_company_id uuid NOT NULL,
    deleted_at timestamp with time zone,
    deleted_by uuid,
    CONSTRAINT shipment_evidences_type_chk CHECK ((evidence_type = ANY (ARRAY['photo'::text, 'video'::text, 'audio'::text, 'document'::text])))
);


ALTER TABLE public.shipment_evidences OWNER TO postgres;

--
-- TOC entry 401 (class 1259 OID 25639)
-- Name: shipment_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_items (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    shipment_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    deposit_amount numeric(12,2) DEFAULT 0,
    shipping_fee numeric(12,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    barcode text,
    serial_number text,
    notes text,
    delivered_quantity integer DEFAULT 0 NOT NULL,
    CONSTRAINT shipment_items_delivered_quantity_nonnegative CHECK ((delivered_quantity >= 0))
);


ALTER TABLE public.shipment_items OWNER TO postgres;

--
-- TOC entry 435 (class 1259 OID 28297)
-- Name: shipment_sims; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_sims (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_id uuid NOT NULL,
    barcode text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);


ALTER TABLE public.shipment_sims OWNER TO postgres;

--
-- TOC entry 423 (class 1259 OID 27361)
-- Name: shipment_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipment_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    shipment_id uuid NOT NULL,
    status public.shipment_status NOT NULL,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    previous_status public.shipment_status
);


ALTER TABLE public.shipment_status_history OWNER TO postgres;

--
-- TOC entry 425 (class 1259 OID 27516)
-- Name: shipment_tracking_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.shipment_tracking_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.shipment_tracking_seq OWNER TO postgres;

--
-- TOC entry 400 (class 1259 OID 25612)
-- Name: shipments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.shipments (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    tracking_number text NOT NULL,
    company_id uuid NOT NULL,
    courier_id uuid,
    route_id uuid,
    status public.shipment_status DEFAULT 'created'::public.shipment_status NOT NULL,
    customer_name text NOT NULL,
    customer_address text NOT NULL,
    receiver_name text,
    receiver_type public.receiver_type,
    latitude numeric(10,7),
    longitude numeric(10,7),
    delivered_at timestamp with time zone,
    rejection_reason text,
    cancellation_reason text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    district_id bigint,
    neighborhood_id bigint,
    commercial_notes text,
    internal_reference text,
    customer_identification_type_id smallint,
    customer_identification text,
    search_text text,
    delivered_by_courier_id uuid,
    delivery_charge_applied numeric(12,2),
    courier_delivery_pay_applied numeric(12,2),
    shipping_collected numeric(12,2),
    deposit_collected numeric(12,2),
    last_update_message text,
    last_update_at timestamp with time zone,
    customer_latitude double precision,
    customer_longitude double precision,
    customer_location_accuracy_meters double precision,
    customer_location_received_at timestamp with time zone
);


ALTER TABLE public.shipments OWNER TO postgres;

--
-- TOC entry 465 (class 1259 OID 30661)
-- Name: system_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_settings (
    id boolean DEFAULT true NOT NULL,
    dts_chat_enabled boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    CONSTRAINT system_settings_id_check CHECK ((id = true))
);


ALTER TABLE public.system_settings OWNER TO postgres;

--
-- TOC entry 5591 (class 0 OID 0)
-- Dependencies: 465
-- Name: TABLE system_settings; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.system_settings IS 'Configuración global y única de SysLogistics.';


--
-- TOC entry 5592 (class 0 OID 0)
-- Dependencies: 465
-- Name: COLUMN system_settings.dts_chat_enabled; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.system_settings.dts_chat_enabled IS 'Permite a usuarios de empresas DTS acceder al chat.';


--
-- TOC entry 439 (class 1259 OID 29484)
-- Name: tracking_record_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracking_record_history (
    id bigint NOT NULL,
    tracking_record_id uuid NOT NULL,
    changed_at timestamp with time zone DEFAULT now() NOT NULL,
    changed_by_profile_id uuid,
    field_name text NOT NULL,
    previous_value text,
    new_value text
);


ALTER TABLE public.tracking_record_history OWNER TO postgres;

--
-- TOC entry 438 (class 1259 OID 29483)
-- Name: tracking_record_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.tracking_record_history ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.tracking_record_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 437 (class 1259 OID 29446)
-- Name: tracking_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tracking_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    company_id uuid NOT NULL,
    full_name text NOT NULL,
    identification text NOT NULL,
    province_id integer NOT NULL,
    status text DEFAULT 'EN RUTA'::text NOT NULL,
    comment text,
    CONSTRAINT tracking_records_comment_length CHECK (((comment IS NULL) OR (length(comment) <= 500))),
    CONSTRAINT tracking_records_full_name_check CHECK ((length(TRIM(BOTH FROM full_name)) > 0)),
    CONSTRAINT tracking_records_identification_check CHECK ((length(TRIM(BOTH FROM identification)) > 0)),
    CONSTRAINT tracking_records_status_check CHECK ((status = ANY (ARRAY['ENTREGADO'::text, 'CANCELADA DTS'::text, 'SIN COBERTURA'::text, 'RECHAZADA POR CTE'::text, 'EN RUTA'::text, 'ILOCALIZABLE 1'::text, 'ILOCALIZABLE 2'::text, 'INTENTO FALLIDO'::text])))
);


ALTER TABLE public.tracking_records OWNER TO postgres;

--
-- TOC entry 464 (class 1259 OID 30643)
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_profile_id uuid NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    body text NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_notifications OWNER TO postgres;

--
-- TOC entry 389 (class 1259 OID 17525)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- TOC entry 446 (class 1259 OID 30014)
-- Name: messages_2026_09_28; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_28 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_28 OWNER TO supabase_realtime_admin;

--
-- TOC entry 447 (class 1259 OID 30049)
-- Name: messages_2026_09_29; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_29 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_29 OWNER TO supabase_realtime_admin;

--
-- TOC entry 451 (class 1259 OID 30172)
-- Name: messages_2026_09_30; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_09_30 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_09_30 OWNER TO supabase_realtime_admin;

--
-- TOC entry 452 (class 1259 OID 30190)
-- Name: messages_2026_10_01; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_10_01 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_10_01 OWNER TO supabase_realtime_admin;

--
-- TOC entry 454 (class 1259 OID 30264)
-- Name: messages_2026_10_02; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_10_02 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_10_02 OWNER TO supabase_realtime_admin;

--
-- TOC entry 459 (class 1259 OID 30559)
-- Name: messages_2026_10_03; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_10_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_10_03 OWNER TO supabase_realtime_admin;

--
-- TOC entry 466 (class 1259 OID 30692)
-- Name: messages_2026_10_04; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_10_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    skip_broadcast boolean DEFAULT false NOT NULL,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_10_04 OWNER TO supabase_realtime_admin;

--
-- TOC entry 375 (class 1259 OID 17170)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- TOC entry 378 (class 1259 OID 17193)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_realtime_admin;

--
-- TOC entry 377 (class 1259 OID 17192)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 380 (class 1259 OID 17216)
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL,
    versioning_status text DEFAULT 'DISABLED'::text NOT NULL,
    lifecycle_configuration jsonb,
    lifecycle_configuration_generation uuid,
    CONSTRAINT buckets_lifecycle_configuration_pair_check CHECK (((lifecycle_configuration IS NULL) = (lifecycle_configuration_generation IS NULL))),
    CONSTRAINT buckets_lifecycle_configuration_shape_check CHECK (((lifecycle_configuration IS NULL) OR ((jsonb_typeof(lifecycle_configuration) = 'object'::text) AND (lifecycle_configuration ? 'rules'::text) AND
CASE
    WHEN (jsonb_typeof((lifecycle_configuration -> 'rules'::text)) = 'array'::text) THEN ((jsonb_array_length((lifecycle_configuration -> 'rules'::text)) >= 1) AND (jsonb_array_length((lifecycle_configuration -> 'rules'::text)) <= 1000))
    ELSE false
END))),
    CONSTRAINT buckets_lifecycle_configuration_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR ((lifecycle_configuration IS NULL) AND (lifecycle_configuration_generation IS NULL)))),
    CONSTRAINT buckets_versioning_dark_check CHECK ((versioning_status = 'DISABLED'::text)),
    CONSTRAINT buckets_versioning_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR (versioning_status = 'DISABLED'::text))),
    CONSTRAINT buckets_versioning_status_check CHECK ((versioning_status = ANY (ARRAY['DISABLED'::text, 'ENABLED'::text, 'SUSPENDED'::text])))
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- TOC entry 5608 (class 0 OID 0)
-- Dependencies: 380
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 384 (class 1259 OID 17336)
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- TOC entry 385 (class 1259 OID 17349)
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- TOC entry 379 (class 1259 OID 17208)
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- TOC entry 381 (class 1259 OID 17226)
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    archived_at timestamp with time zone,
    is_delete_marker boolean DEFAULT false NOT NULL,
    is_versioned boolean DEFAULT false NOT NULL
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- TOC entry 5612 (class 0 OID 0)
-- Dependencies: 381
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 382 (class 1259 OID 17275)
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- TOC entry 383 (class 1259 OID 17289)
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- TOC entry 386 (class 1259 OID 17359)
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- TOC entry 4067 (class 0 OID 0)
-- Name: messages_2026_09_28; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_28 FOR VALUES FROM ('2026-09-28 00:00:00') TO ('2026-09-29 00:00:00');


--
-- TOC entry 4068 (class 0 OID 0)
-- Name: messages_2026_09_29; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_29 FOR VALUES FROM ('2026-09-29 00:00:00') TO ('2026-09-30 00:00:00');


--
-- TOC entry 4069 (class 0 OID 0)
-- Name: messages_2026_09_30; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_09_30 FOR VALUES FROM ('2026-09-30 00:00:00') TO ('2026-10-01 00:00:00');


--
-- TOC entry 4070 (class 0 OID 0)
-- Name: messages_2026_10_01; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_10_01 FOR VALUES FROM ('2026-10-01 00:00:00') TO ('2026-10-02 00:00:00');


--
-- TOC entry 4071 (class 0 OID 0)
-- Name: messages_2026_10_02; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_10_02 FOR VALUES FROM ('2026-10-02 00:00:00') TO ('2026-10-03 00:00:00');


--
-- TOC entry 4072 (class 0 OID 0)
-- Name: messages_2026_10_03; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_10_03 FOR VALUES FROM ('2026-10-03 00:00:00') TO ('2026-10-04 00:00:00');


--
-- TOC entry 4073 (class 0 OID 0)
-- Name: messages_2026_10_04; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_10_04 FOR VALUES FROM ('2026-10-04 00:00:00') TO ('2026-10-05 00:00:00');


--
-- TOC entry 4083 (class 2604 OID 16514)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4228 (class 2604 OID 25806)
-- Name: cantons id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cantons ALTER COLUMN id SET DEFAULT nextval('public.cantons_id_seq'::regclass);


--
-- TOC entry 4230 (class 2604 OID 25823)
-- Name: districts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts ALTER COLUMN id SET DEFAULT nextval('public.districts_id_seq'::regclass);


--
-- TOC entry 4260 (class 2604 OID 27539)
-- Name: identification_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identification_types ALTER COLUMN id SET DEFAULT nextval('public.identification_types_id_seq'::regclass);


--
-- TOC entry 4232 (class 2604 OID 25840)
-- Name: neighborhoods id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods ALTER COLUMN id SET DEFAULT nextval('public.neighborhoods_id_seq'::regclass);


--
-- TOC entry 4226 (class 2604 OID 25794)
-- Name: provinces id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces ALTER COLUMN id SET DEFAULT nextval('public.provinces_id_seq'::regclass);


--
-- TOC entry 4235 (class 2604 OID 25952)
-- Name: route_coverage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_coverage ALTER COLUMN id SET DEFAULT nextval('public.route_coverage_id_seq'::regclass);


--
-- TOC entry 4237 (class 2604 OID 26363)
-- Name: route_district_delivery_times id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_district_delivery_times ALTER COLUMN id SET DEFAULT nextval('public.route_district_delivery_times_id_seq'::regclass);


--
-- TOC entry 4239 (class 2604 OID 26385)
-- Name: route_district_visit_days id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_district_visit_days ALTER COLUMN id SET DEFAULT nextval('public.route_district_visit_days_id_seq'::regclass);


--
-- TOC entry 4539 (class 2606 OID 16789)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4508 (class 2606 OID 16535)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4594 (class 2606 OID 17121)
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- TOC entry 4596 (class 2606 OID 17119)
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4562 (class 2606 OID 16895)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4517 (class 2606 OID 16913)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4519 (class 2606 OID 16923)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4506 (class 2606 OID 16528)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4541 (class 2606 OID 16782)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4537 (class 2606 OID 16770)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4529 (class 2606 OID 16963)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4531 (class 2606 OID 16757)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 29719)
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_mfa_factor_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_mfa_factor_id_key UNIQUE (mfa_factor_id);


--
-- TOC entry 4822 (class 2606 OID 29715)
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 29717)
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_user_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_user_id_key UNIQUE (user_id);


--
-- TOC entry 4826 (class 2606 OID 29737)
-- Name: mfa_recovery_codes mfa_recovery_codes_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_codes
    ADD CONSTRAINT mfa_recovery_codes_pkey PRIMARY KEY (id);


--
-- TOC entry 4575 (class 2606 OID 17022)
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- TOC entry 4577 (class 2606 OID 17020)
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- TOC entry 4579 (class 2606 OID 17018)
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4589 (class 2606 OID 17080)
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4572 (class 2606 OID 16982)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4583 (class 2606 OID 17044)
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- TOC entry 4585 (class 2606 OID 17046)
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- TOC entry 4566 (class 2606 OID 16948)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4500 (class 2606 OID 16518)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4503 (class 2606 OID 16699)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4551 (class 2606 OID 16829)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4553 (class 2606 OID 16827)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4558 (class 2606 OID 16843)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4511 (class 2606 OID 16541)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4815 (class 2606 OID 29696)
-- Name: scim_tokens scim_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_tokens
    ADD CONSTRAINT scim_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4807 (class 2606 OID 29666)
-- Name: scim_users scim_users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4524 (class 2606 OID 16720)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4548 (class 2606 OID 16810)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4543 (class 2606 OID 16801)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4493 (class 2606 OID 16883)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4495 (class 2606 OID 16505)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4604 (class 2606 OID 17158)
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4600 (class 2606 OID 17141)
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 30585)
-- Name: account_email_verifications account_email_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_email_verifications
    ADD CONSTRAINT account_email_verifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4879 (class 2606 OID 30587)
-- Name: account_email_verifications account_email_verifications_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_email_verifications
    ADD CONSTRAINT account_email_verifications_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 4881 (class 2606 OID 30602)
-- Name: account_password_reset_tokens account_password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_password_reset_tokens
    ADD CONSTRAINT account_password_reset_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4884 (class 2606 OID 30604)
-- Name: account_password_reset_tokens account_password_reset_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_password_reset_tokens
    ADD CONSTRAINT account_password_reset_tokens_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 4890 (class 2606 OID 30641)
-- Name: account_security_rate_limits account_security_rate_limits_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_security_rate_limits
    ADD CONSTRAINT account_security_rate_limits_pkey PRIMARY KEY (id);


--
-- TOC entry 4726 (class 2606 OID 27206)
-- Name: admin_users admin_users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_email_key UNIQUE (email);


--
-- TOC entry 4728 (class 2606 OID 27204)
-- Name: admin_users admin_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_pkey PRIMARY KEY (id);


--
-- TOC entry 4691 (class 2606 OID 25811)
-- Name: cantons cantons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cantons
    ADD CONSTRAINT cantons_pkey PRIMARY KEY (id);


--
-- TOC entry 4693 (class 2606 OID 25813)
-- Name: cantons cantons_province_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cantons
    ADD CONSTRAINT cantons_province_id_name_key UNIQUE (province_id, name);


--
-- TOC entry 4853 (class 2606 OID 30220)
-- Name: chat_conversation_participants chat_conversation_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversation_participants
    ADD CONSTRAINT chat_conversation_participants_pkey PRIMARY KEY (conversation_id, profile_id);


--
-- TOC entry 4840 (class 2606 OID 30074)
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 30302)
-- Name: chat_message_audit chat_message_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_audit
    ADD CONSTRAINT chat_message_audit_pkey PRIMARY KEY (id);


--
-- TOC entry 4845 (class 2606 OID 30116)
-- Name: chat_message_reads chat_message_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_reads
    ADD CONSTRAINT chat_message_reads_pkey PRIMARY KEY (message_id, profile_id);


--
-- TOC entry 4843 (class 2606 OID 30100)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4645 (class 2606 OID 25462)
-- Name: companies companies_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_code_key UNIQUE (code);


--
-- TOC entry 4647 (class 2606 OID 25460)
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- TOC entry 4724 (class 2606 OID 27097)
-- Name: company_contacts company_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_contacts
    ADD CONSTRAINT company_contacts_pkey PRIMARY KEY (company_id, contact_id);


--
-- TOC entry 4738 (class 2606 OID 27386)
-- Name: company_products company_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_products
    ADD CONSTRAINT company_products_pkey PRIMARY KEY (company_id, product_id);


--
-- TOC entry 4720 (class 2606 OID 27078)
-- Name: contact_methods contact_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_methods
    ADD CONSTRAINT contact_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 4718 (class 2606 OID 27067)
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- TOC entry 4747 (class 2606 OID 27862)
-- Name: courier_delivery_rates courier_delivery_rates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_delivery_rates
    ADD CONSTRAINT courier_delivery_rates_pkey PRIMARY KEY (id);


--
-- TOC entry 4664 (class 2606 OID 25545)
-- Name: courier_routes courier_routes_courier_id_route_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_routes
    ADD CONSTRAINT courier_routes_courier_id_route_id_key UNIQUE (courier_id, route_id);


--
-- TOC entry 4666 (class 2606 OID 25543)
-- Name: courier_routes courier_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_routes
    ADD CONSTRAINT courier_routes_pkey PRIMARY KEY (id);


--
-- TOC entry 4653 (class 2606 OID 25490)
-- Name: couriers couriers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couriers
    ADD CONSTRAINT couriers_pkey PRIMARY KEY (id);


--
-- TOC entry 4757 (class 2606 OID 27911)
-- Name: delivery_rates delivery_rates_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_rates
    ADD CONSTRAINT delivery_rates_pkey1 PRIMARY KEY (id);


--
-- TOC entry 4695 (class 2606 OID 25830)
-- Name: districts districts_canton_id_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_canton_id_name_key UNIQUE (canton_id, name);


--
-- TOC entry 4697 (class 2606 OID 25828)
-- Name: districts districts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_pkey PRIMARY KEY (id);


--
-- TOC entry 4741 (class 2606 OID 27547)
-- Name: identification_types identification_types_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identification_types
    ADD CONSTRAINT identification_types_code_key UNIQUE (code);


--
-- TOC entry 4743 (class 2606 OID 27545)
-- Name: identification_types identification_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.identification_types
    ADD CONSTRAINT identification_types_pkey PRIMARY KEY (id);


--
-- TOC entry 4671 (class 2606 OID 25582)
-- Name: inventory inventory_courier_id_company_id_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_courier_id_company_id_product_id_key UNIQUE (courier_id, company_id, product_id);


--
-- TOC entry 4675 (class 2606 OID 25606)
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 4673 (class 2606 OID 25580)
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (id);


--
-- TOC entry 4699 (class 2606 OID 25845)
-- Name: neighborhoods neighborhoods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_pkey PRIMARY KEY (id);


--
-- TOC entry 4701 (class 2606 OID 26466)
-- Name: neighborhoods neighborhoods_unique_location; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_unique_location UNIQUE (district_id, name, type_code, position_index);


--
-- TOC entry 4887 (class 2606 OID 30621)
-- Name: password_reset_requests password_reset_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_requests
    ADD CONSTRAINT password_reset_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4734 (class 2606 OID 27267)
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- TOC entry 4730 (class 2606 OID 27238)
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 4656 (class 2606 OID 25510)
-- Name: pricing_templates pricing_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pricing_templates
    ADD CONSTRAINT pricing_templates_pkey PRIMARY KEY (id);


--
-- TOC entry 4669 (class 2606 OID 25567)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4732 (class 2606 OID 27246)
-- Name: profile_permissions profile_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_permissions
    ADD CONSTRAINT profile_permissions_pkey PRIMARY KEY (profile_id, permission_id);


--
-- TOC entry 4649 (class 2606 OID 25471)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4687 (class 2606 OID 25801)
-- Name: provinces provinces_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_name_key UNIQUE (name);


--
-- TOC entry 4689 (class 2606 OID 25799)
-- Name: provinces provinces_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provinces
    ADD CONSTRAINT provinces_pkey PRIMARY KEY (id);


--
-- TOC entry 4704 (class 2606 OID 25955)
-- Name: route_coverage route_coverage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_coverage
    ADD CONSTRAINT route_coverage_pkey PRIMARY KEY (id);


--
-- TOC entry 4706 (class 2606 OID 25957)
-- Name: route_coverage route_coverage_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_coverage
    ADD CONSTRAINT route_coverage_unique UNIQUE (route_id, neighborhood_id);


--
-- TOC entry 4709 (class 2606 OID 26366)
-- Name: route_district_delivery_times route_district_delivery_times_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_district_delivery_times
    ADD CONSTRAINT route_district_delivery_times_pkey PRIMARY KEY (id);


--
-- TOC entry 4711 (class 2606 OID 26368)
-- Name: route_district_delivery_times route_district_delivery_times_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_district_delivery_times
    ADD CONSTRAINT route_district_delivery_times_unique UNIQUE (route_id, district_id);


--
-- TOC entry 4714 (class 2606 OID 26390)
-- Name: route_district_visit_days route_district_visit_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_district_visit_days
    ADD CONSTRAINT route_district_visit_days_pkey PRIMARY KEY (id);


--
-- TOC entry 4716 (class 2606 OID 27020)
-- Name: route_district_visit_days route_district_visit_days_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_district_visit_days
    ADD CONSTRAINT route_district_visit_days_unique UNIQUE (route_id, district_id, day);


--
-- TOC entry 4660 (class 2606 OID 25530)
-- Name: route_visit_days route_visit_days_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_visit_days
    ADD CONSTRAINT route_visit_days_pkey PRIMARY KEY (id);


--
-- TOC entry 4662 (class 2606 OID 25532)
-- Name: route_visit_days route_visit_days_route_id_day_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_visit_days
    ADD CONSTRAINT route_visit_days_route_id_day_key UNIQUE (route_id, day);


--
-- TOC entry 4658 (class 2606 OID 25524)
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- TOC entry 4871 (class 2606 OID 30539)
-- Name: settlement_adjustments settlement_adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_adjustments
    ADD CONSTRAINT settlement_adjustments_pkey PRIMARY KEY (id);


--
-- TOC entry 4777 (class 2606 OID 28211)
-- Name: settlement_period_items settlement_period_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_period_items
    ADD CONSTRAINT settlement_period_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4769 (class 2606 OID 28196)
-- Name: settlement_periods settlement_periods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_periods
    ADD CONSTRAINT settlement_periods_pkey PRIMARY KEY (id);


--
-- TOC entry 4782 (class 2606 OID 28272)
-- Name: settlement_schedule_targets settlement_schedule_targets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_schedule_targets
    ADD CONSTRAINT settlement_schedule_targets_pkey PRIMARY KEY (id);


--
-- TOC entry 4763 (class 2606 OID 28176)
-- Name: settlement_schedules settlement_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_schedules
    ADD CONSTRAINT settlement_schedules_pkey PRIMARY KEY (id);


--
-- TOC entry 4799 (class 2606 OID 29623)
-- Name: shipment_attachments shipment_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_attachments
    ADD CONSTRAINT shipment_attachments_pkey PRIMARY KEY (id);


--
-- TOC entry 4745 (class 2606 OID 27562)
-- Name: shipment_contact_methods shipment_contact_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_contact_methods
    ADD CONSTRAINT shipment_contact_methods_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 29858)
-- Name: shipment_customer_location_requests shipment_customer_location_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_customer_location_requests
    ADD CONSTRAINT shipment_customer_location_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4832 (class 2606 OID 29860)
-- Name: shipment_customer_location_requests shipment_customer_location_requests_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_customer_location_requests
    ADD CONSTRAINT shipment_customer_location_requests_token_hash_key UNIQUE (token_hash);


--
-- TOC entry 4867 (class 2606 OID 30447)
-- Name: shipment_delivery_financial_amount_changes shipment_delivery_financial_amount_changes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_amount_changes
    ADD CONSTRAINT shipment_delivery_financial_amount_changes_pkey PRIMARY KEY (id);


--
-- TOC entry 4863 (class 2606 OID 30382)
-- Name: shipment_delivery_financial_records shipment_delivery_financial_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_records
    ADD CONSTRAINT shipment_delivery_financial_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4789 (class 2606 OID 28344)
-- Name: shipment_evidences shipment_evidences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_evidences
    ADD CONSTRAINT shipment_evidences_pkey PRIMARY KEY (id);


--
-- TOC entry 4685 (class 2606 OID 25648)
-- Name: shipment_items shipment_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_items
    ADD CONSTRAINT shipment_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4786 (class 2606 OID 28305)
-- Name: shipment_sims shipment_sims_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_sims
    ADD CONSTRAINT shipment_sims_pkey PRIMARY KEY (id);


--
-- TOC entry 4736 (class 2606 OID 27369)
-- Name: shipment_status_history shipment_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_status_history
    ADD CONSTRAINT shipment_status_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4681 (class 2606 OID 25621)
-- Name: shipments shipments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_pkey PRIMARY KEY (id);


--
-- TOC entry 4683 (class 2606 OID 25623)
-- Name: shipments shipments_tracking_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_tracking_number_key UNIQUE (tracking_number);


--
-- TOC entry 4895 (class 2606 OID 30669)
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- TOC entry 4796 (class 2606 OID 29491)
-- Name: tracking_record_history tracking_record_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_record_history
    ADD CONSTRAINT tracking_record_history_pkey PRIMARY KEY (id);


--
-- TOC entry 4793 (class 2606 OID 29459)
-- Name: tracking_records tracking_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_records
    ADD CONSTRAINT tracking_records_pkey PRIMARY KEY (id);


--
-- TOC entry 4892 (class 2606 OID 30652)
-- Name: user_notifications user_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4643 (class 2606 OID 17539)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4835 (class 2606 OID 30024)
-- Name: messages_2026_09_28 messages_2026_09_28_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_28
    ADD CONSTRAINT messages_2026_09_28_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4838 (class 2606 OID 30059)
-- Name: messages_2026_09_29 messages_2026_09_29_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_29
    ADD CONSTRAINT messages_2026_09_29_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4848 (class 2606 OID 30182)
-- Name: messages_2026_09_30 messages_2026_09_30_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_09_30
    ADD CONSTRAINT messages_2026_09_30_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4851 (class 2606 OID 30200)
-- Name: messages_2026_10_01 messages_2026_10_01_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_10_01
    ADD CONSTRAINT messages_2026_10_01_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4856 (class 2606 OID 30274)
-- Name: messages_2026_10_02 messages_2026_10_02_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_10_02
    ADD CONSTRAINT messages_2026_10_02_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4874 (class 2606 OID 30569)
-- Name: messages_2026_10_03 messages_2026_10_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_10_03
    ADD CONSTRAINT messages_2026_10_03_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4898 (class 2606 OID 30702)
-- Name: messages_2026_10_04 messages_2026_10_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_10_04
    ADD CONSTRAINT messages_2026_10_04_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4436 (class 2606 OID 27581)
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- TOC entry 4610 (class 2606 OID 17201)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 4607 (class 2606 OID 17174)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4634 (class 2606 OID 17382)
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4618 (class 2606 OID 17224)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 4637 (class 2606 OID 17358)
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- TOC entry 4613 (class 2606 OID 17215)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 4615 (class 2606 OID 17213)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4627 (class 2606 OID 17236)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 4632 (class 2606 OID 17298)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 4630 (class 2606 OID 17283)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 4640 (class 2606 OID 17368)
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- TOC entry 4509 (class 1259 OID 16536)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 4479 (class 1259 OID 16709)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4590 (class 1259 OID 17125)
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- TOC entry 4591 (class 1259 OID 17124)
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- TOC entry 4592 (class 1259 OID 17122)
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- TOC entry 4597 (class 1259 OID 17123)
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- TOC entry 4480 (class 1259 OID 16711)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4481 (class 1259 OID 16712)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4527 (class 1259 OID 16791)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4560 (class 1259 OID 16899)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4515 (class 1259 OID 16879)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 5619 (class 0 OID 0)
-- Dependencies: 4515
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4520 (class 1259 OID 16706)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4563 (class 1259 OID 16896)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4587 (class 1259 OID 17081)
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- TOC entry 4564 (class 1259 OID 16897)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4482 (class 1259 OID 17167)
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- TOC entry 4483 (class 1259 OID 17166)
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- TOC entry 4484 (class 1259 OID 17168)
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- TOC entry 4485 (class 1259 OID 17169)
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- TOC entry 4535 (class 1259 OID 16902)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4532 (class 1259 OID 16763)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4533 (class 1259 OID 16908)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4827 (class 1259 OID 29743)
-- Name: mfa_recovery_codes_set_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_recovery_codes_set_id_idx ON auth.mfa_recovery_codes USING btree (mfa_recovery_code_set_id);


--
-- TOC entry 4573 (class 1259 OID 17033)
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- TOC entry 4570 (class 1259 OID 16986)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 4580 (class 1259 OID 17059)
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4581 (class 1259 OID 17057)
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4586 (class 1259 OID 17058)
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- TOC entry 4567 (class 1259 OID 16955)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4568 (class 1259 OID 16954)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4569 (class 1259 OID 16956)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4486 (class 1259 OID 16713)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4487 (class 1259 OID 16710)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4496 (class 1259 OID 16519)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4497 (class 1259 OID 16520)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4498 (class 1259 OID 16705)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4501 (class 1259 OID 16793)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4504 (class 1259 OID 16898)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4554 (class 1259 OID 16835)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4555 (class 1259 OID 16900)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4556 (class 1259 OID 16850)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4559 (class 1259 OID 16849)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4813 (class 1259 OID 29704)
-- Name: scim_tokens_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_tokens_expires_at_idx ON auth.scim_tokens USING btree (expires_at);


--
-- TOC entry 4816 (class 1259 OID 29705)
-- Name: scim_tokens_revoked_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_tokens_revoked_at_idx ON auth.scim_tokens USING btree (revoked_at);


--
-- TOC entry 4817 (class 1259 OID 29703)
-- Name: scim_tokens_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_tokens_sso_provider_id_idx ON auth.scim_tokens USING btree (sso_provider_id);


--
-- TOC entry 4818 (class 1259 OID 29702)
-- Name: scim_tokens_token_hash_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX scim_tokens_token_hash_key ON auth.scim_tokens USING btree (token_hash);


--
-- TOC entry 4802 (class 1259 OID 29682)
-- Name: scim_users_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_created_at_idx ON auth.scim_users USING btree (sso_provider_id, created_at, id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4803 (class 1259 OID 29685)
-- Name: scim_users_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_deleted_at_idx ON auth.scim_users USING btree (deleted_at);


--
-- TOC entry 4804 (class 1259 OID 29678)
-- Name: scim_users_external_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX scim_users_external_id_key ON auth.scim_users USING btree (sso_provider_id, external_id) WHERE ((external_id IS NOT NULL) AND (deleted_at IS NULL));


--
-- TOC entry 4805 (class 1259 OID 29680)
-- Name: scim_users_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_id_idx ON auth.scim_users USING btree (sso_provider_id, id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4808 (class 1259 OID 29684)
-- Name: scim_users_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_sso_provider_id_idx ON auth.scim_users USING btree (sso_provider_id);


--
-- TOC entry 4809 (class 1259 OID 29683)
-- Name: scim_users_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_updated_at_idx ON auth.scim_users USING btree (sso_provider_id, updated_at, id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4810 (class 1259 OID 29679)
-- Name: scim_users_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_user_id_idx ON auth.scim_users USING btree (user_id);


--
-- TOC entry 4811 (class 1259 OID 29681)
-- Name: scim_users_user_name_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX scim_users_user_name_idx ON auth.scim_users USING btree (sso_provider_id, user_name COLLATE "C", id) WHERE (deleted_at IS NULL);


--
-- TOC entry 4812 (class 1259 OID 29677)
-- Name: scim_users_user_name_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX scim_users_user_name_key ON auth.scim_users USING btree (sso_provider_id, user_name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4521 (class 1259 OID 16901)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4522 (class 1259 OID 17071)
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- TOC entry 4525 (class 1259 OID 16792)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4546 (class 1259 OID 16817)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4549 (class 1259 OID 16816)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4544 (class 1259 OID 16802)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4545 (class 1259 OID 16964)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 4534 (class 1259 OID 16961)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4526 (class 1259 OID 16790)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4488 (class 1259 OID 16870)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 5620 (class 0 OID 0)
-- Dependencies: 4488
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4489 (class 1259 OID 16707)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4490 (class 1259 OID 16509)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4491 (class 1259 OID 16925)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 4602 (class 1259 OID 17165)
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- TOC entry 4605 (class 1259 OID 17164)
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- TOC entry 4598 (class 1259 OID 17147)
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- TOC entry 4601 (class 1259 OID 17148)
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- TOC entry 4877 (class 1259 OID 30593)
-- Name: account_email_verifications_profile_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_email_verifications_profile_active_idx ON public.account_email_verifications USING btree (profile_id, created_at DESC) WHERE ((used_at IS NULL) AND (invalidated_at IS NULL));


--
-- TOC entry 4882 (class 1259 OID 30610)
-- Name: account_password_reset_tokens_profile_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_password_reset_tokens_profile_active_idx ON public.account_password_reset_tokens USING btree (profile_id, created_at DESC) WHERE ((used_at IS NULL) AND (invalidated_at IS NULL));


--
-- TOC entry 4888 (class 1259 OID 30642)
-- Name: account_security_rate_limits_lookup_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX account_security_rate_limits_lookup_idx ON public.account_security_rate_limits USING btree (action, subject_hash, created_at DESC);


--
-- TOC entry 4841 (class 1259 OID 30090)
-- Name: chat_conversations_unique_shipment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX chat_conversations_unique_shipment ON public.chat_conversations USING btree (owner_company_id, client_company_id, shipment_id) WHERE (shipment_id IS NOT NULL);


--
-- TOC entry 4667 (class 1259 OID 29944)
-- Name: courier_routes_route_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX courier_routes_route_id_idx ON public.courier_routes USING btree (route_id);


--
-- TOC entry 4654 (class 1259 OID 29943)
-- Name: couriers_profile_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX couriers_profile_id_unique ON public.couriers USING btree (profile_id);


--
-- TOC entry 4739 (class 1259 OID 27397)
-- Name: idx_company_products_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_company_products_unique ON public.company_products USING btree (company_id, product_id);


--
-- TOC entry 4721 (class 1259 OID 27089)
-- Name: idx_contact_methods_contact; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_methods_contact ON public.contact_methods USING btree (contact_id);


--
-- TOC entry 4722 (class 1259 OID 27090)
-- Name: idx_contact_methods_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_contact_methods_type ON public.contact_methods USING btree (method_type);


--
-- TOC entry 4748 (class 1259 OID 28033)
-- Name: idx_courier_delivery_rates_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courier_delivery_rates_active ON public.courier_delivery_rates USING btree (active);


--
-- TOC entry 4749 (class 1259 OID 28030)
-- Name: idx_courier_delivery_rates_canton; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courier_delivery_rates_canton ON public.courier_delivery_rates USING btree (canton_id);


--
-- TOC entry 4750 (class 1259 OID 27937)
-- Name: idx_courier_delivery_rates_courier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courier_delivery_rates_courier ON public.courier_delivery_rates USING btree (courier_id);


--
-- TOC entry 4751 (class 1259 OID 28031)
-- Name: idx_courier_delivery_rates_district; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courier_delivery_rates_district ON public.courier_delivery_rates USING btree (district_id);


--
-- TOC entry 4752 (class 1259 OID 28032)
-- Name: idx_courier_delivery_rates_neighborhood; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courier_delivery_rates_neighborhood ON public.courier_delivery_rates USING btree (neighborhood_id);


--
-- TOC entry 4753 (class 1259 OID 28029)
-- Name: idx_courier_delivery_rates_province; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courier_delivery_rates_province ON public.courier_delivery_rates USING btree (province_id);


--
-- TOC entry 4754 (class 1259 OID 27938)
-- Name: idx_courier_delivery_rates_route; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_courier_delivery_rates_route ON public.courier_delivery_rates USING btree (route_id);


--
-- TOC entry 4758 (class 1259 OID 27974)
-- Name: idx_delivery_rates_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_rates_company ON public.delivery_rates USING btree (company_id);


--
-- TOC entry 4759 (class 1259 OID 27975)
-- Name: idx_delivery_rates_company_route; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_rates_company_route ON public.delivery_rates USING btree (company_id, route_id);


--
-- TOC entry 4702 (class 1259 OID 27021)
-- Name: idx_route_coverage_route; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_route_coverage_route ON public.route_coverage USING btree (route_id);


--
-- TOC entry 4707 (class 1259 OID 27022)
-- Name: idx_route_delivery_route; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_route_delivery_route ON public.route_district_delivery_times USING btree (route_id);


--
-- TOC entry 4712 (class 1259 OID 27023)
-- Name: idx_route_visit_route; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_route_visit_route ON public.route_district_visit_days USING btree (route_id);


--
-- TOC entry 4770 (class 1259 OID 28236)
-- Name: idx_settlement_period_items_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_period_items_company ON public.settlement_period_items USING btree (company_id);


--
-- TOC entry 4771 (class 1259 OID 28237)
-- Name: idx_settlement_period_items_courier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_period_items_courier ON public.settlement_period_items USING btree (courier_id);


--
-- TOC entry 4772 (class 1259 OID 28239)
-- Name: idx_settlement_period_items_excluded; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_period_items_excluded ON public.settlement_period_items USING btree (excluded);


--
-- TOC entry 4773 (class 1259 OID 28238)
-- Name: idx_settlement_period_items_shipment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_period_items_shipment ON public.settlement_period_items USING btree (shipment_id);


--
-- TOC entry 4765 (class 1259 OID 28235)
-- Name: idx_settlement_periods_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_periods_dates ON public.settlement_periods USING btree (starts_at, ends_at);


--
-- TOC entry 4766 (class 1259 OID 28234)
-- Name: idx_settlement_periods_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_periods_status ON public.settlement_periods USING btree (status);


--
-- TOC entry 4778 (class 1259 OID 28290)
-- Name: idx_settlement_schedule_targets_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_schedule_targets_company ON public.settlement_schedule_targets USING btree (company_id);


--
-- TOC entry 4779 (class 1259 OID 28289)
-- Name: idx_settlement_schedule_targets_courier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_schedule_targets_courier ON public.settlement_schedule_targets USING btree (courier_id);


--
-- TOC entry 4780 (class 1259 OID 28288)
-- Name: idx_settlement_schedule_targets_schedule; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_settlement_schedule_targets_schedule ON public.settlement_schedule_targets USING btree (schedule_id);


--
-- TOC entry 4787 (class 1259 OID 28355)
-- Name: idx_shipment_evidences_shipment; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipment_evidences_shipment ON public.shipment_evidences USING btree (shipment_id);


--
-- TOC entry 4784 (class 1259 OID 28311)
-- Name: idx_shipment_sims_barcode; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipment_sims_barcode ON public.shipment_sims USING btree (barcode);


--
-- TOC entry 4676 (class 1259 OID 25713)
-- Name: idx_shipments_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_company ON public.shipments USING btree (company_id);


--
-- TOC entry 4677 (class 1259 OID 25714)
-- Name: idx_shipments_courier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_courier ON public.shipments USING btree (courier_id);


--
-- TOC entry 4678 (class 1259 OID 28142)
-- Name: idx_shipments_delivered_by_courier; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_delivered_by_courier ON public.shipments USING btree (delivered_by_courier_id);


--
-- TOC entry 4679 (class 1259 OID 25715)
-- Name: idx_shipments_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_shipments_status ON public.shipments USING btree (status);


--
-- TOC entry 4885 (class 1259 OID 30632)
-- Name: password_reset_requests_one_pending_per_profile; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX password_reset_requests_one_pending_per_profile ON public.password_reset_requests USING btree (profile_id) WHERE (status = 'pending'::text);


--
-- TOC entry 4650 (class 1259 OID 30576)
-- Name: profiles_recovery_email_lower_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX profiles_recovery_email_lower_unique ON public.profiles USING btree (lower(recovery_email)) WHERE (recovery_email IS NOT NULL);


--
-- TOC entry 4651 (class 1259 OID 30575)
-- Name: profiles_username_lower_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX profiles_username_lower_unique ON public.profiles USING btree (lower(username)) WHERE (username IS NOT NULL);


--
-- TOC entry 4869 (class 1259 OID 30550)
-- Name: settlement_adjustments_period_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX settlement_adjustments_period_idx ON public.settlement_adjustments USING btree (period_id, created_at DESC);


--
-- TOC entry 4774 (class 1259 OID 30499)
-- Name: settlement_period_items_financial_record_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settlement_period_items_financial_record_idx ON public.settlement_period_items USING btree (financial_record_id) WHERE (financial_record_id IS NOT NULL);


--
-- TOC entry 4775 (class 1259 OID 30500)
-- Name: settlement_period_items_period_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX settlement_period_items_period_idx ON public.settlement_period_items USING btree (period_id, excluded);


--
-- TOC entry 4767 (class 1259 OID 30498)
-- Name: settlement_periods_party_open_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX settlement_periods_party_open_idx ON public.settlement_periods USING btree (party_type, party_id, status, starts_at DESC);


--
-- TOC entry 4761 (class 1259 OID 30497)
-- Name: settlement_schedules_default_party_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settlement_schedules_default_party_idx ON public.settlement_schedules USING btree (party_type) WHERE ((party_id IS NULL) AND active);


--
-- TOC entry 4764 (class 1259 OID 30496)
-- Name: settlement_schedules_specific_party_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX settlement_schedules_specific_party_idx ON public.settlement_schedules USING btree (party_type, party_id) WHERE ((party_id IS NOT NULL) AND active);


--
-- TOC entry 4800 (class 1259 OID 29644)
-- Name: shipment_attachments_shipment_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_attachments_shipment_created_at_idx ON public.shipment_attachments USING btree (shipment_id, created_at DESC);


--
-- TOC entry 4801 (class 1259 OID 29645)
-- Name: shipment_attachments_shipment_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_attachments_shipment_deleted_at_idx ON public.shipment_attachments USING btree (shipment_id, deleted_at, created_at DESC);


--
-- TOC entry 4830 (class 1259 OID 29871)
-- Name: shipment_customer_location_requests_shipment_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_customer_location_requests_shipment_idx ON public.shipment_customer_location_requests USING btree (shipment_id, used_at);


--
-- TOC entry 4868 (class 1259 OID 30458)
-- Name: shipment_delivery_financial_amount_changes_record_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_delivery_financial_amount_changes_record_idx ON public.shipment_delivery_financial_amount_changes USING btree (financial_record_id, changed_at DESC);


--
-- TOC entry 4859 (class 1259 OID 30420)
-- Name: shipment_delivery_financial_records_company_occurred_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_delivery_financial_records_company_occurred_idx ON public.shipment_delivery_financial_records USING btree (company_id, occurred_at DESC);


--
-- TOC entry 4860 (class 1259 OID 30421)
-- Name: shipment_delivery_financial_records_courier_occurred_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_delivery_financial_records_courier_occurred_idx ON public.shipment_delivery_financial_records USING btree (courier_id, occurred_at DESC);


--
-- TOC entry 4861 (class 1259 OID 30511)
-- Name: shipment_delivery_financial_records_event_record_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX shipment_delivery_financial_records_event_record_idx ON public.shipment_delivery_financial_records USING btree (event_id, record_type);


--
-- TOC entry 4864 (class 1259 OID 30478)
-- Name: shipment_delivery_financial_records_shipment_occurred_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_delivery_financial_records_shipment_occurred_idx ON public.shipment_delivery_financial_records USING btree (shipment_id, occurred_at DESC);


--
-- TOC entry 4865 (class 1259 OID 30422)
-- Name: shipment_delivery_financial_records_status_occurred_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_delivery_financial_records_status_occurred_idx ON public.shipment_delivery_financial_records USING btree (status, occurred_at DESC);


--
-- TOC entry 4790 (class 1259 OID 29598)
-- Name: shipment_evidences_shipment_deleted_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX shipment_evidences_shipment_deleted_at_idx ON public.shipment_evidences USING btree (shipment_id, deleted_at, created_at DESC);


--
-- TOC entry 4797 (class 1259 OID 29502)
-- Name: tracking_record_history_record_changed_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tracking_record_history_record_changed_at_idx ON public.tracking_record_history USING btree (tracking_record_id, changed_at DESC);


--
-- TOC entry 4791 (class 1259 OID 29470)
-- Name: tracking_records_company_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tracking_records_company_created_at_idx ON public.tracking_records USING btree (company_id, created_at DESC);


--
-- TOC entry 4794 (class 1259 OID 29471)
-- Name: tracking_records_province_created_at_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX tracking_records_province_created_at_idx ON public.tracking_records USING btree (province_id, created_at DESC);


--
-- TOC entry 4893 (class 1259 OID 30658)
-- Name: user_notifications_recipient_unread_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_notifications_recipient_unread_idx ON public.user_notifications USING btree (recipient_profile_id, created_at DESC) WHERE (read_at IS NULL);


--
-- TOC entry 4755 (class 1259 OID 28034)
-- Name: ux_courier_delivery_rates_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_courier_delivery_rates_unique ON public.courier_delivery_rates USING btree (courier_id, route_id, COALESCE(province_id, (0)::bigint), COALESCE(canton_id, (0)::bigint), COALESCE(district_id, (0)::bigint), COALESCE(neighborhood_id, (0)::bigint));


--
-- TOC entry 4760 (class 1259 OID 27976)
-- Name: ux_delivery_rates_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_delivery_rates_unique ON public.delivery_rates USING btree (company_id, route_id, COALESCE(province_id, (0)::bigint), COALESCE(canton_id, (0)::bigint), COALESCE(district_id, (0)::bigint), COALESCE(neighborhood_id, (0)::bigint));


--
-- TOC entry 4783 (class 1259 OID 28291)
-- Name: ux_schedule_target_company; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX ux_schedule_target_company ON public.settlement_schedule_targets USING btree (schedule_id, company_id) WHERE (company_id IS NOT NULL);


--
-- TOC entry 4608 (class 1259 OID 17540)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 4641 (class 1259 OID 17541)
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4833 (class 1259 OID 30025)
-- Name: messages_2026_09_28_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_28_inserted_at_topic_idx ON realtime.messages_2026_09_28 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4836 (class 1259 OID 30060)
-- Name: messages_2026_09_29_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_29_inserted_at_topic_idx ON realtime.messages_2026_09_29 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4846 (class 1259 OID 30183)
-- Name: messages_2026_09_30_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_09_30_inserted_at_topic_idx ON realtime.messages_2026_09_30 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4849 (class 1259 OID 30201)
-- Name: messages_2026_10_01_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_10_01_inserted_at_topic_idx ON realtime.messages_2026_10_01 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4854 (class 1259 OID 30275)
-- Name: messages_2026_10_02_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_10_02_inserted_at_topic_idx ON realtime.messages_2026_10_02 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4872 (class 1259 OID 30570)
-- Name: messages_2026_10_03_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_10_03_inserted_at_topic_idx ON realtime.messages_2026_10_03 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4896 (class 1259 OID 30703)
-- Name: messages_2026_10_04_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_10_04_inserted_at_topic_idx ON realtime.messages_2026_10_04 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4611 (class 1259 OID 27589)
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- TOC entry 4616 (class 1259 OID 17225)
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 4635 (class 1259 OID 17383)
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4628 (class 1259 OID 17309)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 4619 (class 1259 OID 17274)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 4620 (class 1259 OID 17390)
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- TOC entry 4621 (class 1259 OID 29412)
-- Name: idx_objects_current_version; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_objects_current_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (archived_at IS NULL);


--
-- TOC entry 4622 (class 1259 OID 29916)
-- Name: idx_objects_delete_markers; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_delete_markers ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE is_delete_marker;


--
-- TOC entry 4623 (class 1259 OID 29413)
-- Name: idx_objects_null_version; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_objects_null_version ON storage.objects USING btree (bucket_id, name COLLATE "C") WHERE (NOT is_versioned);


--
-- TOC entry 4624 (class 1259 OID 17243)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 4625 (class 1259 OID 29411)
-- Name: objects_bucket_id_name_version_key; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_name_version_key ON storage.objects USING btree (bucket_id, name COLLATE "C", version) NULLS NOT DISTINCT;


--
-- TOC entry 4638 (class 1259 OID 17374)
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- TOC entry 4899 (class 0 OID 0)
-- Name: messages_2026_09_28_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_28_inserted_at_topic_idx;


--
-- TOC entry 4900 (class 0 OID 0)
-- Name: messages_2026_09_28_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_28_pkey;


--
-- TOC entry 4901 (class 0 OID 0)
-- Name: messages_2026_09_29_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_29_inserted_at_topic_idx;


--
-- TOC entry 4902 (class 0 OID 0)
-- Name: messages_2026_09_29_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_29_pkey;


--
-- TOC entry 4903 (class 0 OID 0)
-- Name: messages_2026_09_30_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_09_30_inserted_at_topic_idx;


--
-- TOC entry 4904 (class 0 OID 0)
-- Name: messages_2026_09_30_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_09_30_pkey;


--
-- TOC entry 4905 (class 0 OID 0)
-- Name: messages_2026_10_01_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_10_01_inserted_at_topic_idx;


--
-- TOC entry 4906 (class 0 OID 0)
-- Name: messages_2026_10_01_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_10_01_pkey;


--
-- TOC entry 4907 (class 0 OID 0)
-- Name: messages_2026_10_02_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_10_02_inserted_at_topic_idx;


--
-- TOC entry 4908 (class 0 OID 0)
-- Name: messages_2026_10_02_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_10_02_pkey;


--
-- TOC entry 4909 (class 0 OID 0)
-- Name: messages_2026_10_03_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_10_03_inserted_at_topic_idx;


--
-- TOC entry 4910 (class 0 OID 0)
-- Name: messages_2026_10_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_10_03_pkey;


--
-- TOC entry 4911 (class 0 OID 0)
-- Name: messages_2026_10_04_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_10_04_inserted_at_topic_idx;


--
-- TOC entry 4912 (class 0 OID 0)
-- Name: messages_2026_10_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_10_04_pkey;


--
-- TOC entry 5068 (class 2620 OID 30551)
-- Name: shipment_delivery_financial_records assign_financial_record_to_settlement; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER assign_financial_record_to_settlement AFTER INSERT ON public.shipment_delivery_financial_records FOR EACH ROW EXECUTE FUNCTION public.trigger_assign_financial_record_to_settlement();


--
-- TOC entry 5067 (class 2620 OID 30360)
-- Name: chat_messages chat_messages_add_support_participant; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER chat_messages_add_support_participant AFTER INSERT ON public.chat_messages FOR EACH ROW EXECUTE FUNCTION public.add_support_participant();


--
-- TOC entry 5065 (class 2620 OID 29475)
-- Name: tracking_records enforce_tracking_record_permissions; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER enforce_tracking_record_permissions BEFORE INSERT OR UPDATE ON public.tracking_records FOR EACH ROW EXECUTE FUNCTION public.enforce_tracking_record_permissions();


--
-- TOC entry 5060 (class 2620 OID 25719)
-- Name: inventory inventory_updated_at_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER inventory_updated_at_trigger BEFORE UPDATE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 5066 (class 2620 OID 29505)
-- Name: tracking_records log_tracking_record_changes; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER log_tracking_record_changes AFTER UPDATE ON public.tracking_records FOR EACH ROW EXECUTE FUNCTION public.log_tracking_record_changes();


--
-- TOC entry 5061 (class 2620 OID 30557)
-- Name: shipments record_shipment_creation_history; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER record_shipment_creation_history AFTER INSERT ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.record_shipment_creation_history();


--
-- TOC entry 5062 (class 2620 OID 27519)
-- Name: shipments shipment_before_insert_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER shipment_before_insert_trigger BEFORE INSERT ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.shipment_before_insert();


--
-- TOC entry 5059 (class 2620 OID 29946)
-- Name: profiles sync_courier_profile_availability; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER sync_courier_profile_availability AFTER UPDATE OF active, can_deliver ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.sync_courier_profile_availability();


--
-- TOC entry 5064 (class 2620 OID 27771)
-- Name: shipment_contact_methods trg_shipment_contact_search_text; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_shipment_contact_search_text AFTER INSERT OR DELETE OR UPDATE ON public.shipment_contact_methods FOR EACH ROW EXECUTE FUNCTION public.shipment_contact_search_text_trigger();


--
-- TOC entry 5063 (class 2620 OID 27772)
-- Name: shipments trg_shipments_search_text; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_shipments_search_text BEFORE INSERT OR UPDATE ON public.shipments FOR EACH ROW EXECUTE FUNCTION public.shipment_search_text_trigger();


--
-- TOC entry 5051 (class 2620 OID 17206)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 5052 (class 2620 OID 17328)
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- TOC entry 5053 (class 2620 OID 29904)
-- Name: buckets protect_bucket_control_insert; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_bucket_control_insert BEFORE INSERT ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns('service_role');


--
-- TOC entry 5054 (class 2620 OID 29905)
-- Name: buckets protect_bucket_control_update; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_bucket_control_update BEFORE UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.protect_bucket_control_columns();


--
-- TOC entry 5055 (class 2620 OID 29906)
-- Name: buckets protect_bucket_control_update_role; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_bucket_control_update_role AFTER UPDATE OF lifecycle_configuration, lifecycle_configuration_generation ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_lifecycle_service_role('service_role');


--
-- TOC entry 5056 (class 2620 OID 17392)
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- TOC entry 5057 (class 2620 OID 17393)
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- TOC entry 5058 (class 2620 OID 17262)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 4914 (class 2606 OID 16693)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4919 (class 2606 OID 16783)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4918 (class 2606 OID 16771)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 4917 (class 2606 OID 16758)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5017 (class 2606 OID 29725)
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_mfa_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_mfa_factor_id_fkey FOREIGN KEY (mfa_factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 5018 (class 2606 OID 29720)
-- Name: mfa_recovery_code_sets mfa_recovery_code_sets_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_code_sets
    ADD CONSTRAINT mfa_recovery_code_sets_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5019 (class 2606 OID 29738)
-- Name: mfa_recovery_codes mfa_recovery_codes_mfa_recovery_code_set_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_recovery_codes
    ADD CONSTRAINT mfa_recovery_codes_mfa_recovery_code_set_id_fkey FOREIGN KEY (mfa_recovery_code_set_id) REFERENCES auth.mfa_recovery_code_sets(id) ON DELETE CASCADE;


--
-- TOC entry 4925 (class 2606 OID 17023)
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4926 (class 2606 OID 17028)
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4927 (class 2606 OID 17052)
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4928 (class 2606 OID 17047)
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4924 (class 2606 OID 16949)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4913 (class 2606 OID 16726)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4921 (class 2606 OID 16830)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4922 (class 2606 OID 16903)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 4923 (class 2606 OID 16844)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5016 (class 2606 OID 29697)
-- Name: scim_tokens scim_tokens_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_tokens
    ADD CONSTRAINT scim_tokens_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5014 (class 2606 OID 29667)
-- Name: scim_users scim_users_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 5015 (class 2606 OID 29672)
-- Name: scim_users scim_users_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.scim_users
    ADD CONSTRAINT scim_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- TOC entry 4915 (class 2606 OID 17066)
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4916 (class 2606 OID 16721)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4920 (class 2606 OID 16811)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4930 (class 2606 OID 17159)
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4929 (class 2606 OID 17142)
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 5045 (class 2606 OID 30588)
-- Name: account_email_verifications account_email_verifications_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_email_verifications
    ADD CONSTRAINT account_email_verifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 5046 (class 2606 OID 30605)
-- Name: account_password_reset_tokens account_password_reset_tokens_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.account_password_reset_tokens
    ADD CONSTRAINT account_password_reset_tokens_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4969 (class 2606 OID 27207)
-- Name: admin_users admin_users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_users
    ADD CONSTRAINT admin_users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4959 (class 2606 OID 25814)
-- Name: cantons cantons_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cantons
    ADD CONSTRAINT cantons_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id) ON DELETE CASCADE;


--
-- TOC entry 5030 (class 2606 OID 30221)
-- Name: chat_conversation_participants chat_conversation_participants_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversation_participants
    ADD CONSTRAINT chat_conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5031 (class 2606 OID 30226)
-- Name: chat_conversation_participants chat_conversation_participants_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversation_participants
    ADD CONSTRAINT chat_conversation_participants_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 5022 (class 2606 OID 30080)
-- Name: chat_conversations chat_conversations_client_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_client_company_id_fkey FOREIGN KEY (client_company_id) REFERENCES public.companies(id);


--
-- TOC entry 5023 (class 2606 OID 30075)
-- Name: chat_conversations chat_conversations_owner_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_owner_company_id_fkey FOREIGN KEY (owner_company_id) REFERENCES public.companies(id);


--
-- TOC entry 5024 (class 2606 OID 30085)
-- Name: chat_conversations chat_conversations_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE SET NULL;


--
-- TOC entry 5032 (class 2606 OID 30308)
-- Name: chat_message_audit chat_message_audit_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_audit
    ADD CONSTRAINT chat_message_audit_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.profiles(id);


--
-- TOC entry 5033 (class 2606 OID 30303)
-- Name: chat_message_audit chat_message_audit_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_audit
    ADD CONSTRAINT chat_message_audit_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;


--
-- TOC entry 5028 (class 2606 OID 30117)
-- Name: chat_message_reads chat_message_reads_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_reads
    ADD CONSTRAINT chat_message_reads_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;


--
-- TOC entry 5029 (class 2606 OID 30122)
-- Name: chat_message_reads chat_message_reads_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_message_reads
    ADD CONSTRAINT chat_message_reads_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 5025 (class 2606 OID 30106)
-- Name: chat_messages chat_messages_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id);


--
-- TOC entry 5026 (class 2606 OID 30101)
-- Name: chat_messages chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.chat_conversations(id) ON DELETE CASCADE;


--
-- TOC entry 5027 (class 2606 OID 30288)
-- Name: chat_messages chat_messages_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.profiles(id);


--
-- TOC entry 4967 (class 2606 OID 27098)
-- Name: company_contacts company_contacts_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_contacts
    ADD CONSTRAINT company_contacts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4968 (class 2606 OID 27103)
-- Name: company_contacts company_contacts_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_contacts
    ADD CONSTRAINT company_contacts_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 4976 (class 2606 OID 27387)
-- Name: company_products company_products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_products
    ADD CONSTRAINT company_products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;


--
-- TOC entry 4977 (class 2606 OID 27392)
-- Name: company_products company_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_products
    ADD CONSTRAINT company_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4966 (class 2606 OID 27079)
-- Name: contact_methods contact_methods_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.contact_methods
    ADD CONSTRAINT contact_methods_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE CASCADE;


--
-- TOC entry 4941 (class 2606 OID 25546)
-- Name: courier_routes courier_routes_courier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_routes
    ADD CONSTRAINT courier_routes_courier_id_fkey FOREIGN KEY (courier_id) REFERENCES public.couriers(id) ON DELETE CASCADE;


--
-- TOC entry 4942 (class 2606 OID 25551)
-- Name: courier_routes courier_routes_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_routes
    ADD CONSTRAINT courier_routes_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 4939 (class 2606 OID 25491)
-- Name: couriers couriers_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.couriers
    ADD CONSTRAINT couriers_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id);


--
-- TOC entry 4985 (class 2606 OID 27922)
-- Name: delivery_rates delivery_rates_canton_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_rates
    ADD CONSTRAINT delivery_rates_canton_id_fkey1 FOREIGN KEY (canton_id) REFERENCES public.cantons(id);


--
-- TOC entry 4986 (class 2606 OID 27927)
-- Name: delivery_rates delivery_rates_district_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_rates
    ADD CONSTRAINT delivery_rates_district_id_fkey1 FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- TOC entry 4987 (class 2606 OID 27932)
-- Name: delivery_rates delivery_rates_neighborhood_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_rates
    ADD CONSTRAINT delivery_rates_neighborhood_id_fkey1 FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id);


--
-- TOC entry 4988 (class 2606 OID 27917)
-- Name: delivery_rates delivery_rates_province_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_rates
    ADD CONSTRAINT delivery_rates_province_id_fkey1 FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 4989 (class 2606 OID 27912)
-- Name: delivery_rates delivery_rates_route_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_rates
    ADD CONSTRAINT delivery_rates_route_id_fkey1 FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 4960 (class 2606 OID 25831)
-- Name: districts districts_canton_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT districts_canton_id_fkey FOREIGN KEY (canton_id) REFERENCES public.cantons(id) ON DELETE CASCADE;


--
-- TOC entry 4979 (class 2606 OID 28014)
-- Name: courier_delivery_rates fk_courier_delivery_rates_canton; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_delivery_rates
    ADD CONSTRAINT fk_courier_delivery_rates_canton FOREIGN KEY (canton_id) REFERENCES public.cantons(id);


--
-- TOC entry 4980 (class 2606 OID 27999)
-- Name: courier_delivery_rates fk_courier_delivery_rates_courier; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_delivery_rates
    ADD CONSTRAINT fk_courier_delivery_rates_courier FOREIGN KEY (courier_id) REFERENCES public.couriers(id);


--
-- TOC entry 4981 (class 2606 OID 28019)
-- Name: courier_delivery_rates fk_courier_delivery_rates_district; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_delivery_rates
    ADD CONSTRAINT fk_courier_delivery_rates_district FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- TOC entry 4982 (class 2606 OID 28024)
-- Name: courier_delivery_rates fk_courier_delivery_rates_neighborhood; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_delivery_rates
    ADD CONSTRAINT fk_courier_delivery_rates_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id);


--
-- TOC entry 4983 (class 2606 OID 28009)
-- Name: courier_delivery_rates fk_courier_delivery_rates_province; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_delivery_rates
    ADD CONSTRAINT fk_courier_delivery_rates_province FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 4984 (class 2606 OID 29999)
-- Name: courier_delivery_rates fk_courier_delivery_rates_route; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courier_delivery_rates
    ADD CONSTRAINT fk_courier_delivery_rates_route FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 4990 (class 2606 OID 27969)
-- Name: delivery_rates fk_delivery_rates_company; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.delivery_rates
    ADD CONSTRAINT fk_delivery_rates_company FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4943 (class 2606 OID 25588)
-- Name: inventory inventory_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4944 (class 2606 OID 25583)
-- Name: inventory inventory_courier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_courier_id_fkey FOREIGN KEY (courier_id) REFERENCES public.couriers(id);


--
-- TOC entry 4946 (class 2606 OID 27455)
-- Name: inventory_movements inventory_movements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 4947 (class 2606 OID 25607)
-- Name: inventory_movements inventory_movements_inventory_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_inventory_id_fkey FOREIGN KEY (inventory_id) REFERENCES public.inventory(id);


--
-- TOC entry 4948 (class 2606 OID 27460)
-- Name: inventory_movements inventory_movements_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);


--
-- TOC entry 4945 (class 2606 OID 25593)
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4961 (class 2606 OID 25848)
-- Name: neighborhoods neighborhoods_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.neighborhoods
    ADD CONSTRAINT neighborhoods_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id) ON DELETE CASCADE;


--
-- TOC entry 5047 (class 2606 OID 30622)
-- Name: password_reset_requests password_reset_requests_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_requests
    ADD CONSTRAINT password_reset_requests_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 5048 (class 2606 OID 30627)
-- Name: password_reset_requests password_reset_requests_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_requests
    ADD CONSTRAINT password_reset_requests_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4972 (class 2606 OID 27273)
-- Name: password_resets password_resets_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 4973 (class 2606 OID 27268)
-- Name: password_resets password_resets_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4970 (class 2606 OID 27252)
-- Name: profile_permissions profile_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_permissions
    ADD CONSTRAINT profile_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE;


--
-- TOC entry 4971 (class 2606 OID 27247)
-- Name: profile_permissions profile_permissions_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_permissions
    ADD CONSTRAINT profile_permissions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 25477)
-- Name: profiles profiles_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4937 (class 2606 OID 27278)
-- Name: profiles profiles_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 4938 (class 2606 OID 25472)
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4962 (class 2606 OID 25963)
-- Name: route_coverage route_coverage_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_coverage
    ADD CONSTRAINT route_coverage_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id);


--
-- TOC entry 4963 (class 2606 OID 25958)
-- Name: route_coverage route_coverage_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_coverage
    ADD CONSTRAINT route_coverage_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 4964 (class 2606 OID 26374)
-- Name: route_district_delivery_times route_district_delivery_times_district_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_district_delivery_times
    ADD CONSTRAINT route_district_delivery_times_district_fk FOREIGN KEY (district_id) REFERENCES public.districts(id) ON DELETE CASCADE;


--
-- TOC entry 4965 (class 2606 OID 26369)
-- Name: route_district_delivery_times route_district_delivery_times_route_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_district_delivery_times
    ADD CONSTRAINT route_district_delivery_times_route_fk FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 4940 (class 2606 OID 25533)
-- Name: route_visit_days route_visit_days_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.route_visit_days
    ADD CONSTRAINT route_visit_days_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE;


--
-- TOC entry 5043 (class 2606 OID 30545)
-- Name: settlement_adjustments settlement_adjustments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_adjustments
    ADD CONSTRAINT settlement_adjustments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5044 (class 2606 OID 30540)
-- Name: settlement_adjustments settlement_adjustments_period_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_adjustments
    ADD CONSTRAINT settlement_adjustments_period_id_fkey FOREIGN KEY (period_id) REFERENCES public.settlement_periods(id) ON DELETE RESTRICT;


--
-- TOC entry 4992 (class 2606 OID 28224)
-- Name: settlement_period_items settlement_period_items_company_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_period_items
    ADD CONSTRAINT settlement_period_items_company_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4993 (class 2606 OID 28229)
-- Name: settlement_period_items settlement_period_items_courier_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_period_items
    ADD CONSTRAINT settlement_period_items_courier_fkey FOREIGN KEY (courier_id) REFERENCES public.couriers(id);


--
-- TOC entry 4994 (class 2606 OID 28292)
-- Name: settlement_period_items settlement_period_items_modified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_period_items
    ADD CONSTRAINT settlement_period_items_modified_by_fkey FOREIGN KEY (modified_by) REFERENCES public.profiles(id);


--
-- TOC entry 4995 (class 2606 OID 28214)
-- Name: settlement_period_items settlement_period_items_period_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_period_items
    ADD CONSTRAINT settlement_period_items_period_fkey FOREIGN KEY (period_id) REFERENCES public.settlement_periods(id) ON DELETE CASCADE;


--
-- TOC entry 4996 (class 2606 OID 28219)
-- Name: settlement_period_items settlement_period_items_shipment_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_period_items
    ADD CONSTRAINT settlement_period_items_shipment_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);


--
-- TOC entry 4991 (class 2606 OID 28197)
-- Name: settlement_periods settlement_periods_schedule_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_periods
    ADD CONSTRAINT settlement_periods_schedule_fkey FOREIGN KEY (schedule_id) REFERENCES public.settlement_schedules(id) ON DELETE CASCADE;


--
-- TOC entry 4997 (class 2606 OID 28283)
-- Name: settlement_schedule_targets settlement_schedule_targets_company_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_schedule_targets
    ADD CONSTRAINT settlement_schedule_targets_company_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4998 (class 2606 OID 28278)
-- Name: settlement_schedule_targets settlement_schedule_targets_courier_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_schedule_targets
    ADD CONSTRAINT settlement_schedule_targets_courier_fkey FOREIGN KEY (courier_id) REFERENCES public.couriers(id);


--
-- TOC entry 4999 (class 2606 OID 28273)
-- Name: settlement_schedule_targets settlement_schedule_targets_schedule_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settlement_schedule_targets
    ADD CONSTRAINT settlement_schedule_targets_schedule_fkey FOREIGN KEY (schedule_id) REFERENCES public.settlement_schedules(id) ON DELETE CASCADE;


--
-- TOC entry 5010 (class 2606 OID 29629)
-- Name: shipment_attachments shipment_attachments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_attachments
    ADD CONSTRAINT shipment_attachments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE RESTRICT;


--
-- TOC entry 5011 (class 2606 OID 29634)
-- Name: shipment_attachments shipment_attachments_created_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_attachments
    ADD CONSTRAINT shipment_attachments_created_company_id_fkey FOREIGN KEY (created_company_id) REFERENCES public.companies(id) ON DELETE RESTRICT;


--
-- TOC entry 5012 (class 2606 OID 29639)
-- Name: shipment_attachments shipment_attachments_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_attachments
    ADD CONSTRAINT shipment_attachments_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5013 (class 2606 OID 29624)
-- Name: shipment_attachments shipment_attachments_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_attachments
    ADD CONSTRAINT shipment_attachments_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- TOC entry 4978 (class 2606 OID 27563)
-- Name: shipment_contact_methods shipment_contact_methods_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_contact_methods
    ADD CONSTRAINT shipment_contact_methods_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- TOC entry 5020 (class 2606 OID 29866)
-- Name: shipment_customer_location_requests shipment_customer_location_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_customer_location_requests
    ADD CONSTRAINT shipment_customer_location_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- TOC entry 5021 (class 2606 OID 29861)
-- Name: shipment_customer_location_requests shipment_customer_location_requests_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_customer_location_requests
    ADD CONSTRAINT shipment_customer_location_requests_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- TOC entry 5041 (class 2606 OID 30448)
-- Name: shipment_delivery_financial_amount_changes shipment_delivery_financial_amount_cha_financial_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_amount_changes
    ADD CONSTRAINT shipment_delivery_financial_amount_cha_financial_record_id_fkey FOREIGN KEY (financial_record_id) REFERENCES public.shipment_delivery_financial_records(id) ON DELETE RESTRICT;


--
-- TOC entry 5042 (class 2606 OID 30453)
-- Name: shipment_delivery_financial_amount_changes shipment_delivery_financial_amount_changes_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_amount_changes
    ADD CONSTRAINT shipment_delivery_financial_amount_changes_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5034 (class 2606 OID 30410)
-- Name: shipment_delivery_financial_records shipment_delivery_financial_recor_courier_delivery_rate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_records
    ADD CONSTRAINT shipment_delivery_financial_recor_courier_delivery_rate_id_fkey FOREIGN KEY (courier_delivery_rate_id) REFERENCES public.courier_delivery_rates(id) ON DELETE SET NULL;


--
-- TOC entry 5035 (class 2606 OID 30390)
-- Name: shipment_delivery_financial_records shipment_delivery_financial_records_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_records
    ADD CONSTRAINT shipment_delivery_financial_records_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;


--
-- TOC entry 5036 (class 2606 OID 30395)
-- Name: shipment_delivery_financial_records shipment_delivery_financial_records_courier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_records
    ADD CONSTRAINT shipment_delivery_financial_records_courier_id_fkey FOREIGN KEY (courier_id) REFERENCES public.couriers(id) ON DELETE SET NULL;


--
-- TOC entry 5037 (class 2606 OID 30415)
-- Name: shipment_delivery_financial_records shipment_delivery_financial_records_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_records
    ADD CONSTRAINT shipment_delivery_financial_records_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5038 (class 2606 OID 30405)
-- Name: shipment_delivery_financial_records shipment_delivery_financial_records_delivery_rate_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_records
    ADD CONSTRAINT shipment_delivery_financial_records_delivery_rate_id_fkey FOREIGN KEY (delivery_rate_id) REFERENCES public.delivery_rates(id) ON DELETE SET NULL;


--
-- TOC entry 5039 (class 2606 OID 30400)
-- Name: shipment_delivery_financial_records shipment_delivery_financial_records_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_records
    ADD CONSTRAINT shipment_delivery_financial_records_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE SET NULL;


--
-- TOC entry 5040 (class 2606 OID 30385)
-- Name: shipment_delivery_financial_records shipment_delivery_financial_records_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_delivery_financial_records
    ADD CONSTRAINT shipment_delivery_financial_records_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE RESTRICT;


--
-- TOC entry 5001 (class 2606 OID 28350)
-- Name: shipment_evidences shipment_evidences_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_evidences
    ADD CONSTRAINT shipment_evidences_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 5002 (class 2606 OID 28390)
-- Name: shipment_evidences shipment_evidences_created_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_evidences
    ADD CONSTRAINT shipment_evidences_created_company_id_fkey FOREIGN KEY (created_company_id) REFERENCES public.companies(id);


--
-- TOC entry 5003 (class 2606 OID 29593)
-- Name: shipment_evidences shipment_evidences_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_evidences
    ADD CONSTRAINT shipment_evidences_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5004 (class 2606 OID 28345)
-- Name: shipment_evidences shipment_evidences_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_evidences
    ADD CONSTRAINT shipment_evidences_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- TOC entry 5005 (class 2606 OID 28372)
-- Name: shipment_evidences shipment_evidences_validated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_evidences
    ADD CONSTRAINT shipment_evidences_validated_by_fkey FOREIGN KEY (validated_by) REFERENCES public.profiles(id);


--
-- TOC entry 4957 (class 2606 OID 25654)
-- Name: shipment_items shipment_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_items
    ADD CONSTRAINT shipment_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4958 (class 2606 OID 25649)
-- Name: shipment_items shipment_items_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_items
    ADD CONSTRAINT shipment_items_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- TOC entry 5000 (class 2606 OID 28306)
-- Name: shipment_sims shipment_sims_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_sims
    ADD CONSTRAINT shipment_sims_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id);


--
-- TOC entry 4974 (class 2606 OID 27375)
-- Name: shipment_status_history shipment_status_history_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_status_history
    ADD CONSTRAINT shipment_status_history_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 4975 (class 2606 OID 27370)
-- Name: shipment_status_history shipment_status_history_shipment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipment_status_history
    ADD CONSTRAINT shipment_status_history_shipment_id_fkey FOREIGN KEY (shipment_id) REFERENCES public.shipments(id) ON DELETE CASCADE;


--
-- TOC entry 4949 (class 2606 OID 25624)
-- Name: shipments shipments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 4950 (class 2606 OID 25629)
-- Name: shipments shipments_courier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_courier_id_fkey FOREIGN KEY (courier_id) REFERENCES public.couriers(id);


--
-- TOC entry 4951 (class 2606 OID 27147)
-- Name: shipments shipments_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id);


--
-- TOC entry 4952 (class 2606 OID 27548)
-- Name: shipments shipments_customer_identification_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_customer_identification_type_id_fkey FOREIGN KEY (customer_identification_type_id) REFERENCES public.identification_types(id);


--
-- TOC entry 4953 (class 2606 OID 28137)
-- Name: shipments shipments_delivered_by_courier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_delivered_by_courier_id_fkey FOREIGN KEY (delivered_by_courier_id) REFERENCES public.couriers(id);


--
-- TOC entry 4954 (class 2606 OID 27152)
-- Name: shipments shipments_district_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_district_id_fkey FOREIGN KEY (district_id) REFERENCES public.districts(id);


--
-- TOC entry 4955 (class 2606 OID 27157)
-- Name: shipments shipments_neighborhood_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_neighborhood_id_fkey FOREIGN KEY (neighborhood_id) REFERENCES public.neighborhoods(id);


--
-- TOC entry 4956 (class 2606 OID 29969)
-- Name: shipments shipments_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.shipments
    ADD CONSTRAINT shipments_route_id_fkey FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE SET NULL;


--
-- TOC entry 5050 (class 2606 OID 30670)
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5008 (class 2606 OID 29497)
-- Name: tracking_record_history tracking_record_history_changed_by_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_record_history
    ADD CONSTRAINT tracking_record_history_changed_by_profile_id_fkey FOREIGN KEY (changed_by_profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 5009 (class 2606 OID 29492)
-- Name: tracking_record_history tracking_record_history_tracking_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_record_history
    ADD CONSTRAINT tracking_record_history_tracking_record_id_fkey FOREIGN KEY (tracking_record_id) REFERENCES public.tracking_records(id) ON DELETE CASCADE;


--
-- TOC entry 5006 (class 2606 OID 29460)
-- Name: tracking_records tracking_records_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_records
    ADD CONSTRAINT tracking_records_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- TOC entry 5007 (class 2606 OID 29465)
-- Name: tracking_records tracking_records_province_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tracking_records
    ADD CONSTRAINT tracking_records_province_id_fkey FOREIGN KEY (province_id) REFERENCES public.provinces(id);


--
-- TOC entry 5049 (class 2606 OID 30653)
-- Name: user_notifications user_notifications_recipient_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_notifications
    ADD CONSTRAINT user_notifications_recipient_profile_id_fkey FOREIGN KEY (recipient_profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4931 (class 2606 OID 17237)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4932 (class 2606 OID 17284)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4933 (class 2606 OID 17304)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4934 (class 2606 OID 17299)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 4935 (class 2606 OID 17369)
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- TOC entry 5220 (class 0 OID 16529)
-- Dependencies: 353
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5231 (class 0 OID 16889)
-- Dependencies: 366
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5222 (class 0 OID 16686)
-- Dependencies: 357
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5219 (class 0 OID 16522)
-- Dependencies: 352
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5226 (class 0 OID 16776)
-- Dependencies: 361
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5225 (class 0 OID 16764)
-- Dependencies: 360
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5224 (class 0 OID 16751)
-- Dependencies: 359
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5232 (class 0 OID 16939)
-- Dependencies: 367
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5218 (class 0 OID 16511)
-- Dependencies: 351
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5229 (class 0 OID 16818)
-- Dependencies: 364
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5230 (class 0 OID 16836)
-- Dependencies: 365
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5221 (class 0 OID 16537)
-- Dependencies: 354
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5223 (class 0 OID 16716)
-- Dependencies: 358
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5228 (class 0 OID 16803)
-- Dependencies: 363
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5227 (class 0 OID 16794)
-- Dependencies: 362
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5217 (class 0 OID 16499)
-- Dependencies: 349
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5261 (class 0 OID 30577)
-- Dependencies: 460
-- Name: account_email_verifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.account_email_verifications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5262 (class 0 OID 30594)
-- Dependencies: 461
-- Name: account_password_reset_tokens; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.account_password_reset_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5264 (class 0 OID 30633)
-- Dependencies: 463
-- Name: account_security_rate_limits; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.account_security_rate_limits ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5256 (class 0 OID 30215)
-- Dependencies: 453
-- Name: chat_conversation_participants; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_conversation_participants ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5253 (class 0 OID 30064)
-- Dependencies: 448
-- Name: chat_conversations; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5284 (class 3256 OID 30353)
-- Name: chat_conversations chat_conversations_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chat_conversations_access ON public.chat_conversations USING (public.can_access_chat(id)) WITH CHECK (public.can_access_chat(id));


--
-- TOC entry 5257 (class 0 OID 30293)
-- Dependencies: 455
-- Name: chat_message_audit; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_message_audit ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5289 (class 3256 OID 30363)
-- Name: chat_message_audit chat_message_audit_owner_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chat_message_audit_owner_access ON public.chat_message_audit FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ((public.chat_messages m
     JOIN public.chat_conversations c ON ((c.id = m.conversation_id)))
     JOIN public.profiles viewer ON ((viewer.id = auth.uid())))
  WHERE ((m.id = chat_message_audit.message_id) AND viewer.active AND (viewer.company_id = c.owner_company_id) AND (viewer.role = ANY (ARRAY['super_admin'::public.user_role, 'company_admin'::public.user_role]))))));


--
-- TOC entry 5255 (class 0 OID 30111)
-- Dependencies: 450
-- Name: chat_message_reads; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_message_reads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5254 (class 0 OID 30091)
-- Dependencies: 449
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5285 (class 3256 OID 30355)
-- Name: chat_messages chat_messages_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chat_messages_insert ON public.chat_messages FOR INSERT WITH CHECK (((author_id = auth.uid()) AND public.can_write_chat(conversation_id, template_key)));


--
-- TOC entry 5286 (class 3256 OID 30354)
-- Name: chat_messages chat_messages_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chat_messages_read ON public.chat_messages FOR SELECT USING (public.can_access_chat(conversation_id));


--
-- TOC entry 5288 (class 3256 OID 30361)
-- Name: chat_conversation_participants chat_participants_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chat_participants_access ON public.chat_conversation_participants FOR SELECT USING (public.can_access_chat(conversation_id));


--
-- TOC entry 5287 (class 3256 OID 30357)
-- Name: chat_message_reads chat_reads_access; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY chat_reads_access ON public.chat_message_reads USING (((profile_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM public.chat_messages m
  WHERE ((m.id = chat_message_reads.message_id) AND public.can_access_chat(m.conversation_id)))))) WITH CHECK ((profile_id = auth.uid()));


--
-- TOC entry 5242 (class 0 OID 25451)
-- Dependencies: 390
-- Name: companies; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5274 (class 3256 OID 30678)
-- Name: companies companies_insert_owner_admins; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY companies_insert_owner_admins ON public.companies FOR INSERT TO authenticated WITH CHECK ((public.is_owner_company_user() AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.active = true) AND (p.role = ANY (ARRAY['super_admin'::public.user_role, 'company_admin'::public.user_role])))))));


--
-- TOC entry 5273 (class 3256 OID 30689)
-- Name: companies companies_select_company_privacy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY companies_select_company_privacy ON public.companies FOR SELECT TO authenticated USING (((( SELECT profiles.role
   FROM public.profiles
  WHERE (profiles.id = auth.uid())) IS DISTINCT FROM 'courier'::public.user_role) AND (public.is_owner_company_user() OR (id = public.current_profile_company_id()))));


--
-- TOC entry 5272 (class 3256 OID 30676)
-- Name: companies companies_update_owner_admins; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY companies_update_owner_admins ON public.companies FOR UPDATE TO authenticated USING ((public.is_owner_company_user() AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.active = true) AND (p.role = ANY (ARRAY['super_admin'::public.user_role, 'company_admin'::public.user_role]))))))) WITH CHECK ((public.is_owner_company_user() AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = auth.uid()) AND (p.active = true) AND (p.role = ANY (ARRAY['super_admin'::public.user_role, 'company_admin'::public.user_role])))))));


--
-- TOC entry 5245 (class 0 OID 25538)
-- Dependencies: 396
-- Name: courier_routes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.courier_routes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5277 (class 3256 OID 29950)
-- Name: courier_routes courier_routes_read_assignments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY courier_routes_read_assignments ON public.courier_routes FOR SELECT TO authenticated USING (public.can_read_courier(courier_id));


--
-- TOC entry 5244 (class 0 OID 25482)
-- Dependencies: 392
-- Name: couriers; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.couriers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5276 (class 3256 OID 29949)
-- Name: couriers couriers_read_assignments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY couriers_read_assignments ON public.couriers FOR SELECT TO authenticated USING (public.can_read_courier(id));


--
-- TOC entry 5263 (class 0 OID 30611)
-- Dependencies: 462
-- Name: password_reset_requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5243 (class 0 OID 25463)
-- Dependencies: 391
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5275 (class 3256 OID 29811)
-- Name: profiles profiles_select_company_privacy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_select_company_privacy ON public.profiles FOR SELECT TO authenticated USING (((id = auth.uid()) OR public.is_owner_company_user() OR (company_id = public.current_profile_company_id())));


--
-- TOC entry 5260 (class 0 OID 30528)
-- Dependencies: 458
-- Name: settlement_adjustments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.settlement_adjustments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5248 (class 0 OID 28202)
-- Dependencies: 433
-- Name: settlement_period_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.settlement_period_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5247 (class 0 OID 28187)
-- Dependencies: 432
-- Name: settlement_periods; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.settlement_periods ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5246 (class 0 OID 28166)
-- Dependencies: 431
-- Name: settlement_schedules; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.settlement_schedules ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5251 (class 0 OID 29613)
-- Dependencies: 440
-- Name: shipment_attachments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.shipment_attachments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5282 (class 3256 OID 29647)
-- Name: shipment_attachments shipment_attachments_insert_own_user; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY shipment_attachments_insert_own_user ON public.shipment_attachments FOR INSERT TO authenticated WITH CHECK (((created_by = auth.uid()) AND (created_company_id = public.current_profile_company_id())));


--
-- TOC entry 5283 (class 3256 OID 29646)
-- Name: shipment_attachments shipment_attachments_select_by_company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY shipment_attachments_select_by_company ON public.shipment_attachments FOR SELECT TO authenticated USING ((public.is_owner_company_user() OR (created_company_id = public.current_profile_company_id())));


--
-- TOC entry 5252 (class 0 OID 29849)
-- Dependencies: 445
-- Name: shipment_customer_location_requests; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.shipment_customer_location_requests ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5259 (class 0 OID 30436)
-- Dependencies: 457
-- Name: shipment_delivery_financial_amount_changes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.shipment_delivery_financial_amount_changes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5258 (class 0 OID 30367)
-- Dependencies: 456
-- Name: shipment_delivery_financial_records; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.shipment_delivery_financial_records ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5266 (class 0 OID 30661)
-- Dependencies: 465
-- Name: system_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5292 (class 3256 OID 30683)
-- Name: system_settings system_settings_authenticated_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY system_settings_authenticated_read ON public.system_settings FOR SELECT TO authenticated USING (true);


--
-- TOC entry 5250 (class 0 OID 29484)
-- Dependencies: 439
-- Name: tracking_record_history; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tracking_record_history ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5281 (class 3256 OID 29503)
-- Name: tracking_record_history tracking_record_history_select_owner_company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tracking_record_history_select_owner_company ON public.tracking_record_history FOR SELECT TO authenticated USING (public.is_owner_company_user());


--
-- TOC entry 5249 (class 0 OID 29446)
-- Dependencies: 437
-- Name: tracking_records; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.tracking_records ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5279 (class 3256 OID 29477)
-- Name: tracking_records tracking_records_insert_by_company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tracking_records_insert_by_company ON public.tracking_records FOR INSERT TO authenticated WITH CHECK ((public.is_owner_company_user() OR (company_id = public.current_profile_company_id())));


--
-- TOC entry 5280 (class 3256 OID 29476)
-- Name: tracking_records tracking_records_select_by_company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tracking_records_select_by_company ON public.tracking_records FOR SELECT TO authenticated USING ((public.is_owner_company_user() OR (company_id = public.current_profile_company_id())));


--
-- TOC entry 5278 (class 3256 OID 29478)
-- Name: tracking_records tracking_records_update_by_company; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY tracking_records_update_by_company ON public.tracking_records FOR UPDATE TO authenticated USING ((public.is_owner_company_user() OR (company_id = public.current_profile_company_id()))) WITH CHECK ((public.is_owner_company_user() OR (company_id = public.current_profile_company_id())));


--
-- TOC entry 5265 (class 0 OID 30643)
-- Dependencies: 464
-- Name: user_notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5290 (class 3256 OID 30660)
-- Name: user_notifications user_notifications_mark_own_read; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_notifications_mark_own_read ON public.user_notifications FOR UPDATE TO authenticated USING ((recipient_profile_id = auth.uid())) WITH CHECK ((recipient_profile_id = auth.uid()));


--
-- TOC entry 5291 (class 3256 OID 30659)
-- Name: user_notifications user_notifications_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY user_notifications_select_own ON public.user_notifications FOR SELECT TO authenticated USING ((recipient_profile_id = auth.uid()));


--
-- TOC entry 5241 (class 0 OID 17525)
-- Dependencies: 389
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5234 (class 0 OID 17216)
-- Dependencies: 380
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5238 (class 0 OID 17336)
-- Dependencies: 384
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5239 (class 0 OID 17349)
-- Dependencies: 385
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5233 (class 0 OID 17208)
-- Dependencies: 379
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5235 (class 0 OID 17226)
-- Dependencies: 381
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5236 (class 0 OID 17275)
-- Dependencies: 382
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5237 (class 0 OID 17289)
-- Dependencies: 383
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5269 (class 3256 OID 28361)
-- Name: objects shipment evidences delete; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "shipment evidences delete" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'shipment-evidences'::text));


--
-- TOC entry 5271 (class 3256 OID 28359)
-- Name: objects shipment evidences public read; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "shipment evidences public read" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'shipment-evidences'::text));


--
-- TOC entry 5270 (class 3256 OID 28360)
-- Name: objects shipment evidences upload; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "shipment evidences upload" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'shipment-evidences'::text));


--
-- TOC entry 5267 (class 3256 OID 29649)
-- Name: objects shipment_attachments_storage_delete_own; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY shipment_attachments_storage_delete_own ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'shipment-attachments'::text) AND (EXISTS ( SELECT 1
   FROM public.shipment_attachments attachment
  WHERE ((attachment.storage_path = objects.name) AND (attachment.created_by = auth.uid()))))));


--
-- TOC entry 5268 (class 3256 OID 29648)
-- Name: objects shipment_attachments_storage_upload; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY shipment_attachments_storage_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'shipment-attachments'::text));


--
-- TOC entry 5240 (class 0 OID 17359)
-- Dependencies: 386
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 5294 (class 6104 OID 16430)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- TOC entry 5293 (class 6104 OID 27743)
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- TOC entry 5302 (class 6106 OID 30167)
-- Name: supabase_realtime chat_messages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.chat_messages;


--
-- TOC entry 5299 (class 6106 OID 29652)
-- Name: supabase_realtime shipment_attachments; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.shipment_attachments;


--
-- TOC entry 5301 (class 6106 OID 29876)
-- Name: supabase_realtime shipment_contact_methods; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.shipment_contact_methods;


--
-- TOC entry 5298 (class 6106 OID 29651)
-- Name: supabase_realtime shipment_evidences; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.shipment_evidences;


--
-- TOC entry 5300 (class 6106 OID 29875)
-- Name: supabase_realtime shipment_items; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.shipment_items;


--
-- TOC entry 5296 (class 6106 OID 27754)
-- Name: supabase_realtime shipment_status_history; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.shipment_status_history;


--
-- TOC entry 5297 (class 6106 OID 27755)
-- Name: supabase_realtime shipments; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.shipments;


--
-- TOC entry 5295 (class 6106 OID 27744)
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- TOC entry 5308 (class 0 OID 0)
-- Dependencies: 21
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- TOC entry 5309 (class 0 OID 0)
-- Dependencies: 12
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- TOC entry 5310 (class 0 OID 0)
-- Dependencies: 14
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 5311 (class 0 OID 0)
-- Dependencies: 135
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- TOC entry 5312 (class 0 OID 0)
-- Dependencies: 22
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- TOC entry 5313 (class 0 OID 0)
-- Dependencies: 16
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 633
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 531
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 632
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 639
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 517
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 474
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 552
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 559
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 484
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 499
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 640
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 563
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 584
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 637
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 543
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 622
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 489
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 522
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 628
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 548
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 518
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 516
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 634
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 487
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 528
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 545
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 525
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 530
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 621
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 523
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 587
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 5355 (class 0 OID 0)
-- Dependencies: 624
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 5356 (class 0 OID 0)
-- Dependencies: 537
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5357 (class 0 OID 0)
-- Dependencies: 550
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 5358 (class 0 OID 0)
-- Dependencies: 619
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- TOC entry 5359 (class 0 OID 0)
-- Dependencies: 473
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- TOC entry 5360 (class 0 OID 0)
-- Dependencies: 495
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 5361 (class 0 OID 0)
-- Dependencies: 625
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 5362 (class 0 OID 0)
-- Dependencies: 534
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- TOC entry 5363 (class 0 OID 0)
-- Dependencies: 532
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- TOC entry 5364 (class 0 OID 0)
-- Dependencies: 515
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 5365 (class 0 OID 0)
-- Dependencies: 615
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 5366 (class 0 OID 0)
-- Dependencies: 618
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- TOC entry 5367 (class 0 OID 0)
-- Dependencies: 533
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- TOC entry 5368 (class 0 OID 0)
-- Dependencies: 620
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 5369 (class 0 OID 0)
-- Dependencies: 617
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 5370 (class 0 OID 0)
-- Dependencies: 480
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5371 (class 0 OID 0)
-- Dependencies: 493
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5373 (class 0 OID 0)
-- Dependencies: 539
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5374 (class 0 OID 0)
-- Dependencies: 510
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- TOC entry 5375 (class 0 OID 0)
-- Dependencies: 509
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- TOC entry 5376 (class 0 OID 0)
-- Dependencies: 573
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 5377 (class 0 OID 0)
-- Dependencies: 608
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- TOC entry 5378 (class 0 OID 0)
-- Dependencies: 623
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 5379 (class 0 OID 0)
-- Dependencies: 570
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- TOC entry 5380 (class 0 OID 0)
-- Dependencies: 535
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- TOC entry 5381 (class 0 OID 0)
-- Dependencies: 472
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- TOC entry 5382 (class 0 OID 0)
-- Dependencies: 598
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- TOC entry 5383 (class 0 OID 0)
-- Dependencies: 498
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- TOC entry 5384 (class 0 OID 0)
-- Dependencies: 536
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- TOC entry 5385 (class 0 OID 0)
-- Dependencies: 491
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- TOC entry 5386 (class 0 OID 0)
-- Dependencies: 496
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- TOC entry 5387 (class 0 OID 0)
-- Dependencies: 631
-- Name: FUNCTION add_route_bulk_coverage(p_route_id uuid, p_district_ids bigint[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.add_route_bulk_coverage(p_route_id uuid, p_district_ids bigint[]) TO anon;
GRANT ALL ON FUNCTION public.add_route_bulk_coverage(p_route_id uuid, p_district_ids bigint[]) TO authenticated;
GRANT ALL ON FUNCTION public.add_route_bulk_coverage(p_route_id uuid, p_district_ids bigint[]) TO service_role;


--
-- TOC entry 5388 (class 0 OID 0)
-- Dependencies: 521
-- Name: FUNCTION add_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.add_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) TO anon;
GRANT ALL ON FUNCTION public.add_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) TO authenticated;
GRANT ALL ON FUNCTION public.add_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) TO service_role;


--
-- TOC entry 5389 (class 0 OID 0)
-- Dependencies: 567
-- Name: FUNCTION add_support_participant(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.add_support_participant() TO anon;
GRANT ALL ON FUNCTION public.add_support_participant() TO authenticated;
GRANT ALL ON FUNCTION public.add_support_participant() TO service_role;


--
-- TOC entry 5390 (class 0 OID 0)
-- Dependencies: 538
-- Name: FUNCTION adjust_inventory(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_change integer, p_low_stock integer, p_medium_stock integer, p_reason text, p_notes text, p_created_by uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.adjust_inventory(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_change integer, p_low_stock integer, p_medium_stock integer, p_reason text, p_notes text, p_created_by uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.adjust_inventory(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_change integer, p_low_stock integer, p_medium_stock integer, p_reason text, p_notes text, p_created_by uuid) TO anon;
GRANT ALL ON FUNCTION public.adjust_inventory(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_change integer, p_low_stock integer, p_medium_stock integer, p_reason text, p_notes text, p_created_by uuid) TO authenticated;
GRANT ALL ON FUNCTION public.adjust_inventory(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_change integer, p_low_stock integer, p_medium_stock integer, p_reason text, p_notes text, p_created_by uuid) TO service_role;


--
-- TOC entry 5391 (class 0 OID 0)
-- Dependencies: 607
-- Name: FUNCTION apply_route_bulk_schedule(p_route_id uuid, p_district_ids bigint[], p_min_hours integer, p_max_hours integer, p_days text[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.apply_route_bulk_schedule(p_route_id uuid, p_district_ids bigint[], p_min_hours integer, p_max_hours integer, p_days text[]) TO anon;
GRANT ALL ON FUNCTION public.apply_route_bulk_schedule(p_route_id uuid, p_district_ids bigint[], p_min_hours integer, p_max_hours integer, p_days text[]) TO authenticated;
GRANT ALL ON FUNCTION public.apply_route_bulk_schedule(p_route_id uuid, p_district_ids bigint[], p_min_hours integer, p_max_hours integer, p_days text[]) TO service_role;


--
-- TOC entry 5392 (class 0 OID 0)
-- Dependencies: 541
-- Name: FUNCTION assign_financial_record_to_settlement(p_record_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.assign_financial_record_to_settlement(p_record_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.assign_financial_record_to_settlement(p_record_id uuid) TO anon;
GRANT ALL ON FUNCTION public.assign_financial_record_to_settlement(p_record_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.assign_financial_record_to_settlement(p_record_id uuid) TO service_role;


--
-- TOC entry 5393 (class 0 OID 0)
-- Dependencies: 556
-- Name: FUNCTION assign_unassigned_financial_records_to_current_period(p_party_type text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.assign_unassigned_financial_records_to_current_period(p_party_type text) TO anon;
GRANT ALL ON FUNCTION public.assign_unassigned_financial_records_to_current_period(p_party_type text) TO authenticated;
GRANT ALL ON FUNCTION public.assign_unassigned_financial_records_to_current_period(p_party_type text) TO service_role;


--
-- TOC entry 5394 (class 0 OID 0)
-- Dependencies: 566
-- Name: FUNCTION can_access_chat(p_conversation_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.can_access_chat(p_conversation_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_access_chat(p_conversation_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_access_chat(p_conversation_id uuid) TO service_role;


--
-- TOC entry 5395 (class 0 OID 0)
-- Dependencies: 569
-- Name: FUNCTION can_manage_courier_routes(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.can_manage_courier_routes() FROM PUBLIC;
GRANT ALL ON FUNCTION public.can_manage_courier_routes() TO authenticated;
GRANT ALL ON FUNCTION public.can_manage_courier_routes() TO service_role;


--
-- TOC entry 5396 (class 0 OID 0)
-- Dependencies: 596
-- Name: FUNCTION can_read_courier(p_courier_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.can_read_courier(p_courier_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.can_read_courier(p_courier_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_read_courier(p_courier_id uuid) TO service_role;


--
-- TOC entry 5397 (class 0 OID 0)
-- Dependencies: 571
-- Name: FUNCTION can_write_chat(p_conversation_id uuid, p_template_key text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text) TO anon;
GRANT ALL ON FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text) TO authenticated;
GRANT ALL ON FUNCTION public.can_write_chat(p_conversation_id uuid, p_template_key text) TO service_role;


--
-- TOC entry 5398 (class 0 OID 0)
-- Dependencies: 612
-- Name: FUNCTION chat_is_enabled_for_current_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.chat_is_enabled_for_current_user() TO anon;
GRANT ALL ON FUNCTION public.chat_is_enabled_for_current_user() TO authenticated;
GRANT ALL ON FUNCTION public.chat_is_enabled_for_current_user() TO service_role;


--
-- TOC entry 5399 (class 0 OID 0)
-- Dependencies: 497
-- Name: FUNCTION close_settlement_period(p_period_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.close_settlement_period(p_period_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.close_settlement_period(p_period_id uuid) TO anon;
GRANT ALL ON FUNCTION public.close_settlement_period(p_period_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.close_settlement_period(p_period_id uuid) TO service_role;


--
-- TOC entry 5400 (class 0 OID 0)
-- Dependencies: 576
-- Name: FUNCTION complete_shipment_delivery(p_shipment_id uuid, p_delivered_by uuid, p_receiver_type text, p_deposit_amount numeric, p_shipping_fee numeric, p_delivered_items jsonb, p_observations text, p_latitude double precision, p_longitude double precision); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.complete_shipment_delivery(p_shipment_id uuid, p_delivered_by uuid, p_receiver_type text, p_deposit_amount numeric, p_shipping_fee numeric, p_delivered_items jsonb, p_observations text, p_latitude double precision, p_longitude double precision) FROM PUBLIC;
GRANT ALL ON FUNCTION public.complete_shipment_delivery(p_shipment_id uuid, p_delivered_by uuid, p_receiver_type text, p_deposit_amount numeric, p_shipping_fee numeric, p_delivered_items jsonb, p_observations text, p_latitude double precision, p_longitude double precision) TO anon;
GRANT ALL ON FUNCTION public.complete_shipment_delivery(p_shipment_id uuid, p_delivered_by uuid, p_receiver_type text, p_deposit_amount numeric, p_shipping_fee numeric, p_delivered_items jsonb, p_observations text, p_latitude double precision, p_longitude double precision) TO authenticated;
GRANT ALL ON FUNCTION public.complete_shipment_delivery(p_shipment_id uuid, p_delivered_by uuid, p_receiver_type text, p_deposit_amount numeric, p_shipping_fee numeric, p_delivered_items jsonb, p_observations text, p_latitude double precision, p_longitude double precision) TO service_role;


--
-- TOC entry 5401 (class 0 OID 0)
-- Dependencies: 544
-- Name: FUNCTION create_shipment_customer_location_request(p_shipment_id uuid, p_token_hash text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.create_shipment_customer_location_request(p_shipment_id uuid, p_token_hash text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.create_shipment_customer_location_request(p_shipment_id uuid, p_token_hash text) TO authenticated;
GRANT ALL ON FUNCTION public.create_shipment_customer_location_request(p_shipment_id uuid, p_token_hash text) TO service_role;


--
-- TOC entry 5402 (class 0 OID 0)
-- Dependencies: 469
-- Name: FUNCTION current_courier_route_ids(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.current_courier_route_ids() FROM PUBLIC;
GRANT ALL ON FUNCTION public.current_courier_route_ids() TO authenticated;
GRANT ALL ON FUNCTION public.current_courier_route_ids() TO service_role;


--
-- TOC entry 5403 (class 0 OID 0)
-- Dependencies: 641
-- Name: FUNCTION current_profile_company_id(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.current_profile_company_id() TO anon;
GRANT ALL ON FUNCTION public.current_profile_company_id() TO authenticated;
GRANT ALL ON FUNCTION public.current_profile_company_id() TO service_role;


--
-- TOC entry 5404 (class 0 OID 0)
-- Dependencies: 611
-- Name: FUNCTION delete_chat_message(p_message_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.delete_chat_message(p_message_id uuid) TO anon;
GRANT ALL ON FUNCTION public.delete_chat_message(p_message_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.delete_chat_message(p_message_id uuid) TO service_role;


--
-- TOC entry 5405 (class 0 OID 0)
-- Dependencies: 602
-- Name: FUNCTION delete_route_with_optional_shipment_reassignment(p_route_id uuid, p_successor_route_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.delete_route_with_optional_shipment_reassignment(p_route_id uuid, p_successor_route_id uuid) TO anon;
GRANT ALL ON FUNCTION public.delete_route_with_optional_shipment_reassignment(p_route_id uuid, p_successor_route_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.delete_route_with_optional_shipment_reassignment(p_route_id uuid, p_successor_route_id uuid) TO service_role;


--
-- TOC entry 5406 (class 0 OID 0)
-- Dependencies: 557
-- Name: FUNCTION edit_chat_message(p_message_id uuid, p_body text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.edit_chat_message(p_message_id uuid, p_body text) TO anon;
GRANT ALL ON FUNCTION public.edit_chat_message(p_message_id uuid, p_body text) TO authenticated;
GRANT ALL ON FUNCTION public.edit_chat_message(p_message_id uuid, p_body text) TO service_role;


--
-- TOC entry 5407 (class 0 OID 0)
-- Dependencies: 504
-- Name: FUNCTION enforce_tracking_record_permissions(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.enforce_tracking_record_permissions() TO anon;
GRANT ALL ON FUNCTION public.enforce_tracking_record_permissions() TO authenticated;
GRANT ALL ON FUNCTION public.enforce_tracking_record_permissions() TO service_role;


--
-- TOC entry 5408 (class 0 OID 0)
-- Dependencies: 635
-- Name: FUNCTION generate_tracking_number(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.generate_tracking_number() TO anon;
GRANT ALL ON FUNCTION public.generate_tracking_number() TO authenticated;
GRANT ALL ON FUNCTION public.generate_tracking_number() TO service_role;


--
-- TOC entry 5409 (class 0 OID 0)
-- Dependencies: 467
-- Name: FUNCTION get_chat_conversation_previews(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_chat_conversation_previews() TO anon;
GRANT ALL ON FUNCTION public.get_chat_conversation_previews() TO authenticated;
GRANT ALL ON FUNCTION public.get_chat_conversation_previews() TO service_role;


--
-- TOC entry 5410 (class 0 OID 0)
-- Dependencies: 583
-- Name: FUNCTION get_chat_messages(p_conversation_id uuid, p_limit integer, p_before timestamp with time zone); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_chat_messages(p_conversation_id uuid, p_limit integer, p_before timestamp with time zone) TO anon;
GRANT ALL ON FUNCTION public.get_chat_messages(p_conversation_id uuid, p_limit integer, p_before timestamp with time zone) TO authenticated;
GRANT ALL ON FUNCTION public.get_chat_messages(p_conversation_id uuid, p_limit integer, p_before timestamp with time zone) TO service_role;


--
-- TOC entry 5411 (class 0 OID 0)
-- Dependencies: 609
-- Name: FUNCTION get_courier_delivery_payment_amount_changes(p_financial_record_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_courier_delivery_payment_amount_changes(p_financial_record_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_courier_delivery_payment_amount_changes(p_financial_record_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_courier_delivery_payment_amount_changes(p_financial_record_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_courier_delivery_payment_amount_changes(p_financial_record_id uuid) TO service_role;


--
-- TOC entry 5412 (class 0 OID 0)
-- Dependencies: 597
-- Name: FUNCTION get_current_company_context(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_current_company_context() FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_current_company_context() TO anon;
GRANT ALL ON FUNCTION public.get_current_company_context() TO authenticated;
GRANT ALL ON FUNCTION public.get_current_company_context() TO service_role;


--
-- TOC entry 5413 (class 0 OID 0)
-- Dependencies: 561
-- Name: FUNCTION get_delivery_financial_records_page(p_record_type text, p_company text, p_courier text, p_route text, p_tracking_number text, p_status text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_delivery_financial_records_page(p_record_type text, p_company text, p_courier text, p_route text, p_tracking_number text, p_status text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_delivery_financial_records_page(p_record_type text, p_company text, p_courier text, p_route text, p_tracking_number text, p_status text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_delivery_financial_records_page(p_record_type text, p_company text, p_courier text, p_route text, p_tracking_number text, p_status text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_delivery_financial_records_page(p_record_type text, p_company text, p_courier text, p_route text, p_tracking_number text, p_status text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) TO service_role;


--
-- TOC entry 5414 (class 0 OID 0)
-- Dependencies: 478
-- Name: FUNCTION get_district_neighborhoods(p_district_id bigint, p_route_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_district_neighborhoods(p_district_id bigint, p_route_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_district_neighborhoods(p_district_id bigint, p_route_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_district_neighborhoods(p_district_id bigint, p_route_id uuid) TO service_role;


--
-- TOC entry 5415 (class 0 OID 0)
-- Dependencies: 547
-- Name: FUNCTION get_filtered_shipment_ids(p_company_id uuid, p_route_id uuid, p_courier_id uuid, p_delivery_hours integer, p_visit_day text, p_status text, p_search text, p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_filtered_shipment_ids(p_company_id uuid, p_route_id uuid, p_courier_id uuid, p_delivery_hours integer, p_visit_day text, p_status text, p_search text, p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_filtered_shipment_ids(p_company_id uuid, p_route_id uuid, p_courier_id uuid, p_delivery_hours integer, p_visit_day text, p_status text, p_search text, p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_filtered_shipment_ids(p_company_id uuid, p_route_id uuid, p_courier_id uuid, p_delivery_hours integer, p_visit_day text, p_status text, p_search text, p_limit integer, p_offset integer) TO service_role;


--
-- TOC entry 5416 (class 0 OID 0)
-- Dependencies: 477
-- Name: FUNCTION get_inventory_movements_page(p_company text, p_courier text, p_product text, p_search text, p_movement_type text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_inventory_movements_page(p_company text, p_courier text, p_product text, p_search text, p_movement_type text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_inventory_movements_page(p_company text, p_courier text, p_product text, p_search text, p_movement_type text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_inventory_movements_page(p_company text, p_courier text, p_product text, p_search text, p_movement_type text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_inventory_movements_page(p_company text, p_courier text, p_product text, p_search text, p_movement_type text, p_from timestamp with time zone, p_to timestamp with time zone, p_limit integer, p_offset integer) TO service_role;


--
-- TOC entry 5417 (class 0 OID 0)
-- Dependencies: 601
-- Name: FUNCTION get_inventory_page(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text, p_limit integer, p_offset integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_inventory_page(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text, p_limit integer, p_offset integer) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_inventory_page(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text, p_limit integer, p_offset integer) TO anon;
GRANT ALL ON FUNCTION public.get_inventory_page(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text, p_limit integer, p_offset integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_inventory_page(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text, p_limit integer, p_offset integer) TO service_role;


--
-- TOC entry 5418 (class 0 OID 0)
-- Dependencies: 603
-- Name: FUNCTION get_inventory_summary(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_inventory_summary(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_inventory_summary(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text) TO anon;
GRANT ALL ON FUNCTION public.get_inventory_summary(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text) TO authenticated;
GRANT ALL ON FUNCTION public.get_inventory_summary(p_courier_id uuid, p_company_id uuid, p_product_id uuid, p_quantity_operator text, p_quantity_value integer, p_quantity_value2 integer, p_stock_status text) TO service_role;


--
-- TOC entry 5419 (class 0 OID 0)
-- Dependencies: 593
-- Name: FUNCTION get_open_settlement_summaries(p_party_type text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_open_settlement_summaries(p_party_type text) TO anon;
GRANT ALL ON FUNCTION public.get_open_settlement_summaries(p_party_type text) TO authenticated;
GRANT ALL ON FUNCTION public.get_open_settlement_summaries(p_party_type text) TO service_role;


--
-- TOC entry 5420 (class 0 OID 0)
-- Dependencies: 486
-- Name: FUNCTION get_open_settlement_summaries_filtered(p_party_type text, p_filter_party_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_open_settlement_summaries_filtered(p_party_type text, p_filter_party_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_open_settlement_summaries_filtered(p_party_type text, p_filter_party_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_open_settlement_summaries_filtered(p_party_type text, p_filter_party_id uuid) TO service_role;


--
-- TOC entry 5421 (class 0 OID 0)
-- Dependencies: 508
-- Name: FUNCTION get_or_create_customer_service_chat(p_client_company_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_or_create_customer_service_chat(p_client_company_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_or_create_customer_service_chat(p_client_company_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_or_create_customer_service_chat(p_client_company_id uuid) TO service_role;


--
-- TOC entry 5422 (class 0 OID 0)
-- Dependencies: 507
-- Name: FUNCTION get_or_create_shipment_chat(p_shipment_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_or_create_shipment_chat(p_shipment_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_or_create_shipment_chat(p_shipment_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_or_create_shipment_chat(p_shipment_id uuid) TO service_role;


--
-- TOC entry 5423 (class 0 OID 0)
-- Dependencies: 616
-- Name: FUNCTION get_province_coverage_counts(p_province text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_province_coverage_counts(p_province text) TO anon;
GRANT ALL ON FUNCTION public.get_province_coverage_counts(p_province text) TO authenticated;
GRANT ALL ON FUNCTION public.get_province_coverage_counts(p_province text) TO service_role;


--
-- TOC entry 5424 (class 0 OID 0)
-- Dependencies: 572
-- Name: FUNCTION get_public_shipment_customer_location_request(p_token_hash text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_public_shipment_customer_location_request(p_token_hash text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_public_shipment_customer_location_request(p_token_hash text) TO anon;
GRANT ALL ON FUNCTION public.get_public_shipment_customer_location_request(p_token_hash text) TO authenticated;
GRANT ALL ON FUNCTION public.get_public_shipment_customer_location_request(p_token_hash text) TO service_role;


--
-- TOC entry 5425 (class 0 OID 0)
-- Dependencies: 494
-- Name: FUNCTION get_route_district_coverage(p_route_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_route_district_coverage(p_route_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_route_district_coverage(p_route_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_route_district_coverage(p_route_id uuid) TO service_role;


--
-- TOC entry 5426 (class 0 OID 0)
-- Dependencies: 485
-- Name: FUNCTION get_settlement_schedules(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_settlement_schedules() TO anon;
GRANT ALL ON FUNCTION public.get_settlement_schedules() TO authenticated;
GRANT ALL ON FUNCTION public.get_settlement_schedules() TO service_role;


--
-- TOC entry 5427 (class 0 OID 0)
-- Dependencies: 513
-- Name: FUNCTION get_unassigned_settlement_financial_records(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_unassigned_settlement_financial_records() TO anon;
GRANT ALL ON FUNCTION public.get_unassigned_settlement_financial_records() TO authenticated;
GRANT ALL ON FUNCTION public.get_unassigned_settlement_financial_records() TO service_role;


--
-- TOC entry 5428 (class 0 OID 0)
-- Dependencies: 481
-- Name: FUNCTION get_unread_chat_notifications(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_unread_chat_notifications() TO anon;
GRANT ALL ON FUNCTION public.get_unread_chat_notifications() TO authenticated;
GRANT ALL ON FUNCTION public.get_unread_chat_notifications() TO service_role;


--
-- TOC entry 5429 (class 0 OID 0)
-- Dependencies: 514
-- Name: FUNCTION get_visible_company_directory(p_company_ids uuid[]); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.get_visible_company_directory(p_company_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.get_visible_company_directory(p_company_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.get_visible_company_directory(p_company_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.get_visible_company_directory(p_company_ids uuid[]) TO service_role;


--
-- TOC entry 5430 (class 0 OID 0)
-- Dependencies: 488
-- Name: FUNCTION is_owner_company_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_owner_company_user() TO anon;
GRANT ALL ON FUNCTION public.is_owner_company_user() TO authenticated;
GRANT ALL ON FUNCTION public.is_owner_company_user() TO service_role;


--
-- TOC entry 5431 (class 0 OID 0)
-- Dependencies: 577
-- Name: FUNCTION log_tracking_record_changes(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.log_tracking_record_changes() TO anon;
GRANT ALL ON FUNCTION public.log_tracking_record_changes() TO authenticated;
GRANT ALL ON FUNCTION public.log_tracking_record_changes() TO service_role;


--
-- TOC entry 5432 (class 0 OID 0)
-- Dependencies: 606
-- Name: FUNCTION mark_chat_conversation_read(p_conversation_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.mark_chat_conversation_read(p_conversation_id uuid) TO anon;
GRANT ALL ON FUNCTION public.mark_chat_conversation_read(p_conversation_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.mark_chat_conversation_read(p_conversation_id uuid) TO service_role;


--
-- TOC entry 5433 (class 0 OID 0)
-- Dependencies: 630
-- Name: FUNCTION record_shipment_creation_history(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.record_shipment_creation_history() TO anon;
GRANT ALL ON FUNCTION public.record_shipment_creation_history() TO authenticated;
GRANT ALL ON FUNCTION public.record_shipment_creation_history() TO service_role;


--
-- TOC entry 5434 (class 0 OID 0)
-- Dependencies: 506
-- Name: FUNCTION refresh_shipment_search_text(p_shipment_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.refresh_shipment_search_text(p_shipment_id uuid) TO anon;
GRANT ALL ON FUNCTION public.refresh_shipment_search_text(p_shipment_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.refresh_shipment_search_text(p_shipment_id uuid) TO service_role;


--
-- TOC entry 5435 (class 0 OID 0)
-- Dependencies: 562
-- Name: FUNCTION register_shipment_failed_attempt(p_shipment_id uuid); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.register_shipment_failed_attempt(p_shipment_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION public.register_shipment_failed_attempt(p_shipment_id uuid) TO anon;
GRANT ALL ON FUNCTION public.register_shipment_failed_attempt(p_shipment_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.register_shipment_failed_attempt(p_shipment_id uuid) TO service_role;


--
-- TOC entry 5436 (class 0 OID 0)
-- Dependencies: 479
-- Name: FUNCTION remove_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.remove_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) TO anon;
GRANT ALL ON FUNCTION public.remove_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) TO authenticated;
GRANT ALL ON FUNCTION public.remove_route_bulk_coverage_with_neighborhoods(p_route_id uuid, p_district_ids bigint[], p_neighborhood_ids bigint[]) TO service_role;


--
-- TOC entry 5437 (class 0 OID 0)
-- Dependencies: 483
-- Name: FUNCTION save_courier_route_assignments(p_axis text, p_subject_id uuid, p_ids uuid[], p_expected_ids uuid[]); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.save_courier_route_assignments(p_axis text, p_subject_id uuid, p_ids uuid[], p_expected_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.save_courier_route_assignments(p_axis text, p_subject_id uuid, p_ids uuid[], p_expected_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.save_courier_route_assignments(p_axis text, p_subject_id uuid, p_ids uuid[], p_expected_ids uuid[]) TO service_role;


--
-- TOC entry 5438 (class 0 OID 0)
-- Dependencies: 529
-- Name: FUNCTION save_settlement_schedule(p_party_type text, p_party_id uuid, p_frequency text, p_interval_days integer, p_anchor_date date, p_auto_rollover boolean); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.save_settlement_schedule(p_party_type text, p_party_id uuid, p_frequency text, p_interval_days integer, p_anchor_date date, p_auto_rollover boolean) TO anon;
GRANT ALL ON FUNCTION public.save_settlement_schedule(p_party_type text, p_party_id uuid, p_frequency text, p_interval_days integer, p_anchor_date date, p_auto_rollover boolean) TO authenticated;
GRANT ALL ON FUNCTION public.save_settlement_schedule(p_party_type text, p_party_id uuid, p_frequency text, p_interval_days integer, p_anchor_date date, p_auto_rollover boolean) TO service_role;


--
-- TOC entry 5439 (class 0 OID 0)
-- Dependencies: 590
-- Name: FUNCTION set_settlement_item_exclusion(p_item_id uuid, p_excluded boolean, p_reason text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.set_settlement_item_exclusion(p_item_id uuid, p_excluded boolean, p_reason text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.set_settlement_item_exclusion(p_item_id uuid, p_excluded boolean, p_reason text) TO anon;
GRANT ALL ON FUNCTION public.set_settlement_item_exclusion(p_item_id uuid, p_excluded boolean, p_reason text) TO authenticated;
GRANT ALL ON FUNCTION public.set_settlement_item_exclusion(p_item_id uuid, p_excluded boolean, p_reason text) TO service_role;


--
-- TOC entry 5440 (class 0 OID 0)
-- Dependencies: 554
-- Name: FUNCTION set_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.set_updated_at() TO anon;
GRANT ALL ON FUNCTION public.set_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.set_updated_at() TO service_role;


--
-- TOC entry 5441 (class 0 OID 0)
-- Dependencies: 503
-- Name: FUNCTION shipment_before_insert(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.shipment_before_insert() TO anon;
GRANT ALL ON FUNCTION public.shipment_before_insert() TO authenticated;
GRANT ALL ON FUNCTION public.shipment_before_insert() TO service_role;


--
-- TOC entry 5442 (class 0 OID 0)
-- Dependencies: 582
-- Name: FUNCTION shipment_contact_search_text_trigger(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.shipment_contact_search_text_trigger() TO anon;
GRANT ALL ON FUNCTION public.shipment_contact_search_text_trigger() TO authenticated;
GRANT ALL ON FUNCTION public.shipment_contact_search_text_trigger() TO service_role;


--
-- TOC entry 5443 (class 0 OID 0)
-- Dependencies: 560
-- Name: FUNCTION shipment_search_text_trigger(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.shipment_search_text_trigger() TO anon;
GRANT ALL ON FUNCTION public.shipment_search_text_trigger() TO authenticated;
GRANT ALL ON FUNCTION public.shipment_search_text_trigger() TO service_role;


--
-- TOC entry 5444 (class 0 OID 0)
-- Dependencies: 626
-- Name: FUNCTION soft_delete_shipment_attachments(p_attachment_ids uuid[]); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.soft_delete_shipment_attachments(p_attachment_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.soft_delete_shipment_attachments(p_attachment_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.soft_delete_shipment_attachments(p_attachment_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.soft_delete_shipment_attachments(p_attachment_ids uuid[]) TO service_role;


--
-- TOC entry 5445 (class 0 OID 0)
-- Dependencies: 520
-- Name: FUNCTION soft_delete_shipment_evidences(p_evidence_ids uuid[]); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.soft_delete_shipment_evidences(p_evidence_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION public.soft_delete_shipment_evidences(p_evidence_ids uuid[]) TO anon;
GRANT ALL ON FUNCTION public.soft_delete_shipment_evidences(p_evidence_ids uuid[]) TO authenticated;
GRANT ALL ON FUNCTION public.soft_delete_shipment_evidences(p_evidence_ids uuid[]) TO service_role;


--
-- TOC entry 5446 (class 0 OID 0)
-- Dependencies: 558
-- Name: FUNCTION submit_public_shipment_customer_location(p_token_hash text, p_latitude double precision, p_longitude double precision, p_accuracy_meters double precision); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.submit_public_shipment_customer_location(p_token_hash text, p_latitude double precision, p_longitude double precision, p_accuracy_meters double precision) FROM PUBLIC;
GRANT ALL ON FUNCTION public.submit_public_shipment_customer_location(p_token_hash text, p_latitude double precision, p_longitude double precision, p_accuracy_meters double precision) TO anon;
GRANT ALL ON FUNCTION public.submit_public_shipment_customer_location(p_token_hash text, p_latitude double precision, p_longitude double precision, p_accuracy_meters double precision) TO authenticated;
GRANT ALL ON FUNCTION public.submit_public_shipment_customer_location(p_token_hash text, p_latitude double precision, p_longitude double precision, p_accuracy_meters double precision) TO service_role;


--
-- TOC entry 5447 (class 0 OID 0)
-- Dependencies: 492
-- Name: FUNCTION sync_courier_profile_availability(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.sync_courier_profile_availability() FROM PUBLIC;
GRANT ALL ON FUNCTION public.sync_courier_profile_availability() TO service_role;


--
-- TOC entry 5448 (class 0 OID 0)
-- Dependencies: 595
-- Name: FUNCTION trigger_assign_financial_record_to_settlement(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_assign_financial_record_to_settlement() TO anon;
GRANT ALL ON FUNCTION public.trigger_assign_financial_record_to_settlement() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_assign_financial_record_to_settlement() TO service_role;


--
-- TOC entry 5449 (class 0 OID 0)
-- Dependencies: 592
-- Name: FUNCTION update_courier_delivery_payment_amount(p_financial_record_id uuid, p_new_amount numeric, p_justification text); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION public.update_courier_delivery_payment_amount(p_financial_record_id uuid, p_new_amount numeric, p_justification text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.update_courier_delivery_payment_amount(p_financial_record_id uuid, p_new_amount numeric, p_justification text) TO anon;
GRANT ALL ON FUNCTION public.update_courier_delivery_payment_amount(p_financial_record_id uuid, p_new_amount numeric, p_justification text) TO authenticated;
GRANT ALL ON FUNCTION public.update_courier_delivery_payment_amount(p_financial_record_id uuid, p_new_amount numeric, p_justification text) TO service_role;


--
-- TOC entry 5450 (class 0 OID 0)
-- Dependencies: 540
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;


--
-- TOC entry 5451 (class 0 OID 0)
-- Dependencies: 527
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- TOC entry 5452 (class 0 OID 0)
-- Dependencies: 565
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;


--
-- TOC entry 5453 (class 0 OID 0)
-- Dependencies: 526
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;


--
-- TOC entry 5454 (class 0 OID 0)
-- Dependencies: 638
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;


--
-- TOC entry 5455 (class 0 OID 0)
-- Dependencies: 636
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO service_role;


--
-- TOC entry 5456 (class 0 OID 0)
-- Dependencies: 519
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;


--
-- TOC entry 5457 (class 0 OID 0)
-- Dependencies: 475
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- TOC entry 5458 (class 0 OID 0)
-- Dependencies: 604
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;


--
-- TOC entry 5459 (class 0 OID 0)
-- Dependencies: 586
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- TOC entry 5460 (class 0 OID 0)
-- Dependencies: 614
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- TOC entry 5461 (class 0 OID 0)
-- Dependencies: 501
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;


--
-- TOC entry 5462 (class 0 OID 0)
-- Dependencies: 627
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;


--
-- TOC entry 5463 (class 0 OID 0)
-- Dependencies: 490
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- TOC entry 5464 (class 0 OID 0)
-- Dependencies: 555
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- TOC entry 5465 (class 0 OID 0)
-- Dependencies: 594
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- TOC entry 5466 (class 0 OID 0)
-- Dependencies: 588
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 5467 (class 0 OID 0)
-- Dependencies: 610
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 5469 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- TOC entry 5470 (class 0 OID 0)
-- Dependencies: 372
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- TOC entry 5472 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- TOC entry 5475 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- TOC entry 5477 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- TOC entry 5479 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- TOC entry 5481 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- TOC entry 5484 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- TOC entry 5485 (class 0 OID 0)
-- Dependencies: 443
-- Name: TABLE mfa_recovery_code_sets; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.mfa_recovery_code_sets TO postgres;
GRANT ALL ON TABLE auth.mfa_recovery_code_sets TO dashboard_user;


--
-- TOC entry 5486 (class 0 OID 0)
-- Dependencies: 444
-- Name: TABLE mfa_recovery_codes; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.mfa_recovery_codes TO postgres;
GRANT ALL ON TABLE auth.mfa_recovery_codes TO dashboard_user;


--
-- TOC entry 5487 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- TOC entry 5489 (class 0 OID 0)
-- Dependencies: 371
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- TOC entry 5490 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- TOC entry 5491 (class 0 OID 0)
-- Dependencies: 370
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- TOC entry 5492 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- TOC entry 5494 (class 0 OID 0)
-- Dependencies: 351
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- TOC entry 5496 (class 0 OID 0)
-- Dependencies: 350
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- TOC entry 5498 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- TOC entry 5500 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- TOC entry 5502 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- TOC entry 5503 (class 0 OID 0)
-- Dependencies: 442
-- Name: TABLE scim_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.scim_tokens TO postgres;
GRANT ALL ON TABLE auth.scim_tokens TO dashboard_user;


--
-- TOC entry 5504 (class 0 OID 0)
-- Dependencies: 441
-- Name: TABLE scim_users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.scim_users TO postgres;
GRANT ALL ON TABLE auth.scim_users TO dashboard_user;


--
-- TOC entry 5509 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- TOC entry 5511 (class 0 OID 0)
-- Dependencies: 363
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- TOC entry 5514 (class 0 OID 0)
-- Dependencies: 362
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- TOC entry 5517 (class 0 OID 0)
-- Dependencies: 349
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- TOC entry 5518 (class 0 OID 0)
-- Dependencies: 374
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- TOC entry 5519 (class 0 OID 0)
-- Dependencies: 373
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- TOC entry 5520 (class 0 OID 0)
-- Dependencies: 348
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- TOC entry 5521 (class 0 OID 0)
-- Dependencies: 347
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- TOC entry 5522 (class 0 OID 0)
-- Dependencies: 460
-- Name: TABLE account_email_verifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.account_email_verifications TO anon;
GRANT ALL ON TABLE public.account_email_verifications TO authenticated;
GRANT ALL ON TABLE public.account_email_verifications TO service_role;


--
-- TOC entry 5523 (class 0 OID 0)
-- Dependencies: 461
-- Name: TABLE account_password_reset_tokens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.account_password_reset_tokens TO anon;
GRANT ALL ON TABLE public.account_password_reset_tokens TO authenticated;
GRANT ALL ON TABLE public.account_password_reset_tokens TO service_role;


--
-- TOC entry 5524 (class 0 OID 0)
-- Dependencies: 463
-- Name: TABLE account_security_rate_limits; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.account_security_rate_limits TO anon;
GRANT ALL ON TABLE public.account_security_rate_limits TO authenticated;
GRANT ALL ON TABLE public.account_security_rate_limits TO service_role;


--
-- TOC entry 5525 (class 0 OID 0)
-- Dependencies: 419
-- Name: TABLE admin_users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.admin_users TO anon;
GRANT ALL ON TABLE public.admin_users TO authenticated;
GRANT ALL ON TABLE public.admin_users TO service_role;


--
-- TOC entry 5526 (class 0 OID 0)
-- Dependencies: 405
-- Name: TABLE cantons; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.cantons TO anon;
GRANT ALL ON TABLE public.cantons TO authenticated;
GRANT ALL ON TABLE public.cantons TO service_role;


--
-- TOC entry 5528 (class 0 OID 0)
-- Dependencies: 404
-- Name: SEQUENCE cantons_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.cantons_id_seq TO anon;
GRANT ALL ON SEQUENCE public.cantons_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.cantons_id_seq TO service_role;


--
-- TOC entry 5529 (class 0 OID 0)
-- Dependencies: 453
-- Name: TABLE chat_conversation_participants; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_conversation_participants TO anon;
GRANT ALL ON TABLE public.chat_conversation_participants TO authenticated;
GRANT ALL ON TABLE public.chat_conversation_participants TO service_role;


--
-- TOC entry 5530 (class 0 OID 0)
-- Dependencies: 448
-- Name: TABLE chat_conversations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_conversations TO anon;
GRANT ALL ON TABLE public.chat_conversations TO authenticated;
GRANT ALL ON TABLE public.chat_conversations TO service_role;


--
-- TOC entry 5531 (class 0 OID 0)
-- Dependencies: 455
-- Name: TABLE chat_message_audit; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_message_audit TO anon;
GRANT ALL ON TABLE public.chat_message_audit TO authenticated;
GRANT ALL ON TABLE public.chat_message_audit TO service_role;


--
-- TOC entry 5532 (class 0 OID 0)
-- Dependencies: 450
-- Name: TABLE chat_message_reads; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_message_reads TO anon;
GRANT ALL ON TABLE public.chat_message_reads TO authenticated;
GRANT ALL ON TABLE public.chat_message_reads TO service_role;


--
-- TOC entry 5533 (class 0 OID 0)
-- Dependencies: 449
-- Name: TABLE chat_messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_messages TO anon;
GRANT ALL ON TABLE public.chat_messages TO authenticated;
GRANT ALL ON TABLE public.chat_messages TO service_role;


--
-- TOC entry 5534 (class 0 OID 0)
-- Dependencies: 390
-- Name: TABLE companies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.companies TO anon;
GRANT ALL ON TABLE public.companies TO authenticated;
GRANT ALL ON TABLE public.companies TO service_role;


--
-- TOC entry 5535 (class 0 OID 0)
-- Dependencies: 418
-- Name: TABLE company_contacts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.company_contacts TO anon;
GRANT ALL ON TABLE public.company_contacts TO authenticated;
GRANT ALL ON TABLE public.company_contacts TO service_role;


--
-- TOC entry 5536 (class 0 OID 0)
-- Dependencies: 424
-- Name: TABLE company_products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.company_products TO anon;
GRANT ALL ON TABLE public.company_products TO authenticated;
GRANT ALL ON TABLE public.company_products TO service_role;


--
-- TOC entry 5537 (class 0 OID 0)
-- Dependencies: 417
-- Name: TABLE contact_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contact_methods TO anon;
GRANT ALL ON TABLE public.contact_methods TO authenticated;
GRANT ALL ON TABLE public.contact_methods TO service_role;


--
-- TOC entry 5538 (class 0 OID 0)
-- Dependencies: 416
-- Name: TABLE contacts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.contacts TO anon;
GRANT ALL ON TABLE public.contacts TO authenticated;
GRANT ALL ON TABLE public.contacts TO service_role;


--
-- TOC entry 5539 (class 0 OID 0)
-- Dependencies: 429
-- Name: TABLE courier_delivery_rates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.courier_delivery_rates TO anon;
GRANT ALL ON TABLE public.courier_delivery_rates TO authenticated;
GRANT ALL ON TABLE public.courier_delivery_rates TO service_role;


--
-- TOC entry 5540 (class 0 OID 0)
-- Dependencies: 396
-- Name: TABLE courier_routes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.courier_routes TO service_role;
GRANT SELECT ON TABLE public.courier_routes TO authenticated;


--
-- TOC entry 5541 (class 0 OID 0)
-- Dependencies: 392
-- Name: TABLE couriers; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.couriers TO service_role;
GRANT SELECT ON TABLE public.couriers TO authenticated;


--
-- TOC entry 5542 (class 0 OID 0)
-- Dependencies: 430
-- Name: TABLE delivery_rates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.delivery_rates TO anon;
GRANT ALL ON TABLE public.delivery_rates TO authenticated;
GRANT ALL ON TABLE public.delivery_rates TO service_role;


--
-- TOC entry 5543 (class 0 OID 0)
-- Dependencies: 407
-- Name: TABLE districts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.districts TO anon;
GRANT ALL ON TABLE public.districts TO authenticated;
GRANT ALL ON TABLE public.districts TO service_role;


--
-- TOC entry 5545 (class 0 OID 0)
-- Dependencies: 406
-- Name: SEQUENCE districts_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.districts_id_seq TO anon;
GRANT ALL ON SEQUENCE public.districts_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.districts_id_seq TO service_role;


--
-- TOC entry 5546 (class 0 OID 0)
-- Dependencies: 427
-- Name: TABLE identification_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.identification_types TO anon;
GRANT ALL ON TABLE public.identification_types TO authenticated;
GRANT ALL ON TABLE public.identification_types TO service_role;


--
-- TOC entry 5548 (class 0 OID 0)
-- Dependencies: 426
-- Name: SEQUENCE identification_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.identification_types_id_seq TO anon;
GRANT ALL ON SEQUENCE public.identification_types_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.identification_types_id_seq TO service_role;


--
-- TOC entry 5549 (class 0 OID 0)
-- Dependencies: 398
-- Name: TABLE inventory; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory TO anon;
GRANT ALL ON TABLE public.inventory TO authenticated;
GRANT ALL ON TABLE public.inventory TO service_role;


--
-- TOC entry 5550 (class 0 OID 0)
-- Dependencies: 399
-- Name: TABLE inventory_movements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.inventory_movements TO anon;
GRANT ALL ON TABLE public.inventory_movements TO authenticated;
GRANT ALL ON TABLE public.inventory_movements TO service_role;


--
-- TOC entry 5551 (class 0 OID 0)
-- Dependencies: 409
-- Name: TABLE neighborhoods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.neighborhoods TO anon;
GRANT ALL ON TABLE public.neighborhoods TO authenticated;
GRANT ALL ON TABLE public.neighborhoods TO service_role;


--
-- TOC entry 5553 (class 0 OID 0)
-- Dependencies: 408
-- Name: SEQUENCE neighborhoods_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.neighborhoods_id_seq TO anon;
GRANT ALL ON SEQUENCE public.neighborhoods_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.neighborhoods_id_seq TO service_role;


--
-- TOC entry 5554 (class 0 OID 0)
-- Dependencies: 462
-- Name: TABLE password_reset_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.password_reset_requests TO anon;
GRANT ALL ON TABLE public.password_reset_requests TO authenticated;
GRANT ALL ON TABLE public.password_reset_requests TO service_role;


--
-- TOC entry 5555 (class 0 OID 0)
-- Dependencies: 422
-- Name: TABLE password_resets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.password_resets TO anon;
GRANT ALL ON TABLE public.password_resets TO authenticated;
GRANT ALL ON TABLE public.password_resets TO service_role;


--
-- TOC entry 5556 (class 0 OID 0)
-- Dependencies: 420
-- Name: TABLE permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.permissions TO anon;
GRANT ALL ON TABLE public.permissions TO authenticated;
GRANT ALL ON TABLE public.permissions TO service_role;


--
-- TOC entry 5557 (class 0 OID 0)
-- Dependencies: 393
-- Name: TABLE pricing_templates; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.pricing_templates TO anon;
GRANT ALL ON TABLE public.pricing_templates TO authenticated;
GRANT ALL ON TABLE public.pricing_templates TO service_role;


--
-- TOC entry 5558 (class 0 OID 0)
-- Dependencies: 397
-- Name: TABLE products; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.products TO anon;
GRANT ALL ON TABLE public.products TO authenticated;
GRANT ALL ON TABLE public.products TO service_role;


--
-- TOC entry 5559 (class 0 OID 0)
-- Dependencies: 421
-- Name: TABLE profile_permissions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profile_permissions TO anon;
GRANT ALL ON TABLE public.profile_permissions TO authenticated;
GRANT ALL ON TABLE public.profile_permissions TO service_role;


--
-- TOC entry 5560 (class 0 OID 0)
-- Dependencies: 391
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- TOC entry 5561 (class 0 OID 0)
-- Dependencies: 403
-- Name: TABLE provinces; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.provinces TO anon;
GRANT ALL ON TABLE public.provinces TO authenticated;
GRANT ALL ON TABLE public.provinces TO service_role;


--
-- TOC entry 5563 (class 0 OID 0)
-- Dependencies: 402
-- Name: SEQUENCE provinces_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.provinces_id_seq TO anon;
GRANT ALL ON SEQUENCE public.provinces_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.provinces_id_seq TO service_role;


--
-- TOC entry 5564 (class 0 OID 0)
-- Dependencies: 411
-- Name: TABLE route_coverage; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.route_coverage TO anon;
GRANT ALL ON TABLE public.route_coverage TO authenticated;
GRANT ALL ON TABLE public.route_coverage TO service_role;


--
-- TOC entry 5566 (class 0 OID 0)
-- Dependencies: 410
-- Name: SEQUENCE route_coverage_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.route_coverage_id_seq TO anon;
GRANT ALL ON SEQUENCE public.route_coverage_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.route_coverage_id_seq TO service_role;


--
-- TOC entry 5567 (class 0 OID 0)
-- Dependencies: 413
-- Name: TABLE route_district_delivery_times; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.route_district_delivery_times TO anon;
GRANT ALL ON TABLE public.route_district_delivery_times TO authenticated;
GRANT ALL ON TABLE public.route_district_delivery_times TO service_role;


--
-- TOC entry 5569 (class 0 OID 0)
-- Dependencies: 412
-- Name: SEQUENCE route_district_delivery_times_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.route_district_delivery_times_id_seq TO anon;
GRANT ALL ON SEQUENCE public.route_district_delivery_times_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.route_district_delivery_times_id_seq TO service_role;


--
-- TOC entry 5570 (class 0 OID 0)
-- Dependencies: 415
-- Name: TABLE route_district_visit_days; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.route_district_visit_days TO anon;
GRANT ALL ON TABLE public.route_district_visit_days TO authenticated;
GRANT ALL ON TABLE public.route_district_visit_days TO service_role;


--
-- TOC entry 5572 (class 0 OID 0)
-- Dependencies: 414
-- Name: SEQUENCE route_district_visit_days_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.route_district_visit_days_id_seq TO anon;
GRANT ALL ON SEQUENCE public.route_district_visit_days_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.route_district_visit_days_id_seq TO service_role;


--
-- TOC entry 5573 (class 0 OID 0)
-- Dependencies: 395
-- Name: TABLE route_visit_days; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.route_visit_days TO anon;
GRANT ALL ON TABLE public.route_visit_days TO authenticated;
GRANT ALL ON TABLE public.route_visit_days TO service_role;


--
-- TOC entry 5574 (class 0 OID 0)
-- Dependencies: 394
-- Name: TABLE routes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.routes TO anon;
GRANT ALL ON TABLE public.routes TO authenticated;
GRANT ALL ON TABLE public.routes TO service_role;


--
-- TOC entry 5575 (class 0 OID 0)
-- Dependencies: 458
-- Name: TABLE settlement_adjustments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settlement_adjustments TO anon;
GRANT ALL ON TABLE public.settlement_adjustments TO authenticated;
GRANT ALL ON TABLE public.settlement_adjustments TO service_role;


--
-- TOC entry 5576 (class 0 OID 0)
-- Dependencies: 433
-- Name: TABLE settlement_period_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settlement_period_items TO anon;
GRANT ALL ON TABLE public.settlement_period_items TO authenticated;
GRANT ALL ON TABLE public.settlement_period_items TO service_role;


--
-- TOC entry 5577 (class 0 OID 0)
-- Dependencies: 432
-- Name: TABLE settlement_periods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settlement_periods TO anon;
GRANT ALL ON TABLE public.settlement_periods TO authenticated;
GRANT ALL ON TABLE public.settlement_periods TO service_role;


--
-- TOC entry 5578 (class 0 OID 0)
-- Dependencies: 434
-- Name: TABLE settlement_schedule_targets; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settlement_schedule_targets TO anon;
GRANT ALL ON TABLE public.settlement_schedule_targets TO authenticated;
GRANT ALL ON TABLE public.settlement_schedule_targets TO service_role;


--
-- TOC entry 5579 (class 0 OID 0)
-- Dependencies: 431
-- Name: TABLE settlement_schedules; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.settlement_schedules TO anon;
GRANT ALL ON TABLE public.settlement_schedules TO authenticated;
GRANT ALL ON TABLE public.settlement_schedules TO service_role;


--
-- TOC entry 5580 (class 0 OID 0)
-- Dependencies: 440
-- Name: TABLE shipment_attachments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_attachments TO anon;
GRANT ALL ON TABLE public.shipment_attachments TO authenticated;
GRANT ALL ON TABLE public.shipment_attachments TO service_role;


--
-- TOC entry 5581 (class 0 OID 0)
-- Dependencies: 428
-- Name: TABLE shipment_contact_methods; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_contact_methods TO anon;
GRANT ALL ON TABLE public.shipment_contact_methods TO authenticated;
GRANT ALL ON TABLE public.shipment_contact_methods TO service_role;


--
-- TOC entry 5582 (class 0 OID 0)
-- Dependencies: 445
-- Name: TABLE shipment_customer_location_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_customer_location_requests TO service_role;


--
-- TOC entry 5583 (class 0 OID 0)
-- Dependencies: 457
-- Name: TABLE shipment_delivery_financial_amount_changes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_delivery_financial_amount_changes TO anon;
GRANT ALL ON TABLE public.shipment_delivery_financial_amount_changes TO authenticated;
GRANT ALL ON TABLE public.shipment_delivery_financial_amount_changes TO service_role;


--
-- TOC entry 5584 (class 0 OID 0)
-- Dependencies: 456
-- Name: TABLE shipment_delivery_financial_records; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_delivery_financial_records TO anon;
GRANT ALL ON TABLE public.shipment_delivery_financial_records TO authenticated;
GRANT ALL ON TABLE public.shipment_delivery_financial_records TO service_role;


--
-- TOC entry 5585 (class 0 OID 0)
-- Dependencies: 436
-- Name: TABLE shipment_evidences; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_evidences TO anon;
GRANT ALL ON TABLE public.shipment_evidences TO authenticated;
GRANT ALL ON TABLE public.shipment_evidences TO service_role;


--
-- TOC entry 5586 (class 0 OID 0)
-- Dependencies: 401
-- Name: TABLE shipment_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_items TO anon;
GRANT ALL ON TABLE public.shipment_items TO authenticated;
GRANT ALL ON TABLE public.shipment_items TO service_role;


--
-- TOC entry 5587 (class 0 OID 0)
-- Dependencies: 435
-- Name: TABLE shipment_sims; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_sims TO anon;
GRANT ALL ON TABLE public.shipment_sims TO authenticated;
GRANT ALL ON TABLE public.shipment_sims TO service_role;


--
-- TOC entry 5588 (class 0 OID 0)
-- Dependencies: 423
-- Name: TABLE shipment_status_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipment_status_history TO anon;
GRANT ALL ON TABLE public.shipment_status_history TO authenticated;
GRANT ALL ON TABLE public.shipment_status_history TO service_role;


--
-- TOC entry 5589 (class 0 OID 0)
-- Dependencies: 425
-- Name: SEQUENCE shipment_tracking_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.shipment_tracking_seq TO anon;
GRANT ALL ON SEQUENCE public.shipment_tracking_seq TO authenticated;
GRANT ALL ON SEQUENCE public.shipment_tracking_seq TO service_role;


--
-- TOC entry 5590 (class 0 OID 0)
-- Dependencies: 400
-- Name: TABLE shipments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.shipments TO anon;
GRANT ALL ON TABLE public.shipments TO authenticated;
GRANT ALL ON TABLE public.shipments TO service_role;


--
-- TOC entry 5593 (class 0 OID 0)
-- Dependencies: 465
-- Name: TABLE system_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.system_settings TO anon;
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE public.system_settings TO authenticated;
GRANT ALL ON TABLE public.system_settings TO service_role;


--
-- TOC entry 5594 (class 0 OID 0)
-- Dependencies: 439
-- Name: TABLE tracking_record_history; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tracking_record_history TO anon;
GRANT ALL ON TABLE public.tracking_record_history TO authenticated;
GRANT ALL ON TABLE public.tracking_record_history TO service_role;


--
-- TOC entry 5595 (class 0 OID 0)
-- Dependencies: 438
-- Name: SEQUENCE tracking_record_history_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tracking_record_history_id_seq TO anon;
GRANT ALL ON SEQUENCE public.tracking_record_history_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.tracking_record_history_id_seq TO service_role;


--
-- TOC entry 5596 (class 0 OID 0)
-- Dependencies: 437
-- Name: TABLE tracking_records; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tracking_records TO anon;
GRANT ALL ON TABLE public.tracking_records TO authenticated;
GRANT ALL ON TABLE public.tracking_records TO service_role;


--
-- TOC entry 5597 (class 0 OID 0)
-- Dependencies: 464
-- Name: TABLE user_notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_notifications TO anon;
GRANT ALL ON TABLE public.user_notifications TO authenticated;
GRANT ALL ON TABLE public.user_notifications TO service_role;


--
-- TOC entry 5598 (class 0 OID 0)
-- Dependencies: 389
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- TOC entry 5599 (class 0 OID 0)
-- Dependencies: 446
-- Name: TABLE messages_2026_09_28; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages_2026_09_28 TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages_2026_09_28 TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages_2026_09_28 TO dashboard_user;


--
-- TOC entry 5600 (class 0 OID 0)
-- Dependencies: 447
-- Name: TABLE messages_2026_09_29; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages_2026_09_29 TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages_2026_09_29 TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages_2026_09_29 TO dashboard_user;


--
-- TOC entry 5601 (class 0 OID 0)
-- Dependencies: 451
-- Name: TABLE messages_2026_09_30; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages_2026_09_30 TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages_2026_09_30 TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages_2026_09_30 TO dashboard_user;


--
-- TOC entry 5602 (class 0 OID 0)
-- Dependencies: 452
-- Name: TABLE messages_2026_10_01; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages_2026_10_01 TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages_2026_10_01 TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages_2026_10_01 TO dashboard_user;


--
-- TOC entry 5603 (class 0 OID 0)
-- Dependencies: 454
-- Name: TABLE messages_2026_10_02; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages_2026_10_02 TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages_2026_10_02 TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages_2026_10_02 TO dashboard_user;


--
-- TOC entry 5604 (class 0 OID 0)
-- Dependencies: 459
-- Name: TABLE messages_2026_10_03; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages_2026_10_03 TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages_2026_10_03 TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages_2026_10_03 TO dashboard_user;


--
-- TOC entry 5605 (class 0 OID 0)
-- Dependencies: 466
-- Name: TABLE messages_2026_10_04; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE realtime.messages_2026_10_04 TO postgres;
GRANT SELECT,INSERT ON TABLE realtime.messages_2026_10_04 TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE realtime.messages_2026_10_04 TO dashboard_user;


--
-- TOC entry 5606 (class 0 OID 0)
-- Dependencies: 378
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;


--
-- TOC entry 5607 (class 0 OID 0)
-- Dependencies: 377
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;


--
-- TOC entry 5609 (class 0 OID 0)
-- Dependencies: 380
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- TOC entry 5610 (class 0 OID 0)
-- Dependencies: 384
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- TOC entry 5611 (class 0 OID 0)
-- Dependencies: 385
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- TOC entry 5613 (class 0 OID 0)
-- Dependencies: 381
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- TOC entry 5614 (class 0 OID 0)
-- Dependencies: 382
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- TOC entry 5615 (class 0 OID 0)
-- Dependencies: 383
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- TOC entry 5616 (class 0 OID 0)
-- Dependencies: 386
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- TOC entry 5617 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- TOC entry 5618 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- TOC entry 2834 (class 826 OID 16557)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2835 (class 826 OID 16558)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2833 (class 826 OID 16556)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2843 (class 826 OID 16636)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2842 (class 826 OID 16635)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- TOC entry 2841 (class 826 OID 16634)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2846 (class 826 OID 16591)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2845 (class 826 OID 16590)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2844 (class 826 OID 16589)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2838 (class 826 OID 16571)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2840 (class 826 OID 16570)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2839 (class 826 OID 16569)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2826 (class 826 OID 16494)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2827 (class 826 OID 16495)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2825 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2829 (class 826 OID 16497)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2824 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2828 (class 826 OID 16496)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2836 (class 826 OID 16561)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2837 (class 826 OID 16562)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2847 (class 826 OID 16560)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT SELECT,INSERT ON TABLES TO postgres WITH GRANT OPTION;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2832 (class 826 OID 16550)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2831 (class 826 OID 16549)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2830 (class 826 OID 16548)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 4060 (class 3466 OID 16575)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- TOC entry 4063 (class 3466 OID 16654)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- TOC entry 4065 (class 3466 OID 16666)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- TOC entry 4064 (class 3466 OID 16657)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- TOC entry 4061 (class 3466 OID 16576)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- TOC entry 4062 (class 3466 OID 16577)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

-- Completed on 2026-09-30 21:16:17

--
-- PostgreSQL database dump complete
--

\unrestrict Xy5EfpaJAWLfUqaXmKgSgpAEZqN50IHxUIi5ikpqC1gUUlkwVxVXAanwsn4ZN4l

