<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReceiptItemsTable extends Migration
{
    public function up()
    {
        Schema::create('receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receipt_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('product_id')->nullable(); // Nullable para servicios personalizados
            $table->string('product_name'); // Descripción del servicio/producto
            $table->decimal('price', 10, 2); // precio al momento de la venta
            $table->decimal('quantity', 8, 2);
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('receipt_items');
    }
}
