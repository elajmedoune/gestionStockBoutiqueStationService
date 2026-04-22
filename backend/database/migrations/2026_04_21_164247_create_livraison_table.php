<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livraison', function (Blueprint $table) {
            $table->increments('idLivraison');
            $table->date('dateLivraison');
            $table->decimal('montantTotal', 10, 2)->default(0);
            $table->string('observations', 300)->nullable();
            $table->unsignedInteger('idCommande')->unique();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livraison');
    }
};