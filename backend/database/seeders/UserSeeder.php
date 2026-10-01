<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Usuario administrador
        User::create([
            'name' => 'Administrador CL Publicidad',
            'email' => 'admin@clpublicidad.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'active' => true,
        ]);

        // Usuario empleado de ejemplo
        User::create([
            'name' => 'Carlos Vendedor',
            'email' => 'carlos@clpublicidad.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'active' => true,
        ]);

        // Usuario empleado de ejemplo 2
        User::create([
            'name' => 'María Diseñadora',
            'email' => 'maria@clpublicidad.com',
            'password' => Hash::make('password'),
            'role' => 'employee',
            'active' => true,
        ]);
    }
}
