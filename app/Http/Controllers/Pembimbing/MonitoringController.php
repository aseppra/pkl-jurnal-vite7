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

    public function siswa(Request $request)
    {
        $pembimbing = $this->checkPembimbing();

        $query = Siswa::where('pembimbing_id', $pembimbing->id)->with('dudi');

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        $siswas = $query->paginate(10)->withQueryString();

        return Inertia::render('Pembimbing/DataSiswa', [
            'siswas' => $siswas,
            'filters' => $request->only('search')
        ]);
    }

    public function presensi(Request $request)
    {
        $pembimbing = $this->checkPembimbing();
        $siswaIds = $pembimbing->siswas()->pluck('id');

        $query = Attendance::whereIn('siswa_id', $siswaIds)->with(['siswa.dudi', 'siswa']);

        if ($search = $request->input('search')) {
            $query->whereHas('siswa', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($date = $request->input('date')) {
            $query->whereDate('date', $date);
        }

        $attendances = $query->latest('date')->latest('check_in')->paginate(15)->withQueryString();

        return Inertia::render('Pembimbing/Presensi', [
            'attendances' => $attendances,
            'filters' => $request->only('search', 'date')
        ]);
    }

    public function jurnal(Request $request)
    {
        $pembimbing = $this->checkPembimbing();
        $siswaIds = $pembimbing->siswas()->pluck('id');

        $query = Journal::whereIn('siswa_id', $siswaIds)->with(['siswa.dudi', 'siswa']);

        if ($search = $request->input('search')) {
            $query->whereHas('siswa', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($date = $request->input('date')) {
            $query->whereDate('date', $date);
        }

        $journals = $query->latest('date')->paginate(15)->withQueryString();

        return Inertia::render('Pembimbing/Jurnal', [
            'journals' => $journals,
            'filters' => $request->only('search', 'date')
        ]);
    }

    public function sendNotification(Request $request)
    {
        $request->validate([
            'siswa_id' => 'required|exists:siswas,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'required|in:info,warning,success,error'
        ]);

        $siswa = Siswa::find($request->siswa_id);
        
        $pembimbing = $this->checkPembimbing();
        if ($siswa->pembimbing_id !== $pembimbing->id) {
            abort(403, 'Akses ditolak.');
        }

        if ($siswa->user_id) {
            Notification::create([
                'user_id' => $siswa->user_id,
                'title' => $request->title,
                'message' => $request->message . "\n\n- (Dikirim oleh Pembimbing)",
                'type' => $request->type,
                'is_read' => false
            ]);
        }

        return redirect()->back()->with('success', 'Notifikasi berhasil dikirim.');
    }
}
