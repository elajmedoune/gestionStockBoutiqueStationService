<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Alerte', function (Blueprint $table) {
            $table->id(IdAlerte);
            $table->string('type', 20);
            $table->string('message', 300);
            $table->timestamp('dateCreation')->useCurrent();
            $table->boolean('lue')->default(false);
            $table->enum('niveauUrgence', ['faible', 'moyen', 'critique'])->default('moyen');
            $table->unsignedBigInteger('IdUtilisateur');
            $table->unsignedBigInteger('IdProduit');
            $table->timestamps();

            $table->foreign('IdUtilisateur')
                  ->references('IdUtilisateur')->on('Utilisateur')
                  ->onDelete('restrict');

            $table->foreign('IdProduit')
                  ->references('IdProduit')->on('Produit')
                  ->onDelete('restrict');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('Alerte');
    }
};
