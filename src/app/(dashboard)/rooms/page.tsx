import Link from 'next/link';
import { Plus, Edit2, Building2 } from 'lucide-react';
import { getRoomsByBranch } from '@/actions/rooms';
import { getAllBranches } from '@/actions/branches';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { DeleteRoomButton } from '@/components/DeleteRoomButton';
import { MarkCleanButton } from '@/components/MarkCleanButton';
import RoomFilters from '@/components/RoomFilters';

const statusStyle: Record<string, string> = {
  AVAILABLE:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  OCCUPIED:    'bg-rose-50 text-rose-700 border-rose-200',
  CLEANING:    'bg-amber-50 text-amber-700 border-amber-200',
  MAINTENANCE: 'bg-slate-50 text-slate-700 border-slate-200',
};

export default async function RoomsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; branch?: string }> }) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const isAdmin = session?.user?.role === 'ADMIN';
  const isStaff = session?.user?.role === 'STAFF';
  const userBranchId = session?.user?.branchId;

  const branchFilter = isStaff ? userBranchId : params.branch || undefined;
  const allRooms = await getRoomsByBranch(branchFilter);
  const branches = await getAllBranches();

  let rooms = allRooms;
  if (params.q) {
    const q = params.q.toLowerCase();
    rooms = rooms.filter(r =>
      r.number.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      (r.branch?.name || '').toLowerCase().includes(q)
    );
  }
  if (params.status) {
    rooms = rooms.filter(r => r.status === params.status);
  }

  // Admin + All Branches → grouped view
  const showGrouped = isAdmin && !params.branch && !params.q && !params.status;

  const RoomRow = ({ room }: { room: typeof rooms[0] }) => (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="px-4 py-2.5 text-sm text-slate-900 font-medium">#{room.number}</td>
      <td className="px-4 py-2.5 text-sm text-slate-700">{room.type}</td>
      <td className="px-4 py-2.5 text-sm text-slate-900">₭{room.price.toLocaleString()}</td>
      <td className="px-4 py-2.5">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyle[room.status] ?? ''}`}>
          {room.status}
        </span>
      </td>
      <td className="px-4 py-2.5 text-right flex items-center justify-end gap-1">
        <Link href={`/rooms/${room.id}/edit`} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit">
          <Edit2 size={16} />
        </Link>
        {room.status === 'CLEANING' && <MarkCleanButton roomId={room.id} />}
        <DeleteRoomButton roomId={room.id} />
      </td>
    </tr>
  );

  const RoomTable = ({ rows, branchId }: { rows: typeof rooms; branchId?: string }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
            <th className="px-4 py-3 font-semibold">ຫ້ອງ</th>
            <th className="px-4 py-3 font-semibold">ປະເພດ</th>
            <th className="px-4 py-3 font-semibold">ລາຄາ/ຄືນ</th>
            <th className="px-4 py-3 font-semibold">ສະຖານະ</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-400 text-sm">ຍັງບໍ່ມີຫ້ອງ</td></tr>
          ) : rows.map(room => <RoomRow key={room.id} room={room} />)}
        </tbody>
      </table>
      {branchId && (
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">{rows.length} ຫ້ອງ</span>
          <Link
            href={`/rooms/new?branchId=${branchId}`}
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <Plus size={14} />
            ເພີ່ມຫ້ອງໃໝ່
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rooms Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isStaff ? 'Showing rooms for your branch only.' : 'Manage all rooms and their current statuses.'}
          </p>
        </div>
        {!showGrouped && (
          <Link href="/rooms/new" className="bg-indigo-600 text-white px-4 py-2 rounded-md font-medium text-sm shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            Add New Room
          </Link>
        )}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <RoomFilters
          branches={branches}
          isStaff={isStaff}
          defaultQ={params.q || ''}
          defaultStatus={params.status || ''}
          defaultBranch={params.branch || ''}
        />

        {/* Grouped view: All Branches (Admin only, no filters) */}
        {showGrouped ? (
          <div className="divide-y divide-slate-200">
            {branches.map(branch => {
              const branchRooms = allRooms.filter(r => r.branchId === branch.id);
              const isHotel1 = branch.id === '4785ab66-a2ac-49c7-b6fb-06805c49f8a8';
              return (
                <div key={branch.id}>
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-indigo-500" />
                      <span className="font-semibold text-slate-800 text-sm">{branch.name}</span>
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{branch.code}</span>
                      <span className="text-xs text-slate-500">{branchRooms.length} ຫ້ອງ</span>
                    </div>
                    {isHotel1 && (
                      <Link href={`/rooms/new?branchId=${branch.id}`} className="flex items-center gap-1.5 bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors">
                        <Plus size={13} />ເພີ່ມຫ້ອງ
                      </Link>
                    )}
                  </div>
                  <RoomTable rows={branchRooms} />
                </div>
              );
            })}
          </div>
        ) : (
          /* Flat view: filtered or staff */
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                    <th className="px-4 py-3 font-semibold">Room No.</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    {!isStaff && <th className="px-4 py-3 font-semibold">Branch</th>}
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold text-right">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rooms.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500 text-sm">No rooms found.</td></tr>
                  ) : rooms.map(room => (
                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-2.5 text-sm text-slate-900 font-medium">#{room.number}</td>
                      <td className="px-4 py-2.5 text-sm text-slate-700">{room.type}</td>
                      {!isStaff && <td className="px-4 py-2.5 text-sm text-slate-700">{room.branch?.name || '-'}</td>}
                      <td className="px-4 py-2.5 text-sm text-slate-900">₭{room.price.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyle[room.status] ?? ''}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right space-x-2">
                        <Link href={`/rooms/${room.id}/edit`} className="inline-flex p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors" title="Edit Room">
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
          </>
        )}
      </div>
    </div>
  );
}
