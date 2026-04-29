<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertes', function (Blueprint $table) {
            $table->id('idAlerte');
            $table->string('type', 20);
            $table->string('message', 300);
            $table->timestamp('dateCreation')->useCurrent();
            $table->boolean('lue')->default(false);
            $table->enum('niveauUrgence', ['faible', 'moyen', 'critique'])->default('moyen');
            $table->unsignedBigInteger('idUtilisateur');
            $table->unsignedBigInteger('idStock');
            $table->timestamps();

            $table->foreign('idUtilisateur')
                  ->references('idUtilisateur')
                  ->on('utilisateurs')
                  ->onDelete('restrict');

            $table->foreign('idStock')
                  ->references('idStock')
                  ->on('stocks')
                  ->onDelete('restrict');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('alertes');
    }
};
