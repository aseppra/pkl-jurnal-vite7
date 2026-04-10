import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';

interface Props {
    user: { name: string; username: string; email: string; phone: string; avatar: string | null };
    siswa: {
        nisn: string; name: string; gender?: string; email?: string; class: string;
        pkl_start: string; pkl_end: string;
        dudi?: { name: string; address?: string; contact_name?: string | null; contact?: string } | null;
        pembimbing?: { name: string; nip: string; phone: string; department?: string; dudi?: { name: string } | null } | null;
    } | null;
    periodePkl: { start: string | null; end: string | null };
}

function formatDate(d: string | null | undefined) {
    if (!d) return '-';
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Profile({ user, siswa, periodePkl }: Props) {
    const pklStart = siswa?.pkl_start || periodePkl?.start;
    const pklEnd = siswa?.pkl_end || periodePkl?.end;

    return (
        <StudentLayout title="Profil Akun" subtitle="Informasi Data Diri" showNotificationBell studentGender={siswa?.gender}>
            <Head title="Profil" />

            {/* Profile Card */}
            <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="flex items-center gap-4 relative z-10">
                    <div className="size-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold border-4 border-white/30 overflow-hidden">
                        <img src={siswa?.gender === 'P' ? '/images/girl-avatar.png' : siswa?.gender === 'L' ? '/images/boy-avatar.png' : '/images/default-avatar.png'} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.name}&background=random`; }} alt="Avatar" className="w-full h-full object-cover scale-125" />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold">{user.name}</h4>
                        <p className="text-blue-200 text-sm">{siswa?.class || '-'}</p>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-blue-100 text-xs flex items-center gap-1">
                                <span className="material-symbols-outlined text-xs">badge</span>NISN: {siswa?.nisn || '-'}
                            </p>
                            {siswa?.gender && (
                                <p className="text-blue-100 text-xs flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">{siswa.gender === 'L' ? 'male' : 'female'}</span>
                                    {siswa.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Sections */}
            <div className="space-y-4">

                {/* Data Pribadi */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">person</span>Data Pribadi
                        </h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            { label: 'Nama Lengkap', value: siswa?.name || user.name },
                            { label: 'NISN', value: siswa?.nisn || '-' },
                            { label: 'Jenis Kelamin', value: siswa?.gender ? (siswa.gender === 'L' ? 'Laki-laki' : 'Perempuan') : '-' },
                            { label: 'Kelas', value: siswa?.class || '-' },
                            { label: 'Username', value: user.username },
                            { label: 'Email', value: siswa?.email || user.email || '-' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between px-4 py-3">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{item.label}</span>
                                <span className="text-sm font-semibold text-slate-900 text-right max-w-[60%] break-words">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Informasi PKL */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">business</span>Informasi PKL
                        </h4>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Perusahaan</span>
                            <span className="text-sm font-semibold text-slate-900 text-right max-w-[60%]">{siswa?.dudi?.name || '-'}</span>
                        </div>
                        {siswa?.dudi?.address && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Alamat</span>
                                <span className="text-sm font-semibold text-slate-900 text-right max-w-[60%] break-words">{siswa.dudi.address}</span>
                            </div>
                        )}
                        {siswa?.dudi?.contact_name && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Nama Kontak DUDI</span>
                                <span className="text-sm font-semibold text-slate-900 text-right max-w-[60%]">{siswa.dudi.contact_name}</span>
                            </div>
                        )}
                        {siswa?.dudi?.contact && (
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">No. Kontak DUDI</span>
                                <span className="text-sm font-semibold text-slate-900 text-right">{siswa.dudi.contact}</span>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Periode Mulai</span>
                            <span className="text-sm font-semibold text-slate-900">{formatDate(pklStart)}</span>
                        </div>
                        <div className="flex items-center justify-between px-4 py-3">
                            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Periode Selesai</span>
                            <span className="text-sm font-semibold text-slate-900">{formatDate(pklEnd)}</span>
                        </div>
                    </div>
                </div>

                {/* Guru Pembimbing */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">supervisor_account</span>Guru Pembimbing
                        </h4>
                    </div>
                    {siswa?.pembimbing ? (
                        <div className="divide-y divide-slate-100">
                            {[
                                { label: 'Nama', value: siswa.pembimbing.name },
                                { label: 'Jurusan/Mapel', value: siswa.pembimbing.department || '-' },
                                { label: 'Telepon', value: siswa.pembimbing.phone || '-' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3">
                                    <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{item.label}</span>
                                    <span className="text-sm font-semibold text-slate-900 text-right max-w-[60%] break-words">{item.value}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-slate-400">
                            <span className="material-symbols-outlined text-3xl mb-1 block">person_off</span>
                            <p className="text-sm">Belum ada pembimbing yang ditugaskan.</p>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="w-full flex justify-center items-center gap-2 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Keluar Aplikasi
                    </button>
                </div>
            </div>
        </StudentLayout>
    );
}
