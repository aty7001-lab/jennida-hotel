import Link from "next/link";
import { Plus, Edit2, Building2, Bed, Users } from "lucide-react";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DeleteBranchButton } from "@/components/DeleteBranchButton";

export default async function BranchesPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { rooms: true, users: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ສາຂາທັງໝົດ</h1>
          <p className="text-sm text-slate-500 mt-1">ຈັດການຂໍ້ມູນສາຂາ, ຫ້ອງພັກ ແລະ ພະນັກງານ</p>
        </div>
        <Link
          href="/branches/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          ເພີ່ມສາຂາໃໝ່
        </Link>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-md border border-slate-200 p-12 text-center">
          <Building2 className="mx-auto text-slate-300 mb-3" size={40} />
          <p className="text-slate-500 text-sm">ຍັງບໍ່ມີຂໍ້ມູນສາຂາ</p>
          <Link href="/branches/new" className="mt-4 inline-block text-indigo-600 text-sm font-medium hover:underline">
            ເພີ່ມສາຂາທຳອິດ →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div key={branch.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-100 p-2.5 rounded-lg">
                    <Building2 className="text-indigo-600" size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900 text-base leading-tight">{branch.name}</h2>
                    <span className="inline-block mt-0.5 text-[11px] font-mono font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      {branch.code}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/branches/${branch.id}/edit`}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                    title="ແກ້ໄຂ"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <DeleteBranchButton branchId={branch.id} />
                </div>
              </div>

              {branch.address && (
                <p className="text-xs text-slate-500 leading-relaxed">{branch.address}</p>
              )}

              <div className="flex gap-3 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Bed size={14} className="text-slate-400" />
                  <span><span className="font-semibold text-slate-900">{branch._count.rooms}</span> ຫ້ອງ</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-600">
                  <Users size={14} className="text-slate-400" />
                  <span><span className="font-semibold text-slate-900">{branch._count.users}</span> ຜູ້ໃຊ້</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
