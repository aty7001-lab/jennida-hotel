"use client";

import { Trash2 } from "lucide-react";
import { deleteUser } from "@/actions/users";
import { useState } from "react";
import { ConfirmModal } from "./ConfirmModal";

export function DeleteUserButton({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  if (isSelf) return null;

  const handleDelete = async () => {
    try {
      await deleteUser(userId);
    } catch {
      alert("ລົບຜູ້ໃຊ້ບໍ່ໄດ້ — ອາດມີຂໍ້ມູນຜູກຢູ່ກັບຜູ້ໃຊ້ນີ້");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="ລົບຜູ້ໃຊ້"
      >
        <Trash2 size={16} />
      </button>
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title="ລົບຜູ້ໃຊ້"
        message="ທ່ານແນ່ໃຈບໍ່ທີ່ຈະລົບຜູ້ໃຊ້ນີ້? ການກະທຳນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້."
        confirmText="ລົບຜູ້ໃຊ້"
        type="danger"
      />
    </>
  );
}
