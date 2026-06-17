"use client";

import { Sparkles } from "lucide-react";
import { markRoomAsClean } from "@/actions/manage-rooms";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";
import { useRouter } from "next/navigation";

export function MarkCleanButton({ roomId }: { roomId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleConfirm = async () => {
    await markRoomAsClean(roomId);
    router.refresh();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
        title="ໝາຍວ່າທຳຄວາມສະອາດແລ້ວ"
      >
        <Sparkles size={16} />
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="ໝາຍຫ້ອງວ່າສະອາດແລ້ວ"
        message="ທ່ານແນ່ໃຈບໍ່ວ່າຫ້ອງນີ້ສະອາດແລ້ວ ແລະ ພ້ອມຮັບແຂກໃໝ່? ສະຖານະຈະຖືກປ່ຽນເປັນ ວ່າງ."
        confirmText="ແມ່ນ, ຢືນຢັນວ່າສະອາດແລ້ວ"
        type="success"
      />
    </>
  );
}
