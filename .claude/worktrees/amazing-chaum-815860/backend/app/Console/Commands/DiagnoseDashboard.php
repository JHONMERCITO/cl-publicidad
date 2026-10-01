<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Expense;
use App\Models\User;
use App\Http\Controllers\DashboardController;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DiagnoseDashboard extends Command
{
    protected $signature = 'app:diagnose-dashboard';
    protected $description = 'Diagnóstica completamente el problema del dashboard';

    public function handle()
    {
        $this->info('🔍 Iniciando diagnóstico completo del dashboard...');
        $this->newLine();

        // 1. Verificar gastos en base de datos
        $this->info('1️⃣ VERIFICANDO GASTOS EN BASE DE DATOS:');
        $totalExpenses = Expense::count();
        $this->info("   Total gastos: {$totalExpenses}");

        if ($totalExpenses == 0) {
            $this->error('❌ No hay gastos en la base de datos');
            return;
        }

        // Gastos por categoría (sin filtros de fecha)
        $allCategories = Expense::selectRaw('category, SUM(amount) as total, COUNT(*) as count')
            ->groupBy('category')
            ->orderBy('total', 'desc')
            ->get();

        $this->info('   Gastos por categoría (TODOS):');
        foreach ($allCategories as $cat) {
            $this->info("      {$cat->category}: {$cat->count} gastos, $" . number_format($cat->total, 2));
        }

        // 2. Verificar rangos de fechas
        $this->newLine();
        $this->info('2️⃣ VERIFICANDO RANGOS DE FECHAS:');
        
        $periods = ['today', 'week', 'month', 'year'];
        foreach ($periods as $period) {
            $startDate = $this->getStartDate($period);
            $endDate = Carbon::now();
            
            $expensesInPeriod = Expense::whereBetween('expense_date', [$startDate, $endDate])->count();
            $this->info("   {$period}: {$expensesInPeriod} gastos (desde {$startDate->format('Y-m-d')})");
        }

        // 3. Simular llamada al dashboard
        $this->newLine();
        $this->info('3️⃣ SIMULANDO LLAMADA AL DASHBOARD:');
        
        foreach (['today', 'month'] as $testPeriod) {
            $this->info("   Probando período: {$testPeriod}");
            
            $startDate = $this->getStartDate($testPeriod);
            $endDate = Carbon::now();
            
            $expensesByCategory = Expense::select('category', \DB::raw('SUM(amount) as total'))
                ->whereBetween('expense_date', [$startDate, $endDate])
                ->groupBy('category')
                ->orderBy('total', 'desc')
                ->get();
                
            $this->info("      Gastos encontrados: {$expensesByCategory->count()}");
            
            if ($expensesByCategory->count() > 0) {
                $this->info("      Estructura de datos:");
                foreach ($expensesByCategory as $expense) {
                    $this->info("         - Categoría: '{$expense->category}', Total: {$expense->total}");
                }
            } else {
                $this->warn("      ⚠️  No hay gastos en este período");
            }
        }

        // 4. Mostrar datos exactos que está devolviendo el controlador
        $this->newLine();
        $this->info('4️⃣ DATOS EXACTOS DEL CONTROLADOR:');
        
        try {
            // Crear request falso
            $request = new Request(['period' => 'month']);
            $controller = new DashboardController();
            $response = $controller->index($request);
            $data = $response->getData(true);
            
            $this->info('   Estructura completa de respuesta:');
            $this->info('   Charts existe: ' . (isset($data['charts']) ? 'SÍ' : 'NO'));
            $this->info('   expenses_by_category existe: ' . (isset($data['charts']['expenses_by_category']) ? 'SÍ' : 'NO'));
            
            if (isset($data['charts']['expenses_by_category'])) {
                $this->info('   Contenido de expenses_by_category:');
                $expensesData = $data['charts']['expenses_by_category'];
                $this->info('   Tipo: ' . gettype($expensesData));
                $this->info('   Count: ' . (is_array($expensesData) ? count($expensesData) : 'N/A'));
                
                if (is_array($expensesData) && count($expensesData) > 0) {
                    $this->info('   Primer elemento:');
                    $this->info('   ' . json_encode($expensesData[0], JSON_PRETTY_PRINT));
                } else {
                    $this->warn('   ⚠️  Array vacío o no es array');
                }
            }
            
        } catch (\Exception $e) {
            $this->error('❌ Error al ejecutar controlador: ' . $e->getMessage());
        }

        // 5. Recomendaciones
        $this->newLine();
        $this->info('5️⃣ RECOMENDACIONES:');
        
        if ($totalExpenses > 0) {
            $this->info('✅ Hay gastos en la base de datos');
            
            $monthExpenses = Expense::whereBetween('expense_date', [Carbon::now()->startOfMonth(), Carbon::now()])->count();
            if ($monthExpenses > 0) {
                $this->info('✅ Hay gastos este mes');
                $this->info('🔧 El problema probablemente está en el frontend');
                $this->info('💡 Ve a /debug en el navegador para más detalles');
            } else {
                $this->warn('⚠️  No hay gastos este mes, cambia el período a "Este año"');
            }
        } else {
            $this->error('❌ No hay gastos, ejecuta: php artisan app:quick-fix');
        }
    }

    private function getStartDate($period)
    {
        switch ($period) {
            case 'today':
                return Carbon::today();
            case 'week':
                return Carbon::now()->startOfWeek();
            case 'month':
                return Carbon::now()->startOfMonth();
            case 'year':
                return Carbon::now()->startOfYear();
            default:
                return Carbon::now()->startOfMonth();
        }
    }
}
