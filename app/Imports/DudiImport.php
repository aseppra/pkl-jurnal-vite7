<?php

namespace App\Imports;

use App\Models\Dudi;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithBatchInserts;
use Maatwebsite\Excel\Concerns\WithChunkReading;

class DudiImport implements ToModel, WithHeadingRow, WithBatchInserts, WithChunkReading
{
    public function model(array $row)
    {
        if (empty($row['nama_perusahaan'])) {
            return null; // Skip empty rows
        }

        // Avoid duplicates by name
        if (Dudi::where('name', $row['nama_perusahaan'])->exists()) {
            return null;
        }

        return new Dudi([
            'name' => $row['nama_perusahaan'],
            'address' => $row['alamat'] ?? null,
            'contact_name' => $row['nama_pic_dudi'] ?? null,
            'contact' => $row['nomor_telepon'] ?? null,
        ]);
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
