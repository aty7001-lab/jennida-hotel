"use client";

import { checkInReservation, checkOutReservation, cancelReservation, moveRoomReservation } from "@/actions/reservations";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/ConfirmModal";

export function CheckInButton({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    await checkInReservation(reservationId);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-[11px] font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
      >
        ເຊັກອິນ
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="ຢືນຢັນການເຊັກອິນ"
        message="ທ່ານແນ່ໃຈບໍ່ທີ່ຈະເຊັກອິນແຂກນີ້? ສະຖານະຫ້ອງຈະຖືກອັບເດດເປັນ ມີແຂກ."
        confirmText="ຢືນຢັນເຊັກອິນ"
        type="success"
      />
    </>
  );
}

export function CheckOutButton({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    await checkOutReservation(reservationId);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-[11px] font-medium rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
      >
        ເຊັກເອົ້າ
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="ຢືນຢັນການເຊັກເອົ້າ"
        message="ທ່ານແນ່ໃຈບໍ່ທີ່ຈະເຊັກເອົ້າແຂກນີ້? ສະຖານະຫ້ອງຈະຖືກອັບເດດເປັນ ກຳລັງທຳຄວາມສະອາດ."
        confirmText="ຢືນຢັນເຊັກເອົ້າ"
        type="info"
      />
    </>
  );
}

export function CancelButton({ reservationId, isCheckedIn = false }: { reservationId: string; isCheckedIn?: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = async () => {
    await cancelReservation(reservationId);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-[11px] font-medium rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
      >
        ຍົກເລີກ
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="ຍົກເລີກການຈອງ"
        message={
          isCheckedIn
            ? "ແຂກຍັງເຊັກອິນຢູ່. ຕ້ອງການຍົກເລີກບໍ? ຫ້ອງຈະຖືກຕັ້ງເປັນ ກຳລັງທຳຄວາມສະອາດ."
            : "ທ່ານແນ່ໃຈບໍ່ທີ່ຈະຍົກເລີກການຈອງນີ້? ຫ້ອງຈະວ່າງອີກຄັ້ງ."
        }
        confirmText="ແມ່ນ, ຍົກເລີກ"
        type="danger"
      />
    </>
  );
}

type AvailableRoom = { id: string; number: string; type: string; price: number };

export function MoveRoomButton({
  reservationId,
  currentRoomId,
  availableRooms,
}: {
  reservationId: string;
  currentRoomId: string;
  availableRooms: AvailableRoom[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const otherRooms = availableRooms.filter((r) => r.id !== currentRoomId);

  const handleMove = async () => {
    if (!selectedRoomId) return;
    setIsLoading(true);
    try {
      await moveRoomReservation(reservationId, selectedRoomId);
      router.refresh();
      setIsOpen(false);
      setSelectedRoomId("");
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-2 py-1 text-[11px] font-medium rounded bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
      >
        ຍ້າຍຫ້ອງ
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => !isLoading && setIsOpen(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">ຍ້າຍຫ້ອງ</h3>
              <p className="text-sm text-slate-500 mb-4">ເລືອກຫ້ອງໃໝ່ທີ່ວ່າງ. ຫ້ອງເກົ່າຈະຖືກຕັ້ງເປັນ ກຳລັງທຳຄວາມສະອາດ.</p>
              {otherRooms.length === 0 ? (
                <p className="text-sm text-red-500">ບໍ່ມີຫ້ອງວ່າງ</p>
              ) : (
                <select
                  value={selectedRoomId}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— ເລືອກຫ້ອງໃໝ່ —</option>
                  {otherRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      ຫ້ອງ {r.number} ({r.type}) · ₭{r.price.toLocaleString()}/ຄືນ
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                ຍົກເລີກ
              </button>
              <button
                onClick={handleMove}
                disabled={!selectedRoomId || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                ຢືນຢັນຍ້າຍຫ້ອງ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
