@echo off
echo Testing PostgreSQL passwords...
echo.

set PGPASSWORD=postgres
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT 'SUCCESS with password: postgres'" 2>nul
if %errorlevel%==0 goto found

set PGPASSWORD=admin
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT 'SUCCESS with password: admin'" 2>nul
if %errorlevel%==0 goto found

set PGPASSWORD=root
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT 'SUCCESS with password: root'" 2>nul
if %errorlevel%==0 goto found

set PGPASSWORD=password
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT 'SUCCESS with password: password'" 2>nul
if %errorlevel%==0 goto found

set PGPASSWORD=123456
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "SELECT 'SUCCESS with password: 123456'" 2>nul
if %errorlevel%==0 goto found

echo.
echo None of the common passwords worked.
echo Please check pgAdmin or reset your PostgreSQL password.
pause
exit

:found
echo.
echo Password found! Update your .env file with this password.
pause
