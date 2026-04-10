<?php

namespace App\Http\Controllers\Pembimbing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        $pembimbing = $user->pembimbing;
        
        if (!$pembimbing) {
            return abort(403, 'Akses ditolak. Detail pembimbing tidak ditemukan.');
        }

        $totalSiswa = $pembimbing->siswas()->count();
        $dudi = $pembimbing->dudi;

        return Inertia::render('Pembimbing/Dashboard', [
            'pembimbing' => $pembimbing,
            'dudi' => $dudi,
            'totalSiswa' => $totalSiswa,
        ]);
    }
}
