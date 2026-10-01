<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Receipt;
use App\Models\ReceiptItem;
use App\Models\Payment;
use App\Models\Expense;
use App\Models\User;
use App\Models\Product;
use Carbon\Carbon;

class DataSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@bigart.com')->first();
        $products = Product::all();

        if ($products->isEmpty()) {
            echo "No hay productos. Ejecuta primero ProductSeeder\n";
            return;
        }

        // Crear recibos de prueba con diferentes estados y pagos
        $this->createReceiptsWithPayments($user, $products);
        
        // Crear gastos de prueba
        $this->createExpenses($user);

        echo "Datos de prueba creados exitosamente!\n";
        echo "- 15 recibos con diferentes estados de pago\n";
        echo "- Pagos fraccionados realistas\n";
        echo "- 12 gastos por categorías\n";
    }

    private function createReceiptsWithPayments($user, $products)
    {
        $customers = [
            ['name' => 'Restaurant El Buen Sabor', 'phone' => '70123456', 'email' => 'info@elbuensabor.com'],
            ['name' => 'Farmacia San Juan', 'phone' => '72987654', 'email' => 'contacto@farmaciasanjuan.com'],
            ['name' => 'Tienda La Moderna', 'phone' => '75456789', 'email' => 'ventas@lamoderna.com'],
            ['name' => 'Empresa Constructora ABC', 'phone' => '76234567', 'email' => 'proyectos@constructoraabc.com'],
            ['name' => 'Consultorio Médico Salud+', 'phone' => '77345678', 'email' => 'recepcion@saludmas.com'],
            ['name' => 'Peluquería Estilo', 'phone' => '78456789', 'email' => 'citas@peluqueriaestilo.com'],
            ['name' => 'Panadería Doña María', 'phone' => '79567890', 'email' => 'pedidos@panaderiadonamaria.com'],
        ];

        $services = [
            ['name' => 'Gigantografía 3x2m - Exterior', 'price' => 450.00],
            ['name' => 'Banner Roll Up 0.8x2m', 'price' => 120.00],
            ['name' => 'Letrero Luminoso LED', 'price' => 850.00],
            ['name' => 'Vinilo Corte Ploter', 'price' => 25.00],
            ['name' => 'Diseño Gráfico Personalizado', 'price' => 200.00],
            ['name' => 'Instalación de Rótulo', 'price' => 300.00],
            ['name' => 'Gigantografía 4x3m - Premium', 'price' => 680.00],
            ['name' => 'Impresión en Lona Mesh', 'price' => 180.00],
        ];

        for ($i = 1; $i <= 15; $i++) {
            $customer = $customers[array_rand($customers)];
            $daysAgo = rand(1, 45); // Entre 1 y 45 días atrás
            
            // Crear el recibo
            $receipt = Receipt::create([
                'receipt_number' => Receipt::generateReceiptNumber(),
                'customer_name' => $customer['name'],
                'customer_phone' => $customer['phone'],
                'customer_email' => $customer['email'],
                'customer_address' => 'Zona ' . rand(1, 20) . ', La Paz, Bolivia',
                'receipt_date' => Carbon::now()->subDays($daysAgo),
                'subtotal' => 0,
                'tax' => 0,
                'discount' => rand(0, 1) ? rand(10, 50) : 0,
                'total' => 0,
                'advance_amount' => 0,
                'paid_amount' => 0,
                'payment_status' => 'sin_anticipo',
                'status' => 'cotizado',
                'notes' => $this->getRandomNotes(),
                'user_id' => $user->id,
            ]);

            // Agregar items al recibo
            $numItems = rand(1, 3);
            $subtotal = 0;
            
            for ($j = 0; $j < $numItems; $j++) {
                $service = $services[array_rand($services)];
                $quantity = rand(1, 2);
                $price = $service['price'] * (rand(80, 120) / 100); // Variación de precio ±20%
                $itemSubtotal = $price * $quantity;
                $subtotal += $itemSubtotal;
                
                ReceiptItem::create([
                    'receipt_id' => $receipt->id,
                    'product_id' => null, // No vinculamos con inventario como pediste
                    'product_name' => $service['name'],
                    'quantity' => $quantity,
                    'price' => round($price, 2),
                    'subtotal' => round($itemSubtotal, 2),
                ]);
            }

            // Calcular totales
            $tax = $subtotal * 0.13; // 13% IVA
            $total = $subtotal + $tax - $receipt->discount;
            
            $receipt->update([
                'subtotal' => round($subtotal, 2),
                'tax' => round($tax, 2),
                'total' => round($total, 2),
            ]);

            // Simular estados y pagos realistas
            $this->simulateReceiptPayments($receipt, $daysAgo);
        }
    }

    private function simulateReceiptPayments(Receipt $receipt, $daysAgo)
    {
        $total = $receipt->total;
        
        // Determinar escenario basado en días y aleatoriedad
        $scenario = $this->determinePaymentScenario($daysAgo, $total);
        
        switch ($scenario) {
            case 'only_quote':
                // Solo cotización, sin pagos
                $receipt->update([
                    'status' => 'cotizado',
                    'payment_status' => 'sin_anticipo'
                ]);
                break;
                
            case 'with_advance':
                // Con anticipo, trabajo en proceso
                $advanceAmount = round($total * rand(30, 70) / 100, 2);
                
                $receipt->addPayment($advanceAmount, 'anticipo', $this->getRandomPaymentMethod(), 
                    'Anticipo del ' . round(($advanceAmount / $total) * 100) . '%');
                
                $receipt->update([
                    'status' => rand(0, 1) ? 'con_anticipo' : 'en_produccion',
                ]);
                break;
                
            case 'ready_for_delivery':
                // Trabajo terminado, esperando pago final
                $advanceAmount = round($total * rand(40, 60) / 100, 2);
                
                $receipt->addPayment($advanceAmount, 'anticipo', $this->getRandomPaymentMethod(), 
                    'Anticipo del 50%');
                
                $receipt->update([
                    'status' => 'listo_entrega',
                ]);
                break;
                
            case 'completed':
                // Trabajo completado con pagos completos
                if (rand(0, 1)) {
                    // Pago completo de una vez
                    $receipt->addPayment($total, 'pago_final', $this->getRandomPaymentMethod(), 
                        'Pago completo al entregar');
                } else {
                    // Anticipo + pago final
                    $advanceAmount = round($total * rand(40, 60) / 100, 2);
                    $finalAmount = $total - $advanceAmount;
                    
                    // Anticipo hace varios días
                    $payment1 = $receipt->addPayment($advanceAmount, 'anticipo', $this->getRandomPaymentMethod(), 
                        'Anticipo del ' . round(($advanceAmount / $total) * 100) . '%');
                    $payment1->update(['paid_at' => Carbon::now()->subDays($daysAgo - rand(2, 5))]);
                    
                    // Pago final más reciente
                    $payment2 = $receipt->addPayment($finalAmount, 'pago_final', $this->getRandomPaymentMethod(), 
                        'Pago final al entregar');
                    $payment2->update(['paid_at' => Carbon::now()->subDays(rand(0, 3))]);
                }
                
                $receipt->update([
                    'status' => 'completado',
                ]);
                break;
                
            case 'multiple_payments':
                // Pagos múltiples (anticipo + abonos + final)
                $remaining = $total;
                $paymentsCount = rand(2, 4);
                
                for ($p = 0; $p < $paymentsCount; $p++) {
                    if ($p === $paymentsCount - 1) {
                        // Último pago (final)
                        if ($remaining > 0) {
                            $payment = $receipt->addPayment($remaining, 'pago_final', $this->getRandomPaymentMethod(), 
                                'Pago final');
                            $payment->update(['paid_at' => Carbon::now()->subDays(rand(0, 2))]);
                        }
                    } else {
                        // Anticipo o abono
                        $paymentAmount = round($remaining * rand(25, 50) / 100, 2);
                        $remaining -= $paymentAmount;
                        
                        $type = $p === 0 ? 'anticipo' : 'abono';
                        $payment = $receipt->addPayment($paymentAmount, $type, $this->getRandomPaymentMethod(), 
                            $type === 'anticipo' ? 'Anticipo inicial' : 'Abono #' . $p);
                        
                        $daysAgoForPayment = $daysAgo - ($p * rand(3, 7));
                        $payment->update(['paid_at' => Carbon::now()->subDays(max(1, $daysAgoForPayment))]);
                    }
                }
                
                $receipt->update([
                    'status' => 'completado',
                ]);
                break;
        }
        
        // Recalcular estados después de todos los pagos
        $receipt->updatePaymentStatus();
    }

    private function determinePaymentScenario($daysAgo, $total)
    {
        // Trabajos muy recientes (1-3 días) - más probabilidad de estar en cotización
        if ($daysAgo <= 3) {
            return rand(1, 10) <= 6 ? 'only_quote' : 'with_advance';
        }
        
        // Trabajos recientes (4-10 días) - en proceso
        if ($daysAgo <= 10) {
            $scenarios = ['with_advance', 'ready_for_delivery', 'completed'];
            return $scenarios[array_rand($scenarios)];
        }
        
        // Trabajos más antiguos (11+ días) - mayoría completados
        if ($daysAgo >= 11) {
            return rand(1, 10) <= 8 ? 'completed' : 'multiple_payments';
        }
        
        return 'completed';
    }

    private function getRandomPaymentMethod()
    {
        $methods = ['efectivo', 'transferencia', 'tarjeta'];
        
        // Más probabilidad de efectivo y transferencia
        $weights = [
            'efectivo' => 50,
            'transferencia' => 35, 
            'tarjeta' => 15
        ];
        
        $rand = rand(1, 100);
        $cumulative = 0;
        
        foreach ($weights as $method => $weight) {
            $cumulative += $weight;
            if ($rand <= $cumulative) {
                return $method;
            }
        }
        
        return 'efectivo';
    }

    private function getRandomNotes()
    {
        $notes = [
            'Gigantografía para fachada principal',
            'Incluye diseño personalizado',
            'Material resistente a intemperie',
            'Instalación programada para fin de semana',
            'Cliente solicita colores corporativos',
            'Trabajo urgente - entregar en 48h',
            'Incluye estructura metálica',
            'Requiere permiso municipal',
            'Material premium solicitado',
            'Diseño ya aprobado por cliente',
            'Instalación en horario nocturno',
            'Trabajo de mantenimiento anual'
        ];
        
        return rand(0, 1) ? $notes[array_rand($notes)] : null;
    }

    private function createExpenses($user)
    {
        $expenses = [
            // Materiales
            ['desc' => 'Rollos de vinilo adhesivo', 'amount' => 450.00, 'category' => 'Materiales', 'supplier' => 'Proveedor Gráfico SRL'],
            ['desc' => 'Tintas para ploter', 'amount' => 280.00, 'category' => 'Materiales', 'supplier' => 'Insumos Digitales'],
            ['desc' => 'Lona impermeable 4x3m', 'amount' => 320.00, 'category' => 'Materiales', 'supplier' => 'Materiales La Paz'],
            
            // Servicios
            ['desc' => 'Mantenimiento de ploter', 'amount' => 350.00, 'category' => 'Servicios', 'supplier' => 'Técnico Especializado'],
            ['desc' => 'Internet y telefonía', 'amount' => 180.00, 'category' => 'Servicios', 'supplier' => 'Entel'],
            ['desc' => 'Servicio de instalación', 'amount' => 200.00, 'category' => 'Servicios', 'supplier' => 'Instaladores ABC'],
            
            // Equipo
            ['desc' => 'Estructura metálica para rótulo', 'amount' => 680.00, 'category' => 'Equipo', 'supplier' => 'Metalúrgica Estrella'],
            ['desc' => 'Herramientas de instalación', 'amount' => 150.00, 'category' => 'Equipo', 'supplier' => 'Ferretería Central'],
            
            // Marketing
            ['desc' => 'Publicidad en redes sociales', 'amount' => 120.00, 'category' => 'Marketing', 'supplier' => 'Facebook Ads'],
            ['desc' => 'Tarjetas de presentación', 'amount' => 80.00, 'category' => 'Marketing', 'supplier' => 'Imprenta Rápida'],
            
            // Oficina
            ['desc' => 'Papelería y suministros', 'amount' => 95.00, 'category' => 'Oficina', 'supplier' => 'Librería Estudiantil'],
            ['desc' => 'Alquiler de local', 'amount' => 1200.00, 'category' => 'Oficina', 'supplier' => 'Propietario Local'],
        ];

        foreach ($expenses as $i => $expenseData) {
            Expense::create([
                'description' => $expenseData['desc'],
                'amount' => $expenseData['amount'],
                'category' => $expenseData['category'],
                'supplier' => $expenseData['supplier'],
                'invoice_number' => 'FACT-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'expense_date' => Carbon::now()->subDays(rand(1, 60)),
                'notes' => rand(0, 1) ? 'Gasto necesario para operaciones' : null,
                'user_id' => $user->id,
            ]);
        }
    }
}
