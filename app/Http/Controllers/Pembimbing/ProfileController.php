<?php

namespace App\Http\Controllers\Pembimbing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function index()
    {
        $user       = auth()->user();
        $pembimbing = $user->pembimbing;

        if (!$pembimbing) {
            abort(403, 'Data pembimbing tidak ditemukan.');
        }

        $pembimbing->load('dudis');
        $firstDudi = $pembimbing->dudis->first();

        return Inertia::render('Pembimbing/Profile', [
            'pembimbing' => [
                'name'       => $pembimbing->name,
                'nip'        => $pembimbing->nip,
                'department' => $pembimbing->department,
                'phone'      => $pembimbing->phone,
                'dudi'       => $firstDudi ? [
                    'name'         => $firstDudi->name,
                    'address'      => $firstDudi->address ?? null,
                    'contact_name' => $firstDudi->contact_name ?? null,
                    'contact'      => $firstDudi->contact ?? null,
                ] : null,
            ],
            'user' => [
                'username' => $user->username,
                'email'    => $user->email,
            ],
        ]);
    }
}
