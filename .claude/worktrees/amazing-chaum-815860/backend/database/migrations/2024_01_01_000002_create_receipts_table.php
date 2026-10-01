<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateReceiptsTable extends Migration
{
    public function up()
    {
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->string('receipt_number')->unique();
            $table->string('customer_name');
            $table->string('customer_phone')->nullable();
            $table->string('customer_email')->nullable();
            $table->text('customer_address')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('total', 10, 2);
            $table->decimal('advance_amount', 10, 2)->default(0); // Monto del anticipo
            $table->decimal('paid_amount', 10, 2)->default(0); // Total pagado hasta el momento
            $table->enum('payment_status', ['sin_anticipo', 'con_anticipo', 'pagado_completo'])->default('sin_anticipo');
            $table->enum('status', ['cotizado', 'con_anticipo', 'en_produccion', 'listo_entrega', 'completado', 'cancelado'])->default('cotizado');
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // quien creó la venta
            $table->timestamp('receipt_date');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('receipts');
    }
}
