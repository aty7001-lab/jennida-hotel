import React from "react";
import { SlipReservation } from "./BookingSlipButton";

const statusLao: Record<string, string> = {
  PENDING:     "ລໍຖ້າການຢືນຢັນ",
  CONFIRMED:   "ຢືນຢັນແລ້ວ",
  CHECKED_IN:  "ເຊັກອິນແລ້ວ",
  CHECKED_OUT: "ເຊັກເອົ້າແລ້ວ",
  CANCELLED:   "ຍົກເລີກ",
};

const sourceLao: Record<string, string> = {
  WALK_IN:     "ໂດຍກົງ (Walk-in)",
  PHONE:       "ໂທລະສັບ",
  OTA_AGODA:   "Agoda",
  OTA_BOOKING: "Booking.com",
};

const methodLao: Record<string, string> = {
  CASH:        "ເງິນສົດ",
  TRANSFER:    "ໂອນເງິນ",
  CREDIT_CARD: "ບັດເຄຣດິດ",
};

export function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function fmtDate(s: string) {
  const d = new Date(s);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

export function nights(ci: string, co: string) {
  return Math.max(1, Math.round((new Date(co).getTime() - new Date(ci).getTime()) / 86400000));
}

export function bookingNo(id: string) {
  return "BK-" + id.replace(/-/g,"").slice(0,8).toUpperCase();
}

const thStyle: React.CSSProperties = {
  padding: "7px 10px",
  fontSize: "10px",
  fontWeight: "700",
  color: "#fff",
  textAlign: "left",
  borderRight: "1px solid #243F7A",
};

const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: "10.5px",
  color: "#1A1A2E",
  border: "1px solid #E2E8F0",
};

function InfoRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:"4px", fontSize:"10.5px" }}>
      <span style={{ color:"#64748B", minWidth:"90px" }}>{label}</span>
      <span style={{ fontWeight: bold ? "700" : "500", color:"#1A1A2E", textAlign:"right", maxWidth:"140px", wordBreak:"break-word" }}>{value}</span>
    </div>
  );
}

function FinRow({ label, value, total, green }: { label: string; value: string; total?: boolean; green?: boolean }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", padding: total ? "6px 0" : "3px 0", fontSize: total ? "12px" : "10.5px", fontWeight: total ? "800" : "600", color: total ? (green ? "#166534" : "#1B3A6B") : "#475569" }}>
      <span>{label}</span>
      <span style={{ color: total ? (green ? "#166534" : "#1B3A6B") : "#1A1A2E" }}>{value}</span>
    </div>
  );
}

export default function SlipContent({ reservation }: { reservation: SlipReservation }) {
  const stayNights = nights(reservation.checkIn, reservation.checkOut);
  const paidAmount = reservation.payments.filter(p => p.status === "COMPLETED").reduce((s,p) => s + p.amount, 0);
  const balance    = reservation.totalAmount - paidAmount;
  const isCancelled = reservation.status === "CANCELLED";
  const isCheckedOut = reservation.status === "CHECKED_OUT";

  return (
    <div style={{ width:"190mm", maxWidth:"100%", boxSizing:"border-box", fontFamily:"'Noto Sans Lao','Segoe UI',Tahoma,Arial,sans-serif", background:"#fff" }}>

      {/* ── HEADER ── */}
      <div style={{ background:"#1B3A6B", padding:"18px 28px 14px", display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"5px" }}>
            <div style={{ width:"34px", height:"34px", background:"#B8963E", borderRadius:"7px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"17px", fontWeight:"900", color:"#fff" }}>H</div>
            <div>
              <div style={{ fontSize:"16px", fontWeight:"800", color:"#fff", letterSpacing:"0.5px" }}>Jennida Hotel</div>
              <div style={{ fontSize:"10px", color:"#94B8D8", marginTop:"1px" }}>{reservation.room.branch.name}</div>
            </div>
          </div>
          {reservation.room.branch.address && (
            <div style={{ fontSize:"9px", color:"#7AAAC8", marginTop:"3px" }}>{reservation.room.branch.address}</div>
          )}
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:"10.5px", fontWeight:"700", color:"#B8963E", letterSpacing:"1px", textTransform:"uppercase" }}>ໃບຢືນຢັນການຈອງ</div>
          <div style={{ fontSize:"8.5px", color:"#94B8D8", marginTop:"1px" }}>Booking Confirmation</div>
          <div style={{ marginTop:"6px", background:"rgba(255,255,255,0.1)", borderRadius:"5px", padding:"3px 10px", display:"inline-block" }}>
            <div style={{ fontSize:"13px", fontWeight:"800", color:"#fff", letterSpacing:"1px" }}>{bookingNo(reservation.id)}</div>
          </div>
          <div style={{ fontSize:"8.5px", color:"#7AAAC8", marginTop:"3px" }}>ວັນທີ: {fmtDate(reservation.createdAt)}</div>
        </div>
      </div>
      <div style={{ height:"3px", background:"#B8963E" }} />

      {/* ── STATUS BANNER ── */}
      <div style={{ background: isCancelled ? "#FEE2E2" : isCheckedOut ? "#F1F5F9" : "#EEF7EE", padding:"5px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:"1px solid #E2E8F0" }}>
        <div style={{ fontSize:"10px", color:"#64748B" }}>ສະຖານະ / Status:</div>
        <div style={{ fontSize:"10px", fontWeight:"700", color: isCancelled ? "#991B1B" : isCheckedOut ? "#475569" : "#166534" }}>
          ● {statusLao[reservation.status] || reservation.status}
        </div>
      </div>

      <div style={{ padding:"16px 28px" }}>

        {/* ── GUEST + ROOM ── */}
        <div style={{ display:"flex", gap:"14px", marginBottom:"14px" }}>
          <div style={{ flex:1, border:"1px solid #E2E8F0", borderRadius:"7px", overflow:"hidden" }}>
            <div style={{ background:"#F8FAFC", padding:"6px 12px", borderBottom:"1px solid #E2E8F0", fontSize:"9px", fontWeight:"700", color:"#475569", textTransform:"uppercase", letterSpacing:"0.8px" }}>ຂໍ້ມູນແຂກ / Guest</div>
            <div style={{ padding:"9px 12px" }}>
              <InfoRow label="ຊື່ / Name"        value={reservation.guest.name} bold />
              <InfoRow label="ໂທ / Phone"        value={reservation.guest.phone || "–"} />
              <InfoRow label="ອີເມວ / Email"     value={reservation.guest.email || "–"} />
              <InfoRow label="ໃບຢືນຢັນຕົວ / ID" value={reservation.guest.idCard || "–"} />
            </div>
          </div>
          <div style={{ flex:1, border:"1px solid #E2E8F0", borderRadius:"7px", overflow:"hidden" }}>
            <div style={{ background:"#F8FAFC", padding:"6px 12px", borderBottom:"1px solid #E2E8F0", fontSize:"9px", fontWeight:"700", color:"#475569", textTransform:"uppercase", letterSpacing:"0.8px" }}>ຂໍ້ມູນຫ້ອງ / Room</div>
            <div style={{ padding:"9px 12px" }}>
              <InfoRow label="ຫ້ອງ / Room No."  value={`#${reservation.room.number}`} bold />
              <InfoRow label="ປະເພດ / Type"     value={reservation.room.type} />
              <InfoRow label="ສາຂາ / Branch"    value={reservation.room.branch.name} />
              <InfoRow label="ຊ່ອງທາງ / Source" value={sourceLao[reservation.source] || reservation.source} />
            </div>
          </div>
        </div>

        {/* ── STAY TABLE (div-based table layout — avoids global print <table> CSS) ── */}
        <div style={{ display:"table", width:"100%", borderCollapse:"collapse", marginBottom:"12px" }}>
          <div style={{ display:"table-header-group" }}>
            <div style={{ display:"table-row", background:"#1B3A6B" }}>
              <div style={{ display:"table-cell", ...thStyle }}>ລາຍການ / Description</div>
              <div style={{ display:"table-cell", ...thStyle, textAlign:"center" }}>ເຊັກອິນ</div>
              <div style={{ display:"table-cell", ...thStyle, textAlign:"center" }}>ເຊັກເອົ້າ</div>
              <div style={{ display:"table-cell", ...thStyle, textAlign:"center" }}>ຄືນ</div>
              <div style={{ display:"table-cell", ...thStyle, textAlign:"right" }}>ລາຄາ/ຄືນ</div>
              <div style={{ display:"table-cell", ...thStyle, textAlign:"right", borderRight:"none" }}>ລວມ</div>
            </div>
          </div>
          <div style={{ display:"table-row-group" }}>
            <div style={{ display:"table-row", background:"#F8FAFC" }}>
              <div style={{ display:"table-cell", ...tdStyle }}>ຫ້ອງພັກ {reservation.room.type} #{reservation.room.number}</div>
              <div style={{ display:"table-cell", ...tdStyle, textAlign:"center" }}>{fmtDate(reservation.checkIn)}</div>
              <div style={{ display:"table-cell", ...tdStyle, textAlign:"center" }}>{fmtDate(reservation.checkOut)}</div>
              <div style={{ display:"table-cell", ...tdStyle, textAlign:"center", fontWeight:"700" }}>{stayNights}</div>
              <div style={{ display:"table-cell", ...tdStyle, textAlign:"right" }}>₭{fmt(reservation.room.price)}</div>
              <div style={{ display:"table-cell", ...tdStyle, textAlign:"right", fontWeight:"700" }}>₭{fmt(reservation.totalAmount)}</div>
            </div>
          </div>
        </div>

        {/* ── FINANCIAL ── */}
        <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"14px" }}>
          <div style={{ width:"250px" }}>
            <FinRow label="ລາຄາລວມ / Subtotal"  value={`₭${fmt(reservation.totalAmount)}`} />
            <FinRow label="ເງິນມັດຈຳ / Deposit" value={`₭${fmt(reservation.deposit)}`} />
            {paidAmount > reservation.deposit && (
              <FinRow label="ຊຳລະແລ້ວ / Paid"   value={`₭${fmt(paidAmount)}`} />
            )}
            <div style={{ height:"1px", background:"#1B3A6B", margin:"5px 0" }} />
            <FinRow
              label={balance <= 0 ? "ຊຳລະຄົບ / Fully Paid" : "ຍັງຄ້າງ / Balance Due"}
              value={`₭${fmt(Math.abs(balance))}`}
              total green={balance <= 0}
            />
          </div>
        </div>

        {/* ── PAYMENT HISTORY ── */}
        {reservation.payments.filter(p => p.status === "COMPLETED").length > 0 && (
          <div style={{ marginBottom:"14px" }}>
            <div style={{ fontSize:"9px", fontWeight:"700", color:"#475569", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:"5px" }}>ປະຫວັດການຊຳລະ / Payment History</div>
            <div style={{ display:"table", width:"100%", borderCollapse:"collapse", fontSize:"10px" }}>
              <div style={{ display:"table-header-group" }}>
                <div style={{ display:"table-row", background:"#F1F5F9", borderBottom:"1px solid #E2E8F0" }}>
                  <div style={{ display:"table-cell", padding:"4px 10px", textAlign:"left", fontWeight:"600", color:"#64748B" }}>ວັນທີ</div>
                  <div style={{ display:"table-cell", padding:"4px 10px", textAlign:"left", fontWeight:"600", color:"#64748B" }}>ວິທີຊຳລະ</div>
                  <div style={{ display:"table-cell", padding:"4px 10px", textAlign:"right", fontWeight:"600", color:"#64748B" }}>ຈຳນວນ</div>
                </div>
              </div>
              <div style={{ display:"table-row-group" }}>
                {reservation.payments.filter(p => p.status === "COMPLETED").map((p,i) => (
                  <div key={i} style={{ display:"table-row", borderBottom:"1px solid #F1F5F9", background: i%2===0 ? "#fff" : "#FAFAFA" }}>
                    <div style={{ display:"table-cell", padding:"4px 10px", color:"#475569" }}>{fmtDate(p.createdAt)}</div>
                    <div style={{ display:"table-cell", padding:"4px 10px", color:"#1A1A2E" }}>{methodLao[p.method] || p.method}</div>
                    <div style={{ display:"table-cell", padding:"4px 10px", textAlign:"right", fontWeight:"600", color:"#166534" }}>₭{fmt(p.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── NOTE ── */}
        <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:"5px", padding:"8px 12px", marginBottom:"16px" }}>
          <div style={{ fontSize:"8.5px", fontWeight:"700", color:"#92400E", marginBottom:"3px" }}>ໝາຍເຫດ / Notes</div>
          <div style={{ fontSize:"9px", color:"#78350F", lineHeight:"1.6" }}>
            • ໃບຢືນຢັນນີ້ສາມາດໃຊ້ເປັນຫຼັກຖານໃນການເບີກຄ່າໃຊ້ຈ່າຍຈາກບໍລິສັດໄດ້<br />
            • This confirmation may be used as a company reimbursement document<br />
            • ກະລຸນາຮັກສາໄວ້ຈົນກວ່າຈະ Check-out / Please retain until check-out
          </div>
        </div>

        {/* ── SIGNATURES ── */}
        <div style={{ display:"flex", gap:"16px" }}>
          {[["ຜູ້ຮັບການຈອງ","Received by"],["ແຂກ / Guest","Signature"]].map(([lao,eng]) => (
            <div key={lao} style={{ flex:1, borderTop:"1.5px solid #CBD5E1", paddingTop:"6px" }}>
              <div style={{ fontSize:"9.5px", fontWeight:"600", color:"#475569" }}>{lao}</div>
              <div style={{ fontSize:"8px", color:"#94A3B8" }}>{eng} &nbsp;|&nbsp; ວັນທີ: ____/____/________</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background:"#F8FAFC", borderTop:"1px solid #E2E8F0", padding:"6px 28px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:"8px", color:"#94A3B8" }}>
          ເລກທີ: {bookingNo(reservation.id)} &nbsp;|&nbsp; ສ້າງ: {fmtDate(reservation.createdAt)} &nbsp;|&nbsp; {reservation.room.branch.code}
        </div>
        <div style={{ fontSize:"8px", color:"#94A3B8" }}>Jennida Hotel Management System</div>
      </div>
    </div>
  );
}
