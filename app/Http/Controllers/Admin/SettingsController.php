<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\Dudi;
use App\Models\HelpRequest;
use App\Models\Journal;
use App\Models\Kelas;
use App\Models\Notification;
use App\Models\Pembimbing;
use App\Models\Setting;
use App\Models\Siswa;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use ZipArchive;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings', [
            'counts' => [
                'siswa' => Siswa::count(),
                'dudi' => Dudi::count(),
                'pembimbing' => Pembimbing::count(),
                'journal' => Journal::count(),
                'attendance' => Attendance::count(),
                'helpRequest' => HelpRequest::count(),
            ],
            'admins' => User::where('role', 'admin')
                ->select('id', 'name', 'username', 'email', 'phone', 'is_active', 'created_at')
                ->orderBy('created_at', 'desc')
                ->get(),
            'coordinator' => [
                'name' => Setting::getValue('coordinator_name', ''),
                'nip' => Setting::getValue('coordinator_nip', ''),
                'signature' => Setting::getValue('coordinator_signature', ''),
            ],
        ]);
    }

    public function storeAdmin(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'email' => 'nullable|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $validated['username'],
            'email' => $validated['email'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => 'admin',
            'is_active' => true,
        ]);

        ActivityLog::log('Tambah Akun Admin', "Menambahkan akun admin baru: {$user->name} ({$user->username})");

        return redirect()->back()->with('success', "Berhasil menambahkan akun admin: {$user->name}");
    }

    public function updateAdmin(Request $request, User $user)
    {
        if ($user->role !== 'admin') {
            abort(403, 'User bukan admin.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6|confirmed',
            'is_active' => 'boolean',
        ]);

        $user->name = $validated['name'];
        $user->username = $validated['username'];
        $user->email = $validated['email'] ?? null;
        $user->phone = $validated['phone'] ?? null;
        if (isset($validated['is_active'])) {
            $user->is_active = $validated['is_active'];
        }
        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }
        $user->save();

        ActivityLog::log('Update Akun Admin', "Memperbarui akun admin: {$user->name} ({$user->username})");

        return redirect()->back()->with('success', "Berhasil memperbarui akun admin: {$user->name}");
    }

    public function updateCoordinator(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'nip' => 'required|string|max:255',
            'signature_file' => 'nullable|image|mimes:jpg,jpeg,png|max:1024',
        ]);

        Setting::setValue('coordinator_name', $validated['name']);
        Setting::setValue('coordinator_nip', $validated['nip']);

        if ($request->hasFile('signature_file')) {
            $file = $request->file('signature_file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $file->move(public_path('images/signatures'), $filename);
            Setting::setValue('coordinator_signature', 'images/signatures/' . $filename);
        }

        ActivityLog::log('Update Koordinator PKL', "Memperbarui data Koordinator PKL: {$validated['name']}");

        return redirect()->back()->with('success', 'Berhasil memperbarui data Koordinator PKL.');
    }

    public function resetSiswa()
    {
        $count = Siswa::count();
        User::where('role', 'siswa')->delete();
        Siswa::query()->delete();
        Journal::query()->delete();
        Attendance::query()->delete();
        Notification::query()->delete();

        ActivityLog::log('Reset Data Siswa', "Menghapus {$count} data siswa beserta jurnal, absensi, dan notifikasi terkait.");

        return redirect()->back()->with('success', "Berhasil mereset {$count} data siswa beserta data terkait.");
    }

    public function resetDudi()
    {
        $count = Dudi::count();
        Siswa::query()->update(['dudi_id' => null]);
        // Cascade delete on dudi_pembimbing is handled by FK constraint
        Dudi::query()->delete();

        ActivityLog::log('Reset Data DUDI', "Menghapus {$count} data DUDI.");

        return redirect()->back()->with('success', "Berhasil mereset {$count} data DUDI.");
    }

    public function resetPembimbing()
    {
        $count = Pembimbing::count();
        User::where('role', 'pembimbing')->delete();
        Pembimbing::query()->delete();

        ActivityLog::log('Reset Data Pembimbing', "Menghapus {$count} data pembimbing.");

        return redirect()->back()->with('success', "Berhasil mereset {$count} data pembimbing.");
    }

    public function resetPeriodePkl()
    {
        Setting::where('key', 'like', 'pkl_%')->delete();

        ActivityLog::log('Reset Periode PKL', 'Menghapus pengaturan periode PKL.');

        return redirect()->back()->with('success', 'Berhasil mereset pengaturan periode PKL.');
    }

    public function resetHelpdesk()
    {
        $count = HelpRequest::count();
        HelpRequest::query()->delete();

        ActivityLog::log('Reset Helpdesk', "Menghapus {$count} tiket helpdesk.");

        return redirect()->back()->with('success', "Berhasil mereset {$count} data helpdesk.");
    }

    public function resetAll()
    {
        $counts = [
            'siswa' => Siswa::count(),
            'dudi' => Dudi::count(),
            'pembimbing' => Pembimbing::count(),
        ];

        User::where('role', 'siswa')->delete();
        User::where('role', 'pembimbing')->delete();
        Siswa::query()->delete();
        Journal::query()->delete();
        Attendance::query()->delete();
        Notification::query()->delete();
        Dudi::query()->delete();
        Pembimbing::query()->delete();
        HelpRequest::query()->delete();
        Setting::where('key', 'like', 'pkl_%')->delete();

        ActivityLog::log('Reset Seluruh Data', "Menghapus semua data: {$counts['siswa']} siswa, {$counts['dudi']} DUDI, {$counts['pembimbing']} pembimbing, beserta seluruh data terkait.");

        return redirect()->back()->with('success', 'Berhasil mereset seluruh data sistem.');
    }

    /* ===== BACKUP ===== */
    public function backup()
    {
        $timestamp = now()->format('Ymd_His');
        $filename  = "backup_jurnal_pkl_{$timestamp}.zip";
        $tmpPath   = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $filename;

        // Tables to export (order respects FK constraints)
        $tables = [
            'kelas'          => DB::table('kelas')->get(),
            'dudis'          => DB::table('dudis')->get(),
            'users'          => DB::table('users')->get(),
            'siswas'         => DB::table('siswas')->get(),
            'pembimbings'    => DB::table('pembimbings')->get(),
            'journals'       => DB::table('journals')->get(),
            'attendances'    => DB::table('attendances')->get(),
            'notifications'  => DB::table('notifications')->get(),
            'help_requests'  => DB::table('help_requests')->get(),
            'settings'       => DB::table('settings')->get(),
            'activity_logs'  => DB::table('activity_logs')->get(),
        ];

        $zip = new ZipArchive();
        if ($zip->open($tmpPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return back()->with('error', 'Gagal membuat file backup.');
        }

        foreach ($tables as $table => $rows) {
            $zip->addFromString("{$table}.json", json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        }

        // Add a manifest with metadata
        $manifest = [
            'created_at'  => now()->toDateTimeString(),
            'app'         => 'Jurnal PKL',
            'tables'      => array_keys($tables),
            'row_counts'  => array_map(fn($rows) => count($rows), $tables),
        ];
        $zip->addFromString('manifest.json', json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $zip->close();

        ActivityLog::log('Backup Data', "Membuat backup data sistem: {$filename}");

        return response()->download($tmpPath, $filename, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

    /* ===== RESTORE ===== */
    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file|mimes:zip|max:51200', // max 50MB
        ]);

        $zip = new ZipArchive();
        $uploadedPath = $request->file('backup_file')->getPathname();

        if ($zip->open($uploadedPath) !== true) {
            return back()->with('error', 'File backup tidak valid atau rusak.');
        }

        // Validate manifest
        $manifestJson = $zip->getFromName('manifest.json');
        if (!$manifestJson) {
            $zip->close();
            return back()->with('error', 'File backup tidak valid: manifest tidak ditemukan.');
        }
        $manifest = json_decode($manifestJson, true);
        if (!isset($manifest['tables'])) {
            $zip->close();
            return back()->with('error', 'Format file backup tidak dikenali.');
        }

        // Read all table data from ZIP first
        $tableData = [];
        foreach ($manifest['tables'] as $table) {
            $json = $zip->getFromName("{$table}.json");
            if ($json === false) {
                $zip->close();
                return back()->with('error', "File backup tidak lengkap: tabel '{$table}' tidak ditemukan.");
            }
            $tableData[$table] = json_decode($json, true);
        }
        $zip->close();

        try {
            DB::transaction(function () use ($tableData) {
                DB::statement('SET FOREIGN_KEY_CHECKS=0;');

                // Clear tables in reverse FK order
                $clearOrder = [
                    'activity_logs', 'settings', 'help_requests', 'notifications',
                    'attendances', 'journals', 'pembimbings', 'siswas', 'users', 'dudis', 'kelas',
                ];
                foreach ($clearOrder as $table) {
                    DB::table($table)->delete();
                }

                // Insert data in FK-safe order
                $insertOrder = [
                    'kelas', 'dudis', 'users', 'siswas', 'pembimbings',
                    'journals', 'attendances', 'notifications', 'help_requests',
                    'settings', 'activity_logs',
                ];
                foreach ($insertOrder as $table) {
                    if (!empty($tableData[$table])) {
                        // Cast each row (stdClass or array) to array
                        $rows = array_map(fn($row) => (array) $row, $tableData[$table]);
                        // Insert in chunks to avoid query size limits
                        foreach (array_chunk($rows, 200) as $chunk) {
                            DB::table($table)->insert($chunk);
                        }
                    }
                }

                DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            });

            ActivityLog::log('Restore Data', 'Memulihkan data sistem dari file backup.');

            return redirect()->route('admin.settings')->with('success', 'Data berhasil dipulihkan dari file backup!');
        } catch (\Throwable $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            return back()->with('error', 'Restore gagal: ' . $e->getMessage());
        }
    }
}

