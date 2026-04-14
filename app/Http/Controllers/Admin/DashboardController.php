<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\Attendance;
use App\Models\Journal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $totalSiswa = Siswa::count();
        $today = Carbon::today();

        $todayAttendances = Attendance::where('date', $today)->get();
        $hadirCount = $todayAttendances->whereIn('status', ['hadir', 'terlambat'])->count();
        $belumCount = $totalSiswa - $todayAttendances->count();
        $izinCount = $todayAttendances->where('status', 'izin')->count();

        $recentAttendances = Attendance::with('siswa.dudi')
            ->where('date', $today)
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'name' => $a->siswa->name,
                'time' => $a->check_in ?? '--:--',
                'location' => $a->siswa->dudi?->name ?? '-',
                'status' => ucfirst($a->status === 'terlambat' ? 'hadir' : $a->status),
                'statusColor' => match($a->status === 'terlambat' ? 'hadir' : $a->status) {
                    'hadir' => 'emerald',
                    'izin' => 'red',
                    default => 'slate',
                },
            ]);

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'totalSiswa' => $totalSiswa,
                'hadirCount' => $hadirCount,
                'belumCount' => $belumCount + $izinCount,
                'izinCount' => $izinCount,
                'belumMasuk' => $belumCount,
            ],
            'pklPeriod' => [
                'start' => \App\Models\Setting::getValue('pkl_start'),
                'end' => \App\Models\Setting::getValue('pkl_end'),
            ],
            'recentAttendances' => $recentAttendances,
        ]);
    }
}
