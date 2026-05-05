<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Pembimbing extends Model
{
    protected $fillable = ['user_id', 'nip', 'name', 'phone', 'department'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function dudis(): BelongsToMany
    {
        return $this->belongsToMany(Dudi::class, 'dudi_pembimbing');
    }

    public function siswas(): HasMany
    {
        return $this->hasMany(Siswa::class);
    }
}
