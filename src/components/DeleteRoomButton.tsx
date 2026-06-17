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
      alert("ລົບຫ້ອງບໍ່ໄດ້ — ອາດມີການຈອງຜູກຢູ່ກັບຫ້ອງນີ້.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="ລົບຫ້ອງ"
      >
        <Trash2 size={16} />
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="ລົບຫ້ອງ"
        message="ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບຫ້ອງນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້ ແລະ ຈະລົ້ມເຫຼວຖ້າຫ້ອງມີການຈອງຢູ່."
        confirmText="ແມ່ນ, ລົບຫ້ອງ"
        type="danger"
      />
    </>
  );
}
