<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Carbon\Carbon;

class Receipt extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'receipt_number',
        'customer_name',
        'customer_phone',
        'customer_email',
        'customer_address',
        'subtotal',
        'tax',
        'discount',
        'total',
        'advance_amount',
        'paid_amount',
        'payment_status',
        'status',
        'notes',
        'user_id',
        'branch_id',
        'receipt_date',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
        'advance_amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'receipt_date' => 'datetime',
    ];

    // Relaciones
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(ReceiptItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // Métodos auxiliares
    public static function generateReceiptNumber()
    {
        $year = date('Y');
        $lastReceipt = self::whereYear('created_at', $year)
            ->orderBy('id', 'desc')
            ->first();

        $number = $lastReceipt ? 
            (int)substr($lastReceipt->receipt_number, -6) + 1 : 1;

        return 'REC-' . $year . '-' . str_pad($number, 6, '0', STR_PAD_LEFT);
    }

    public function calculateTotal()
    {
        $subtotal = $this->items->sum('subtotal');
        $total = $subtotal + $this->tax - $this->discount;
        
        $this->subtotal = $subtotal;
        $this->total = $total;
        $this->save();

        return $total;
    }

    // Métodos para manejo de pagos
    public function addPayment($amount, $type = 'anticipo', $paymentMethod = 'efectivo', $notes = null)
    {
        $payment = $this->payments()->create([
            'type' => $type,
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'notes' => $notes,
            'paid_at' => now(),
        ]);

        $this->updatePaymentStatus();
        return $payment;
    }

    public function updatePaymentStatus()
    {
        $totalPaid = $this->payments()->sum('amount');
        $this->paid_amount = $totalPaid;

        if ($totalPaid == 0) {
            $this->payment_status = 'sin_anticipo';
            // Revertir a cotizado si no hay pagos y el recibo no está en producción
            if ($this->status === 'con_anticipo') {
                $this->status = 'cotizado';
            }
        } elseif ($totalPaid < $this->total) {
            $this->payment_status = 'con_anticipo';
            // Avanzar estado si aún está en cotizado
            if ($this->status === 'cotizado') {
                $this->status = 'con_anticipo';
            }
        } else {
            $this->payment_status = 'pagado_completo';
            // Marcar como completado si aún no lo está
            if (!in_array($this->status, ['completado', 'cancelado'])) {
                $this->status = 'completado';
            }
        }

        $this->save();
    }

    public function getRemainingAmount()
    {
        return $this->total - $this->paid_amount;
    }

    public function isFullyPaid()
    {
        return $this->paid_amount >= $this->total;
    }

    public function hasAdvance()
    {
        return $this->payments()->where('type', 'anticipo')->exists();
    }

    public function getAdvanceAmount()
    {
        return $this->payments()->where('type', 'anticipo')->sum('amount');
    }

    // Scopes
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completado');
    }

    // Includes all confirmed work (con_anticipo → completado), excludes quotes and cancelled
    public function scopeActive($query)
    {
        return $query->whereIn('status', ['con_anticipo', 'en_produccion', 'listo_entrega', 'completado']);
    }

    public function scopeWithAdvance($query)
    {
        return $query->where('payment_status', 'con_anticipo');
    }

    public function scopeFullyPaid($query)
    {
        return $query->where('payment_status', 'pagado_completo');
    }

    public function scopePendingPayment($query)
    {
        return $query->whereIn('payment_status', ['sin_anticipo', 'con_anticipo']);
    }

    public function scopeReadyForDelivery($query)
    {
        return $query->where('status', 'listo_entrega');
    }

    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('receipt_date', [$startDate, $endDate]);
    }
}
