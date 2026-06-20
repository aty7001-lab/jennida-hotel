import { updateRoom } from "@/actions/manage-rooms";
import { getRoomById } from "@/actions/rooms";
import { getAllBranches } from "@/actions/branches";
import { getRoomTypesByBranch } from "@/actions/room-types";
import { Bed } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await getRoomById(id);

  if (!room) notFound();

  const [branches, roomTypes] = await Promise.all([
    getAllBranches(),
    getRoomTypesByBranch(room.branchId),
  ]);

  const updateRoomWithId = updateRoom.bind(null, id);

  const inputClass = "w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ແກ້ໄຂຂໍ້ມູນຫ້ອງ</h1>
        <p className="text-sm text-slate-500 mt-1">ອັບເດດຂໍ້ມູນຫ້ອງໃນລະບົບ.</p>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <form action={updateRoomWithId}>
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-100">
              <Bed className="text-indigo-500" size={20} />
              <h2 className="text-lg font-semibold text-slate-800">ຂໍ້ມູນຫ້ອງ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ເລກຫ້ອງ</label>
                <input name="number" type="text" defaultValue={room.number} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ປະເພດຫ້ອງ</label>
                <select name="roomTypeId" defaultValue={room.roomTypeId} required className={inputClass}>
                  {roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ລາຄາ/ຄືນ (₭)</label>
                <input name="price" type="number" step="0.01" min="0" defaultValue={room.price} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ສາຂາ</label>
                <select name="branchId" defaultValue={room.branchId} required className={inputClass}>
                  <option value="" disabled>ເລືອກສາຂາ</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <Link href="/rooms" className="px-5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              ຍົກເລີກ
            </Link>
            <button type="submit" className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              ອັບເດດຫ້ອງ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
