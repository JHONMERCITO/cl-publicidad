<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ServicesSeeder extends Seeder
{
    /**
     * Poblar la base de datos con servicios comunes de gigantografía
     */
    public function run()
    {
        $services = [
            [
                'name' => 'Banner',
                'description' => 'Banners publicitarios en diversos tamaños y materiales, ideales para promociones y eventos',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Banner',
                'active' => true,
            ],
            [
                'name' => 'Lona',
                'description' => 'Lonas publicitarias resistentes al exterior, perfectas para fachadas y espacios abiertos',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Lona',
                'active' => true,
            ],
            [
                'name' => 'Vinilo',
                'description' => 'Adhesivos de vinilo para interiores y exteriores, alta durabilidad y colores vibrantes',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Vinilo',
                'active' => true,
            ],
            [
                'name' => 'Microperforado',
                'description' => 'Vinilo microperforado para vidrieras, permite visión desde adentro hacia afuera',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Microperforado',
                'active' => true,
            ],
            [
                'name' => 'Canvas',
                'description' => 'Impresión en canvas para decoración de interiores, acabado artístico y elegante',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Canvas',
                'active' => true,
            ],
            [
                'name' => 'Papel Fotográfico',
                'description' => 'Impresiones en papel fotográfico de alta calidad, ideal para fotografías y arte',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Papel Fotográfico',
                'active' => true,
            ],
            [
                'name' => 'Foam',
                'description' => 'Impresión sobre foam board, ligero y resistente, perfecto para displays temporales',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Foam',
                'active' => true,
            ],
            [
                'name' => 'Acrílico',
                'description' => 'Impresión sobre acrílico transparente o blanco, acabado premium y moderno',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Acrílico',
                'active' => true,
            ],
            [
                'name' => 'PVC',
                'description' => 'Impresión sobre PVC expandido, resistente a la intemperie y versátil',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'PVC',
                'active' => true,
            ],
            [
                'name' => 'Roll Up',
                'description' => 'Sistema de banner enrollable portátil, ideal para ferias y presentaciones',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Roll Up',
                'active' => true,
            ],
            [
                'name' => 'Adhesivo Piso',
                'description' => 'Adhesivos especiales para piso, antideslizante y alta resistencia al tráfico',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Adhesivo Piso',
                'active' => true,
            ],
            [
                'name' => 'Backlight',
                'description' => 'Impresión translúcida para cajas de luz, retroiluminación perfecta',
                'unit' => 'servicio',
                'category' => 'Gigantografía',
                'service_type' => 'Backlight',
                'active' => true,
            ],
        ];

        foreach ($services as $serviceData) {
            // Solo crear si no existe ya un servicio con el mismo nombre
            Product::firstOrCreate(
                ['name' => $serviceData['name']],
                $serviceData
            );
        }

        $this->command->info('Servicios de gigantografía creados exitosamente.');
    }
}
