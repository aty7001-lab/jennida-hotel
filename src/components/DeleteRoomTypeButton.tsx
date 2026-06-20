"use client";

import { deleteRoomType } from "@/actions/room-types";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteRoomTypeButton({
  id,
  name,
  roomCount,
}: {
  id: string;
  name: string;
  roomCount: number;
}) {
  const [loading, setLoading] = useState(false);

  if (roomCount > 0) {
    return (
      <button
        disabled
        title={`ບໍ່ສາມາດລຶບໄດ້ — ມີ ${roomCount} ຫ້ອງໃຊ້ຢູ່`}
        className="p-1.5 text-slate-300 cursor-not-allowed rounded"
      >
        <Trash2 size={15} />
      </button>
    );
  }

  async function handleDelete() {
    if (!confirm(`ລຶບປະເພດ "${name}" ແທ້ບໍ່?`)) return;
    setLoading(true);
    try {
      await deleteRoomType(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "ເກີດຂໍ້ຜິດພາດ");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title="ລຶບ"
      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
    >
      <Trash2 size={15} />
    </button>
  );
}
