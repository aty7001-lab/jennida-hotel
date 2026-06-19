"use client";

import { Printer } from "lucide-react";

export interface SlipReservation {
  id: string;
  createdAt: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  totalAmount: number;
  deposit: number;
  credit: number;
  roomId?: string;
  guest: {
    name: string;
    phone?: string | null;
    email?: string | null;
    idCard?: string | null;
  };
  room: {
    number: string;
    type: string;
    price: number;
    branch: {
      name: string;
      address?: string | null;
      code: string;
    };
  };
  payments: Array<{
    amount: number;
    method: string;
    status: string;
    note?: string | null;
    createdAt: string;
  }>;
}

export default function BookingSlipButton({ reservation }: { reservation: SlipReservation }) {
  return (
    <button
      onClick={() => window.open(`/print/slip/${reservation.id}`, "_blank")}
      title="ພິມສລິບການຈອງ"
      className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border
        bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700
        hover:border-indigo-200 transition-colors"
    >
      <Printer size={11} />
      ສລິບ
    </button>
  );
}
