import { updateBranch, getBranchById } from "@/actions/branches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default async function EditBranchPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const branch = await getBranchById(id);
  if (!branch) notFound();

  const inputClass =
    "w-full border border-slate-300 rounded-md px-3.5 py-2.5 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  const action = async (formData: FormData) => {
    "use server";
    await updateBranch(id, formData);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ແກ້ໄຂສາຂາ</h1>
        <p className="text-sm text-slate-500 mt-1">{branch.name}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form action={action}>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="text-indigo-500" size={20} />
              <h2 className="text-base font-semibold text-slate-800">ຂໍ້ມູນສາຂາ</h2>
            </div>

            <div className="flex gap-3 text-xs text-slate-500 bg-slate-50 rounded-md px-3 py-2">
              <span><span className="font-medium text-slate-700">ຫ້ອງພັກ:</span> {branch._count.rooms} ຫ້ອງ</span>
              <span>·</span>
              <span><span className="font-medium text-slate-700">ຜູ້ໃຊ້:</span> {branch._count.users} ຄົນ</span>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ຊື່ສາຂາ <span className="text-red-500">*</span>
              </label>
              <input name="name" type="text" required defaultValue={branch.name} className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ລະຫັດສາຂາ (Code) <span className="text-red-500">*</span>
              </label>
              <input
                name="code"
                type="text"
                required
                defaultValue={branch.code}
                className={inputClass}
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ທີ່ຢູ່</label>
              <textarea
                name="address"
                rows={3}
                defaultValue={branch.address ?? ""}
                className={inputClass}
                placeholder="ທີ່ຢູ່ສາຂາ (ບໍ່ບັງຄັບ)"
              />
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <Link
              href="/branches"
              className="px-5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              ຍົກເລີກ
            </Link>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              ບັນທຶກການແກ້ໄຂ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
