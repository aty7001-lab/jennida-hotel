"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { createPayment } from "@/actions/payments";

interface Props {
  reservationId: string;
  guestName: string;
  totalAmount: number;
  alreadyPaid: number;
}

const methods = [
  { value: "CASH", label: "ເງິນສົດ" },
  { value: "TRANSFER", label: "ໂອນເງິນ" },
  { value: "CREDIT_CARD", label: "ບັດເຄຣດິດ" },
];

export default function RecordPaymentButton({ reservationId, guestName, totalAmount, alreadyPaid }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const balance = Math.max(0, totalAmount - alreadyPaid);
  const [amount, setAmount] = useState(balance > 0 ? String(balance) : "");
  const [method, setMethod] = useState("CASH");

  function open() {
    setAmount(balance > 0 ? String(balance) : "");
    setMethod("CASH");
    setError("");
    setIsOpen(true);
  }

  async function handleSubmit() {
    const value = parseFloat(amount);
    if (!value || value <= 0) {
      setError("ກະລຸນາປ້ອນຈຳນວນເງິນ");
      return;
    }
    setIsLoading(true);
    setError("");
    const fd = new FormData();
    fd.set("reservationId", reservationId);
    fd.set("amount", String(value));
    fd.set("method", method);
    const result = await createPayment(fd);
    setIsLoading(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    setIsOpen(false);
    router.refresh();
  }

  const inputClass =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";

  return (
    <>
      <button
        onClick={open}
        title="ບັນທຶກການຊຳລະເງິນ"
        className="px-2 py-1 text-[11px] font-medium rounded bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors inline-flex items-center gap-1"
      >
        <Wallet size={11} />
        ຊຳລະ
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isLoading && setIsOpen(false)} />
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">ບັນທຶກການຊຳລະເງິນ</h3>
              <p className="text-sm text-slate-500 mb-4">{guestName}</p>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">ລາຄາລວມ</div>
                  <div className="font-semibold text-slate-900">₭{totalAmount.toLocaleString()}</div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-slate-400 mb-1">ຍັງຄ້າງ</div>
                  <div className="font-semibold text-rose-600">₭{balance.toLocaleString()}</div>
                </div>
              </div>

              <label className="block text-xs font-medium text-slate-500 mb-1">ຈຳນວນເງິນທີ່ຮັບ (₭)</label>
              <input
                type="text"
                inputMode="numeric"
                value={amount ? Number(amount).toLocaleString("en-US") : ""}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="0"
                className={`${inputClass} mb-3`}
              />

              <label className="block text-xs font-medium text-slate-500 mb-1">ວິທີຊຳລະ</label>
              <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
                {methods.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>

              {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
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
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isLoading ? "ກຳລັງບັນທຶກ..." : "ຢືນຢັນການຊຳລະ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
