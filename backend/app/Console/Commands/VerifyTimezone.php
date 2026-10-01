<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Carbon\Carbon;
use App\Models\Receipt;
use App\Models\Payment;

class VerifyTimezone extends Command
{
    protected $signature = 'timezone:verify';
    protected $description = 'Verificar que la zona horaria esté correctamente configurada';

    public function handle()
    {
        $this->info('🕐 VERIFICACIÓN DE ZONA HORARIA - BIG ARTE');
        $this->info('===========================================');
        $this->newLine();

        // 1. Verificar configuración de Laravel
        $appTimezone = config('app.timezone');
        $this->info("📍 CONFIGURACIÓN ACTUAL:");
        $this->line("- Zona horaria de Laravel: {$appTimezone}");
        
        if ($appTimezone === 'America/La_Paz') {
            $this->info("✅ Zona horaria correcta para Bolivia");
        } else {
            $this->error("❌ Zona horaria incorrecta. Debería ser 'America/La_Paz'");
        }

        // 2. Verificar Carbon/DateTime
        $this->newLine();
        $this->info("🕒 FECHAS Y HORAS ACTUALES:");
        
        $now = Carbon::now();
        $utcNow = Carbon::now('UTC');
        $boliviaNow = Carbon::now('America/La_Paz');

        $this->line("- Hora del sistema: {$now->format('Y-m-d H:i:s T')}");
        $this->line("- Hora UTC: {$utcNow->format('Y-m-d H:i:s T')}");
        $this->line("- Hora Bolivia: {$boliviaNow->format('Y-m-d H:i:s T')}");

        // 3. Verificar diferencia horaria
        $offset = $boliviaNow->getOffset() / 3600;
        $this->line("- Offset de Bolivia: UTC{$offset}");
        
        if ($offset === -4) {
            $this->info("✅ Offset correcto (UTC-4)");
        } else {
            $this->error("❌ Offset incorrecto. Bolivia debería ser UTC-4");
        }

        // 4. Verificar base de datos
        $this->newLine();
        $this->info("🗄️ VERIFICACIÓN EN BASE DE DATOS:");
        
        try {
            // Crear un registro de prueba
            $testReceipt = new Receipt([
                'receipt_number' => 'TEST-TIMEZONE-' . time(),
                'customer_name' => 'Test Cliente Zona Horaria',
                'subtotal' => 100,
                'total' => 100,
                'receipt_date' => $now,
                'user_id' => 1,
                'status' => 'test'
            ]);

            // NO guardamos, solo verificamos el timestamp
            $this->line("- Timestamp que se guardaría: {$testReceipt->receipt_date}");
            $this->line("- Formatted: {$now->format('Y-m-d H:i:s')}");
            
            // Verificar un registro existente si hay
            $latestReceipt = Receipt::latest()->first();
            if ($latestReceipt) {
                $this->line("- Último recibo creado: {$latestReceipt->created_at}");
                $this->line("- Fecha formateada: {$latestReceipt->created_at->format('Y-m-d H:i:s T')}");
            }

            $this->info("✅ Conexión a base de datos OK");

        } catch (\Exception $e) {
            $this->error("❌ Error en base de datos: " . $e->getMessage());
        }

        // 5. Verificar pagos si existen
        $this->newLine();
        $this->info("💰 VERIFICACIÓN DE PAGOS:");
        
        $paymentsCount = Payment::count();
        if ($paymentsCount > 0) {
            $latestPayment = Payment::latest('paid_at')->first();
            $this->line("- Total de pagos: {$paymentsCount}");
            $this->line("- Último pago: {$latestPayment->paid_at->format('Y-m-d H:i:s T')}");
            $this->line("- Tipo: {$latestPayment->type}");
            $this->line("- Monto: {$latestPayment->amount}");
        } else {
            $this->line("- No hay pagos registrados");
        }

        // 6. Recomendaciones
        $this->newLine();
        $this->info("💡 RECOMENDACIONES:");
        
        if ($appTimezone !== 'America/La_Paz') {
            $this->line("1. Cambiar timezone en config/app.php a 'America/La_Paz'");
            $this->line("2. Agregar APP_TIMEZONE=America/La_Paz en .env");
            $this->line("3. Ejecutar: php artisan config:clear");
        }

        if ($offset !== -4) {
            $this->line("4. Verificar configuración del servidor");
            $this->line("5. Confirmar que el servidor esté en zona horaria correcta");
        }

        $this->newLine();
        
        if ($appTimezone === 'America/La_Paz' && $offset === -4) {
            $this->info("🎉 ¡ZONA HORARIA CONFIGURADA CORRECTAMENTE!");
            $this->line("El sistema está usando la hora correcta de Bolivia.");
        } else {
            $this->error("⚠️ ZONA HORARIA REQUIERE CORRECCIÓN");
            $this->line("Seguir las recomendaciones arriba para corregir.");
        }

        $this->newLine();
        
        return 0;
    }
}
