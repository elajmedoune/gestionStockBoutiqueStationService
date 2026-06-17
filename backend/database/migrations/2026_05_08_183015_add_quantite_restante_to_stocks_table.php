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
        // quantiteRestante existe déjà depuis la migration d'origine
        // (create_stocks_table.php) — rien à faire ici.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
