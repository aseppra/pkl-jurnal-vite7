<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\SiswaController;
use App\Http\Controllers\Admin\KelasController;
use App\Http\Controllers\Admin\DudiController;
use App\Http\Controllers\Admin\PembimbingController;
use App\Http\Controllers\Admin\MonitoringController;
use App\Http\Controllers\Admin\RekapitulasiController;
use App\Http\Controllers\Admin\RekapitulasiDudiController;
use App\Http\Controllers\Admin\HelpdeskController;
use App\Http\Controllers\Admin\ImportDataController;
use App\Http\Controllers\Admin\PeriodePklController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\JournalController;
use App\Http\Controllers\Student\ProfileController as StudentProfileController;
use App\Http\Controllers\Student\NotificationController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest route - redirect to login
Route::get('/', function () {
    if (auth()->check()) {
        return match(auth()->user()->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'pembimbing' => redirect()->route('pembimbing.dashboard'),
            'siswa' => redirect()->route('student.dashboard'),
            default => redirect()->route('login'),
        };
    }
    return redirect()->route('login');
});

// ===== ADMIN ROUTES =====
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

    Route::get('/import-data', [ImportDataController::class, 'index'])->name('admin.import-data');
    Route::post('/import-data', [ImportDataController::class, 'store'])->name('admin.import-data.store');
    Route::get('/import-data/template', [ImportDataController::class, 'template'])->name('admin.import-data.template');

    // Data Master
    Route::get('/data-siswa', [SiswaController::class, 'index'])->name('admin.siswa.index');
    Route::post('/data-siswa', [SiswaController::class, 'store'])->name('admin.siswa.store');
    Route::put('/data-siswa/{siswa}', [SiswaController::class, 'update'])->name('admin.siswa.update');
    Route::delete('/data-siswa/{siswa}', [SiswaController::class, 'destroy'])->name('admin.siswa.destroy');
    Route::post('/data-siswa/generate-accounts', [SiswaController::class, 'generateAccounts'])->name('admin.siswa.generate');
    Route::post('/data-siswa/clear-accounts', [SiswaController::class, 'clearAccounts'])->name('admin.siswa.clear');
    Route::post('/data-siswa/bulk-destroy', [SiswaController::class, 'bulkDestroy'])->name('admin.siswa.bulk-destroy');

    Route::get('/kelas-jurusan', [KelasController::class, 'index'])->name('admin.kelas-jurusan');
    Route::post('/data-kelas', [KelasController::class, 'store'])->name('admin.kelas.store');
    Route::put('/data-kelas/{kela}', [KelasController::class, 'update'])->name('admin.kelas.update');
    Route::delete('/data-kelas/{kela}', [KelasController::class, 'destroy'])->name('admin.kelas.destroy');

    Route::get('/data-dudi', [DudiController::class, 'index'])->name('admin.dudi.index');
    Route::post('/data-dudi', [DudiController::class, 'store'])->name('admin.dudi.store');
    Route::put('/data-dudi/{dudi}', [DudiController::class, 'update'])->name('admin.dudi.update');
    Route::delete('/data-dudi/{dudi}', [DudiController::class, 'destroy'])->name('admin.dudi.destroy');
    Route::get('/whatsapp', [\App\Http\Controllers\Admin\WhatsappController::class, 'index'])->name('admin.whatsapp');
    Route::post('/whatsapp', [\App\Http\Controllers\Admin\WhatsappController::class, 'update'])->name('admin.whatsapp.update');
    Route::post('/data-dudi/bulk-destroy', [DudiController::class, 'bulkDestroy'])->name('admin.dudi.bulk-destroy');

    Route::get('/data-pembimbing', [PembimbingController::class, 'index'])->name('admin.pembimbing.index');
    Route::post('/data-pembimbing', [PembimbingController::class, 'store'])->name('admin.pembimbing.store');
    Route::put('/data-pembimbing/{pembimbing}', [PembimbingController::class, 'update'])->name('admin.pembimbing.update');
    Route::delete('/data-pembimbing/{pembimbing}', [PembimbingController::class, 'destroy'])->name('admin.pembimbing.destroy');
    Route::post('/data-pembimbing/bulk-destroy', [PembimbingController::class, 'bulkDestroy'])->name('admin.pembimbing.bulk-destroy');
    Route::post('/data-pembimbing/generate-accounts', [PembimbingController::class, 'generateAccounts'])->name('admin.pembimbing.generate');
    Route::post('/data-pembimbing/clear-accounts', [PembimbingController::class, 'clearAccounts'])->name('admin.pembimbing.clear');

    Route::get('/periode-pkl', [PeriodePklController::class, 'index'])->name('admin.periode-pkl');
    Route::put('/periode-pkl', [PeriodePklController::class, 'update'])->name('admin.periode-pkl.update');

    // Monitoring
    Route::get('/monitoring', [MonitoringController::class, 'index'])->name('admin.monitoring');
    Route::post('/monitoring/send-reminder', [MonitoringController::class, 'sendReminder'])->name('admin.monitoring.remind');

    // Rekapitulasi
    Route::get('/rekapitulasi', [RekapitulasiController::class, 'index'])->name('admin.rekapitulasi');
    Route::get('/rekapitulasi/{siswa}', [RekapitulasiController::class, 'show'])->name('admin.rekapitulasi.show');
    Route::get('/rekapitulasi/{siswa}/export-presensi', [RekapitulasiController::class, 'exportPresensiPdf'])->name('admin.rekapitulasi.export-presensi');
    Route::get('/rekapitulasi/{siswa}/export-jurnal', [RekapitulasiController::class, 'exportJurnalPdf'])->name('admin.rekapitulasi.export-jurnal');

    Route::get('/rekapitulasi-dudi', [RekapitulasiDudiController::class, 'index'])->name('admin.rekapitulasi-dudi');
    Route::get('/rekapitulasi-dudi/export-pdf', [RekapitulasiDudiController::class, 'exportPdf'])->name('admin.rekapitulasi-dudi.export');

    // Helpdesk
    Route::get('/helpdesk', [HelpdeskController::class, 'index'])->name('admin.helpdesk');
    Route::get('/helpdesk/notifications', [HelpdeskController::class, 'notifications'])->name('admin.helpdesk.notifications');
    Route::patch('/helpdesk/{helpRequest}', [HelpdeskController::class, 'process'])->name('admin.helpdesk.process');

    // Settings (Reset Data)
    Route::get('/settings', [\App\Http\Controllers\Admin\SettingsController::class, 'index'])->name('admin.settings');
    Route::post('/settings/reset-siswa', [\App\Http\Controllers\Admin\SettingsController::class, 'resetSiswa'])->name('admin.settings.reset-siswa');
    Route::post('/settings/reset-dudi', [\App\Http\Controllers\Admin\SettingsController::class, 'resetDudi'])->name('admin.settings.reset-dudi');
    Route::post('/settings/reset-pembimbing', [\App\Http\Controllers\Admin\SettingsController::class, 'resetPembimbing'])->name('admin.settings.reset-pembimbing');
    Route::post('/settings/reset-periode', [\App\Http\Controllers\Admin\SettingsController::class, 'resetPeriodePkl'])->name('admin.settings.reset-periode');
    Route::post('/settings/reset-helpdesk', [\App\Http\Controllers\Admin\SettingsController::class, 'resetHelpdesk'])->name('admin.settings.reset-helpdesk');
    Route::post('/settings/reset-all', [\App\Http\Controllers\Admin\SettingsController::class, 'resetAll'])->name('admin.settings.reset-all');
    Route::post('/settings/admin', [\App\Http\Controllers\Admin\SettingsController::class, 'storeAdmin'])->name('admin.settings.store-admin');
    Route::put('/settings/admin/{user}', [\App\Http\Controllers\Admin\SettingsController::class, 'updateAdmin'])->name('admin.settings.update-admin');

    // Log Aktivitas
    Route::get('/log-aktivitas', [\App\Http\Controllers\Admin\LogAktivitasController::class, 'index'])->name('admin.log-aktivitas');
});

// ===== PEMBIMBING ROUTES =====
Route::middleware(['auth', 'role:pembimbing'])->prefix('pembimbing')->group(function () {
    Route::get('/', [\App\Http\Controllers\Pembimbing\DashboardController::class, 'index'])->name('pembimbing.dashboard');
    Route::get('/data-siswa', [\App\Http\Controllers\Pembimbing\MonitoringController::class, 'siswa'])->name('pembimbing.siswa');
    Route::get('/presensi', [\App\Http\Controllers\Pembimbing\MonitoringController::class, 'presensi'])->name('pembimbing.presensi');
    Route::get('/jurnal', [\App\Http\Controllers\Pembimbing\MonitoringController::class, 'jurnal'])->name('pembimbing.jurnal');
    Route::post('/notifikasi/send', [\App\Http\Controllers\Pembimbing\MonitoringController::class, 'sendNotification'])->name('pembimbing.notifikasi.send');
    Route::get('/rekapitulasi', [\App\Http\Controllers\Pembimbing\RekapitulasiController::class, 'index'])->name('pembimbing.rekapitulasi');
    Route::get('/rekapitulasi/{siswa}/export-presensi', [\App\Http\Controllers\Pembimbing\RekapitulasiController::class, 'exportPresensiPdf'])->name('pembimbing.rekapitulasi.export-presensi');
    Route::get('/rekapitulasi/{siswa}/export-jurnal', [\App\Http\Controllers\Pembimbing\RekapitulasiController::class, 'exportJurnalPdf'])->name('pembimbing.rekapitulasi.export-jurnal');
});


// ===== STUDENT ROUTES =====
Route::middleware(['auth', 'role:siswa'])->group(function () {
    Route::get('/dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');
    Route::post('/attendance/check-in', [StudentDashboardController::class, 'checkIn'])->name('student.checkin');
    Route::post('/attendance/check-out', [StudentDashboardController::class, 'checkOut'])->name('student.checkout');
    Route::post('/attendance/izin', [StudentDashboardController::class, 'izin'])->name('student.izin');

    Route::get('/jurnal-saya', [JournalController::class, 'index'])->name('student.journal');
    Route::post('/jurnal-saya', [JournalController::class, 'store'])->name('student.journal.store');

    Route::get('/profile', [StudentProfileController::class, 'index'])->name('student.profile');

    Route::get('/rekapitulasi', [\App\Http\Controllers\Student\RekapitulasiController::class, 'index'])->name('student.rekapitulasi');
    Route::get('/rekapitulasi/export-presensi', [\App\Http\Controllers\Student\RekapitulasiController::class, 'exportPresensiPdf'])->name('student.rekapitulasi.export-presensi');
    Route::get('/rekapitulasi/export-jurnal', [\App\Http\Controllers\Student\RekapitulasiController::class, 'exportJurnalPdf'])->name('student.rekapitulasi.export-jurnal');

    Route::get('/notifications', [NotificationController::class, 'index'])->name('student.notifications');
    Route::patch('/notifications/{notification}', [NotificationController::class, 'markAsRead'])->name('student.notifications.read');
});

Route::post('/helpdesk/request', [\App\Http\Controllers\HelpdeskController::class, 'store'])->name('helpdesk.request');

require __DIR__.'/auth.php';
