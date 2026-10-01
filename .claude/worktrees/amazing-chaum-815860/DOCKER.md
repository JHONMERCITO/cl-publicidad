# Big Arte - Despliegue con Docker

Este directorio contiene los archivos necesarios para desplegar Big Arte usando Docker y Docker Compose.

## Instalación con Docker

### Prerequisitos
- Docker
- Docker Compose

### Pasos de instalación

1. **Clonar o descomprimir el proyecto**
```bash
cd big-arte
```

2. **Construir y levantar los servicios**
```bash
docker-compose up -d --build
```

3. **Ejecutar migraciones y seeders**
```bash
docker-compose exec backend php artisan migrate --seed
```

4. **Generar clave de la aplicación**
```bash
docker-compose exec backend php artisan key:generate
```

### Servicios disponibles

- **Frontend (React)**: http://localhost:3000
- **Backend API (Laravel)**: http://localhost:8000
- **Adminer (Base de datos)**: http://localhost:8080
- **MySQL**: localhost:3306

### Credenciales por defecto

**Aplicación:**
- Usuario: admin@bigart.com
- Contraseña: password

**Base de datos (Adminer):**
- Sistema: MySQL
- Servidor: mysql
- Usuario: big_arte_user
- Contraseña: big_arte_password
- Base de datos: big_arte

### Comandos útiles

```bash
# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down

# Parar servicios y eliminar volúmenes
docker-compose down -v

# Reconstruir servicios
docker-compose up -d --build

# Ejecutar comandos en el backend
docker-compose exec backend php artisan [comando]

# Ejecutar comandos en la base de datos
docker-compose exec mysql mysql -u big_arte_user -p big_arte
```

### Estructura de archivos Docker

- `docker-compose.yml` - Configuración principal de servicios
- `backend/Dockerfile` - Imagen para Laravel
- `frontend/Dockerfile` - Imagen para React
- `docker/nginx/laravel.conf` - Configuración nginx para Laravel
- `frontend/nginx.conf` - Configuración nginx para React

### Personalización

#### Variables de entorno
Edita el archivo `backend/.env` para personalizar:
- Configuración de base de datos
- URLs de la aplicación
- Configuraciones de correo
- Otras configuraciones de Laravel

#### Puertos
Modifica los puertos en `docker-compose.yml` si es necesario:
- Frontend: puerto 3000
- Backend: puerto 8000  
- Adminer: puerto 8080
- MySQL: puerto 3306

### Producción

Para producción, considera:
1. Cambiar las contraseñas por defecto
2. Configurar HTTPS con certificados SSL
3. Usar un proxy reverso (nginx/Apache)
4. Configurar backups automáticos de la base de datos
5. Monitoreo y logging
6. Limitar el acceso a Adminer

### Troubleshooting

**Problemas comunes:**

1. **Error de conexión a base de datos**
   - Verifica que el servicio MySQL esté ejecutándose
   - Confirma las credenciales en el archivo .env

2. **Frontend no puede conectar con backend**
   - Verifica la variable REACT_APP_API_URL
   - Confirma que el backend esté ejecutándose en el puerto correcto

3. **Permisos de archivos en Laravel**
   ```bash
   docker-compose exec backend chown -R www-data:www-data /var/www/storage
   docker-compose exec backend chmod -R 755 /var/www/storage
   ```

Para más ayuda, consulta el README.md principal del proyecto.
