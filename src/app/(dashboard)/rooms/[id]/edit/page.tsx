import { updateRoom } from "@/actions/manage-rooms";
import { getRoomById } from "@/actions/rooms";
import { getAllBranches } from "@/actions/branches";
import { Bed } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await getRoomById(id);
  
  if (!room) {
    notFound();
  }

  const branches = await getAllBranches();

  // Create an update function bound to the room ID
  const updateRoomWithId = updateRoom.bind(null, id);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Edit Room</h1>
        <p className="text-sm text-slate-500 mt-1">Update room details in the system.</p>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <form action={updateRoomWithId}>
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2 mb-2 pb-3 border-b border-slate-100">
              <Bed className="text-indigo-500" size={20} />
              <h2 className="text-lg font-semibold text-slate-800">Room Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Number</label>
                <input name="number" type="text" defaultValue={room.number} required className="w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Room Type</label>
                <select name="type" defaultValue={room.type} required className="w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all">
                  <option value="1 Bed">1 Bed</option>
                  <option value="1 Bed VIP">1 Bed VIP</option>
                  <option value="2 Beds">2 Beds</option>
                  <option value="2 Beds VIP">2 Beds VIP</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price per Night (₭)</label>
                <input name="price" type="number" step="0.01" min="0" defaultValue={room.price} required className="w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch</label>
                <select name="branchId" defaultValue={room.branchId} required className="w-full border-slate-300 rounded-md px-3.5 py-2.5 bg-white border text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all">
                  <option value="" disabled>Select branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="submit" className="px-5 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
              Update Room
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
