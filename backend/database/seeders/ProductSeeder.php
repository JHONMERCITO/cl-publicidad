<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * ACTUALIZADO: Compatible con sistema de servicios de gigantografía
     */
    public function run(): void
    {
        // NOTA: Este seeder ha sido actualizado para el sistema de servicios
        // Los servicios principales se crean desde ServicesSeeder
        // Aquí solo agregamos algunos materiales/suministros que podrían tener stock

        $items = [            
            // Materiales que sí pueden tener stock (suministros)
            [
                'name' => 'Papel Bond A4',
                'description' => 'Resma de papel bond A4 75gr para impresiones internas',
                'unit' => 'resma',
                'category' => 'Materiales',
                'service_type' => null,
                'active' => true,
            ],
            [
                'name' => 'Papel Fotográfico A4',
                'description' => 'Papel fotográfico glossy A4 para impresiones de alta calidad',
                'unit' => 'paquete',
                'category' => 'Materiales',
                'service_type' => null,
                'active' => true,
            ],
            [
                'name' => 'Lámina de Vinilo',
                'description' => 'Rollo de vinilo adhesivo por metro cuadrado',
                'unit' => 'm2',
                'category' => 'Materiales',
                'service_type' => null,
                'active' => true,
            ],
            
            // Servicios adicionales que complementan la gigantografía
            [
                'name' => 'Diseño Gráfico',
                'description' => 'Servicio de diseño gráfico personalizado, incluye hasta 3 revisiones',
                'unit' => 'servicio',
                'category' => 'Servicios Adicionales',
                'service_type' => 'Diseño',
                'active' => true,
            ],
            [
                'name' => 'Instalación',
                'description' => 'Servicio de instalación profesional de gigantografías y señalética',
                'unit' => 'servicio',
                'category' => 'Servicios Adicionales',
                'service_type' => 'Instalación',
                'active' => true,
            ],
            [
                'name' => 'Retiro y Entrega',
                'description' => 'Servicio de retiro y entrega a domicilio dentro de la ciudad',
                'unit' => 'servicio',
                'category' => 'Servicios Adicionales',
                'service_type' => 'Logística',
                'active' => true,
            ],
            [
                'name' => 'Laminado',
                'description' => 'Servicio de laminado para protección de impresiones',
                'unit' => 'servicio',
                'category' => 'Servicios Adicionales',
                'service_type' => 'Acabado',
                'active' => true,
            ],
            [
                'name' => 'Troquelado',
                'description' => 'Servicio de troquelado y corte de formas especiales',
                'unit' => 'servicio',
                'category' => 'Servicios Adicionales',
                'service_type' => 'Acabado',
                'active' => true,
            ],
        ];

        foreach ($items as $item) {
            // Solo crear si no existe ya un servicio/producto con el mismo nombre
            Product::firstOrCreate(
                ['name' => $item['name']],
                $item
            );
        }

        $this->command->info('Materiales y servicios adicionales creados exitosamente.');
        $this->command->warn('IMPORTANTE: Los servicios principales de gigantografía se crean con ServicesSeeder.');
    }
}
