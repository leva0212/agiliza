#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# SysLogistics
# Clonar Supabase PRODUCCIÓN -> DESARROLLO
#
# Copia:
#   - Esquema public
#   - Datos public
#   - FK, índices, triggers y policies
#   - auth.users
#   - auth.identities
#   - Configuración de storage.buckets
#
# NO copia:
#   - Archivos físicos de Storage
#   - storage.objects
#   - Sesiones activas
#
# PRODUCCIÓN solamente se lee.
# DEV se reconstruye.
# ============================================================


# ============================================================
# FUNCIONES
# ============================================================

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "ERROR: No se encontró '$1' en Git Bash." >&2
    exit 1
  }
}


read_connection() {
  local label="$1"
  local value=""
  local password=""

  printf 'Pega la URL de %s sustituyendo la contraseña por {PASSWORD}: ' "$label"
  read -r value

  if [[ "$value" != *"{PASSWORD}"* && "$value" != *"[YOUR-PASSWORD]"* ]]; then
    echo
    echo "ERROR:"
    echo "La URL de $label debe contener:"
    echo
    echo "  {PASSWORD}"
    echo
    echo "o"
    echo
    echo "  [YOUR-PASSWORD]"
    echo
    echo "No pegues la contraseña dentro de la URL."
    exit 1
  fi

  printf 'Contraseña de base de datos de %s: ' "$label"
  read -r -s password
  printf '\n'

  # Quitamos el placeholder completo de usuario:password.
  # La contraseña real se enviará mediante PGPASSWORD.
  CONNECTION_URL=$(printf '%s' "$value" |
    sed -E 's/:\{PASSWORD\}|:\[YOUR-PASSWORD\]//')

  CONNECTION_PASSWORD="$password"
}


cleanup_passwords() {
  unset production_password 2>/dev/null || true
  unset development_password 2>/dev/null || true
  unset CONNECTION_PASSWORD 2>/dev/null || true
}

trap cleanup_passwords EXIT


# ============================================================
# VALIDAR HERRAMIENTAS
# ============================================================

require_command pg_dump
require_command pg_restore
require_command psql


# ============================================================
# CONEXIONES
# ============================================================

read_connection "PRODUCCIÓN"

production_url="$CONNECTION_URL"
production_password="$CONNECTION_PASSWORD"


read_connection "DESARROLLO"

development_url="$CONNECTION_URL"
development_password="$CONNECTION_PASSWORD"


# ============================================================
# CONFIRMACIÓN
# ============================================================

echo
echo "============================================================"
echo " ADVERTENCIA"
echo "============================================================"
echo
echo "Este proceso:"
echo
echo "  - NO modifica Producción."
echo "  - ELIMINA completamente el esquema public de DEV."
echo "  - Copia el esquema public actual de Producción."
echo "  - Copia los datos actuales de Producción."
echo "  - Copia auth.users y auth.identities."
echo "  - Sincroniza la configuración de storage.buckets."
echo "  - NO copia archivos físicos de Storage."
echo "  - NO copia storage.objects."
echo

read -r -p "Escribe COPIAR A DEV para continuar: " confirmation

if [[ "$confirmation" != "COPIAR A DEV" ]]; then
  echo
  echo "Operación cancelada."
  echo "Producción y DEV no fueron modificados."
  exit 0
fi


# ============================================================
# DIRECTORIO TEMPORAL
# ============================================================

backup_directory="$(mktemp -d \
  "${TMPDIR:-/tmp}/syslogistics-supabase-clone-XXXXXX")"

public_dump="$backup_directory/public.dump"
auth_data="$backup_directory/auth-users.sql"
bucket_data="$backup_directory/storage-buckets.sql"


echo
echo "Archivos temporales:"
echo "$backup_directory"
echo


# ============================================================
# 1/9
# EXPORTAR PUBLIC
# ============================================================

echo "1/9 Exportando esquema y datos de public desde Producción..."

PGPASSWORD="$production_password" pg_dump \
  --dbname="$production_url" \
  --schema=public \
  --format=custom \
  --no-owner \
  --no-privileges \
  --file="$public_dump"


# ============================================================
# 2/9
# EXPORTAR AUTH
# ============================================================

echo "2/9 Exportando usuarios e identidades de Auth..."

PGPASSWORD="$production_password" pg_dump \
  --dbname="$production_url" \
  --data-only \
  --table=auth.users \
  --table=auth.identities \
  --no-owner \
  --no-privileges \
  --file="$auth_data"


# ============================================================
# 3/9
# EXPORTAR CONFIGURACIÓN DE BUCKETS
#
# Generamos directamente sentencias SQL.
#
# quote_literal() maneja correctamente textos.
# NULL se conserva como NULL real.
# ============================================================

echo "3/9 Exportando configuración de buckets..."

PGPASSWORD="$production_password" psql \
  --dbname="$production_url" \
  --tuples-only \
  --no-align \
  --set=ON_ERROR_STOP=1 \
  --command="
SELECT
  'INSERT INTO storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types
   ) VALUES (' ||
      quote_literal(id) || ', ' ||
      quote_literal(name) || ', ' ||
      public::text || ', ' ||
      CASE
        WHEN file_size_limit IS NULL
          THEN 'NULL'
        ELSE file_size_limit::text
      END || ', ' ||
      CASE
        WHEN allowed_mime_types IS NULL
          THEN 'NULL'
        ELSE quote_literal(allowed_mime_types::text) || '::text[]'
      END ||
   ')
   ON CONFLICT (id)
   DO UPDATE SET
      name = EXCLUDED.name,
      public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;'
FROM storage.buckets
ORDER BY id;
" > "$bucket_data"


# ============================================================
# 4/9
# ELIMINAR PUBLIC DE DEV
# ============================================================

echo "4/9 Eliminando esquema public de Desarrollo..."

PGPASSWORD="$development_password" psql \
  --dbname="$development_url" \
  --set=ON_ERROR_STOP=1 \
  --single-transaction \
  <<'SQL'

DROP SCHEMA IF EXISTS public CASCADE;

SQL


# ============================================================
# 5/9
# RESTAURAR PRE-DATA
#
# Aquí se crean:
#   - schema public
#   - tipos
#   - funciones
#   - tablas
#
# Todavía no se crean las FK.
# ============================================================

echo "5/9 Restaurando estructura base de public..."

PGPASSWORD="$development_password" pg_restore \
  --dbname="$development_url" \
  --section=pre-data \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  "$public_dump"


# ============================================================
# 6/9
# RESTAURAR AUTH
# ============================================================

echo "6/9 Restaurando usuarios de Auth..."

echo "    Limpiando usuarios existentes de DEV..."

PGPASSWORD="$development_password" psql \
  --dbname="$development_url" \
  --set=ON_ERROR_STOP=1 \
  --single-transaction \
  <<'SQL'

DELETE FROM auth.identities;
DELETE FROM auth.users;

SQL


echo "    Restaurando usuarios e identidades..."

PGPASSWORD="$development_password" psql \
  --dbname="$development_url" \
  --set=ON_ERROR_STOP=1 \
  --single-transaction \
  --file="$auth_data"


# ============================================================
# 7/9
# RESTAURAR DATOS PUBLIC
#
# Los datos se insertan ANTES de crear las FK.
# Esto evita el problema de la referencia circular:
#
# profiles.created_by -> profiles.id
# ============================================================

echo "7/9 Restaurando datos de public..."

PGPASSWORD="$development_password" pg_restore \
  --dbname="$development_url" \
  --section=data \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  "$public_dump"


# ============================================================
# 8/9
# RESTAURAR POST-DATA
#
# Después de insertar los datos se crean:
#   - FK
#   - índices
#   - triggers
#   - policies
#   - constraints
# ============================================================

echo "8/9 Restaurando FK, índices, triggers y policies..."

PGPASSWORD="$development_password" pg_restore \
  --dbname="$development_url" \
  --section=post-data \
  --no-owner \
  --no-privileges \
  --exit-on-error \
  "$public_dump"


# ============================================================
# 9/9
# SINCRONIZAR BUCKETS
#
# IMPORTANTE:
#
# NO hacemos:
#
#   DELETE FROM storage.buckets
#
# porque Supabase bloquea la eliminación directa mediante
# storage.protect_delete().
#
# Tampoco copiamos storage.objects ni archivos físicos.
#
# Los buckets existentes se actualizan y los faltantes
# se crean mediante UPSERT.
# ============================================================

echo "9/9 Sincronizando configuración de buckets..."

PGPASSWORD="$development_password" psql \
  --dbname="$development_url" \
  --set=ON_ERROR_STOP=1 \
  --single-transaction \
  --file="$bucket_data"


# ============================================================
# VERIFICACIÓN FINAL
# ============================================================

echo
echo "Verificando buckets en DEV..."

PGPASSWORD="$development_password" psql \
  --dbname="$development_url" \
  --set=ON_ERROR_STOP=1 \
  --command="
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
ORDER BY id;
"


# ============================================================
# FINAL
# ============================================================

echo
echo "============================================================"
echo " COPIA COMPLETADA"
echo "============================================================"
echo
echo "Producción NO fue modificada."
echo "DEV fue reconstruido usando el estado ACTUAL de Producción."
echo
echo "RESULTADO:"
echo
echo "  [OK] Esquema public"
echo "  [OK] Datos public"
echo "  [OK] FK y constraints"
echo "  [OK] Índices"
echo "  [OK] Triggers"
echo "  [OK] Policies / RLS"
echo "  [OK] auth.users"
echo "  [OK] auth.identities"
echo "  [OK] Configuración de storage.buckets"
echo
echo "NO COPIADO:"
echo
echo "  [--] Archivos físicos de Storage"
echo "  [--] storage.objects"
echo "  [--] Sesiones activas"
echo
echo "Respaldo temporal de esta ejecución:"
echo "$backup_directory"
echo
echo "============================================================"