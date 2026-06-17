import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";

export default async function GuestsPage() {
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const userBranchId = session?.user?.branchId;
  const cookieBranchId = await getActiveBranchId();
  const activeBranchId = isStaff ? userBranchId : cookieBranchId;

  const guests = await prisma.guest.findMany({
    where: activeBranchId
      ? { reservations: { some: { room: { branchId: activeBranchId } } } }
      : undefined,
    include: {
      reservations: {
        where: activeBranchId ? { room: { branchId: activeBranchId } } : undefined,
        include: { room: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ຂໍ້ມູນແຂກ</h1>
          <p className="text-sm text-slate-500 mt-1">ເບິ່ງ ແລະ ຈັດການຂໍ້ມູນແຂກ.</p>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">ຊື່</th>
                <th className="px-4 py-3 font-semibold">ເບີໂທ</th>
                <th className="px-4 py-3 font-semibold">ອີເມວ</th>
                <th className="px-4 py-3 font-semibold">ການຈອງລ່າສຸດ</th>
                <th className="px-4 py-3 font-semibold text-right">ວັນທີລົງທະບຽນ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                    ຍັງບໍ່ມີຂໍ້ມູນແຂກ
                  </td>
                </tr>
              ) : guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-slate-900 font-medium">{guest.name}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{guest.phone || '-'}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{guest.email || '-'}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">
                    {guest.reservations[0]
                      ? `ຫ້ອງ #${guest.reservations[0].room.number} (${guest.reservations[0].status})`
                      : '-'}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-slate-500 text-right">
                    {guest.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">ສະແດງ <span className="font-medium text-slate-900">{guests.length}</span> ຄົນ</span>
        </div>
      </div>
    </div>
  );
}
