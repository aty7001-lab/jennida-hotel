"use client";

import { useState } from "react";
import { CalendarDays, Banknote, UserCircle, Check } from "lucide-react";

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
  action,
}: {
  rooms: Room[];
  dict: Dict;
  action: (formData: FormData) => Promise<void>;
}) {
  const [selectedRooms, setSelectedRooms] = useState<Set<string>>(new Set());
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [deposit, setDeposit] = useState("");

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
    const selectedRoomObjects = getSelectedRoomObjects();
    return selectedRoomObjects.reduce((sum, room) => sum + room.price * nights, 0);
  }

  function handleCheckIn(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckIn(e.target.value);
  }

  function handleCheckOut(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckOut(e.target.value);
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

    const formData = new FormData();
    formData.append("guestName", guestName);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("checkIn", checkIn);
    formData.append("checkOut", checkOut);
    formData.append("roomIds", JSON.stringify(Array.from(selectedRooms)));
    formData.append("totalAmount", String(calcTotalAmount()));
    formData.append("deposit", deposit || "0");
    formData.append("source", (e.currentTarget.elements.namedItem("source") as HTMLInputElement)?.value || "WALK_IN");
    formData.append("paymentMethod", (e.currentTarget.elements.namedItem("paymentMethod") as HTMLInputElement)?.value || "CASH");

    action(formData);
  }

  const inputClass =
    "w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  const nights = calcNights(checkIn, checkOut);
  const totalAmount = calcTotalAmount();
  const selectedRoomObjects = getSelectedRoomObjects();

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="p-6 md:p-8 space-y-10">
        {/* Guest Info */}
        <section>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <UserCircle className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">{dict.booking.guestInfo}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.fullName}</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className={inputClass}
                placeholder="ສົມສາກ ສີສຸລິດ"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.phone}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                placeholder="+856 20 xxxx xxxx"
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
              <input type="date" required value={checkIn} onChange={handleCheckIn} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.checkOut}</label>
              <input type="date" required value={checkOut} onChange={handleCheckOut} className={inputClass} />
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
              <p className="mt-2 text-xs text-slate-500">
                ເລືອກແລ້ວ: {selectedRooms.size} ຫ້ອງ
              </p>
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

        {/* Summary Section */}
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
              <div className="border-t border-indigo-200 pt-3 mt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>ຍອດລວມ:</span>
                  <span className="text-indigo-600">₭{totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Payment Details */}
        <section>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <Banknote className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">ລາຍລະອຽດການຊຳລະ</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
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
                step="1"
                min="0"
                disabled
                value={totalAmount}
                className={`${inputClass} bg-slate-100`}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ເງິນມັດຈຳ (₭)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ວິທີຊຳລະເງິນ</label>
              <div className="flex gap-3 mt-1">
                <label className="flex-1 flex items-center gap-3 border border-slate-300 rounded-md px-4 py-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                  <input type="radio" name="paymentMethod" value="CASH" defaultChecked className="accent-indigo-600 w-4 h-4" />
                  <span className="text-sm font-medium text-slate-800">💵 ເງິນສົດ</span>
                </label>
                <label className="flex-1 flex items-center gap-3 border border-slate-300 rounded-md px-4 py-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                  <input type="radio" name="paymentMethod" value="TRANSFER" className="accent-indigo-600 w-4 h-4" />
                  <span className="text-sm font-medium text-slate-800">🏦 ໂອນເງິນ</span>
                </label>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
        <a href="/bookings" className="px-5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
          {dict.booking.cancel}
        </a>
        <button
          type="submit"
          disabled={selectedRooms.size === 0 || !checkIn || !checkOut || !guestName || !phone}
          className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          {dict.booking.confirm}
        </button>
      </div>
    </form>
  );
}
