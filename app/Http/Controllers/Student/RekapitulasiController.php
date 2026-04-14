<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RekapitulasiController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $siswa = $user->siswa()->with(['dudi', 'pembimbing'])->first();

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $attendances = $siswa->attendances()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        $journals = $siswa->journals()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Student/Rekapitulasi', [
            'siswa' => $siswa,
            'attendances' => $attendances,
            'journals' => $journals,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'pklPeriod' => [
                'start' => \App\Models\Setting::getValue('pkl_start'),
                'end' => \App\Models\Setting::getValue('pkl_end'),
            ]
        ]);
    }

    public function exportPresensiPdf(Request $request)
    {
        $siswa = Auth::user()->siswa()->with(['dudi', 'pembimbing'])->first();

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $attendances = $siswa->attendances()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        $stats = [
            'hadir' => $attendances->whereIn('status', ['hadir', 'terlambat'])->count(),
            'izin' => $attendances->where('status', 'izin')->count(),
            'sakit' => $attendances->where('status', 'sakit')->count(),
            'alpha' => $attendances->whereIn('status', ['alpha', 'alpa'])->count(),
        ];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.rekap-presensi', compact('siswa', 'attendances', 'stats', 'startDate', 'endDate'));
        $pdf->setPaper('a4', 'portrait');

        $filename = 'Rekap_Presensi_Saya_' . $startDate . '.pdf';

        return $pdf->download($filename); // Direct download
    }

    public function exportJurnalPdf(Request $request)
    {
        $siswa = Auth::user()->siswa()->with(['dudi', 'pembimbing'])->first();

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $journals = $siswa->journals()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.rekap-jurnal', compact('siswa', 'journals', 'startDate', 'endDate'));
        $pdf->setPaper('a4', 'portrait');

        $filename = 'Rekap_Jurnal_Saya_' . $startDate . '.pdf';

        return $pdf->download($filename); // Direct download
    }

    private function resolveDateRange(Request $request): array
    {
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        if (!$startDate || !$endDate) {
            $start = \App\Models\Setting::getValue('pkl_start');
            $end = \App\Models\Setting::getValue('pkl_end');

            if ($start && $end) {
                $startDate = $start;
                $endDate = $end;
            } else {
                $startDate = now()->startOfMonth()->toDateString();
                $endDate = now()->endOfMonth()->toDateString();
            }
        }

        return [$startDate, $endDate];
    }
}
