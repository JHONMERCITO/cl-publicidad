# Big Arte - Sistema de Inventario y Facturación

## Descripción

Sistema web completo para gestión de inventario y facturación diseñado especialmente para negocios de gigantografía como Big Arte. Incluye control de productos, **sistema de pagos fraccionados**, gestión de gastos, reportes financieros y dashboard con métricas avanzadas.

## 🎯 **NUEVA FUNCIONALIDAD: SISTEMA DE PAGOS FRACCIONADOS**

### ✨ **Características Avanzadas de Pagos**
- **💰 Anticipos Configurables**: El usuario decide el monto del anticipo en cada venta
- **🔄 Múltiples Tipos de Pago**: Anticipo, Abono, Pago Final
- **📊 Seguimiento de Estados**: Cotizado → Con Anticipo → En Producción → Listo para Entrega → Completado
- **💳 Métodos de Pago**: Efectivo, Transferencia, Tarjeta, Cheque
- **📈 Dashboard con Métricas**: Flujo de caja, pagos pendientes, trabajos en proceso
- **🚨 Alertas Inteligentes**: Trabajos que requieren atención
- **📋 Historial Completo**: Todos los pagos de cada recibo registrados

### 🎮 **Flujo de Trabajo Real**
1. **Crear Cotización**: Cliente solicita trabajo, se genera cotización
2. **Cobrar Anticipo**: Usuario define monto personalizado (30%, 50%, 80%, etc.)
3. **Trabajo en Proceso**: Estados automáticos según avance
4. **Pago Final**: Al completar y entregar el trabajo
5. **Reportes**: Análisis completo de flujo de caja y rentabilidad

## Características Principales

### ✅ **Gestión de Usuarios y Roles**
- **Administrador**: Control total del sistema
- **Empleados**: Registro de ventas y consulta de inventario
- Autenticación segura con tokens JWT (Laravel Sanctum)

### ✅ **Módulo de Inventario** *(Independiente de Ventas)*
- CRUD completo de productos
- Control de stock con alertas de stock mínimo
- Historial de movimientos de inventario
- **Inventario separado de ventas** (materiales internos)
- Categorización de productos

### ✅ **Sistema de Facturación/Recibos con Pagos Fraccionados**
- Generación automática de números de recibo
- Gestión completa de clientes
- **Servicios personalizados** (no vinculados a inventario)
- **Anticipos configurables por usuario**
- **Estados avanzados de recibos**:
  - 📋 Cotizado
  - 💰 Con Anticipo
  - 🏭 En Producción
  - 📦 Listo para Entrega
  - ✅ Completado
  - ❌ Cancelado
- **Tipos de pago múltiples**:
  - 🏦 Anticipo
  - 💸 Abono
  - ✅ Pago Final
- Exportación a PDF de recibos
- **Gestión completa de pagos por recibo**

### ✅ **Contabilidad Básica**
- Registro de gastos por categorías
- Cálculo automático de ingresos por ventas
- Reportes de utilidades (ingresos - gastos)
- **Flujo de caja proyectado**
- Filtros por fechas y categorías

### ✅ **Dashboard y Reportes Avanzados**
- **Métricas de Pagos Fraccionados**:
  - 💰 Total de anticipos recibidos
  - 💸 Dinero pendiente de cobro
  - 📊 Progreso de pagos por proyecto
  - 📈 Flujo de caja proyectado
- **Gráficos Especializados**:
  - Pagos por día
  - Distribución de tipos de pago
  - Métodos de pago más usados
- **Alertas Inteligentes**:
  - 🚨 Trabajos listos hace más de 3 días
  - ⏰ Trabajos con anticipo sin avance
  - 📋 Cotizaciones pendientes
- **Reportes Tradicionales**:
  - Ventas por periodo
  - Productos más vendidos
  - Gastos por categoría
  - Utilidades y pérdidas

### ✅ **Interfaz Moderna y Especializada**
- Diseño responsivo con Tailwind CSS
- **Modal especializado para crear ventas con anticipos**
- **Componente de gestión de pagos por recibo**
- **Barras de progreso de pago**
- **Estados visuales avanzados**
- Notificaciones en tiempo real
- Tablas paginadas y filtros avanzados

## Tecnologías Utilizadas

### Backend (Laravel)
- **Laravel 10** - Framework PHP
- **Laravel Sanctum** - Autenticación API
- **MySQL** - Base de datos
- **DomPDF** - Generación de PDFs
- **API REST** - Arquitectura de servicios
- **Modelos Eloquent** con relaciones avanzadas
- **Seeders** con datos realistas de pagos

### Frontend (React)
- **React 18** - Librería de interfaz
- **React Router** - Navegación
- **Tailwind CSS** - Estilos modernos
- **React Hook Form** - Manejo de formularios complejos
- **Recharts** - Gráficos y visualizaciones avanzadas
- **React Hot Toast** - Notificaciones
- **Heroicons** - Iconografía
- **Context API** - Estado global

## 🚀 **INSTALACIÓN RÁPIDA - SISTEMA DE PAGOS**

### **Opción 1: Script Automático (Recomendado)**

```bash
# Linux/Mac
chmod +x setup-payments.sh
./setup-payments.sh

# Windows
setup-payments.bat
```

### **Opción 2: Docker (Más Rápido)**

```bash
docker-compose up -d --build
docker-compose exec backend php artisan migrate --seed
```

### **Opción 3: Manual**

```bash
# Backend
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve

# Frontend  
cd frontend
npm install
npm start
```

## 📊 **CASOS DE PRUEBA INCLUIDOS**

El sistema viene con **datos de prueba realistas** que demuestran todos los casos de uso:

### 🏪 **Escenarios de Pagos Fraccionados**
1. **📋 Solo Cotización**: Cliente pidió presupuesto, sin pagos aún
2. **💰 Con Anticipo**: Cliente pagó 50% y trabajo está en producción
3. **📦 Listo para Entrega**: Trabajo terminado, esperando pago final
4. **✅ Completado Simple**: Pago en 2 partes (anticipo + final)
5. **🔄 Pagos Múltiples**: Proyecto grande con anticipo + 2 abonos + final

### 🏢 **Tipos de Clientes de Prueba**
- Restaurant El Buen Sabor (Gigantografía fachada)
- Farmacia San Juan (Letrero LED)
- Consultorio Dr. Pérez (Vinilo corte)
- Empresa Constructora ABC (Proyecto grande)
- Centro Comercial Plaza (Señalética integral)

## 🎯 **FUNCIONALIDADES ESPECÍFICAS PARA BIG ARTE**

### **Servicios Típicos Incluidos**
- 🖨️ Gigantografía 3x2m - Exterior
- 📜 Banner Roll Up 0.8x2m
- 💡 Letrero Luminoso LED
- ✂️ Vinilo Corte Ploter
- 🎨 Diseño Gráfico Personalizado
- 🔧 Instalación de Rótulo
- 🖨️ Gigantografía Premium 4x3m
- 🌐 Impresión en Lona Mesh

### **Flujos de Trabajo Reales**
- **Trabajos Pequeños** (< Bs 500): 40% anticipo
- **Trabajos Medianos** (Bs 500-2000): 50% anticipo
- **Proyectos Grandes** (> Bs 2000): 30% anticipo, pagos por hitos
- **Trabajos Urgentes**: Pago completo por adelantado
- **Clientes VIP**: Crédito directo sin anticipo

## Instalación Detallada

### Prerequisitos
- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0+

### Backend (Laravel)

1. **Navegar a la carpeta del backend**
```bash
cd backend
```

2. **Instalar dependencias de Composer**
```bash
composer install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con los datos de tu base de datos MySQL
```

4. **Generar clave de aplicación**
```bash
php artisan key:generate
```

5. **Ejecutar migraciones con sistema de pagos**
```bash
php artisan migrate --seed
```

6. **Crear usuario administrador (incluido en seeder)**
```bash
# Ya incluido en UserSeeder
# Usuario: admin@bigart.com
# Contraseña: password
```

7. **Iniciar servidor de desarrollo**
```bash
php artisan serve
```

### Frontend (React)

1. **Navegar a la carpeta del frontend**
```bash
cd frontend
```

2. **Instalar dependencias de NPM**
```bash
npm install
```

3. **Configurar variables de entorno (opcional)**
```bash
# Crear .env.local si necesitas cambiar la URL de la API
echo "REACT_APP_API_URL=http://localhost:8000/api" > .env.local
```

4. **Iniciar aplicación de desarrollo**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 🗂️ **ESTRUCTURA DEL PROYECTO ACTUALIZADA**

```
big-arte/
├── 📂 backend/                 # API Laravel
│   ├── app/
│   │   ├── Models/            # Receipt, Payment, Expense, etc.
│   │   ├── Http/Controllers/  # PaymentController, DashboardController
│   │   └── Http/Middleware/   # Autenticación y roles
│   ├── database/
│   │   ├── migrations/        # Incluye tabla payments
│   │   └── seeders/           # DataSeeder con pagos realistas
│   ├── routes/api.php         # Rutas API completas
│   └── resources/views/       # Templates PDF
│
├── 📂 frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/        # PaymentManager, CreateReceiptModal
│   │   │   └── payments/      # Componentes especializados
│   │   ├── pages/            # Dashboard, Receipts con pagos
│   │   ├── services/         # paymentService, receiptService
│   │   └── utils/            # formatters con funciones de pago
│   └── public/
│
├── 📂 docker/                 # Configuraciones Docker
├── 📄 setup-payments.sh       # Script instalación Linux/Mac
├── 📄 setup-payments.bat      # Script instalación Windows
├── 📄 README.md              # Esta documentación
└── 🚀 docker-compose.yml     # Despliegue completo
```

## 💡 **CÓMO USAR EL SISTEMA DE PAGOS**

### **1. Crear Nueva Venta con Anticipo**
1. Ve a **Ventas** → **Nueva Venta**
2. Completa información del cliente
3. Agrega servicios personalizados (descripción libre)
4. ✅ **Marca "Cobrar anticipo ahora"**
5. Define monto personalizado del anticipo
6. Selecciona método de pago
7. El sistema creará el recibo y registrará el anticipo automáticamente

### **2. Gestionar Pagos de un Recibo**
1. En la lista de recibos, haz clic en 💰 **"Gestionar Pagos"**
2. Ve el progreso de pago con barra visual
3. Agrega nuevos pagos (abonos, pago final)
4. El sistema actualiza automáticamente los estados

### **3. Dashboard Avanzado**
- **Métricas de Flujo de Caja**: Ve dinero en anticipos vs pendiente
- **Alertas**: Trabajos que necesitan atención
- **Gráficos**: Progreso de pagos por día
- **Estados**: Cuántos trabajos en cada etapa

### **4. Filtros Avanzados**
- Filtrar por **estado del trabajo** (cotizado, en producción, etc.)
- Filtrar por **estado de pago** (sin anticipo, con anticipo, completo)
- Búsqueda por cliente, número de recibo, fechas

## 📊 **API ENDPOINTS DE PAGOS**

### Gestión de Pagos
- `GET /api/receipts/{receipt}/payments` - Obtener pagos de un recibo
- `POST /api/receipts/{receipt}/payments` - Agregar pago a un recibo
- `PUT /api/payments/{payment}` - Actualizar pago (solo admin)
- `DELETE /api/payments/{payment}` - Eliminar pago (solo admin)
- `GET /api/reports/payments` - Reporte de pagos por período

### Dashboard con Métricas de Pagos
- `GET /api/dashboard` - Métricas completas incluyendo pagos
- `GET /api/reports/profit-loss` - Reporte con información de pagos

### Ejemplos de Uso API

```javascript
// Agregar anticipo a un recibo
const anticipo = await receiptService.addPayment(receiptId, {
  amount: 500.00,
  type: 'anticipo',
  payment_method: 'transferencia',
  notes: 'Anticipo del 50%'
});

// Obtener pagos de un recibo
const { payments } = await receiptService.getReceiptPayments(receiptId);

// Ver progreso de pago
const progress = calculatePaymentProgress(receipt.paid_amount, receipt.total);
```

## 🔐 **Seguridad y Permisos**

- ✅ **Autenticación JWT** con Laravel Sanctum
- ✅ **Roles diferenciados**: Admin puede modificar/eliminar pagos
- ✅ **Validaciones robustas**: Pagos no pueden exceder el total
- ✅ **Auditoría completa**: Historial de todos los pagos
- ✅ **Protección CSRF** y validaciones de entrada

## 🎨 **Casos de Uso Específicos para Gigantografía**

### **Flujo Típico 1: Gigantografía Restaurante**
1. Cliente pide gigantografía 3x2m para fachada (Bs 450)
2. Se cobra 40% anticipo (Bs 180) para comprar materiales
3. Trabajo pasa a "En Producción"
4. Al terminar, estado "Listo para Entrega"
5. Cliente paga saldo (Bs 270) y recibe su trabajo
6. Estado final: "Completado"

### **Flujo Típico 2: Proyecto Grande (Centro Comercial)**
1. Señalética integral (Bs 5,000)
2. Anticipo inicial 30% (Bs 1,500) - Estado: "Con Anticipo"
3. Abono al 50% avance (Bs 1,500) - Estado: "En Producción"
4. Segundo abono al 80% (Bs 1,000) - Materiales adicionales
5. Pago final al entregar (Bs 1,000) - Estado: "Completado"

## 🚀 **URLs de Acceso**

- **🌐 Frontend**: http://localhost:3000
- **🔧 API Backend**: http://localhost:8000/api
- **📊 Adminer (Docker)**: http://localhost:8080

### 🔑 **Credenciales por Defecto**
- **Usuario:** admin@bigart.com
- **Contraseña:** password
- **Rol:** Administrador

## 🐳 **Despliegue con Docker**

```bash
# Inicial
docker-compose up -d --build

# Configurar base de datos
docker-compose exec backend php artisan migrate --seed

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🔄 **Próximas Funcionalidades Sugeridas**

- [ ] **Facturación electrónica** oficial de Bolivia
- [ ] **Notificaciones automáticas** por email/SMS
- [ ] **Módulo de proveedores** con órdenes de compra
- [ ] **Códigos QR** para seguimiento de trabajos
- [ ] **App móvil** para clientes (ver progreso)
- [ ] **Backup automático** de base de datos
- [ ] **Múltiples sucursales** con inventario separado
- [ ] **Integración contable** con sistemas externos

## 🤝 **Contribuir**

1. Fork del proyecto
2. Crear rama para nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit de cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📜 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 **Soporte Técnico**

Para soporte técnico o consultas sobre el sistema de pagos fraccionados:
- 🐛 Crear un issue en GitHub
- 📧 Email: soporte@bigart.com
- 📚 Consultar documentación en `/docs`

---

## 🎉 **¡SISTEMA COMPLETO Y LISTO PARA PRODUCCIÓN!**

**Big Arte** ahora cuenta con un **sistema de pagos fraccionados** completamente funcional, diseñado específicamente para negocios de gigantografía que necesitan:

✨ **Flexibilidad** en los montos de anticipo  
📊 **Control total** del flujo de caja  
🚨 **Alertas inteligentes** para seguimiento  
📈 **Reportes avanzados** para toma de decisiones  
🎯 **Interfaz moderna** y fácil de usar  

**¡El sistema está listo para transformar la gestión financiera de tu negocio de gigantografía!** 🚀
