import { createRoomType } from "@/actions/room-types";
import { getAllBranches } from "@/actions/branches";
import { getActiveBranchId } from "@/lib/active-branch";
import { Bed } from "lucide-react";
import Link from "next/link";

export default async function NewRoomTypePage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string }>;
}) {
  const { branchId: paramBranchId } = await searchParams;
  const cookieBranchId = await getActiveBranchId();
  const defaultBranchId = paramBranchId || cookieBranchId || "";

  const branches = await getAllBranches();

  const inputClass =
    "w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ເພີ່ມປະເພດຫ້ອງ</h1>
        <p className="text-sm text-slate-500 mt-1">ສ້າງປະເພດຫ້ອງໃໝ່ສຳລັບສາຂາ</p>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <form action={createRoomType}>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Bed className="text-indigo-500" size={20} />
              <h2 className="text-lg font-semibold text-slate-800">ຂໍ້ມູນປະເພດ</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ຊື່ປະເພດ <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="ເຊັ່ນ: 1 ຕຽງ, Suite, Deluxe"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ສາຂາ <span className="text-red-500">*</span>
              </label>
              <select name="branchId" required defaultValue={defaultBranchId} className={inputClass}>
                <option value="" disabled>ເລືອກສາຂາ</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                ))}
              </select>
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
              ສ້າງປະເພດ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
