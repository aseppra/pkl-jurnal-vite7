<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Siswa;
use App\Models\Kelas;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class SiswaController extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::with('dudi');

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($class = $request->input('class')) {
            $query->where('class', $class);
        }

        $siswas = $query->latest()->paginate(10)->withQueryString();

        $siswas->getCollection()->transform(function ($siswa) {
            $siswa->account_status = $siswa->user_id ? 'Generated' : 'Pending';
            $siswa->username = $siswa->user?->username;
            $siswa->password_plain = $siswa->password_plain ?? ($siswa->nisn); // fallback ke NISN
            return $siswa;
        });

        return Inertia::render('Admin/DataSiswa', [
            'siswas' => $siswas,
            'kelasList' => Kelas::orderBy('name')->get(),
            'filters' => $request->only('search', 'class'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nisn' => 'required|string|unique:siswas,nisn',
            'name' => 'required|string|max:255',
            'gender' => 'nullable|in:L,P',
            'email' => 'nullable|email|max:255',
            'class' => 'required|string|max:50',
        ]);

        $siswa = Siswa::create($validated);
        ActivityLog::log('Tambah Siswa', "Menambahkan siswa {$siswa->name} (NISN: {$siswa->nisn}).");

        return redirect()->back()->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function update(Request $request, Siswa $siswa)
    {
        $validated = $request->validate([
            'nisn' => 'required|string|unique:siswas,nisn,' . $siswa->id,
            'name' => 'required|string|max:255',
            'gender' => 'nullable|in:L,P',
            'email' => 'nullable|email|max:255',
            'class' => 'required|string|max:50',
        ]);

        $siswa->update($validated);
        ActivityLog::log('Update Siswa', "Memperbarui data siswa {$siswa->name} (NISN: {$siswa->nisn}).");

        return redirect()->back()->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Siswa $siswa)
    {
        if ($siswa->user_id) {
            User::find($siswa->user_id)?->delete();
        }
        ActivityLog::log('Hapus Siswa', "Menghapus siswa {$siswa->name} (NISN: {$siswa->nisn}).");
        $siswa->delete();

        return redirect()->back()->with('success', 'Data siswa berhasil dihapus.');
    }

    public function generateAccounts()
    {
        $siswas = Siswa::whereNull('user_id')->get();

        foreach ($siswas as $siswa) {
            $password = $siswa->nisn; // Default password = NISN
            $user = User::create([
                'name' => $siswa->name,
                'username' => $siswa->nisn,
                'email' => strtolower(str_replace(' ', '.', $siswa->name)) . '@student.sch.id',
                'role' => 'siswa',
                'password' => Hash::make($password),
            ]);
            $siswa->update(['user_id' => $user->id, 'password_plain' => $password]);
        }

        ActivityLog::log('Generate Akun Siswa', 'Meng-generate akun untuk ' . $siswas->count() . ' siswa.');
        return redirect()->back()->with('success', 'Akun berhasil di-generate untuk ' . $siswas->count() . ' siswa.');
    }

    public function clearAccounts()
    {
        $siswas = Siswa::whereNotNull('user_id')->get();
        foreach ($siswas as $siswa) {
            User::find($siswa->user_id)?->delete();
            $siswa->update(['user_id' => null, 'password_plain' => null]);
        }

        ActivityLog::log('Hapus Semua Akun Siswa', 'Menghapus semua akun login siswa.');
        return redirect()->back()->with('success', 'Semua akun siswa berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:siswas,id']);

        $siswas = Siswa::whereIn('id', $request->ids)->get();
        foreach ($siswas as $siswa) {
            if ($siswa->user_id) {
                User::find($siswa->user_id)?->delete();
            }
            $siswa->delete();
        }

        ActivityLog::log('Hapus Masal Siswa', 'Menghapus ' . count($request->ids) . ' data siswa sekaligus.');
        return redirect()->back()->with('success', count($request->ids) . ' data siswa berhasil dihapus.');
    }
}
