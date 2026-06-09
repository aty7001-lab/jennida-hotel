"use client";

import { Trash2 } from "lucide-react";
import { deleteRoom } from "@/actions/manage-rooms";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

export function DeleteRoomButton({ roomId }: { roomId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteRoom(roomId);
    } catch (err) {
      alert("Failed to delete room. It might be linked to existing reservations.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete Room"
      >
        <Trash2 size={16} />
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="Delete Room"
        message="Are you sure you want to delete this room? This action cannot be undone and will fail if the room has existing reservations."
        confirmText="Yes, Delete Room"
        type="danger"
      />
    </>
  );
}
