import { Download, Search, Filter } from 'lucide-react';
import { getDictionary } from "@/lib/dictionary";
import { getPayments } from "@/actions/reports";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getActiveBranchId } from "@/lib/active-branch";

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const params = await searchParams;
  const dict = await getDictionary();
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === "STAFF";
  const userBranchId = session?.user?.branchId;
  const cookieBranchId = await getActiveBranchId();
  const activeBranchId = isStaff ? userBranchId : cookieBranchId;
  const allPayments = await getPayments(activeBranchId);

  // Search filter
  let payments = allPayments;
  if (params.q) {
    const q = params.q.toLowerCase();
    payments = payments.filter(p =>
      (p.reservation?.guest?.name || '').toLowerCase().includes(q) ||
      (p.reservation?.room?.number || '').toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q)
    );
  }
  // Status filter
  if (params.status) {
    payments = payments.filter(p => p.status === params.status);
  }

  // CSV Export URL
  const csvData = payments.map(p => ({
    id: p.id.substring(0, 8),
    guest: p.reservation?.guest?.name || 'Unknown',
    room: p.reservation?.room?.number || 'N/A',
    date: p.createdAt.toLocaleDateString(),
    amount: p.amount,
    status: p.status,
  }));
  const csvContent = [
    'ID,Guest,Room,Date,Amount,Status',
    ...csvData.map(r => `${r.id},${r.guest},#${r.room},${r.date},${r.amount},${r.status}`)
  ].join('\n');
  const csvUri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{dict.payments.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{dict.payments.subtitle}</p>
        </div>
        <a href={csvUri} download="payments_export.csv" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <Download size={16} />
          {dict.payments.export}
        </a>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <form className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              name="q"
              defaultValue={params.q || ''}
              placeholder={dict.payments.search}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <select name="status" defaultValue={params.status || ''} className="w-full sm:w-40 border border-slate-300 rounded-md px-3 py-2 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            <option value="">ທຸກສະຖານະ</option>
            <option value="COMPLETED">ສຳເລັດ</option>
            <option value="PENDING">ລໍຖ້າ</option>
            <option value="REFUNDED">ຄືນເງິນ</option>
          </select>
          <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
            <Filter size={16} />
            ກອງຂໍ້ມູນ
          </button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-6 py-4 font-semibold">{dict.payments.id}</th>
                <th className="px-6 py-4 font-semibold">{dict.payments.guest}</th>
                <th className="px-6 py-4 font-semibold">{dict.payments.room}</th>
                <th className="px-6 py-4 font-semibold">{dict.payments.date}</th>
                <th className="px-6 py-4 font-semibold">{dict.payments.amount}</th>
                <th className="px-6 py-4 font-semibold text-right">{dict.payments.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-sm">
                    ຍັງບໍ່ມີຂໍ້ມູນການຊຳລະ
                  </td>
                </tr>
              ) : payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{payment.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">{payment.reservation?.guest?.name || 'ບໍ່ຮູ້'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700">#{payment.reservation?.room?.number || 'ບໍ່ມີ'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{payment.createdAt.toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">₭{payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      payment.status === 'COMPLETED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : payment.status === 'REFUNDED'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
          <span className="text-sm text-slate-500">ສະແດງ <span className="font-medium text-slate-900">{payments.length}</span> ຈາກ <span className="font-medium text-slate-900">{allPayments.length}</span> ລາຍການ</span>
        </div>
      </div>
    </div>
  );
}
