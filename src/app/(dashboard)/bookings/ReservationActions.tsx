"use client";

import { checkInReservation, checkOutReservation, cancelReservation } from "@/actions/reservations";
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

export function CancelButton({ reservationId }: { reservationId: string }) {
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
        message="ທ່ານແນ່ໃຈບໍ່ທີ່ຈະຍົກເລີກການຈອງນີ້? ເງິນຈະຖືກຄືນ ແລະ ຫ້ອງຈະວ່າງອີກຄັ້ງ."
        confirmText="ແມ່ນ, ຍົກເລີກການຈອງ"
        type="danger"
      />
    </>
  );
}
