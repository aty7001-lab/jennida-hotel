import prisma from "@/lib/prisma";
import { Search, Phone, Mail, UserPlus } from 'lucide-react';

export default async function GuestsPage() {
  const guests = await prisma.guest.findMany({
    include: {
      reservations: {
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
          <h1 className="text-2xl font-bold text-slate-900">Guests</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage guest records.</p>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Last Booking</th>
                <th className="px-4 py-3 font-semibold text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {guests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No guests found.
                  </td>
                </tr>
              ) : guests.map((guest) => (
                <tr key={guest.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-slate-900 font-medium">{guest.name}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{guest.phone || '-'}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{guest.email || '-'}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">
                    {guest.reservations[0]
                      ? `Room #${guest.reservations[0].room.number} (${guest.reservations[0].status})`
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
          <span className="text-xs text-slate-500">Showing <span className="font-medium text-slate-900">{guests.length}</span> guests</span>
        </div>
      </div>
    </div>
  );
}
