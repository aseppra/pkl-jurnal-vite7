import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, useState, useEffect } from 'react';

function NavbarDate() {
    const [dateStr] = useState(() => {
        const now = new Date();
        return now.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    });
    return <p className="text-sm font-medium text-slate-600 hidden md:block">{dateStr}</p>;
}

interface SidebarItemProps {
    icon: string;
    label: string;
    href?: string;
    active?: boolean;
    onClick?: () => void;
    variant?: 'default' | 'danger';
    badge?: number;
}

function SidebarItem({ icon, label, href, active, onClick, variant = 'default', badge }: SidebarItemProps) {
    if (variant === 'danger') {
        return (
            <button
                onClick={onClick}
                className="flex w-full items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
                <span className="material-symbols-outlined text-lg">{icon}</span>
                <span className="text-sm font-medium">{label}</span>
            </button>
        );
    }
    const content = (
        <>
            <span className={`material-symbols-outlined text-lg ${active ? 'text-white' : 'text-slate-400'}`}>{icon}</span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="bg-red-500 text-white min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 shadow-sm">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    active ? 'bg-primary text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
                {content}
            </Link>
        );
    }

    return (
        <div
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                active ? 'bg-primary text-white font-medium' : 'text-slate-600 hover:bg-slate-100'
            }`}
        >
            {content}
        </div>
    );
}

function SidebarSection({ label, icon, children, defaultOpen = false }: { label: string; icon: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="mt-1">
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors group"
                title={`Toggle ${label}`}
            >
                <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-slate-500">{icon}</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
                </div>
                <span className={`material-symbols-outlined text-base text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pl-2 space-y-0.5 pb-1">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function PembimbingLayout({ children, title, subtitle }: PropsWithChildren<{ title: string; subtitle?: string }>) {
    const { url, props } = usePage();
    const user = (props as any).auth?.user;
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        router.post(route('logout'));
    };

    const isMonitoringActive = url.startsWith('/pembimbing/data-siswa') || url.startsWith('/pembimbing/presensi') || url.startsWith('/pembimbing/jurnal');

    const navItems = (
        <>
            <SidebarItem icon="dashboard" label="Overview" href={route('pembimbing.dashboard')} active={url === '/pembimbing'} />
            <SidebarSection label="Monitoring" icon="assignment_ind" defaultOpen={isMonitoringActive}>
                <SidebarItem icon="groups" label="Data Siswa Bimbingan" href={route('pembimbing.siswa')} active={url.startsWith('/pembimbing/data-siswa')} />
                <SidebarItem icon="fact_check" label="Presensi Siswa" href={route('pembimbing.presensi')} active={url.startsWith('/pembimbing/presensi')} />
                <SidebarItem icon="book" label="Jurnal PKL" href={route('pembimbing.jurnal')} active={url.startsWith('/pembimbing/jurnal')} />
            </SidebarSection>
            <SidebarSection label="Laporan" icon="assessment" defaultOpen={url.startsWith('/pembimbing/rekapitulasi')}>
                <SidebarItem icon="description" label="Rekapitulasi Jurnal" href={route('pembimbing.rekapitulasi')} active={url.startsWith('/pembimbing/rekapitulasi')} />
            </SidebarSection>
        </>
    );

    return (
        <div className="flex min-h-screen bg-background-light">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col sticky top-0 h-screen shrink-0">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">assignment_ind</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-wider">Pembimbing PKL</h1>
                            <p className="text-xs text-slate-500">Memonitor Siswa</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">{navItems}</nav>
                <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-slate-50 mb-4">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                            <img alt="Profile" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Pembimbing'}`} />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-xs font-semibold">{user?.name || 'Pembimbing'}</p>
                            <p className="text-[10px] text-slate-500 uppercase">{user?.role || 'pembimbing'}</p>
                        </div>
                    </div>
                    <SidebarItem icon="logout" label="Logout" onClick={handleLogout} variant="danger" />
                </div>
            </aside>

            {/* Mobile menu overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="fixed inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
                    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white flex flex-col z-50 shadow-xl">
                        <div className="p-4 flex justify-between items-center border-b border-slate-200">
                            <span className="font-bold text-primary">Menu</span>
                            <button onClick={() => setMobileOpen(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">{navItems}</nav>
                        <div className="p-4 border-t border-slate-200">
                            <SidebarItem icon="logout" label="Logout" onClick={handleLogout} variant="danger" />
                        </div>
                    </aside>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-h-0">
                <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button className="md:hidden" onClick={() => setMobileOpen(true)}>
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <div>
                            <h2 className="text-base font-bold text-slate-900">{title}</h2>
                            {subtitle && <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <NavbarDate />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
