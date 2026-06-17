"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Filter, Building2 } from "lucide-react";

type Branch = { id: string; name: string };

export default function BookingFilters({
  branches,
  isAdmin,
  defaultBranch,
  defaultStatus,
}: {
  branches: Branch[];
  isAdmin: boolean;
  defaultBranch: string;
  defaultStatus: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function submit() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const params = new URLSearchParams();
    const branch = data.get("branch") as string;
    const status = data.get("status") as string;
    if (branch) params.set("branch", branch);
    if (status) params.set("status", status);
    router.push(`/bookings?${params.toString()}`);
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50"
    >
      {isAdmin && (
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building2 size={15} className="text-slate-400 shrink-0" />
          <select
            name="branch"
            defaultValue={defaultBranch}
            onChange={submit}
            className="w-full sm:w-56 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">ທຸກສາຂາ</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <select
        name="status"
        defaultValue={defaultStatus}
        onChange={submit}
        className="w-full sm:w-44 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">ທຸກສະຖານະ</option>
        <option value="PENDING">ລໍຖ້າ</option>
        <option value="CONFIRMED">ຢືນຢັນແລ້ວ</option>
        <option value="CHECKED_IN">ເຊັກອິນແລ້ວ</option>
        <option value="CHECKED_OUT">ເຊັກເອົ້າແລ້ວ</option>
        <option value="CANCELLED">ຍົກເລີກ</option>
      </select>

      <button
        type="submit"
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
      >
        <Filter size={14} />
        ກອງຂໍ້ມູນ
      </button>
    </form>
  );
}
