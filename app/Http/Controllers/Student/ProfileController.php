<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Pembimbing;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        $siswa = $user->siswa()->with(['dudi', 'pembimbing.dudis'])->first();

        // If siswa has no pembimbing_id but has dudi_id, auto-resolve by matching DUDI via pivot
        if ($siswa && !$siswa->pembimbing_id && $siswa->dudi_id) {
            $matchedPembimbing = Pembimbing::with('dudis')
                ->whereHas('dudis', fn($q) => $q->where('dudis.id', $siswa->dudi_id))
                ->first();

            if ($matchedPembimbing) {
                // Auto-assign for future lookups
                $siswa->update(['pembimbing_id' => $matchedPembimbing->id]);
                $siswa->setRelation('pembimbing', $matchedPembimbing);
            }
        }

        return Inertia::render('Student/Profile', [
            'user' => $user,
            'siswa' => $siswa,
            'periodePkl' => [
                'start' => Setting::getValue('pkl_start'),
                'end' => Setting::getValue('pkl_end'),
            ],
        ]);
    }
}
