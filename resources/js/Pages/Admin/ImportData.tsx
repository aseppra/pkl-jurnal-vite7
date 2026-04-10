import AdminLayout from '@/Layouts/AdminLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import React, { useRef, useState } from 'react';

export default function ImportData() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { props } = usePage();
    const flash = (props as any).flash;

    const { data, setData, post, processing, progress, errors, reset } = useForm<{ file: File | null }>({
        file: null,
    });

    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'xlsx' || ext === 'xls') {
            setData('file', file);
        } else {
            alert('Format file tidak didukung. Harap gunakan file .xlsx atau .xls');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.file) return;

        post(route('admin.import-data.store'), {
            onSuccess: () => reset('file'),
        });
    };

    return (
        <AdminLayout title="Import Data Master" subtitle="Upload data Siswa, DUDI, dan Pembimbing sekaligus">
            <Head title="Import Data" />

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-6 md:p-8 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 mb-1">Import Data dari Excel</h3>
                            <p className="text-sm text-slate-500 max-w-xl">
                                Gunakan fitur ini untuk memasukkan banyak data sekaligus. Download template terlebih dahulu, isi data sesuai format yang disediakan pada masing-masing sheet, lalu upload kembali file tersebut ke sini.
                            </p>
                        </div>
                        <a
                            href={route('admin.import-data.template')}
                            className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-bold transition-colors shrink-0 shadow-sm"
                        >
                            <span className="material-symbols-outlined">download</span>
                            Download Template
                        </a>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {flash?.success && (
                        <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-medium flex gap-2">
                            <span className="material-symbols-outlined text-[20px] shrink-0">check_circle</span>
                            <div>{flash.success}</div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex gap-2">
                            <span className="material-symbols-outlined text-[20px] shrink-0 whitespace-pre-line">error</span>
                            <div className="whitespace-pre-line">{flash.error}</div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Drag and drop zone */}
                        <div
                            className={`relative border-2 border-dashed rounded-2xl py-14 px-10 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' :
                                data.file ? 'border-emerald-500 bg-emerald-50/30' :
                                    'border-slate-300 hover:border-primary/50 bg-slate-50 hover:bg-slate-50/80 cursor-pointer'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => !data.file && fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".xlsx,.xls"
                                onChange={handleChange}
                                title="Pilih File Data"
                            />

                            {!data.file ? (
                                <div className="pointer-events-none mt-4">
                                    <div className="w-16 h-16 bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                                        <span className="material-symbols-outlined text-3xl">upload_file</span>
                                    </div>
                                    <h4 className="text-base font-bold text-slate-700 mb-1">Pilih atau drag file ke sini</h4>
                                    <p className="text-sm text-slate-500">Format .xlsx dan .xls (Maks. 5MB)</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    {processing && progress ? (
                                        <div className="relative w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                                                <path className="text-slate-200" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="text-primary transition-all duration-300" strokeWidth="3.5" strokeDasharray={`${progress.percentage}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <span className="absolute text-xs font-bold text-primary">{progress.percentage}%</span>
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-3xl">task</span>
                                        </div>
                                    )}
                                    <h4 className="text-base font-bold text-slate-800 mb-1">{data.file.name}</h4>
                                    <p className="text-sm text-slate-500 mb-4">{(data.file.size / 1024 / 1024).toFixed(2)} MB</p>

                                    <button
                                        type="button"
                                        disabled={processing}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            reset('file');
                                        }}
                                        className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors border border-transparent ${processing
                                            ? 'text-slate-400 cursor-not-allowed'
                                            : 'text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-100'
                                            }`}
                                    >
                                        {processing ? 'Sedang Diproses...' : 'Hapus File'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {errors.file && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-2">
                                <span className="material-symbols-outlined text-red-500 text-[20px] shrink-0">error</span>
                                {errors.file}
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-slate-200">
                            <button
                                type="submit"
                                disabled={!data.file || processing}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {processing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                                        Mengimport Data...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[20px]">cloud_upload</span>
                                        Mulai Import
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Guidelines */}
                <div className="bg-blue-50/50 p-6 md:p-8 border-t border-blue-100">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-blue-500">info</span>
                        Petunjuk Import Data
                    </h4>
                    <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
                        <li>Data yang diimport akan ditambahkan ke database.</li>
                        <li>Pastikan nama sheet tidak diubah (Siswa, DUDI, Pembimbing).</li>
                        <li>Sistem otomatis melewati data jika <b>NISN</b> (siswa), <b>Nama DUDI</b>, atau <b>NIP/NUPTK</b> (pembimbing) sudah ada.</li>
                        <li>Akun login untuk Pembimbing baru akan otomatis dibuat dengan password default <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-slate-800">12345678</code>.</li>
                        <li>Untuk data <b>Siswa</b>, info akun hanya diproses datanya saja. Silakan buat akun login (username/password) menggunakan tombol <b>Generate Semua Akun</b> di menu Data Siswa setelah import selesai.</li>
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}
