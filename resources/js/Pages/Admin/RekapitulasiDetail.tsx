import AdminLayout from '@/Layouts/AdminLayout';
import Portal from '@/Components/Portal';
import { Head, router, Link } from '@inertiajs/react';
import React, { useState } from 'react';

interface Siswa { id: number; name: string; nisn: string; class: string; dudi: any; pembimbing: any; }
interface Attendance { id: number; date: string; check_in: string | null; check_out: string | null; status: string; notes: string | null; reason?: string | null; proof_file?: string | null; }
interface Journal { id: number; date: string; activity: string; target: string; achievement: string; image_path: string | null; }
interface Props { siswa: Siswa; attendances: Attendance[]; journals: Journal[]; filters: { start_date: string; end_date: string; }; }

export default function RekapitulasiDetail({ siswa, attendances, journals, filters }: Props) {
    const [dateRange, setDateRange] = useState({ 
        start: filters.start_date || '', 
        end: filters.end_date || '' 
    });

    const [previewModal, setPreviewModal] = useState<{ url: string; downloadUrl: string; title: string } | null>(null);
    const [iframeLoading, setIframeLoading] = useState(true);

    const applyFilter = (start: string, end: string) => {
        router.get(route('admin.rekapitulasi.show', siswa.id), { start_date: start, end_date: end }, { preserveState: true, replace: true });
    };

    const handlePresetFilter = (preset: '1_minggu' | '1_bulan' | 'periode') => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayStr = `${yyyy}-${mm}-${dd}`;

        if (preset === '1_minggu') {
            const pastWeek = new Date(today);
            pastWeek.setDate(today.getDate() - 7);
            const wY = pastWeek.getFullYear();
            const wM = String(pastWeek.getMonth() + 1).padStart(2, '0');
            const wD = String(pastWeek.getDate()).padStart(2, '0');
            applyFilter(`${wY}-${wM}-${wD}`, todayStr);
        } else if (preset === '1_bulan') {
            const pastMonth = new Date(today);
            pastMonth.setMonth(today.getMonth() - 1);
            const mY = pastMonth.getFullYear();
            const mM = String(pastMonth.getMonth() + 1).padStart(2, '0');
            const mD = String(pastMonth.getDate()).padStart(2, '0');
            applyFilter(`${mY}-${mM}-${mD}`, todayStr);
        } else {
            applyFilter('', '');
        }
    };

    const handleCustomFilter = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilter(dateRange.start, dateRange.end);
    };

    const openPreview = (type: 'presensi' | 'jurnal') => {
        const routeName = type === 'presensi' ? 'admin.rekapitulasi.export-presensi' : 'admin.rekapitulasi.export-jurnal';
        const params = { siswa: siswa.id, start_date: filters.start_date, end_date: filters.end_date };
        const previewUrl = route(routeName, params);
        const dlUrl = route(routeName, { ...params, download: 1 });
        const title = type === 'presensi' ? 'Preview Rekap Presensi' : 'Preview Rekap Jurnal';
        setIframeLoading(true);
        setPreviewModal({ url: previewUrl, downloadUrl: dlUrl, title });
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            hadir: 'bg-emerald-100 text-emerald-700',
            izin: 'bg-blue-100 text-blue-700',
            sakit: 'bg-amber-100 text-amber-700',
            alpa: 'bg-rose-100 text-rose-700',
            terlambat: 'bg-orange-100 text-orange-700',
        };
        return <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${map[status] || 'bg-slate-100 text-slate-700'}`}>{status}</span>;
    };

    return (
        <AdminLayout title={`Rekapitulasi: ${siswa.name}`} subtitle="Detail kehadiran dan jurnal harian siswa">
            <Head title={`Detail Rekap: ${siswa.name}`} />

            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <Link href={route('admin.rekapitulasi')} className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-semibold">
                    <span className="material-symbols-outlined">arrow_back</span>
                    Kembali ke Daftar
                </Link>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openPreview('presensi')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        Export Presensi
                    </button>
                    <button
                        onClick={() => openPreview('jurnal')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                        Export Jurnal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-5">
                    <div className="size-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shrink-0">
                        {siswa.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">{siswa.name}</h2>
                        <p className="text-sm font-medium text-slate-500 mb-3">{siswa.nisn} • {siswa.class}</p>
                        <div className="flex flex-col gap-1.5 text-sm">
                            <p className="flex items-center gap-2 text-slate-600">
                                <span className="material-symbols-outlined text-[18px]">business</span> 
                                Tempat PKL: <strong className="text-slate-800">{siswa.dudi?.name || '-'}</strong>
                            </p>
                            <p className="flex items-center gap-2 text-slate-600">
                                <span className="material-symbols-outlined text-[18px]">person</span> 
                                Pembimbing: <strong className="text-slate-800">{siswa.pembimbing?.name || '-'}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Filter Periode</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                        <button onClick={() => handlePresetFilter('1_minggu')} className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 transition-colors">1 Minggu Terakhir</button>
                        <button onClick={() => handlePresetFilter('1_bulan')} className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 transition-colors">1 Bulan Terakhir</button>
                        <button onClick={() => handlePresetFilter('periode')} className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 transition-colors">Periode PKL Berjalan</button>
                    </div>
                    <form onSubmit={handleCustomFilter} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <input type="date" title="Tanggal Mulai" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="h-9 p-2 rounded-lg border border-slate-200 text-xs flex-1 w-full" required />
                            <span className="text-slate-400 text-xs">s/d</span>
                            <input type="date" title="Tanggal Akhir" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="h-9 p-2 rounded-lg border border-slate-200 text-xs flex-1 w-full" required />
                        </div>
                        <button type="submit" className="h-9 bg-primary text-white rounded-lg text-xs font-bold w-full hover:bg-primary/90 transition-colors">Terapkan Rentang Kustom</button>
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Daftar Kehadiran */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">how_to_reg</span> Form Kehadiran
                        </h3>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold text-center">
                            {attendances.length} Hari
                        </span>
                    </div>
                    <div className="overflow-x-auto flex-1 h-[500px] overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-white shadow-sm ring-1 ring-slate-200/50 z-10 text-slate-500 font-bold text-[10px] border-b border-slate-200 uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Tanggal</th>
                                    <th className="p-4">Masuk / Pulang</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {attendances.map(att => (
                                    <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-medium">{new Date(att.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
                                        <td className="p-4">
                                            {att.check_in?.substring(0,5)} {att.check_out ? `- ${att.check_out.substring(0,5)}` : ''} 
                                            {!att.check_in && !att.check_out && '-'}
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col gap-1 items-start">
                                                {getStatusBadge(att.status)}
                                                {att.status === 'izin' && att.reason && <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100">{att.reason}</span>}
                                                {att.notes && <p className="text-xs text-slate-500 italic mt-1 leading-relaxed max-w-[200px]">{att.status === 'izin' ? att.notes : `${att.notes.substring(0,30)}...`}</p>}
                                                {att.proof_file && (
                                                    <a href={`/storage/${att.proof_file}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg mt-1 font-bold transition-colors border border-slate-200">
                                                        <span className="material-symbols-outlined text-[14px]">attachment</span>
                                                        Lihat Bukti
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {attendances.length === 0 && (
                                    <tr><td colSpan={3} className="p-8 text-center text-slate-400">Tidak ada kehadiran pada periode ini.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Daftar Jurnal */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-indigo-500">menu_book</span> Form Jurnal
                        </h3>
                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold text-center">
                            {journals.length} Jurnal
                        </span>
                    </div>
                    <div className="p-4 h-[500px] overflow-y-auto space-y-3 bg-slate-50/30">
                        {journals.map(journal => (
                            <div key={journal.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0 pl-2">
                                        <h4 className="font-bold text-slate-800 text-xs truncate">{new Date(journal.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</h4>
                                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{journal.activity}</p>
                                    </div>
                                    {journal.image_path ? (
                                        <a href={`/storage/${journal.image_path}`} target="_blank" rel="noreferrer" className="shrink-0 inline-flex items-center gap-1.5 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg font-bold transition-colors border border-indigo-200">
                                            <span className="material-symbols-outlined text-[16px]">attachment</span>
                                            Lihat Bukti
                                        </a>
                                    ) : (
                                        <span className="shrink-0 inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-400 px-2.5 py-1.5 rounded-lg font-bold border border-slate-200">
                                            <span className="material-symbols-outlined text-[14px]">image_not_supported</span>
                                            Tanpa Foto
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                        {journals.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">menu_book</span>
                                <p className="text-sm font-medium">Tidak ada jurnal pada periode ini.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {previewModal && (
                <Portal>
                    <div className="fixed inset-0 z-[10000] flex flex-col bg-black/60 backdrop-blur-sm">
                        {/* Modal Header Bar */}
                        <div className="shrink-0 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="size-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">{previewModal.title}</h3>
                                    <p className="text-[10px] text-slate-500 font-medium">{siswa.name} &bull; {siswa.nisn}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={previewModal.downloadUrl}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-emerald-200 hover:shadow-lg"
                                >
                                    <span className="material-symbols-outlined text-sm">download</span>
                                    Download PDF
                                </a>
                                <button
                                    onClick={() => setPreviewModal(null)}
                                    title="Tutup preview"
                                    className="size-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>

                        {/* PDF Iframe */}
                        <div className="flex-1 relative">
                            {iframeLoading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10">
                                    <div className="size-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-sm font-semibold text-slate-600">Memuat preview PDF...</p>
                                    <p className="text-xs text-slate-400 mt-1">Mohon tunggu sebentar</p>
                                </div>
                            )}
                            <iframe
                                src={previewModal.url}
                                className="w-full h-full border-0"
                                onLoad={() => setIframeLoading(false)}
                                title="PDF Preview"
                            />
                        </div>
                    </div>
                </Portal>
            )}
        </AdminLayout>
    );
}
