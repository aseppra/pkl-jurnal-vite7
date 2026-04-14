import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';

interface Attendance { id: number; date: string; check_in: string | null; check_out: string | null; status: string; notes: string | null; reason?: string | null; }
interface Journal { id: number; date: string; activity: string; target: string; achievement: string; }
interface Props { attendances: Attendance[]; journals: Journal[]; filters: { start_date: string; end_date: string; }; pklPeriod: { start: string; end: string; }; }

export default function Rekapitulasi({ attendances, journals, filters, pklPeriod }: Props) {
    const [dateRange, setDateRange] = useState({ start: filters.start_date || '', end: filters.end_date || '' });
    const [activeTab, setActiveTab] = useState<'presensi' | 'jurnal'>('presensi');

    React.useEffect(() => {
        setDateRange({ start: filters.start_date || '', end: filters.end_date || '' });
    }, [filters.start_date, filters.end_date]);

    const applyFilter = (start: string, end: string) => {
        router.get(route('student.rekapitulasi'), { start_date: start, end_date: end }, { preserveState: true, replace: true });
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

    const activePreset = React.useMemo(() => {
        if (!dateRange.start && !dateRange.end) return 'periode';
        if (dateRange.start === pklPeriod.start && dateRange.end === pklPeriod.end) return 'periode';
        
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        if (dateRange.end !== todayStr) return 'custom';

        const pastWeek = new Date(today);
        pastWeek.setDate(today.getDate() - 7);
        const weekStr = `${pastWeek.getFullYear()}-${String(pastWeek.getMonth() + 1).padStart(2, '0')}-${String(pastWeek.getDate()).padStart(2, '0')}`;
        if (dateRange.start === weekStr) return '1_minggu';

        const pastMonth = new Date(today);
        pastMonth.setMonth(today.getMonth() - 1);
        const monthStr = `${pastMonth.getFullYear()}-${String(pastMonth.getMonth() + 1).padStart(2, '0')}-${String(pastMonth.getDate()).padStart(2, '0')}`;
        if (dateRange.start === monthStr) return '1_bulan';

        return 'custom';
    }, [dateRange]);

    const getStatusBadge = (status: string) => {
        let displayStatus = status;
        if (displayStatus.toLowerCase() === 'terlambat') {
            displayStatus = 'hadir';
        }

        const map: Record<string, string> = {
            hadir: 'bg-emerald-100 text-emerald-700 border-emerald-200',
            izin: 'bg-blue-100 text-blue-700 border-blue-200',
            sakit: 'bg-amber-100 text-amber-700 border-amber-200',
            alpa: 'bg-rose-100 text-rose-700 border-rose-200',
        };
        const colorClass = map[displayStatus] || 'bg-slate-100 text-slate-700 border-slate-200';
        return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${colorClass}`}>{displayStatus}</span>;
    };

    return (
        <StudentLayout title="Rekapitulasi" subtitle="Riwayat Kehadiran & Jurnal" showNotificationBell>
            <Head title="Rekapitulasi PKL" />

            <div className="space-y-4">
                {/* Filter Section - Mobile Card Style */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Filter Periode</h3>
                    <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
                        <button onClick={() => handlePresetFilter('1_minggu')} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${activePreset === '1_minggu' ? 'bg-primary/10 hover:bg-primary/20 border border-primary/20 font-bold text-primary' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-600'}`}>1 Minggu Terakhir</button>
                        <button onClick={() => handlePresetFilter('1_bulan')} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${activePreset === '1_bulan' ? 'bg-primary/10 hover:bg-primary/20 border border-primary/20 font-bold text-primary' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-600'}`}>1 Bulan Terakhir</button>
                        <button onClick={() => handlePresetFilter('periode')} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs transition-colors ${activePreset === 'periode' ? 'bg-primary/10 hover:bg-primary/20 border border-primary/20 font-bold text-primary' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200 font-semibold text-slate-600'}`}>Periode PKL Aktif</button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                    <form onSubmit={handleCustomFilter} className="flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Dari Tanggal</label>
                                <input type="date" title="Dari Tanggal" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} className="h-10 px-3 mt-1 rounded-xl border border-slate-200 text-sm w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                            </div>
                            <div className="flex-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase ml-1">Sampai</label>
                                <input type="date" title="Sampai Tanggal" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} className="h-10 px-3 mt-1 rounded-xl border border-slate-200 text-sm w-full bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required />
                            </div>
                        </div>
                        <button type="submit" className="h-10 mt-1 bg-slate-800 text-white rounded-xl text-xs font-bold w-full hover:bg-slate-900 transition-colors flex items-center justify-center gap-2">
                             <span className="material-symbols-outlined text-sm">filter_alt</span> Terapkan Filter
                        </button>
                    </form>
                </div>

                {/* Tabs & Download Buttons */}
                <div className="flex flex-col gap-4">
                     <div className="flex p-1 bg-slate-200/50 rounded-xl">
                        <button onClick={() => setActiveTab('presensi')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'presensi' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Presensi</button>
                        <button onClick={() => setActiveTab('jurnal')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'jurnal' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Jurnal</button>
                    </div>

                    {/* Download Button Contextual */}
                    {activeTab === 'presensi' ? (
                        <a href={route('student.rekapitulasi.export-presensi', { start_date: filters.start_date, end_date: filters.end_date })} className="flex justify-center items-center gap-2 w-full bg-emerald-500 text-white py-3 rounded-xl font-bold shadow-sm shadow-emerald-200 hover:bg-emerald-600 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download Rekap Presensi (PDF)
                        </a>
                    ) : (
                        <a href={route('student.rekapitulasi.export-jurnal', { start_date: filters.start_date, end_date: filters.end_date })} className="flex justify-center items-center gap-2 w-full bg-indigo-500 text-white py-3 rounded-xl font-bold shadow-sm shadow-indigo-200 hover:bg-indigo-600 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">download</span>
                            Download Rekap Jurnal (PDF)
                        </a>
                    )}
                </div>

                {/* Data Lists - Mobile Cards */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h4 className="font-bold text-slate-800 text-sm">
                            {activeTab === 'presensi' ? 'Detail Kehadiran' : 'Detail Jurnal Harian'}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'presensi' ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>
                            {activeTab === 'presensi' ? `${attendances.length} Hari` : `${journals.length} Kegiatan`}
                        </span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {activeTab === 'presensi' ? (
                            attendances.length > 0 ? (
                                attendances.map(att => (
                                    <div key={att.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h5 className="font-bold text-slate-800 text-sm">{new Date(att.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</h5>
                                                <p className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {att.check_in?.substring(0,5) || '-'} &bull; {att.check_out?.substring(0,5) || '-'}
                                                </p>
                                            </div>
                                            {getStatusBadge(att.status)}
                                        </div>
                                        {(att.notes || att.reason) && (
                                            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 inline-block font-medium">
                                                {att.reason && <span className="text-amber-700 font-bold block mb-0.5">{att.reason}</span>}
                                                {att.notes}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">event_busy</span>
                                    <p className="text-sm">Tidak ada presensi di periode ini.</p>
                                </div>
                            )
                        ) : (
                            journals.length > 0 ? (
                                journals.map(journal => (
                                    <div key={journal.id} className="p-4 hover:bg-slate-50 transition-colors relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                        <h5 className="font-bold text-slate-800 text-sm mb-1">{journal.activity}</h5>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                            {new Date(journal.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                        {(journal.target || journal.achievement) && (
                                            <div className="text-xs text-slate-600 space-y-1 mt-2">
                                                {journal.target && <p className="line-clamp-2"><span className="font-semibold text-slate-700">Target:</span> {journal.target}</p>}
                                                {journal.achievement && <p className="line-clamp-2"><span className="font-semibold text-slate-700">Pencapaian:</span> {journal.achievement}</p>}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-slate-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">menu_book</span>
                                    <p className="text-sm">Tidak ada jurnal di periode ini.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </div>
            {/* Added style to hide horizontal scrollbar on preset buttons container */}
            <style dangerouslySetInnerHTML={{__html: `
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
            `}} />
        </StudentLayout>
    );
}
