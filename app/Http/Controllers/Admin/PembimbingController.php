<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Pembimbing;
use App\Models\Dudi;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PembimbingController extends Controller
{
    public function index(Request $request)
    {
        $query = Pembimbing::with(['dudi', 'user']);

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%");
            });
        }

        $pembimbings = $query->latest()->paginate(10)->withQueryString();

        $pembimbings->getCollection()->transform(function ($pembimbing) {
            $pembimbing->account_status = $pembimbing->user_id ? 'Generated' : 'Pending';
            $pembimbing->username = $pembimbing->user?->username;
            return $pembimbing;
        });

        return Inertia::render('Admin/DataPembimbing', [
            'pembimbings' => $pembimbings,
            'dudiList' => Dudi::select('id', 'name')->orderBy('name')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nip' => 'required|string|unique:pembimbings,nip',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'dudi_id' => 'nullable|integer|exists:dudis,id',
        ]);

        $pembimbing = Pembimbing::create($validated);

        // Auto-sync: assign this pembimbing to all siswa at the same DUDI
        if ($pembimbing->dudi_id) {
            Siswa::where('dudi_id', $pembimbing->dudi_id)
                ->whereNull('pembimbing_id')
                ->update(['pembimbing_id' => $pembimbing->id]);
        }

        ActivityLog::log('Tambah Pembimbing', "Menambahkan pembimbing {$pembimbing->name} (NIP: {$pembimbing->nip}).");
        return redirect()->back()->with('success', 'Data pembimbing berhasil ditambahkan.');
    }

    public function update(Request $request, Pembimbing $pembimbing)
    {
        $validated = $request->validate([
            'nip' => 'required|string|unique:pembimbings,nip,' . $pembimbing->id,
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'department' => 'nullable|string|max:100',
            'dudi_id' => 'nullable|integer|exists:dudis,id',
        ]);

        $oldDudiId = $pembimbing->dudi_id;
        $pembimbing->update($validated);

        // Auto-sync: if DUDI changed, clear old assignments & set new ones
        if ($oldDudiId && $oldDudiId !== $pembimbing->dudi_id) {
            // Clear pembimbing_id on siswa from old DUDI (only if they pointed to this pembimbing)
            Siswa::where('dudi_id', $oldDudiId)
                ->where('pembimbing_id', $pembimbing->id)
                ->update(['pembimbing_id' => null]);
        }

        if ($pembimbing->dudi_id) {
            // Assign this pembimbing to siswa at the new DUDI that don't have one yet
            Siswa::where('dudi_id', $pembimbing->dudi_id)
                ->whereNull('pembimbing_id')
                ->update(['pembimbing_id' => $pembimbing->id]);
        }

        ActivityLog::log('Update Pembimbing', "Memperbarui data pembimbing {$pembimbing->name}.");
        return redirect()->back()->with('success', 'Data pembimbing berhasil diperbarui.');
    }

    public function destroy(Pembimbing $pembimbing)
    {
        if ($pembimbing->user_id) {
            \App\Models\User::find($pembimbing->user_id)?->delete();
        }
        ActivityLog::log('Hapus Pembimbing', "Menghapus pembimbing {$pembimbing->name}.");
        $pembimbing->delete();
        return redirect()->back()->with('success', 'Data pembimbing berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:pembimbings,id']);
        
        $pembimbings = Pembimbing::whereIn('id', $request->ids)->get();
        foreach ($pembimbings as $pembimbing) {
            if ($pembimbing->user_id) {
                \App\Models\User::find($pembimbing->user_id)?->delete();
            }
            $pembimbing->delete();
        }
        
        ActivityLog::log('Hapus Masal Pembimbing', 'Menghapus ' . count($request->ids) . ' data pembimbing sekaligus.');
        return redirect()->back()->with('success', count($request->ids) . ' data pembimbing berhasil dihapus.');
    }

    public function generateAccounts()
    {
        $pembimbings = Pembimbing::whereNull('user_id')->get();

        foreach ($pembimbings as $pembimbing) {
            $user = \App\Models\User::create([
                'name' => $pembimbing->name,
                'username' => $pembimbing->nip,
                'email' => strtolower(str_replace(' ', '.', $pembimbing->name)) . rand(10,99). '@guru.sch.id',
                'role' => 'pembimbing',
                'password' => $pembimbing->nip,
            ]);
            $pembimbing->update(['user_id' => $user->id]);
        }

        ActivityLog::log('Generate Akun Pembimbing', 'Meng-generate akun untuk ' . $pembimbings->count() . ' pembimbing.');
        return redirect()->back()->with('success', 'Akun berhasil di-generate untuk ' . $pembimbings->count() . ' pembimbing.');
    }

    public function clearAccounts()
    {
        $pembimbings = Pembimbing::whereNotNull('user_id')->get();
        foreach ($pembimbings as $pembimbing) {
            \App\Models\User::find($pembimbing->user_id)?->delete();
            $pembimbing->update(['user_id' => null]);
        }

        ActivityLog::log('Hapus Semua Akun Pembimbing', 'Menghapus semua akun login pembimbing.');
        return redirect()->back()->with('success', 'Semua akun pembimbing berhasil dihapus.');
    }
}
