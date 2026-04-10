import PembimbingLayout from '@/Layouts/PembimbingLayout';
import Modal from '@/Components/Modal';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Journal { id: number; date: string; title: string; description: string; image_path: string | null; status: string | null; siswa: { name: string; nisn: string; dudi?: { name: string } }; }
interface Props { journals: { data: Journal[]; links: any[]; from: number; to: number; total: number; last_page: number }; filters: { search?: string; date?: string } }

export default function Jurnal({ journals, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [selectedJournal, setSelectedJournal] = useState<Journal | null>(null);

    const applyFilters = (s: string, d: string) => {
        router.get(route('pembimbing.jurnal'), { search: s || undefined, date: d || undefined }, { preserveState: true, replace: true });
    };

    return (
        <PembimbingLayout title="Monitoring Jurnal PKL" subtitle="Memonitor laporan kegiatan harian siswa bimbingan">
            <Head title="Jurnal Siswa Bimbingan" />

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
                                <th className="px-6 py-4">Tanggal & Waktu</th>
                                <th className="px-6 py-4">Deskripsi Kegiatan</th>
                                <th className="px-6 py-4 text-center">Dokumentasi</th>
                                <th className="px-6 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {journals.data.map(j => (
                                <tr key={j.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-slate-900">{j.siswa.name}</div>
                                        <div className="text-xs text-slate-500 font-mono mt-0.5">{j.siswa.nisn}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded inline-block mb-1">{new Date(j.date).toLocaleDateString('id-ID')}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-700 line-clamp-2 max-w-md font-semibold">{j.title}</div>
                                        <div className="text-xs text-slate-500 line-clamp-1 max-w-md mt-0.5">{j.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {j.image_path ? (
                                            <button onClick={() => setSelectedJournal(j)} className="inline-flex size-9 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-lg items-center justify-center transition-all group relative">
                                                <span className="material-symbols-outlined text-xl">image</span>
                                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Lihat Foto</span>
                                            </button>
                                        ) : <span className="text-xs text-slate-400 italic">Tidak ada</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setSelectedJournal(j)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-primary hover:text-white rounded-lg transition-colors text-xs font-bold">
                                            <span className="material-symbols-outlined text-[14px]">visibility</span> Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {journals.data.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Tidak ada data jurnal.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {journals.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">Menampilkan {journals.from} - {journals.to} dari {journals.total}</span>
                        <div className="flex gap-1">
                            {journals.links.map((link: any, i: number) => (
                                <button key={i} title={`Halaman ${link.label.replace(/&[^;]+;/g, '').trim()}`} disabled={!link.url} onClick={() => link.url && router.get(link.url)} className={`px-3 py-1 rounded text-sm ${link.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-50`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Detail & Gambar */}
            <Modal show={!!selectedJournal} onClose={() => setSelectedJournal(null)} maxWidth="2xl">
                {selectedJournal && (
                    <div className="p-0">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">book</span>
                                Detail Jurnal Kegiatan
                            </h3>
                            <button onClick={() => setSelectedJournal(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6">
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mb-6 flex items-center gap-4">
                                <div className="size-12 rounded-full bg-white flex items-center justify-center text-primary border border-primary/10 shadow-sm">
                                    <span className="material-symbols-outlined text-2xl">person</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{selectedJournal.siswa.name}</h4>
                                    <p className="text-xs text-slate-500">NISN: {selectedJournal.siswa.nisn}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Tanggal Kegiatan</span>
                                    <p className="font-medium text-slate-900">{new Date(selectedJournal.date).toLocaleDateString('id-ID', {weekday:'long', year:'numeric', month:'long', day:'numeric'})}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Status</span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${selectedJournal.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {selectedJournal.status ?? 'Belum Diverifikasi'}
                                    </span>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1">Judul Kegiatan</span>
                                    <p className="font-bold text-slate-900">{selectedJournal.title}</p>
                                </div>
                                <div className="md:col-span-2 text-justify">
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Deskripsi Kegiatan</span>
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm whitespace-pre-line leading-relaxed">
                                        {selectedJournal.description}
                                    </div>
                                </div>
                            </div>
                            
                            {selectedJournal.image_path && (
                                <div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Dokumentasi</span>
                                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center aspect-video relative group">
                                        <img src={`/storage/${selectedJournal.image_path}`} alt="Dokumentasi" className="w-full h-full object-contain" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </PembimbingLayout>
    );
}
