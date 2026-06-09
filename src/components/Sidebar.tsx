import Link from 'next/link';
import { Home, Calendar, Users, Bed, CreditCard, Settings, LogOut, LayoutGrid, PlusCircle, ClipboardList, CalendarDays, Wallet, TrendingUp, Building2 } from 'lucide-react';
import { getDictionary, getLocale } from '@/lib/dictionary';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function Sidebar() {
  const dict = await getDictionary();
  const currentLang = await getLocale();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-slate-50 border-r border-slate-800 shadow-xl z-10 transition-all duration-300">
      <div className="flex h-20 items-center justify-center border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-2 rounded-lg">
            <LayoutGrid className="text-indigo-400" size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-wider text-white">Jennida<span className="text-indigo-400"> Hotel</span></h1>
        </div>
      </div>
      
      <nav className="flex-1 space-y-1.5 py-6 px-4 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Main Menu</div>
        <SidebarItem href="/" icon={<Home size={18} />} label={dict.sidebar.dashboard} />
        <SidebarItem href="/calendar" icon={<Calendar size={18} />} label={dict.sidebar.calendar} />
        <SidebarItem href="/rooms" icon={<Bed size={18} />} label={dict.sidebar.rooms} />
        <SidebarItem href="/bookings" icon={<ClipboardList size={18} />} label="Bookings" />
        <SidebarItem href="/bookings/new" icon={<PlusCircle size={18} />} label="New Booking" />
        <SidebarItem href="/guests" icon={<Users size={18} />} label="Guests" />
        <SidebarItem href="/payments" icon={<CreditCard size={18} />} label={dict.sidebar.payments} />

        {isAdmin && (
          <>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-3">Admin</div>
            <SidebarItem href="/branches" icon={<Building2 size={18} />} label="ສາຂາ / Branches" />
            <SidebarItem href="/users" icon={<Users size={18} />} label="ຜູ້ໃຊ້ / Users" />
          </>
        )}

        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-3">{dict.sidebar.reports}</div>
        <SidebarItem href="/reports/daily" icon={<CalendarDays size={18} />} label={dict.reports.tabDaily} />
        <SidebarItem href="/reports/revenue" icon={<Wallet size={18} />} label={dict.reports.tabRevenue} />
        <SidebarItem href="/reports/occupancy" icon={<TrendingUp size={18} />} label={dict.reports.tabOccupancy} />
      </nav>

      <div className="border-t border-slate-800/50 p-4 space-y-1.5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Preferences</div>
        <SidebarItem href="/settings" icon={<Settings size={18} />} label="Settings" />
        <LanguageSwitcher currentLang={currentLang} />
        <SidebarItem href="/api/auth/signout" icon={<LogOut size={18} />} label={dict.sidebar.logout} variant="danger" />
      </div>
    </div>
  );
}

function SidebarItem({ href, icon, label, variant = 'default' }: { href: string; icon: React.ReactNode; label: string, variant?: 'default' | 'danger' }) {
  const hoverClass = variant === 'danger' 
    ? 'hover:bg-red-500/10 hover:text-red-400' 
    : 'hover:bg-indigo-500/10 hover:text-indigo-300';
    
  return (
    <Link 
      href={href}
      className={`flex items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors duration-200 ${hoverClass}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
