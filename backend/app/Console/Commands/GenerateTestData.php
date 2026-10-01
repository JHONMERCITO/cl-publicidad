<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Expense;
use App\Models\User;
use Carbon\Carbon;

class GenerateTestData extends Command
{
    protected $signature = 'app:generate-test-data';
    protected $description = 'Genera datos de prueba para el dashboard';

    public function handle()
    {
        $this->info('🚀 Generando datos de prueba para Big Arte...');

        $user = User::first();
        
        if (!$user) {
            $this->error('❌ No hay usuarios en la base de datos');
            $this->info('💡 Ejecuta primero: php artisan db:seed --class=UserSeeder');
            return;
        }

        // Limpiar datos existentes
        if ($this->confirm('¿Quieres limpiar los datos existentes?', true)) {
            Expense::truncate();
            $this->info('🗑️  Datos anteriores eliminados');
        }

        // Generar gastos recientes (últimos 7 días)
        $categories = ['Materiales', 'Servicios', 'Equipo', 'Marketing', 'Oficina', 'Transporte'];
        $bar = $this->output->createProgressBar(20);
        $bar->start();

        for ($i = 1; $i <= 20; $i++) {
            Expense::create([
                'description' => 'Gasto de prueba ' . $i,
                'amount' => rand(50, 500),
                'category' => $categories[array_rand($categories)],
                'supplier' => 'Proveedor ' . chr(65 + ($i % 6)),
                'invoice_number' => 'F' . str_pad($i, 3, '0', STR_PAD_LEFT),
                'expense_date' => Carbon::now()->subDays(rand(0, 7)), // Últimos 7 días
                'notes' => 'Generado automáticamente',
                'user_id' => $user->id,
            ]);
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
        $this->info('✅ ¡Datos generados exitosamente!');
        $this->info('📊 20 gastos creados en diferentes categorías');
        $this->info('📅 Distribuidos en los últimos 30 días');
        $this->newLine();
        $this->info('💡 Ve al Dashboard para ver las gráficas actualizadas');
    }
}
