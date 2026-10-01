<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check para Railway
Route::get('/health', fn() => response()->json(['status' => 'ok']));
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\ReceiptController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TimezoneController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas públicas (sin autenticación)
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas (requieren autenticación)
Route::middleware('auth:sanctum')->group(function () {
    
    // Autenticación
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/reports/profit-loss', [DashboardController::class, 'profitLossReport']);
    
    // Perfil del usuario autenticado
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Configuraciones del sistema (lectura para todos)
    Route::get('/settings', [SettingsController::class, 'index']);
    Route::get('/settings/currency', [SettingsController::class, 'getCurrency']);
    
    // Verificación de zona horaria
    Route::get('/timezone/verify', [TimezoneController::class, 'verify']);
    Route::get('/timezone/current', [TimezoneController::class, 'currentTime']);
    Route::post('/timezone/test', [TimezoneController::class, 'testTimestamp']);
    
    // Servicios/Productos (todos los usuarios autenticados)
    Route::get('/products', [ProductController::class, 'index']); // Ahora devuelve servicios
    Route::get('/products/{product}', [ProductController::class, 'show']);
    Route::get('/products/active/services', [ProductController::class, 'getActiveServices']); // Para dropdown
    Route::get('/products/common/services', [ProductController::class, 'getCommonServices']); // Servicios predefinidos
    // Recibos/Facturas (todos los usuarios autenticados)
    Route::get('/receipts', [ReceiptController::class, 'index']);
    Route::post('/receipts', [ReceiptController::class, 'store']);
    Route::get('/receipts/{receipt}', [ReceiptController::class, 'show']);
    Route::get('/receipts/{receipt}/pdf', [ReceiptController::class, 'generatePdf']);
    Route::post('/receipts/{receipt}/ready', [ReceiptController::class, 'markAsReady']);
    Route::get('/reports/sales', [ReceiptController::class, 'salesReport']);
    
    // Pagos (todos los usuarios autenticados)
    Route::get('/receipts/{receipt}/payments', [PaymentController::class, 'getReceiptPayments']);
    Route::post('/receipts/{receipt}/payments', [PaymentController::class, 'addPayment']);
    Route::get('/reports/payments', [PaymentController::class, 'paymentsReport']);
    
    // Gastos (todos los usuarios autenticados pueden ver, solo admin puede crear/editar)
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::get('/expenses/categories', [ExpenseController::class, 'categories']); // Específica primero
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show']); // Genérica después
    Route::get('/reports/expenses', [ExpenseController::class, 'expensesReport']);
    
    // Rutas solo para administradores
    Route::middleware('role:admin')->group(function () {
        
        // Registro de usuarios (solo admin)
        Route::post('/register', [AuthController::class, 'register']);
        
        // Gestión de usuarios (solo admin)
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::put('/users/{user}/password', [UserController::class, 'changePassword']);
        Route::put('/users/{user}/toggle-status', [UserController::class, 'toggleStatus']);
        
        // Gestión completa de servicios (solo admin)
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/products/create-common', [ProductController::class, 'createCommonServices']); // Crear servicios predefinidos
        
        // Modificación/Cancelación de recibos (solo admin)
        Route::put('/receipts/{receipt}', [ReceiptController::class, 'update']);
        Route::post('/receipts/{receipt}/cancel', [ReceiptController::class, 'cancel']);
        
        // Gestión de pagos (solo admin)
        Route::put('/payments/{payment}', [PaymentController::class, 'updatePayment']);
        Route::delete('/payments/{payment}', [PaymentController::class, 'deletePayment']);
        
        // Gestión completa de gastos (solo admin)
        Route::post('/expenses', [ExpenseController::class, 'store']);
        Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);
        Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);
        
        // Configuraciones del sistema (solo admin)
        Route::put('/settings/company',       [SettingsController::class, 'updateCompany']);
        Route::put('/settings/receipts',      [SettingsController::class, 'updateReceipts']);
        Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications']);
        Route::put('/settings/security',      [SettingsController::class, 'updateSecurity']);

    });
    
});

// Ruta para verificar que la API está funcionando
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'message' => 'Big Arte API está funcionando correctamente',
        'timestamp' => now(),
    ]);
});
