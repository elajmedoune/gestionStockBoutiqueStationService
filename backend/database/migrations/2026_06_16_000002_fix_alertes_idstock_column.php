<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('alertes', 'idProduit') && !Schema::hasColumn('alertes', 'idStock')) {
            $fk = $this->foreignKeyName('alertes', 'idProduit');

            Schema::table('alertes', function (Blueprint $table) use ($fk) {
                if ($fk) {
                    $table->dropForeign($fk);
                }
                $table->renameColumn('idProduit', 'idStock');
            });

            Schema::table('alertes', function (Blueprint $table) {
                $table->foreign('idStock')
                      ->references('idStock')
                      ->on('stocks')
                      ->onDelete('restrict');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('alertes', 'idStock') && !Schema::hasColumn('alertes', 'idProduit')) {
            $fk = $this->foreignKeyName('alertes', 'idStock');

            Schema::table('alertes', function (Blueprint $table) use ($fk) {
                if ($fk) {
                    $table->dropForeign($fk);
                }
                $table->renameColumn('idStock', 'idProduit');
            });

            Schema::table('alertes', function (Blueprint $table) {
                $table->foreign('idProduit')
                      ->references('idProduit')
                      ->on('produits')
                      ->onDelete('restrict');
            });
        }
    }

    private function foreignKeyName(string $table, string $column): ?string
    {
        $row = DB::selectOne(
            "SELECT CONSTRAINT_NAME AS name
             FROM information_schema.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = ?
               AND COLUMN_NAME = ?
               AND REFERENCED_TABLE_NAME IS NOT NULL
             LIMIT 1",
            [$table, $column]
        );

        return $row->name ?? null;
    }
};
