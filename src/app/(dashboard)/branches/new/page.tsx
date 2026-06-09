import { createBranch } from "@/actions/branches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import Link from "next/link";

export default async function NewBranchPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const inputClass =
    "w-full border border-slate-300 rounded-md px-3.5 py-2.5 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ເພີ່ມສາຂາໃໝ່</h1>
        <p className="text-sm text-slate-500 mt-1">ສ້າງສາຂາໂຮງແຮມໃໝ່</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form action={createBranch}>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="text-indigo-500" size={20} />
              <h2 className="text-base font-semibold text-slate-800">ຂໍ້ມູນສາຂາ</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ຊື່ສາຂາ <span className="text-red-500">*</span>
              </label>
              <input name="name" type="text" required className={inputClass} placeholder="ເຊັ່ນ: Jennida Hotel Vientiane" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ລະຫັດສາຂາ (Code) <span className="text-red-500">*</span>
              </label>
              <input
                name="code"
                type="text"
                required
                className={inputClass}
                placeholder="ເຊັ່ນ: VTE_001"
                style={{ textTransform: "uppercase" }}
              />
              <p className="text-xs text-slate-400 mt-1">ລະຫັດຕ້ອງບໍ່ຊ້ຳກັນ, ຈະຖືກແປງເປັນຕົວໃຫຍ່ອັດຕະໂນມັດ</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ທີ່ຢູ່</label>
              <textarea
                name="address"
                rows={3}
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
              ບັນທຶກສາຂາ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
