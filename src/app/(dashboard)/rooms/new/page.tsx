import { createRoom } from "@/actions/manage-rooms";
import { getAllBranches } from "@/actions/branches";
import { getRoomTypesByBranch } from "@/actions/room-types";
import { getActiveBranchId } from "@/lib/active-branch";
import { Bed } from "lucide-react";
import Link from "next/link";

export default async function NewRoomPage({ searchParams }: { searchParams: Promise<{ branchId?: string }> }) {
  const { branchId: paramBranchId } = await searchParams;
  const cookieBranchId = await getActiveBranchId();
  const activeBranchId = paramBranchId || cookieBranchId || "";

  const [branches, roomTypes] = await Promise.all([
    getAllBranches(),
    activeBranchId ? getRoomTypesByBranch(activeBranchId) : Promise.resolve([]),
  ]);

  const inputClass = "w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ເພີ່ມຫ້ອງໃໝ່</h1>
        <p className="text-sm text-slate-500 mt-1">ສ້າງຫ້ອງພັກໃໝ່ໃນລະບົບ</p>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <form action={createRoom}>
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-100">
              <Bed className="text-indigo-500" size={20} />
              <h2 className="text-lg font-semibold text-slate-800">ຂໍ້ມູນຫ້ອງ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ເລກຫ້ອງ <span className="text-red-500">*</span></label>
                <input name="number" type="text" required placeholder="ເຊັ່ນ: 401" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ປະເພດຫ້ອງ <span className="text-red-500">*</span></label>
                {roomTypes.length > 0 ? (
                  <select name="roomTypeId" required className={inputClass}>
                    <option value="" disabled>ເລືອກປະເພດ</option>
                    {roomTypes.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full border border-amber-300 rounded-md px-3.5 py-2.5 bg-amber-50 text-amber-700 text-sm">
                    ຍັງບໍ່ມີປະເພດຫ້ອງ —{" "}
                    <Link href="/room-types/new" className="underline font-medium">ສ້າງປະເພດໃໝ່ກ່ອນ</Link>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ລາຄາ/ຄືນ (₭) <span className="text-red-500">*</span></label>
                <input name="price" type="number" step="1" min="0" required placeholder="200000" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">ສາຂາ <span className="text-red-500">*</span></label>
                <select name="branchId" required defaultValue={activeBranchId} className={inputClass}>
                  <option value="" disabled>ເລືອກສາຂາ</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <Link href="/rooms" className="px-5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
              ຍົກເລີກ
            </Link>
            <button type="submit" disabled={roomTypes.length === 0} className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              ສ້າງຫ້ອງ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
