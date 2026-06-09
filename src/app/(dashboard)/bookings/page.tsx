import { getReservations } from "@/actions/reservations";
import { CheckInButton, CheckOutButton, CancelButton } from "./ReservationActions";

export default async function BookingsPage() {
  const reservations = await getReservations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage all reservations, check-in, and check-out.</p>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Guest</th>
                <th className="px-4 py-3 font-semibold">Room</th>
                <th className="px-4 py-3 font-semibold">Branch</th>
                <th className="px-4 py-3 font-semibold">Check-in</th>
                <th className="px-4 py-3 font-semibold">Check-out</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">Amount</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No reservations found.
                  </td>
                </tr>
              ) : reservations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-slate-900 font-medium">{r.guest.name}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">#{r.room.number}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{r.room.branch?.name || '-'}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-500">{r.checkIn.toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-500">{r.checkOut.toLocaleDateString()}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-500">{r.source.replace('_', ' ')}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-900">₭{r.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      r.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      r.status === 'CHECKED_IN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      r.status === 'CHECKED_OUT' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                      r.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-1">
                    {(r.status === 'CONFIRMED' || r.status === 'PENDING') && (
                      <>
                        <CheckInButton reservationId={r.id} />
                        <CancelButton reservationId={r.id} />
                      </>
                    )}
                    {r.status === 'CHECKED_IN' && (
                      <CheckOutButton reservationId={r.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">Showing <span className="font-medium text-slate-900">{reservations.length}</span> reservations</span>
        </div>
      </div>
    </div>
  );
}
