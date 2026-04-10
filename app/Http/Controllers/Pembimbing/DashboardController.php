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

        // Auto-sync: jika pembimbing punya dudi_id, assign semua siswa di DUDI tersebut
        // yang belum memiliki pembimbing_id
        if ($pembimbing->dudi_id) {
            Siswa::where('dudi_id', $pembimbing->dudi_id)
                ->whereNull('pembimbing_id')
                ->update(['pembimbing_id' => $pembimbing->id]);
        }

        $dudi = $pembimbing->dudi;

        // Count siswa: berdasar pembimbing_id (setelah auto-sync)
        // Juga sertakan siswa yang share dudi_id tapi pembimbing_id belum ter-set
        $totalSiswa = $this->getSiswaQuery($pembimbing)->count();

        // Check apakah pembimbing sudah di-assign ke DUDI
        $isAssigned = $pembimbing->dudi_id !== null;

        return Inertia::render('Pembimbing/Dashboard', [
            'pembimbing' => $pembimbing,
            'dudi'       => $dudi,
            'totalSiswa' => $totalSiswa,
            'isAssigned' => $isAssigned,
        ]);
    }

    /**
     * Query siswa terkait pembimbing ini.
     * Menggunakan pembimbing_id atau fallback via dudi_id.
     */
    private function getSiswaQuery($pembimbing)
    {
        return Siswa::where(function ($q) use ($pembimbing) {
            $q->where('pembimbing_id', $pembimbing->id);
            if ($pembimbing->dudi_id) {
                $q->orWhere('dudi_id', $pembimbing->dudi_id);
            }
        });
    }
}
