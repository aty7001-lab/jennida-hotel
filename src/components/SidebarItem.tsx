"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SidebarItem({
  href,
  icon,
  label,
  variant = "default",
  size = "md",
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "danger" | "highlight";
  size?: "md" | "sm";
}) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  if (variant === "highlight") {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 ${
          isActive
            ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/30"
            : "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white hover:shadow-md hover:shadow-indigo-500/30"
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  if (variant === "danger") {
    return (
      <Link
        href={href}
        className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400"
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  // sm = admin/util items
  if (size === "sm") {
    return (
      <Link
        href={href}
        className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ${
          isActive
            ? "bg-indigo-500/10 text-indigo-400 border-l-2 border-indigo-500"
            : "text-slate-600 hover:bg-slate-800/50 hover:text-slate-300"
        }`}
      >
        {icon}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 ${
        isActive
          ? "bg-indigo-500/15 text-indigo-300 border-l-2 border-indigo-400"
          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
