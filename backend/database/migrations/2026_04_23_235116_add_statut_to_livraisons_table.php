<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('livraisons', function (Blueprint $table) {
            $table->enum('statut', ['en_attente', 'livree', 'annulee'])
                  ->default('en_attente')
                  ->after('montantTotal');
        });
    }

    public function down()
    {
        Schema::table('livraisons', function (Blueprint $table) {
            $table->dropColumn('statut');
        });
    }
};