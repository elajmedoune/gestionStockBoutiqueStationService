<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id('idCommande');
            $table->date('dateCommande');
            $table->date('dateLivraisonPrevue')->nullable();
            $table->string('statut', 20)->default('en_attente');
            $table->decimal('montantTotal', 10, 2)->default(0);
            $table->unsignedBigInteger('idLivraison')->nullable();
            $table->unsignedBigInteger('idUtilisateur');
            $table->timestamps();

            $table->foreign('idUtilisateur')
                  ->references('idUtilisateur')
                  ->on('utilisateurs')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};