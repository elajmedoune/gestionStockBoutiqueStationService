<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Utilisateurs', function (Blueprint $table) {
            $table->id('idUtilisateur');
            $table->string('nom', 50);
            $table->string('prenom', 50);
            $table->string('login', 50)->unique();
            $table->string('email', 100)->unique();
            $table->string('motDePasse', 255);
            $table->boolean('actif')->default(true);
            $table->enum('role', ['admin', 'gestionnaire', 'caissier'])->default('caissier');
            $table->timestamps();
        });
        //table requise par laravel sanctum
        Schema::create('personal_access_tokens', function(Blueprint $table){
             $table->id();
             $table->morphs('tokenable');
             $table->string('name');
             $table->string('token', 64)->unique();
             $table->text('abilities')->nullable();
             $table->timestamp('last_used_at')->nullable();
             $table->timestamp('expires_at')->nullable();
             $table->timestamps();
        });  
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
        Schema::dropIfExists('utilisateurs');
    }
};
