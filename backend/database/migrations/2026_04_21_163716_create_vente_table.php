<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ventes', function (Blueprint $table) {
            $table->id('idVente');
            $table->timestamp('dateVente')->useCurrent();
            $table->decimal('montantTotal', 10, 2)->default(0);
            $table->decimal('totalHorsTaxe', 10, 2)->default(0);
            $table->decimal('tva', 10, 2)->default(0);
            $table->decimal('totalTaxeComprise', 10, 2)->default(0);
            $table->string('modePaiement', 20)->default('especes');
            $table->unsignedBigInteger('idUtilisateur');
            $table->string('statut', 255)->default('active');
            $table->timestamps();

            $table->foreign('idUtilisateur')
                  ->references('idUtilisateur')
                  ->on('utilisateurs')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ventes');
    }
};