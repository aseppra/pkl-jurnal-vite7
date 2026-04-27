<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Carbon\Carbon;

class JournalController extends Controller
{
    public function index(Request $request)
    {
        $siswa = Auth::user()->siswa;

        $query = $siswa->journals()->latest('date');

        if ($filter = $request->input('filter')) {
            if ($filter === 'harian') {
                $query->whereDate('date', now()->toDateString());
            } elseif ($filter === 'mingguan') {
                $query->whereBetween('date', [now()->startOfWeek()->toDateString(), now()->endOfWeek()->toDateString()]);
            } elseif ($filter === 'bulanan') {
                $query->whereMonth('date', now()->month)->whereYear('date', now()->year);
            }
        }

        $journals = $query->get()->map(fn($j) => [
            'id' => $j->id,
            'date' => $j->date->format('d M Y'),
            'raw_date' => $j->date->format('Y-m-d'),
            'title' => $j->title,
            'description' => $j->description,
            'status' => $j->status,
            'statusText' => match($j->status) {
                'verified' => 'Terverifikasi',
                'pending' => 'Menunggu Review',
                'revision' => 'Perlu Revisi',
            },
            'image_path' => $j->image_path,
        ]);

        return Inertia::render('Student/JurnalSaya', [
            'journals' => $journals,
            'filters' => $request->only('filter'),
            'siswa' => $siswa,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,heic|max:10240',
        ]);

        if ($error = $this->validatePKLPeriod($validated['date'])) {
            return redirect()->back()->with('error', $error);
        }

        $siswa = Auth::user()->siswa;

        // Cek duplikasi jurnal pada tanggal yang sama
        $exists = $siswa->journals()->whereDate('date', $validated['date'])->exists();
        if ($exists) {
            return redirect()->back()->with('error', 'Anda sudah mengisi jurnal untuk tanggal tersebut.');
        }

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('journals', 'public');
        }

        Journal::create([
            'siswa_id' => $siswa->id,
            'date' => $validated['date'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image_path' => $imagePath,
            'status' => 'verified',
        ]);

        return redirect()->back()->with('success', 'Jurnal berhasil dikirim.');
    }

    public function update(Request $request, Journal $journal)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $siswa = $user->siswa;

        if ($journal->siswa_id !== $siswa->id) {
            abort(403, 'Akses ditolak.');
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp,heic|max:10240',
        ]);

        if ($error = $this->validatePKLPeriod($validated['date'])) {
            return redirect()->back()->with('error', $error);
        }

        // Cek duplikasi jurnal pada tanggal yang sama (kecuali jurnal ini sendiri)
        $exists = $siswa->journals()
            ->whereDate('date', $validated['date'])
            ->where('id', '!=', $journal->id)
            ->exists();
        if ($exists) {
            return redirect()->back()->with('error', 'Anda sudah memiliki jurnal lain pada tanggal tersebut.');
        }

        $imagePath = $journal->image_path;

        if ($request->hasFile('image')) {
            // Hapus foto lama jika ada
            if ($journal->image_path) {
                Storage::disk('public')->delete($journal->image_path);
            }
            $imagePath = $request->file('image')->store('journals', 'public');
        }

        $journal->update([
            'date' => $validated['date'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'image_path' => $imagePath,
        ]);

        return redirect()->back()->with('success', 'Jurnal berhasil diperbarui.');
    }

    private function validatePKLPeriod($targetDate = null)
    {
        $pklStartStr = Setting::getValue('pkl_start');
        $pklEndStr = Setting::getValue('pkl_end');
        
        if (!$pklStartStr || !$pklEndStr) {
            return 'Jadwal periode PKL belum dikonfigurasi oleh sekolah. Anda belum bisa mengisi jurnal.';
        }

        $pklStart = Carbon::parse($pklStartStr)->startOfDay();
        $pklEnd = Carbon::parse($pklEndStr)->endOfDay();
        $now = Carbon::now();
        $target = $targetDate ? Carbon::parse($targetDate)->startOfDay() : $now->copy()->startOfDay();

        // Cek apakah sekarang masih dalam periode PKL (secara keseluruhan)
        if ($now->isBefore($pklStart)) {
            return 'Periode PKL belum dimulai. Anda belum bisa mengirim jurnal.';
        }

        if ($now->isAfter($pklEnd)) {
            return 'Periode PKL telah berlalu. Masa pengisian jurnal sudah ditutup penuh.';
        }
        
        // Cek apakah tanggal target valid (dalam rentang PKL)
        if ($target->isBefore($pklStart) || $target->isAfter($pklEnd)) {
            return 'Tanggal yang dipilih harus berada dalam rentang periode PKL (' . $pklStart->format('d/m/Y') . ' s/d ' . $pklEnd->format('d/m/Y') . ').';
        }
        
        // Cek apakah tanggal target tidak di masa depan
        if ($target->isAfter($now->startOfDay())) {
            return 'Anda tidak bisa mengisi jurnal untuk tanggal di masa depan.';
        }

        return null;
    }
}
