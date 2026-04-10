import PembimbingLayout from '@/Layouts/PembimbingLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Attendance { id: number; date: string; check_in: string | null; check_out: string | null; status: string; location: string | null; reason: string | null; proof_file: string | null; siswa: { name: string; nisn: string; dudi?: { name: string } }; }
interface Props { attendances: { data: Attendance[]; links: any[]; from: number; to: number; total: number; last_page: number }; filters: { search?: string; date?: string } }

export default function Presensi({ attendances, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');

    const applyFilters = (s: string, d: string) => {
        router.get(route('pembimbing.presensi'), { search: s || undefined, date: d || undefined }, { preserveState: true, replace: true });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'hadir': return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Hadir</span>;
            case 'terlambat': return <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Terlambat</span>;
            case 'izin': return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Izin</span>;
            case 'sakit': return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Sakit</span>;
            default: return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Alpha</span>;
        }
    };

    return (
        <PembimbingLayout title="Monitoring Presensi" subtitle="Riwayat presensi siswa bimbingan PKL Anda">
            <Head title="Presensi Siswa Bimbingan" />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center justify-between bg-slate-50/50">
                    <div className="flex gap-4 flex-1">
                        <div className="relative max-w-sm w-full">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-primary focus:bg-white" placeholder="Cari nama atau NISN..." value={search} onChange={(e) => { setSearch(e.target.value); applyFilters(e.target.value, date); }} />
                        </div>
                        <input type="date" className="px-4 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-primary focus:bg-white text-slate-600" value={date} onChange={(e) => { setDate(e.target.value); applyFilters(search, e.target.value); }} />
                    </div>
                    {(search || date) && (
                        <button onClick={() => { setSearch(''); setDate(''); applyFilters('', ''); }} className="text-sm font-semibold text-slate-500 hover:text-red-500">Reset Filter</button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Siswa</th>
                                <th className="px-6 py-4">Waktu & Tanggal</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Jarak Lokasi</th>
                                <th className="px-6 py-4">Catatan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {attendances.data.map(a => (
                                <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-900">{a.siswa.name}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{a.siswa.nisn}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-700">{new Date(a.date).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                            <span className="text-emerald-600 flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">login</span> {a.check_in ? a.check_in.slice(0, 5) : '-'}</span>
                                            <span className="text-slate-300">|</span>
                                            <span className="text-orange-600 flex items-center gap-0.5"><span className="material-symbols-outlined text-[12px]">logout</span> {a.check_out ? a.check_out.slice(0, 5) : 'Belum'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">{getStatusBadge(a.status)}</td>
                                    <td className="px-6 py-4 text-center">
                                        {a.location ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                Ada
                                            </span>
                                        ) : <span className="text-xs text-slate-400">-</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {a.reason ? (
                                            <span className="text-xs text-slate-600">{a.reason}</span>
                                        ) : a.proof_file ? (
                                            <a href={`/storage/${a.proof_file}`} target="_blank" className="text-primary text-xs font-semibold hover:underline inline-flex items-center gap-1">
                                                Lihat Bukti <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                            </a>
                                        ) : <span className="text-xs text-slate-400">-</span>}
                                    </td>
                                </tr>
                            ))}
                            {attendances.data.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Tidak ada data presensi.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {attendances.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">Menampilkan {attendances.from} - {attendances.to} dari {attendances.total}</span>
                        <div className="flex gap-1">
                            {attendances.links.map((link: any, i: number) => (
                                <button key={i} title={`Halaman ${link.label.replace(/&[^;]+;/g, '').trim()}`} disabled={!link.url} onClick={() => link.url && router.get(link.url)} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-50`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PembimbingLayout>
    );
}
