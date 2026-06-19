"use client";

import { useState } from "react";
import { Printer, X, FileText } from "lucide-react";
import SlipContent, { bookingNo } from "./SlipContent";

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
    createdAt: string;
  }>;
}

export default function BookingSlipButton({ reservation }: { reservation: SlipReservation }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="ພິມສລິບການຈອງ"
        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded border
          bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700
          hover:border-indigo-200 transition-colors"
      >
        <Printer size={11} />
        ສລິບ
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">

            {/* header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50 shrink-0">
              <div className="flex items-center gap-2 text-slate-700">
                <FileText size={16} />
                <span className="font-semibold text-sm">ສລິບໃບຢືນຢັນການຈອງ</span>
                <span className="text-xs text-slate-400 font-normal ml-1">{bookingNo(reservation.id)}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white
                    bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Printer size={13} />
                  ພິມ / Print
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 transition-colors">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* preview */}
            <div className="overflow-y-auto flex-1 bg-slate-100 p-6">
              <div id="booking-slip-print" className="shadow-md mx-auto w-fit">
                <SlipContent reservation={reservation} />
              </div>
            </div>
          </div>
        </div>
      )}

      {open && (
        <style>{`
          @page { size: A4 portrait; margin: 10mm; }
          @media print {
            body * { visibility: hidden !important; }
            #booking-slip-print, #booking-slip-print * {
              visibility: visible !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            #booking-slip-print {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 190mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          }
        `}</style>
      )}
    </>
  );
}
