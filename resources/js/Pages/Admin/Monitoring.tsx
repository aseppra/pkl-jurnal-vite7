import AdminLayout from '@/Layouts/AdminLayout';
import Portal from '@/Components/Portal';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

interface Student {
    id: number;
    name: string;
    nisn: string;
    class: string;
    company: string;
    lastCheckin: string;
    status: string;
    statusColor: string;
    reason?: string | null;
    proofFile?: string | null;
    checkInLat?: number | null;
    checkInLng?: number | null;
    photoCheckIn?: string | null;
    photoCheckOut?: string | null;
}
interface PaginatedStudents { data: Student[]; links: any[]; last_page: number; from: number; to: number; total: number; }
interface Props { students: PaginatedStudents; allStudents: { id: number; name: string; nisn: string; class: string }[]; classes: string[]; filters: { search?: string; status?: string; class?: string }; }

export default function Monitoring({ students, allStudents, classes, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [message, setMessage] = useState('Jangan lupa untuk melakukan presensi dan mengisi jurnal harian hari ini!');
    const [recipients, setRecipients] = useState<string[]>([]);
    const [sending, setSending] = useState(false);
    const [toast, setToast] = useState(false);
    const [recipientSearch, setRecipientSearch] = useState('');
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const openModal = (nisn?: string) => { setRecipients(nisn ? [nisn] : []); setRecipientSearch(''); setShowModal(true); };
    const toggleRecipient = (nisn: string) => setRecipients(prev => prev.includes(nisn) ? prev.filter(id => id !== nisn) : [...prev, nisn]);

    const applyFilter = (key: string, val: string) => {
        router.get(route('admin.monitoring'), { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    const handleSearch = (v: string) => { setSearch(v); applyFilter('search', v); };

    const activeFilterCount = [filters.status, filters.class].filter(Boolean).length;

    const sendReminder = () => {
        setSending(true);
        router.post(route('admin.monitoring.remind'), { message, recipients: recipients.length > 0 ? recipients : null }, {
            onSuccess: () => { setSending(false); setShowModal(false); setToast(true); setTimeout(() => setToast(false), 3000); },
            onError: () => setSending(false),
        });
    };

    return (
        <AdminLayout title="Monitoring Siswa" subtitle="Pantau Lokasi dan Waktu Check-in Siswa Real-time">
            <Head title="Monitoring Siswa" />
            <div className="flex justify-end">
                <button onClick={() => openModal()} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">notifications_active</span>Kirim Pengingat Massal
                </button>
            </div>

            {toast && (
                <div className="fixed bottom-8 right-8 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50">
                    <span className="material-symbols-outlined">check_circle</span>
                    <p className="font-bold text-sm">Pengingat berhasil dikirim!</p>
                </div>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
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
                                        <button onClick={() => { router.get(route('admin.monitoring'), { search: filters.search || undefined }, { preserveState: true, replace: true }); setShowFilter(false); }} className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase">Reset</button>
                                    )}
                                </div>
                                <div className="p-3 space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Status Kehadiran</label>
                                        <select
                                            value={filters.status || ''}
                                            onChange={(e) => { applyFilter('status', e.target.value); }}
                                            title="Filter Status"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="">Semua Status</option>
                                            <option value="hadir">Hadir</option>
                                            <option value="izin">Izin</option>
                                            <option value="belum_masuk">Belum Masuk</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kelas</label>
                                        <select
                                            value={filters.class || ''}
                                            onChange={(e) => { applyFilter('class', e.target.value); }}
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
                            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Cari nama atau NISN..."
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead><tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            <th className="px-6 py-4">Nama Siswa</th><th className="px-6 py-4">NISN</th><th className="px-6 py-4">Perusahaan</th><th className="px-6 py-4">Check-in</th><th className="px-6 py-4">Lokasi</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-right">Aksi</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {students.data.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">{s.name.split(' ').map(n => n[0]).join('')}</div><p className="text-xs font-semibold">{s.name}</p></div></td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{s.nisn}</td>
                                    <td className="px-6 py-4 text-xs font-medium">{s.company}</td>
                                    <td className="px-6 py-4 text-xs font-mono font-bold text-slate-600">{s.lastCheckin}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5">
                                            {s.checkInLat && s.checkInLng ? (
                                                <a
                                                    href={`https://maps.google.com/?q=${s.checkInLat},${s.checkInLng}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
                                                    title={`${s.checkInLat}, ${s.checkInLng}`}
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                                    {s.checkInLat.toFixed(4)}, {s.checkInLng.toFixed(4)}
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                            {s.photoCheckIn && (
                                                <a href={`/storage/${s.photoCheckIn}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-500 hover:underline transition-colors" title="Lihat Selfie Masuk">
                                                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                                                    Masuk
                                                </a>
                                            )}
                                            {s.photoCheckOut && (
                                                <a href={`/storage/${s.photoCheckOut}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors" title="Lihat Selfie Pulang">
                                                    <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                                                    Pulang
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col items-center justify-center gap-1.5 min-h-[48px]">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${s.statusColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' : s.statusColor === 'orange' ? 'bg-orange-100 text-orange-800' : s.statusColor === 'red' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                                                {s.status}
                                            </span>
                                            {s.reason && <p className="text-[10px] text-slate-500 font-medium bg-slate-50 px-2 py-0.5 border border-slate-100 rounded leading-tight text-center max-w-[120px] truncate">{s.reason}</p>}
                                            {s.proofFile && (
                                                <a href={`/storage/${s.proofFile}`} target="_blank" rel="noreferrer" title="Lihat Bukti Dokumen" className="text-primary hover:bg-primary/10 rounded-full p-1 transition-colors flex items-center justify-center border border-primary/20 bg-primary/5">
                                                    <span className="material-symbols-outlined text-[12px]">attachment</span>
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openModal(s.nisn)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Kirim Pengingat">
                                            <span className="material-symbols-outlined text-lg">notifications_active</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {students.data.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm">Tidak ada data siswa.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {students.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-xs text-slate-500">Menampilkan {students.from} - {students.to} dari {students.total}</span>
                        <div className="flex gap-1">{students.links.map((l: any, i: number) => <button key={i} title={`Halaman ${l.label.replace(/&[^;]+;/g, '').trim()}`} disabled={!l.url} onClick={() => l.url && router.get(l.url)} className={`px-3 py-1 rounded text-xs ${l.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-50`} dangerouslySetInnerHTML={{ __html: l.label }} />)}</div>
                    </div>
                )}
            </div>

            {showModal && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-3">
                                <div className="size-10 bg-primary/10 text-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined">campaign</span></div>
                                <div><h3 className="text-lg font-bold text-slate-900">Kirim Pengingat Kustom</h3><p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pusat Notifikasi PKL</p></div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Isi Pesan Pengingat</label>
                                <textarea title="Isi Pesan Pengingat" placeholder="Masukkan pesan pengingat yang akan dikirim ke siswa..." value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none" rows={3} />
                            </div>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700">Pilih Penerima</label>
                                    <button onClick={() => setRecipients([])} className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${recipients.length === 0 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>Kirim ke Semua</button>
                                </div>
                                {/* Recipient Search */}
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                    <input
                                        type="text"
                                        placeholder="Cari siswa berdasarkan nama atau NISN..."
                                        value={recipientSearch}
                                        onChange={(e) => setRecipientSearch(e.target.value)}
                                        className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                                    {allStudents
                                        .filter(s =>
                                            s.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
                                            s.nisn.toLowerCase().includes(recipientSearch.toLowerCase())
                                        )
                                        .map((s) => (
                                        <div key={s.nisn} onClick={() => toggleRecipient(s.nisn)} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${recipients.includes(s.nisn) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                                            <div className={`size-5 rounded flex items-center justify-center ${recipients.includes(s.nisn) ? 'bg-primary text-white' : 'bg-white border border-slate-300'}`}>
                                                {recipients.includes(s.nisn) && <span className="material-symbols-outlined text-[14px]">check</span>}
                                            </div>
                                            <div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-900 truncate">{s.name}</p><p className="text-[10px] text-slate-500 font-medium">{s.nisn} • {s.class}</p></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                            <p className="text-[11px] text-slate-500">{recipients.length === 0 ? 'Mengirim ke semua siswa' : `Mengirim ke ${recipients.length} siswa`}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setShowModal(false)} className="px-6 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                                <button onClick={sendReminder} disabled={sending || !message.trim()} className="px-8 py-2 bg-primary text-white text-sm font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                                    {sending ? <><span className="material-symbols-outlined text-sm animate-spin">sync</span>Mengirim...</> : <><span className="material-symbols-outlined text-sm">send</span>Kirim</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div></Portal>
            )}
        </AdminLayout>
    );
}
