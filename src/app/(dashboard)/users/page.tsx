import Link from "next/link";
import { Plus, Edit2, ShieldCheck, User, UserCog } from "lucide-react";
import { getUsers } from "@/actions/users";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { DeleteUserButton } from "@/components/DeleteUserButton";

const roleBadge: Record<string, string> = {
  ADMIN:   "bg-purple-50 text-purple-700 border-purple-200",
  MANAGER: "bg-blue-50 text-blue-700 border-blue-200",
  STAFF:   "bg-slate-50 text-slate-600 border-slate-200",
};

const roleIcon: Record<string, React.ReactNode> = {
  ADMIN:   <ShieldCheck size={12} />,
  MANAGER: <UserCog size={12} />,
  STAFF:   <User size={12} />,
};

export default async function UsersPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/");

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ຜູ້ໃຊ້ງານ / Users</h1>
          <p className="text-sm text-slate-500 mt-1">ຈັດການບັນຊີຜູ້ໃຊ້ ແລະ ກຳນົດສິດ</p>
        </div>
        <Link
          href="/users/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          ເພີ່ມຜູ້ໃຊ້ໃໝ່
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">ຊື່</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">ສາຂາ</th>
                <th className="px-4 py-3 font-semibold">ວັນທີສ້າງ</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 text-sm">
                    ຍັງບໍ່ມີຜູ້ໃຊ້
                  </td>
                </tr>
              ) : users.map((user) => {
                const isSelf = session?.user?.id === user.id;
                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium text-slate-900">
                      {user.name}
                      {isSelf && (
                        <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-medium">ຕົວທ່ານ</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">{user.email}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${roleBadge[user.role]}`}>
                        {roleIcon[user.role]}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-600">
                      {user.branch ? (
                        <span className="flex items-center gap-1">
                          {user.branch.name}
                          <span className="text-[10px] font-mono text-slate-400">({user.branch.code})</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">ທຸກສາຂາ</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right flex items-center justify-end gap-1">
                      <Link
                        href={`/users/${user.id}/edit`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <DeleteUserButton userId={user.id} isSelf={isSelf} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">
            ທັງໝົດ <span className="font-medium text-slate-900">{users.length}</span> ຄົນ
          </span>
        </div>
      </div>
    </div>
  );
}
