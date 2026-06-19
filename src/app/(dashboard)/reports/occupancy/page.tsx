import { getOccupancyReport } from "@/actions/reports";
import { getAllBranches } from "@/actions/branches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";
import { getDictionary } from "@/lib/dictionary";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CalendarDays, TrendingUp, Bed } from "lucide-react";
import PeriodPicker from "@/components/PeriodPicker";

export default async function OccupancyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const cookieBranchId = await getActiveBranchId();
  const branchFilter = isStaff ? session?.user?.branchId : params.branchId || cookieBranchId || undefined;

  const defaultStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const defaultEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
  const startDate = params.start || defaultStart;
  const endDate = params.end || defaultEnd;

  const branches = await getAllBranches();
  const dict = await getDictionary();

  const occupancyData = await getOccupancyReport(startDate, endDate, branchFilter);

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm; }
        @media print {
          [class*="p-5"][class*="rounded-xl"] { padding: 8px 10px !important; }
          [class*="text-2xl"] { font-size: 16px !important; }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{dict.reports.tabOccupancy}</h1>
            <p className="text-sm text-slate-500 mt-1">{dict.reports.subtitle}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md shadow-sm">
          {/* Print-only header */}
          <div className="hidden print:block text-center py-4 border-b border-slate-200">
            <p className="font-bold text-lg">Jennida Hotel — {dict.reports.tabOccupancy}</p>
            <p className="text-sm text-slate-500">{startDate} – {endDate}</p>
          </div>

          {/* Filter bar */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 print:hidden">
            <div className="flex flex-wrap gap-3 items-center">
              <PeriodPicker
                startDate={startDate}
                endDate={endDate}
                extraParams={!isStaff ? { branchId: params.branchId || "" } : {}}
              />
              {!isStaff && (
                <form className="flex items-center gap-2">
                  <input type="hidden" name="start" value={startDate} />
                  <input type="hidden" name="end" value={endDate} />
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
                {dict.reports.occupancyFor} ({format(new Date(startDate), "PP")} - {format(new Date(endDate), "PP")})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <MetricCard title={dict.reports.occupancyRate} value={`${occupancyData.occupancyRate.toFixed(1)}%`} icon={TrendingUp} color="text-indigo-600" bg="bg-indigo-50" />
                <MetricCard title={dict.reports.totalOccupiedNights} value={`${occupancyData.occupiedNights} / ${occupancyData.totalRoomNightsAvailable}`} icon={Bed} color="text-emerald-600" bg="bg-emerald-50" />
                <MetricCard title={dict.reports.alos} value={`${occupancyData.ALOS.toFixed(1)} ${dict.reports.nights}`} icon={CalendarDays} color="text-blue-600" bg="bg-blue-50" />
              </div>

              <div className="border border-slate-200 rounded-xl p-5 shadow-sm max-w-md">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">{dict.reports.roomPopularity}</h3>
                <div className="space-y-4">
                  {Object.entries(occupancyData.roomTypes).map(([type, count]: [string, any]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">{type}</span>
                      <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">{count}</span>
                    </div>
                  ))}
                  {Object.keys(occupancyData.roomTypes).length === 0 && (
                    <p className="text-sm text-slate-500">{dict.reports.noData}</p>
                  )}
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
