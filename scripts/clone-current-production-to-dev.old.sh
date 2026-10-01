#!/usr/bin/env bash
set -euo pipefail

require_command() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "No se encontró $1 en Git Bash." >&2
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
    echo "La URL de $label debe contener {PASSWORD} o [YOUR-PASSWORD], no la contraseña real." >&2
    exit 1
  fi

  printf 'Contraseña de base de datos de %s: ' "$label"
  read -r -s password
  printf '\n'

  CONNECTION_URL=$(printf '%s' "$value" | sed -E 's/:\{PASSWORD\}|:\[YOUR-PASSWORD\]//')
  CONNECTION_PASSWORD="$password"
}

require_command pg_dump
require_command psql

read_connection "PRODUCCIÓN"
production_url="$CONNECTION_URL"
production_password="$CONNECTION_PASSWORD"

read_connection "DESARROLLO"
development_url="$CONNECTION_URL"
development_password="$CONNECTION_PASSWORD"

echo
echo "Este proceso reemplazará el esquema public y los datos del proyecto DEV."
read -r -p "Escribe COPIAR A DEV para continuar: " confirmation
if [[ "$confirmation" != "COPIAR A DEV" ]]; then
  echo "Operación cancelada. Producción y Dev no fueron modificados."
  exit 0
fi

backup_directory="$(mktemp -d "${TMPDIR:-/tmp}/syslogistics-supabase-clone-XXXXXX")"
public_schema="$backup_directory/public-schema.sql"
auth_data="$backup_directory/auth-users.sql"
public_data="$backup_directory/public-data.sql"
bucket_data="$backup_directory/storage-buckets.sql"

echo "1/7 Exportando esquema público desde Producción..."
PGPASSWORD="$production_password" pg_dump --dbname="$production_url" --schema=public --schema-only --clean --if-exists --no-owner --no-privileges --file="$public_schema"

echo "2/7 Exportando usuarios e identidades de Auth..."
PGPASSWORD="$production_password" pg_dump --dbname="$production_url" --data-only --table=auth.users --table=auth.identities --no-owner --no-privileges --file="$auth_data"

echo "3/7 Exportando datos públicos..."
PGPASSWORD="$production_password" pg_dump --dbname="$production_url" --schema=public --data-only --no-owner --no-privileges --file="$public_data"

echo "4/7 Exportando configuración de buckets..."
PGPASSWORD="$production_password" pg_dump --dbname="$production_url" --data-only --table=storage.buckets --no-owner --no-privileges --file="$bucket_data"

echo "5/7 Restaurando esquema en Desarrollo..."
PGPASSWORD="$development_password" psql --dbname="$development_url" --set=ON_ERROR_STOP=1 --single-transaction --file="$public_schema"

echo "6/7 Restaurando usuarios de Auth y datos públicos..."
PGPASSWORD="$development_password" psql --dbname="$development_url" --set=ON_ERROR_STOP=1 --single-transaction --file="$auth_data" --file="$public_data"

echo "7/7 Restaurando configuración de buckets..."
PGPASSWORD="$development_password" psql --dbname="$development_url" --set=ON_ERROR_STOP=1 --single-transaction --file="$bucket_data"

unset production_password development_password CONNECTION_PASSWORD
echo
echo "Copia completada en Desarrollo."
echo "Respaldo temporal conservado en: $backup_directory"
echo "Los archivos físicos de Storage y las sesiones activas no se copian; los usuarios sí conservan sus contraseñas."
