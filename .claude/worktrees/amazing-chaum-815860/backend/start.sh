#!/bin/bash
echo "=== Ensuring storage directories exist ==="
mkdir -p storage/fonts storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chmod -R 775 storage bootstrap/cache 2>/dev/null || true

echo "=== Running migrations ==="
php artisan migrate --force

echo "=== Clearing caches ==="
php artisan config:clear || true
php artisan cache:clear || true

echo "=== Starting server on port ${PORT:-8000} ==="
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
