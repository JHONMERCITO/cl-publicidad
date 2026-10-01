<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'receipt_id',
        'type',
        'amount',
        'payment_method',
        'notes',
        'paid_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
    ];

    // Relaciones
    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }

    // Métodos auxiliares
    public function isAdvance()
    {
        return $this->type === 'anticipo';
    }

    public function isFinalPayment()
    {
        return $this->type === 'pago_final';
    }

    public function isInstallment()
    {
        return $this->type === 'abono';
    }

    // Scopes
    public function scopeAdvances($query)
    {
        return $query->where('type', 'anticipo');
    }

    public function scopeFinalPayments($query)
    {
        return $query->where('type', 'pago_final');
    }

    public function scopeInstallments($query)
    {
        return $query->where('type', 'abono');
    }
}
