import {
  Home, Calendar, Users, Bed, Settings, LogOut,
  LayoutGrid, PlusCircle, ClipboardList, CalendarDays,
  Wallet, TrendingUp, Building2, BarChart3,
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { getDictionary, getLocale } from '@/lib/dictionary';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getAllBranches } from '@/actions/branches';
import { getActiveBranchId } from '@/lib/active-branch';
import BranchSelector from './BranchSelector';

function NavLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 px-2.5 pt-3 pb-0.5">
      <span className="text-[9.5px] font-bold text-slate-600 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-800/80" />
    </div>
  );
}

export default async function Sidebar() {
  const dict = await getDictionary();
  const currentLang = await getLocale();
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'ADMIN';

  const [branches, activeBranchId] = isAdmin
    ? await Promise.all([getAllBranches(), getActiveBranchId()])
    : [[], undefined];

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-slate-50 border-r border-slate-800/80 shadow-xl z-10">

      {/* ── Logo ── */}
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-slate-800/60 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20">
            <LayoutGrid className="text-indigo-400" size={18} />
          </div>
          <h1 className="text-base font-bold tracking-wide text-white">
            Jennida<span className="text-indigo-400"> Hotel</span>
          </h1>
        </div>
      </div>

      {/* ── Branch selector (admin) ── */}
      {isAdmin && (
        <div className="shrink-0 border-b border-slate-800/60 px-3 py-1.5">
          <BranchSelector branches={branches} currentBranchId={activeBranchId ?? ""} />
        </div>
      )}

      {/* ════════════════════════════════
          MAIN NAV — no scroll, fits all
      ════════════════════════════════ */}
      <nav className="flex-1 px-2.5 py-2 flex flex-col">

        {/* ✦ ຈອງໃໝ່ — CTA button */}
        <div className="mb-1">
          <SidebarItem
            href="/bookings/new"
            icon={<PlusCircle size={17} />}
            label="ຈອງໃໝ່"
            variant="highlight"
          />
        </div>

        {/* ── ການຈອງ & ຫ້ອງ ── */}
        <NavLabel label="ການຈອງ & ຫ້ອງ" />
        <SidebarItem href="/bookings"    icon={<ClipboardList size={17} />} label="ລາຍການຈອງ" />
        <SidebarItem href="/rooms"       icon={<Bed size={17} />}           label={dict.sidebar.rooms} />
        <SidebarItem href="/room-types"  icon={<LayoutGrid size={17} />}    label="ປະເພດຫ້ອງ" />
        <SidebarItem href="/calendar"    icon={<Calendar size={17} />}      label={dict.sidebar.calendar} />

        {/* ── ຂໍ້ມູນ ── */}
        <NavLabel label="ຂໍ້ມູນ" />
        <SidebarItem href="/"       icon={<Home size={17} />}  label={dict.sidebar.dashboard} />
        <SidebarItem href="/guests" icon={<Users size={17} />} label="ຂໍ້ມູນແຂກ" />

        {/* ── ລາຍງານ ── */}
        <NavLabel label="ລາຍງານ" />
        <SidebarItem href="/reports"           icon={<BarChart3 size={17} />}    label="ພາບລວມ" />
        <SidebarItem href="/reports/revenue"   icon={<Wallet size={17} />}       label={dict.reports.tabRevenue} />
        <SidebarItem href="/reports/daily"     icon={<CalendarDays size={17} />} label={dict.reports.tabDaily} />
        <SidebarItem href="/reports/occupancy" icon={<TrendingUp size={17} />}   label={dict.reports.tabOccupancy} />

        {/* spacer pushes admin + settings to bottom */}
        <div className="flex-1" />

        {/* ════ ADMIN (ເລັກ, ຢູ່ລຸ່ມສຸດ) ════ */}
        {isAdmin && (
          <div className="border-t border-slate-800/60 pt-2 mt-1">
            <div className="flex items-center gap-1.5 px-2.5 pb-0.5">
              <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">
                ຜູ້ດູແລລະບົບ
              </span>
              <div className="flex-1 h-px bg-slate-800/60" />
            </div>
            <div className="flex gap-1 px-1">
              <SidebarItem href="/branches" icon={<Building2 size={13} />} label="ສາຂາ"     size="sm" />
              <SidebarItem href="/users"    icon={<Users size={13} />}     label="ຜູ້ໃຊ້"   size="sm" />
            </div>
          </div>
        )}

        {/* ════ ການຕັ້ງຄ່າ ════ */}
        <div className="border-t border-slate-800/60 pt-1.5 mt-1 space-y-0.5">
          <SidebarItem href="/settings" icon={<Settings size={13} />} label="ການຕັ້ງຄ່າ" size="sm" />
          <LanguageSwitcher currentLang={currentLang} />
          <SidebarItem href="/api/auth/signout" icon={<LogOut size={13} />} label={dict.sidebar.logout} variant="danger" />
        </div>

      </nav>
    </div>
  );
}
