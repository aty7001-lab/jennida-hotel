import { getRoomTypeById, updateRoomType } from "@/actions/room-types";
import { Bed } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditRoomTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const roomType = await getRoomTypeById(id);

  if (!roomType) notFound();

  const updateWithId = updateRoomType.bind(null, id);

  const inputClass =
    "w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all";

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ແກ້ໄຂປະເພດຫ້ອງ</h1>
        <p className="text-sm text-slate-500 mt-1">ສາຂາ: {roomType.branch?.name}</p>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <form action={updateWithId}>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bed className="text-indigo-500" size={20} />
              <h2 className="text-lg font-semibold text-slate-800">ຂໍ້ມູນປະເພດ</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ຊື່ປະເພດ</label>
              <input
                name="name"
                type="text"
                required
                defaultValue={roomType.name}
                className={inputClass}
              />
              {roomType._count.rooms > 0 && (
                <p className="text-xs text-amber-600 mt-1.5">
                  ປະເພດນີ້ຖືກໃຊ້ໂດຍ {roomType._count.rooms} ຫ້ອງ — ການປ່ຽນຊື່ຈະສົ່ງຜົນທັນທີ
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <Link
              href="/room-types"
              className="px-5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              ຍົກເລີກ
            </Link>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              ອັບເດດ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
