import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import Modal from '@/Components/Modal';

export default function Login({ status }: { status?: string }) {
    // Only 'siswa' and 'pembimbing' are visible tabs; 'admin' is hidden and triggered by icon
    const [role, setRole] = useState<'siswa' | 'admin' | 'pembimbing'>('siswa');
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const { props } = usePage();
    const flash = (props as any).flash;

    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
        remember: false,
        role: 'siswa' as 'siswa' | 'admin' | 'pembimbing',
    });

    const forgotForm = useForm({ nisn: '', name: '', email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    const switchRole = (r: 'siswa' | 'admin' | 'pembimbing') => {
        setRole(r);
        setData(prev => ({ ...prev, role: r, username: '', password: '' }));
    };

    // Dynamic heading based on role
    const headingMap = {
        siswa:      { title: 'Selamat Datang',        subtitle: 'Masukkan NISN dan kata sandi untuk melanjutkan jurnal PKL Anda.' },
        pembimbing: { title: 'Portal Pembimbing',      subtitle: 'Login menggunakan NIP dan kata sandi yang telah dibuat oleh Admin.' },
        admin:      { title: 'Administrator',          subtitle: 'Area terbatas. Akses hanya untuk pengelola sistem.' },
    };

    const current = headingMap[role];

    return (
        <>
            <Head title="Login — Portal Jurnal PKL" />
            <div className="flex min-h-screen flex-col lg:flex-row">

                {/* ===== Left Branding Panel ===== */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-primary items-center justify-center overflow-hidden p-12">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                    />
                    <div className="relative z-10 max-w-lg text-white">
                        <div className="mb-8 flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-xl">
                                <span className="material-symbols-outlined text-4xl">school</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Portal Jurnal PKL</h1>
                        </div>
                        <h2 className="text-5xl font-extrabold leading-tight mb-6">Membangun Masa Depan Melalui Pengalaman.</h2>
                        <p className="text-xl text-blue-100/80 leading-relaxed mb-12">
                            Platform digital untuk memantau, mencatat, dan melaporkan kegiatan Praktek Kerja Lapangan siswa SMK.
                        </p>
                        <div className="grid grid-cols-2 gap-5">
                            {[
                                { icon: 'fact_check', title: 'Laporan Harian', desc: 'Catat aktivitas PKL setiap hari.' },
                                { icon: 'monitoring', title: 'Monitoring Real-time', desc: 'Pantau progres siswa secara langsung.' },
                                { icon: 'assignment_ind', title: 'Portal Pembimbing', desc: 'Supervisi langsung dari pembimbing.' },
                                { icon: 'picture_as_pdf', title: 'Export Laporan', desc: 'Cetak rekap PDF kapan saja.' },
                            ].map((f, i) => (
                                <div key={i} className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-2xl hover:bg-white/20 transition-all">
                                    <span className="material-symbols-outlined text-blue-200 text-2xl mb-2 block">{f.icon}</span>
                                    <p className="text-sm font-bold">{f.title}</p>
                                    <p className="text-xs text-blue-100/60 mt-1">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
                </div>

                {/* ===== Right Login Panel ===== */}
                <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-20 bg-white">
                    <div className="w-full max-w-[420px]">

                        {/* Mobile brand */}
                        <div className="lg:hidden flex items-center gap-3 mb-10">
                            <span className="material-symbols-outlined text-primary text-4xl">school</span>
                            <h1 className="text-2xl font-bold text-slate-900">Portal PKL</h1>
                        </div>

                        {/* Heading — with admin icon on the right */}
                        <div className="mb-8">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-3xl font-bold text-slate-900 leading-tight">{current.title}</h3>
                                    {role === 'admin' && (
                                        <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full mt-1">
                                            <span className="material-symbols-outlined text-[12px]">security</span>
                                            Admin Access
                                        </span>
                                    )}
                                </div>
                                {/* Admin trigger icon — subtle, next to title */}
                                <button
                                    type="button"
                                    title={role === 'admin' ? 'Kembali ke login siswa' : 'Login sebagai Admin'}
                                    onClick={() => switchRole(role === 'admin' ? 'siswa' : 'admin')}
                                    className={`shrink-0 mt-1 size-10 rounded-xl flex items-center justify-center transition-all border ${
                                        role === 'admin'
                                            ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {role === 'admin' ? 'close' : 'login'}
                                    </span>
                                </button>
                            </div>
                            <p className="text-slate-500 text-sm mt-2 leading-relaxed">{current.subtitle}</p>
                        </div>

                        {/* Flash & Status */}
                        {status && <div className="mb-4 text-sm font-medium text-green-600">{status}</div>}
                        {flash?.success && (
                            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex gap-2">
                                <span className="material-symbols-outlined text-sm shrink-0">check_circle</span>
                                <p>{flash.success}</p>
                            </div>
                        )}

                        {/* ===== Role Tabs — Siswa | Pembimbing only ===== */}
                        {role !== 'admin' && (
                            <div className="flex bg-slate-100 p-1 rounded-xl mb-7 gap-1">
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => switchRole('siswa')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                                        role === 'siswa' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'
                                    } disabled:opacity-50`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">school</span>
                                    Siswa
                                </button>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={() => switchRole('pembimbing')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                                        role === 'pembimbing' ? 'bg-white shadow text-primary' : 'text-slate-500 hover:text-slate-700'
                                    } disabled:opacity-50`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">assignment_ind</span>
                                    Pembimbing
                                </button>
                            </div>
                        )}

                        {/* ===== Admin Mode Banner ===== */}
                        {role === 'admin' && (
                            <div className="flex items-center gap-3 mb-7 p-3.5 bg-red-50 border border-red-200 rounded-xl">
                                <div className="size-9 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-red-500 text-[20px]">admin_panel_settings</span>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Mode Administrator</p>
                                    <p className="text-xs text-red-500 mt-0.5">Gunakan username & password admin sistem.</p>
                                </div>
                            </div>
                        )}

                        {/* ===== Form ===== */}
                        <form onSubmit={submit} className="space-y-5">
                            {/* Username / NISN / NIP */}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-0.5">
                                    {role === 'siswa' ? 'NISN / Username' : role === 'pembimbing' ? 'NIP' : 'Username Admin'}
                                </label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl leading-none">
                                        {role === 'siswa' ? 'badge' : role === 'pembimbing' ? 'fingerprint' : 'manage_accounts'}
                                    </span>
                                    <input
                                        required
                                        disabled={processing}
                                        value={data.username}
                                        onChange={(e) => setData('username', e.target.value)}
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-70 disabled:bg-slate-100"
                                        placeholder={
                                            role === 'siswa' ? 'Masukkan NISN Anda'
                                            : role === 'pembimbing' ? 'Masukkan NIP Pembimbing'
                                            : 'Masukkan Username Admin'
                                        }
                                        type="text"
                                        autoComplete="username"
                                    />
                                </div>
                                {errors.username && <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.username}</p>}
                            </div>

                            {/* Password */}
                            <div>
                                <label className="text-sm font-semibold text-slate-700 block mb-1.5 ml-0.5">Kata Sandi</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl leading-none">lock</span>
                                    <input
                                        required
                                        disabled={processing}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-70 disabled:bg-slate-100"
                                        placeholder="••••••••"
                                        type={showPassword ? 'text' : 'password'}
                                        autoComplete="current-password"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                        <span className="material-symbols-outlined text-xl leading-none">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-500 text-sm mt-1.5">{errors.password}</p>}
                            </div>

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                        id="remember"
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    <span className="text-sm text-slate-600">Ingat saya</span>
                                </label>
                                {role === 'siswa' && (
                                    <button type="button" onClick={() => setShowForgotModal(true)} className="text-sm font-bold text-primary hover:text-blue-800 transition-colors">
                                        Lupa Kata Sandi?
                                    </button>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                disabled={processing}
                                className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-60 disabled:cursor-not-allowed ${
                                    role === 'admin'
                                        ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20'
                                        : 'bg-primary hover:bg-blue-800 shadow-blue-900/20'
                                }`}
                                type="submit"
                            >
                                {processing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                        </svg>
                                        <span>Memproses Masuk...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Masuk ke Dashboard</span>
                                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <footer className="mt-10 text-center">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">© 2026 Portal Jurnal PKL v1.0</p>
                        </footer>
                    </div>
                </div>
            </div>

            {/* ===== Forgot Password Modal ===== */}
            <Modal show={showForgotModal} onClose={() => setShowForgotModal(false)} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">lock_reset</span>
                            Lupa Kata Sandi
                        </h2>
                        <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <p className="text-sm text-slate-600 mb-6">
                        Masukkan data diri untuk meminta info login baru. Admin akan memverifikasi dan mengirimkan kata sandi baru ke email/whatsapp Anda.
                    </p>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        forgotForm.post(route('helpdesk.request'), {
                            onSuccess: () => { setShowForgotModal(false); forgotForm.reset(); }
                        });
                    }} className="space-y-4">
                        {[
                            { key: 'nisn', label: 'NISN', placeholder: 'Masukkan NISN Anda' },
                            { key: 'name', label: 'Nama Lengkap', placeholder: 'Nama Lengkap Anda' },
                            { key: 'email', label: 'Email / No. Whatsapp', placeholder: 'nama@email.com atau 08123xxxx' },
                        ].map(f => (
                            <div key={f.key}>
                                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">{f.label}</label>
                                <input
                                    required
                                    value={(forgotForm.data as any)[f.key]}
                                    onChange={e => forgotForm.setData(f.key as any, e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                                    placeholder={f.placeholder}
                                />
                                {(forgotForm.errors as any)[f.key] && <p className="text-red-500 text-xs mt-1">{(forgotForm.errors as any)[f.key]}</p>}
                            </div>
                        ))}
                        <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setShowForgotModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                Batal
                            </button>
                            <button type="submit" disabled={forgotForm.processing}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-bold hover:bg-blue-800 transition-all shadow-sm disabled:opacity-70 flex items-center justify-center gap-2">
                                {forgotForm.processing ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                        </svg>
                                        <span>Mengirim...</span>
                                    </>
                                ) : 'Kirim Permintaan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </>
    );
}
