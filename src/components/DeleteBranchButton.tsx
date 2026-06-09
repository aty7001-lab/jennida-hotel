"use client";

import { Trash2 } from "lucide-react";
import { deleteBranch } from "@/actions/branches";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

export function DeleteBranchButton({ branchId }: { branchId: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteBranch(branchId);
    } catch {
      alert("ລົບສາຂາບໍ່ໄດ້ — ອາດມີຫ້ອງພັກ ຫຼື ຜູ້ໃຊ້ຜູກຢູ່ກັບສາຂານີ້.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete Branch"
      >
        <Trash2 size={16} />
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="ລົບສາຂາ"
        message="ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບສາຂານີ້? ຈະລົບໄດ້ສະເພາະສາຂາທີ່ບໍ່ມີຫ້ອງພັກ ຫຼື ຜູ້ໃຊ້ຜູກຢູ່."
        confirmText="ລົບສາຂາ"
        type="danger"
      />
    </>
  );
}
