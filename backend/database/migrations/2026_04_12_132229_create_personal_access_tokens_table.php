<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table already exists
    }

    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};