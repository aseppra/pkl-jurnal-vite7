import PembimbingLayout from '@/Layouts/PembimbingLayout';
import { Head, Link } from '@inertiajs/react';

interface Props {
    pembimbing: any;
    dudi: any;
    totalSiswa: number;
}

export default function Dashboard({ pembimbing, dudi, totalSiswa }: Props) {
    return (
        <PembimbingLayout title="Dashboard Pembimbing" subtitle={`Selamat datang kembali, ${pembimbing.name}`}>
            <Head title="Dashboard Pembimbing" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <span className="material-symbols-outlined text-3xl">groups</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Siswa Bimbingan</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{totalSiswa} <span className="text-sm font-medium text-slate-500 normal-case tracking-normal">siswa</span></h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                        <span className="material-symbols-outlined text-3xl">business</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Perusahaan (DUDI)</p>
                        <h3 className="text-lg font-bold text-slate-900 mt-1">{dudi ? dudi.name : 'Belum Ditentukan'}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <span className="material-symbols-outlined text-3xl">fact_check</span>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Tugas Utama</p>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">Monitoring & Validasi Jurnal</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">quick_reference_all</span>
                        Aksi Cepat
                    </h3>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href={route('pembimbing.siswa')} className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-primary hover:text-white rounded-xl border border-slate-200 hover:border-transparent transition-all group shadow-sm hover:shadow-lg hover:shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-white transition-colors mb-3">supervisor_account</span>
                        <span className="font-bold text-slate-700 group-hover:text-white">Data Siswa</span>
                    </Link>
                    <Link href={route('pembimbing.presensi')} className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-primary hover:text-white rounded-xl border border-slate-200 hover:border-transparent transition-all group shadow-sm hover:shadow-lg hover:shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-white transition-colors mb-3">recent_patient</span>
                        <span className="font-bold text-slate-700 group-hover:text-white">Cek Presensi</span>
                    </Link>
                    <Link href={route('pembimbing.jurnal')} className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-primary hover:text-white rounded-xl border border-slate-200 hover:border-transparent transition-all group shadow-sm hover:shadow-lg hover:shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-white transition-colors mb-3">menu_book</span>
                        <span className="font-bold text-slate-700 group-hover:text-white">Cek Jurnal</span>
                    </Link>
                    <Link href={route('pembimbing.rekapitulasi')} className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-primary hover:text-white rounded-xl border border-slate-200 hover:border-transparent transition-all group shadow-sm hover:shadow-lg hover:shadow-primary/20">
                        <span className="material-symbols-outlined text-4xl text-slate-400 group-hover:text-white transition-colors mb-3">summarize</span>
                        <span className="font-bold text-slate-700 group-hover:text-white">Rekap Laporan</span>
                    </Link>
                </div>
            </div>
        </PembimbingLayout>
    );
}
