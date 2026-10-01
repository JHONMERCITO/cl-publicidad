<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'unit',
        'category',
        'service_type',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    // Relaciones
    public function receiptItems()
    {
        return $this->hasMany(ReceiptItem::class);
    }

    // Nota: Mantenemos inventoryMovements por compatibilidad histórica
    // pero no se usará para servicios
    public function inventoryMovements()
    {
        return $this->hasMany(InventoryMovement::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('active', true);
    }

    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeByServiceType($query, $serviceType)
    {
        return $query->where('service_type', $serviceType);
    }

    // Métodos auxiliares para servicios
    public function getDisplayName()
    {
        return $this->service_type ? "{$this->name} ({$this->service_type})" : $this->name;
    }

    public function isGigantografia()
    {
        return strtolower($this->category) === 'gigantografía';
    }

    // Método para obtener servicios de gigantografía más comunes
    public static function getCommonServices()
    {
        return [
            'Banner' => 'Banners publicitarios en diversos tamaños',
            'Lona' => 'Lonas publicitarias resistentes al exterior',
            'Vinilo' => 'Adhesivos de vinilo para interiores y exteriores',
            'Microperforado' => 'Vinilo microperforado para vidrieras',
            'Canvas' => 'Impresión en canvas para decoración',
            'Papel Fotográfico' => 'Impresiones en papel fotográfico',
            'Foam' => 'Impresión sobre foam board',
            'Acrílico' => 'Impresión sobre acrílico',
            'PVC' => 'Impresión sobre PVC expandido',
            'Roll Up' => 'Sistema de banner enrollable',
        ];
    }
}
