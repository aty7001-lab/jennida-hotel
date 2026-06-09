"use client";

import { useRef, useState } from "react";
import { CalendarDays, Banknote, UserCircle } from "lucide-react";

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
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [totalAmount, setTotalAmount] = useState("");

  function calcTotal(room: Room | null, ci: string, co: string) {
    if (!room) return;
    if (ci && co) {
      const nights = Math.round(
        (new Date(co).getTime() - new Date(ci).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (nights > 0) {
        setTotalAmount(String(room.price * nights));
        return;
      }
    }
    // ถ้ายังไม่มีวัน ให้ใส่ราคา 1 คืนก่อน
    setTotalAmount(String(room.price));
  }

  function handleRoomChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const room = rooms.find((r) => r.id === e.target.value) ?? null;
    setSelectedRoom(room);
    calcTotal(room, checkIn, checkOut);
  }

  function handleCheckIn(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckIn(e.target.value);
    calcTotal(selectedRoom, e.target.value, checkOut);
  }

  function handleCheckOut(e: React.ChangeEvent<HTMLInputElement>) {
    setCheckOut(e.target.value);
    calcTotal(selectedRoom, checkIn, e.target.value);
  }

  const inputClass =
    "w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  const nights =
    checkIn && checkOut
      ? Math.round(
          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <form action={action}>
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
              <input name="guestName" type="text" required className={inputClass} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.phone}</label>
              <input name="phone" type="tel" required className={inputClass} placeholder="+856 20 xxxx xxxx" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input name="email" type="email" className={inputClass} placeholder="guest@email.com" />
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
              <input name="checkIn" type="date" required value={checkIn} onChange={handleCheckIn} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.checkOut}</label>
              <input name="checkOut" type="date" required value={checkOut} onChange={handleCheckOut} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">{dict.booking.roomType}</label>
              <select name="roomId" required onChange={handleRoomChange} className={inputClass}>
                <option value="" disabled>Select an available room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    Room {room.number} — {room.type} ({room.branch?.name}) · ₭{room.price.toLocaleString()}/night
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Booking Source</label>
              <select name="source" required className={inputClass}>
                <option value="WALK_IN">Walk-in</option>
                <option value="PHONE">Phone</option>
                <option value="OTA_AGODA">OTA - Agoda</option>
                <option value="OTA_BOOKING">OTA - Booking.com</option>
              </select>
            </div>
          </div>
        </section>

        {/* Payment Details */}
        <section>
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100">
            <Banknote className="text-indigo-500" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Payment Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Total Amount (₭)
                {selectedRoom && nights > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    ₭{selectedRoom.price.toLocaleString()} × {nights} ຄືນ
                  </span>
                )}
              </label>
              <input
                name="totalAmount"
                type="number"
                step="1"
                min="0"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className={inputClass}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Deposit (₭)</label>
              <input name="deposit" type="number" step="1" min="0" defaultValue="0" className={inputClass} placeholder="0" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ວິທີຊຳລະເງິນ / Payment Method</label>
              <div className="flex gap-3 mt-1">
                <label className="flex-1 flex items-center gap-3 border border-slate-300 rounded-md px-4 py-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                  <input type="radio" name="paymentMethod" value="CASH" defaultChecked className="accent-indigo-600 w-4 h-4" />
                  <span className="text-sm font-medium text-slate-800">💵 ເງິນສົດ / Cash</span>
                </label>
                <label className="flex-1 flex items-center gap-3 border border-slate-300 rounded-md px-4 py-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                  <input type="radio" name="paymentMethod" value="TRANSFER" className="accent-indigo-600 w-4 h-4" />
                  <span className="text-sm font-medium text-slate-800">🏦 ເງິນໂອນ / Transfer</span>
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
        <button type="submit" className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
          {dict.booking.confirm}
        </button>
      </div>
    </form>
  );
}
