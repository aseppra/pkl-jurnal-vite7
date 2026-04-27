<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        /** @var \App\Models\Siswa|null $siswa */
        $siswa = $user->siswa()->with('dudi')->first();

        if (!$siswa) {
            return Inertia::render('Student/Dashboard', [
                'siswa' => null,
                'pklInfo' => null,
                'todayAttendance' => null,
                'weeklyAttendance' => [],
            ]);
        }

        $today = Carbon::today();
        /** @var \App\Models\Siswa $siswa */
        $todayAttendance = $siswa->attendances()->where('date', $today)->first();

        $pklStartStr = Setting::getValue('pkl_start');
        $pklEndStr = Setting::getValue('pkl_end');
        $pklStart = $pklStartStr ? Carbon::parse($pklStartStr)->startOfDay() : null;
        $pklEnd = $pklEndStr ? Carbon::parse($pklEndStr)->endOfDay() : null;

        // Gunakan startOfDay untuk keduanya agar diffInDays selalu integer
        $pklEndForCalc = $pklEndStr ? Carbon::parse($pklEndStr)->startOfDay() : null;

        $totalDays = $pklStart && $pklEndForCalc ? (int) $pklStart->diffInDays($pklEndForCalc) : 0;
        $elapsedDays = $pklStart ? (int) max(0, min($pklStart->diffInDays($today, false), $totalDays)) : 0;
        $progress = $totalDays > 0 ? min((int) round(($elapsedDays / $totalDays) * 100), 100) : 0;

        $isPKLActive = false;
        $pklStatusMessage = 'Belum dikonfigurasi';
        
        if ($pklStart && $pklEnd) {
            $now = Carbon::now();
            if ($now->isBefore($pklStart)) {
                $pklStatusMessage = 'PKL belum dimulai';
            } elseif ($now->isAfter($pklEnd)) {
                $pklStatusMessage = 'PKL telah selesai';
                $progress = 100;
                $elapsedDays = $totalDays;
            } else {
                $isPKLActive = true;
                $pklStatusMessage = 'Sedang berlangsung';
            }
        }

        // Weekly attendance (last 5 weekdays)
        /** @var \App\Models\Siswa $siswa */
        $weeklyAttendance = $siswa->attendances()
            ->where('date', '>=', $today->copy()->subDays(7))
            ->orderBy('date', 'desc')
            ->get()
            ->map(fn($a) => [
                'day' => $a->date->locale('id')->translatedFormat('l'),
                'date' => $a->date->format('d M'),
                'status' => ucfirst($a->status === 'terlambat' ? 'hadir' : $a->status),
                'time' => ($a->check_in ?? '--:--') . ' - ' . ($a->check_out ?? '--:--'),
                'color' => in_array($a->status, ['hadir', 'terlambat']) ? 'emerald' : 'amber',
            ]);

        return Inertia::render('Student/Dashboard', [
            'user' => $user,
            'siswa' => $siswa,
            'pklInfo' => [
                'company' => $siswa->dudi?->name ?? '-',
                'start' => $pklStart?->format('d M Y'),
                'end' => $pklEnd?->format('d M Y'),
                'progress' => $progress,
                'isActive' => $isPKLActive,
                'statusMessage' => $pklStatusMessage,
                'totalDays' => $totalDays,
                'elapsedDays' => $elapsedDays,
            ],
            'todayAttendance' => $todayAttendance,
            'weeklyAttendance' => $weeklyAttendance,
        ]);
    }

    public function checkIn(Request $request)
    {
        if ($error = $this->validatePKLPeriod()) return redirect()->back()->with('error', $error);

        if (Carbon::now()->hour >= 22) {
            return redirect()->back()->with('error', 'Batas waktu presensi (check-in) maksimal adalah jam 22:00.');
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp,heic|max:10240',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $siswa = $user->siswa;
        $today = Carbon::today();

        $photoPath = $request->file('photo')->store('presensi', 'public');

        $attendance = Attendance::firstOrCreate(
            ['siswa_id' => $siswa->id, 'date' => $today],
            [
                'check_in' => Carbon::now()->format('H:i'),
                'status' => 'hadir',
                'location' => $siswa->dudi?->name,
                'photo_check_in' => $photoPath,
            ]
        );

        return redirect()->back()->with([
            'success' => 'Check-in berhasil pada ' . $attendance->check_in,
            'success_data' => [
                'type' => 'checkin',
                'time' => $attendance->check_in,
                'photo' => $photoPath,
            ]
        ]);
    }

    public function checkOut(Request $request)
    {
        if ($error = $this->validatePKLPeriod()) return redirect()->back()->with('error', $error);

        if (Carbon::now()->hour >= 22) {
            return redirect()->back()->with('error', 'Batas waktu presensi (check-out) maksimal adalah jam 22:00.');
        }

        $request->validate([
            'photo' => 'required|image|mimes:jpeg,png,jpg,webp,heic|max:10240',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $siswa = $user->siswa;
        $today = Carbon::today();

        $attendance = Attendance::where('siswa_id', $siswa->id)->where('date', $today)->first();

        if ($attendance) {
            $photoPath = $request->file('photo')->store('presensi', 'public');

            $attendance->update([
                'check_out' => Carbon::now()->format('H:i'),
                'photo_check_out' => $photoPath,
            ]);
            
            return redirect()->back()->with([
                'success' => 'Check-out berhasil pada ' . $attendance->check_out,
                'success_data' => [
                    'type' => 'checkout',
                    'time' => $attendance->check_out,
                    'photo' => $photoPath,
                ]
            ]);
        }

        return redirect()->back()->with('error', 'Anda belum melakukan check-in hari ini.');
    }

    public function izin(Request $request)
    {
        if ($error = $this->validatePKLPeriod()) return redirect()->back()->with('error', $error);

        $request->validate([
            'date' => 'required|date',
            'reason' => 'required|in:Sakit,Kepentingan Keluarga,Lain-lain',
            'notes' => 'required|string|max:500',
            'proof' => 'required|file|mimes:jpeg,png,jpg,pdf|max:2048',
        ]);

        if ($error = $this->validatePKLPeriod($request->date)) {
            return redirect()->back()->with('error', $error);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $siswa = $user->siswa;

        if (!$siswa) {
            return redirect()->back()->with('error', 'Siswa tidak ditemukan.');
        }

        $targetDate = Carbon::parse($request->date)->startOfDay();
        $attendance = $siswa->attendances()->where('date', $targetDate)->first();

        if ($attendance && in_array($attendance->status, ['hadir', 'terlambat', 'izin'])) {
            $statusText = $attendance->status === 'izin' ? 'sudah mengajukan izin' : 'sudah melakukan presensi';
            return redirect()->back()->with('error', "Anda {$statusText} pada tanggal tersebut.");
        }

        $proofFile = null;
        if ($request->hasFile('proof')) {
            $proofFile = $request->file('proof')->store('proofs', 'public');
        }

        $siswa->attendances()->updateOrCreate(
            ['date' => $targetDate],
            [
                'status' => 'izin',
                'reason' => $request->reason,
                'notes' => $request->notes,
                'proof_file' => $proofFile,
                'check_in' => null,
                'check_out' => null,
            ]
        );

        return redirect()->back()->with('success', 'Berhasil mencatat izin absensi.');
    }

    private function validatePKLPeriod($targetDate = null)
    {
        $pklStartStr = Setting::getValue('pkl_start');
        $pklEndStr = Setting::getValue('pkl_end');
        
        if (!$pklStartStr || !$pklEndStr) {
            return 'Jadwal periode PKL belum dikonfigurasi oleh sekolah. Anda belum bisa mengisi presensi.';
        }

        $pklStart = Carbon::parse($pklStartStr)->startOfDay();
        $pklEnd = Carbon::parse($pklEndStr)->endOfDay();
        $now = Carbon::now();
        $target = $targetDate ? Carbon::parse($targetDate)->startOfDay() : $now->copy()->startOfDay();

        // Cek apakah sekarang masih dalam periode PKL (secara keseluruhan)
        if ($now->isBefore($pklStart)) {
            return 'Periode PKL belum dimulai. Anda belum bisa melakukan presensi.';
        }

        if ($now->isAfter($pklEnd)) {
            return 'Periode PKL telah berlalu. Masa presensi sudah ditutup penuh.';
        }

        // Cek apakah tanggal target valid (dalam rentang PKL)
        if ($target->isBefore($pklStart) || $target->isAfter($pklEnd)) {
            return 'Tanggal yang dipilih harus berada dalam rentang periode PKL (' . $pklStart->format('d/m/Y') . ' s/d ' . $pklEnd->format('d/m/Y') . ').';
        }
        
        // Cek apakah tanggal target tidak di masa depan
        if ($target->isAfter($now->startOfDay())) {
            return 'Anda tidak bisa mengisi presensi untuk tanggal di masa depan.';
        }

        return null;
    }
}
