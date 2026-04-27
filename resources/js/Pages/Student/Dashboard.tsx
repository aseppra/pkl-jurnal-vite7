import StudentLayout from '@/Layouts/StudentLayout';
import Portal from '@/Components/Portal';
import { Head, router, usePage, useForm } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

interface Props {
    user: { name: string };
    siswa: { name: string; nisn: string; gender?: string; class: string; pkl_start: string; pkl_end: string; dudi?: { name: string } } | null;
    pklInfo: { company: string; start: string; end: string; progress: number; isActive?: boolean; statusMessage?: string; totalDays: number; elapsedDays: number } | null;
    todayAttendance: { check_in: string | null; check_out: string | null; status: string; reason?: string } | null;
    weeklyAttendance: Array<{ day: string; date: string; status: string; time: string; color: string }>;
}

export default function Dashboard({ user, siswa, pklInfo, todayAttendance, weeklyAttendance }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const successData = flash?.success_data;
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        if (successData) {
            setShowSuccessModal(true);
        }
    }, [successData]);

    const [showIzinModal, setShowIzinModal] = useState(false);
    const [isUploading, setIsUploading] = useState<'checkin' | 'checkout' | null>(null);
    const [actionType, setActionType] = useState<'checkin' | 'checkout' | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const checkinInputRef = useRef<HTMLInputElement>(null);
    const checkoutInputRef = useRef<HTMLInputElement>(null);

    const { data: izinData, setData: setIzinData, post: postIzin, processing: processingIzin, errors: izinErrors, reset: resetIzin } = useForm<{
        date: string;
        reason: string;
        notes: string;
        proof: File | null;
    }>({
        date: '',
        reason: 'Sakit',
        notes: '',
        proof: null
    });

    useEffect(() => {
        if (showIzinModal) {
            setIzinData('date', new Date().toISOString().split('T')[0]);
        }
    }, [showIzinModal]);

    const triggerCamera = (type: 'checkin' | 'checkout') => {
        setActionType(type);
        const ref = type === 'checkin' ? checkinInputRef : checkoutInputRef;
        if (ref.current) {
            ref.current.value = '';
            ref.current.click();
        }
    };

    const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>, type: 'checkin' | 'checkout') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(type);
        const formData = new FormData();
        formData.append('photo', file);

        const routeName = type === 'checkin' ? 'student.checkin' : 'student.checkout';
        router.post(route(routeName), formData as any, {
            forceFormData: true,
            onFinish: () => {
                setIsUploading(null);
                setActionType(null);
            },
        });
    };

    const handleIzinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        postIzin(route('student.izin'), {
            forceFormData: true,
            onSuccess: () => {
                setShowIzinModal(false);
                resetIzin();
            }
        });
    };

    if (!siswa) {
        return (
            <StudentLayout title="Dashboard" subtitle="Selamat Datang" showNotificationBell studentGender={undefined}>
                <Head title="Dashboard" />
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">person_off</span>
                    <h3 className="font-bold text-slate-700 mb-2">Akun belum terhubung</h3>
                    <p className="text-sm text-slate-500">Hubungi admin untuk menghubungkan akun Anda dengan data siswa.</p>
                </div>
            </StudentLayout>
        );
    }

    return (
        <StudentLayout title="Dashboard" subtitle="Selamat Datang" showNotificationBell studentGender={siswa?.gender}>
            <Head title="Dashboard" />

            {flash?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>{flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>{flash.error}
                </div>
            )}

            {/* Greeting */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm font-medium">Selamat Datang Kembali,</p>
                    <h3 className="text-2xl font-bold mt-1">{user.name}</h3>
                    <p className="text-blue-100 text-sm mt-2">{siswa.class} • {pklInfo?.company}</p>
                </div>
            </div>

            {/* PKL Progress */}
            {pklInfo && (
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Progres Masa PKL</h4>
                            <p className="text-xs text-slate-500 mt-1">{pklInfo.start} – {pklInfo.end}</p>
                        </div>
                        <span className="text-2xl font-bold text-primary">{pklInfo.progress}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-500" style={{ width: `${pklInfo.progress}%` }}></div>
                    </div>
                    <p className="text-[11px] text-slate-400 text-center">
                        {pklInfo.elapsedDays > 0
                            ? `${pklInfo.elapsedDays} hari dari ${pklInfo.totalDays} hari telah terlaksana`
                            : 'Masa PKL belum dimulai'}
                    </p>
                </div>
            )}

            {/* Attendance Actions */}
            {todayAttendance?.status === 'izin' ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-amber-500 text-3xl">medical_information</span>
                    </div>
                    <h3 className="font-bold text-amber-800 text-lg mb-1">Status: Sedang Izin</h3>
                    <p className="text-sm text-amber-700 max-w-sm mx-auto">Anda tidak masuk PKL hari ini dengan alasan: <strong>{todayAttendance.reason}</strong>.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => triggerCamera('checkin')}
                            disabled={!!todayAttendance?.check_in || isUploading === 'checkin'}
                            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${todayAttendance?.check_in ? 'border-emerald-200 bg-emerald-50 cursor-default' : isUploading === 'checkin' ? 'border-primary/30 bg-primary/5 cursor-wait' : 'border-dashed border-slate-300 bg-white hover:border-primary hover:bg-primary/5'}`}
                        >
                            {isUploading === 'checkin' ? (
                                <div className="size-8 border-[3px] border-primary/30 border-t-primary rounded-full animate-spin" />
                            ) : (
                                <span className={`material-symbols-outlined text-3xl ${todayAttendance?.check_in ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {todayAttendance?.check_in ? 'check_circle' : 'login'}
                                </span>
                            )}
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900">{isUploading === 'checkin' ? 'Mengupload...' : todayAttendance?.check_in ? `Masuk ${todayAttendance.check_in}` : 'Check In'}</p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase">{isUploading === 'checkin' ? 'Mohon tunggu' : todayAttendance?.check_in ? 'Tercatat' : 'Untuk Absen Masuk'}</p>
                            </div>
                        </button>
                        <button
                            onClick={() => triggerCamera('checkout')}
                            disabled={!todayAttendance?.check_in || !!todayAttendance?.check_out || isUploading === 'checkout'}
                            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${todayAttendance?.check_out ? 'border-blue-200 bg-blue-50 cursor-default' : isUploading === 'checkout' ? 'border-blue-300 bg-blue-50 cursor-wait' : !todayAttendance?.check_in ? 'border-dashed border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed' : 'border-dashed border-slate-300 bg-white hover:border-blue-500 hover:bg-blue-50'}`}
                        >
                            {isUploading === 'checkout' ? (
                                <div className="size-8 border-[3px] border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                            ) : (
                                <span className={`material-symbols-outlined text-3xl ${todayAttendance?.check_out ? 'text-blue-500' : 'text-slate-400'}`}>
                                    {todayAttendance?.check_out ? 'check_circle' : 'logout'}
                                </span>
                            )}
                            <div className="text-center">
                                <p className="text-sm font-bold text-slate-900">{isUploading === 'checkout' ? 'Mengupload...' : todayAttendance?.check_out ? `Keluar ${todayAttendance.check_out}` : 'Check Out'}</p>
                                <p className="text-[10px] text-slate-500 mt-1 uppercase">{isUploading === 'checkout' ? 'Mohon tunggu' : todayAttendance?.check_out ? 'Tercatat' : 'Untuk Absen Pulang'}</p>
                            </div>
                        </button>
                    </div>

                    {!todayAttendance?.check_in && (
                        <button
                            onClick={() => setShowIzinModal(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[18px]">edit_document</span>
                            Input Izin Tidak Masuk
                        </button>
                    )}
                </div>
            )}

            {/* Weekly Recap */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Rekap Mingguan</h4>
                {weeklyAttendance.length > 0 ? (
                    <div className="space-y-3">
                        {weeklyAttendance.map((a, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800">{a.day}</p>
                                    <p className="text-xs text-slate-400">{a.date}</p>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${a.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{a.status}</span>
                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-400 text-center py-4">Belum ada data presensi minggu ini.</p>
                )}
            </div>

            {/* Modal Input Izin */}
            {showIzinModal && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => !processingIzin && setShowIzinModal(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit_document</span>
                                Form Izin Tidak Masuk
                            </h3>
                            <button onClick={() => !processingIzin && setShowIzinModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleIzinSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tanggal Izin</label>
                                        <input 
                                            type="date" 
                                            value={izinData.date} 
                                            onChange={e => setIzinData('date', e.target.value)} 
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                                            required
                                        />
                                        {izinErrors.date && <p className="text-xs text-red-500 mt-1">{izinErrors.date}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="reason" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Alasan Izin</label>
                                        <select
                                            id="reason"
                                            title="Pilih Alasan Izin"
                                            value={izinData.reason}
                                            onChange={e => setIzinData('reason', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            required
                                        >
                                            <option value="Sakit">Sakit</option>
                                            <option value="Kepentingan Keluarga">Kepentingan Keluarga</option>
                                            <option value="Lain-lain">Lain-lain</option>
                                        </select>
                                        {izinErrors.reason && <p className="text-xs text-red-500 mt-1">{izinErrors.reason}</p>}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Deskripsi Lengkap</label>
                                    <textarea
                                        value={izinData.notes}
                                        onChange={e => setIzinData('notes', e.target.value)}
                                        placeholder="Berikan alasan kenapa tidak masuk kerja hari ini..."
                                        rows={3}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                        required
                                    />
                                    {izinErrors.notes && <p className="text-xs text-red-500 mt-1">{izinErrors.notes}</p>}
                                </div>
                                <div>
                                    <label htmlFor="proof" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bukti Pendukung (Foto/Dokumen)</label>
                                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition-colors relative cursor-pointer overflow-hidden">
                                        <input
                                            id="proof"
                                            title="Pilih file bukti pendukung"
                                            type="file"
                                            onChange={e => setIzinData('proof', e.target.files ? e.target.files[0] : null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*,.pdf"
                                            required
                                        />
                                        <span className="material-symbols-outlined text-slate-400 text-3xl mb-1">upload_file</span>
                                        <p className="text-xs text-slate-500 text-center font-medium max-w-[200px] truncate">
                                            {izinData.proof ? izinData.proof.name : 'Pilih file atau drop disini'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1">Maks. 2MB (JPG, PNG, PDF)</p>
                                    </div>
                                    {izinErrors.proof && <p className="text-xs text-red-500 mt-1">{izinErrors.proof}</p>}
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowIzinModal(false)}
                                        className="flex-1 py-3 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processingIzin}
                                        className="flex-1 py-3 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary-hover transition-colors shadow-sm shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {processingIzin && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                        {processingIzin ? 'Memproses...' : 'Kirim Izin'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div></Portal>
            )}

            {/* Input File Tersembunyi untuk Kamera – Wajib Kamera Langsung */}
            <input
                type="file"
                accept="image/*"
                capture="user"
                ref={checkinInputRef}
                className="hidden"
                onChange={(e) => handleCameraCapture(e, 'checkin')}
            />
            <input
                type="file"
                accept="image/*"
                capture="user"
                ref={checkoutInputRef}
                className="hidden"
                onChange={(e) => handleCameraCapture(e, 'checkout')}
            />

            {/* Modal Sukses Presensi */}
            {showSuccessModal && successData && (
                <Portal>
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="bg-emerald-500 p-6 flex flex-col items-center justify-center text-white relative">
                                <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-emerald-100 hover:text-white transition-colors bg-black/10 rounded-full p-1 leading-none">
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <h3 className="font-bold text-xl mb-1">Presensi Berhasil!</h3>
                                <p className="text-emerald-100 text-sm font-medium">Tercatat pada {successData.time}</p>
                            </div>
                            <div className="p-6">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-center">Preview Foto Bukti</p>
                                <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden mb-6 border-2 border-slate-200 shadow-inner">
                                    <img src={`/storage/${successData.photo}`} alt="Selfie Presensi" className="w-full h-full object-cover" />
                                </div>

                                <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-slate-900 text-white font-bold text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-md">
                                    Tutup & Kembali ke Dasbor
                                </button>
                            </div>
                        </div>
                    </div>
                </Portal>
            )}
        </StudentLayout>
    );
}
