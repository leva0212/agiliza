param(
  [string]$ProductionDbUrl,
  [string]$DevelopmentDbUrl
)

$ErrorActionPreference = "Stop"

function Get-PlainTextSecret([string]$Prompt) {
  $secureValue = Read-Host -Prompt $Prompt -AsSecureString
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function Complete-ConnectionString([string]$Value, [string]$Label) {
  if (-not $Value) {
    $Value = Read-Host -Prompt "Pega la URL de $Label sustituyendo la contraseña por {PASSWORD}"
  }

  if ($Value -notmatch "\{PASSWORD\}|\[YOUR-PASSWORD\]") {
    throw "La URL de $Label debe contener {PASSWORD} o [YOUR-PASSWORD], no la contraseña real."
  }

  $password = Get-PlainTextSecret "Contraseña de base de datos de $Label"
  $urlWithoutPassword = $Value -replace ':\{PASSWORD\}', '' -replace ':\[YOUR-PASSWORD\]', ''
  return [PSCustomObject]@{
    Url = $urlWithoutPassword
    Password = $password
  }
}

$pgDump = Get-Command pg_dump -ErrorAction Stop
$psql = Get-Command psql -ErrorAction Stop

$production = Complete-ConnectionString $ProductionDbUrl "PRODUCCIÓN"
$development = Complete-ConnectionString $DevelopmentDbUrl "DESARROLLO"

Write-Host "" 
Write-Host "Este proceso reemplazará el esquema public y los datos del proyecto DEV." -ForegroundColor Yellow
$confirmation = Read-Host "Escribe COPIAR A DEV para continuar"
if ($confirmation -cne "COPIAR A DEV") {
  Write-Host "Operación cancelada. Producción y Dev no fueron modificados."
  exit 0
}

$backupDirectory = Join-Path $env:TEMP ("syslogistics-supabase-clone-" + (Get-Date -Format "yyyyMMdd-HHmmss"))
New-Item -ItemType Directory -Path $backupDirectory | Out-Null

$publicSchema = Join-Path $backupDirectory "public-schema.sql"
$authData = Join-Path $backupDirectory "auth-users.sql"
$publicData = Join-Path $backupDirectory "public-data.sql"
$bucketData = Join-Path $backupDirectory "storage-buckets.sql"
$originalPgPassword = $env:PGPASSWORD

try {
  # El Session Pooler de Supabase recibe la contraseña de forma fiable por
  # PGPASSWORD. La URL entregada al cliente no contiene secretos.
  $env:PGPASSWORD = $production.Password

  Write-Host "1/7 Exportando esquema público desde Producción..."
  & $pgDump.Source --dbname=$production.Url --schema=public --schema-only --clean --if-exists --no-owner --no-privileges --file=$publicSchema
  if ($LASTEXITCODE -ne 0) { throw "No fue posible exportar el esquema público." }

  Write-Host "2/7 Exportando usuarios e identidades de Auth..."
  & $pgDump.Source --dbname=$production.Url --data-only --table=auth.users --table=auth.identities --no-owner --no-privileges --file=$authData
  if ($LASTEXITCODE -ne 0) { throw "No fue posible exportar los usuarios de Auth." }

  Write-Host "3/7 Exportando datos públicos..."
  & $pgDump.Source --dbname=$production.Url --schema=public --data-only --no-owner --no-privileges --file=$publicData
  if ($LASTEXITCODE -ne 0) { throw "No fue posible exportar los datos públicos." }

  Write-Host "4/7 Exportando configuración de buckets..."
  & $pgDump.Source --dbname=$production.Url --data-only --table=storage.buckets --no-owner --no-privileges --file=$bucketData
  if ($LASTEXITCODE -ne 0) { throw "No fue posible exportar la configuración de buckets." }

  Write-Host "5/7 Restaurando esquema en Desarrollo..."
  $env:PGPASSWORD = $development.Password
  & $psql.Source --dbname=$development.Url --set=ON_ERROR_STOP=1 --single-transaction --file=$publicSchema
  if ($LASTEXITCODE -ne 0) { throw "No fue posible restaurar el esquema en Desarrollo." }

  Write-Host "6/7 Restaurando usuarios de Auth y datos públicos..."
  & $psql.Source --dbname=$development.Url --set=ON_ERROR_STOP=1 --single-transaction --file=$authData --file=$publicData
  if ($LASTEXITCODE -ne 0) { throw "No fue posible restaurar los usuarios o los datos en Desarrollo." }

  Write-Host "7/7 Restaurando configuración de buckets..."
  & $psql.Source --dbname=$development.Url --set=ON_ERROR_STOP=1 --single-transaction --file=$bucketData
  if ($LASTEXITCODE -ne 0) { throw "No fue posible restaurar los buckets en Desarrollo." }

  Write-Host "" 
  Write-Host "Copia completada en Desarrollo." -ForegroundColor Green
  Write-Host "Respaldo temporal conservado en: $backupDirectory"
  Write-Host "Los archivos físicos de Storage y las sesiones activas no se copian; los usuarios sí conservan sus contraseñas."
} catch {
  Write-Error $_
  Write-Host "El respaldo temporal se conserva en: $backupDirectory" -ForegroundColor Yellow
  exit 1
} finally {
  if ($null -eq $originalPgPassword) {
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
  } else {
    $env:PGPASSWORD = $originalPgPassword
  }
}
