<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventaires', function (Blueprint $table) {
            $table->id('idInventaire');
            $table->date('dateInventaire');
            $table->integer('quantiteTheorique')->default(0);
            $table->integer('quantiteReelle')->default(0);        
            // $table->integer('ecart')->nullable()->storedAs('quantiteReelle - quantiteTheorique'); // commenté, plus sûr
            $table->string('observations', 300)->nullable();
            $table->string('statut', 20)->default('en_cours');
            $table->unsignedBigInteger('idUtilisateur');        
            $table->unsignedBigInteger('idProduit');           
            $table->timestamps();

            $table->foreign('idUtilisateur')                     
                  ->references('idUtilisateur')
                  ->on('utilisateurs')
                  ->onDelete('restrict');

            $table->foreign('idProduit')                         
                  ->references('idProduit')
                  ->on('produits')
                  ->onDelete('restrict');
            
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventaires');
    }
};