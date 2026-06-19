import { createBooking } from "@/actions/bookings";
import { getRoomsByBranch } from "@/actions/rooms";
import { getDictionary } from "@/lib/dictionary";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";
import NewBookingForm from "@/components/NewBookingForm";

export default async function NewBookingPage() {
  const dict = await getDictionary();
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const userBranchId = session?.user?.branchId;
  const cookieBranchId = await getActiveBranchId();
  // STAFF → own branch only; Admin/Manager → cookie-based active branch
  const activeBranchId = isStaff ? userBranchId : cookieBranchId;

  const allRooms = await getRoomsByBranch(activeBranchId);
  const availableRooms = allRooms.filter((r) => r.status === "AVAILABLE");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{dict.booking.title}</h1>
        <p className="text-sm text-slate-500 mt-1">{dict.booking.subtitle}</p>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <NewBookingForm
          rooms={availableRooms}
          dict={dict}
          createImmediateBooking={createBooking.bind(null, "immediate")}
          createAdvanceBooking={createBooking.bind(null, "advance")}
        />
      </div>
    </div>
  );
}
