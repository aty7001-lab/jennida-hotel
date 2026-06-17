"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter } from "lucide-react";
import { useRef } from "react";

type Branch = { id: string; name: string };

export default function RoomFilters({
  branches,
  isStaff,
  defaultQ,
  defaultStatus,
  defaultBranch,
}: {
  branches: Branch[];
  isStaff: boolean;
  defaultQ: string;
  defaultStatus: string;
  defaultBranch: string;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function submit() {
    if (!formRef.current) return;
    const data = new FormData(formRef.current);
    const params = new URLSearchParams();
    const q = data.get("q") as string;
    const status = data.get("status") as string;
    const branch = data.get("branch") as string;
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (branch) params.set("branch", branch);
    router.push(`/rooms?${params.toString()}`);
  }

  return (
    <form
      ref={formRef}
      onSubmit={(e) => { e.preventDefault(); submit(); }}
      className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50"
    >
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <input
          type="text"
          name="q"
          defaultValue={defaultQ}
          placeholder="ຄົ້ນຫາຫ້ອງ..."
          className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
        />
      </div>

      <select
        name="status"
        defaultValue={defaultStatus}
        onChange={submit}
        className="w-full sm:w-40 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      >
        <option value="">ທຸກສະຖານະ</option>
        <option value="AVAILABLE">ວ່າງ</option>
        <option value="OCCUPIED">ມີແຂກ</option>
        <option value="CLEANING">ກຳລັງທຳຄວາມສະອາດ</option>
        <option value="MAINTENANCE">ສ້ອມແປງ</option>
      </select>

      {!isStaff && (
        <select
          name="branch"
          defaultValue={defaultBranch}
          onChange={submit}
          className="w-full sm:w-52 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          <option value="">ທຸກສາຂາ</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      )}

      <button
        type="submit"
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
      >
        <Filter size={14} />ຄົ້ນຫາ
      </button>
    </form>
  );
}
