"use client";

import { useRef, useState, useTransition } from "react";
import { createExpense } from "@/actions/expenses";
import { PlusCircle } from "lucide-react";

type Branch = { id: string; name: string };

export default function AddExpenseForm({
  branches,
  isStaff,
  userBranchId,
}: {
  branches: Branch[];
  isStaff: boolean;
  userBranchId?: string | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [rawAmount, setRawAmount] = useState("");

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/[^0-9]/g, "");
    setRawAmount(digits);
    setDisplayAmount(digits ? Number(digits).toLocaleString("en-US") : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setError("");
    const data = new FormData(formRef.current);
    startTransition(async () => {
      const result = await createExpense(data);
      if (result?.error) {
        setError(result.error);
      } else {
        formRef.current?.reset();
        setDisplayAmount("");
        setRawAmount("");
      }
    });
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
    >
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-slate-500 mb-1">ລາຍລະອຽດ</label>
        <input
          type="text"
          name="description"
          required
          placeholder="ເຊັ່ນ: ຄ່ານ້ຳ, ຄ່າໄຟ, ຄ່າຈ້າງ..."
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">ຈຳນວນ (₭)</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">₭</span>
          <input
            type="text"
            inputMode="numeric"
            value={displayAmount}
            onChange={handleAmountChange}
            required
            placeholder="0"
            className="w-full border border-slate-300 rounded-md pl-7 pr-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <input type="hidden" name="amount" value={rawAmount} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">ປະເພດ</label>
        <select
          name="category"
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="General">ທົ່ວໄປ</option>
          <option value="Utilities">ສາທາລະນູປະໂພກ</option>
          <option value="Salary">ເງີນເດືອນ</option>
          <option value="Maintenance">ສ້ອມແປງ</option>
          <option value="Supplies">ອຸປະກອນ</option>
          <option value="Marketing">ການຕະຫຼາດ</option>
          <option value="Other">ອື່ນໆ</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">ວັນທີ</label>
        <input
          type="date"
          name="date"
          defaultValue={new Date().toISOString().split("T")[0]}
          className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {!isStaff && (
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">ສາຂາ</label>
          <select
            name="branchId"
            className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">ທຸກສາຂາ</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {isStaff && (
        <input type="hidden" name="branchId" value={userBranchId || ""} />
      )}

      <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center justify-center gap-2 w-full px-4 py-1.5 bg-rose-600 text-white text-sm font-medium rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          <PlusCircle size={15} />
          {isPending ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກລາຍຈ່າຍ"}
        </button>
        {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
      </div>
    </form>
  );
}
