<?php

namespace App\Http\Controllers\Pembimbing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Siswa;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $pembimbing = $user->pembimbing;

        if (!$pembimbing) {
            return abort(403, 'Akses ditolak. Detail pembimbing tidak ditemukan.');
        }

        // Load semua DUDI yang di-assign ke pembimbing ini via pivot
        $dudis   = $pembimbing->dudis()->get(['dudis.id', 'dudis.name']);
        $dudiIds = $dudis->pluck('id')->toArray();

        // Auto-sync: assign semua siswa di DUDI terkait yang belum memiliki pembimbing_id
        if (!empty($dudiIds)) {
            Siswa::whereIn('dudi_id', $dudiIds)
                ->whereNull('pembimbing_id')
                ->update(['pembimbing_id' => $pembimbing->id]);
        }

        // Count siswa: berdasar pembimbing_id + fallback dudi_id
        $totalSiswa = $this->getSiswaQuery($pembimbing, $dudiIds)->count();

        // Check apakah pembimbing sudah di-assign ke minimal 1 DUDI
        $isAssigned = $dudis->isNotEmpty();

        return Inertia::render('Pembimbing/Dashboard', [
            'pembimbing' => $pembimbing,
            'dudi'       => $dudis->first(), // backward compat
            'dudis'      => $dudis,
            'totalSiswa' => $totalSiswa,
            'isAssigned' => $isAssigned,
        ]);
    }

    /**
     * Query siswa terkait pembimbing ini.
     * Menggunakan pembimbing_id atau fallback via dudi_ids dari pivot.
     */
    private function getSiswaQuery($pembimbing, array $dudiIds = [])
    {
        return Siswa::where(function ($q) use ($pembimbing, $dudiIds) {
            $q->where('pembimbing_id', $pembimbing->id);
            if (!empty($dudiIds)) {
                $q->orWhereIn('dudi_id', $dudiIds);
            }
        });
    }
}

