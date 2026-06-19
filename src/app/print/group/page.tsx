import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getReservationsByIds } from "@/actions/reservations";
import ConsolidatedSlip from "@/components/ConsolidatedSlip";
import PrintTrigger from "@/components/PrintTrigger";
import PrintControls from "@/components/PrintControls";
import { SlipReservation } from "@/components/BookingSlipButton";

export default async function PrintGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { ids: idsParam } = await searchParams;
  if (!idsParam) notFound();

  const ids = idsParam.split(",").filter(Boolean);
  if (ids.length === 0) notFound();

  const rows = await getReservationsByIds(ids);
  if (rows.length === 0) notFound();

  const slips: SlipReservation[] = rows.map(r => ({
    id:          r.id,
    roomId:      r.roomId,
    createdAt:   r.createdAt.toISOString(),
    checkIn:     r.checkIn.toISOString(),
    checkOut:    r.checkOut.toISOString(),
    status:      r.status,
    source:      r.source,
    totalAmount: r.totalAmount,
    deposit:     r.deposit,
    credit:      r.credit,
    guest: {
      name:   r.guest.name,
      phone:  r.guest.phone  ?? null,
      email:  r.guest.email  ?? null,
      idCard: r.guest.idCard ?? null,
    },
    room: {
      number: r.room.number,
      type:   r.room.type,
      price:  r.room.price,
      branch: {
        name:    r.room.branch?.name    ?? "",
        address: r.room.branch?.address ?? null,
        code:    r.room.branch?.code    ?? "",
      },
    },
    payments: r.payments.map(p => ({
      amount:    p.amount,
      method:    p.method,
      status:    p.status,
      note:      p.note ?? null,
      createdAt: p.createdAt.toISOString(),
    })),
  }));

  return (
    <>
      <style>{`
        @page { size: A4 portrait; margin: 10mm; }
        html, body { margin: 0; padding: 0; background: #fff; }
        .print-controls {
          display: flex;
          gap: 8px;
          padding: 10px 16px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
        }
        .print-controls button {
          padding: 6px 14px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          border: none;
        }
        .btn-print { background: #4f46e5; color: #fff; }
        .btn-close { background: #e2e8f0; color: #475569; }
        @media print {
          html, body { background: #fff !important; }
          .print-controls { display: none !important; }
          * { box-shadow: none !important; }
        }
      `}</style>

      <PrintControls />

      <div style={{ padding: "12px", background: "#f1f5f9" }}>
        <ConsolidatedSlip slips={slips} />
      </div>

      <PrintTrigger />
    </>
  );
}
