import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getReservationById } from "@/actions/reservations";
import { getAuditLogsByEntity } from "@/actions/audit";
import { getRoomsByBranch } from "@/actions/rooms";
import { PendingConfirmedActions, CheckedInActions } from "../ReservationActions";

const actionLaoLabel: Record<string, string> = {
  CHECK_IN:        "ເຊັກອິນ",
  CHECK_OUT:       "ເຊັກເອົ້າ",
  CANCEL:          "ຍົກເລີກ",
  MOVE_ROOM:       "ຍ້າຍຫ້ອງ",
  EXTEND_STAY:     "ຕໍ່ການຈອງ",
  EARLY_CHECKOUT:  "ອອກກ່ອນກຳນົດ",
  CHANGE_DATES:    "ດັດແກ້ວັນ",
  EXTRA_CHARGE:    "ຄ່າໃຊ້ຈ່າຍເພີ່ມ",
  APPLY_DISCOUNT:  "ສ່ວນລົດ",
  RECORD_PAYMENT:  "ບັນທຶກການຊຳລະ",
};

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

const paymentMethodLabel: Record<string, string> = {
  CASH:        "ເງິນສົດ",
  TRANSFER:    "ໂອນ",
  CREDIT_CARD: "ບັດ",
};

function fmtDateTime(s: string) {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const r = await getReservationById(id);
  if (!r) notFound();

  const [auditLogs, allRooms] = await Promise.all([
    getAuditLogsByEntity(id),
    getRoomsByBranch(r.room.branch?.id),
  ]);

  const availableRooms = allRooms
    .filter(room => room.status === "AVAILABLE")
    .map(room => ({ id: room.id, number: room.number, type: room.roomType.name, price: room.price }));

  const paidAmount = r.payments
    .filter(p => p.status === "COMPLETED")
    .reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, r.totalAmount - paidAmount);

  const isActive = r.status === "PENDING" || r.status === "CONFIRMED" || r.status === "CHECKED_IN";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/bookings"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={16} />
        ກັບລາຍການຈອງ
      </Link>

      {/* Header card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{r.guest.name}</h1>
            <p className="text-sm text-slate-500 mt-1">
              ຫ້ອງ #{r.room.number} · {r.room.roomType.name}
              {r.room.branch?.name && ` · ${r.room.branch.name}`}
            </p>
            <p className="text-xs text-slate-400 mt-1 font-mono uppercase">{r.id.slice(0, 8)}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusStyle[r.status] ?? ""}`}>
            {statusLabel[r.status] ?? r.status}
          </span>
        </div>

        {/* Stay info */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-400 mb-0.5">ວັນຈອງ</div>
            <div className="font-medium text-slate-700">{fmtDateTime(r.createdAt.toISOString())}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-0.5">ເຊັກອິນ</div>
            <div className="font-medium text-slate-700">{fmtDateTime(r.checkIn.toISOString())}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-0.5">ເຊັກເອົ້າ</div>
            <div className="font-medium text-slate-700">{fmtDateTime(r.checkOut.toISOString())}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-0.5">ຄ່າຫ້ອງ/ຄືນ</div>
            <div className="font-medium text-slate-700">₭{r.room.price.toLocaleString()}</div>
          </div>
        </div>

        {/* Guest contacts */}
        {(r.guest.phone || r.guest.email || r.guest.idCard) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-600">
            {r.guest.phone  && <span>📞 {r.guest.phone}</span>}
            {r.guest.email  && <span>✉️ {r.guest.email}</span>}
            {r.guest.idCard && <span>🪪 {r.guest.idCard}</span>}
          </div>
        )}
      </div>

      {/* Financial panel */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">ສະຫຼຸບການເງິນ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1">ຍອດລວມ</div>
            <div className="text-lg font-bold text-slate-900">₭{r.totalAmount.toLocaleString()}</div>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="text-xs text-emerald-400 mb-1">ຊຳລະແລ້ວ</div>
            <div className="text-lg font-bold text-emerald-700">₭{paidAmount.toLocaleString()}</div>
          </div>
          {(() => {
            const showBalance = balance > 0 && r.status !== "CANCELLED" && r.status !== "CHECKED_OUT";
            return (
              <div className={`rounded-xl p-4 ${showBalance ? "bg-rose-50" : "bg-slate-50"}`}>
                <div className={`text-xs mb-1 ${showBalance ? "text-rose-400" : "text-slate-400"}`}>ຍອດຄ້າງ</div>
                <div className={`text-lg font-bold ${showBalance ? "text-rose-600" : "text-slate-300"}`}>
                  {showBalance ? `₭${balance.toLocaleString()}` : "—"}
                </div>
              </div>
            );
          })()}
          {r.credit > 0 && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="text-xs text-indigo-400 mb-1">ຄ່າ Credit</div>
              <div className="text-lg font-bold text-indigo-700">₭{r.credit.toLocaleString()}</div>
            </div>
          )}
        </div>

        {r.discountNote && (
          <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg px-4 py-2.5 text-sm text-amber-700">
            ສ່ວນລົດ: {r.discountNote}
          </div>
        )}

        {/* Action buttons */}
        {isActive && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">ຈັດການ:</span>
              {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                <PendingConfirmedActions
                  reservationId={r.id}
                  guestName={r.guest.name}
                  totalAmount={r.totalAmount}
                  alreadyPaid={paidAmount}
                  checkIn={r.checkIn.toISOString()}
                  checkOut={r.checkOut.toISOString()}
                  roomPrice={r.room.price}
                />
              )}
              {r.status === "CHECKED_IN" && (
                <CheckedInActions
                  reservationId={r.id}
                  currentRoomId={r.roomId}
                  availableRooms={availableRooms}
                  checkIn={r.checkIn.toISOString()}
                  checkOut={r.checkOut.toISOString()}
                  totalAmount={r.totalAmount}
                  alreadyPaid={paidAmount}
                  guestName={r.guest.name}
                  roomPrice={r.room.price}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Payment history */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ປະຫວັດການຊຳລະ</h2>
        </div>
        {r.payments.length === 0 ? (
          <p className="px-6 py-6 text-sm text-slate-400">ຍັງບໍ່ມີການຊຳລະ</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="px-4 py-2.5 text-left font-semibold">ວັນ/ເວລາ</th>
                  <th className="px-4 py-2.5 text-left font-semibold">ຊ່ອງທາງ</th>
                  <th className="px-4 py-2.5 text-left font-semibold">ລາຍການ</th>
                  <th className="px-4 py-2.5 text-right font-semibold">ຈຳນວນ</th>
                  <th className="px-4 py-2.5 text-center font-semibold">ສະຖານະ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {r.payments.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmtDateTime(p.createdAt.toISOString())}</td>
                    <td className="px-4 py-3 text-slate-700">{paymentMethodLabel[p.method] ?? p.method}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {p.note ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">₭{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${
                        p.status === "COMPLETED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : p.status === "REFUNDED"
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {p.status === "COMPLETED" ? "ສຳເລັດ" : p.status === "REFUNDED" ? "ຄືນເງິນ" : p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Audit trail */}
      {auditLogs.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">ປະຫວັດການດຳເນີນການ</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase">
                  <th className="px-4 py-2.5 text-left font-semibold">ວັນ/ເວລາ</th>
                  <th className="px-4 py-2.5 text-left font-semibold">ພະນັກງານ</th>
                  <th className="px-4 py-2.5 text-left font-semibold">ດຳເນີນການ</th>
                  <th className="px-4 py-2.5 text-left font-semibold">ລາຍລະອຽດ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{fmtDateTime(log.createdAt.toISOString())}</td>
                    <td className="px-4 py-3 text-slate-700">{log.user?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {actionLaoLabel[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{log.details ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
