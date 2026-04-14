<?php

namespace App\Http\Controllers\Pembimbing;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RekapitulasiController extends Controller
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
     * Get siswa IDs for this pembimbing.
     * Fallback via dudi_id untuk data yang belum ter-sync.
     */
    private function getSiswaIds($pembimbing): \Illuminate\Support\Collection
    {
        // Auto-sync: assign pembimbing_id ke siswa yang share dudi tapi belum ter-set
        if ($pembimbing->dudi_id) {
            \App\Models\Siswa::where('dudi_id', $pembimbing->dudi_id)
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

    public function index(Request $request)
    {
        $pembimbing = $this->checkPembimbing();

        $siswaIds = $this->getSiswaIds($pembimbing);

        $query = Siswa::whereIn('id', $siswaIds)->with(['dudi', 'journals', 'attendances']);

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('nisn', 'like', "%{$search}%");
            });
        }
        if ($class = $request->input('class')) $query->where('class', $class);

        $paginator = $query->paginate(10)->withQueryString();

        $paginator->getCollection()->transform(function ($s) {
            $totalDays = max($s->attendances->count(), 1);
            $hadirDays = $s->attendances->whereIn('status', ['hadir', 'terlambat'])->count();
            
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

        $classes = Siswa::whereIn('id', $siswaIds)->distinct()->pluck('class');

        return Inertia::render('Pembimbing/Rekapitulasi', [
            'students' => $paginator,
            'classes' => $classes,
            'filters' => $request->only('search', 'class'),
        ]);
    }

    public function exportPresensiPdf(Siswa $siswa, Request $request)
    {
        $pembimbing = $this->checkPembimbing();
        
        $siswaIds = $this->getSiswaIds($pembimbing);
        if (!$siswaIds->contains($siswa->id)) {
            abort(403, 'Siswa ini tidak ada dalam daftar bimbingan Anda.');
        }

        $siswa->load('dudi', 'pembimbing');

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
        $pembimbing = $this->checkPembimbing();

        $siswaIds = $this->getSiswaIds($pembimbing);
        if (!$siswaIds->contains($siswa->id)) {
            abort(403, 'Siswa ini tidak ada dalam daftar bimbingan Anda.');
        }

        $siswa->load('dudi', 'pembimbing');

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
