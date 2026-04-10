import AdminLayout from '@/Layouts/AdminLayout';
import Portal from '@/Components/Portal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

interface Dudi { id: number; name: string; address: string; contact_name: string; contact: string; jam_masuk: string; jam_pulang: string; siswas_count: number; }
interface Props {
    dudis: { data: Dudi[]; links: any[]; current_page: number; last_page: number; from: number; to: number; total: number; };
    allSiswas: { id: number; name: string; nisn: string; class: string; dudi_id: number | null }[];
    filters: { search?: string };
}

export default function DataDudi({ dudis, allSiswas, filters }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;
    const errors = (props as any).errors || {};

    const [editing, setEditing] = useState<any>(null);
    const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
    const [studentSearch, setStudentSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showAddDropdown, setShowAddDropdown] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const addRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => { if (addRef.current && !addRef.current.contains(e.target as Node)) setShowAddDropdown(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleSearch = (v: string) => { setSearch(v); router.get(route('admin.dudi.index'), { search: v || undefined }, { preserveState: true, replace: true }); };
    
    const handleAdd = () => { 
        setShowAddDropdown(false); 
        setEditing({ name: '', address: '', contact_name: '', contact: '', jam_masuk: '08:00', jam_pulang: '16:00' }); 
        setSelectedStudentIds([]);
        setStudentSearch('');
        setIsAdding(true); 
    };

    const handleEdit = (c: Dudi) => { 
        setIsAdding(false); 
        setEditing({ ...c }); 
        setSelectedStudentIds(allSiswas.filter(s => s.dudi_id === c.id).map(s => s.id));
        setStudentSearch('');
    };

    const handleSave = () => {
        const payload = { ...editing, student_ids: selectedStudentIds };
        if (isAdding) {
            router.post(route('admin.dudi.store'), payload, { onSuccess: () => { setEditing(null); setIsAdding(false); } });
        } else {
            router.put(route('admin.dudi.update', editing.id), payload, { onSuccess: () => setEditing(null) });
        }
    };
    
    const confirmDelete = () => { if (deletingId) router.delete(route('admin.dudi.destroy', deletingId), { onSuccess: () => setDeletingId(null) }); };

    // Checkbox logic
    const allOnPageSelected = dudis.data.length > 0 && dudis.data.every(c => selectedIds.includes(c.id));
    const toggleSelectAll = () => {
        if (allOnPageSelected) setSelectedIds(selectedIds.filter(id => !dudis.data.some(c => c.id === id)));
        else setSelectedIds([...new Set([...selectedIds, ...dudis.data.map(c => c.id)])]);
    };
    const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const handleBulkDelete = () => {
        router.post(route('admin.dudi.bulk-destroy'), { ids: selectedIds }, { onSuccess: () => { setSelectedIds([]); setShowBulkDeleteModal(false); } });
    };

    const toggleStudent = (id: number) => {
        setSelectedStudentIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const filteredStudents = allSiswas.filter(s => 
        !selectedStudentIds.includes(s.id) && 
        (s.dudi_id === null || (editing && s.dudi_id === editing.id)) &&
        (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || s.nisn.includes(studentSearch) || s.class.toLowerCase().includes(studentSearch.toLowerCase()))
    ).slice(0, 5); // show max 5 results

    const selectedStudents = allSiswas.filter(s => selectedStudentIds.includes(s.id));

    return (
        <AdminLayout title="Data DUDI" subtitle="Manajemen Data Instansi DUDI Mitra PKL">
            <Head title="Data DUDI" />

            {flash?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-sm">check_circle</span>{flash.success}
                </div>
            )}
            
            {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex gap-2 mb-4">
                    <span className="material-symbols-outlined text-[20px] shrink-0">error</span>
                    <div>
                        <p className="font-bold mb-1">Penyimpanan Gagal</p>
                        <ul className="list-disc pl-4 opacity-80">
                            {Object.values(errors).map((err: any, i) => (
                                <li key={i}>{err}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="flex justify-between">
                <div>
                    {selectedIds.length > 1 && (
                        <button onClick={() => setShowBulkDeleteModal(true)} className="flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-all shadow-md">
                            <span className="material-symbols-outlined text-sm">delete_sweep</span>
                            Hapus {selectedIds.length} DUDI
                        </button>
                    )}
                </div>
                <div className="relative" ref={addRef}>
                    <button onClick={() => setShowAddDropdown(!showAddDropdown)} className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-all shadow-md">
                        <span className="material-symbols-outlined text-sm">add</span>Tambah Data<span className="material-symbols-outlined text-sm">expand_more</span>
                    </button>
                    {showAddDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
                            <button onClick={handleAdd} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-slate-400">add_circle</span>Tambah Manual
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input title="Cari perusahaan" className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-primary" placeholder="Cari perusahaan..." value={search} onChange={(e) => handleSearch(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead><tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            <th className="px-4 py-4 w-10"><input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="rounded border-slate-300 text-primary focus:ring-primary/50 cursor-pointer" title="Pilih semua" /></th>
                            <th className="px-6 py-4">Nama Perusahaan</th><th className="px-6 py-4">Alamat</th><th className="px-6 py-4">Kontak</th><th className="px-6 py-4 text-center">Siswa Aktif</th><th className="px-6 py-4 text-right">Aksi</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {dudis.data.map((c) => (
                                <tr key={c.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(c.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} className="rounded border-slate-300 text-primary focus:ring-primary/50 cursor-pointer" title={`Pilih ${c.name}`} /></td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-900">{c.name}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{c.address}</td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-slate-800">{c.contact_name || '-'}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{c.contact || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center"><span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{c.siswas_count}</span></td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => setDeletingId(c.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {dudis.data.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">Belum ada data perusahaan.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {dudis.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">Menampilkan {dudis.from} - {dudis.to} dari {dudis.total}</span>
                        <div className="flex gap-1">{dudis.links.map((l: any, i: number) => <button key={i} title={`Halaman ${l.label.replace(/&[^;]+;/g, '').trim()}`} disabled={!l.url} onClick={() => l.url && router.get(l.url)} className={`px-3 py-1 rounded text-sm ${l.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-50`} dangerouslySetInnerHTML={{ __html: l.label }} />)}</div>
                    </div>
                )}
            </div>
            
            {editing && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setEditing(null); setIsAdding(false); }}></div>
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center shrink-0">
                            <h3 className="text-lg font-bold text-slate-800">{isAdding ? 'Tambah Perusahaan' : 'Edit Perusahaan'}</h3>
                            <button onClick={() => { setEditing(null); setIsAdding(false); }} className="text-slate-400 hover:text-slate-600 transition-colors" title="Tutup"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Kiri: Form Perusahaan */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-slate-800 border-b pb-2">Informasi DUDI</h4>
                                    <div><label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Perusahaan</label>
                                        <input id="name" title="Nama Perusahaan" type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Nama perusahaan" /></div>
                                    <div><label htmlFor="address" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Alamat</label>
                                        <textarea id="address" title="Alamat Perusahaan" value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" rows={3} /></div>
                                    <div><label htmlFor="contact_name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Kontak</label>
                                        <input id="contact_name" title="Nama Kontak Perusahaan" type="text" value={editing.contact_name || ''} onChange={(e) => setEditing({ ...editing, contact_name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Nama PIC / Kontak yang bisa dihubungi" /></div>
                                    <div><label htmlFor="contact" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nomor Telepon</label>
                                        <input id="contact" title="Kontak Perusahaan" type="text" value={editing.contact || ''} onChange={(e) => setEditing({ ...editing, contact: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="No. telepon" /></div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label htmlFor="jam_masuk" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jam Masuk</label>
                                            <input id="jam_masuk" title="Jam Masuk" type="time" value={editing.jam_masuk || '08:00'} onChange={(e) => setEditing({ ...editing, jam_masuk: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                                        <div><label htmlFor="jam_pulang" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jam Pulang</label>
                                            <input id="jam_pulang" title="Jam Pulang" type="time" value={editing.jam_pulang || '16:00'} onChange={(e) => setEditing({ ...editing, jam_pulang: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" /></div>
                                    </div>
                                </div>

                                {/* Kanan: Form Penempatan Siswa */}
                                <div className="space-y-4">
                                    <h4 className="font-bold text-sm text-slate-800 border-b pb-2 flex justify-between items-center">
                                        Penempatan Siswa PKL
                                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">{selectedStudents.length} Siswa</span>
                                    </h4>
                                    
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                        <input 
                                            type="text" 
                                            title="Cari Siswa"
                                            placeholder="Cari nama atau NISN siswa..." 
                                            value={studentSearch}
                                            onChange={(e) => setStudentSearch(e.target.value)}
                                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" 
                                        />
                                        
                                        {/* Dropdown Hasil Pencarian */}
                                        {studentSearch && filteredStudents.length > 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-lg rounded-lg z-20 overflow-hidden">
                                                {filteredStudents.map(s => (
                                                    <button 
                                                        key={s.id} 
                                                        onClick={() => { toggleStudent(s.id); setStudentSearch(''); }}
                                                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0 flex justify-between items-center"
                                                    >
                                                        <div>
                                                            <div className="font-semibold text-slate-800">{s.name}</div>
                                                            <div className="text-xs text-slate-500">{s.nisn} — {s.class}</div>
                                                        </div>
                                                        <span className="material-symbols-outlined text-primary text-sm">add_circle</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {studentSearch && filteredStudents.length === 0 && (
                                            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 shadow-lg rounded-lg z-20 p-3 text-center text-sm text-slate-500">
                                                Tidak ditemukan siswa yang cocok.
                                            </div>
                                        )}
                                    </div>

                                    {/* Daftar Siswa Terpilih */}
                                    <div className="bg-slate-50 rounded-lg border border-slate-200 p-2 min-h-[160px] max-h-[310px] overflow-y-auto space-y-1">
                                        {selectedStudents.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-8">
                                                <span className="material-symbols-outlined text-3xl mb-1">group_off</span>
                                                <span className="text-sm">Belum ada siswa ditempatkan.</span>
                                            </div>
                                        ) : (
                                            selectedStudents.map(s => (
                                                <div key={s.id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                                                    <div>
                                                        <div className="text-sm font-semibold text-slate-800">{s.name}</div>
                                                        <div className="text-xs text-slate-500">{s.class}</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => toggleStudent(s.id)}
                                                        className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                                        title="Hapus Siswa"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3 shrink-0">
                            <button onClick={() => { setEditing(null); setIsAdding(false); }} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                            <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm">Simpan</button>
                        </div>
                    </div>
                </div></Portal>
            )}

            {deletingId !== null && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-3xl">warning</span></div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data Perusahaan?</h3>
                            <p className="text-sm text-slate-500">Data yang dihapus tidak dapat dikembalikan.</p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setDeletingId(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                            <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Ya, Hapus</button>
                        </div>
                    </div>
                </div></Portal>
            )}

            {showBulkDeleteModal && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowBulkDeleteModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-3xl">delete_sweep</span></div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus {selectedIds.length} DUDI?</h3>
                            <p className="text-sm text-slate-500">Semua data perusahaan yang dipilih akan dihapus permanen.</p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setShowBulkDeleteModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                            <button onClick={handleBulkDelete} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Ya, Hapus Semua</button>
                        </div>
                    </div>
                </div></Portal>
            )}
        </AdminLayout>
    );
}
