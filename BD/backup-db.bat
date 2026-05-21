@echo off

set /p DB_PASSWORD=Database password:

set PGPASSWORD=%DB_PASSWORD%

for /f %%i in ('powershell -command "Get-Date -Format yyyyMMdd_HHmmss"') do set DATE=%%i

echo.
echo Creando backup...
echo.

pg_dump ^
-h aws-1-us-west-2.pooler.supabase.com ^
-p 5432 ^
-U postgres.wlohkvgcccidxoaqbsqx ^
-d postgres ^
--clean ^
--if-exists ^
--quote-all-identifiers ^
-f backup_%DATE%.sql

if %ERRORLEVEL%==0 (
    echo.
    echo ✅ Backup creado correctamente:
    echo backup_%DATE%.sql
) else (
    echo.
    echo ❌ Error creando backup
)

pause