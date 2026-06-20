import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden flex-col md:flex-row">
      <MobileHeader sidebar={<Sidebar />} />
      <div className="hidden md:flex md:h-screen md:shrink-0">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 md:p-8 lg:p-10">
        {children}
      </main>
    </div>
  );
}
