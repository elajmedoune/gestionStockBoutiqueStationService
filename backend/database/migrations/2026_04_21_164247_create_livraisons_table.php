<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livraisons', function (Blueprint $table) {
            $table->id('idLivraison');
            $table->date('dateLivraison');
            $table->decimal('montantTotal', 10, 2)->default(0.00);
            $table->enum('statut', ['en_attente', 'livree', 'annulee'])
                ->default('en_attente');
            $table->string('observations', 300)->nullable();
                $table->enum('ponctualite', ['a_temps', 'en_avance', 'en_retard'])
                ->nullable();
            $table->unsignedBigInteger('idCommande')->unique();
            $table->timestamps();

            $table->foreign('idCommande')
                ->references('idCommande')
                ->on('commandes')
                ->onDelete('cascade');
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('livraisons');
    }
};