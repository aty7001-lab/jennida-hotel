"use client";

import { useState, useRef } from "react";
import { CalendarDays, Banknote, UserCircle, Loader2 } from "lucide-react";
import { lookupGuestByPhone } from "@/actions/bookings";

type Room = {
  id: string;
  number: string;
  type: string;
  price: number;
  branch: { name: string } | null;
};

type Dict = {
  booking: {
    guestInfo: string;
    fullName: string;
    phone: string;
    stayDetails: string;
    checkIn: string;
    checkOut: string;
    roomType: string;
    cancel: string;
    confirm: string;
  };
};

export default function NewBookingForm({
  rooms,
  dict,
  createImmediateBooking,
  createAdvanceBooking,
}: {
  rooms: Room[];
  dict: Dict;
  createImmediateBooking: (formData: FormData) => Promise<void>;
  createAdvanceBooking: (formData: FormData) => Promise<void>;
}) {
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [lookupState, setLookupState] = useState<"idle" | "loading" | "found" | "new">("idle");

  async function handlePhoneBlur(phoneVal: string) {
    const digits = phoneVal.replace(/\D/g, "");
    if (digits.length < 6) { setLookupState("idle"); return; }
    setLookupState("loading");
    const guest = await lookupGuestByPhone(phoneVal);
    if (guest) {
      setGuestName(guest.name);
      if (guest.email) setEmail(guest.email);
      setLookupState("found");
    } else {
      setLookupState("new");
    }
  }
  const [depositTransfer, setDepositTransfer] = useState("");
  const [depositCash, setDepositCash] = useState("");

  function calcNights(ci: string, co: string): number {
    if (!ci || !co) return 0;
    return Math.round(
      (new Date(co).getTime() - new Date(ci).getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  function toggleRoom(roomId: string) {
    const newSelected = new Set(selectedRooms);
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId);
    } else {
      newSelected.add(roomId);
    }
    setSelectedRooms(newSelected);
  }

  function getSelectedRoomObjects(): Room[] {
    return rooms.filter((r) => selectedRooms.has(r.id));
  }

  function calcTotalAmount(): number {
    const nights = calcNights(checkIn, checkOut);
    if (nights <= 0) return 0;
    return getSelectedRoomObjects().reduce((sum, room) => sum + room.price * nights, 0);
  }

  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmitWithType(bookingType: "immediate" | "advance") {
    if (selectedRooms.size === 0) {
      alert("ກະລຸນາເລືອກຢ່າງໜ້ອຍຫນຶ່ງຫ້ອງ");
      return;
    }
    if (!checkIn || !checkOut) {
      alert("ກະລຸນາເລືອກວັນທີເຊັກອິນ ແລະ ເຊັກເອົ້າ");
      return;
    }
    if (!guestName || !phone) {
      alert("ກະລຸນາໃສ່ຊື່ ແລະ ເບີໂທລະສັບຂອງແຂກ");
      return;
    }

    const form = formRef.current!;
    const sourceEl = form.elements.namedItem("source") as HTMLInputElement;

    const formData = new FormData();
    formData.append("guestName", guestName);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("checkIn", checkIn);
    formData.append("checkOut", checkOut);
    formData.append("roomIds", JSON.stringify(Array.from(selectedRooms)));
    formData.append("totalAmount", String(calcTotalAmount()));
    formData.append("depositTransfer", depositTransfer || "0");
    formData.append("depositCash", depositCash || "0");
    formData.append("source", sourceEl?.value || "WALK_IN");

    if (bookingType === "immediate") {
      createImmediateBooking(formData);
    } else {
      createAdvanceBooking(formData);
    }
  }

  const inputClass =
    "w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  const nights = calcNights(checkIn, checkOut);
  const totalAmount = calcTotalAmount();
  const selectedRoomObjects = getSelectedRoomObjects();
  const totalDeposit = (parseFloat(depositTransfer) || 0) + (parseFloat(depositCash) || 0);
  const outstanding = totalAmount - totalDeposit;

  return (
    <form ref={formRef} onSubmit={(e) => e.preventDefault()}>
      <div className="p-6 md:p-8 space-y-10">
        {/* Guest Info */}
        <section>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <UserCircle className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">{dict.booking.guestInfo}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Phone first — triggers lookup */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.phone}</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setLookupState("idle"); setGuestName(""); setEmail(""); }}
                  onBlur={(e) => handlePhoneBlur(e.target.value)}
                  className={inputClass}
                  placeholder="+856 20 xxxx xxxx"
                />
                {lookupState === "loading" && (
                  <Loader2 size={15} className="absolute right-3 top-3 text-slate-400 animate-spin" />
                )}
              </div>
            </div>

            {/* Guest name — auto-filled if found */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">{dict.booking.fullName}</label>
                {lookupState === "found" && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    ✓ ພົບຂໍ້ມູນແຂກ
                  </span>
                )}
                {lookupState === "new" && (
                  <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                    + ແຂກໃໝ່
                  </span>
                )}
              </div>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={inputClass}
                placeholder="ສົມສາກ ສີສຸລິດ"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ອີເມວ</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="guest@email.com"
              />
            </div>
          </div>
        </section>

        {/* Stay Details */}
        <section>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <CalendarDays className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">{dict.booking.stayDetails}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.checkIn}</label>
              <input type="date" required value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.checkOut}</label>
              <input type="date" required value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-3">{dict.booking.roomType}</label>
              <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-200 rounded-md p-3 bg-slate-50">
                {rooms.map((room) => (
                  <label key={room.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white rounded transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedRooms.has(room.id)}
                      onChange={() => toggleRoom(room.id)}
                      className="accent-indigo-600 w-4 h-4"
                    />
                    <span className="flex-1 text-sm text-slate-700">
                      ຫ້ອງ {room.number} — {room.type} ({room.branch?.name}) · ₭{room.price.toLocaleString()}/ຄືນ
                    </span>
                    {selectedRooms.has(room.id) && nights > 0 && (
                      <span className="text-xs font-medium text-indigo-600">₭{(room.price * nights).toLocaleString()}</span>
                    )}
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-500">ເລືອກແລ້ວ: {selectedRooms.size} ຫ້ອງ</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ຊ່ອງທາງການຈອງ</label>
              <select name="source" required className={inputClass}>
                <option value="WALK_IN">ໂດຍກົງ</option>
                <option value="PHONE">ທາງໂທລະສັບ</option>
                <option value="OTA_AGODA">ອອນໄລນ໌ - Agoda</option>
                <option value="OTA_BOOKING">ອອນໄລນ໌ - Booking.com</option>
              </select>
            </div>
          </div>
        </section>

        {/* Booking Summary */}
        {selectedRooms.size > 0 && checkIn && checkOut && nights > 0 && (
          <section className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">ສະຫຼຸບການຈອງ</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">ຜູ້ເຂົ້າພັກ:</span>
                <span className="font-medium text-slate-900">{guestName || "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">ວັນທີ:</span>
                <span className="font-medium text-slate-900">
                  {new Date(checkIn).toLocaleDateString("lo-LA")} - {new Date(checkOut).toLocaleDateString("lo-LA")} ({nights} ຄືນ)
                </span>
              </div>
              <div className="border-t border-indigo-200 pt-3 mt-3">
                <p className="text-sm font-semibold text-slate-700 mb-2">ຫ້ອງທີ່ຈອງ:</p>
                {selectedRoomObjects.map((room) => (
                  <div key={room.id} className="flex justify-between text-sm ml-4 mb-1">
                    <span className="text-slate-600">ຫ້ອງ {room.number} ({room.type})</span>
                    <span className="text-slate-900">₭{(room.price * nights).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-indigo-200 pt-3 mt-3 space-y-1.5">
                <div className="flex justify-between text-base font-bold">
                  <span>ຍອດລວມທັງໝົດ:</span>
                  <span className="text-indigo-600">₭{totalAmount.toLocaleString()}</span>
                </div>
                {totalDeposit > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>ມັດຈຳທີ່ຮັບແລ້ວ:</span>
                      <span className="text-emerald-600 font-semibold">−₭{totalDeposit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-indigo-200 pt-2">
                      <span className="text-rose-700">ຍອດຄ້າງຊຳລະ (ຈ່າຍຕອນເຊັກອິນ):</span>
                      <span className="text-rose-700">₭{outstanding > 0 ? outstanding.toLocaleString() : "0"}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Payment Details — split transfer + cash */}
        <section>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <Banknote className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">ລາຍລະອຽດການຊຳລະ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Total amount (readonly) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ຍອດລວມ (₭)
                {selectedRooms.size > 0 && nights > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {selectedRooms.size} ຫ້ອງ × {nights} ຄືນ
                  </span>
                )}
              </label>
              <input
                type="number"
                disabled
                value={totalAmount}
                className={`${inputClass} bg-slate-100`}
                placeholder="0"
              />
            </div>

            {/* Transfer deposit */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                🏦 ມັດຈຳ — ໂອນເງິນ (₭)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={depositTransfer}
                onChange={(e) => setDepositTransfer(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </div>

            {/* Cash deposit */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                💵 ມັດຈຳ — ເງິນສົດ (₭)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={depositCash}
                onChange={(e) => setDepositCash(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </div>

            {/* Outstanding balance */}
            {(totalDeposit > 0 || totalAmount > 0) && nights > 0 && selectedRooms.size > 0 && (
              <div className="md:col-span-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-rose-600 font-medium">ຍອດຄ້າງຊຳລະ (ລູກຄ້າຈ່າຍຕອນເຊັກອິນ)</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    ຍອດລວມ ₭{totalAmount.toLocaleString()} − ມັດຈຳ ₭{totalDeposit.toLocaleString()}
                  </p>
                </div>
                <span className="text-xl font-bold text-rose-700">
                  ₭{outstanding > 0 ? outstanding.toLocaleString() : "0"}
                </span>
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
        <a
          href="/bookings"
          className="px-5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
        >
          {dict.booking.cancel}
        </a>
        <button
          type="button"
          onClick={() => handleSubmitWithType("advance")}
          disabled={selectedRooms.size === 0 || !checkIn || !checkOut || !guestName || !phone}
          className="px-5 py-2 bg-amber-500 rounded-md text-sm font-medium text-white shadow-sm hover:bg-amber-600 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 transition-colors"
        >
          ຈອງລ່ວງໜ້າ
        </button>
        <button
          type="button"
          onClick={() => handleSubmitWithType("immediate")}
          disabled={selectedRooms.size === 0 || !checkIn || !checkOut || !guestName || !phone}
          className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          ເຊັກອິນທັນທີ
        </button>
      </div>
    </form>
  );
}
