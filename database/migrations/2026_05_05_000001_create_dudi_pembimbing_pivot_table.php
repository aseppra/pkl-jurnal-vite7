<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create the pivot table
        Schema::create('dudi_pembimbing', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dudi_id')->constrained('dudis')->onDelete('cascade');
            $table->foreignId('pembimbing_id')->constrained('pembimbings')->onDelete('cascade');
            $table->timestamps();
            $table->unique(['dudi_id', 'pembimbing_id']);
        });

        // 2. Migrate existing dudi_id data from pembimbings to the pivot table
        $pembimbings = DB::table('pembimbings')->whereNotNull('dudi_id')->get(['id', 'dudi_id']);
        foreach ($pembimbings as $p) {
            DB::table('dudi_pembimbing')->insertOrIgnore([
                'dudi_id'       => $p->dudi_id,
                'pembimbing_id' => $p->id,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        // 3. Remove the dudi_id column from pembimbings table
        Schema::table('pembimbings', function (Blueprint $table) {
            $table->dropForeign(['dudi_id']);
            $table->dropColumn('dudi_id');
        });
    }

    public function down(): void
    {
        // Re-add dudi_id to pembimbings
        Schema::table('pembimbings', function (Blueprint $table) {
            $table->foreignId('dudi_id')->nullable()->constrained('dudis')->onDelete('set null');
        });

        // Restore data from pivot (take first DUDI per pembimbing as fallback)
        $pivotRows = DB::table('dudi_pembimbing')->get(['dudi_id', 'pembimbing_id']);
        $byPembimbing = [];
        foreach ($pivotRows as $row) {
            if (!isset($byPembimbing[$row->pembimbing_id])) {
                $byPembimbing[$row->pembimbing_id] = $row->dudi_id;
            }
        }
        foreach ($byPembimbing as $pembimbingId => $dudiId) {
            DB::table('pembimbings')->where('id', $pembimbingId)->update(['dudi_id' => $dudiId]);
        }

        // Drop pivot table
        Schema::dropIfExists('dudi_pembimbing');
    }
};
