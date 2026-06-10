"use client";

import { useTransition } from "react";
import { deleteExpense } from "@/actions/expenses";
import { Trash2 } from "lucide-react";

export default function DeleteExpenseButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!confirm("ລຶບລາຍຈ່າຍນີ້?")) return;
    startTransition(() => deleteExpense(id));
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors disabled:opacity-40"
      title="ລຶບ"
    >
      <Trash2 size={14} />
    </button>
  );
}
