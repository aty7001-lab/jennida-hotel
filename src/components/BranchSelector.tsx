"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { setActiveBranch } from "@/actions/branches";

type Branch = { id: string; name: string };

export default function BranchSelector({
  branches,
  currentBranchId,
}: {
  branches: Branch[];
  currentBranchId: string;
}) {
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    await setActiveBranch(e.target.value);
    router.refresh();
  }

  return (
    <div className="mx-3 mb-4">
      <div className="flex items-center gap-1.5 mb-1.5 px-1">
        <Building2 size={12} className="text-slate-500" />
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">ສາຂາ</span>
      </div>
      <select
        value={currentBranchId}
        onChange={handleChange}
        className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-md px-3 py-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
      >
        <option value="">ທຸກສາຂາ</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.name}
          </option>
        ))}
      </select>
    </div>
  );
}
