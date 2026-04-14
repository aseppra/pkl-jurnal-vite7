import AdminLayout from '@/Layouts/AdminLayout';
import { Head, usePage, Link } from '@inertiajs/react';

interface Props {
    stats: {
        totalSiswa: number;
        hadirCount: number;
        belumCount: number;
        izinCount: number;
        belumMasuk: number;
    };
    pklPeriod: {
        start: string | null;
        end: string | null;
    };
    recentAttendances: Array<{
        id: number;
        name: string;
        time: string;
        location: string;
        status: string;
        statusColor: string;
    }>;
}

export default function Dashboard({ stats, pklPeriod, recentAttendances }: Props) {
    const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
    const getDaysRemaining = () => {
        if (!pklPeriod.end) return null;
        const end = new Date(pklPeriod.end);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };
    const getProgress = () => {
        if (!pklPeriod.start || !pklPeriod.end) return 0;
        const start = new Date(pklPeriod.start).getTime();
        const end = new Date(pklPeriod.end).getTime();
        const now = new Date().getTime();
        if (now < start) return 0;
        if (now > end) return 100;
        return Math.round(((now - start) / (end - start)) * 100);
    };
    const daysLeft = getDaysRemaining();
    const progress = getProgress();
    return (
        <AdminLayout title="Overview" subtitle="Ringkasan Aktivitas Praktik Kerja Lapangan">
            <Head title="Admin Dashboard" />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
                {/* Card 1: Siswa Aktif */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-md flex items-start justify-between transition-transform hover:-translate-y-1">
                    <div>
                        <p className="text-sm font-medium text-blue-100 mb-1">Siswa Aktif PKL</p>
                        <h4 className="text-3xl font-bold">{stats.totalSiswa}</h4>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white">group</span>
                    </div>
                </div>

                {/* Card 2: Presensi Hari Ini */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-md flex items-start justify-between transition-transform hover:-translate-y-1">
                    <div>
                        <p className="text-sm font-medium text-emerald-100 mb-1">Presensi Hari Ini</p>
                        <h4 className="text-3xl font-bold">{stats.hadirCount}</h4>
                        <p className="text-xs font-medium text-emerald-50 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">check_circle</span>
                            {stats.totalSiswa > 0 ? Math.round((stats.hadirCount / stats.totalSiswa) * 100) : 0}% kehadiran tercapai
                        </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white">how_to_reg</span>
                    </div>
                </div>

                {/* Card 3: Belum Presensi/Izin */}
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 text-white p-6 rounded-xl shadow-md flex items-start justify-between transition-transform hover:-translate-y-1">
                    <div>
                        <p className="text-sm font-medium text-rose-100 mb-1">Belum Presensi/Izin</p>
                        <h4 className="text-3xl font-bold">{stats.belumCount}</h4>
                        <p className="text-xs font-medium text-rose-50 mt-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">event_busy</span>
                            {stats.belumMasuk} Belum Masuk, {stats.izinCount} Izin
                        </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white">person_off</span>
                    </div>
                </div>

                {/* Card 4: PKL Period Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-sm font-medium text-indigo-100 mb-1">Periode PKL</p>
                            {daysLeft !== null && daysLeft > 0 ? (
                                <h4 className="text-3xl font-bold">{daysLeft} <span className="text-base font-medium text-indigo-200">hari lagi</span></h4>
                            ) : daysLeft !== null && daysLeft <= 0 ? (
                                <h4 className="text-xl font-bold">Selesai!</h4>
                            ) : (
                                <h4 className="text-xl font-bold text-indigo-200">Belum diatur</h4>
                            )}
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                            <span className="material-symbols-outlined text-white">date_range</span>
                        </div>
                    </div>
                    <div className="space-y-2 text-indigo-50">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium">{formatDate(pklPeriod.start)}</span>
                            <span className="font-medium">{formatDate(pklPeriod.end)}</span>
                        </div>
                        <div className="w-full h-2 bg-indigo-900/30 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                        <p className="text-[11px] text-center font-medium opacity-80">{progress}% dari total periode</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-6">
                <Link href={route('admin.monitoring')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary hover:bg-slate-50 hover:text-primary transition-all text-sm font-semibold text-slate-700">
                    <span className="material-symbols-outlined text-[18px]">monitoring</span>
                    Monitoring 
                </Link>
                <Link href={route('admin.rekapitulasi')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary hover:bg-slate-50 hover:text-primary transition-all text-sm font-semibold text-slate-700">
                    <span className="material-symbols-outlined text-[18px]">data_table</span>
                    Rekapitulasi
                </Link>
                <Link href={route('admin.helpdesk')} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary hover:bg-slate-50 hover:text-primary transition-all text-sm font-semibold text-slate-700">
                    <span className="material-symbols-outlined text-[18px]">support_agent</span>
                    Helpdesk
                </Link>
            </div>

            {/* Monitoring Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Monitoring Kehadiran Real-time</h3>
                    <p className="text-sm text-slate-500">Status presensi siswa per hari ini</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Nama Siswa</th>
                                <th className="px-6 py-4">Waktu Masuk</th>
                                <th className="px-6 py-4">Lokasi PKL</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {recentAttendances.length > 0 ? recentAttendances.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-primary">
                                                {a.name.split(' ').map((n: string) => n[0]).join('')}
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900">{a.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{a.time}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{a.location}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                            a.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                                            a.statusColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                                            a.statusColor === 'red' ? 'bg-red-100 text-red-800' :
                                            'bg-slate-100 text-slate-800'
                                        }`}>
                                            {a.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">Belum ada data presensi hari ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
