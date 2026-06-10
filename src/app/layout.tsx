import type { Metadata } from "next";
import "./globals.css";
import { getLocale } from "@/lib/dictionary";

export const metadata: Metadata = {
  title: "Jennida Hotel",
  description: "Jennida Hotel Management Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentLang = await getLocale();
  return (
    <html lang="en" className="antialiased text-slate-900 bg-slate-50">
      <body className="font-sans selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
