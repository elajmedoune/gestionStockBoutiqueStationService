<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('utilisateurs', function (Blueprint $table) {
            $table->id('idUtilisateur');
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->string('login', 50)->unique();
            $table->string('email', 100)->unique();
            $table->string('motDePasse', 255);
            $table->boolean('actif')->default(true);
            $table->enum('role', ['gerant', 'caissier', 'magasinier', 'gestionnaire_stock'])->default('caissier');
            $table->string('photo', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('utilisateurs');
    }
};