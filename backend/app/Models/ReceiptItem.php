<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReceiptItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'receipt_id',
        'product_id',
        'product_name',
        'price',
        'quantity',
        'subtotal',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    // Relaciones
    public function receipt()
    {
        return $this->belongsTo(Receipt::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class)->withDefault();
    }

    // Métodos auxiliares
    public function isCustomService()
    {
        return is_null($this->product_id);
    }

    public function isInventoryProduct()
    {
        return !is_null($this->product_id);
    }

    // Eventos del modelo
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($receiptItem) {
            $receiptItem->subtotal = $receiptItem->price * $receiptItem->quantity;
        });

        static::updating(function ($receiptItem) {
            $receiptItem->subtotal = $receiptItem->price * $receiptItem->quantity;
        });
    }
}
