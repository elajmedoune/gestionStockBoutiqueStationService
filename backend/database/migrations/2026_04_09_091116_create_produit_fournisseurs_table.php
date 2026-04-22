<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('produit_fournisseur', function (Blueprint $table) {
            $table->foreignId('idProduit')
                ->constrained('produits', 'idProduit')
                ->onDelete('cascade');
            $table->foreignId('idFournisseur')
                ->constrained('fournisseurs', 'idFournisseur')
                ->onDelete('cascade');
            $table->primary(['idProduit', 'idFournisseur']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produit_fournisseurs');
    }
};
