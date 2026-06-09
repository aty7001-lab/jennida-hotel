import { getFinancialReport } from "@/actions/reports";
import { getAllBranches } from "@/actions/branches";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CalendarDays, Wallet, TrendingUp, BarChart3, ArrowRightLeft, CreditCard, Banknote } from "lucide-react";

export default async function RevenueReportPage({ searchParams }: { searchParams: Promise<{ branchId?: string; start?: string; end?: string }> }) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === 'STAFF';
  const branchFilter = isStaff ? session?.user?.branchId : params.branchId || undefined;

  const defaultStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
  const defaultEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');
  const startDate = params.start || defaultStart;
  const endDate = params.end || defaultEnd;

  const branches = await getAllBranches();
  const dict = await getDictionary();

  const financialData = await getFinancialReport(startDate, endDate, branchFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{dict.reports.tabRevenue}</h1>
          <p className="text-sm text-slate-500 mt-1">{dict.reports.subtitle}</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-md shadow-sm">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap gap-4 items-center">
          <form className="flex flex-wrap gap-4 items-end w-full">
            {!isStaff && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{dict.reports.branch}</label>
                <select name="branchId" defaultValue={params.branchId || ''} className="w-48 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">{dict.reports.allBranches}</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{dict.reports.startDate}</label>
              <input type="date" name="start" defaultValue={startDate} className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">{dict.reports.endDate}</label>
              <input type="date" name="end" defaultValue={endDate} className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <button type="submit" className="px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors">
              {dict.reports.apply}
            </button>
          </form>
        </div>

        <div className="p-6">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{dict.reports.financialFor} ({format(new Date(startDate), 'PP')} - {format(new Date(endDate), 'PP')})</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <MetricCard title={dict.reports.totalRevenue} value={`₭${financialData.totalRevenue.toLocaleString()}`} icon={Wallet} color="text-emerald-600" bg="bg-emerald-50" />
              <MetricCard title={dict.reports.adr} value={`₭${financialData.ADR.toLocaleString(undefined, {maximumFractionDigits:0})}`} icon={BarChart3} color="text-indigo-600" bg="bg-indigo-50" />
              <MetricCard title={dict.reports.revpar} value={`₭${financialData.RevPAR.toLocaleString(undefined, {maximumFractionDigits:0})}`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">{dict.reports.revenueSource}</h3>
                <div className="space-y-4">
                  {Object.entries(financialData.sourceBreakdown).map(([source, amount]: [string, any]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">{source.replace('_', ' ')}</span>
                      <span className="text-sm font-bold text-slate-900">₭{amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {Object.keys(financialData.sourceBreakdown).length === 0 && <p className="text-sm text-slate-500">{dict.reports.noData}</p>}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">{dict.reports.paymentsReceived}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><Banknote size={16} className="text-emerald-600" /><span className="text-sm text-slate-600 font-medium">{dict.reports.cash}</span></div>
                    <span className="text-sm font-bold text-slate-900">₭{(financialData.paymentMethods['CASH'] || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><ArrowRightLeft size={16} className="text-blue-600" /><span className="text-sm text-slate-600 font-medium">{dict.reports.transfer}</span></div>
                    <span className="text-sm font-bold text-slate-900">₭{(financialData.paymentMethods['TRANSFER'] || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><CreditCard size={16} className="text-purple-600" /><span className="text-sm text-slate-600 font-medium">{dict.reports.creditCard}</span></div>
                    <span className="text-sm font-bold text-slate-900">₭{(financialData.paymentMethods['CREDIT_CARD'] || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, bg }: { title: string, value: string | number, icon: any, color: string, bg: string }) {
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
