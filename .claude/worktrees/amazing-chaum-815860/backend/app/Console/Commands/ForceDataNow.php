<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;

class ForceDataNow extends Command
{
    protected $signature = 'app:force-data-now';
    protected $description = 'Fuerza datos GARANTIZADOS para todos los períodos';

    public function handle()
    {
        $this->info('🚀 Generando datos GARANTIZADOS para todos los períodos...');

        $user = User::first();
        
        if (!$user) {
            $this->error('❌ No hay usuarios');
            return;
        }

        // Limpiar TODOS los gastos
        Expense::truncate();
        $this->info('🗑️  Todos los gastos eliminados');

        $categories = ['Materiales', 'Servicios', 'Equipo', 'Marketing', 'Oficina'];
        
        // GARANTIZAR datos para CADA período
        $now = Carbon::now();
        
        // 1. HOY (3 gastos)
        $this->info('📅 Generando gastos para HOY...');
        for ($i = 0; $i < 3; $i++) {
            Expense::create([
                'description' => 'Gasto HOY ' . ($i + 1),
                'amount' => 100 + ($i * 50),
                'category' => $categories[$i % count($categories)],
                'supplier' => 'Proveedor HOY',
                'invoice_number' => 'HOY-' . ($i + 1),
                'expense_date' => $now->toDateString(), // HOY exacto
                'notes' => 'Generado para HOY',
                'user_id' => $user->id,
            ]);
        }

        // 2. ESTA SEMANA (5 gastos adicionales)
        $this->info('📅 Generando gastos para ESTA SEMANA...');
        for ($i = 0; $i < 5; $i++) {
            Expense::create([
                'description' => 'Gasto SEMANA ' . ($i + 1),
                'amount' => 200 + ($i * 30),
                'category' => $categories[$i % count($categories)],
                'supplier' => 'Proveedor SEMANA',
                'invoice_number' => 'SEM-' . ($i + 1),
                'expense_date' => $now->copy()->subDays($i + 1)->toDateString(), // Últimos días
                'notes' => 'Generado para esta semana',
                'user_id' => $user->id,
            ]);
        }

        // 3. ESTE MES (7 gastos adicionales)
        $this->info('📅 Generando gastos para ESTE MES...');
        for ($i = 0; $i < 7; $i++) {
            Expense::create([
                'description' => 'Gasto MES ' . ($i + 1),
                'amount' => 150 + ($i * 40),
                'category' => $categories[$i % count($categories)],
                'supplier' => 'Proveedor MES',
                'invoice_number' => 'MES-' . ($i + 1),
                'expense_date' => $now->copy()->subDays(($i + 1) * 2)->toDateString(), // Distribuidos en el mes
                'notes' => 'Generado para este mes',
                'user_id' => $user->id,
            ]);
        }

        // 4. ESTE AÑO (5 gastos adicionales)
        $this->info('📅 Generando gastos para ESTE AÑO...');
        for ($i = 0; $i < 5; $i++) {
            Expense::create([
                'description' => 'Gasto AÑO ' . ($i + 1),
                'amount' => 300 + ($i * 60),
                'category' => $categories[$i % count($categories)],
                'supplier' => 'Proveedor AÑO',
                'invoice_number' => 'AÑO-' . ($i + 1),
                'expense_date' => $now->copy()->subMonths($i + 1)->toDateString(), // Meses anteriores
                'notes' => 'Generado para este año',
                'user_id' => $user->id,
            ]);
        }

        $this->newLine();
        $this->info('✅ DATOS GARANTIZADOS GENERADOS:');
        $this->info('   📊 Total gastos: ' . Expense::count());
        
        // Verificar por período
        $periods = [
            'HOY' => ['today', Carbon::today()],
            'ESTA SEMANA' => ['week', Carbon::now()->startOfWeek()],
            'ESTE MES' => ['month', Carbon::now()->startOfMonth()],
            'ESTE AÑO' => ['year', Carbon::now()->startOfYear()],
        ];

        foreach ($periods as $name => [$period, $startDate]) {
            $count = Expense::whereBetween('expense_date', [$startDate, $now])->count();
            $categories = Expense::whereBetween('expense_date', [$startDate, $now])
                ->select('category')
                ->distinct()
                ->count();
                
            $this->info("   {$name}: {$count} gastos, {$categories} categorías");
        }

        $this->newLine();
        $this->info('🎯 AHORA PRUEBA:');
        $this->info('   1. Ve al Dashboard');
        $this->info('   2. Abre F12 → Console');
        $this->info('   3. Cambia entre períodos: HOY, ESTA SEMANA, ESTE MES, ESTE AÑO');
        $this->info('   4. Observa los logs en la consola');
        $this->info('   5. La gráfica DEBE aparecer en todos los períodos');
    }
}
