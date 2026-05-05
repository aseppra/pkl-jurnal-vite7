<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Dudi extends Model
{
    protected $fillable = ['name', 'address', 'contact_name', 'contact', 'email', 'is_active', 'jam_masuk', 'jam_pulang'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function siswas(): HasMany
    {
        return $this->hasMany(Siswa::class);
    }

    public function activeSiswasCount(): int
    {
        return $this->siswas()->count();
    }

    public function pembimbings(): BelongsToMany
    {
        return $this->belongsToMany(Pembimbing::class, 'dudi_pembimbing');
    }
}

