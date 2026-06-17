<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('inventaires', 'idProduit') && !Schema::hasColumn('inventaires', 'idStock')) {
            $fk = $this->foreignKeyName('inventaires', 'idProduit');

            Schema::table('inventaires', function (Blueprint $table) use ($fk) {
                if ($fk) {
                    $table->dropForeign($fk);
                }
                $table->renameColumn('idProduit', 'idStock');
            });

            Schema::table('inventaires', function (Blueprint $table) {
                $table->foreign('idStock')
                      ->references('idStock')
                      ->on('stocks')
                      ->onDelete('restrict');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('inventaires', 'idStock') && !Schema::hasColumn('inventaires', 'idProduit')) {
            $fk = $this->foreignKeyName('inventaires', 'idStock');

            Schema::table('inventaires', function (Blueprint $table) use ($fk) {
                if ($fk) {
                    $table->dropForeign($fk);
                }
                $table->renameColumn('idStock', 'idProduit');
            });

            Schema::table('inventaires', function (Blueprint $table) {
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
