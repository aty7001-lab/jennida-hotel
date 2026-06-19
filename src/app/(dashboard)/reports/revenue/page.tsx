import { getFinancialReport } from "@/actions/reports";
import { getAllBranches } from "@/actions/branches";
import { getExpenses } from "@/actions/expenses";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  CalendarDays,
  Wallet,
  TrendingUp,
  BarChart3,
  ArrowRightLeft,
  CreditCard,
  Banknote,
  TrendingDown,
  Scale,
  Tag,
} from "lucide-react";
import AddExpenseForm from "@/components/AddExpenseForm";
import DeleteExpenseButton from "@/components/DeleteExpenseButton";
import ExportButtons from "@/components/ExportButtons";
import RevenueExcelExport from "@/components/RevenueExcelExport";

const categoryColor: Record<string, string> = {
  Utilities:   "bg-blue-50 text-blue-700",
  Salary:      "bg-purple-50 text-purple-700",
  Maintenance: "bg-amber-50 text-amber-700",
  Supplies:    "bg-teal-50 text-teal-700",
  Marketing:   "bg-pink-50 text-pink-700",
  General:     "bg-slate-100 text-slate-600",
  Other:       "bg-slate-100 text-slate-600",
};

const categoryLao: Record<string, string> = {
  Utilities:   "ສາທາລະນູປະໂພກ",
  Salary:      "ເງີນເດືອນ",
  Maintenance: "ສ້ອມແປງ",
  Supplies:    "ອຸປະກອນ",
  Marketing:   "ການຕະຫຼາດ",
  General:     "ທົ່ວໄປ",
  Other:       "ອື່ນໆ",
};

export default async function RevenueReportPage({
  searchParams,
}: {
  searchParams: Promise<{ branchId?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const isAdmin = session?.user?.role === "ADMIN";
  const userBranchId = session?.user?.branchId;
  const cookieBranchId = await getActiveBranchId();
  const branchFilter = isStaff ? userBranchId : params.branchId || cookieBranchId || undefined;

  const defaultStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const defaultEnd = format(endOfMonth(new Date()), "yyyy-MM-dd");
  const startDate = params.start || defaultStart;
  const endDate = params.end || defaultEnd;

  const branches = await getAllBranches();
  const dict = await getDictionary();

  const [financialData, expenses] = await Promise.all([
    getFinancialReport(startDate, endDate, branchFilter),
    getExpenses(startDate, endDate, branchFilter),
  ]);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = financialData.totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ລາຍຮັບ ແລະ ລາຍຈ່າຍ</h1>
          <p className="text-sm text-slate-500 mt-1">{dict.reports.subtitle}</p>
        </div>
        <div className="no-print flex items-center gap-2 flex-wrap">
          <RevenueExcelExport
            financialData={financialData}
            expenses={expenses.map((e) => ({
              id: e.id,
              date: e.date instanceof Date ? e.date.toISOString() : String(e.date),
              description: e.description,
              category: e.category,
              amount: e.amount,
              branch: e.branch ? { name: e.branch.name } : null,
            }))}
            startDate={startDate}
            endDate={endDate}
            branchName={branchFilter ? branches.find((b) => b.id === branchFilter)?.name : undefined}
            fileName="ລາຍຮັບ-ລາຍຈ່າຍ"
          />
          <ExportButtons targetId="revenue-report-content" fileName="ລາຍຮັບ-ລາຍຈ່າຍ" />
        </div>
      </div>

      {/* Filter bar */}
      <div id="revenue-report-content" className="bg-white border border-slate-200 rounded-md shadow-sm print-area">
        <div className="p-4 bg-slate-50/50 border-b border-slate-200 flex flex-wrap gap-4 items-center">
          <form className="flex flex-wrap gap-4 items-end w-full">
            {!isStaff && (
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">
                  {dict.reports.branch}
                </label>
                <select
                  name="branchId"
                  defaultValue={params.branchId || ""}
                  className="w-48 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">{dict.reports.allBranches}</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {dict.reports.startDate}
              </label>
              <input
                type="date"
                name="start"
                defaultValue={startDate}
                className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                {dict.reports.endDate}
              </label>
              <input
                type="date"
                name="end"
                defaultValue={endDate}
                className="border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-md hover:bg-slate-800 transition-colors"
            >
              {dict.reports.apply}
            </button>
          </form>
        </div>

        <div className="p-6 space-y-8">
          <p className="text-xs text-slate-500">
            {dict.reports.financialFor} ({format(new Date(startDate), "PP")} –{" "}
            {format(new Date(endDate), "PP")})
          </p>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="ລາຍຮັບທັງໝົດ"
              value={`₭${financialData.totalRevenue.toLocaleString()}`}
              icon={Wallet}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <MetricCard
              title="ລາຍຈ່າຍທັງໝົດ"
              value={`₭${totalExpenses.toLocaleString()}`}
              icon={TrendingDown}
              color="text-rose-600"
              bg="bg-rose-50"
            />
            <MetricCard
              title="ກຳໄລສຸດທິ"
              value={`₭${netProfit.toLocaleString()}`}
              icon={Scale}
              color={netProfit >= 0 ? "text-indigo-600" : "text-orange-600"}
              bg={netProfit >= 0 ? "bg-indigo-50" : "bg-orange-50"}
            />
          </div>

          {/* Revenue breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">
                {dict.reports.revenueSource}
              </h3>
              <div className="space-y-3">
                {Object.entries(financialData.sourceBreakdown).map(
                  ([source, amount]: [string, any]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">
                        {source.replace("_", " ")}
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        ₭{amount.toLocaleString()}
                      </span>
                    </div>
                  )
                )}
                {Object.keys(financialData.sourceBreakdown).length === 0 && (
                  <p className="text-sm text-slate-500">{dict.reports.noData}</p>
                )}
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">
                {dict.reports.paymentsReceived}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Banknote size={16} className="text-emerald-600" />
                    <span className="text-sm text-slate-600 font-medium">{dict.reports.cash}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ₭{(financialData.paymentMethods["CASH"] || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft size={16} className="text-blue-600" />
                    <span className="text-sm text-slate-600 font-medium">
                      {dict.reports.transfer}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ₭{(financialData.paymentMethods["TRANSFER"] || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-600" />
                    <span className="text-sm text-slate-600 font-medium">
                      {dict.reports.creditCard}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    ₭{(financialData.paymentMethods["CREDIT_CARD"] || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ADR / RevPAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title={dict.reports.adr}
              value={`₭${financialData.ADR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              icon={BarChart3}
              color="text-indigo-600"
              bg="bg-indigo-50"
            />
            <MetricCard
              title={dict.reports.revpar}
              value={`₭${financialData.RevPAR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              icon={TrendingUp}
              color="text-blue-600"
              bg="bg-blue-50"
            />
          </div>

          {/* Expense section */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown size={18} className="text-rose-600" />
                <h3 className="text-sm font-semibold text-slate-800">ບັນທຶກລາຍຈ່າຍ</h3>
              </div>
              <span className="text-sm font-bold text-rose-700">
                ລວມ ₭{totalExpenses.toLocaleString()}
              </span>
            </div>

            <div className="p-5 border-b border-slate-100 bg-white">
              <AddExpenseForm
                branches={branches}
                isStaff={isStaff}
                userBranchId={userBranchId}
              />
            </div>

            {expenses.length > 0 ? (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-2.5 font-semibold">ວັນທີ</th>
                    <th className="px-4 py-2.5 font-semibold">ລາຍລະອຽດ</th>
                    <th className="px-4 py-2.5 font-semibold">ປະເພດ</th>
                    {!isStaff && <th className="px-4 py-2.5 font-semibold">ສາຂາ</th>}
                    <th className="px-4 py-2.5 font-semibold text-right">ຈຳນວນ</th>
                    <th className="px-4 py-2.5 font-semibold text-right">ລຶບ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">
                        {format(new Date(exp.date), "dd/MM/yyyy")}
                      </td>
                      <td className="px-4 py-2.5 text-slate-800">{exp.description}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                            categoryColor[exp.category] ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <Tag size={10} />
                          {categoryLao[exp.category] ?? exp.category}
                        </span>
                      </td>
                      {!isStaff && (
                        <td className="px-4 py-2.5 text-slate-500 text-xs">
                          {exp.branch?.name || "-"}
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-900">
                        ₭{exp.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <DeleteExpenseButton id={exp.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-6 text-center text-sm text-slate-400">
                ຍັງບໍ່ມີລາຍຈ່າຍໃນຊ່ວງນີ້
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
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
