<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;

class ForceDataToday extends Command
{
    protected $signature = 'app:force-data-today';
    protected $description = 'Genera datos específicamente para HOY';

    public function handle()
    {
        $this->info('🚀 Generando datos específicamente para HOY...');

        $user = User::first();
        
        if (!$user) {
            $this->error('❌ No hay usuarios en la base de datos');
            return;
        }

        // Limpiar datos existentes
        Expense::truncate();
        $this->info('🗑️  Datos anteriores eliminados');

        // Generar gastos específicamente para HOY
        $categories = ['Materiales', 'Servicios', 'Equipo', 'Marketing', 'Oficina'];
        $today = Carbon::today();
        
        $this->info("📅 Generando gastos para: {$today->format('Y-m-d')}");

        for ($i = 1; $i <= 10; $i++) {
            $expense = Expense::create([
                'description' => 'Gasto HOY ' . $i,
                'amount' => rand(100, 800),
                'category' => $categories[($i - 1) % count($categories)], // Distribuir uniformemente
                'supplier' => 'Proveedor HOY ' . $i,
                'invoice_number' => 'HOY-' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'expense_date' => $today, // Específicamente HOY
                'notes' => 'Generado para HOY - debugging',
                'user_id' => $user->id,
            ]);
            
            $this->info("   ✅ {$expense->category}: $" . number_format($expense->amount, 2));
        }

        $this->newLine();
        $this->info('✅ ¡10 gastos generados para HOY!');
        $this->info('📊 Distribuidos uniformemente en 5 categorías');
        $this->info("📅 Todos con fecha: {$today->format('Y-m-d')}");
        $this->newLine();
        $this->info('💡 Ahora ve al Dashboard y selecciona "Hoy" en el período');
        
        // Verificar inmediatamente
        $this->newLine();
        $this->info('🔍 Verificación inmediata:');
        $verification = Expense::select('category', \DB::raw('SUM(amount) as total'))
            ->whereDate('expense_date', $today)
            ->groupBy('category')
            ->get();
            
        foreach ($verification as $cat) {
            $this->info("   {$cat->category}: $" . number_format($cat->total, 2));
        }
    }
}
