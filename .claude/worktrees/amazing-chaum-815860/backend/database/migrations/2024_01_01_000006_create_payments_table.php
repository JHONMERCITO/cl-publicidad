<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receipt_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['anticipo', 'pago_final', 'abono'])->default('anticipo');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_method', ['efectivo', 'transferencia', 'tarjeta', 'cheque'])->default('efectivo');
            $table->text('notes')->nullable();
            $table->timestamp('paid_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
