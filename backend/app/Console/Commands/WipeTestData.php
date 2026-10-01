<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class WipeTestData extends Command
{
    protected $signature = 'data:wipe';
    protected $description = 'Elimina todos los recibos, gastos y servicios. Mantiene usuarios y configuración.';

    public function handle()
    {
        if (!$this->confirm('Esto eliminará TODOS los recibos, gastos y servicios. ¿Continuar?')) {
            $this->info('Operación cancelada.');
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        DB::table('inventory_movements')->truncate();
        DB::table('payments')->truncate();
        DB::table('receipt_items')->truncate();
        DB::table('receipts')->truncate();
        DB::table('expenses')->truncate();
        DB::table('products')->truncate();

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $this->info('Datos eliminados correctamente.');
        $this->table(
            ['Tabla', 'Registros'],
            [
                ['inventory_movements', DB::table('inventory_movements')->count()],
                ['payments',            DB::table('payments')->count()],
                ['receipt_items',       DB::table('receipt_items')->count()],
                ['receipts',            DB::table('receipts')->count()],
                ['expenses',            DB::table('expenses')->count()],
                ['products',            DB::table('products')->count()],
            ]
        );
    }
}
