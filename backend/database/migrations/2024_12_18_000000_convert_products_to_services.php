<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class ConvertProductsToServices extends Migration
{
    /**
     * Run the migrations.
     * Convertir tabla de productos a servicios de gigantografía
     */
    public function up()
    {
        Schema::table('products', function (Blueprint $table) {
            // Quitar campos relacionados con inventario
            $table->dropColumn(['stock', 'min_stock', 'price']);
            
            // Modificar el campo unit para ser más descriptivo para servicios
            $table->string('unit')->default('servicio')->change();
            
            // Agregar campo para tipo de servicio
            $table->string('service_type')->nullable()->after('category');
        });
        
        // Actualizar productos existentes para reflejar servicios de gigantografía
        DB::table('products')->update([
            'unit' => 'servicio',
            'category' => 'Gigantografía',
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('products', function (Blueprint $table) {
            // Restaurar campos originales
            $table->decimal('price', 10, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(5);
            $table->string('unit')->default('unidad')->change();
            $table->dropColumn('service_type');
        });
    }
}
