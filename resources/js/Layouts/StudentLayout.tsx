import { Link, usePage, router } from '@inertiajs/react';
import React, { PropsWithChildren, useState, useEffect } from 'react';
import Portal from '@/Components/Portal';
import axios from 'axios';

interface NotificationItem { id: number; title: string; message: string; type: string; isNew: boolean; time: string; }

interface SidebarItemProps {
    icon: string;
    label: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
    variant?: 'default' | 'danger';
}

function SidebarItem({ icon, label, href, active, onClick, variant = 'default' }: SidebarItemProps) {
    if (variant === 'danger') {
        return (
            <button onClick={onClick} className="flex w-full items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <span className="material-symbols-outlined text-lg">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
            </button>
        );
    }

    const cls = `flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-primary text-white font-medium' : 'text-slate-600 hover:bg-slate-100'}`;
    const iconCls = `material-symbols-outlined text-lg ${active ? 'text-white' : 'text-slate-400'}`;

    if (href) {
        return <Link href={href} className={cls}><span className={iconCls}>{icon}</span><span className="text-sm font-medium">{label}</span></Link>;
    }
    return <div onClick={onClick} className={cls}><span className={iconCls}>{icon}</span><span className="text-sm font-medium">{label}</span></div>;
}

function BottomNav({ unreadCount }: { unreadCount: number }) {
    const { url } = usePage();
    const items = [
        { label: 'Home', icon: 'grid_view', path: '/dashboard' },
        { label: 'Jurnal', icon: 'menu_book', path: '/jurnal-saya' },
        { label: 'Rekap', icon: 'summarize', path: '/rekapitulasi' },
        { label: 'Profil', icon: 'person', path: '/profile' },
    ];

    return (
        <React.Fragment>
            <div className="md:hidden h-28 w-full shrink-0"></div>
            <div className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden pointer-events-none p-4 pb-[calc(16px+env(safe-area-inset-bottom))] flex justify-center">
                <nav className="bg-white/70 backdrop-blur-md border border-white/50 rounded-[28px] px-2 py-2 flex justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto w-full max-w-[360px]">
                    {items.map((item) => {
                        const isActive = url.startsWith(item.path);
                        return (
                            <Link key={item.path} href={item.path} className={`relative flex flex-col items-center justify-between w-16 h-14 pt-1 transition-all duration-300 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}>
                                {/* Top Active Indicator */}
                                {isActive && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-md"></span>
                                )}

                                {/* Icon Container */}
                                <div className={`flex items-center justify-center w-12 h-8 rounded-[14px] transition-all duration-300 ${isActive ? 'bg-primary/10' : 'bg-transparent hover:bg-slate-100/50'}`}>
                                    <span className={`material-symbols-outlined text-[24px] ${isActive ? 'fill-[1]' : ''}`} style={isActive ? {fontVariationSettings: "'FILL' 1"} : {}}>
                                        {item.icon}
                                    </span>
                                </div>

                                {/* Notification Badge */}
                                {item.path === '/dashboard' && unreadCount > 0 && (
                                    <span className={`absolute top-0 right-1 min-w-[16px] h-[16px] flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 border border-white shadow-sm transition-all`}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}

                                {/* Text */}
                                <span className="text-[9px] uppercase font-bold tracking-wider mt-1">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </React.Fragment>
    );
}

export default function StudentLayout({ children, title, subtitle, showBack, showNotificationBell, studentGender }: PropsWithChildren<{ title: string; subtitle?: string; showBack?: boolean; showNotificationBell?: boolean; studentGender?: string }>) {
    const { url, props } = usePage();
    const user = (props as any).auth?.user;

    const initialUnreadCount = (props as any).unreadNotificationCount || 0;
    const [localUnreadCount, setLocalUnreadCount] = useState<number>(initialUnreadCount);

    useEffect(() => {
        setLocalUnreadCount((props as any).unreadNotificationCount || 0);
    }, [(props as any).unreadNotificationCount]);

    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

    const fetchNotifications = async () => {
        setIsLoadingNotifications(true);
        try {
            const res = await axios.get(route('student.notifications'), { headers: { Accept: 'application/json' } });
            setNotifications(res.data.notifications || []);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoadingNotifications(false);
        }
    };

    useEffect(() => {
        if (isNotificationOpen) {
            fetchNotifications();
        }
    }, [isNotificationOpen]);

    const handleMarkRead = async (id: number) => {
        try {
            await axios.patch(route('student.notifications.read', id), {}, { headers: { Accept: 'application/json' } });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
            setLocalUnreadCount((prev: number) => Math.max(0, prev - 1));
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
        info: { icon: 'info', color: 'text-blue-600', bg: 'bg-blue-100' },
        warning: { icon: 'warning', color: 'text-amber-600', bg: 'bg-amber-100' },
        success: { icon: 'check_circle', color: 'text-emerald-600', bg: 'bg-emerald-100' },
        error: { icon: 'error', color: 'text-red-600', bg: 'bg-red-100' },
    };

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3 border-b border-slate-200">
                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">menu_book</span>
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-primary">Jurnal PKL</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem icon="dashboard" label="Dashboard" href={route('student.dashboard')} active={url === '/dashboard'} />
                    <SidebarItem icon="history_edu" label="Jurnal Saya" href={route('student.journal')} active={url === '/jurnal-saya'} />
                    <SidebarItem icon="summarize" label="Rekapitulasi" href={route('student.rekapitulasi')} active={url.startsWith('/rekapitulasi')} />
                    <SidebarItem icon="person" label="Profil Akun" href={route('student.profile')} active={url === '/profile'} />
                </nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 p-2">
                        <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                            <img alt={user?.name} className="w-full h-full object-cover scale-125" src={studentGender === 'P' ? '/images/girl-avatar.png' : studentGender === 'L' ? '/images/boy-avatar.png' : '/images/default-avatar.png'} onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${user?.name || 'S'}&background=random`; }} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold truncate">{user?.name || 'Siswa'}</span>
                            <span className="text-xs text-slate-500">Siswa Aktif</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <SidebarItem icon="logout" label="Keluar" onClick={handleLogout} variant="danger" />
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col pb-24 md:pb-0">
                {/* Header */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-4">
                    <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
                        <div className="flex items-center gap-4">
                            {showBack && (
                                <button onClick={() => window.history.back()} className="size-10 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors">
                                    <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                                </button>
                            )}
                            <div>
                                <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                                {subtitle && <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{subtitle}</p>}
                            </div>
                        </div>
                        {showNotificationBell && (
                            <button onClick={() => setIsNotificationOpen(true)} className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors relative">
                                <span className="material-symbols-outlined">notifications</span>
                                {localUnreadCount > 0 ? (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 border-2 border-white shadow-sm">
                                        {localUnreadCount > 99 ? '99+' : localUnreadCount}
                                    </span>
                                ) : null}
                            </button>
                        )}
                    </div>
                </header>

                <div className="p-5 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
                    {children}
                </div>

                <BottomNav unreadCount={localUnreadCount} />
            </div>

            <Portal>
                <div className={`fixed inset-0 z-[99999] transition-opacity duration-300 ${isNotificationOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsNotificationOpen(false)} />
                    
                    {/* Slider Panel */}
                    <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-slate-50 shadow-2xl transition-transform duration-300 flex flex-col ${isNotificationOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800">Notifikasi</h2>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Pemberitahu Terbaru</p>
                            </div>
                            <button onClick={() => setIsNotificationOpen(false)} className="size-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {isLoadingNotifications ? (
                                <div className="text-center py-10">
                                    <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-sm text-slate-500">Memuat notifikasi...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map(n => {
                                    const style = iconMap[n.type] || iconMap.info;
                                    return (
                                        <div key={n.id} className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${n.isNew ? 'border-primary/30 bg-primary/5' : 'border-slate-200'}`}>
                                            <div className="flex items-start gap-3">
                                                <div className={`size-10 rounded-full ${style.bg} ${style.color} flex items-center justify-center shrink-0`}>
                                                    <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                                                        {n.isNew && <span className="size-2 bg-primary rounded-full shrink-0 mt-1.5"></span>}
                                                    </div>
                                                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{n.message}</p>
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
                                })
                            ) : (
                                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center shadow-sm my-4">
                                    <span className="material-symbols-outlined text-5xl text-slate-200 mb-3 block">notifications_off</span>
                                    <h4 className="font-bold text-slate-700 mb-1">Tidak Ada Notifikasi</h4>
                                    <p className="text-sm text-slate-500">Anda akan menerima pemberitahuan dari admin di sini.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Portal>
        </div>
    );
}
