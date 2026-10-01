<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ReceiptFactory extends Factory
{
    public function definition(): array
    {
        $subtotal = fake()->randomFloat(2, 100, 5000);
        $tax = 0;
        $discount = 0;
        $total = $subtotal + $tax - $discount;

        return [
            'receipt_number' => 'REC-' . date('Y') . '-' . str_pad(fake()->unique()->numberBetween(1, 99999), 6, '0', STR_PAD_LEFT),
            'customer_name' => fake()->name(),
            'customer_phone' => fake()->phoneNumber(),
            'customer_email' => fake()->safeEmail(),
            'customer_address' => fake()->address(),
            'subtotal' => $subtotal,
            'tax' => $tax,
            'discount' => $discount,
            'total' => $total,
            'advance_amount' => 0,
            'paid_amount' => 0,
            'payment_status' => 'sin_anticipo',
            'status' => 'cotizado',
            'notes' => null,
            'user_id' => User::factory(),
            'receipt_date' => now(),
        ];
    }
}
