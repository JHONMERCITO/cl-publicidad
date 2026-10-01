#!/bin/bash

# Script de instalación para Big Arte
echo "🎨 Instalando Big Arte - Sistema de Inventario y Facturación"
echo "============================================================"

# Verificar que Node.js y PHP estén instalados
command -v node >/dev/null 2>&1 || { echo "❌ Node.js no está instalado. Instalalo primero." >&2; exit 1; }
command -v php >/dev/null 2>&1 || { echo "❌ PHP no está instalado. Instalalo primero." >&2; exit 1; }
command -v composer >/dev/null 2>&1 || { echo "❌ Composer no está instalado. Instalalo primero." >&2; exit 1; }

echo "✅ Verificando dependencias..."

# Instalar backend
echo "📦 Instalando backend (Laravel)..."
cd backend
composer install --no-dev --optimize-autoloader

if [ ! -f .env ]; then
    echo "🔧 Configurando archivo de entorno..."
    cp .env.example .env
    php artisan key:generate
fi

echo "📊 Ejecutando migraciones y seeders..."
php artisan migrate --force
php artisan db:seed --force

cd ..

# Instalar frontend  
echo "⚛️  Instalando frontend (React)..."
cd frontend
npm install --production

echo "🔨 Creando build de producción..."
npm run build

cd ..

echo "🎉 ¡Instalación completada!"
echo ""
echo "📋 Siguientes pasos:"
echo "1. Configurar base de datos en backend/.env"
echo "2. Ejecutar: cd backend && php artisan serve"
echo "3. En otra terminal: cd frontend && npm start"
echo "4. Acceder a: http://localhost:3000"
echo "5. Login: admin@bigart.com / password"
echo ""
echo "📚 Ver README.md para más información"
