"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Wallet } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { createPayment } from "@/actions/payments";
import {
  checkInReservation,
  checkOutReservation,
  cancelReservation,
  moveRoomReservation,
  extendStay,
  earlyCheckout,
  changeDates,
  addExtraCharge,
  applyDiscount,
} from "@/actions/reservations";
import { differenceInDays } from "date-fns";

type AvailableRoom = { id: string; number: string; type: string; price: number };

// ── Shared Primitives ───────────────────────────────────────────────────

const inputCls =
  "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function ModalShell({ onBgClick, children }: { onBgClick: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onBgClick} />
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ModalFooter({
  onCancel,
  onConfirm,
  confirmText,
  confirmCls,
  loading,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmText: string;
  confirmCls: string;
  loading: boolean;
}) {
  return (
    <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
      <button
        onClick={onCancel}
        disabled={loading}
        className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
      >
        ຍົກເລີກ
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50 transition-colors flex items-center gap-2 ${confirmCls}`}
      >
        {loading && <Spinner />}
        {confirmText}
      </button>
    </div>
  );
}

// ── Dropdown Menu ───────────────────────────────────────────────────────

function MoreActionsMenu({
  items,
}: {
  items: Array<{ label: string; onClick: () => void; danger?: boolean }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="px-2 py-1 text-[11px] font-medium rounded bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 transition-colors"
      >
        ⋯
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-white shadow-xl rounded-xl border border-slate-200 py-1 min-w-[152px]">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
              className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Payment Modal (inline, reused by both composites) ──────────────────

function PaymentModal({
  reservationId,
  guestName,
  totalAmount,
  alreadyPaid,
  onClose,
  onDone,
}: {
  reservationId: string;
  guestName: string;
  totalAmount: number;
  alreadyPaid: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const balance = Math.max(0, totalAmount - alreadyPaid);
  const [amount, setAmount] = useState(balance > 0 ? String(balance) : "");
  const [method, setMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const value = parseFloat(amount);
    if (!value || value <= 0) { setError("ກະລຸນາປ້ອນຈຳນວນເງິນ"); return; }
    setLoading(true);
    setError("");
    const fd = new FormData();
    fd.set("reservationId", reservationId);
    fd.set("amount", String(value));
    fd.set("method", method);
    const result = await createPayment(fd);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    onDone();
    onClose();
  }

  return (
    <ModalShell onBgClick={() => !loading && onClose()}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">ບັນທຶກການຊຳລະເງິນ</h3>
        <p className="text-sm text-slate-500 mb-4">{guestName}</p>
        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="text-slate-400 mb-1">ລາຄາລວມ</div>
            <div className="font-semibold text-slate-900">₭{totalAmount.toLocaleString()}</div>
          </div>
          <div className="bg-rose-50 rounded-lg p-3">
            <div className="text-rose-400 mb-1">ຍັງຄ້າງ</div>
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
          className={`${inputCls} mb-3`}
        />
        <label className="block text-xs font-medium text-slate-500 mb-1">ວິທີຊຳລະ</label>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls}>
          <option value="CASH">ເງິນສົດ</option>
          <option value="TRANSFER">ໂອນເງິນ</option>
          <option value="CREDIT_CARD">ບັດເຄຣດິດ</option>
        </select>
        {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
      </div>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handleSubmit}
        confirmText="ຢືນຢັນການຊຳລະ"
        confirmCls="bg-violet-600 hover:bg-violet-700"
        loading={loading}
      />
    </ModalShell>
  );
}

// ── Modal: Move Room ────────────────────────────────────────────────────

function MoveRoomModal({
  reservationId,
  currentRoomId,
  availableRooms,
  onClose,
  onDone,
}: {
  reservationId: string;
  currentRoomId: string;
  availableRooms: AvailableRoom[];
  onClose: () => void;
  onDone: () => void;
}) {
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [loading, setLoading] = useState(false);
  const otherRooms = availableRooms.filter((r) => r.id !== currentRoomId);

  async function handle() {
    if (!selectedRoomId) return;
    setLoading(true);
    try {
      await moveRoomReservation(reservationId, selectedRoomId);
      onDone();
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onBgClick={() => !loading && onClose()}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">ຍ້າຍຫ້ອງ</h3>
        <p className="text-sm text-slate-500 mb-4">ຫ້ອງເກົ່າຈະຖືກຕັ້ງເປັນ ກຳລັງທຳຄວາມສະອາດ.</p>
        {otherRooms.length === 0 ? (
          <p className="text-sm text-red-500">ບໍ່ມີຫ້ອງວ່າງ</p>
        ) : (
          <select value={selectedRoomId} onChange={(e) => setSelectedRoomId(e.target.value)} className={inputCls}>
            <option value="">— ເລືອກຫ້ອງໃໝ່ —</option>
            {otherRooms.map((r) => (
              <option key={r.id} value={r.id}>
                ຫ້ອງ {r.number} ({r.type}) · ₭{r.price.toLocaleString()}/ຄືນ
              </option>
            ))}
          </select>
        )}
      </div>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handle}
        confirmText="ຢືນຢັນຍ້າຍຫ້ອງ"
        confirmCls="bg-amber-600 hover:bg-amber-700"
        loading={loading || !selectedRoomId}
      />
    </ModalShell>
  );
}

// ── Modal: Extend Stay ──────────────────────────────────────────────────

function ExtendStayModal({
  reservationId,
  checkIn,
  checkOut,
  roomPrice,
  onClose,
  onDone,
}: {
  reservationId: string;
  checkIn: string;
  checkOut: string;
  roomPrice: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const minDate = new Date(checkOut);
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  const [newCheckOut, setNewCheckOut] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const currentNights = differenceInDays(new Date(checkOut), new Date(checkIn));
  const newNights = newCheckOut ? differenceInDays(new Date(newCheckOut), new Date(checkIn)) : 0;
  const extraNights = newNights - currentNights;
  const extraCost = extraNights > 0 ? extraNights * roomPrice : 0;

  async function handle() {
    if (!newCheckOut) { setError("ກະລຸນາເລືອກວັນ"); return; }
    setLoading(true);
    setError("");
    try {
      await extendStay(reservationId, newCheckOut);
      onDone();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onBgClick={() => !loading && onClose()}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">ຕໍ່ການຈອງ</h3>
        <p className="text-sm text-slate-500 mb-4">ເລືອກວັນເຊັກເອົ້າໃໝ່</p>
        <label className="block text-xs font-medium text-slate-500 mb-1">ວັນເຊັກເອົ້າໃໝ່</label>
        <input
          type="date"
          min={minDateStr}
          value={newCheckOut}
          onChange={(e) => setNewCheckOut(e.target.value)}
          className={`${inputCls} mb-3`}
        />
        {extraNights > 0 && (
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 px-4 py-3 text-xs text-indigo-700">
            ຕໍ່ເພີ່ມ <span className="font-bold">{extraNights} ຄືນ</span> · ຄ່າຫ້ອງເພີ່ມ{" "}
            <span className="font-bold">₭{extraCost.toLocaleString()}</span>
          </div>
        )}
        {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
      </div>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handle}
        confirmText="ຢືນຢັນຕໍ່ການຈອງ"
        confirmCls="bg-indigo-600 hover:bg-indigo-700"
        loading={loading}
      />
    </ModalShell>
  );
}

// ── Modal: Early Checkout ───────────────────────────────────────────────

function EarlyCheckoutModal({
  reservationId,
  checkIn,
  checkOut,
  totalAmount,
  alreadyPaid,
  roomPrice,
  onClose,
  onDone,
}: {
  reservationId: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  alreadyPaid: number;
  roomPrice: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const actualNights = Math.max(1, differenceInDays(today, new Date(checkIn)));
  const originalNights = differenceInDays(new Date(checkOut), new Date(checkIn));
  const savedNights = originalNights - actualNights;
  const priceDelta = roomPrice * (actualNights - originalNights);
  const newTotal = Math.max(alreadyPaid, totalAmount + priceDelta);
  const credit = alreadyPaid > newTotal ? alreadyPaid - newTotal : 0;

  async function handle() {
    setLoading(true);
    setError("");
    try {
      await earlyCheckout(reservationId);
      onDone();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onBgClick={() => !loading && onClose()}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">ອອກກ່ອນກຳນົດ</h3>
        <p className="text-sm text-slate-500 mb-4">ເຊັກເອົ້າໃນວັນນີ້ ({today.toLocaleDateString("lo-LA")})</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">ພັກຈິງ</span>
            <span className="font-medium">{actualNights} ຄືນ (ຈາກ {originalNights} ຄືນ)</span>
          </div>
          {savedNights > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">ຫຼຸດ</span>
              <span className="text-emerald-600 font-medium">−₭{(roomPrice * savedNights).toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-100 pt-2">
            <span className="text-slate-700 font-medium">ຍອດລວມໃໝ່</span>
            <span className="font-bold text-slate-900">₭{newTotal.toLocaleString()}</span>
          </div>
          {credit > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">ຄືນເງິນ (credit)</span>
              <span className="text-indigo-600 font-medium">₭{credit.toLocaleString()}</span>
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-600 mt-3">{error}</p>}
      </div>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handle}
        confirmText="ຢືນຢັນອອກກ່ອນ"
        confirmCls="bg-blue-600 hover:bg-blue-700"
        loading={loading}
      />
    </ModalShell>
  );
}

// ── Modal: Change Dates ─────────────────────────────────────────────────

function ChangeDatesModal({
  reservationId,
  currentCheckIn,
  currentCheckOut,
  roomPrice,
  onClose,
  onDone,
}: {
  reservationId: string;
  currentCheckIn: string;
  currentCheckOut: string;
  roomPrice: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const todayStr = new Date().toISOString().split("T")[0];
  const [checkIn, setCheckIn] = useState(currentCheckIn.split("T")[0]);
  const [checkOut, setCheckOut] = useState(currentCheckOut.split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const oldNights = differenceInDays(new Date(currentCheckOut), new Date(currentCheckIn));
  const newNights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const delta = newNights > 0 ? (newNights - oldNights) * roomPrice : 0;

  async function handle() {
    if (!checkIn || !checkOut) { setError("ກະລຸນາເລືອກວັນ"); return; }
    setLoading(true);
    setError("");
    try {
      await changeDates(reservationId, checkIn, checkOut);
      onDone();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onBgClick={() => !loading && onClose()}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">ດັດແກ້ວັນທີ</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ເຊັກອິນ</label>
            <input type="date" min={todayStr} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">ເຊັກເອົ້າ</label>
            <input type="date" min={checkIn || todayStr} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputCls} />
          </div>
        </div>
        {newNights > 0 && delta !== 0 && (
          <div className={`rounded-lg px-4 py-3 text-xs ${delta > 0 ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
            {delta > 0 ? `ຄ່າຫ້ອງເພີ່ມ ₭${delta.toLocaleString()}` : `ຄ່າຫ້ອງຫຼຸດ ₭${Math.abs(delta).toLocaleString()}`}
            {" · "}{newNights} ຄືນ
          </div>
        )}
        {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
      </div>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handle}
        confirmText="ຢືນຢັນດັດແກ້"
        confirmCls="bg-slate-800 hover:bg-slate-900"
        loading={loading}
      />
    </ModalShell>
  );
}

// ── Modal: Extra Charge ─────────────────────────────────────────────────

function ExtraChargeModal({
  reservationId,
  guestName,
  onClose,
  onDone,
}: {
  reservationId: string;
  guestName: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    const value = parseFloat(amount);
    if (!value || value <= 0) { setError("ກະລຸນາປ້ອນຈຳນວນ"); return; }
    if (!note.trim()) { setError("ກະລຸນາລະບຸລາຍການ"); return; }
    setLoading(true);
    setError("");
    try {
      await addExtraCharge(reservationId, value, note.trim());
      onDone();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onBgClick={() => !loading && onClose()}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">ຄ່າໃຊ້ຈ່າຍເພີ່ມ</h3>
        <p className="text-sm text-slate-500 mb-4">{guestName}</p>
        <label className="block text-xs font-medium text-slate-500 mb-1">ລາຍການ (ເຊັ່ນ: ຄ່ານ້ຳ/ໄຟ, ອາຫານ, ຊ້ານ້ຳ)</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="ລະບຸລາຍການ..."
          className={`${inputCls} mb-3`}
        />
        <label className="block text-xs font-medium text-slate-500 mb-1">ຈຳນວນ (₭)</label>
        <input
          type="text"
          inputMode="numeric"
          value={amount ? Number(amount).toLocaleString("en-US") : ""}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          className={inputCls}
        />
        {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
      </div>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handle}
        confirmText="ເພີ່ມລາຍການ"
        confirmCls="bg-orange-600 hover:bg-orange-700"
        loading={loading}
      />
    </ModalShell>
  );
}

// ── Modal: Discount ─────────────────────────────────────────────────────

function DiscountModal({
  reservationId,
  guestName,
  totalAmount,
  alreadyPaid,
  onClose,
  onDone,
}: {
  reservationId: string;
  guestName: string;
  totalAmount: number;
  alreadyPaid: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const discountAmt = parseFloat(amount) || 0;
  const newTotal = totalAmount - discountAmt;

  async function handle() {
    if (!discountAmt || discountAmt <= 0) { setError("ກະລຸນາປ້ອນຈຳນວນ"); return; }
    if (!reason.trim()) { setError("ກະລຸນາລະບຸເຫດຜົນ"); return; }
    if (discountAmt > totalAmount) { setError("ຈຳນວນສ່ວນລົດຫຼາຍກວ່າຍອດລວມ"); return; }
    setLoading(true);
    setError("");
    try {
      await applyDiscount(reservationId, discountAmt, reason.trim());
      onDone();
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell onBgClick={() => !loading && onClose()}>
      <div className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-1">ສ່ວນລົດລາຄາ</h3>
        <p className="text-sm text-slate-500 mb-4">{guestName} · ຍອດລວມ ₭{totalAmount.toLocaleString()}</p>
        <label className="block text-xs font-medium text-slate-500 mb-1">ເຫດຜົນ</label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="ເຊັ່ນ: ລາຄາກຸ່ມ, ສ່ວນຫຼຸດພິເສດ..."
          className={`${inputCls} mb-3`}
        />
        <label className="block text-xs font-medium text-slate-500 mb-1">ຈຳນວນທີ່ຫຼຸດ (₭)</label>
        <input
          type="text"
          inputMode="numeric"
          value={amount ? Number(amount).toLocaleString("en-US") : ""}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="0"
          className={`${inputCls} mb-3`}
        />
        {discountAmt > 0 && discountAmt <= totalAmount && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-4 py-3 text-xs text-emerald-700">
            ຍອດລວມໃໝ່ <span className="font-bold">₭{newTotal.toLocaleString()}</span>
            {alreadyPaid > 0 && newTotal < alreadyPaid && (
              <span className="text-indigo-600 ml-2">(ຄືນ ₭{(alreadyPaid - newTotal).toLocaleString()})</span>
            )}
          </div>
        )}
        {error && <p className="text-xs text-rose-600 mt-2">{error}</p>}
      </div>
      <ModalFooter
        onCancel={onClose}
        onConfirm={handle}
        confirmText="ຢືນຢັນສ່ວນລົດ"
        confirmCls="bg-emerald-600 hover:bg-emerald-700"
        loading={loading}
      />
    </ModalShell>
  );
}

// ══ COMPOSITE: PENDING / CONFIRMED ════════════════════════════════════

export function PendingConfirmedActions({
  reservationId,
  guestName,
  totalAmount,
  alreadyPaid,
  checkIn,
  checkOut,
  roomPrice,
}: {
  reservationId: string;
  guestName: string;
  totalAmount: number;
  alreadyPaid: number;
  checkIn: string;
  checkOut: string;
  roomPrice: number;
}) {
  const router = useRouter();
  type ActiveModal = "checkIn" | "payment" | "dates" | "discount" | "cancel" | null;
  const [modal, setModal] = useState<ActiveModal>(null);
  const close = () => setModal(null);
  const done = () => { close(); router.refresh(); };

  return (
    <>
      {/* Primary inline */}
      <button
        onClick={() => setModal("checkIn")}
        className="px-2 py-1 text-[11px] font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
      >
        ເຊັກອິນ
      </button>
      <button
        onClick={() => setModal("payment")}
        className="px-2 py-1 text-[11px] font-medium rounded bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors inline-flex items-center gap-1"
      >
        <Wallet size={11} />
        ຊຳລະ
      </button>
      <MoreActionsMenu
        items={[
          { label: "ດັດແກ້ວັນ", onClick: () => setModal("dates") },
          { label: "ສ່ວນລົດ", onClick: () => setModal("discount") },
          { label: "ຍົກເລີກ", onClick: () => setModal("cancel"), danger: true },
        ]}
      />

      {/* Modals */}
      <ConfirmModal
        isOpen={modal === "checkIn"}
        onClose={close}
        onConfirm={async () => { await checkInReservation(reservationId); router.refresh(); }}
        title="ຢືນຢັນການເຊັກອິນ"
        message="ສະຖານະຫ້ອງຈະຖືກອັບເດດເປັນ ມີແຂກ."
        confirmText="ຢືນຢັນເຊັກອິນ"
        type="success"
      />
      {modal === "payment" && (
        <PaymentModal
          reservationId={reservationId}
          guestName={guestName}
          totalAmount={totalAmount}
          alreadyPaid={alreadyPaid}
          onClose={close}
          onDone={done}
        />
      )}
      {modal === "dates" && (
        <ChangeDatesModal
          reservationId={reservationId}
          currentCheckIn={checkIn}
          currentCheckOut={checkOut}
          roomPrice={roomPrice}
          onClose={close}
          onDone={done}
        />
      )}
      {modal === "discount" && (
        <DiscountModal
          reservationId={reservationId}
          guestName={guestName}
          totalAmount={totalAmount}
          alreadyPaid={alreadyPaid}
          onClose={close}
          onDone={done}
        />
      )}
      <ConfirmModal
        isOpen={modal === "cancel"}
        onClose={close}
        onConfirm={async () => { await cancelReservation(reservationId); router.refresh(); }}
        title="ຍົກເລີກການຈອງ"
        message="ທ່ານແນ່ໃຈບໍ່ທີ່ຈະຍົກເລີກການຈອງນີ້? ຫ້ອງຈະວ່າງອີກຄັ້ງ."
        confirmText="ແມ່ນ, ຍົກເລີກ"
        type="danger"
      />
    </>
  );
}

// ══ COMPOSITE: CHECKED_IN ═════════════════════════════════════════════

export function CheckedInActions({
  reservationId,
  currentRoomId,
  availableRooms,
  checkIn,
  checkOut,
  totalAmount,
  alreadyPaid,
  guestName,
  roomPrice,
}: {
  reservationId: string;
  currentRoomId: string;
  availableRooms: AvailableRoom[];
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  alreadyPaid: number;
  guestName: string;
  roomPrice: number;
}) {
  const router = useRouter();
  type ActiveModal =
    | "payment" | "checkout" | "move" | "extend"
    | "early" | "charge" | "discount" | "cancel" | null;
  const [modal, setModal] = useState<ActiveModal>(null);
  const close = () => setModal(null);
  const done = () => { close(); router.refresh(); };

  return (
    <>
      {/* Primary inline */}
      <button
        onClick={() => setModal("payment")}
        className="px-2 py-1 text-[11px] font-medium rounded bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors inline-flex items-center gap-1"
      >
        <Wallet size={11} />
        ຊຳລະ
      </button>
      <button
        onClick={() => setModal("checkout")}
        className="px-2 py-1 text-[11px] font-medium rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
      >
        ເຊັກເອົ້າ
      </button>
      <MoreActionsMenu
        items={[
          { label: "ຍ້າຍຫ້ອງ", onClick: () => setModal("move") },
          { label: "ຕໍ່ການຈອງ", onClick: () => setModal("extend") },
          { label: "ອອກກ່ອນ", onClick: () => setModal("early") },
          { label: "ຄ່າໃຊ້ຈ່າຍເພີ່ມ", onClick: () => setModal("charge") },
          { label: "ສ່ວນລົດ", onClick: () => setModal("discount") },
          { label: "ຍົກເລີກ", onClick: () => setModal("cancel"), danger: true },
        ]}
      />

      {/* Modals */}
      {modal === "payment" && (
        <PaymentModal
          reservationId={reservationId}
          guestName={guestName}
          totalAmount={totalAmount}
          alreadyPaid={alreadyPaid}
          onClose={close}
          onDone={done}
        />
      )}
      <ConfirmModal
        isOpen={modal === "checkout"}
        onClose={close}
        onConfirm={async () => { await checkOutReservation(reservationId); router.refresh(); }}
        title="ຢືນຢັນການເຊັກເອົ້າ"
        message="ຫ້ອງຈະຖືກຕັ້ງເປັນ ກຳລັງທຳຄວາມສະອາດ."
        confirmText="ຢືນຢັນເຊັກເອົ້າ"
        type="info"
      />
      {modal === "move" && (
        <MoveRoomModal
          reservationId={reservationId}
          currentRoomId={currentRoomId}
          availableRooms={availableRooms}
          onClose={close}
          onDone={done}
        />
      )}
      {modal === "extend" && (
        <ExtendStayModal
          reservationId={reservationId}
          checkIn={checkIn}
          checkOut={checkOut}
          roomPrice={roomPrice}
          onClose={close}
          onDone={done}
        />
      )}
      {modal === "early" && (
        <EarlyCheckoutModal
          reservationId={reservationId}
          checkIn={checkIn}
          checkOut={checkOut}
          totalAmount={totalAmount}
          alreadyPaid={alreadyPaid}
          roomPrice={roomPrice}
          onClose={close}
          onDone={done}
        />
      )}
      {modal === "charge" && (
        <ExtraChargeModal
          reservationId={reservationId}
          guestName={guestName}
          onClose={close}
          onDone={done}
        />
      )}
      {modal === "discount" && (
        <DiscountModal
          reservationId={reservationId}
          guestName={guestName}
          totalAmount={totalAmount}
          alreadyPaid={alreadyPaid}
          onClose={close}
          onDone={done}
        />
      )}
      <ConfirmModal
        isOpen={modal === "cancel"}
        onClose={close}
        onConfirm={async () => { await cancelReservation(reservationId); router.refresh(); }}
        title="ຍົກເລີກການຈອງ"
        message="ແຂກຍັງເຊັກອິນຢູ່. ຕ້ອງການຍົກເລີກບໍ? ຫ້ອງຈະຖືກຕັ້ງເປັນ ກຳລັງທຳຄວາມສະອາດ."
        confirmText="ແມ່ນ, ຍົກເລີກ"
        type="danger"
      />
    </>
  );
}
