import Link from "next/link";
import { Plus } from "lucide-react";
import { getReservations } from "@/actions/reservations";
import { getRoomsByBranch } from "@/actions/rooms";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";
import BookingFilters from "./BookingFilters";
import BookingsTable from "./BookingsTable";
import { SlipReservation } from "@/components/BookingSlipButton";

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const userBranchId = session?.user?.branchId;

  const cookieBranchId = await getActiveBranchId();
  const activeBranchId = isStaff ? userBranchId : cookieBranchId;

  const [allReservations, allRooms] = await Promise.all([
    getReservations(activeBranchId),
    getRoomsByBranch(activeBranchId),
  ]);

  const availableRooms = allRooms
    .filter(r => r.status === "AVAILABLE")
    .map(r => ({ id: r.id, number: r.number, type: r.roomType.name, price: r.price }));

  const filtered = params.status
    ? allReservations.filter(r => r.status === params.status)
    : allReservations;

  // Serialize all Date fields before passing to client component
  const reservations: SlipReservation[] = filtered.map(r => ({
    id:          r.id,
    roomId:      r.roomId,
    createdAt:   r.createdAt.toISOString(),
    checkIn:     r.checkIn.toISOString(),
    checkOut:    r.checkOut.toISOString(),
    status:      r.status,
    source:      r.source,
    totalAmount: r.totalAmount,
    deposit:     r.deposit,
    credit:      r.credit,
    guest: {
      name:   r.guest.name,
      phone:  r.guest.phone  ?? null,
      email:  r.guest.email  ?? null,
      idCard: r.guest.idCard ?? null,
    },
    room: {
      number: r.room.number,
      type:   r.room.roomType.name,
      price:  r.room.price,
      branch: {
        name:    r.room.branch?.name    ?? "",
        address: r.room.branch?.address ?? null,
        code:    r.room.branch?.code    ?? "",
      },
    },
    payments: r.payments.map(p => ({
      amount:    p.amount,
      method:    p.method,
      status:    p.status,
      note:      p.note ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

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
          ຈອງຫ້ອງ
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <BookingFilters defaultStatus={params.status || ""} />
        <BookingsTable
          reservations={reservations}
          availableRooms={availableRooms}
          isStaff={isStaff}
          totalCount={allReservations.length}
          statusFilter={params.status}
        />
      </div>
    </div>
  );
}
