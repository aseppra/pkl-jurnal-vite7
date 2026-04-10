import PembimbingLayout from '@/Layouts/PembimbingLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

interface Student { id: number; name: string; nisn: string; class: string; company: string; attendance: string; progress: number; status: string; statusColor: string; }
interface PaginatedStudents { data: Student[]; links: { url: string | null; label: string; active: boolean }[]; from: number; to: number; total: number; last_page: number; }
interface Props { students: PaginatedStudents; classes: string[]; filters: { search?: string; class?: string }; }

export default function Rekapitulasi({ students, classes, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilter, setShowFilter] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const applyFilter = (key: string, val: string) => {
        const f = { ...filters, [key]: val || undefined };
        router.get(route('pembimbing.rekapitulasi'), f, { preserveState: true, replace: true });
    };

    const handleSearch = (v: string) => { setSearch(v); applyFilter('search', v); };
    const activeFilterCount = [filters.class].filter(Boolean).length;

    const downloadExport = (type: 'presensi' | 'jurnal', id: number) => {
        window.open(route(`pembimbing.rekapitulasi.export-${type}`, id) + '?download=1', '_blank');
    };

    return (
        <PembimbingLayout title="Rekapitulasi Laporan" subtitle="Export data presensi dan jurnal siswa bimbingan Anda">
            <Head title="Rekapitulasi" />

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-4">
                <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
                    {/* Filter Icon Dropdown */}
                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilter(!showFilter)}
                            className={`relative flex items-center justify-center size-10 rounded-lg border transition-colors ${activeFilterCount > 0 ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                            title="Filter"
                        >
                            <span className="material-symbols-outlined text-xl">filter_list</span>
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 size-5 bg-primary text-white rounded-full text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>
                            )}
                        </button>
                        {showFilter && (
                            <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-30 overflow-hidden">
                                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Filter Data</span>
                                    {activeFilterCount > 0 && (
                                        <button onClick={() => { router.get(route('pembimbing.rekapitulasi'), { search: filters.search || undefined }, { preserveState: true, replace: true }); setShowFilter(false); }} className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase">Reset</button>
                                    )}
                                </div>
                                <div className="p-3 space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kelas</label>
                                        <select
                                            value={filters.class || ''}
                                            onChange={(e) => applyFilter('class', e.target.value)}
                                            title="Filter Kelas"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="">Semua Kelas</option>
                                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary hidden sm:block"
                            placeholder="Cari nama siswa..."
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead><tr className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Nama Siswa</th><th className="px-6 py-4">Kelas</th><th className="px-6 py-4">Kehadiran</th><th className="px-6 py-4">Status Jurnal</th><th className="px-6 py-4 text-right">Aksi Export</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.data.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] uppercase">{s.name.charAt(0)}</div><div><p className="text-sm font-bold text-slate-900">{s.name}</p><p className="text-xs text-slate-500 font-mono">NIS: {s.nisn}</p></div></div></td>
                                    <td className="px-6 py-4 text-xs font-medium text-slate-600">{s.class}</td>
                                    <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="text-xs font-semibold">{s.attendance}</span><div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.statusColor === 'emerald' ? 'bg-emerald-500' : s.statusColor === 'amber' ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${s.progress}%` }}></div></div></div></td>
                                    <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${s.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{s.status}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => downloadExport('presensi', s.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 rounded-lg text-xs font-bold transition-all shadow-sm">
                                                <span className="material-symbols-outlined text-[14px]">fact_check</span> Presensi
                                            </button>
                                            <button onClick={() => downloadExport('jurnal', s.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 rounded-lg text-xs font-bold transition-all shadow-sm">
                                                <span className="material-symbols-outlined text-[14px]">menu_book</span> Jurnal
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {students.data.length === 0 && <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-sm">Tidak ada siswa bimbingan yang sesuai pencarian.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {students.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">Menampilkan {students.from} - {students.to} dari {students.total}</span>
                        <div className="flex gap-1">
                            {students.links.map((link, i) => (
                                <button key={i} title={`Halaman ${link.label.replace(/&[^;]+;/g, '').trim()}`} disabled={!link.url} onClick={() => link.url && router.get(link.url)} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-50`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PembimbingLayout>
    );
}
