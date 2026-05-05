<?php

namespace App\Imports;

use App\Models\Pembimbing;
use App\Models\Dudi;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class PembimbingImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    public function model(array $row)
    {
        if (empty($row['nama_lengkap']) || empty($row['nipnuptk'])) {
            return null; // Skip empty rows
        }

        // Avoid duplicate NIP
        if (Pembimbing::where('nip', $row['nipnuptk'])->exists()) {
            return null;
        }

        // Create User account corresponding to this Pembimbing
        $user = User::create([
            'name'     => $row['nama_lengkap'],
            'username' => $row['nipnuptk'],
            'password' => Hash::make('12345678'),
            'role'     => 'pembimbing',
        ]);

        $pembimbing = new Pembimbing([
            'user_id'    => $user->id,
            'name'       => $row['nama_lengkap'],
            'nip'        => $row['nipnuptk'],
            'department' => $row['jurusanbidang'] ?? null,
            'phone'      => $row['no_telepon'] ?? null,
        ]);

        // After save, sync DUDI via pivot if provided
        $pembimbing->save();
        if (!empty($row['tempat_pkl'])) {
            $dudi = Dudi::where('name', $row['tempat_pkl'])->first();
            if ($dudi) {
                $pembimbing->dudis()->syncWithoutDetaching([$dudi->id]);
            }
        }

        // Return null so ToModel doesn't try to save again
        return null;
    }

    public function batchSize(): int
    {
        return 100;
    }

    public function chunkSize(): int
    {
        return 100;
    }
}

