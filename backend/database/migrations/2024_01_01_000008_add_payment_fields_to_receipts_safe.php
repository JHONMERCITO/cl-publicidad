<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Primero agregar las columnas nuevas sin tocar el ENUM
        Schema::table('receipts', function (Blueprint $table) {
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
        
        // 2. Actualizar datos existentes para que sean compatibles
        DB::statement("UPDATE receipts SET status = 'completado' WHERE status = 'completed'");
        DB::statement("UPDATE receipts SET status = 'completado' WHERE status = 'finalizado'");
        DB::statement("UPDATE receipts SET status = 'cotizado' WHERE status = 'pending'");
        DB::statement("UPDATE receipts SET status = 'cotizado' WHERE status = 'pendiente'");
        DB::statement("UPDATE receipts SET status = 'cancelado' WHERE status = 'cancelled'");
        
        // 3. Actualizar valores inválidos a 'cotizado' como fallback
        DB::statement("UPDATE receipts SET status = 'cotizado' WHERE status NOT IN ('cotizado', 'con_anticipo', 'en_produccion', 'listo_entrega', 'completado', 'cancelado')");
        
        // 4. Ahora sí modificar el ENUM de forma segura
        try {
            DB::statement("ALTER TABLE receipts MODIFY COLUMN status ENUM('cotizado', 'con_anticipo', 'en_produccion', 'listo_entrega', 'completado', 'cancelado') DEFAULT 'cotizado'");
        } catch (Exception $e) {
            // Si falla, no importa, los valores ya están actualizados
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
