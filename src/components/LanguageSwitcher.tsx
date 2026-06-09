"use client";

import { setLanguage } from "@/app/actions/language";
import { useState, useTransition } from "react";
import { Globe } from "lucide-react";

export function LanguageSwitcher({ currentLang }: { currentLang: string }) {
  const [isPending, startTransition] = useTransition();
  const [lang, setLang] = useState(currentLang || "en");

  const toggleLang = () => {
    const nextLang = lang === "en" ? "th" : "en";
    setLang(nextLang);
    startTransition(() => {
      setLanguage(nextLang);
    });
  };

  return (
    <button 
      onClick={toggleLang}
      disabled={isPending}
      className="flex w-full items-center space-x-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors duration-200 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:opacity-50"
      title="Switch Language"
    >
      <Globe size={18} />
      <span>{lang === "en" ? "ປ່ຽນເປັນພາສາລາວ (LA)" : "Switch to English (EN)"}</span>
    </button>
  );
}
