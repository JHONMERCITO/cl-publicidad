<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Carbon\Carbon;
use App\Models\Receipt;
use App\Models\Payment;

class TimezoneController extends Controller
{
    /**
     * Verificar configuración de zona horaria del sistema
     */
    public function verify()
    {
        try {
            // 1. Configuración actual
            $appTimezone = config('app.timezone');
            
            // 2. Fechas y horas
            $now = Carbon::now();
            $utcNow = Carbon::now('UTC');
            $boliviaNow = Carbon::now('America/La_Paz');
            
            // 3. Offsets
            $systemOffset = $now->getOffset() / 3600;
            $boliviaOffset = $boliviaNow->getOffset() / 3600;
            
            // 4. Verificar registros recientes
            $latestReceipt = Receipt::latest()->first();
            $latestPayment = Payment::latest('paid_at')->first();
            
            // 5. Estado de verificación
            $isTimezoneCorrect = $appTimezone === 'America/La_Paz';
            $isOffsetCorrect = $boliviaOffset === -4;
            $isFullyCorrect = $isTimezoneCorrect && $isOffsetCorrect;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $isFullyCorrect ? 'correct' : 'incorrect',
                    'config' => [
                        'app_timezone' => $appTimezone,
                        'is_timezone_correct' => $isTimezoneCorrect,
                        'bolivia_offset' => $boliviaOffset,
                        'is_offset_correct' => $isOffsetCorrect,
                    ],
                    'times' => [
                        'system_time' => $now->format('Y-m-d H:i:s T'),
                        'utc_time' => $utcNow->format('Y-m-d H:i:s T'),
                        'bolivia_time' => $boliviaNow->format('Y-m-d H:i:s T'),
                        'system_offset' => $systemOffset,
                        'bolivia_offset' => $boliviaOffset,
                    ],
                    'database' => [
                        'latest_receipt' => $latestReceipt ? [
                            'id' => $latestReceipt->id,
                            'receipt_number' => $latestReceipt->receipt_number,
                            'created_at' => $latestReceipt->created_at->format('Y-m-d H:i:s T'),
                            'receipt_date' => $latestReceipt->receipt_date ? $latestReceipt->receipt_date->format('Y-m-d H:i:s T') : null,
                        ] : null,
                        'latest_payment' => $latestPayment ? [
                            'id' => $latestPayment->id,
                            'amount' => $latestPayment->amount,
                            'type' => $latestPayment->type,
                            'paid_at' => $latestPayment->paid_at->format('Y-m-d H:i:s T'),
                        ] : null,
                    ],
                    'recommendations' => $this->getRecommendations($isTimezoneCorrect, $isOffsetCorrect),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al verificar zona horaria: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener la hora actual del sistema para comparación
     */
    public function currentTime()
    {
        try {
            $now = Carbon::now();
            $boliviaNow = Carbon::now('America/La_Paz');
            
            return response()->json([
                'success' => true,
                'data' => [
                    'system_time' => $now->toISOString(),
                    'bolivia_time' => $boliviaNow->toISOString(),
                    'formatted_system' => $now->format('Y-m-d H:i:s T'),
                    'formatted_bolivia' => $boliviaNow->format('Y-m-d H:i:s T'),
                    'timezone' => config('app.timezone'),
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al obtener hora actual: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear un registro de prueba para verificar timestamps
     */
    public function testTimestamp()
    {
        try {
            $now = Carbon::now();
            
            // Crear datos de prueba sin guardar
            $testData = [
                'receipt_number' => 'TEST-TIMEZONE-' . time(),
                'customer_name' => 'Test Cliente Zona Horaria',
                'subtotal' => 100,
                'total' => 100,
                'receipt_date' => $now,
                'status' => 'test',
                'user_id' => auth()->id() ?? 1,
            ];
            
            // Simular creación para verificar timestamp
            $testReceipt = new Receipt($testData);
            $testReceipt->updated_at = $now;
            $testReceipt->created_at = $now;
            
            return response()->json([
                'success' => true,
                'data' => [
                    'message' => 'Test de timestamp realizado (no guardado en BD)',
                    'current_time' => $now->format('Y-m-d H:i:s T'),
                    'would_save_as' => [
                        'created_at' => $testReceipt->created_at->format('Y-m-d H:i:s T'),
                        'updated_at' => $testReceipt->updated_at->format('Y-m-d H:i:s T'),
                        'receipt_date' => $testReceipt->receipt_date->format('Y-m-d H:i:s T'),
                    ],
                    'timezone_info' => [
                        'app_timezone' => config('app.timezone'),
                        'carbon_timezone' => $now->getTimezone()->getName(),
                        'offset' => $now->getOffset() / 3600,
                    ]
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error en test de timestamp: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener recomendaciones basadas en el estado actual
     */
    private function getRecommendations($isTimezoneCorrect, $isOffsetCorrect)
    {
        $recommendations = [];
        
        if (!$isTimezoneCorrect) {
            $recommendations[] = [
                'type' => 'error',
                'message' => 'Cambiar timezone en config/app.php a "America/La_Paz"',
                'action' => 'config_change'
            ];
            
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'Agregar APP_TIMEZONE=America/La_Paz en .env',
                'action' => 'env_change'
            ];
            
            $recommendations[] = [
                'type' => 'info',
                'message' => 'Ejecutar: php artisan config:clear',
                'action' => 'command'
            ];
        }
        
        if (!$isOffsetCorrect) {
            $recommendations[] = [
                'type' => 'warning',
                'message' => 'Verificar configuración del servidor',
                'action' => 'server_check'
            ];
        }
        
        if ($isTimezoneCorrect && $isOffsetCorrect) {
            $recommendations[] = [
                'type' => 'success',
                'message' => '¡Zona horaria configurada correctamente!',
                'action' => 'none'
            ];
        }
        
        return $recommendations;
    }
}
