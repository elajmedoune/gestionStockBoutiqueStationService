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
        Schema::create('produits', function (Blueprint $table) {
            $table->id('idProduit');
            $table->string('reference')->unique();
            $table->string('codeBarre')->unique()->nullable();
            $table->decimal('prixUnitaire', 10, 2)->default(0.00);
            $table->decimal('seuilSecurite')->default(0);
            $table->foreignId('idCategorie')
                  ->constrained('categories', 'idCategorie')
                  ->onDelete('restrict');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('produits');
    }
};
