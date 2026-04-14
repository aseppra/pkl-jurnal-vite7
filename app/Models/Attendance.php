<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'siswa_id', 'date', 'check_in', 'check_out', 'status',
        'location', 'notes', 'reason', 'proof_file',
        'check_in_lat', 'check_in_lng', 'check_out_lat', 'check_out_lng',
        'photo_check_in', 'photo_check_out',
    ];

    protected $casts = [
        'date' => 'date',
        'check_in_lat' => 'float',
        'check_in_lng' => 'float',
        'check_out_lat' => 'float',
        'check_out_lng' => 'float',
    ];

    public function siswa(): BelongsTo
    {
        return $this->belongsTo(Siswa::class);
    }
}

