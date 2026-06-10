import { Users, Bed, CreditCard, TrendingUp } from 'lucide-react';
import { getRoomSummaryByBranch } from '@/actions/rooms';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import prisma from '@/lib/prisma';
import ExportButtons from '@/components/ExportButtons';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  const roomSummary = await getRoomSummaryByBranch();

  // Real checked-in guests count
  const checkedInCount = await prisma.reservation.count({
    where: { status: "CHECKED_IN" },
  });

  // Real today's revenue
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const todayPayments = await prisma.payment.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { gte: todayStart, lte: todayEnd },
    },
  });
  const todayRevenue = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-black">Dashboard Overview</h1>
          <p className="text-black">Welcome back, {session?.user?.name || "User"}. Here is today&apos;s summary.</p>
        </div>
        <div className="no-print">
          <ExportButtons targetId="dashboard-content" fileName="ສະຫຼຸບລາຍວັນ" />
        </div>
      </div>

      <div id="dashboard-content" className="space-y-6 print-area">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Stat Card 1: Rooms */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Available Rooms</p>
              <p className="text-3xl font-bold text-black mt-1">
                {roomSummary.available} <span className="text-sm font-medium text-black">/ {roomSummary.total}</span>
              </p>
            </div>
            <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
              <Bed size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp size={16} className="text-emerald-500 mr-1" />
            <span className="text-emerald-500 font-medium">{roomSummary.occupancyRate}%</span>
            <span className="text-black ml-2">Occupancy Rate</span>
          </div>
        </div>

        {/* Stat Card 2: Checked-in Guests */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Checked-in Guests</p>
              <p className="text-3xl font-bold text-black mt-1">{checkedInCount}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-black">Currently active on property</span>
          </div>
        </div>

        {/* Stat Card 3: Today's Revenue */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-black">Today&apos;s Revenue</p>
              <p className="text-3xl font-bold text-black mt-1">₭{todayRevenue.toLocaleString()}</p>
            </div>
            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600">
              <CreditCard size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-black">{todayPayments.length} transactions today</span>
          </div>
        </div>

      </div>
      </div>
    </div>
  );
}
