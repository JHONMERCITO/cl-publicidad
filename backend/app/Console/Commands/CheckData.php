<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;

class CheckData extends Command
{
    protected $signature = 'app:check-data';
    protected $description = 'Verifica los datos en la base de datos';

    public function handle()
    {
        $this->info('🔍 Verificando datos en la base de datos...');
        
        // Verificar usuarios
        $usersCount = User::count();
        $this->info("👥 Usuarios: {$usersCount}");
        
        // Verificar gastos
        $expensesCount = Expense::count();
        $this->info("💸 Gastos totales: {$expensesCount}");
        
        if ($expensesCount > 0) {
            // Gastos por categoría
            $this->info("\n📊 Gastos por categoría:");
            $categories = Expense::selectRaw('category, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('category')
                ->get();
                
            foreach ($categories as $category) {
                $this->info("   {$category->category}: {$category->count} gastos, Total: $" . number_format($category->total, 2));
            }
            
            // Gastos recientes
            $this->info("\n📅 Últimos 5 gastos:");
            $recentExpenses = Expense::orderBy('expense_date', 'desc')->limit(5)->get();
            foreach ($recentExpenses as $expense) {
                $this->info("   {$expense->expense_date} - {$expense->category} - $" . number_format($expense->amount, 2) . " - {$expense->description}");
            }
            
            // Rango de fechas
            $oldest = Expense::min('expense_date');
            $newest = Expense::max('expense_date');
            $this->info("\n📆 Rango de fechas: {$oldest} a {$newest}");
            
            // Gastos del mes actual
            $thisMonth = Expense::whereMonth('expense_date', Carbon::now()->month)
                ->whereYear('expense_date', Carbon::now()->year)
                ->count();
            $this->info("📊 Gastos este mes: {$thisMonth}");
            
        } else {
            $this->error("❌ No hay gastos en la base de datos");
            $this->info("💡 Ejecuta: php artisan app:generate-test-data");
        }
    }
}
