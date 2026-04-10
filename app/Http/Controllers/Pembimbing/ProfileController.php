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

        $pembimbing->load('dudi');

        return Inertia::render('Pembimbing/Profile', [
            'pembimbing' => [
                'name'       => $pembimbing->name,
                'nip'        => $pembimbing->nip,
                'department' => $pembimbing->department,
                'phone'      => $pembimbing->phone,
                'dudi'       => $pembimbing->dudi ? [
                    'name'         => $pembimbing->dudi->name,
                    'address'      => $pembimbing->dudi->address ?? null,
                    'contact_name' => $pembimbing->dudi->contact_name ?? null,
                    'contact'      => $pembimbing->dudi->contact ?? null,
                ] : null,
            ],
            'user' => [
                'username' => $user->username,
                'email'    => $user->email,
            ],
        ]);
    }
}
