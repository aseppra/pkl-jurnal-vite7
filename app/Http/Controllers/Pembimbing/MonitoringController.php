<?php

namespace App\Http\Controllers\Pembimbing;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Siswa;
use App\Models\Attendance;
use App\Models\Journal;
use App\Models\Notification;

class MonitoringController extends Controller
{
    private function checkPembimbing()
    {
        $pembimbing = auth()->user()->pembimbing;
        if (!$pembimbing) {
            abort(403, 'Data pembimbing tidak ditemukan.');
        }
        return $pembimbing;
    }

    /**
     * Get all siswa IDs for this pembimbing.
     * Uses pembimbing_id OR dudi_id as fallback for unsynced data.
     * Also runs auto-sync to fill missing pembimbing_id.
     */
    private function getSiswaIds($pembimbing): \Illuminate\Support\Collection
    {
        // Auto-sync siswa yang belum ter-assign
        if ($pembimbing->dudi_id) {
            Siswa::where('dudi_id', $pembimbing->dudi_id)
                ->whereNull('pembimbing_id')
                ->update(['pembimbing_id' => $pembimbing->id]);
        }

        return Siswa::where(function ($q) use ($pembimbing) {
            $q->where('pembimbing_id', $pembimbing->id);
            if ($pembimbing->dudi_id) {
                $q->orWhere('dudi_id', $pembimbing->dudi_id);
            }
        })->pluck('id');
    }

    /**
     * Data siswa bimbingan.
     */
    public function siswa(Request $request)
    {
        $pembimbing = $this->checkPembimbing();
        $siswaIds   = $this->getSiswaIds($pembimbing);

        $query = Siswa::whereIn('id', $siswaIds)->with('dudi');

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        $siswas = $query->orderBy('name')->paginate(10)->withQueryString();

        // Info state: apakah pembimbing sudah di-assign ke DUDI?
        $isAssigned = $pembimbing->dudi_id !== null;

        return Inertia::render('Pembimbing/DataSiswa', [
            'siswas'     => $siswas,
            'filters'    => $request->only('search'),
            'isAssigned' => $isAssigned,
            'dudi'       => $pembimbing->dudi,
        ]);
    }

    /**
     * Monitoring presensi.
     */
    public function presensi(Request $request)
    {
        $pembimbing = $this->checkPembimbing();
        $siswaIds   = $this->getSiswaIds($pembimbing);

        $query = Attendance::whereIn('siswa_id', $siswaIds)->with(['siswa.dudi', 'siswa']);

        if ($search = $request->input('search')) {
            $query->whereHas('siswa', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($date = $request->input('date')) {
            $query->whereDate('date', $date);
        }

        $attendances = $query->latest('date')->latest('check_in')->paginate(15)->withQueryString();

        $isAssigned = $pembimbing->dudi_id !== null;

        return Inertia::render('Pembimbing/Presensi', [
            'attendances' => $attendances,
            'filters'     => $request->only('search', 'date'),
            'isAssigned'  => $isAssigned,
        ]);
    }

    /**
     * Monitoring jurnal.
     */
    public function jurnal(Request $request)
    {
        $pembimbing = $this->checkPembimbing();
        $siswaIds   = $this->getSiswaIds($pembimbing);

        $query = Journal::whereIn('siswa_id', $siswaIds)->with(['siswa.dudi', 'siswa']);

        if ($search = $request->input('search')) {
            $query->whereHas('siswa', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($date = $request->input('date')) {
            $query->whereDate('date', $date);
        }

        $journals = $query->latest('date')->paginate(15)->withQueryString();

        $isAssigned = $pembimbing->dudi_id !== null;

        return Inertia::render('Pembimbing/Jurnal', [
            'journals'   => $journals,
            'filters'    => $request->only('search', 'date'),
            'isAssigned' => $isAssigned,
        ]);
    }

    /**
     * Kirim notifikasi ke siswa.
     */
    public function sendNotification(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'title'    => 'required|string|max:255',
            'message'  => 'required|string',
            'type'     => 'required|in:info,warning,success,error'
        ]);

        $pembimbing = $this->checkPembimbing();
        $siswaIds   = $this->getSiswaIds($pembimbing);
        $siswa      = Siswa::findOrFail($request->siswa_id);

        // Validasi siswa ada dalam scope pembimbing ini
        if (!$siswaIds->contains($siswa->id)) {
            abort(403, 'Akses ditolak. Siswa ini bukan bimbingan Anda.');
        }

        if ($siswa->user_id) {
            Notification::create([
                'user_id'  => $siswa->user_id,
                'title'    => $request->title,
                'message'  => $request->message . "\n\n— Dikirim oleh Pembimbing: " . $pembimbing->name,
                'type'     => $request->type,
                'is_read'  => false,
            ]);
        }

        return redirect()->back()->with('success', 'Notifikasi berhasil dikirim ke ' . $siswa->name . '.');
    }
}
