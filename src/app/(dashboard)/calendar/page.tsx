import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, Bed } from 'lucide-react';
import { getDictionary } from "@/lib/dictionary";
import prisma from "@/lib/prisma";
import Link from 'next/link';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const params = await searchParams;
  const dict = await getDictionary();
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const userBranchId = session?.user?.branchId;
  const cookieBranchId = await getActiveBranchId();
  const activeBranchId = isStaff ? userBranchId : cookieBranchId;

  const now = new Date();
  const year = parseInt(params.year || String(now.getFullYear()));
  const month = parseInt(params.month || String(now.getMonth() + 1)); // 1-indexed

  // Start and end of month
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  const daysInMonth = endOfMonth.getDate();

  // Get all reservations that overlap with this month
  const reservations = await prisma.reservation.findMany({
    where: {
      AND: [
        { checkIn: { lte: endOfMonth } },
        { checkOut: { gte: startOfMonth } },
        { status: { not: "CANCELLED" } },
        ...(activeBranchId ? [{ room: { branchId: activeBranchId } }] : []),
      ],
    },
    include: {
      guest: true,
      room: { include: { branch: true } },
    },
    orderBy: { room: { number: "asc" } },
  });

  // Derive unique rooms from reservations (only rooms with bookings this month)
  const seenRoomIds = new Set<string>();
  const rooms = reservations
    .map(r => r.room)
    .filter(room => {
      if (seenRoomIds.has(room.id)) return false;
      seenRoomIds.add(room.id);
      return true;
    })
    .sort((a, b) => {
      const branchCmp = (a.branch?.name ?? '').localeCompare(b.branch?.name ?? '');
      return branchCmp !== 0 ? branchCmp : a.number.localeCompare(b.number, undefined, { numeric: true });
    });

  // Build day headers
  const dayHeaders: { day: number; dayOfWeek: string; isToday: boolean }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    const dayOfWeek = date.toLocaleDateString('en', { weekday: 'short' });
    const isToday = date.toDateString() === now.toDateString();
    dayHeaders.push({ day: d, dayOfWeek, isToday });
  }

  // Navigation
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  const monthName = new Date(year, month - 1).toLocaleDateString('en', { month: 'long', year: 'numeric' });

  // Stats
  const activeBookings = reservations.filter(r => r.status === 'CHECKED_IN' || r.status === 'CONFIRMED').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{dict.calendar.title}</h1>
          <p className="text-sm text-slate-500 mt-1">ການຈອງ {monthName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/calendar?month=${prevMonth}&year=${prevYear}`} className="p-2 border border-slate-300 rounded-md text-slate-500 hover:bg-slate-50 transition-colors">
            <ChevronLeft size={18} />
          </Link>
          <Link href={`/calendar`} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-slate-50 transition-colors">
            {dict.calendar.today}
          </Link>
          <Link href={`/calendar?month=${nextMonth}&year=${nextYear}`} className="p-2 border border-slate-300 rounded-md text-slate-500 hover:bg-slate-50 transition-colors">
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm">
          <Bed size={14} className="text-slate-500" />
          <span className="text-slate-700"><span className="font-semibold">{rooms.length}</span> ຫ້ອງ</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm">
          <Users size={14} className="text-slate-500" />
          <span className="text-slate-700"><span className="font-semibold">{activeBookings}</span> ການຈອງ</span>
        </div>
        <div className="flex items-center gap-3 ml-auto text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-indigo-500"></span> ຢືນຢັນ</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500"></span> ເຊັກອິນ</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-slate-300"></span> ເຊັກເອົ້າ</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600 uppercase tracking-wider text-[10px] sticky left-0 bg-slate-50 z-10 min-w-[140px] border-r border-slate-200">ຫ້ອງ</th>
                {dayHeaders.map(d => (
                  <th key={d.day} className={`px-0 py-2.5 text-center font-medium min-w-[32px] ${d.isToday ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500'}`}>
                    <div className="text-[9px] uppercase">{d.dayOfWeek}</div>
                    <div className={`text-sm font-bold ${d.isToday ? 'text-indigo-600' : 'text-slate-800'}`}>{d.day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.map(room => {
                // Find reservations for this room
                const roomReservations = reservations.filter(r => r.roomId === room.id);

                return (
                  <tr key={room.id} className="hover:bg-slate-50/50">
                    <td className="px-3 py-2 text-left sticky left-0 bg-white z-10 border-r border-slate-100">
                      <div className="font-semibold text-slate-900">#{room.number}</div>
                      <div className="text-[10px] text-slate-400">{room.branch?.name}</div>
                    </td>
                    {dayHeaders.map(d => {
                      const cellDate = new Date(year, month - 1, d.day);
                      // Check if any reservation covers this day
                      const booking = roomReservations.find(r => {
                        const ci = new Date(r.checkIn); ci.setHours(0,0,0,0);
                        const co = new Date(r.checkOut); co.setHours(23,59,59,999);
                        return cellDate >= ci && cellDate <= co;
                      });

                      if (booking) {
                        const bgColor = booking.status === 'CHECKED_IN' ? 'bg-emerald-500' :
                                        booking.status === 'CONFIRMED' || booking.status === 'PENDING' ? 'bg-indigo-500' :
                                        'bg-slate-300';
                        // Check if it's the first day of the booking in this month
                        const bookingStart = new Date(booking.checkIn); bookingStart.setHours(0,0,0,0);
                        const isStart = cellDate.getTime() === bookingStart.getTime() || d.day === 1;

                        return (
                          <td key={d.day} className={`px-0 py-2 text-center ${d.isToday ? 'bg-indigo-50/30' : ''}`} title={`${booking.guest.name} (${booking.status})`}>
                            <div className={`h-5 ${bgColor} ${isStart ? 'rounded-l' : ''} flex items-center justify-center`}>
                              {isStart && <span className="text-[9px] text-white font-medium truncate px-1">{booking.guest.name.split(' ')[0]}</span>}
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td key={d.day} className={`px-0 py-2 text-center ${d.isToday ? 'bg-indigo-50/30' : ''}`}>
                          <div className="h-5"></div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
