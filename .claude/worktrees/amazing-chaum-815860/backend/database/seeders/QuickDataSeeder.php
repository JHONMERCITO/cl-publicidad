<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Receipt;
use App\Models\ReceiptItem;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;

class QuickDataSeeder extends Seeder
{
    /**
     * Seeder rápido para crear datos de prueba del sistema de pagos fraccionados
     * Ideal para demos y testing rápido
     */
    public function run(): void
    {
        $user = User::where('email', 'admin@bigart.com')->first();
        
        if (!$user) {
            echo "Error: Usuario admin no encontrado. Ejecuta UserSeeder primero.\n";
            return;
        }

        // Caso 1: Recibo solo cotizado (sin pagos)
        $receipt1 = $this->createQuoteReceipt($user);
        
        // Caso 2: Recibo con anticipo (trabajo en proceso) 
        $receipt2 = $this->createAdvanceReceipt($user);
        
        // Caso 3: Recibo listo para entrega (esperando pago final)
        $receipt3 = $this->createReadyForDeliveryReceipt($user);
        
        // Caso 4: Recibo completado con pagos fraccionados
        $receipt4 = $this->createCompletedWithPaymentsReceipt($user);
        
        // Caso 5: Recibo con múltiples pagos (anticipo + abonos + final)
        $receipt5 = $this->createMultiplePaymentsReceipt($user);

        echo "✅ Quick Data Seeder completado exitosamente!\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "🎯 Casos creados para demostrar pagos fraccionados:\n\n";
        echo "1. 📋 Cotización sin pagos: {$receipt1->receipt_number}\n";
        echo "2. 💰 Con anticipo (50%): {$receipt2->receipt_number}\n";
        echo "3. 📦 Listo para entrega: {$receipt3->receipt_number}\n";
        echo "4. ✅ Completado fraccionado: {$receipt4->receipt_number}\n";
        echo "5. 🔄 Múltiples pagos: {$receipt5->receipt_number}\n";
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
        echo "🚀 Ve al dashboard para ver las métricas de pagos\n";
    }

    private function createQuoteReceipt($user)
    {
        $receipt = Receipt::create([
            'receipt_number' => Receipt::generateReceiptNumber(),
            'customer_name' => 'Restaurante El Fogón',
            'customer_phone' => '70123456',
            'customer_email' => 'info@elfogon.com',
            'customer_address' => 'Av. 6 de Agosto #1234, La Paz',
            'receipt_date' => Carbon::now()->subDays(2),
            'subtotal' => 400.00,
            'tax' => 52.00,
            'discount' => 0,
            'total' => 452.00,
            'status' => 'cotizado',
            'payment_status' => 'sin_anticipo',
            'notes' => 'Gigantografía para nueva sucursal - esperando aprobación',
            'user_id' => $user->id,
        ]);

        ReceiptItem::create([
            'receipt_id' => $receipt->id,
            'product_name' => 'Gigantografía 3x2m - Fachada Principal',
            'quantity' => 1,
            'price' => 400.00,
            'subtotal' => 400.00,
        ]);

        return $receipt;
    }

    private function createAdvanceReceipt($user)
    {
        $receipt = Receipt::create([
            'receipt_number' => Receipt::generateReceiptNumber(),
            'customer_name' => 'Farmacia Salud Plus',
            'customer_phone' => '72987654',
            'customer_email' => 'contacto@saludplus.com',
            'receipt_date' => Carbon::now()->subDays(5),
            'subtotal' => 600.00,
            'tax' => 78.00,
            'discount' => 0,
            'total' => 678.00,
            'status' => 'en_produccion',
            'payment_status' => 'con_anticipo',
            'notes' => 'Letrero LED con diseño personalizado',
            'user_id' => $user->id,
        ]);

        ReceiptItem::create([
            'receipt_id' => $receipt->id,
            'product_name' => 'Letrero Luminoso LED 2x1m',
            'quantity' => 1,
            'price' => 600.00,
            'subtotal' => 600.00,
        ]);

        // Agregar anticipo del 50%
        $receipt->addPayment(339.00, 'anticipo', 'transferencia', 'Anticipo del 50% para iniciar trabajo');

        return $receipt;
    }

    private function createReadyForDeliveryReceipt($user)
    {
        $receipt = Receipt::create([
            'receipt_number' => Receipt::generateReceiptNumber(),
            'customer_name' => 'Consultorio Dr. Pérez',
            'customer_phone' => '76543210',
            'customer_email' => 'consultorio@drperez.com',
            'receipt_date' => Carbon::now()->subDays(7),
            'subtotal' => 320.00,
            'tax' => 41.60,
            'discount' => 0,
            'total' => 361.60,
            'status' => 'listo_entrega',
            'payment_status' => 'con_anticipo',
            'notes' => 'Trabajo terminado - cliente puede recoger',
            'user_id' => $user->id,
        ]);

        ReceiptItem::create([
            'receipt_id' => $receipt->id,
            'product_name' => 'Vinilo Corte + Instalación',
            'quantity' => 8,
            'price' => 40.00,
            'subtotal' => 320.00,
        ]);

        // Agregar anticipo del 60%
        $advancePayment = $receipt->addPayment(216.96, 'anticipo', 'efectivo', 'Anticipo del 60%');
        $advancePayment->update(['paid_at' => Carbon::now()->subDays(5)]);

        return $receipt;
    }

    private function createCompletedWithPaymentsReceipt($user)
    {
        $receipt = Receipt::create([
            'receipt_number' => Receipt::generateReceiptNumber(),
            'customer_name' => 'Empresa Constructora ABC',
            'customer_phone' => '78901234',
            'customer_email' => 'obras@constructoraabc.com',
            'receipt_date' => Carbon::now()->subDays(12),
            'subtotal' => 950.00,
            'tax' => 123.50,
            'discount' => 50.00,
            'total' => 1023.50,
            'status' => 'completado',
            'payment_status' => 'pagado_completo',
            'notes' => 'Señalética completa para proyecto residencial',
            'user_id' => $user->id,
        ]);

        ReceiptItem::create([
            'receipt_id' => $receipt->id,
            'product_name' => 'Gigantografía Premium 4x3m',
            'quantity' => 1,
            'price' => 680.00,
            'subtotal' => 680.00,
        ]);

        ReceiptItem::create([
            'receipt_id' => $receipt->id,
            'product_name' => 'Instalación con Estructura',
            'quantity' => 1,
            'price' => 270.00,
            'subtotal' => 270.00,
        ]);

        // Anticipo hace 10 días
        $payment1 = $receipt->addPayment(500.00, 'anticipo', 'transferencia', 'Anticipo inicial del proyecto');
        $payment1->update(['paid_at' => Carbon::now()->subDays(10)]);

        // Pago final hace 2 días
        $payment2 = $receipt->addPayment(523.50, 'pago_final', 'transferencia', 'Pago final al completar instalación');
        $payment2->update(['paid_at' => Carbon::now()->subDays(2)]);

        return $receipt;
    }

    private function createMultiplePaymentsReceipt($user)
    {
        $receipt = Receipt::create([
            'receipt_number' => Receipt::generateReceiptNumber(),
            'customer_name' => 'Centro Comercial Plaza',
            'customer_phone' => '71234567',
            'customer_email' => 'administracion@plazacentro.com',
            'receipt_date' => Carbon::now()->subDays(20),
            'subtotal' => 1500.00,
            'tax' => 195.00,
            'discount' => 0,
            'total' => 1695.00,
            'status' => 'completado',
            'payment_status' => 'pagado_completo',
            'notes' => 'Señalética integral del centro comercial - Proyecto grande',
            'user_id' => $user->id,
        ]);

        ReceiptItem::create([
            'receipt_id' => $receipt->id,
            'product_name' => 'Señalética Directorio Principal',
            'quantity' => 1,
            'price' => 800.00,
            'subtotal' => 800.00,
        ]);

        ReceiptItem::create([
            'receipt_id' => $receipt->id,
            'product_name' => 'Letreros de Locales (pack 20)',
            'quantity' => 1,
            'price' => 700.00,
            'subtotal' => 700.00,
        ]);

        // Pago 1: Anticipo hace 18 días (30%)
        $payment1 = $receipt->addPayment(508.50, 'anticipo', 'transferencia', 'Anticipo inicial - 30%');
        $payment1->update(['paid_at' => Carbon::now()->subDays(18)]);

        // Pago 2: Abono hace 10 días (40%)
        $payment2 = $receipt->addPayment(678.00, 'abono', 'transferencia', 'Abono al 50% de avance');
        $payment2->update(['paid_at' => Carbon::now()->subDays(10)]);

        // Pago 3: Segundo abono hace 5 días (20%)
        $payment3 = $receipt->addPayment(339.00, 'abono', 'efectivo', 'Segundo abono');
        $payment3->update(['paid_at' => Carbon::now()->subDays(5)]);

        // Pago 4: Final hace 1 día (10%)
        $payment4 = $receipt->addPayment(169.50, 'pago_final', 'transferencia', 'Pago final al completar todo');
        $payment4->update(['paid_at' => Carbon::now()->subDays(1)]);

        return $receipt;
    }
}
