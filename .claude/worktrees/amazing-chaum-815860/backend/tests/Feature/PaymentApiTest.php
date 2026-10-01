<?php

namespace Tests\Feature;

use App\Models\Payment;
use App\Models\Receipt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $employee;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->create(['role' => 'admin']);
        $this->employee = User::factory()->create(['role' => 'employee']);
    }

    public function test_employee_can_add_payment_to_receipt(): void
    {
        $receipt = Receipt::factory()->create([
            'total' => 200.00,
            'paid_amount' => 0,
            'status' => 'cotizado',
            'payment_status' => 'sin_anticipo',
        ]);

        $response = $this->actingAs($this->employee)->postJson(
            "/api/receipts/{$receipt->id}/payments",
            [
                'amount' => 100.00,
                'type' => 'anticipo',
                'payment_method' => 'efectivo',
            ]
        );

        $response->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseHas('payments', ['receipt_id' => $receipt->id, 'amount' => 100.00]);
    }

    public function test_payment_cannot_exceed_remaining_balance(): void
    {
        $receipt = Receipt::factory()->create([
            'total' => 100.00,
            'paid_amount' => 80.00,
            'status' => 'con_anticipo',
            'payment_status' => 'con_anticipo',
        ]);

        $response = $this->actingAs($this->employee)->postJson(
            "/api/receipts/{$receipt->id}/payments",
            [
                'amount' => 50.00,
                'type' => 'pago_final',
                'payment_method' => 'efectivo',
            ]
        );

        $response->assertStatus(400)->assertJson(['success' => false]);
    }

    public function test_only_admin_can_delete_payment(): void
    {
        $payment = Payment::factory()->create();

        $this->actingAs($this->employee)
            ->deleteJson("/api/payments/{$payment->id}")
            ->assertStatus(403);

        $this->actingAs($this->admin)
            ->deleteJson("/api/payments/{$payment->id}")
            ->assertStatus(200);
    }

    public function test_deleted_payment_recalculates_receipt_status(): void
    {
        $receipt = Receipt::factory()->create([
            'total' => 100.00,
            'paid_amount' => 100.00,
            'status' => 'completado',
            'payment_status' => 'pagado_completo',
        ]);

        $payment = Payment::factory()->create([
            'receipt_id' => $receipt->id,
            'amount' => 100.00,
            'type' => 'pago_final',
            'paid_at' => now(),
        ]);

        $this->actingAs($this->admin)->deleteJson("/api/payments/{$payment->id}");

        $receipt->refresh();
        $this->assertEquals('sin_anticipo', $receipt->payment_status);
        $this->assertEquals(0, (float) $receipt->paid_amount);
    }

    public function test_unauthenticated_user_cannot_access_payments(): void
    {
        $receipt = Receipt::factory()->create();

        $this->getJson("/api/receipts/{$receipt->id}/payments")
            ->assertStatus(401);
    }
}
