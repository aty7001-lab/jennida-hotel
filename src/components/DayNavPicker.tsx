"use client";

import { useRouter, usePathname } from "next/navigation";
import { format, addDays, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LAO_MONTHS = [
  "ມັງກອນ","ກຸມພາ","ມີນາ","ເມສາ","ພຶດສະພາ","ມິຖຸນາ",
  "ກໍລະກົດ","ສິງຫາ","ກັນຍາ","ຕຸລາ","ພະຈິກ","ທັນວາ",
];

interface Props {
  date: string;
  extraParams?: Record<string, string>;
}

export default function DayNavPicker({ date, extraParams }: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  const current = parseISO(date);

  function navigate(delta: number) {
    const next = addDays(current, delta);
    const q = new URLSearchParams({ ...extraParams, date: format(next, "yyyy-MM-dd") });
    [...q.keys()].forEach(k => { if (!q.get(k)) q.delete(k); });
    router.push(pathname + "?" + q.toString());
  }

  function goToday() {
    const q = new URLSearchParams({ ...extraParams, date: format(new Date(), "yyyy-MM-dd") });
    [...q.keys()].forEach(k => { if (!q.get(k)) q.delete(k); });
    router.push(pathname + "?" + q.toString());
  }

  const label = `${current.getDate()} ${LAO_MONTHS[current.getMonth()]} ${current.getFullYear()}`;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-3 py-1 text-sm font-semibold text-slate-800 min-w-[170px] text-center">
          {label}
        </span>
        <button
          onClick={() => navigate(1)}
          className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors"
          aria-label="Next day"
        >
          <ChevronRight size={16} />
        </button>
      </div>
      <button
        onClick={goToday}
        className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-600
          hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors font-medium"
      >
        ມື້ນີ້
      </button>
    </div>
  );
}
