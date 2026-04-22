<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('lignecommande')) {
            Schema::create('lignecommande', function (Blueprint $table) {
                $table->id('idLigneCommande');
                $table->unsignedBigInteger('idCommande');
                $table->unsignedBigInteger('idProduit');
                $table->integer('quantite');
                $table->decimal('prixUnitaire', 10, 2);
                $table->decimal('sousTotal', 10, 2);
                $table->timestamps();

                $table->foreign('idCommande')->references('idCommande')->on('commande')->onDelete('cascade');
                $table->foreign('idProduit')->references('idProduit')->on('produits')->onDelete('restrict');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lignecommande');
    }
};