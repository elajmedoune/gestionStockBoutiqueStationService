<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commande', function (Blueprint $table) {
            $table->increments('idCommande');
            $table->date('dateCommande');
            $table->date('dateLivraisonPrevue')->nullable();
            $table->string('statut', 20)->default('en_attente');
            $table->decimal('montantTotal', 10, 2)->default(0);
            $table->unsignedInteger('idLivraison')->nullable();
            $table->unsignedInteger('idUtilisateur');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande');
    }
};