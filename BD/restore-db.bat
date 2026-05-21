@echo off

set /p PROJECT_ID=Supabase Project ID:

set /p DB_USER=Database user [postgres]:

if "%DB_USER%"=="" (
set DB_USER=postgres
)

set /p DB_PASSWORD=Database password:

set /p SQL_FILE=Archivo SQL:

if not exist "%SQL_FILE%" (
echo Archivo no encontrado
pause
exit /b
)

set PGPASSWORD=%DB_PASSWORD%

psql ^
-h db.%PROJECT_ID%.supabase.co ^
-U %DB_USER% ^
-d postgres ^
-f "%SQL_FILE%"

if %ERRORLEVEL%==0 (
echo.
echo Restauracion completada
) else (
echo.
echo Error restaurando
)

pause