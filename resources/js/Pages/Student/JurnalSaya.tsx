import StudentLayout from '@/Layouts/StudentLayout';
import Portal from '@/Components/Portal';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

interface Journal { id: number; date: string; raw_date: string; title: string; description: string; status: string; image_path: string | null; }
interface Props { journals: Journal[]; filters: { filter?: string }; siswa?: { gender?: string } | null; }

export default function JurnalSaya({ journals, filters, siswa }: Props) {
    const [showForm, setShowForm] = useState(false);
    const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { props } = usePage();
    const flash = (props as any).flash;

    const { data, setData, post, processing, reset, errors } = useForm({
        date: '',
        title: '',
        description: '',
        image: null as File | null,
        _method: '' as string,
    });

    const isEditing = editingJournal !== null;

    const openCreateForm = () => {
        setEditingJournal(null);
        reset();
        setData('date', new Date().toISOString().split('T')[0]);
        setShowForm(true);
    };

    const handleEdit = (journal: Journal) => {
        setEditingJournal(journal);
        setData({ 
            date: journal.raw_date,
            title: journal.title, 
            description: journal.description, 
            image: null, 
            _method: 'PUT' 
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingJournal(null);
        reset();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            post(route('student.journal.update', editingJournal!.id), {
                forceFormData: true,
                onSuccess: () => { reset(); setShowForm(false); setEditingJournal(null); },
            });
        } else {
            post(route('student.journal.store'), {
                forceFormData: true,
                onSuccess: () => { reset(); setShowForm(false); },
            });
        }
    };

    return (
        <StudentLayout title="Jurnal Saya" subtitle="Catatan Kegiatan Harian PKL" showNotificationBell studentGender={siswa?.gender}>
            <Head title="Jurnal Saya" />

            {flash?.success && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">check_circle</span>{flash.success}
                </div>
            )}
            {flash?.error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">error</span>{flash.error}
                </div>
            )}

            {/* Filter + Add Button */}
            <div className="flex items-center gap-2 min-w-0">
                {/* Mobile: compact dropdown */}
                <div className="relative flex-1 min-w-0 sm:hidden">
                    <select
                        title="Filter Jurnal"
                        value={filters.filter || 'all'}
                        onChange={e => router.get(route('student.journal'), { filter: e.target.value === 'all' ? undefined : e.target.value }, { preserveState: true })}
                        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary pr-10 shadow-sm cursor-pointer"
                    >
                        <option value="all">Semua Jurnal</option>
                        <option value="harian">Harian</option>
                        <option value="mingguan">Mingguan</option>
                        <option value="bulanan">Bulanan</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>

                {/* Desktop: pill tabs */}
                <div className="hidden sm:flex gap-2 flex-1">
                    {['all', 'harian', 'mingguan', 'bulanan'].map(f => (
                        <button key={f} onClick={() => router.get(route('student.journal'), { filter: f === 'all' ? undefined : f }, { preserveState: true })} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${(filters.filter || 'all') === f || (!filters.filter && f === 'all') ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                            {f === 'all' ? 'Semua' : f === 'harian' ? 'Harian' : f === 'mingguan' ? 'Mingguan' : 'Bulanan'}
                        </button>
                    ))}
                </div>

                {/* Mobile: icon-only button */}
                <button onClick={() => showForm ? handleCloseForm() : openCreateForm()} className="sm:hidden shrink-0 size-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-md hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-[20px]">{showForm ? 'close' : 'add'}</span>
                </button>

                {/* Desktop: full button */}
                <button onClick={() => showForm ? handleCloseForm() : openCreateForm()} className="hidden sm:flex shrink-0 items-center gap-1.5 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-md hover:bg-primary/90 transition-all">
                    <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add'}</span>
                    {showForm ? 'Tutup' : 'Tulis Jurnal'}
                </button>
            </div>

            {/* Journal Form (Create / Edit) */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[20px]">{isEditing ? 'edit' : 'edit_note'}</span>
                            {isEditing ? 'Edit Jurnal' : 'Jurnal Baru'}
                        </h4>
                        {isEditing && (
                            <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                                Mengedit: {editingJournal!.date}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tanggal Kegiatan</label>
                            <input 
                                type="date" 
                                value={data.date} 
                                onChange={e => setData('date', e.target.value)} 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" 
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Judul Kegiatan</label>
                            <input type="text" value={data.title} onChange={e => setData('title', e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Contoh: Membuat desain halaman login" />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Deskripsi Kegiatan</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Deskripsikan apa yang kamu kerjakan hari ini..." />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>
                    <div>
                        <label htmlFor="journal-image" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                            Foto Dokumentasi {isEditing ? '(kosongkan jika tidak ingin mengganti)' : '(opsional)'}
                        </label>
                        {isEditing && editingJournal!.image_path && (
                            <div className="mb-2 flex items-center gap-2 p-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                                <span className="material-symbols-outlined text-sm text-indigo-500">photo</span>
                                <span className="text-xs text-indigo-600 font-medium">Pilih foto baru untuk mengganti.</span>
                            </div>
                        )}
                        <input id="journal-image" title="Foto Dokumentasi Jurnal" type="file" accept="image/*" onChange={e => setData('image', e.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                        <p className="text-[10px] text-slate-400 mt-1">Maks. 10MB (JPG, PNG, JPEG)</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-1">
                        <button type="button" onClick={handleCloseForm} className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                            Batal
                        </button>
                        <button type="submit" disabled={processing} className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                            {processing ? (isEditing ? 'Menyimpan...' : 'Mengirim...') : (isEditing ? 'Simpan Perubahan' : 'Kirim Jurnal')}
                            {!processing && <span className="material-symbols-outlined text-sm">{isEditing ? 'save' : 'send'}</span>}
                        </button>
                    </div>
                </form>
            )}

            {/* Journal List */}
            <div className="space-y-3">
                {journals.length > 0 ? journals.map(j => (
                    <div key={j.id} className={`bg-white rounded-xl border p-4 shadow-sm hover:shadow-md transition-all ${editingJournal?.id === j.id ? 'border-primary/50 ring-2 ring-primary/10' : 'border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 break-words mb-1">{j.title}</h4>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[11px]">calendar_today</span>{j.date}
                                </p>
                                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed break-words">{j.description}</p>
                            </div>

                            {/* Action Icon Buttons */}
                            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                                {j.image_path && (
                                    <button
                                        title="Lihat Foto Dokumentasi"
                                        onClick={() => setPreviewImage(`/storage/${j.image_path}`)}
                                        className="size-8 flex items-center justify-center rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors border border-indigo-200"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                                    </button>
                                )}
                                <button
                                    title="Edit Jurnal"
                                    onClick={() => handleEdit(j)}
                                    className={`size-8 flex items-center justify-center rounded-lg transition-colors border ${editingJournal?.id === j.id ? 'bg-primary text-white border-primary shadow-sm' : 'bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
                        <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">menu_book</span>
                        <h4 className="font-bold text-slate-700 mb-1">Belum Ada Jurnal</h4>
                        <p className="text-sm text-slate-500">Mulai catat kegiatan PKL hari ini!</p>
                    </div>
                )}
            </div>

            {/* Photo Preview Modal */}
            {previewImage && (
                <Portal><div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
                    <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-3 -right-3 z-10 size-8 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-red-500 transition-colors border border-slate-200"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                        <img src={previewImage} alt="Dokumentasi" className="w-full rounded-2xl shadow-2xl border-4 border-white" />
                    </div>
                </div></Portal>
            )}
        </StudentLayout>
    );
}
