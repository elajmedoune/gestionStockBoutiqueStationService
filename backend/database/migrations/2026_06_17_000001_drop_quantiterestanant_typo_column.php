<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('stocks', 'quantiteRestanant')) {
            Schema::table('stocks', function (Blueprint $table) {
                $table->dropColumn('quantiteRestanant');
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('stocks', 'quantiteRestanant')) {
            Schema::table('stocks', function (Blueprint $table) {
                $table->integer('quantiteRestanant')->default(0)->after('quantiteInitiale');
            });
        }
    }
};
