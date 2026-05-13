<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            if (!Schema::hasColumn('commandes', 'idFournisseur')) {
                $table->unsignedBigInteger('idFournisseur')->nullable()->after('idLivraison');
                $table->foreign('idFournisseur')
                    ->references('idFournisseur')
                    ->on('fournisseurs')
                    ->onDelete('restrict');
            }
        });
    }

    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['idFournisseur']);
            $table->dropColumn('idFournisseur');
        });
    }
};
