@echo off
echo 🎨 Instalando Big Arte - Sistema de Inventario y Facturación
echo ============================================================

:: Verificar que Node.js y PHP estén instalados
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js no está instalado. Instalalo primero.
    pause
    exit /b 1
)

where php >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ PHP no está instalado. Instalalo primero.
    pause
    exit /b 1
)

where composer >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Composer no está instalado. Instalalo primero.
    pause
    exit /b 1
)

echo ✅ Verificando dependencias...

:: Instalar backend
echo 📦 Instalando backend (Laravel)...
cd backend
call composer install --no-dev --optimize-autoloader

if not exist .env (
    echo 🔧 Configurando archivo de entorno...
    copy .env.example .env
    php artisan key:generate
)

echo 📊 Ejecutando migraciones y seeders...
php artisan migrate --force
php artisan db:seed --force

cd ..

:: Instalar frontend  
echo ⚛️  Instalando frontend (React)...
cd frontend
call npm install --production

echo 🔨 Creando build de producción...
call npm run build

cd ..

echo 🎉 ¡Instalación completada!
echo.
echo 📋 Siguientes pasos:
echo 1. Configurar base de datos en backend/.env
echo 2. Ejecutar: cd backend && php artisan serve
echo 3. En otra terminal: cd frontend && npm start
echo 4. Acceder a: http://localhost:3000
echo 5. Login: admin@bigart.com / password
echo.
echo 📚 Ver README.md para más información
pause
