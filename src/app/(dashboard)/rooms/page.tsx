import Link from 'next/link';
import { Plus, Search, Filter, Edit2 } from 'lucide-react';
import { getRoomsByBranch } from '@/actions/rooms';
import { getAllBranches } from '@/actions/branches';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DeleteRoomButton } from '@/components/DeleteRoomButton';
import { MarkCleanButton } from '@/components/MarkCleanButton';

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; branch?: string }> }) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isStaff = session?.user?.role === 'STAFF';
  const userBranchId = session?.user?.branchId;

  // Role-Based: Staff sees only their branch
  const branchFilter = isStaff ? userBranchId : params.branch || undefined;
  const allRooms = await getRoomsByBranch(branchFilter);
  const branches = await getAllBranches();

  // Search filter (server-side)
  let rooms = allRooms;
  if (params.q) {
    const q = params.q.toLowerCase();
    rooms = rooms.filter(r =>
      r.number.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      (r.branch?.name || '').toLowerCase().includes(q)
    );
  }
  // Status filter
  if (params.status) {
    rooms = rooms.filter(r => r.status === params.status);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rooms Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isStaff ? `Showing rooms for your branch only.` : `Manage all rooms and their current statuses.`}
          </p>
        </div>
        <Link href="/rooms/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <Plus size={16} />
          Add New Room
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <form className="p-3 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3 bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              name="q"
              defaultValue={params.q || ''}
              placeholder="Search rooms..."
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <select name="status" defaultValue={params.status || ''} className="w-full sm:w-40 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
            <option value="">All Status</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="CLEANING">Cleaning</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          {!isStaff && (
            <select name="branch" defaultValue={params.branch || ''} className="w-full sm:w-48 border border-slate-300 rounded-md px-3 py-1.5 text-sm bg-white text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          )}
          <button type="submit" className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
            <Filter size={14} />
            Apply
          </button>
        </form>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="px-4 py-3 font-semibold">Room No.</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Branch</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500 text-sm">
                    No rooms found.
                  </td>
                </tr>
              ) : rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-2.5 text-sm text-slate-900 font-medium">#{room.number}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{room.type}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-700">{room.branch?.name || '-'}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-900">₭{room.price.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                      room.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      room.status === 'OCCUPIED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      room.status === 'CLEANING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right space-x-2">
                    <Link 
                      href={`/rooms/${room.id}/edit`}
                      className="inline-flex p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                      title="Edit Room"
                    >
                      <Edit2 size={16} />
                    </Link>
                    {room.status === 'CLEANING' && <MarkCleanButton roomId={room.id} />}
                    <DeleteRoomButton roomId={room.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50">
          <span className="text-xs text-slate-500">Showing <span className="font-medium text-slate-900">{rooms.length}</span> of <span className="font-medium text-slate-900">{allRooms.length}</span> rooms</span>
        </div>
      </div>
    </div>
  );
}
