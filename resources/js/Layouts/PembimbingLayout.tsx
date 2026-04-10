import { Link, usePage, router } from '@inertiajs/react';
import { PropsWithChildren, useState } from 'react';

// ─── Date display (desktop only) ────────────────────────────────────────────
function NavbarDate() {
    const [dateStr] = useState(() =>
        new Date().toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
    );
    return <p className="text-sm font-medium text-slate-600 hidden md:block">{dateStr}</p>;
}

// ─── Desktop sidebar item ────────────────────────────────────────────────────
interface SidebarItemProps {
    icon: string; label: string; href?: string;
    active?: boolean; onClick?: () => void;
    variant?: 'default' | 'danger'; badge?: number;
}

function SidebarItem({ icon, label, href, active, onClick, variant = 'default', badge }: SidebarItemProps) {
    if (variant === 'danger') {
        return (
            <button onClick={onClick} className="flex w-full items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
                <span className="bg-red-500 text-white min-w-[20px] h-[20px] flex items-center justify-center rounded-full text-[10px] font-bold px-1.5">
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </>
    );
    if (href) {
        return (
            <Link href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-primary text-white font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
                {content}
            </Link>
        );
    }
    return (
        <div onClick={onClick} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-primary text-white font-medium' : 'text-slate-600 hover:bg-slate-100'}`}>
            {content}
        </div>
    );
}

// ─── Desktop collapsible sidebar section ────────────────────────────────────
function SidebarSection({ label, icon, children, defaultOpen = false }: { label: string; icon: string; children: React.ReactNode; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="mt-1">
            <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors group" title={`Toggle ${label}`}>
                <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-lg text-slate-400 group-hover:text-slate-500">{icon}</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
                </div>
                <span className={`material-symbols-outlined text-base text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            <div className={`overflow-hidden transition-all duration-200 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="pl-2 space-y-0.5 pb-1">{children}</div>
            </div>
        </div>
    );
}

// ─── Mobile Bottom Navigation ────────────────────────────────────────────────
interface BottomNavItemProps {
    icon: string; label: string; href: string; active: boolean;
}

function BottomNavItem({ icon, label, href, active }: BottomNavItemProps) {
    return (
        <Link
            href={href}
            className={`relative flex flex-col items-center justify-between w-16 h-14 pt-1 transition-all duration-300 ${active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
            {/* Top Active Indicator */}
            {active && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-md"></span>
            )}

            {/* Icon container */}
            <div className={`flex items-center justify-center w-12 h-8 rounded-[14px] transition-all duration-300 ${active ? 'bg-primary/10' : 'bg-transparent hover:bg-slate-100/50'}`}>
                <span className={`material-symbols-outlined text-[24px] ${active ? 'fill-[1]' : ''}`} style={active ? {fontVariationSettings: "'FILL' 1"} : {}}>
                    {icon}
                </span>
            </div>

            {/* Label */}
            <span className="text-[9px] uppercase font-bold tracking-wider mt-1">
                {label}
            </span>
        </Link>
    );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function PembimbingLayout({ children, title, subtitle }: PropsWithChildren<{ title: string; subtitle?: string }>) {
    const { url, props } = usePage();
    const user = (props as any).auth?.user;

    const handleLogout = () => router.post(route('logout'));

    const isMonitoringActive = url.startsWith('/pembimbing/data-siswa') || url.startsWith('/pembimbing/presensi') || url.startsWith('/pembimbing/jurnal');

    // ── Bottom nav items (4 tab utama; Rekap & Profil tersembunyi, diakses via avatar/menu)
    const bottomNavItems = [
        { icon: 'dashboard',  label: 'Home',    href: route('pembimbing.dashboard'), active: url === '/pembimbing' },
        { icon: 'groups',     label: 'Siswa',   href: route('pembimbing.siswa'),      active: url.startsWith('/pembimbing/data-siswa') },
        { icon: 'how_to_reg', label: 'Presensi',href: route('pembimbing.presensi'),   active: url.startsWith('/pembimbing/presensi') },
        { icon: 'menu_book',  label: 'Jurnal',  href: route('pembimbing.jurnal'),     active: url.startsWith('/pembimbing/jurnal') },
    ];

    // ── Desktop sidebar nav
    const desktopNav = (
        <>
            <SidebarItem icon="dashboard" label="Overview" href={route('pembimbing.dashboard')} active={url === '/pembimbing'} />
            <SidebarSection label="Monitoring" icon="assignment_ind" defaultOpen={isMonitoringActive}>
                <SidebarItem icon="groups"      label="Data Siswa Bimbingan" href={route('pembimbing.siswa')}      active={url.startsWith('/pembimbing/data-siswa')} />
                <SidebarItem icon="fact_check"  label="Presensi Siswa"       href={route('pembimbing.presensi')}   active={url.startsWith('/pembimbing/presensi')} />
                <SidebarItem icon="book"        label="Jurnal PKL"           href={route('pembimbing.jurnal')}     active={url.startsWith('/pembimbing/jurnal')} />
            </SidebarSection>
            <SidebarSection label="Laporan" icon="assessment" defaultOpen={url.startsWith('/pembimbing/rekapitulasi')}>
                <SidebarItem icon="description" label="Rekapitulasi Jurnal"  href={route('pembimbing.rekapitulasi')} active={url.startsWith('/pembimbing/rekapitulasi')} />
            </SidebarSection>
        </>
    );

    return (
        <div className="flex min-h-screen bg-slate-50">

            {/* ═══════════════════════════════════════════════
                DESKTOP SIDEBAR (hidden on mobile)
            ═══════════════════════════════════════════════ */}
            <aside className="hidden md:flex w-64 border-r border-slate-200 bg-white flex-col sticky top-0 h-screen shrink-0">
                {/* Brand */}
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined">assignment_ind</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-wider">Pembimbing PKL</h1>
                            <p className="text-xs text-slate-500">Memonitor Siswa</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">{desktopNav}</nav>

                {/* Profile + action — avatar clickable to profile page */}
                <div className="p-4 border-t border-slate-200">
                    <Link
                        href={route('pembimbing.profile')}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl mb-1 transition-all ${
                            url.startsWith('/pembimbing/profile')
                                ? 'bg-primary/10 border border-primary/20'
                                : 'bg-slate-50 hover:bg-slate-100 border border-transparent'
                        }`}
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden border-2 border-primary/20 shrink-0">
                            <img alt="Profile" src="/images/admin_user_man.png" className="w-full h-full object-cover scale-110" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Pembimbing'}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Lihat Profil</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                    </Link>
                </div>
            </aside>

            {/* ═══════════════════════════════════════════════
                MAIN CONTENT AREA
            ═══════════════════════════════════════════════ */}
            <main className="flex-1 flex flex-col min-h-0 min-w-0">

                {/* ── Top Header ── */}
                <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shrink-0">
                    {/* Desktop header */}
                    <div className="hidden md:flex px-8 py-4 items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">{title}</h2>
                            {subtitle && <p className="text-xs text-slate-500 font-medium mt-0.5">{subtitle}</p>}
                        </div>
                        <NavbarDate />
                    </div>

                    {/* Mobile header — compact */}
                    <div className="flex md:hidden items-center justify-between px-4 py-3">
                        {/* Left: Brand + page title */}
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 shadow shadow-primary/30">
                                <span className="material-symbols-outlined text-white text-[18px]">assignment_ind</span>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pembimbing PKL</p>
                                <h2 className="text-sm font-bold text-slate-900 leading-tight truncate">{title}</h2>
                            </div>
                        </div>

                        {/* Right: Avatar → link to profile */}
                        <Link href={route('pembimbing.profile')} className="flex items-center gap-2 shrink-0 group">
                            <div className={`size-9 rounded-full overflow-hidden border-2 transition-all ${
                                url.startsWith('/pembimbing/profile')
                                    ? 'border-primary shadow-md shadow-primary/30'
                                    : 'border-primary/20 group-hover:border-primary/50'
                            }`}>
                                <img alt="Avatar" src="/images/admin_user_man.png" className="w-full h-full object-cover scale-110" />
                            </div>
                        </Link>
                    </div>
                </header>

                {/* ── Page Content ──
                    pb-24 on mobile = space for bottom nav (64px) + extra breathing room
                ── */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 space-y-6 max-w-[1600px] mx-auto w-full">
                    {children}
                </div>
            </main>

            {/* ═══════════════════════════════════════════════
                MOBILE BOTTOM NAVIGATION BAR
                (hidden on desktop)
            ═══════════════════════════════════════════════ */}
            <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pointer-events-none p-4 pb-[calc(16px+env(safe-area-inset-bottom))] flex justify-center">
                <nav className="bg-white/70 backdrop-blur-md border border-white/50 rounded-[28px] px-2 py-2 flex justify-between items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto w-full max-w-[360px]">
                    {bottomNavItems.map((item) => (
                        <BottomNavItem key={item.href} {...item} />
                    ))}
                </nav>
            </div>

        </div>
    );
}
