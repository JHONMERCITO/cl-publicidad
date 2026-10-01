<?php

namespace Database\Factories;

use App\Models\Receipt;
use Illuminate\Database\Eloquent\Factories\Factory;

class PaymentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'receipt_id' => Receipt::factory(),
            'type' => fake()->randomElement(['anticipo', 'pago_final', 'abono']),
            'amount' => fake()->randomFloat(2, 10, 500),
            'payment_method' => fake()->randomElement(['efectivo', 'transferencia', 'tarjeta', 'cheque']),
            'notes' => null,
            'paid_at' => now(),
        ];
    }
}
