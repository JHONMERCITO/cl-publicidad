# 🚀 SOLUCION RAPIDA - BIG ARTE (PowerShell)
# ===============================================

Write-Host "🔧 Configurando Backend Laravel..." -ForegroundColor Green
Write-Host ""

Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
composer install

Write-Host ""
Write-Host "📊 Recreando base de datos y datos iniciales..." -ForegroundColor Yellow
php artisan migrate:fresh --seed --force

Write-Host ""
Write-Host "✅ Backend configurado correctamente" -ForegroundColor Green
Write-Host "🔑 Usuario creado: admin@bigart.com / password" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Iniciando servidor en http://localhost:8000..." -ForegroundColor Green
Write-Host "⚠️  IMPORTANTE: Deja esta ventana abierta" -ForegroundColor Red
Write-Host "⚠️  Abre otra terminal para iniciar el frontend" -ForegroundColor Red
Write-Host ""
Write-Host "📝 En la otra terminal ejecuta:" -ForegroundColor Yellow
Write-Host "   cd ../frontend" -ForegroundColor White
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Luego accede a: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔐 Credenciales: admin@bigart.com / password" -ForegroundColor Cyan
Write-Host ""

php artisan serve
