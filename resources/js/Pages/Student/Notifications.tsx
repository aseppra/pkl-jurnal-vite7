import StudentLayout from '@/Layouts/StudentLayout';
import { Head, router } from '@inertiajs/react';

interface NotificationItem { id: number; title: string; message: string; type: string; isNew: boolean; time: string; }
interface Props { notifications: NotificationItem[]; siswa?: { gender?: string } | null; }

export default function Notifications({ notifications, siswa }: Props) {
    const handleMarkRead = (id: number) => {
        router.patch(route('student.notifications.read', id));
    };

    const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
        info: { icon: 'info', color: 'text-blue-600', bg: 'bg-blue-100' },
        warning: { icon: 'warning', color: 'text-amber-600', bg: 'bg-amber-100' },
        success: { icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-100' },
        error: { icon: 'error', color: 'text-red-600', bg: 'bg-red-100' },
    };

    return (
        <StudentLayout title="Notifikasi" subtitle="Pemberitahu Terbaru" showBack studentGender={siswa?.gender}>
            <Head title="Notifikasi" />

            <div className="space-y-3">
                {notifications.length > 0 ? notifications.map(n => {
                    const style = iconMap[n.type] || iconMap.info;
                    return (
                        <div key={n.id} className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${n.isNew ? 'border-primary/30 bg-primary/5' : 'border-slate-200'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`size-10 rounded-full ${style.bg} ${style.color} flex items-center justify-center shrink-0`}>
                                    <span className="material-symbols-outlined">{style.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                                        {n.isNew && <span className="size-2 bg-primary rounded-full shrink-0 mt-1.5"></span>}
                                    </div>
                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed whitespace-pre-line">{n.message}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{n.time}</span>
                                        {n.isNew && (
                                            <button onClick={() => handleMarkRead(n.id)} className="text-[10px] text-primary font-bold uppercase tracking-wider hover:underline">
                                                Tandai Dibaca
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm">
                        <span className="material-symbols-outlined text-5xl text-slate-200 mb-3">notifications_off</span>
                        <h4 className="font-bold text-slate-700 mb-1">Tidak Ada Notifikasi</h4>
                        <p className="text-sm text-slate-500">Anda akan menerima pemberitahuan dari admin atau pembimbing di sini.</p>
                    </div>
                )}
            </div>
        </StudentLayout>
    );
}
