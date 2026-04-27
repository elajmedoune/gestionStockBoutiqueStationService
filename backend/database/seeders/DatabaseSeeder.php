<?php

namespace Database\Seeders;

use App\Models\Utilisateur;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        Utilisateur::create([
            'nom'        => 'MBAYE',
            'prenom'     => 'Fatou',
            'login'      => 'caissier',
            'email'      => 'caissier@station.sn',
            'motDePasse' => Hash::make('password123'),
            'role'       => 'caissier',
            'actif'      => true,
        ]);
        Utilisateur::create([
            'nom'        => 'DIALLO',
            'prenom'     => 'Mamadou',
            'login'      => 'gerant',
            'email'      => 'gerant@station.sn',
            'motDePasse' => Hash::make('password123'),
            'role'       => 'gerant',
            'actif'      => true,
        ]);
    }
}
