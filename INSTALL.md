# Big Arte

## Instalación Rápida

### 1. Backend (Laravel)
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
# Configurar base de datos en .env
php artisan migrate
php artisan db:seed
php artisan serve
```

### 2. Frontend (React)
```bash
cd frontend
npm install
npm start
```

### 3. Credenciales por defecto
- Usuario: admin@bigart.com
- Contraseña: password

## Estructura del Proyecto

- `backend/` - API Laravel
- `frontend/` - Aplicación React
- `README.md` - Documentación completa

## Comandos Útiles

### Backend
- `php artisan migrate:fresh --seed` - Recrear base de datos con datos de prueba
- `php artisan route:list` - Ver todas las rutas API
- `php artisan tinker` - Console interactivo

### Frontend  
- `npm run build` - Crear build de producción
- `npm test` - Ejecutar tests

## URLs de Desarrollo
- API: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/api/health
