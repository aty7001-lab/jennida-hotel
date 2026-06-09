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
        title="Mark as Cleaned"
      >
        <Sparkles size={16} />
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Mark Room as Cleaned"
        message="Are you sure this room has been cleaned and is ready for the next guest? The status will change to AVAILABLE."
        confirmText="Yes, Mark as Cleaned"
        type="success"
      />
    </>
  );
}
