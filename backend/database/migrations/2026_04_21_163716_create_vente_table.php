<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vente', function (Blueprint $table) {
            $table->increments('idVente');
            $table->timestamp('dateVente')->useCurrent();
            $table->decimal('montantTotal', 10, 2)->default(0);
            $table->decimal('totalHorsTaxe', 10, 2)->default(0);
            $table->decimal('tva', 10, 2)->default(0);
            $table->string('modePaiement', 20)->default('especes');
            $table->decimal('totalTaxeComprise', 10, 2)->default(0);
            $table->unsignedInteger('idUtilisateur');
            $table->string('statut', 255)->default('active');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vente');
    }
};