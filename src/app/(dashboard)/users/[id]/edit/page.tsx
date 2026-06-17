import { updateUser, getUserById } from "@/actions/users";
import { getAllBranches } from "@/actions/branches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound, redirect } from "next/navigation";
import { UserCog } from "lucide-react";
import Link from "next/link";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const { id } = await params;
  const [user, branches] = await Promise.all([getUserById(id), getAllBranches()]);
  if (!user) notFound();

  const inputClass =
    "w-full border border-slate-300 rounded-md px-3.5 py-2.5 bg-white text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400";

  const action = async (formData: FormData) => {
    "use server";
    await updateUser(id, formData);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">ແກ້ໄຂຜູ້ໃຊ້</h1>
        <p className="text-sm text-slate-500 mt-1">{user.name} · {user.email}</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <form action={action}>
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <UserCog className="text-indigo-500" size={20} />
              <h2 className="text-base font-semibold text-slate-800">ຂໍ້ມູນຜູ້ໃຊ້</h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ຊື່-ນາມສະກຸນ <span className="text-red-500">*</span>
              </label>
              <input name="name" type="text" required defaultValue={user.name} className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ອີເມວ <span className="text-red-500">*</span>
              </label>
              <input name="email" type="email" required defaultValue={user.email} className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                ລະຫັດຜ່ານໃໝ່
              </label>
              <input name="password" type="password" minLength={6} className={inputClass} placeholder="ປ່ອຍວ່າງຖ້າບໍ່ຕ້ອງການປ່ຽນ" />
              <p className="text-xs text-slate-400 mt-1">ຖ້າບໍ່ໃສ່ ລະຫັດຜ່ານເດີມຈະຍັງຄົງຢູ່</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ສິດໃຊ້ງານ</label>
              <select name="role" defaultValue={user.role} className={inputClass}>
                <option value="STAFF">STAFF — ພະນັກງານທົ່ວໄປ</option>
                <option value="MANAGER">MANAGER — ຜູ້ຈັດການສາຂາ</option>
                <option value="ADMIN">ADMIN — ຜູ້ດູແລລະບົບ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">ສາຂາ</label>
              <select name="branchId" defaultValue={user.branchId ?? ""} className={inputClass}>
                <option value="">— ທຸກສາຂາ (ADMIN) —</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
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
              ບັນທຶກການແກ້ໄຂ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
