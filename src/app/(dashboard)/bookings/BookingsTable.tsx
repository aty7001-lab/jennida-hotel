"use client";

import { useState, useCallback } from "react";
import { Printer, CheckSquare, Square } from "lucide-react";
import { SlipReservation } from "@/components/BookingSlipButton";
import BookingSlipButton from "@/components/BookingSlipButton";
import RecordPaymentButton from "@/components/RecordPaymentButton";
import { CheckInButton, CheckOutButton, CancelButton, MoveRoomButton } from "./ReservationActions";

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

type AvailableRoom = { id: string; number: string; type: string; price: number };

interface Props {
  reservations: SlipReservation[];
  availableRooms: AvailableRoom[];
  isStaff: boolean;
  totalCount: number;
  statusFilter?: string;
}

function fmtDateShort(s: string) {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

export default function BookingsTable({ reservations, availableRooms, isStaff, totalCount, statusFilter }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allIds = reservations.map(r => r.id);
  const allSelected = allIds.length > 0 && allIds.every(id => selected.has(id));
  const someSelected = selected.size > 0;

  const toggleOne = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected(allSelected ? new Set() : new Set(allIds));
  }, [allSelected, allIds]);

  const openGroupPrint = useCallback(() => {
    const ids = [...selected].join(",");
    window.open(`/print/group?ids=${ids}`, "_blank");
  }, [selected]);

  return (
    <>
      {/* ── Bulk action bar (floats above table when any selected) ── */}
      {someSelected && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 border-b border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-700 text-sm font-medium">
            <CheckSquare size={16} />
            ເລືອກແລ້ວ {selected.size} ການຈອງ
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-indigo-500 hover:text-indigo-700 transition-colors px-2 py-1"
            >
              ລ້າງ
            </button>
            <button
              onClick={openGroupPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white
                bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Printer size={13} />
              ພິມສລິບລວມ {selected.size} ຫ້ອງ (1 ໃບ)
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              {/* select-all checkbox */}
              <th className="pl-4 pr-2 py-3">
                <button onClick={toggleAll} className="flex items-center text-slate-400 hover:text-indigo-600 transition-colors">
                  {allSelected
                    ? <CheckSquare size={15} className="text-indigo-600" />
                    : <Square size={15} />}
                </button>
              </th>
              <th className="px-3 py-3 font-semibold">ແຂກ</th>
              <th className="px-3 py-3 font-semibold">ຫ້ອງ</th>
              {!isStaff && <th className="px-3 py-3 font-semibold">ສາຂາ</th>}
              <th className="px-3 py-3 font-semibold">ເຊັກອິນ</th>
              <th className="px-3 py-3 font-semibold">ເຊັກເອົ້າ</th>
              <th className="px-3 py-3 font-semibold">ຊ່ອງທາງ</th>
              <th className="px-3 py-3 font-semibold">ຈຳນວນ</th>
              <th className="px-3 py-3 font-semibold">ສະຖານະ</th>
              <th className="px-3 py-3 font-semibold text-right">ຈັດການ</th>
              <th className="px-3 py-3 font-semibold text-center">ສລິບ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={isStaff ? 10 : 11} className="px-4 py-8 text-center text-slate-500 text-sm">
                  ຍັງບໍ່ມີການຈອງ
                </td>
              </tr>
            ) : (
              reservations.map(r => {
                const isChecked = selected.has(r.id);
                return (
                  <tr
                    key={r.id}
                    className={`transition-colors ${isChecked ? "bg-indigo-50/60" : "hover:bg-slate-50/80"}`}
                  >
                    {/* row checkbox */}
                    <td className="pl-4 pr-2 py-2.5">
                      <button onClick={() => toggleOne(r.id)} className="flex items-center text-slate-300 hover:text-indigo-600 transition-colors">
                        {isChecked
                          ? <CheckSquare size={15} className="text-indigo-600" />
                          : <Square size={15} />}
                      </button>
                    </td>
                    <td className="px-3 py-2.5 text-sm text-slate-900 font-medium">{r.guest.name}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-700">#{r.room.number}</td>
                    {!isStaff && (
                      <td className="px-3 py-2.5 text-sm text-slate-700">{r.room.branch?.name || "-"}</td>
                    )}
                    <td className="px-3 py-2.5 text-sm text-slate-500">{fmtDateShort(r.checkIn)}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-500">{fmtDateShort(r.checkOut)}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-500">{sourceLabel[r.source] ?? r.source}</td>
                    <td className="px-3 py-2.5 text-sm text-slate-900">₭{r.totalAmount.toLocaleString()}</td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyle[r.status] ?? ""}`}>
                        {statusLabel[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right space-x-1">
                      {(r.status === "CONFIRMED" || r.status === "PENDING") && (
                        <>
                          <CheckInButton reservationId={r.id} />
                          <CancelButton reservationId={r.id} />
                          <RecordPaymentButton
                            reservationId={r.id}
                            guestName={r.guest.name}
                            totalAmount={r.totalAmount}
                            alreadyPaid={r.payments.filter(p => p.status === "COMPLETED").reduce((s, p) => s + p.amount, 0)}
                          />
                        </>
                      )}
                      {r.status === "CHECKED_IN" && (
                        <>
                          <MoveRoomButton reservationId={r.id} currentRoomId={r.roomId ?? ""} availableRooms={availableRooms} />
                          <CheckOutButton reservationId={r.id} />
                          <CancelButton reservationId={r.id} isCheckedIn />
                        </>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <BookingSlipButton reservation={r} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer count ── */}
      <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
        <span className="text-xs text-slate-500">
          ສະແດງ <span className="font-medium text-slate-900">{reservations.length}</span> ການຈອງ
          {statusFilter && <span className="ml-1 text-indigo-600">· {statusLabel[statusFilter]}</span>}
        </span>
        {someSelected && (
          <span className="text-xs text-indigo-600 font-medium">
            ເລືອກ {selected.size} / {reservations.length}
          </span>
        )}
      </div>

    </>
  );
}
