import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router } from '@inertiajs/react';

interface LogEntry {
    id: number;
    user_name: string;
    user_role: string;
    action: string;
    description: string;
    created_at: string;
}

interface Props {
    logs: {
        data: LogEntry[];
        links: any[];
        current_page: number;
        last_page: number;
        from: number;
        to: number;
        total: number;
    };
}

export default function LogAktivitas({ logs }: Props) {
    const roleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-blue-100 text-blue-700';
            case 'pembimbing': return 'bg-purple-100 text-purple-700';
            default: return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <AdminLayout title="Log Aktivitas" subtitle="Riwayat aktivitas admin dan pembimbing">
            <Head title="Log Aktivitas" />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/80">
                            <tr>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Waktu</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Pengguna</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Aksi</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {logs.data.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-16 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">history</span>
                                        <p className="text-xs text-slate-400 font-medium">Belum ada aktivitas tercatat</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.data.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">{log.created_at}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-slate-800">{log.user_name}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${roleColor(log.user_role)}`}>{log.user_role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-800">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">{log.description || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {logs.last_page > 1 && (
                    <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-xs text-slate-500">Menampilkan {logs.from} - {logs.to} dari {logs.total}</span>
                        <div className="flex gap-1">
                            {logs.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    title={`Halaman ${link.label.replace(/&[^;]+;/g, '').trim()}`}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url)}
                                    className={`px-3 py-1 rounded text-xs ${link.active ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-200'} disabled:opacity-50`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
