<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\Dudi;
use App\Models\Pembimbing;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RekapitulasiController extends Controller
{
    public function index(Request $request)
    {
        $query = Siswa::with(['dudi', 'journals', 'attendances']);

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('nisn', 'like', "%{$search}%");
            });
        }
        if ($class = $request->input('class')) $query->where('class', $class);
        if ($company = $request->input('company')) $query->whereHas('dudi', fn($q) => $q->where('name', $company));

        $paginator = $query->paginate(10)->withQueryString();

        $paginator->getCollection()->transform(function ($s) {
            $totalDays = max($s->attendances->count(), 1);
            $hadirDays = $s->attendances->whereIn('status', ['hadir', 'terlambat'])->count();
            
            // Check if filled today - use filter since 'date' is cast to Carbon
            $todayStr = today()->toDateString();
            $hasJournalToday = $s->journals->filter(fn($j) => $j->date->toDateString() === $todayStr)->count() > 0;

            return [
                'id' => $s->id,
                'name' => $s->name,
                'nisn' => $s->nisn,
                'class' => $s->class,
                'company' => $s->dudi?->name ?? '-',
                'attendance' => $hadirDays . '/' . $totalDays,
                'progress' => $totalDays > 0 ? round(($hadirDays / $totalDays) * 100) : 0,
                'status' => $hasJournalToday ? 'Sudah Mengisi' : 'Belum Mengisi',
                'statusColor' => $hasJournalToday ? 'emerald' : 'rose',
            ];
        });

        $totalSiswa = Siswa::count();
        $totalDudi = Dudi::count();
        $totalPembimbing = Pembimbing::count();

        $classes = Siswa::distinct()->pluck('class');
        $companies = Dudi::pluck('name');

        return Inertia::render('Admin/Rekapitulasi', [
            'students' => $paginator,
            'stats' => [
                'totalSiswa' => $totalSiswa,
                'totalDudi' => $totalDudi,
                'totalPembimbing' => $totalPembimbing,
            ],
            'classes' => $classes,
            'companies' => $companies,
            'filters' => $request->only('search', 'class', 'company'),
        ]);
    }

    public function show(Siswa $siswa, Request $request)
    {
        $siswa->load('dudi', 'pembimbing');
        $this->resolvePembimbing($siswa);

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $attendances = $siswa->attendances()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        $journals = $siswa->journals()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Admin/RekapitulasiDetail', [
            'siswa' => $siswa,
            'attendances' => $attendances,
            'journals' => $journals,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ]
        ]);
    }

    public function exportPresensiPdf(Siswa $siswa, Request $request)
    {
        $siswa->load('dudi', 'pembimbing');
        $this->resolvePembimbing($siswa);

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

        $filename = 'Rekap_Presensi_' . str_replace(' ', '_', $siswa->name) . '_' . $startDate . '.pdf';

        if ($request->boolean('download')) {
            return $pdf->download($filename);
        }

        return $pdf->stream($filename);
    }

    public function exportJurnalPdf(Siswa $siswa, Request $request)
    {
        $siswa->load('dudi', 'pembimbing');
        $this->resolvePembimbing($siswa);

        [$startDate, $endDate] = $this->resolveDateRange($request);

        $journals = $siswa->journals()
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'asc')
            ->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.rekap-jurnal', compact('siswa', 'journals', 'startDate', 'endDate'));
        $pdf->setPaper('a4', 'portrait');

        $filename = 'Rekap_Jurnal_' . str_replace(' ', '_', $siswa->name) . '_' . $startDate . '.pdf';

        if ($request->boolean('download')) {
            return $pdf->download($filename);
        }

        return $pdf->stream($filename);
    }

    /**
     * Auto-resolve pembimbing if siswa has none but belongs to a DUDI with one.
     */
    private function resolvePembimbing(Siswa $siswa): void
    {
        if (!$siswa->pembimbing && $siswa->dudi_id) {
            $matchedPembimbing = Pembimbing::where('dudi_id', $siswa->dudi_id)->first();
            if ($matchedPembimbing) {
                $siswa->update(['pembimbing_id' => $matchedPembimbing->id]);
                $siswa->setRelation('pembimbing', $matchedPembimbing);
            }
        }
    }

    /**
     * Resolve the date range from request or fall back to PKL period / current month.
     */
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
