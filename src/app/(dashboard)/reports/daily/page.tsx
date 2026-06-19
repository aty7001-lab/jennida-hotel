import { getDailySummary } from "@/actions/reports";
import { getAllBranches } from "@/actions/branches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";
import { getDictionary } from "@/lib/dictionary";
import { format } from "date-fns";
import { Wallet, Users, Bed, ArrowRightLeft } from "lucide-react";
import DayNavPicker from "@/components/DayNavPicker";

export default async function DailyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const cookieBranchId = await getActiveBranchId();
  const branchFilter = isStaff ? session?.user?.branchId : params.branchId || cookieBranchId || undefined;

  const todayStr = new Date().toISOString().split("T")[0];
  const targetDate = params.date || todayStr;

  const branches = await getAllBranches();
  const dict = await getDictionary();

  const dailyData = await getDailySummary(targetDate, branchFilter);

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm; }
        @media print {
          [class*="p-5"][class*="rounded-xl"] { padding: 8px 10px !important; }
          [class*="text-2xl"] { font-size: 16px !important; }
          [class*="text-3xl"] { font-size: 18px !important; }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{dict.reports.tabDaily}</h1>
            <p className="text-sm text-slate-500 mt-1">{dict.reports.subtitle}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm">
          {/* Print-only header */}
          <div className="hidden print:block text-center py-4 border-b border-slate-200">
            <p className="font-bold text-lg">Jennida Hotel — {dict.reports.tabDaily}</p>
            <p className="text-sm text-slate-500">{format(new Date(targetDate), "PPP")}</p>
          </div>

          {/* Filter bar */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 print:hidden">
            <div className="flex flex-wrap gap-3 items-center">
              <DayNavPicker
                date={targetDate}
                extraParams={!isStaff ? { branchId: params.branchId || "" } : {}}
              />
              {!isStaff && (
                <form className="flex items-center gap-2">
                  <input type="hidden" name="date" value={targetDate} />
                  <select
                    name="branchId"
                    defaultValue={params.branchId || ""}
                    className="w-44 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">{dict.reports.allBranches}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors"
                  >
                    {dict.reports.apply}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">
                {dict.reports.summaryFor} {format(new Date(targetDate), "PPP")}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard title={dict.reports.todayRevenue} value={`₭${dailyData.todayRevenue.toLocaleString()}`} icon={Wallet} color="text-emerald-600" bg="bg-emerald-50" />
                <MetricCard title={dict.reports.arrivals} value={dailyData.arrivals} icon={ArrowRightLeft} color="text-indigo-600" bg="bg-indigo-50" />
                <MetricCard title={dict.reports.departures} value={dailyData.departures} icon={ArrowRightLeft} color="text-rose-600" bg="bg-rose-50" />
                <MetricCard title={dict.reports.inHouse} value={dailyData.inHouse} icon={Users} color="text-blue-600" bg="bg-blue-50" />
              </div>

              <div className="mt-8">
                <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Bed size={18} /> {dict.reports.roomStatus}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">{dict.reports.available}</span>
                    <span className="text-3xl font-bold text-emerald-700">{dailyData.roomStatus.AVAILABLE}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/50 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">{dict.reports.occupied}</span>
                    <span className="text-3xl font-bold text-rose-700">{dailyData.roomStatus.OCCUPIED}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-amber-100 bg-amber-50/50 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">{dict.reports.cleaning}</span>
                    <span className="text-3xl font-bold text-amber-700">{dailyData.roomStatus.CLEANING}</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{dict.reports.maintenance}</span>
                    <span className="text-3xl font-bold text-slate-700">{dailyData.roomStatus.MAINTENANCE}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
