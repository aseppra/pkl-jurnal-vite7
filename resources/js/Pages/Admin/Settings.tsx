import AdminLayout from '@/Layouts/AdminLayout';
import Portal from '@/Components/Portal';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { useState, useRef } from 'react';

interface AdminUser {
    id: number;
    name: string;
    username: string;
    email: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string;
}

interface Props {
    counts: {
        siswa: number;
        dudi: number;
        pembimbing: number;
        journal: number;
        attendance: number;
        helpRequest: number;
    };
    admins: AdminUser[];
    coordinator: {
        name: string;
        nip: string;
        signature: string | null;
    };
}

/* ===== Tab: Backup & Restore ===== */
function BackupRestoreTab() {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [restoreFile, setRestoreFile] = useState<File | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleRestore = () => {
        if (!restoreFile) return;
        setProcessing(true);
        const fd = new FormData();
        fd.append('backup_file', restoreFile);
        router.post(route('admin.settings.restore'), fd, {
            forceFormData: true,
            onFinish: () => { setProcessing(false); setShowConfirm(false); setRestoreFile(null); },
        });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f && f.name.endsWith('.zip')) setRestoreFile(f);
    };

    return (
        <>
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-500 mt-0.5">info</span>
                    <div>
                        <h3 className="font-bold text-blue-800 text-sm">Backup & Restore Data</h3>
                        <p className="text-blue-700 text-xs mt-1">Silahkan lakukan backup data sebelum melakukan reset data. jika terjadi kesalahan pada data, silahkan kembalikan data dari file backup.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Backup Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600" />
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                                <span className="material-symbols-outlined">cloud_download</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Backup Data</h4>
                                <p className="text-xs text-slate-500">Unduh file backup (.zip)</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">Mengunduh seluruh data siswa, DUDI, pembimbing, jurnal, presensi, dan pengaturan ke dalam file ZIP.</p>
                        <a
                            href={route('admin.settings.backup')}
                            className="w-full py-2 rounded-xl border border-emerald-200 text-emerald-600 text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                            <span className="material-symbols-outlined text-sm">download</span>
                            Download Backup
                        </a>
                    </div>
                </div>

                {/* Restore Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-1.5 bg-gradient-to-r from-amber-500 to-amber-600" />
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-10 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
                                <span className="material-symbols-outlined">cloud_upload</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-sm">Restore Data</h4>
                                <p className="text-xs text-slate-500">Upload file backup (.zip)</p>
                            </div>
                        </div>

                        {/* Dropzone */}
                        <div
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-4 ${dragOver ? 'border-amber-400 bg-amber-50' :
                                restoreFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            <input ref={fileRef} type="file" accept=".zip" className="hidden" onChange={e => setRestoreFile(e.target.files?.[0] || null)} />
                            <span className={`material-symbols-outlined text-3xl mb-1 block ${restoreFile ? 'text-emerald-500' : 'text-slate-300'}`}>
                                {restoreFile ? 'task_alt' : 'upload_file'}
                            </span>
                            {restoreFile
                                ? <p className="text-xs font-bold text-emerald-700">{restoreFile.name}</p>
                                : <><p className="text-xs font-semibold text-slate-600">Klik atau drag & drop file .zip</p><p className="text-[10px] text-slate-400 mt-1">Maks. 50 MB</p></>}
                        </div>

                        <button
                            onClick={() => setShowConfirm(true)}
                            disabled={!restoreFile}
                            className="w-full py-2 rounded-xl border border-amber-200 text-amber-600 text-xs font-bold hover:bg-amber-50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-sm">restore</span>
                            Restore Data
                        </button>
                    </div>
                </div>
            </div>


            {/* Confirm Modal */}
            {showConfirm && (
                <Portal>
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
                            <div className="p-6 text-center">
                                <div className="size-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-amber-600 text-3xl">warning</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">Konfirmasi Restore</h3>
                                <p className="text-sm text-slate-600 mb-1">Seluruh data saat ini akan <strong>dihapus</strong> dan diganti dengan data dari file backup.</p>
                                <p className="text-xs text-red-500 font-semibold">Tindakan ini tidak dapat dibatalkan!</p>
                                <p className="text-xs text-slate-400 mt-2 truncate">{restoreFile?.name}</p>
                            </div>
                            <div className="flex border-t border-slate-100 divide-x divide-slate-100">
                                <button onClick={() => setShowConfirm(false)} disabled={processing} className="flex-1 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
                                <button onClick={handleRestore} disabled={processing} className="flex-1 py-3.5 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-60">
                                    {processing ? 'Memulihkan...' : 'Ya, Pulihkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
}

/* ===== Tab: Reset Data ===== */
function ResetDataTab({ counts }: { counts: Props['counts'] }) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [confirmModal, setConfirmModal] = useState<{ action: string; label: string; route: string } | null>(null);
    const [processing, setProcessing] = useState(false);

    const resetItems = [
        { key: 'siswa', label: 'Data Siswa', icon: 'manage_accounts', color: 'blue', count: counts.siswa, route: 'admin.settings.reset-siswa', desc: 'Menghapus semua data siswa, akun login, jurnal, absensi, dan notifikasi.' },
        { key: 'dudi', label: 'Data DUDI', icon: 'business', color: 'purple', count: counts.dudi, route: 'admin.settings.reset-dudi', desc: 'Menghapus semua data DUDI dan melepas relasi siswa/pembimbing.' },
        { key: 'pembimbing', label: 'Data Pembimbing', icon: 'supervisor_account', color: 'amber', count: counts.pembimbing, route: 'admin.settings.reset-pembimbing', desc: 'Menghapus semua data pembimbing dan akun login-nya.' },
        { key: 'periode', label: 'Periode PKL', icon: 'date_range', color: 'teal', count: null, route: 'admin.settings.reset-periode', desc: 'Menghapus semua pengaturan tanggal periode PKL.' },
        { key: 'helpdesk', label: 'Helpdesk', icon: 'lock_reset', color: 'rose', count: counts.helpRequest, route: 'admin.settings.reset-helpdesk', desc: 'Menghapus semua tiket permintaan helpdesk.' },
    ];

    const colorMap: Record<string, string> = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        amber: 'from-amber-500 to-amber-600',
        teal: 'from-teal-500 to-teal-600',
        rose: 'from-rose-500 to-rose-600',
    };

    const colorBgMap: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
        teal: 'bg-teal-50 text-teal-600',
        rose: 'bg-rose-50 text-rose-600',
    };

    const handleReset = () => {
        if (!confirmModal) return;
        setProcessing(true);
        router.post(route(confirmModal.route), {}, {
            onFinish: () => { setProcessing(false); setConfirmModal(null); },
        });
    };

    return (
        <>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-red-500 mt-0.5">warning</span>
                    <div>
                        <h3 className="font-bold text-red-800 text-sm">Zona Berbahaya</h3>
                        <p className="text-red-700 text-xs mt-1">Tindakan di halaman ini bersifat permanen dan tidak dapat dibatalkan. Pastikan Anda sudah mem-backup data sebelum melakukan reset.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                {resetItems.map((item) => (
                    <div key={item.key} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className={`h-1.5 bg-gradient-to-r ${colorMap[item.color]}`} />
                        <div className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`size-10 rounded-xl flex items-center justify-center ${colorBgMap[item.color]}`}>
                                    <span className="material-symbols-outlined">{item.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-sm">{item.label}</h4>
                                    {item.count !== null && <p className="text-xs text-slate-500">{item.count} data</p>}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">{item.desc}</p>
                            <button
                                onClick={() => setConfirmModal({ action: item.key, label: item.label, route: item.route })}
                                disabled={item.count === 0}
                                className="w-full py-2 rounded-xl border border-red-200 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                            >
                                <span className="material-symbols-outlined text-sm">delete_sweep</span>
                                Reset {item.label}
                            </button>
                        </div>
                    </div>
                ))}

                {/* Reset All Card */}
                <div className="bg-white rounded-2xl shadow-sm border-2 border-red-300 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-700" />
                    <div className="p-5">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="size-10 rounded-xl flex items-center justify-center bg-red-100 text-red-600">
                                <span className="material-symbols-outlined">restart_alt</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-red-800 text-sm">Reset Semua Data</h4>
                                <p className="text-xs text-red-500">Menghapus seluruh data</p>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mb-4 leading-relaxed">Menghapus SELURUH data siswa, DUDI, pembimbing, jurnal, absensi, notifikasi, periode PKL, dan helpdesk sekaligus.</p>
                        <button
                            onClick={() => setConfirmModal({ action: 'all', label: 'Semua Data', route: 'admin.settings.reset-all' })}
                            className="w-full py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                            <span className="material-symbols-outlined text-sm">warning</span>
                            Reset Semua Data
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {confirmModal && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !processing && setConfirmModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="size-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-red-600 text-3xl">delete_forever</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Reset {confirmModal.label}?</h3>
                            <p className="text-sm text-slate-600">Tindakan ini akan menghapus seluruh data secara permanen dan <strong>tidak dapat dibatalkan</strong>.</p>
                        </div>
                        <div className="flex border-t border-slate-100 divide-x divide-slate-100">
                            <button
                                onClick={() => setConfirmModal(null)}
                                disabled={processing}
                                className="flex-1 py-3.5 text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={processing}
                                className="flex-1 py-3.5 text-sm font-bold text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                                {processing ? 'Menghapus...' : 'Ya, Reset'}
                            </button>
                        </div>
                    </div>
                </div></Portal>
            )}
        </>
    );
}

/* ===== Tab: Kelola Admin ===== */
function KelolaAdminTab({ admins, coordinator }: { admins: AdminUser[], coordinator: Props['coordinator'] }) {
    const { props } = usePage();
    const currentUser = (props as any).auth?.user;
    const [showModal, setShowModal] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        is_active: true,
    });

    const coordForm = useForm<{
        name: string;
        nip: string;
        signature_file: File | null;
    }>({
        name: coordinator.name || '',
        nip: coordinator.nip || '',
        signature_file: null,
    });

    const openAddModal = () => {
        setEditingAdmin(null);
        form.reset();
        form.clearErrors();
        setShowPassword(false);
        setShowModal(true);
    };

    const openEditModal = (admin: AdminUser) => {
        setEditingAdmin(admin);
        form.setData({
            name: admin.name,
            username: admin.username,
            email: admin.email || '',
            phone: admin.phone || '',
            password: '',
            password_confirmation: '',
            is_active: admin.is_active,
        });
        form.clearErrors();
        setShowPassword(false);
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingAdmin) {
            form.put(route('admin.settings.update-admin', editingAdmin.id), {
                onSuccess: () => { setShowModal(false); form.reset(); },
                preserveScroll: true,
            });
        } else {
            form.post(route('admin.settings.store-admin'), {
                onSuccess: () => { setShowModal(false); form.reset(); },
                preserveScroll: true,
            });
        }
    };

    const handleCoordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        coordForm.post(route('admin.settings.update-coordinator'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                coordForm.setData('signature_file', null);
            }
        });
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Admin List */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">shield_person</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Daftar Admin</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Kelola Akun Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={openAddModal}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-500 text-white text-[11px] font-bold rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[16px]">person_add</span>
                            Tambah
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Nama / Username</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {admins.map((admin) => {
                                    const isSelf = currentUser?.id === admin.id;
                                    return (
                                        <tr key={admin.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`size-8 rounded-lg flex items-center justify-center text-white font-bold text-[10px] ${admin.is_active ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                                                        {admin.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-xs font-bold text-slate-800">{admin.name}</span>
                                                            {isSelf && <span className="text-[8px] bg-indigo-100 text-indigo-600 px-1 py-0.5 rounded font-bold uppercase">Anda</span>}
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-mono">@{admin.username}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${admin.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <span className={`size-1 rounded-full ${admin.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                                                    {admin.is_active ? 'Aktif' : 'Off'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button onClick={() => openEditModal(admin)} className="size-7 rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors inline-flex items-center justify-center border border-transparent hover:border-indigo-100">
                                                    <span className="material-symbols-outlined text-[18px]">edit_note</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right Side: Coordinator Form */}
                <div className="lg:col-span-5">
                    <div className="sticky top-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <span className="material-symbols-outlined">assignment_ind</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-sm">Kepala Sekolah</h3>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Data Penandatangan Laporan</p>
                            </div>
                        </div>

                        <form onSubmit={handleCoordSubmit} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 mb-2">
                                <p className="text-[11px] text-emerald-700 leading-relaxed font-medium">
                                    Nama dan NIP ini akan muncul secara otomatis di bagian <strong>tanda tangan </strong> pada semua laporan PDF.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                                <input
                                    type="text"
                                    value={coordForm.data.name}
                                    onChange={e => coordForm.setData('name', e.target.value)}
                                    placeholder="Contoh: Dian Puspita, S.T"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                />
                                {coordForm.errors.name && <p className="text-[10px] text-red-500 mt-1 font-bold">{coordForm.errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">NIP</label>
                                <input
                                    type="text"
                                    value={coordForm.data.nip}
                                    onChange={e => coordForm.setData('nip', e.target.value)}
                                    placeholder="Masukkan NIP"
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                                />
                                {coordForm.errors.nip && <p className="text-[10px] text-red-500 mt-1 font-bold">{coordForm.errors.nip}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">Tanda Tangan (Gambar)</label>
                                <div className="space-y-3">
                                    {coordinator.signature && (
                                        <div className="relative w-full h-24 bg-white border border-slate-100 rounded-xl overflow-hidden group">
                                            <img src={`/${coordinator.signature}`} alt="Signature" className="w-full h-full object-contain" />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="bg-white/90 px-2 py-1 rounded text-[9px] font-bold text-slate-600 shadow-sm">Tanda Tangan Saat Ini</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <label className="flex-1 cursor-pointer group">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/png,image/jpeg"
                                                onChange={e => coordForm.setData('signature_file', e.target.files?.[0] || null)}
                                            />
                                            <div className={`h-10 px-4 rounded-xl border border-dashed flex items-center gap-2 transition-colors ${coordForm.data.signature_file ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}>
                                                <span className="material-symbols-outlined text-[18px]">{coordForm.data.signature_file ? 'task_alt' : 'upload_file'}</span>
                                                <span className="text-[11px] font-bold truncate max-w-[120px]">
                                                    {coordForm.data.signature_file ? coordForm.data.signature_file.name : 'Upload Foto TTD'}
                                                </span>
                                            </div>
                                        </label>
                                        {coordForm.data.signature_file && (
                                            <button
                                                type="button"
                                                onClick={() => coordForm.setData('signature_file', null)}
                                                className="size-10 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-medium italic">Format: PNG/JPG. Maks: 1MB. Gunakan Latar Belakang  transparan.</p>
                                </div>
                                {coordForm.errors.signature_file && <p className="text-[10px] text-red-500 mt-1 font-bold">{coordForm.errors.signature_file}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={coordForm.processing}
                                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md shadow-emerald-100 hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {coordForm.processing ? (
                                    <>
                                        <div className="size-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">save</span>
                                        Update Data Kepala Sekolah
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal (Existing) */}
            {showModal && (
                <Portal>
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !form.processing && setShowModal(false)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                            {/* Modal Header */}
                            <div className="px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className={`size-10 rounded-xl flex items-center justify-center text-white ${editingAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-indigo-500 to-violet-600'}`}>
                                        <span className="material-symbols-outlined">{editingAdmin ? 'edit' : 'person_add'}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{editingAdmin ? 'Edit Akun Admin' : 'Tambah Admin Baru'}</h3>
                                        <p className="text-xs text-slate-500">{editingAdmin ? `Memperbarui: ${editingAdmin.name}` : 'Buat akun administrator baru'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                                <div className="px-6 py-5 space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={e => form.setData('name', e.target.value)}
                                            placeholder="Masukkan nama lengkap"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${form.errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                                        />
                                        {form.errors.name && <p className="text-xs text-red-500 mt-1">{form.errors.name}</p>}
                                    </div>

                                    {/* Username */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Username <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">@</span>
                                            <input
                                                type="text"
                                                value={form.data.username}
                                                onChange={e => form.setData('username', e.target.value)}
                                                placeholder="username"
                                                className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${form.errors.username ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                                            />
                                        </div>
                                        {form.errors.username && <p className="text-xs text-red-500 mt-1">{form.errors.username}</p>}
                                    </div>

                                    {/* Email & Phone grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                                            <input
                                                type="email"
                                                value={form.data.email}
                                                onChange={e => form.setData('email', e.target.value)}
                                                placeholder="email@contoh.com"
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${form.errors.email ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                                            />
                                            {form.errors.email && <p className="text-xs text-red-500 mt-1">{form.errors.email}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">No. Telepon</label>
                                            <input
                                                type="text"
                                                value={form.data.phone}
                                                onChange={e => form.setData('phone', e.target.value)}
                                                placeholder="08xxxxxxxxxx"
                                                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${form.errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                                            />
                                            {form.errors.phone && <p className="text-xs text-red-500 mt-1">{form.errors.phone}</p>}
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Password {!editingAdmin && <span className="text-red-500">*</span>}
                                            {editingAdmin && <span className="text-slate-400 text-xs font-normal ml-1">(kosongkan jika tidak diubah)</span>}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={form.data.password}
                                                onChange={e => form.setData('password', e.target.value)}
                                                placeholder={editingAdmin ? 'Kosongkan jika tidak diubah' : 'Minimal 6 karakter'}
                                                className={`w-full px-4 py-2.5 pr-12 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${form.errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                            </button>
                                        </div>
                                        {form.errors.password && <p className="text-xs text-red-500 mt-1">{form.errors.password}</p>}
                                    </div>

                                    {/* Password Confirmation */}
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                                            Konfirmasi Password {!editingAdmin && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={form.data.password_confirmation}
                                            onChange={e => form.setData('password_confirmation', e.target.value)}
                                            placeholder="Ulangi password"
                                            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${form.errors.password_confirmation ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                                        />
                                        {form.errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{form.errors.password_confirmation}</p>}
                                    </div>

                                    {/* Active Toggle (only on edit) */}
                                    {editingAdmin && (
                                        <div className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                                            <div className="flex items-center gap-3">
                                                <span className={`material-symbols-outlined text-lg ${form.data.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {form.data.is_active ? 'toggle_on' : 'toggle_off'}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-700">Status Akun</p>
                                                    <p className="text-xs text-slate-500">{form.data.is_active ? 'Akun aktif dan dapat login' : 'Akun nonaktif, tidak dapat login'}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                title="Ubah Akses Login"
                                                onClick={() => form.setData('is_active', !form.data.is_active)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${form.data.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                                            >
                                                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${form.data.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Modal Footer */}
                                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/50 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        disabled={form.processing}
                                        className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl bg-primary hover:bg-primary/90 transition-all disabled:opacity-60 shadow-lg shadow-blue-200"
                                    >
                                        {form.processing ? (
                                            <>
                                                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">{editingAdmin ? 'save' : 'person_add'}</span>
                                                {editingAdmin ? 'Simpan Perubahan' : 'Tambah Admin'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </>
    );
}

/* ===== Main Settings Page ===== */
const tabs = [
    { key: 'backup', label: 'Backup & Restore', icon: 'cloud_sync' },
    { key: 'reset', label: 'Reset Data', icon: 'restart_alt' },
    { key: 'admin', label: 'Kelola Admin', icon: 'admin_panel_settings' },
] as const;

type TabKey = typeof tabs[number]['key'];

export default function Settings({ counts, admins, coordinator }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const [activeTab, setActiveTab] = useState<TabKey>('backup');

    return (
        <AdminLayout title="Pengaturan" subtitle="Backup, Restore, & Reset Data">
            <Head title="Pengaturan" />

            {flash?.success && (
                <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {flash.success}
                </div>
            )}

            {/* Tab Navigation */}
            <div className="mb-6 border-b border-slate-200">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'backup' && <BackupRestoreTab />}
            {activeTab === 'reset' && <ResetDataTab counts={counts} />}
            {activeTab === 'admin' && <KelolaAdminTab admins={admins} coordinator={coordinator} />}
        </AdminLayout>
    );
}
