<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Inventaire', function (Blueprint $table) {
            $table->id(IdInventaire);
            $table->date('dateInventaire');
            $table->integer('quantiteTheorique')->default(0);
            $table->string('quantiteReelle')->default(0);
            //ecart est calculé par trigger Mysql(GENERATED ALWAYS AS)
            //On le laisse nullable pour comptabilité migration
            $table->integer('ecart')->nullable()->storedAs('quantiteReelle - quantiteTheorique');
            $table->string('observations', 300)->nullable();
            $table->string('statut', 20)->default('en_cours');
            $table->unsignedBigInteger('IdUtilisateur');
            $table->unsignedBigInteger('IdProduit');
            $table->timestamps();

            $table->foreign('IdUtilisateur')
                  ->references('IdUtilisateur')->on('Utilisateur')
                  ->onDelete('restrict');

            //IdProduit référencé sur la table Produit
             $table->foreign('IdProduit')
                  ->references('IdProduit')->on('Produit')
                  ->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Inventaire');
    }
};
