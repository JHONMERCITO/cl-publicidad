<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            ServicesSeeder::class,   // Servicios principales de gigantografía
            ProductSeeder::class,    // Materiales y servicios adicionales
            DataSeeder::class,
        ]);
    }
}
