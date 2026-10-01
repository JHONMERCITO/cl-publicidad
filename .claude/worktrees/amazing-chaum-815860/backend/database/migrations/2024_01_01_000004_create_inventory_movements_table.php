<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateInventoryMovementsTable extends Migration
{
    public function up()
    {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out']); // entrada o salida
            $table->decimal('quantity', 8, 2);
            $table->decimal('cost', 10, 2)->nullable(); // costo unitario si es entrada
            $table->string('reason'); // venta, compra, ajuste, devolución, etc.
            $table->string('reference')->nullable(); // número de recibo, factura de compra, etc.
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('inventory_movements');
    }
}
