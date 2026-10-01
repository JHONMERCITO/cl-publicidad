<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;

class QuickFix extends Command
{
    protected $signature = 'app:quick-fix';
    protected $description = 'Solución rápida: genera datos y verifica el dashboard';

    public function handle()
    {
        $this->info('🚀 Ejecutando solución rápida...');

        $user = User::first();
        
        if (!$user) {
            $this->error('❌ No hay usuarios. Ejecuta: php artisan db:seed --class=UserSeeder');
            return;
        }

        // Verificar gastos existentes
        $existingExpenses = Expense::count();
        $this->info("📊 Gastos existentes: {$existingExpenses}");

        if ($existingExpenses < 5) {
            $this->info('📝 Generando gastos de prueba...');
            
            // Generar gastos para diferentes períodos
            $categories = ['Materiales', 'Servicios', 'Equipo', 'Marketing', 'Oficina'];
            
            // Gastos de HOY
            for ($i = 1; $i <= 3; $i++) {
                Expense::create([
                    'description' => 'Gasto HOY ' . $i,
                    'amount' => rand(100, 300),
                    'category' => $categories[($i - 1) % count($categories)],
                    'supplier' => 'Proveedor Hoy',
                    'invoice_number' => 'HOY-' . $i,
                    'expense_date' => Carbon::today(),
                    'notes' => 'Gasto de hoy',
                    'user_id' => $user->id,
                ]);
            }
            
            // Gastos de ESTA SEMANA
            for ($i = 1; $i <= 4; $i++) {
                Expense::create([
                    'description' => 'Gasto SEMANA ' . $i,
                    'amount' => rand(150, 400),
                    'category' => $categories[($i - 1) % count($categories)],
                    'supplier' => 'Proveedor Semana',
                    'invoice_number' => 'SEM-' . $i,
                    'expense_date' => Carbon::now()->subDays(rand(1, 6)),
                    'notes' => 'Gasto de esta semana',
                    'user_id' => $user->id,
                ]);
            }
            
            // Gastos de ESTE MES
            for ($i = 1; $i <= 5; $i++) {
                Expense::create([
                    'description' => 'Gasto MES ' . $i,
                    'amount' => rand(200, 500),
                    'category' => $categories[($i - 1) % count($categories)],
                    'supplier' => 'Proveedor Mes',
                    'invoice_number' => 'MES-' . $i,
                    'expense_date' => Carbon::now()->subDays(rand(7, 25)),
                    'notes' => 'Gasto de este mes',
                    'user_id' => $user->id,
                ]);
            }
            
            $this->info('✅ Gastos generados para todos los períodos');
        }

        // Verificar categorías
        $this->info('🔍 Verificando categorías...');
        $categories = Expense::select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');
            
        $this->info('📋 Categorías encontradas: ' . $categories->implode(', '));

        // Verificar gastos por período
        $this->info('📅 Verificando gastos por período:');
        
        $today = Expense::whereDate('expense_date', Carbon::today())->count();
        $thisWeek = Expense::whereBetween('expense_date', [Carbon::now()->startOfWeek(), Carbon::now()])->count();
        $thisMonth = Expense::whereBetween('expense_date', [Carbon::now()->startOfMonth(), Carbon::now()])->count();
        
        $this->info("   Hoy: {$today} gastos");
        $this->info("   Esta semana: {$thisWeek} gastos");
        $this->info("   Este mes: {$thisMonth} gastos");

        $this->newLine();
        $this->info('🎉 ¡Listo! Ahora ve al dashboard y prueba diferentes períodos');
        $this->info('💡 También ve a /expenses para verificar que las categorías cargan correctamente');
    }
}
