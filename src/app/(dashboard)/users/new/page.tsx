import { createUser } from "@/actions/users";
import { getAllBranches } from "@/actions/branches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { UserCog } from "lucide-react";
import Link from "next/link";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const branches = await getAllBranches();

  const inputClass =
    "w-full border border-slate-300 rounded-md px-3.5 py-2.5 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ເພີ່ມຜູ້ໃຊ້ໃໝ່</h1>
        <p className="text-sm text-slate-500 mt-1">ສ້າງບັນຊີຜູ້ໃຊ້ ແລະ ກຳນົດສິດໃຊ້ງານ</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form action={createUser}>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserCog className="text-indigo-500" size={20} />
              <h2 className="text-base font-semibold text-slate-800">ຂໍ້ມູນຜູ້ໃຊ້</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ຊື່-ນາມສະກຸນ <span className="text-red-500">*</span>
              </label>
              <input name="name" type="text" required className={inputClass} placeholder="ເຊັ່ນ: ສົມສາກ ສີສຸລິດ" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ອີເມວ <span className="text-red-500">*</span>
              </label>
              <input name="email" type="email" required className={inputClass} placeholder="user@jennida.com" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ລະຫັດຜ່ານ <span className="text-red-500">*</span>
              </label>
              <input name="password" type="password" required minLength={6} className={inputClass} placeholder="ຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ສິດໃຊ້ງານ</label>
              <select name="role" className={inputClass}>
                <option value="STAFF">STAFF — ພະນັກງານທົ່ວໄປ</option>
                <option value="MANAGER">MANAGER — ຜູ້ຈັດການສາຂາ</option>
                <option value="ADMIN">ADMIN — ຜູ້ດູແລລະບົບ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ສາຂາ</label>
              <select name="branchId" className={inputClass}>
                <option value="">— ທຸກສາຂາ (ADMIN) —</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-400 mt-1">STAFF / MANAGER ຄວນເລືອກສາຂາ — ADMIN ບໍ່ຕ້ອງເລືອກ</p>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <Link
              href="/users"
              className="px-5 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              ຍົກເລີກ
            </Link>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              ສ້າງຜູ້ໃຊ້
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
