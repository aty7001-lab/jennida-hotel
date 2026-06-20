import { getRoomTypes } from "@/actions/room-types";
import { getAllBranches } from "@/actions/branches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";
import { DeleteRoomTypeButton } from "@/components/DeleteRoomTypeButton";
import { Plus, Bed, Edit2, Building2 } from "lucide-react";
import Link from "next/link";

export default async function RoomTypesPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === "ADMIN";
  const cookieBranchId = await getActiveBranchId();

  const [roomTypes, branches] = await Promise.all([
    getRoomTypes(cookieBranchId || undefined),
    getAllBranches(),
  ]);

  const branchMap = Object.fromEntries(branches.map((b) => [b.id, b.name]));

  // Group by branch when admin sees all
  const grouped = branches.reduce(
    (acc, b) => {
      acc[b.id] = roomTypes.filter((t) => t.branchId === b.id);
      return acc;
    },
    {} as Record<string, typeof roomTypes>
  );

  const showGrouped = isAdmin && !cookieBranchId;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ປະເພດຫ້ອງ</h1>
          <p className="text-sm text-slate-500 mt-1">ຈັດການປະເພດຫ້ອງພັກສຳລັບແຕ່ລະສາຂາ</p>
        </div>
        {isAdmin && (
          <Link
            href="/room-types/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            ເພີ່ມປະເພດໃໝ່
          </Link>
        )}
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        {showGrouped ? (
          <div className="divide-y divide-slate-200">
            {branches.map((branch) => {
              const types = grouped[branch.id] ?? [];
              return (
                <div key={branch.id}>
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-indigo-500" />
                      <span className="font-semibold text-slate-800 text-sm">{branch.name}</span>
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{branch.code}</span>
                    </div>
                    <Link
                      href={`/room-types/new?branchId=${branch.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      <Plus size={13} />ເພີ່ມ
                    </Link>
                  </div>
                  <TypeTable types={types} branchMap={branchMap} isAdmin={isAdmin} />
                </div>
              );
            })}
          </div>
        ) : (
          <TypeTable types={roomTypes} branchMap={branchMap} isAdmin={isAdmin} showBranch={false} />
        )}
      </div>
    </div>
  );
}

function TypeTable({
  types,
  branchMap,
  isAdmin,
  showBranch = true,
}: {
  types: Awaited<ReturnType<typeof getRoomTypes>>;
  branchMap: Record<string, string>;
  isAdmin: boolean;
  showBranch?: boolean;
}) {
  return (
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
          <th className="px-4 py-3 font-semibold">ຊື່ປະເພດ</th>
          {showBranch && <th className="px-4 py-3 font-semibold">ສາຂາ</th>}
          <th className="px-4 py-3 font-semibold text-center">ຈຳນວນຫ້ອງ</th>
          {isAdmin && <th className="px-4 py-3 font-semibold text-right">ຈັດການ</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {types.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-sm">
              ຍັງບໍ່ມີປະເພດຫ້ອງ — ກົດ &ldquo;ເພີ່ມປະເພດໃໝ່&rdquo; ເພື່ອເລີ່ມຕົ້ນ
            </td>
          </tr>
        ) : (
          types.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-slate-900 flex items-center gap-2">
                <Bed size={14} className="text-slate-400" />
                {t.name}
              </td>
              {showBranch && (
                <td className="px-4 py-3 text-sm text-slate-600">{branchMap[t.branchId] ?? "—"}</td>
              )}
              <td className="px-4 py-3 text-sm text-slate-600 text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${t._count.rooms > 0 ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                  {t._count.rooms} ຫ້ອງ
                </span>
              </td>
              {isAdmin && (
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/room-types/${t.id}/edit`}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="ແກ້ໄຂ"
                    >
                      <Edit2 size={15} />
                    </Link>
                    <DeleteRoomTypeButton id={t.id} name={t.name} roomCount={t._count.rooms} />
                  </div>
                </td>
              )}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
