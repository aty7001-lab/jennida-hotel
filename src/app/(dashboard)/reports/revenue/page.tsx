import { getFinancialReport } from "@/actions/reports";
import { getAllBranches } from "@/actions/branches";
import { getExpenses } from "@/actions/expenses";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";
import { getDictionary } from "@/lib/dictionary";
import { format, startOfMonth, endOfMonth } from "date-fns";
import {
  Wallet,
  TrendingUp,
  BarChart3,
  ArrowRightLeft,
  CreditCard,
  Banknote,
  TrendingDown,
  Scale,
  Tag,
  ClipboardList,
} from "lucide-react";
import AddExpenseForm from "@/components/AddExpenseForm";
import DeleteExpenseButton from "@/components/DeleteExpenseButton";
import ExportButtons from "@/components/ExportButtons";
import RevenueExcelExport from "@/components/RevenueExcelExport";
import PeriodPicker from "@/components/PeriodPicker";

function fmtDateShort(s: string) {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

const sourceLabel: Record<string, string> = {
  WALK_IN:     "ໂດຍກົງ",
  PHONE:       "ໂທລະສັບ",
  OTA_AGODA:   "Agoda",
  OTA_BOOKING: "Booking.com",
};

const statusLabel: Record<string, string> = {
  CONFIRMED:   "ຢືນຢັນແລ້ວ",
  PENDING:     "ລໍຖ້າ",
  CHECKED_IN:  "ເຊັກອິນແລ້ວ",
  CHECKED_OUT: "ເຊັກເອົ້າແລ້ວ",
  CANCELLED:   "ຍົກເລີກ",
};

const statusStyle: Record<string, string> = {
  CONFIRMED:   "bg-blue-50 text-blue-700 border-blue-200",
  PENDING:     "bg-amber-50 text-amber-700 border-amber-200",
  CHECKED_IN:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  CHECKED_OUT: "bg-slate-50 text-slate-700 border-slate-200",
  CANCELLED:   "bg-red-50 text-red-700 border-red-200",
};

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
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const userBranchId = session?.user?.branchId;
  const cookieBranchId = await getActiveBranchId();
  const branchFilter = isStaff ? userBranchId : cookieBranchId || undefined;

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
  const netProfit = financialData.netRevenue - totalExpenses;

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm; }
        @media print {
          [class*="p-5"][class*="rounded-xl"] { padding: 8px 10px !important; }
          [class*="text-2xl"] { font-size: 16px !important; }
          th, td { padding: 3px 6px !important; font-size: 10px !important; }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ລາຍຮັບ ແລະ ລາຍຈ່າຍ</h1>
            <p className="text-sm text-slate-500 mt-1">{dict.reports.subtitle}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
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

        <div id="revenue-report-content" className="bg-white border border-slate-200 rounded-md shadow-sm">
          {/* Print-only header */}
          <div className="hidden print:block text-center py-4 border-b border-slate-200">
            <p className="font-bold text-lg">Jennida Hotel — ລາຍຮັບ ແລະ ລາຍຈ່າຍ</p>
            <p className="text-sm text-slate-500">{startDate} – {endDate}</p>
          </div>

          {/* Filter bar */}
          <div className="p-4 bg-slate-50/50 border-b border-slate-200 print:hidden">
            <div className="flex flex-wrap gap-3 items-center">
              <PeriodPicker
                startDate={startDate}
                endDate={endDate}
              />
            </div>
          </div>

          <div className="p-6 space-y-8">
            <p className="text-xs text-slate-500">
              {dict.reports.financialFor} ({format(new Date(startDate), "PP")} –{" "}
              {format(new Date(endDate), "PP")})
            </p>

            {/* Summary cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard title="ຮັບເງິນລວມ" value={`₭${financialData.totalRevenue.toLocaleString()}`} icon={Wallet} color="text-emerald-600" bg="bg-emerald-50" sub="COMPLETED payments" />
              {financialData.totalRefunds > 0 && (
                <MetricCard title="ຄືນເງິນ" value={`₭${financialData.totalRefunds.toLocaleString()}`} icon={ArrowRightLeft} color="text-rose-500" bg="bg-rose-50" sub="REFUNDED" />
              )}
              <MetricCard title="ລາຍຮັບສຸດທິ" value={`₭${financialData.netRevenue.toLocaleString()}`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" sub="ຫຼັງຄືນເງິນ" />
              <MetricCard title="ລາຍຈ່າຍ" value={`₭${totalExpenses.toLocaleString()}`} icon={TrendingDown} color="text-rose-600" bg="bg-rose-50" />
              <MetricCard title="ກຳໄລສຸດທິ" value={`₭${netProfit.toLocaleString()}`} icon={Scale} color={netProfit >= 0 ? "text-indigo-600" : "text-orange-600"} bg={netProfit >= 0 ? "bg-indigo-50" : "bg-orange-50"} />
            </div>

            {/* Revenue breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b pb-2">
                  {dict.reports.revenueSource}
                </h3>
                <div className="space-y-3">
                  {Object.entries(financialData.sourceBreakdown).map(([source, amount]: [string, any]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 font-medium">{source.replace("_", " ")}</span>
                      <span className="text-sm font-bold text-slate-900">₭{amount.toLocaleString()}</span>
                    </div>
                  ))}
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
                    <span className="text-sm font-bold text-slate-900">₭{(financialData.paymentMethods["CASH"] || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft size={16} className="text-blue-600" />
                      <span className="text-sm text-slate-600 font-medium">{dict.reports.transfer}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">₭{(financialData.paymentMethods["TRANSFER"] || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-purple-600" />
                      <span className="text-sm text-slate-600 font-medium">{dict.reports.creditCard}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-900">₭{(financialData.paymentMethods["CREDIT_CARD"] || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ADR / RevPAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard title={dict.reports.adr} value={`₭${financialData.ADR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={BarChart3} color="text-indigo-600" bg="bg-indigo-50" />
              <MetricCard title={dict.reports.revpar} value={`₭${financialData.RevPAR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={TrendingUp} color="text-blue-600" bg="bg-blue-50" />
            </div>

            {/* Expense section */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-rose-50/60 border-b border-rose-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown size={18} className="text-rose-600" />
                  <h3 className="text-sm font-semibold text-slate-800">ບັນທຶກລາຍຈ່າຍ</h3>
                </div>
                <span className="text-sm font-bold text-rose-700">ລວມ ₭{totalExpenses.toLocaleString()}</span>
              </div>

              <div className="p-5 border-b border-slate-100 bg-white print:hidden">
                <AddExpenseForm branches={branches} isStaff={isStaff} userBranchId={userBranchId} />
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
                      <th className="px-4 py-2.5 font-semibold text-right print:hidden">ລຶບ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-2.5 text-slate-500 whitespace-nowrap">{format(new Date(exp.date), "dd/MM/yyyy")}</td>
                        <td className="px-4 py-2.5 text-slate-800">{exp.description}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${categoryColor[exp.category] ?? "bg-slate-100 text-slate-600"}`}>
                            <Tag size={10} />
                            {categoryLao[exp.category] ?? exp.category}
                          </span>
                        </td>
                        {!isStaff && <td className="px-4 py-2.5 text-slate-500 text-xs">{exp.branch?.name || "-"}</td>}
                        <td className="px-4 py-2.5 text-right font-semibold text-slate-900">₭{exp.amount.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right print:hidden">
                          <DeleteExpenseButton id={exp.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-5 py-6 text-center text-sm text-slate-400">ຍັງບໍ່ມີລາຍຈ່າຍໃນຊ່ວງນີ້</p>
              )}
            </div>

            {/* Booking drilldown */}
            {financialData.bookingDetails.length > 0 && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-semibold text-slate-800">ລາຍລະອຽດການຈອງ</h3>
                    <span className="text-xs text-slate-400">(ຕາມວັນທີສ້າງ)</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{financialData.bookingDetails.length} ລາຍການ</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200">
                        <th className="px-4 py-2.5 font-semibold">ແຂກ</th>
                        <th className="px-4 py-2.5 font-semibold">ຫ້ອງ</th>
                        <th className="px-4 py-2.5 font-semibold">ເຊັກອິນ</th>
                        <th className="px-4 py-2.5 font-semibold">ເຊັກເອົ້າ</th>
                        <th className="px-4 py-2.5 font-semibold">ຊ່ອງທາງ</th>
                        <th className="px-4 py-2.5 font-semibold text-right">ຍອດລວມ</th>
                        <th className="px-4 py-2.5 font-semibold text-right">ຊຳລະແລ້ວ</th>
                        <th className="px-4 py-2.5 font-semibold text-right">ຍອດຄ້າງ</th>
                        <th className="px-4 py-2.5 font-semibold text-center">ສະຖານະ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {financialData.bookingDetails.map((b) => {
                        const activeBalance = b.balance > 0 &&
                          b.status !== "CHECKED_OUT" && b.status !== "CANCELLED";
                        return (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-4 py-2.5 font-medium">
                              <a href={`/bookings/${b.id}`} className="text-indigo-700 hover:underline">
                                {b.guestName}
                              </a>
                              {b.discountNote && (
                                <span className="ml-1.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded px-1">ສ່ວນລົດ</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-slate-700">
                              #{b.roomNumber} <span className="text-xs text-slate-400">{b.roomType}</span>
                            </td>
                            <td className="px-4 py-2.5 text-slate-500 text-xs">{fmtDateShort(b.checkIn)}</td>
                            <td className="px-4 py-2.5 text-slate-500 text-xs">{fmtDateShort(b.checkOut)}</td>
                            <td className="px-4 py-2.5 text-slate-500 text-xs">{sourceLabel[b.source] ?? b.source}</td>
                            <td className="px-4 py-2.5 text-right text-slate-900 font-medium">₭{b.totalAmount.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right text-emerald-700 font-semibold">₭{b.paidAmount.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-right">
                              {activeBalance ? (
                                <span className="text-rose-600 font-semibold">₭{b.balance.toLocaleString()}</span>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium border ${statusStyle[b.status] ?? ""}`}>
                                {statusLabel[b.status] ?? b.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-200">
                        <td colSpan={5} className="px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">ລວມ</td>
                        <td className="px-4 py-2.5 text-right font-bold text-slate-900">
                          ₭{financialData.bookingDetails.reduce((s, b) => s + b.totalAmount, 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-700">
                          ₭{financialData.bookingDetails.reduce((s, b) => s + b.paidAmount, 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-2.5 text-right font-bold text-rose-600">
                          ₭{financialData.bookingDetails
                            .filter(b => b.status !== "CANCELLED" && b.status !== "CHECKED_OUT")
                            .reduce((s, b) => s + b.balance, 0).toLocaleString()}
                        </td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

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
  sub,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
  sub?: string;
}) {
  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-start gap-4">
      <div className={`p-3 rounded-lg ${bg} ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
