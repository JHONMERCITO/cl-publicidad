<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            // Agregar campos para el sistema de pagos fraccionados
            if (!Schema::hasColumn('receipts', 'advance_amount')) {
                $table->decimal('advance_amount', 10, 2)->default(0)->after('total');
            }
            
            if (!Schema::hasColumn('receipts', 'paid_amount')) {
                $table->decimal('paid_amount', 10, 2)->default(0)->after('advance_amount');
            }
            
            if (!Schema::hasColumn('receipts', 'payment_status')) {
                $table->enum('payment_status', ['sin_anticipo', 'con_anticipo', 'pagado_completo'])
                      ->default('sin_anticipo')->after('paid_amount');
            }
        });
        
        // Actualizar el enum de status si es necesario (solo MySQL lo soporta)
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE receipts MODIFY COLUMN status ENUM('cotizado', 'con_anticipo', 'en_produccion', 'listo_entrega', 'completado', 'cancelado') DEFAULT 'cotizado'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('receipts', function (Blueprint $table) {
            if (Schema::hasColumn('receipts', 'advance_amount')) {
                $table->dropColumn('advance_amount');
            }
            
            if (Schema::hasColumn('receipts', 'paid_amount')) {
                $table->dropColumn('paid_amount');
            }
            
            if (Schema::hasColumn('receipts', 'payment_status')) {
                $table->dropColumn('payment_status');
            }
        });
    }
};
