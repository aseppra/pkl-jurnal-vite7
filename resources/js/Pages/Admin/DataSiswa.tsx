import AdminLayout from '@/Layouts/AdminLayout';
import Portal from '@/Components/Portal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';

interface Siswa {
    id: number;
    nisn: string;
    name: string;
    gender?: string;
    email?: string;
    class: string;
    account_status: string;
    username?: string;
    password_plain?: string;
    dudi?: { name: string };
}

interface KelasItem {
    id: number;
    name: string;
    description: string | null;
}

interface Props {
    siswas: {
        data: Siswa[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
    kelasList: KelasItem[];
    filters: { search?: string; class?: string };
}

export default function DataSiswa({ siswas, kelasList, filters }: Props) {
    const { props } = usePage();
    const flash = (props as any).flash;

    return (
        <AdminLayout title="Data Siswa" subtitle="Manajemen Data Siswa dan Akun Akses Jurnal">
            <Head title="Data Siswa" />

            {flash?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>{flash.success}
                </div>
            )}

            <SiswaTab siswas={siswas} filters={filters} kelasList={kelasList} />
        </AdminLayout>
    );
}

/* ==================== SEARCHABLE KELAS DROPDOWN ==================== */
function SearchableKelasDropdown({ kelasList, value, onChange }: { kelasList: KelasItem[]; value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const filtered = kelasList.filter(k =>
        k.name.toLowerCase().includes(filter.toLowerCase()) ||
        (k.description || '').toLowerCase().includes(filter.toLowerCase())
    );

    const selected = kelasList.find(k => k.name === value);

    return (
        <div className="relative" ref={ref}>
            <button type="button" onClick={() => { setOpen(!open); setFilter(''); }} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs text-left flex items-center justify-between bg-white">
                <span className={value ? 'text-slate-900' : 'text-slate-400'}>
                    {selected ? `${selected.name}${selected.description ? ` — ${selected.description}` : ''}` : 'Pilih Kelas'}
                </span>
                <span className="material-symbols-outlined text-sm text-slate-400">{open ? 'expand_less' : 'expand_more'}</span>
            </button>
            {open && (
                <div className="absolute left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-200 z-30 overflow-hidden">
                    <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                            <input
                                type="text"
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                placeholder="Cari kelas..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0 && (
                            <div className="px-3 py-3 text-sm text-slate-400 text-center">Tidak ditemukan</div>
                        )}
                        {filtered.map(k => (
                            <button
                                key={k.id}
                                type="button"
                                onClick={() => { onChange(k.name); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/5 transition-colors flex items-center justify-between ${value === k.name ? 'bg-primary/10 text-primary font-semibold' : 'text-slate-700'}`}
                            >
                                <span>{k.name}{k.description ? ` — ${k.description}` : ''}</span>
                                {value === k.name && <span className="material-symbols-outlined text-sm text-primary">check</span>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ==================== SISWA TAB ==================== */
function SiswaTab({ siswas, filters, kelasList }: { siswas: Props['siswas']; filters: Props['filters']; kelasList: KelasItem[] }) {
    const [editingSiswa, setEditingSiswa] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [showAddDropdown, setShowAddDropdown] = useState(false);
    const [showGenerateDropdown, setShowGenerateDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const addRef = useRef<HTMLDivElement>(null);
    const genRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (addRef.current && !addRef.current.contains(e.target as Node)) setShowAddDropdown(false);
            if (genRef.current && !genRef.current.contains(e.target as Node)) setShowGenerateDropdown(false);
            if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilter(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const applyFilter = (key: string, val: string) => {
        router.get(route('admin.siswa.index'), { ...filters, [key]: val || undefined }, { preserveState: true, replace: true });
    };

    const handleSearch = (val: string) => {
        setSearchQuery(val);
        applyFilter('search', val);
    };

    const activeFilterCount = [filters.class].filter(Boolean).length;

    const handleAdd = () => {
        setShowAddDropdown(false);
        setEditingSiswa({ nisn: '', name: '', gender: '', email: '', class: '' });
        setIsAdding(true);
    };

    const handleEdit = (s: Siswa) => {
        setIsAdding(false);
        setEditingSiswa(s);
    };

    const handleSave = () => {
        const payload = { nisn: editingSiswa.nisn, name: editingSiswa.name, gender: editingSiswa.gender || null, email: editingSiswa.email || null, class: editingSiswa.class };
        if (isAdding) {
            router.post(route('admin.siswa.store'), payload, { onSuccess: () => { setEditingSiswa(null); setIsAdding(false); } });
        } else {
            router.put(route('admin.siswa.update', editingSiswa.id), payload, { onSuccess: () => setEditingSiswa(null) });
        }
    };

    const confirmDelete = () => {
        if (deletingId) {
            router.delete(route('admin.siswa.destroy', deletingId), { onSuccess: () => setDeletingId(null) });
        }
    };

    const handleGenerate = () => { setShowGenerateDropdown(false); router.post(route('admin.siswa.generate')); };
    const handleClear = () => { setShowGenerateDropdown(false); router.post(route('admin.siswa.clear')); };

    // Checkbox logic
    const allOnPageSelected = siswas.data.length > 0 && siswas.data.every(s => selectedIds.includes(s.id));

    const toggleSelectAll = () => {
        if (allOnPageSelected) {
            setSelectedIds(selectedIds.filter(id => !siswas.data.some(s => s.id === id)));
        } else {
            const newIds = siswas.data.map(s => s.id);
            setSelectedIds([...new Set([...selectedIds, ...newIds])]);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleBulkDelete = () => {
        router.post(route('admin.siswa.bulk-destroy'), { ids: selectedIds }, {
            onSuccess: () => { setSelectedIds([]); setShowBulkDeleteModal(false); },
        });
    };

    return (
        <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    {selectedIds.length > 1 && (
                        <button onClick={() => setShowBulkDeleteModal(true)} className="flex items-center gap-2 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700 transition-all shadow-md">
                            <span className="material-symbols-outlined text-sm">delete_sweep</span>
                            Hapus {selectedIds.length} Siswa
                        </button>
                    )}
                </div>
                <div className="flex gap-2">
                    <div className="relative" ref={addRef}>
                        <button onClick={() => setShowAddDropdown(!showAddDropdown)} className="flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-sm">add</span>
                            Tambah Data
                            <span className="material-symbols-outlined text-sm">expand_more</span>
                        </button>
                        {showAddDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 overflow-hidden">
                                <button onClick={handleAdd} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-slate-400">person_add</span>
                                    Tambah Manual
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={genRef}>
                        <button onClick={() => setShowGenerateDropdown(!showGenerateDropdown)} className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-all shadow-md">
                            <span className="material-symbols-outlined text-sm">manage_accounts</span>
                            Kelola Akun
                            <span className="material-symbols-outlined text-sm">expand_more</span>
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
                                        <button onClick={() => { applyFilter('class', ''); setShowFilter(false); }} className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase">Reset</button>
                                    )}
                                </div>
                                <div className="p-3 space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Kelas</label>
                                        <select
                                            value={filters.class || ''}
                                            onChange={(e) => { applyFilter('class', e.target.value); }}
                                            title="Filter Kelas"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="">Semua Kelas</option>
                                            {kelasList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-sm">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                        <input className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-colors" placeholder="Cari nama atau NISN..." value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                                <th className="px-4 py-4 w-10">
                                    <input type="checkbox" checked={allOnPageSelected} onChange={toggleSelectAll} className="rounded border-slate-300 text-primary focus:ring-primary/50 cursor-pointer" title="Pilih semua" />
                                </th>
                                <th className="px-4 py-4">NISN</th>
                                <th className="px-4 py-4">Nama Siswa</th>
                                <th className="px-4 py-4">Kelas</th>
                                <th className="px-4 py-4">Info Login</th>
                                <th className="px-4 py-4 text-center">Status Akun</th>
                                <th className="px-4 py-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {siswas.data.map((s) => (
                                <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${selectedIds.includes(s.id) ? 'bg-primary/5' : ''}`}>
                                    <td className="px-4 py-4">
                                        <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={() => toggleSelect(s.id)} className="rounded border-slate-300 text-primary focus:ring-primary/50 cursor-pointer" title={`Pilih ${s.name}`} />
                                    </td>
                                    <td className="px-4 py-4 text-xs font-mono text-slate-600">{s.nisn}</td>
                                    <td className="px-4 py-4">
                                        <div className="text-xs font-semibold text-slate-900">{s.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {s.gender && <span className="text-xs text-slate-500">{s.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>}
                                            {s.gender && s.email && <span className="text-slate-300">·</span>}
                                            {s.email && <span className="text-xs text-slate-400">{s.email}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-xs text-slate-500">{s.class}</td>
                                    <td className="px-4 py-4">
                                        {s.account_status === 'Generated' ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                                                    <span className="font-mono">{s.username}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-slate-600">
                                                    <span className="material-symbols-outlined text-[14px] text-slate-400">key</span>
                                                    <span className="font-mono">{s.password_plain}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Belum di-generate</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${s.account_status === 'Generated' ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {s.account_status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleEdit(s)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Edit">
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button onClick={() => setDeletingId(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Hapus">
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {siswas.data.length === 0 && (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500 text-sm">Belum ada data siswa.</td></tr>
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

            {/* Add/Edit Modal */}
            {editingSiswa && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => { setEditingSiswa(null); setIsAdding(false); }} />
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-800">{isAdding ? 'Tambah Data Siswa' : 'Edit Data Siswa'}</h3>
                            <button onClick={() => { setEditingSiswa(null); setIsAdding(false); }} className="text-slate-400 hover:text-slate-600 transition-colors" title="Tutup">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">NISN</label>
                                <input type="text" value={editingSiswa.nisn} onChange={(e) => setEditingSiswa({ ...editingSiswa, nisn: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Masukkan NISN" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Siswa</label>
                                <input type="text" value={editingSiswa.name} onChange={(e) => setEditingSiswa({ ...editingSiswa, name: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Masukkan nama" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Jenis Kelamin</label>
                                    <select value={editingSiswa.gender || ''} onChange={(e) => setEditingSiswa({ ...editingSiswa, gender: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" title="Pilih Jenis Kelamin">
                                        <option value="">Pilih</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
                                    <input type="email" value={editingSiswa.email || ''} onChange={(e) => setEditingSiswa({ ...editingSiswa, email: e.target.value })} className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="email@siswa.id" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Kelas</label>
                                <SearchableKelasDropdown kelasList={kelasList} value={editingSiswa.class} onChange={(v) => setEditingSiswa({ ...editingSiswa, class: v })} />
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => { setEditingSiswa(null); setIsAdding(false); }} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                            <button onClick={handleSave} className="px-5 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors shadow-sm">Simpan</button>
                        </div>
                    </div>
                </div></Portal>
            )}

            {/* Delete Modal */}
            {deletingId !== null && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeletingId(null)}></div>
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">warning</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus Data Siswa?</h3>
                            <p className="text-sm text-slate-500">Data siswa yang dihapus tidak dapat dikembalikan.</p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setDeletingId(null)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                            <button onClick={confirmDelete} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Ya, Hapus</button>
                        </div>
                    </div>
                </div></Portal>
            )}

            {/* Bulk Delete Modal */}
            {showBulkDeleteModal && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowBulkDeleteModal(false)}></div>
                    <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">delete_sweep</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Hapus {selectedIds.length} Siswa?</h3>
                            <p className="text-sm text-slate-500">Semua data siswa yang dipilih akan dihapus permanen beserta akun terkait.</p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 rounded-b-2xl flex justify-end gap-3">
                            <button onClick={() => setShowBulkDeleteModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">Batal</button>
                            <button onClick={handleBulkDelete} className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Ya, Hapus Semua</button>
                        </div>
                    </div>
                </div></Portal>
            )}
        </>
    );
}
