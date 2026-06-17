import Link from "next/link";
import { Plus } from "lucide-react";
import { getReservations } from "@/actions/reservations";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";
import { CheckInButton, CheckOutButton, CancelButton } from "./ReservationActions";
import BookingFilters from "./BookingFilters";

const statusLabel: Record<string, string> = {
  CONFIRMED:   "ຢືນຢັນແລ້ວ",
  PENDING:     "ລໍຖ້າ",
  CHECKED_IN:  "ເຊັກອິນແລ້ວ",
  CHECKED_OUT: "ເຊັກເອົ້າແລ້ວ",
  CANCELLED:   "ຍົກເລີກ",
};

const statusStyle: Record<string, string> = {
  CONFIRMED:   "bg-blue-50 text-blue-700 border-blue-200",
  PENDING:     "bg-amber-50 text-amber-700 border-amber-200",
  CHECKED_IN:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  CHECKED_OUT: "bg-slate-50 text-slate-700 border-slate-200",
  CANCELLED:   "bg-red-50 text-red-700 border-red-200",
};

const sourceLabel: Record<string, string> = {
  WALK_IN:     "ໂດຍກົງ",
  PHONE:       "ໂທລະສັບ",
  OTA_AGODA:   "Agoda",
  OTA_BOOKING: "Booking.com",
};

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const isStaff = session?.user?.role === "STAFF";
  const userBranchId = session?.user?.branchId;

  // STAFF → own branch; Admin/Manager → cookie-based active branch
  const cookieBranchId = await getActiveBranchId();
  const activeBranchId = isStaff ? userBranchId : cookieBranchId;

  const allReservations = await getReservations(activeBranchId);

  // Status filter
  const reservations = params.status
    ? allReservations.filter((r) => r.status === params.status)
    : allReservations;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ການຈອງຫ້ອງ</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isStaff ? "ສາຂາຂອງທ່ານ" : activeBranchId ? "ສາຂາທີ່ເລືອກ" : "ທຸກສາຂາ"}
          </p>
        </div>
        <Link
          href="/bookings/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          ຈອງໃໝ່
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        {/* Status filter only — branch is selected globally in sidebar */}
        <BookingFilters defaultStatus={params.status || ""} />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">ແຂກ</th>
                <th className="px-4 py-3 font-semibold">ຫ້ອງ</th>
                {!isStaff && <th className="px-4 py-3 font-semibold">ສາຂາ</th>}
                <th className="px-4 py-3 font-semibold">ເຊັກອິນ</th>
                <th className="px-4 py-3 font-semibold">ເຊັກເອົ້າ</th>
                <th className="px-4 py-3 font-semibold">ຊ່ອງທາງ</th>
                <th className="px-4 py-3 font-semibold">ຈຳນວນ</th>
                <th className="px-4 py-3 font-semibold">ສະຖານະ</th>
                <th className="px-4 py-3 font-semibold text-right">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={isStaff ? 8 : 9} className="px-4 py-8 text-center text-slate-500 text-sm">
                    ຍັງບໍ່ມີການຈອງ
                  </td>
                </tr>
              ) : (
                reservations.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 text-sm text-slate-900 font-medium">{r.guest.name}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">#{r.room.number}</td>
                    {!isStaff && (
                      <td className="px-4 py-2.5 text-sm text-slate-700">{r.room.branch?.name || "-"}</td>
                    )}
                    <td className="px-4 py-2.5 text-sm text-slate-500">{r.checkIn.toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-500">{r.checkOut.toLocaleDateString()}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-500">
                      {sourceLabel[r.source] ?? r.source}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-900">₭{r.totalAmount.toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyle[r.status] ?? ""}`}>
                        {statusLabel[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      {(r.status === "CONFIRMED" || r.status === "PENDING") && (
                        <>
                          <CheckInButton reservationId={r.id} />
                          <CancelButton reservationId={r.id} />
                        </>
                      )}
                      {r.status === "CHECKED_IN" && <CheckOutButton reservationId={r.id} />}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            ສະແດງ <span className="font-medium text-slate-900">{reservations.length}</span> ການຈອງ
            {params.status && (
              <span className="ml-1 text-indigo-600">· {statusLabel[params.status]}</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
