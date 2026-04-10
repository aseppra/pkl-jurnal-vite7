import PembimbingLayout from '@/Layouts/PembimbingLayout';
import { Head, Link } from '@inertiajs/react';

interface Props {
    pembimbing: any;
    dudi: any;
    totalSiswa: number;
    isAssigned: boolean;
}

export default function Dashboard({ pembimbing, dudi, totalSiswa, isAssigned }: Props) {
    const quickActions = [
        {
            href: 'pembimbing.siswa',
            label: 'Data Siswa',
            desc: 'Lihat daftar siswa bimbingan',
            icon: 'supervisor_account',
            gradient: 'from-blue-500 to-blue-600',
            shadow: 'shadow-blue-500/30',
            hoverShadow: 'hover:shadow-blue-500/40',
        },
        {
            href: 'pembimbing.presensi',
            label: 'Cek Presensi',
            desc: 'Monitor kehadiran harian',
            icon: 'how_to_reg',
            gradient: 'from-emerald-500 to-emerald-600',
            shadow: 'shadow-emerald-500/30',
            hoverShadow: 'hover:shadow-emerald-500/40',
        },
        {
            href: 'pembimbing.jurnal',
            label: 'Cek Jurnal',
            desc: 'Pantau laporan kegiatan',
            icon: 'menu_book',
            gradient: 'from-violet-500 to-violet-600',
            shadow: 'shadow-violet-500/30',
            hoverShadow: 'hover:shadow-violet-500/40',
        },
        {
            href: 'pembimbing.rekapitulasi',
            label: 'Rekap Laporan',
            desc: 'Export presensi & jurnal',
            icon: 'summarize',
            gradient: 'from-amber-500 to-orange-500',
            shadow: 'shadow-amber-500/30',
            hoverShadow: 'hover:shadow-amber-500/40',
        },
    ];

    return (
        <PembimbingLayout title="Dashboard Pembimbing" subtitle={`Selamat datang kembali, ${pembimbing.name}`}>
            <Head title="Dashboard Pembimbing" />

            {/* ===== Banner Peringatan ===== */}
            {!isAssigned && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl">
                    <span className="material-symbols-outlined text-amber-500 shrink-0 mt-0.5">warning</span>
                    <div>
                        <p className="text-sm font-bold text-amber-800">Akun Belum Dikonfigurasi</p>
                        <p className="text-sm text-amber-700 mt-0.5">
                            Akun pembimbing ini belum di-assign ke <strong>DUDI / Perusahaan PKL</strong> manapun.
                            Silakan hubungi Admin untuk melakukan pengaturan.
                        </p>
                    </div>
                </div>
            )}
            {isAssigned && totalSiswa === 0 && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <span className="material-symbols-outlined text-blue-500 shrink-0 mt-0.5">info</span>
                    <div>
                        <p className="text-sm font-bold text-blue-800">Belum Ada Siswa Bimbingan</p>
                        <p className="text-sm text-blue-700 mt-0.5">
                            Anda sudah terhubung ke <strong>{dudi?.name}</strong>, namun belum ada siswa yang di-assign ke DUDI ini.
                        </p>
                    </div>
                </div>
            )}

            {/* ===== Stats Cards — gradient seperti Admin Dashboard ===== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Card 1: Siswa Bimbingan */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg shadow-blue-500/30 flex items-start justify-between transition-transform hover:-translate-y-1">
                    <div>
                        <p className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-2">Siswa Bimbingan</p>
                        <h4 className="text-4xl font-extrabold leading-none">{totalSiswa}</h4>
                        <p className="text-sm font-medium text-blue-200 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">groups</span>
                            siswa aktif PKL
                        </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white text-2xl">groups</span>
                    </div>
                </div>

                {/* Card 2: Perusahaan DUDI */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg shadow-emerald-500/30 flex items-start justify-between transition-transform hover:-translate-y-1">
                    <div className="flex-1 min-w-0 pr-3">
                        <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-2">Perusahaan (DUDI)</p>
                        <h4 className="text-xl font-extrabold leading-snug">
                            {dudi ? dudi.name : <span className="text-emerald-200 text-base font-semibold">Belum Ditentukan</span>}
                        </h4>
                        {dudi?.address && (
                            <p className="text-xs text-emerald-200 mt-1.5 line-clamp-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">location_on</span>
                                {dudi.address}
                            </p>
                        )}
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                        <span className="material-symbols-outlined text-white text-2xl">business</span>
                    </div>
                </div>

                {/* Card 3: Departemen / Jurusan */}
                <div className="bg-gradient-to-br from-violet-500 to-violet-600 text-white p-6 rounded-xl shadow-lg shadow-violet-500/30 flex items-start justify-between transition-transform hover:-translate-y-1">
                    <div>
                        <p className="text-xs font-bold text-violet-100 uppercase tracking-widest mb-2">Bidang Keahlian</p>
                        <h4 className="text-xl font-extrabold leading-snug">
                            {pembimbing.department || 'Teknik & Informatika'}
                        </h4>
                        <p className="text-sm font-medium text-violet-200 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">fact_check</span>
                            Monitoring &amp; Validasi Jurnal
                        </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shrink-0">
                        <span className="material-symbols-outlined text-white text-2xl">badge</span>
                    </div>
                </div>
            </div>

            {/* ===== Aksi Cepat — gradient cards ===== */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="size-9 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-[20px]">electric_bolt</span>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Aksi Cepat</h3>
                        <p className="text-xs text-slate-500">Navigasi langsung ke fitur monitoring</p>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            href={route(action.href)}
                            className={`relative flex flex-col items-center justify-center gap-3 p-6 bg-gradient-to-br ${action.gradient} text-white rounded-xl shadow-lg ${action.shadow} hover:shadow-xl ${action.hoverShadow} transition-all hover:-translate-y-1 overflow-hidden group`}
                        >
                            {/* Background decorative circle */}
                            <div className="absolute -bottom-4 -right-4 size-20 bg-white/10 rounded-full" />
                            <div className="absolute -top-3 -left-3 size-12 bg-white/10 rounded-full" />

                            <div className="relative z-10 size-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-2xl text-white">{action.icon}</span>
                            </div>
                            <div className="relative z-10 text-center">
                                <p className="font-bold text-white text-sm leading-tight">{action.label}</p>
                                <p className="text-[10px] text-white/70 mt-0.5 leading-tight">{action.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </PembimbingLayout>
    );
}
