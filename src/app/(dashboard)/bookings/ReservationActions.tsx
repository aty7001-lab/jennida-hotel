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
        Check-in
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Check-in"
        message="Are you sure you want to check-in this guest? The room status will be updated to OCCUPIED."
        confirmText="Confirm Check-in"
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
        Check-out
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm Check-out"
        message="Are you sure you want to check-out this guest? The room status will be updated to CLEANING."
        confirmText="Confirm Check-out"
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
        Cancel
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Cancel Reservation"
        message="Are you sure you want to cancel this reservation? The payment will be credited and the room will become available again."
        confirmText="Yes, Cancel Booking"
        type="danger"
      />
    </>
  );
}
