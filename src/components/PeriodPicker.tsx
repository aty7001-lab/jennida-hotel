"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  format,
  startOfMonth, endOfMonth,
  startOfYear,  endOfYear,
  addMonths,    addYears,
  parseISO,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

const LAO_MONTHS = [
  "ມັງກອນ","ກຸມພາ","ມີນາ","ເມສາ","ພຶດສະພາ","ມິຖຸນາ",
  "ກໍລະກົດ","ສິງຫາ","ກັນຍາ","ຕຸລາ","ພະຈິກ","ທັນວາ",
];

interface Props {
  startDate: string;
  endDate: string;
  extraParams?: Record<string, string>;
}

function toUrl(params: Record<string, string>, extra?: Record<string, string>) {
  const q = new URLSearchParams({ ...extra, ...params });
  // strip empty values
  [...q.keys()].forEach(k => { if (!q.get(k)) q.delete(k); });
  return "?" + q.toString();
}

export default function PeriodPicker({ startDate, endDate, extraParams }: Props) {
  const router   = useRouter();
  const pathname = usePathname();

  // derive current anchor date from startDate
  const anchor = parseISO(startDate);
  const isYear =
    format(anchor, "MM-dd") === "01-01" &&
    format(parseISO(endDate), "MM-dd") === "12-31" &&
    format(anchor, "yyyy") === format(parseISO(endDate), "yyyy");

  const [mode, setMode] = useState<"month" | "year">(isYear ? "year" : "month");

  function navigate(delta: number) {
    const next = mode === "month" ? addMonths(anchor, delta) : addYears(anchor, delta);
    apply(next, mode);
  }

  function apply(date: Date, m: "month" | "year") {
    const start = m === "month" ? startOfMonth(date) : startOfYear(date);
    const end   = m === "month" ? endOfMonth(date)   : endOfYear(date);
    router.push(
      pathname +
      toUrl(
        { start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd") },
        extraParams,
      )
    );
  }

  function switchMode(m: "month" | "year") {
    setMode(m);
    apply(anchor, m);
  }

  // Label
  const label =
    mode === "month"
      ? `${LAO_MONTHS[anchor.getMonth()]} ${anchor.getFullYear()}`
      : `ປີ ${anchor.getFullYear()}`;

  // Presets
  const now = new Date();
  function preset(type: "thisMonth" | "lastMonth" | "thisYear") {
    if (type === "thisMonth")  { apply(now, "month"); setMode("month"); }
    if (type === "lastMonth")  { apply(addMonths(now, -1), "month"); setMode("month"); }
    if (type === "thisYear")   { apply(now, "year");  setMode("year"); }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
        <button
          onClick={() => switchMode("month")}
          className={`px-3 py-1.5 transition-colors ${
            mode === "month"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          ເດືອນ
        </button>
        <button
          onClick={() => switchMode("year")}
          className={`px-3 py-1.5 transition-colors border-l border-slate-200 ${
            mode === "year"
              ? "bg-indigo-600 text-white"
              : "bg-white text-slate-600 hover:bg-slate-50"
          }`}
        >
          ປີ
        </button>
      </div>

      {/* Prev / Label / Next */}
      <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-3 py-1 text-sm font-semibold text-slate-800 min-w-[140px] text-center">
          {label}
        </span>
        <button
          onClick={() => navigate(1)}
          className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-indigo-600 transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Quick presets */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => preset("thisMonth")}
          className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-600
            hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
        >
          ເດືອນນີ້
        </button>
        <button
          onClick={() => preset("lastMonth")}
          className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-600
            hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
        >
          ເດືອນທີ່ຜ່ານ
        </button>
        <button
          onClick={() => preset("thisYear")}
          className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white text-slate-600
            hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors"
        >
          ປີນີ້
        </button>
      </div>
    </div>
  );
}
