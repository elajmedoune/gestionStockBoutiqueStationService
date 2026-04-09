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
        Schema::create('stocks', function (Blueprint $table) {
            $table->id('idStock');
            $table->integer('quantiteInitiale')->default(0);
            $table->integer('quantiteRestante')->default(0);
            $table->date('dateEntree');
            $table->date('dateExpiration')->nullable();
            $table->decimal('prixEnGros', 10, 2)->default(0.00);
            $table->decimal('prixAchat', 10, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');
    }
};
