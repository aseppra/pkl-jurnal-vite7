<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Dudi;
use App\Models\Pembimbing;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DudiController extends Controller
{
    public function index(Request $request)
    {
        $query = Dudi::withCount('siswas');

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%");
            });
        }

        $dudis = $query->latest()->paginate(10)->withQueryString();

        return Inertia::render('Admin/DataDudi', [
            'dudis' => $dudis,
            'allSiswas' => Siswa::select('id', 'name', 'nisn', 'class', 'dudi_id')->orderBy('name')->get(),
            'filters' => $request->only('search'),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'contact_name' => 'nullable|string|max:100',
            'contact' => 'nullable|string|max:50',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'integer|exists:siswas,id'
        ]);

        $dudi = Dudi::create([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'contact_name' => $validated['contact_name'],
            'contact' => $validated['contact'],
        ]);

        if (!empty($validated['student_ids'])) {
            // Find a pembimbing assigned to this DUDI via pivot
            $pembimbing = $dudi->pembimbings()->first();
            Siswa::whereIn('id', $validated['student_ids'])->update([
                'dudi_id'       => $dudi->id,
                'pembimbing_id' => $pembimbing?->id,
            ]);
        }

        ActivityLog::log('Tambah DUDI', "Menambahkan DUDI {$dudi->name}.");
        return redirect()->back()->with('success', 'Data DUDI berhasil ditambahkan.');
    }

    public function update(Request $request, Dudi $dudi)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'contact_name' => 'nullable|string|max:100',
            'contact' => 'nullable|string|max:50',
            'student_ids' => 'nullable|array',
            'student_ids.*' => 'integer|exists:siswas,id'
        ]);

        $dudi->update([
            'name' => $validated['name'],
            'address' => $validated['address'],
            'contact_name' => $validated['contact_name'],
            'contact' => $validated['contact'],
        ]);

        // Reset previous students
        Siswa::where('dudi_id', $dudi->id)->update(['dudi_id' => null, 'pembimbing_id' => null]);
        
        // Assign new students
        if (!empty($validated['student_ids'])) {
            // Find a pembimbing assigned to this DUDI via pivot
            $pembimbing = $dudi->pembimbings()->first();
            Siswa::whereIn('id', $validated['student_ids'])->update([
                'dudi_id'       => $dudi->id,
                'pembimbing_id' => $pembimbing?->id,
            ]);
        }

        ActivityLog::log('Update DUDI', "Memperbarui data DUDI {$dudi->name}.");
        return redirect()->back()->with('success', 'Data DUDI berhasil diperbarui.');
    }

    public function destroy(Dudi $dudi)
    {
        $dudi->delete();
        return redirect()->back()->with('success', 'Data DUDI berhasil dihapus.');
    }

    public function bulkDestroy(Request $request)
    {
        $request->validate(['ids' => 'required|array', 'ids.*' => 'integer|exists:dudis,id']);
        Dudi::whereIn('id', $request->ids)->delete();
        return redirect()->back()->with('success', count($request->ids) . ' data DUDI berhasil dihapus.');
    }
}
