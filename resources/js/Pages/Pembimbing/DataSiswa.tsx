import PembimbingLayout from '@/Layouts/PembimbingLayout';
import Portal from '@/Components/Portal';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

interface Siswa { id: number; nisn: string; name: string; class: string; dudi?: { name: string }; gender: string;}
interface Props { siswas: { data: Siswa[]; links: any[]; from: number; to: number; total: number; last_page: number }; filters: { search?: string } }

interface Toast { message: string; type: 'success' | 'error'; }

export default function DataSiswa({ siswas, filters }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    const [search, setSearch] = useState(filters.search || '');
    const [notifySiswa, setNotifySiswa] = useState<Siswa | null>(null);
    const [toast, setToast] = useState<Toast | null>(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        siswa_id: '',
        title: '',
        message: '',
        type: 'info'
    });

    // Show toast when flash success comes back from server
    useEffect(() => {
        if (flash?.success) {
            setToast({ message: flash.success, type: 'success' });
            const t = setTimeout(() => setToast(null), 3500);
            return () => clearTimeout(t);
        }
    }, [flash?.success]);

    const handleSearch = (v: string) => {
        setSearch(v);
        router.get(route('pembimbing.siswa'), { search: v || undefined }, { preserveState: true, replace: true });
    };

    const openNotify = (s: Siswa) => {
        setNotifySiswa(s);
        setData({ siswa_id: s.id.toString(), title: '', message: '', type: 'info' });
    };
    const closeNotify = () => { setNotifySiswa(null); reset(); };

    const handleSendNotify = (e: any) => {
        e.preventDefault();
        post(route('pembimbing.notifikasi.send'), {
            onSuccess: () => {
                closeNotify();
            },
        });
    };

    const typeConfig: Record<string, { label: string; icon: string; active: string; inactive: string; iconColor: string }> = {
        info:    { label: 'Informasi',  icon: 'info',          active: 'border-blue-500 bg-blue-50',    inactive: 'border-slate-200 hover:border-slate-300', iconColor: 'text-blue-500'    },
        warning: { label: 'Peringatan', icon: 'warning',       active: 'border-amber-500 bg-amber-50',  inactive: 'border-slate-200 hover:border-slate-300', iconColor: 'text-amber-500'  },
        success: { label: 'Apresiasi',  icon: 'check_circle',  active: 'border-emerald-500 bg-emerald-50', inactive: 'border-slate-200 hover:border-slate-300', iconColor: 'text-emerald-500' },
        error:   { label: 'Teguran',    icon: 'error',         active: 'border-red-500 bg-red-50',      inactive: 'border-slate-200 hover:border-slate-300', iconColor: 'text-red-500'    },
    };

    return (
        <PembimbingLayout title="Data Siswa Bimbingan" subtitle="Monitor dan kelola siswa bimbingan PKL Anda">
            <Head title="Data Siswa Bimbingan" />

            {/* Toast Notification */}
            {toast && (
                <Portal>
                    <div className={`fixed top-6 right-6 z-[99999] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all animate-fade-in
                        ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                        <span className="material-symbols-outlined text-xl">
                            {toast.type === 'success' ? 'check_circle' : 'error'}
                        </span>
                        {toast.message}
                    </div>
                </Portal>
            )}

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-full max-w-md">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-colors" placeholder="Cari nama atau NISN..." value={search} onChange={(e) => handleSearch(e.target.value)} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">NISN</th>
                                <th className="px-6 py-4">Nama Siswa</th>
                                <th className="px-6 py-4">Kelas</th>
                                <th className="px-6 py-4">Perusahaan (DUDI)</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {siswas.data.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-600">{s.nisn}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-900">{s.name}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{s.class}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                                            <span className="material-symbols-outlined text-[14px]">business</span>
                                            {s.dudi?.name || '-'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => openNotify(s)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors text-xs font-bold shadow-sm">
                                            <span className="material-symbols-outlined text-sm">send</span> Beri Pesan
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {siswas.data.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Tidak ada siswa bimbingan yang ditemukan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {siswas.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">Menampilkan {siswas.from} - {siswas.to} dari {siswas.total}</span>
                        <div className="flex gap-1">
                            {siswas.links.map((link: any, i: number) => (
                                <button key={i} title={`Halaman ${link.label.replace(/&[^;]+;/g, '').trim()}`} disabled={!link.url} onClick={() => link.url && router.get(link.url)} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-50`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Kirim Notifikasi */}
            {notifySiswa && (
                <Portal>
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={!processing ? closeNotify : undefined} />
                        <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                            {/* Header */}
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">chat</span>
                                    Kirim Pesan Notifikasi
                                </h3>
                                <button onClick={closeNotify} disabled={processing} className="text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-40">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSendNotify}>
                                <div className="p-6 space-y-4">
                                    {/* Penerima */}
                                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shrink-0 shadow-sm">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penerima</p>
                                            <p className="text-sm font-bold text-slate-900">{notifySiswa.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{notifySiswa.nisn}</p>
                                        </div>
                                    </div>

                                    {/* Jenis Notifikasi */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jenis Notifikasi</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {Object.entries(typeConfig).map(([id, cfg]) => (
                                                <label key={id} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${data.type === id ? cfg.active : cfg.inactive}`}>
                                                    <input type="radio" name="type" value={id} checked={data.type === id} onChange={(e) => setData('type', e.target.value)} className="hidden" />
                                                    <span className={`material-symbols-outlined text-[20px] ${cfg.iconColor}`}>{cfg.icon}</span>
                                                    <span className={`text-sm font-bold ${data.type === id ? 'text-slate-800' : 'text-slate-500'}`}>{cfg.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Judul */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Judul Pesan</label>
                                        <input
                                            required
                                            type="text"
                                            value={data.title}
                                            onChange={e => setData('title', e.target.value)}
                                            disabled={processing}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                                            placeholder="Contoh: Pengingat Mengisi Jurnal"
                                        />
                                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                                    </div>

                                    {/* Pesan */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Isi Pesan</label>
                                        <textarea
                                            required
                                            value={data.message}
                                            onChange={e => setData('message', e.target.value)}
                                            disabled={processing}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 text-sm resize-none h-28 disabled:bg-slate-50 disabled:text-slate-400 transition-all"
                                            placeholder="Tuliskan pesan Anda di sini..."
                                        />
                                        {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 rounded-b-2xl">
                                    <button
                                        type="button"
                                        onClick={closeNotify}
                                        disabled={processing}
                                        className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all disabled:opacity-60"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-blue-700 rounded-xl transition-all disabled:opacity-70 flex items-center gap-2 min-w-[130px] justify-center"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                                </svg>
                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-[18px]">send</span>
                                                Kirim Pesan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </Portal>
            )}
        </PembimbingLayout>
    );
}
