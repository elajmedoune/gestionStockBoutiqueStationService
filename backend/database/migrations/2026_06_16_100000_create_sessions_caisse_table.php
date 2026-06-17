<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sessions_caisse', function (Blueprint $table) {
            $table->id('idSession');
            $table->unsignedBigInteger('idUtilisateur');
            $table->dateTime('dateOuverture');
            $table->dateTime('dateFermeture')->nullable();
            $table->decimal('fondsOuverture', 10, 2)->default(0);
            $table->decimal('fondsFermeture', 10, 2)->nullable();
            $table->decimal('montantVentes', 10, 2)->default(0);
            $table->decimal('ecart', 10, 2)->nullable();
            $table->string('observations', 300)->nullable();
            $table->enum('statut', ['ouverte', 'fermee'])->default('ouverte');
            $table->timestamps();

            $table->foreign('idUtilisateur')
                  ->references('idUtilisateur')
                  ->on('utilisateurs')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions_caisse');
    }
};
