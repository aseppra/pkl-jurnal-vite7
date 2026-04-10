import PembimbingLayout from '@/Layouts/PembimbingLayout';
import { Head, router } from '@inertiajs/react';

interface Props {
    pembimbing: {
        name: string;
        nip: string;
        department: string | null;
        phone: string | null;
        dudi: { name: string; address: string | null; contact_name: string | null; contact: string | null } | null;
    };
    user: {
        username: string;
        email: string | null;
    };
}

function InfoRow({ icon, label, value, mono = false }: { icon: string; label: string; value: string | null | undefined; mono?: boolean }) {
    return (
        <div className="flex items-start gap-4 py-4 border-b border-slate-100 last:border-0">
            <div className="size-9 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-primary text-[18px]">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''} ${!value ? 'text-slate-400 italic' : ''}`}>
                    {value || 'Belum diisi'}
                </p>
            </div>
        </div>
    );
}

export default function Profile({ pembimbing, user }: Props) {
    const initials = pembimbing.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <PembimbingLayout title="Profil Saya" subtitle="Informasi akun dan data pembimbing">
            <Head title="Profil Pembimbing" />

            <div className="max-w-2xl mx-auto space-y-6">

                {/* ── Hero Card ── */}
                <div className="relative bg-gradient-to-br from-primary via-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 overflow-hidden text-white shadow-xl shadow-primary/30">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 size-40 bg-white/10 rounded-full" />
                    <div className="absolute -bottom-8 -left-8 size-32 bg-white/10 rounded-full" />
                    <div className="absolute top-1/2 right-1/4 size-20 bg-white/5 rounded-full" />

                    <div className="relative z-10 flex items-center gap-5">
                        {/* Avatar */}
                        <div className="size-20 md:size-24 rounded-full bg-white/20 border-2 border-white/30 overflow-hidden shadow-lg shrink-0 backdrop-blur-sm">
                            <img
                                src="/images/admin_user_man.png"
                                alt="Avatar"
                                className="w-full h-full object-cover scale-110"
                            />
                        </div>
                        {/* Name & Role */}
                        <div className="min-w-0">
                            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-2">
                                <span className="material-symbols-outlined text-[12px]">verified</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest">Guru Pembimbing PKL</span>
                            </div>
                            <h2 className="text-xl md:text-2xl font-extrabold leading-tight">{pembimbing.name}</h2>
                            <p className="text-blue-200 text-sm font-mono mt-1">{pembimbing.nip}</p>
                        </div>
                    </div>
                </div>

                {/* ── Data Pribadi ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="size-8 bg-blue-50 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Data Pribadi</h3>
                    </div>
                    <div className="px-6">
                        <InfoRow icon="badge" label="Nama Lengkap" value={pembimbing.name} />
                        <InfoRow icon="fingerprint" label="NIP" value={pembimbing.nip} mono />
                        <InfoRow icon="school" label="Mapel / Bidang Keahlian" value={pembimbing.department} />
                        <InfoRow icon="call" label="No. Telepon / HP" value={pembimbing.phone} mono />
                    </div>
                </div>

                {/* ── Akun Login ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="size-8 bg-violet-50 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-violet-500 text-[18px]">manage_accounts</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Informasi Akun</h3>
                    </div>
                    <div className="px-6">
                        <InfoRow icon="account_circle" label="Username Login" value={user.username} mono />
                        <InfoRow icon="key" label="Password" value="••••••••••••" />
                    </div>
                </div>

                {/* ── DUDI / Perusahaan ── */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                        <div className="size-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-emerald-500 text-[18px]">business</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">DUDI / Tempat PKL</h3>
                    </div>
                    <div className="px-6">
                        {pembimbing.dudi ? (
                            <>
                                <InfoRow icon="factory" label="Nama Perusahaan" value={pembimbing.dudi.name} />
                                <InfoRow icon="location_on" label="Alamat" value={pembimbing.dudi.address} />
                                <InfoRow icon="person" label="Nama Kontak DUDI" value={pembimbing.dudi.contact_name} />
                                <InfoRow icon="contact_phone" label="Kontak DUDI" value={pembimbing.dudi.contact} mono />
                            </>
                        ) : (
                            <div className="py-8 flex flex-col items-center gap-3 text-center">
                                <div className="size-14 bg-amber-50 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-amber-400 text-2xl">business_center</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Belum Di-assign ke DUDI</p>
                                    <p className="text-xs text-slate-400 mt-1">Hubungi Admin untuk konfigurasi penempatan PKL</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Logout Button ── */}
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
                    <button
                        onClick={() => router.post(route('logout'))}
                        className="w-full flex items-center justify-between px-6 py-5 text-red-600 hover:bg-red-50 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-10 bg-red-50 group-hover:bg-red-100 rounded-xl flex items-center justify-center transition-colors">
                                <span className="material-symbols-outlined text-red-500 text-xl">logout</span>
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-bold text-red-700">Keluar dari Akun</p>
                                <p className="text-xs text-red-400">Sesi login akan diakhiri</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-red-400 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                </div>

                {/* Bottom spacing for mobile bottom nav */}
                <div className="h-4" />
            </div>
        </PembimbingLayout>
    );
}
