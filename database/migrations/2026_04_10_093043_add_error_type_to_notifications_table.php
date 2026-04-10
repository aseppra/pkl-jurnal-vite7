<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Alter ENUM to include 'error'
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('success', 'warning', 'info', 'error') NOT NULL DEFAULT 'info'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('success', 'warning', 'info') NOT NULL DEFAULT 'info'");
    }
};
