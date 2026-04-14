<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Siswa;
use App\Models\Notification;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class MonitoringController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $query = Siswa::with(['dudi', 'attendances' => fn($q) => $q->where('date', $today)]);

        if ($search = $request->input('search')) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")->orWhere('nisn', 'like', "%{$search}%");
            });
        }

        if ($status = $request->input('status')) {
            if ($status === 'belum_masuk') {
                $query->whereDoesntHave('attendances', fn($q) => $q->where('date', $today));
            } elseif ($status === 'hadir') {
                $query->whereHas('attendances', fn($q) => $q->where('date', $today)->whereIn('status', ['hadir', 'terlambat']));
            } else {
                $query->whereHas('attendances', fn($q) => $q->where('date', $today)->where('status', $status));
            }
        }

        if ($class = $request->input('class')) {
            $query->where('class', $class);
        }

        $paginator = $query->paginate(10)->withQueryString();

        $paginator->through(function($s) {
            $status = $s->attendances->first()?->status ?? 'belum_masuk';
            if ($status === 'terlambat') {
                $status = 'hadir';
            }

            return [
                'id' => $s->id,
                'name' => $s->name,
                'nisn' => $s->nisn,
                'class' => $s->class,
                'company' => $s->dudi?->name ?? '-',
                'lastCheckin' => $s->attendances->first()?->check_in ?? '--:--',
                'status' => ucfirst($status),
                'reason' => $s->attendances->first()?->reason,
                'proofFile' => $s->attendances->first()?->proof_file,
                'checkInLat' => $s->attendances->first()?->check_in_lat,
                'checkInLng' => $s->attendances->first()?->check_in_lng,
                'photoCheckIn' => $s->attendances->first()?->photo_check_in,
                'photoCheckOut' => $s->attendances->first()?->photo_check_out,
                'statusColor' => match($status) {
                    'hadir' => 'emerald',
                    'izin' => 'red',
                    default => 'slate',
                },
            ];
        });

        $classes = Siswa::distinct()->pluck('class');

        // All students for the reminder modal recipient picker
        $allStudents = Siswa::select('id', 'name', 'nisn', 'class')->orderBy('name')->get();

        return Inertia::render('Admin/Monitoring', [
            'students' => $paginator,
            'allStudents' => $allStudents,
            'classes' => $classes,
            'filters' => $request->only('search', 'status', 'class'),
        ]);
    }

    public function sendReminder(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'recipients' => 'nullable|array',
            'recipients.*' => 'exists:siswas,nisn',
        ]);

        if (empty($validated['recipients'])) {
            $siswas = Siswa::whereNotNull('user_id')->get();
        } else {
            $siswas = Siswa::whereIn('nisn', $validated['recipients'])->whereNotNull('user_id')->get();
        }

        foreach ($siswas as $siswa) {
            Notification::create([
                'user_id' => $siswa->user_id,
                'title' => 'Pesan dari Admin',
                'message' => $validated['message'],
                'type' => 'info',
            ]);
        }

        return redirect()->back()->with('success', 'Pengingat berhasil dikirim ke ' . $siswas->count() . ' siswa.');
    }
}
