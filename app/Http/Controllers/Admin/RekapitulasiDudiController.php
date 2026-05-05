<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dudi;
use App\Models\Kelas;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RekapitulasiDudiController extends Controller
{
    public function index(Request $request)
    {
        // Only get DUDI that has Siswa
        $query = Dudi::whereHas('siswas')->with(['siswas', 'pembimbings']);

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($company = $request->input('company')) {
            $query->where('name', $company);
        }

        if ($major = $request->input('major')) {
            $query->whereHas('siswas', fn($q) => $q->where('class', 'like', "%{$major}%"));
        }
        
        $paginator = $query->paginate(10)->withQueryString();

        $companies = Dudi::whereHas('siswas')->pluck('name');
        $kelasList = Kelas::orderBy('name')->get(['name', 'description']);

        return Inertia::render('Admin/RekapitulasiDudi', [
            'dudis' => $paginator,
            'companies' => $companies,
            'kelasList' => $kelasList,
            'filters' => $request->only('search', 'company', 'major'),
        ]);
    }

    public function exportPdf(Request $request)
    {
        $query = Dudi::whereHas('siswas')->with(['siswas' => function($q){
             $q->orderBy('name');
        }, 'pembimbings']);

        if ($search = $request->input('search')) {
             $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        if ($company = $request->input('company')) {
            $query->where('name', $company);
        }

        $major = $request->input('major', '');
        if ($major) {
            $query->whereHas('siswas', fn($q) => $q->where('class', 'like', "%{$major}%"));
        }

        // Resolve major label from kelas description if available
        $majorLabel = $major;
        if ($major) {
            $kelas = Kelas::where('name', 'like', "%{$major}%")
                          ->orWhere('description', 'like', "%{$major}%")
                          ->first();
            if ($kelas) {
                $majorLabel = $kelas->description ?: $kelas->name;
            }
        }

        $dudis = $query->get();

        $startDate = \App\Models\Setting::getValue('pkl_start') ?? now()->startOfMonth()->toDateString();
        $endDate = \App\Models\Setting::getValue('pkl_end') ?? now()->endOfMonth()->toDateString();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.rekap-dudi', [
            'dudis' => $dudis,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'major' => $majorLabel,
            'coordinator_name' => \App\Models\Setting::getValue('coordinator_name', ''),
            'coordinator_nip' => \App\Models\Setting::getValue('coordinator_nip', ''),
            'coordinator_signature' => $this->getBase64Image(\App\Models\Setting::getValue('coordinator_signature')),
        ]);
        $pdf->setPaper('a4', 'portrait');

        $filename = 'Rekap_Penempatan_DUDI.pdf';

        if ($request->boolean('download')) {
            return $pdf->download($filename);
        }

        return $pdf->stream($filename);
    }

    private function getBase64Image($path)
    {
        if (!$path) return null;
        $fullPath = public_path($path);
        if (!file_exists($fullPath)) return null;
        
        $type = pathinfo($fullPath, PATHINFO_EXTENSION);
        $data = file_get_contents($fullPath);
        return 'data:image/' . $type . ';base64,' . base64_encode($data);
    }
}
