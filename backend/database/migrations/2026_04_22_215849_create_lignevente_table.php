<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('lignevente')) {
            Schema::create('lignevente', function (Blueprint $table) {
                $table->unsignedBigInteger('idProduit');
                $table->unsignedBigInteger('idVente');
                $table->integer('quantite');
                $table->decimal('totalPartielle', 10, 2);

                $table->primary(['idProduit', 'idVente']);

                $table->foreign('idVente')->references('idVente')->on('vente')->onDelete('cascade');
                $table->foreign('idProduit')->references('idProduit')->on('produits')->onDelete('restrict');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lignevente');
    }
};