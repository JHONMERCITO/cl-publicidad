<?php

namespace Tests\Unit;

use App\Models\Payment;
use App\Models\Receipt;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentTest extends TestCase
{
    use RefreshDatabase;

    public function test_is_advance_returns_true_for_anticipo(): void
    {
        $payment = Payment::factory()->create(['type' => 'anticipo']);

        $this->assertTrue($payment->isAdvance());
        $this->assertFalse($payment->isFinalPayment());
        $this->assertFalse($payment->isInstallment());
    }

    public function test_is_final_payment_returns_true_for_pago_final(): void
    {
        $payment = Payment::factory()->create(['type' => 'pago_final']);

        $this->assertTrue($payment->isFinalPayment());
        $this->assertFalse($payment->isAdvance());
    }

    public function test_is_installment_returns_true_for_abono(): void
    {
        $payment = Payment::factory()->create(['type' => 'abono']);

        $this->assertTrue($payment->isInstallment());
        $this->assertFalse($payment->isAdvance());
    }

    public function test_soft_delete_does_not_permanently_remove_payment(): void
    {
        $payment = Payment::factory()->create();
        $id = $payment->id;

        $payment->delete();

        $this->assertNull(Payment::find($id));
        $this->assertNotNull(Payment::withTrashed()->find($id));
    }

    public function test_payment_belongs_to_receipt(): void
    {
        $receipt = Receipt::factory()->create();
        $payment = Payment::factory()->create(['receipt_id' => $receipt->id]);

        $this->assertEquals($receipt->id, $payment->receipt->id);
    }
}
