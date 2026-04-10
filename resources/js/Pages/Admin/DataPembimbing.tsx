import AdminLayout from '@/Layouts/AdminLayout';
import Portal from '@/Components/Portal';
import { Head, router } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

interface Pembimbing { id: number; nip: string; name: string; phone: string; department: string; dudi_id: number | null; dudi?: { id: number; name: string } | null; account_status?: string; username?: string; }
interface DudiItem { id: number; name: string; }
interface Props {
    pembimbings: { data: Pembimbing[]; links: any[]; last_page: number; from: number; to: number; total: number; };
    dudiList: DudiItem[];
    filters: { search?: string };
}

/* ==================== SEARCHABLE DUDI DROPDOWN ==================== */
function SearchableDudiDropdown({ dudiList, value, onChange }: { dudiList: DudiItem[]; value: number | ''; onChange: (v: number | '') => void }) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = dudiList.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()));
    const selected = dudiList.find(d => d.id === value);

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => { setOpen(!open); setFilter(''); }} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs text-left flex items-center justify-between bg-white">
                <span className={value !== '' ? 'text-slate-900' : 'text-slate-500'}>
                    {selected ? selected.name : '— Belum Ditentukan —'}
                </span>
                <span className="material-symbols-outlined text-sm text-slate-400">{open ? 'expand_less' : 'expand_more'}</span>
            </button>
            {open && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-30 overflow-hidden">
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input
                                type="text"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                placeholder="Ketik nama DUDI..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                        <button
                            type="button"
                            onClick={() => { onChange(''); setOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/5 transition-colors flex items-center justify-between ${value === '' ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700'}`}
                        >
                            <span className="italic">— Belum Ditentukan —</span>
                            {value === '' && <span className="material-symbols-outlined text-sm text-primary">check</span>}
                        </button>
                        {filtered.length === 0 && (
                            <div className="px-3 py-4 text-xs text-slate-400 text-center">Data DUDI tidak ditemukan</div>
                        )}
                        {filtered.map(d => (
                            <button
                                key={d.id}
                                type="button"
                                onClick={() => { onChange(d.id); setOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 text-xs hover:bg-primary/5 transition-colors flex items-center justify-between border-t border-slate-50 ${value === d.id ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700'}`}
                            >
                                <span className="truncate pr-2">{d.name}</span>
                                {value === d.id && <span className="material-symbols-outlined text-sm text-primary shrink-0">check</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DataPembimbing({ pembimbings, dudiList, filters }: Props) {
    const [editing, setEditing] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showAddDropdown, setShowAddDropdown] = useState(false);
    const [search, setSearch] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);
    const addRef = useRef<HTMLDivElement>(null);
    const genRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const h = (e: MouseEvent) => { 
            if (addRef.current && !addRef.current.contains(e.target as Node)) setShowAddDropdown(false); 
            if (genRef.current && !genRef.current.contains(e.target as Node)) setShowGenerateDropdown(false);
        };
        document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
    }, []);

    const handleSearch = (v: string) => { setSearch(v); router.get(route('admin.pembimbing.index'), { search: v || undefined }, { preserveState: true, replace: true }); };
    const handleAdd = () => { setShowAddDropdown(false); setEditing({ nip: '', name: '', phone: '', department: '', dudi_id: '' }); setIsAdding(true); };
    const handleEdit = (p: Pembimbing) => { setIsAdding(false); setEditing({ ...p, dudi_id: p.dudi_id || '' }); };
    const handleSave = () => {
        const payload = { ...editing, dudi_id: editing.dudi_id || null };
        if (isAdding) router.post(route('admin.pembimbing.store'), payload, { onSuccess: () => { setEditing(null); setIsAdding(false); } });
        else router.put(route('admin.pembimbing.update', editing.id), payload, { onSuccess: () => setEditing(null) });
    };
    const confirmDelete = () => { if (deletingId) router.delete(route('admin.pembimbing.destroy', deletingId), { onSuccess: () => setDeletingId(null) }); };

    // Checkbox logic
    const allOnPageSelected = pembimbings.data.length > 0 && pembimbings.data.every(p => selectedIds.includes(p.id));
    const toggleSelectAll = () => {
        if (allOnPageSelected) setSelectedIds(selectedIds.filter(id => !pembimbings.data.some(p => p.id === id)));
        else setSelectedIds([...new Set([...selectedIds, ...pembimbings.data.map(p => p.id)])]);
    };
    const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const handleBulkDelete = () => {
        router.post(route('admin.pembimbing.bulk-destroy'), { ids: selectedIds }, { onSuccess: () => { setSelectedIds([]); setShowBulkDeleteModal(false); } });
    };

    const handleGenerate = () => { setShowGenerateDropdown(false); router.post(route('admin.pembimbing.generate')); };
    const handleClear = () => { setShowGenerateDropdown(false); router.post(route('admin.pembimbing.clear')); };

    return (
        <AdminLayout title="Data Pembimbing" subtitle="Manajemen Data Guru Pembimbing PKL">
            <Head title="Data Pembimbing" />
            <div className="flex justify-between">
                <div>
                    {selectedIds.length > 1 && (
                        <button onClick={() => setShowBulkDeleteModal(true)} className="flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-all shadow-md">
                            <span className="material-symbols-outlined text-sm">delete_sweep</span>
                            Hapus {selectedIds.length} Pembimbing
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="relative" ref={addRef}>
                        <button onClick={() => setShowAddDropdown(!showAddDropdown)} className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-sm">add</span>Tambah Data<span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        {showAddDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
                                <button onClick={handleAdd} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-slate-400">person_add</span>Tambah Manual
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={genRef}>
                        <button onClick={() => setShowGenerateDropdown(!showGenerateDropdown)} className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-all shadow-md">
                            <span className="material-symbols-outlined text-sm">manage_accounts</span>Kelola Akun<span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        {showGenerateDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
                                <button onClick={handleGenerate} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-100">
                                    <span className="material-symbols-outlined text-sm text-emerald-500">vpn_key</span>Generate Akun
                                </button>
                                <button onClick={handleClear} className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">no_accounts</span>Clear Semua Akun
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="relative w-full md:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input title="Cari pembimbing" className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-primary" placeholder="Cari pembimbing..." value={search} onChange={(e) => handleSearch(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead><tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            <th className="px-4 py-4 w-10"><input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="rounded border-slate-300 text-primary focus:ring-primary/50 cursor-pointer" title="Pilih semua" /></th>
                            <th className="px-6 py-4">NIP</th><th className="px-6 py-4">Nama Pembimbing</th><th className="px-6 py-4">Jurusan</th><th className="px-6 py-4">Tempat PKL</th><th className="px-6 py-4">Info Login</th><th className="px-6 py-4 text-center">Status Akun</th><th className="px-6 py-4 text-right">Aksi</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-100">
                            {pembimbings.data.map((p) => (
                                <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(p.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-slate-300 text-primary focus:ring-primary/50 cursor-pointer" title={`Pilih ${p.name}`} /></td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-600">{p.nip}</td>
                                    <td className="px-6 py-4 text-xs font-semibold text-slate-900">{p.name}</td>
                                    <td className="px-6 py-4 text-xs text-slate-500">{p.department}</td>
                                    <td className="px-6 py-4 text-xs text-slate-600">
                                        {p.dudi ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                                                <span className="material-symbols-outlined text-[12px]">business</span>
                                                {p.dudi.name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Belum ditentukan</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {p.account_status === 'Generated' ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                                                    <span className="font-mono">{p.username}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">key</span>
                                                    <span className="font-mono">{p.nip}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Belum di-generate</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${p.account_status === 'Generated' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {p.account_status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(p)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit"><span className="material-symbols-outlined text-sm">edit</span></button>
                                            <button onClick={() => setDeletingId(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus"><span className="material-symbols-outlined text-sm">delete</span></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {pembimbings.data.length === 0 && <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm">Belum ada data pembimbing.</td></tr>}
                        </tbody>
                    </table>
                </div>
                {pembimbings.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-sm text-slate-500">Menampilkan {pembimbings.from} - {pembimbings.to} dari {pembimbings.total}</span>
                        <div className="flex gap-1">{pembimbings.links.map((l: any, i: number) => <button key={i} title={`Halaman ${l.label.replace(/&[^;]+;/g, '').trim()}`} disabled={!l.url} onClick={() => l.url && router.get(l.url)} className={`px-3 py-1 rounded text-sm ${l.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-50`} dangerouslySetInnerHTML={{ __html: l.label }} />)}</div>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {editing && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setEditing(null); setIsAdding(false); }}></div>
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">{isAdding ? 'Tambah Pembimbing' : 'Edit Pembimbing'}</h3>
                            <button onClick={() => { setEditing(null); setIsAdding(false); }} className="text-slate-400 hover:text-slate-600 transition-colors" title="Tutup"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><label htmlFor="nip" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">NIP</label>
                                <input id="nip" title="NIP Pembimbing" type="text" value={editing.nip} onChange={(e) => setEditing({ ...editing, nip: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Masukkan NIP" /></div>
                            <div><label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Lengkap</label>
                                <input id="name" title="Nama Lengkap Pembimbing" type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Masukkan nama" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label htmlFor="department" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jurusan</label>
                                    <input id="department" title="Jurusan Pembimbing" type="text" value={editing.department} onChange={(e) => setEditing({ ...editing, department: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Jurusan" /></div>
                                <div><label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">No. Telepon</label>
                                    <input id="phone" title="No Telepon Pembimbing" type="text" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="08xxxxxxxxxx" /></div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tempat PKL (DUDI)</label>
                                <SearchableDudiDropdown 
                                    dudiList={dudiList} 
                                    value={editing.dudi_id} 
                                    onChange={(v) => setEditing({ ...editing, dudi_id: v })} 
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3">
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
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data Pembimbing?</h3>
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
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus {selectedIds.length} Pembimbing?</h3>
                            <p className="text-sm text-slate-500">Semua data pembimbing yang dipilih akan dihapus permanen.</p>
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
