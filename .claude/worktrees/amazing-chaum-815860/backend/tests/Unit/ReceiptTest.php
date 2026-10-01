<?php

namespace Tests\Unit;

use App\Models\Receipt;
use App\Models\Payment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReceiptTest extends TestCase
{
    use RefreshDatabase;

    public function test_generates_unique_receipt_number(): void
    {
        $number1 = Receipt::generateReceiptNumber();
        $year = date('Y');

        $this->assertStringStartsWith("REC-{$year}-", $number1);
        $this->assertStringEndsWith('000001', $number1);
    }

    public function test_payment_status_sin_anticipo_when_no_payments(): void
    {
        $receipt = Receipt::factory()->create(['total' => 100.00, 'paid_amount' => 0]);

        $receipt->updatePaymentStatus();

        $this->assertEquals('sin_anticipo', $receipt->payment_status);
        $this->assertEquals('cotizado', $receipt->status);
    }

    public function test_payment_status_con_anticipo_when_partial_payment(): void
    {
        $receipt = Receipt::factory()->create([
            'total' => 100.00,
            'paid_amount' => 0,
            'status' => 'cotizado',
            'payment_status' => 'sin_anticipo',
        ]);

        Payment::factory()->create([
            'receipt_id' => $receipt->id,
            'amount' => 50.00,
            'type' => 'anticipo',
            'paid_at' => now(),
        ]);

        $receipt->updatePaymentStatus();

        $this->assertEquals('con_anticipo', $receipt->payment_status);
        $this->assertEquals('con_anticipo', $receipt->status);
    }

    public function test_payment_status_pagado_completo_when_fully_paid(): void
    {
        $receipt = Receipt::factory()->create([
            'total' => 100.00,
            'paid_amount' => 0,
            'status' => 'en_produccion',
            'payment_status' => 'con_anticipo',
        ]);

        Payment::factory()->create([
            'receipt_id' => $receipt->id,
            'amount' => 100.00,
            'type' => 'pago_final',
            'paid_at' => now(),
        ]);

        $receipt->updatePaymentStatus();

        $this->assertEquals('pagado_completo', $receipt->payment_status);
        $this->assertEquals('completado', $receipt->status);
    }

    public function test_is_fully_paid_returns_true_when_paid(): void
    {
        $receipt = Receipt::factory()->create(['total' => 200.00, 'paid_amount' => 200.00]);

        $this->assertTrue($receipt->isFullyPaid());
    }

    public function test_is_fully_paid_returns_false_when_partial(): void
    {
        $receipt = Receipt::factory()->create(['total' => 200.00, 'paid_amount' => 100.00]);

        $this->assertFalse($receipt->isFullyPaid());
    }

    public function test_get_remaining_amount(): void
    {
        $receipt = Receipt::factory()->create(['total' => 300.00, 'paid_amount' => 120.00]);

        $this->assertEquals(180.00, $receipt->getRemainingAmount());
    }

    public function test_soft_delete_does_not_permanently_remove_record(): void
    {
        $receipt = Receipt::factory()->create();
        $id = $receipt->id;

        $receipt->delete();

        $this->assertNull(Receipt::find($id));
        $this->assertNotNull(Receipt::withTrashed()->find($id));
    }

    public function test_status_stays_completado_when_fully_paid_and_already_completed(): void
    {
        $receipt = Receipt::factory()->create([
            'total' => 100.00,
            'paid_amount' => 0,
            'status' => 'completado',
            'payment_status' => 'pagado_completo',
        ]);

        Payment::factory()->create([
            'receipt_id' => $receipt->id,
            'amount' => 100.00,
            'type' => 'pago_final',
            'paid_at' => now(),
        ]);

        $receipt->updatePaymentStatus();

        $this->assertEquals('completado', $receipt->status);
    }

    public function test_cancelled_status_not_overridden_by_payment(): void
    {
        $receipt = Receipt::factory()->create([
            'total' => 100.00,
            'paid_amount' => 0,
            'status' => 'cancelado',
            'payment_status' => 'sin_anticipo',
        ]);

        Payment::factory()->create([
            'receipt_id' => $receipt->id,
            'amount' => 100.00,
            'type' => 'pago_final',
            'paid_at' => now(),
        ]);

        $receipt->updatePaymentStatus();

        $this->assertEquals('cancelado', $receipt->status);
    }
}
