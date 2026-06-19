import React from "react";
import { SlipReservation } from "./BookingSlipButton";
import { fmt, fmtDate, nights, bookingNo } from "./SlipContent";

const methodLao: Record<string, string> = {
  CASH:        "ເງິນສົດ",
  TRANSFER:    "ໂອນເງິນ",
  CREDIT_CARD: "ບັດເຄຣດິດ",
};

const th = (align: "left"|"center"|"right" = "left"): React.CSSProperties => ({
  display: "table-cell",
  padding: "7px 10px",
  fontSize: "10px",
  fontWeight: "700",
  color: "#fff",
  textAlign: align,
  borderRight: "1px solid #243F7A",
  whiteSpace: "nowrap",
});

const td = (align: "left"|"center"|"right" = "left", bold = false): React.CSSProperties => ({
  display: "table-cell",
  padding: "7px 10px",
  fontSize: "10.5px",
  color: bold ? "#1A1A2E" : "#374151",
  fontWeight: bold ? "700" : "400",
  border: "1px solid #E2E8F0",
  textAlign: align,
  whiteSpace: "nowrap",
});

export default function ConsolidatedSlip({ slips }: { slips: SlipReservation[] }) {
  if (slips.length === 0) return null;

  const branch         = slips[0].room.branch;
  const refNo          = "GRP-" + Date.now().toString(36).toUpperCase().slice(-6);
  const today          = fmtDate(new Date().toISOString());

  const grandTotal     = slips.reduce((s, r) => s + r.totalAmount, 0);
  const grandDeposit   = slips.reduce((s, r) => s + r.deposit, 0);
  const grandPaid      = slips.reduce((s, r) =>
    s + r.payments.filter(p => p.status === "COMPLETED").reduce((a, p) => a + p.amount, 0), 0);
  const grandBalance   = grandTotal - grandPaid;

  // Merge all completed payments
  const allPayments = slips.flatMap(r =>
    r.payments.filter(p => p.status === "COMPLETED").map(p => ({ ...p, guestName: r.guest.name, roomNo: r.room.number }))
  );

  // Group by method for summary
  const payByMethod: Record<string, number> = {};
  allPayments.forEach(p => { payByMethod[p.method] = (payByMethod[p.method] || 0) + p.amount; });

  return (
    <div style={{ width: "190mm", maxWidth: "100%", boxSizing: "border-box", fontFamily: "'Noto Sans Lao','Segoe UI',Tahoma,Arial,sans-serif", background: "#fff" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "#1B3A6B", padding: "18px 28px 14px", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
            <div style={{ width: "34px", height: "34px", background: "#B8963E", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", fontWeight: "900", color: "#fff" }}>H</div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: "800", color: "#fff" }}>Jennida Hotel</div>
              <div style={{ fontSize: "10px", color: "#94B8D8", marginTop: "1px" }}>{branch.name}</div>
            </div>
          </div>
          {branch.address && <div style={{ fontSize: "9px", color: "#7AAAC8", marginTop: "3px" }}>{branch.address}</div>}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "10.5px", fontWeight: "700", color: "#B8963E", letterSpacing: "1px", textTransform: "uppercase" }}>ໃບຢືນຢັນການຈອງ (ລວມ)</div>
          <div style={{ fontSize: "8.5px", color: "#94B8D8", marginTop: "1px" }}>Group Booking Confirmation</div>
          <div style={{ marginTop: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "5px", padding: "3px 12px", display: "inline-block" }}>
            <div style={{ fontSize: "13px", fontWeight: "800", color: "#fff", letterSpacing: "1px" }}>{refNo}</div>
          </div>
          <div style={{ fontSize: "8.5px", color: "#7AAAC8", marginTop: "3px" }}>ວັນທີ: {today}</div>
        </div>
      </div>
      <div style={{ height: "3px", background: "#B8963E" }} />

      {/* ── SUMMARY BADGE ── */}
      <div style={{ background: "#EEF4FF", borderBottom: "1px solid #C7D7F5", padding: "6px 28px", display: "flex", gap: "24px", alignItems: "center" }}>
        <div style={{ fontSize: "10px", color: "#3B5EA6", fontWeight: "600" }}>ລວມ {slips.length} ຫ້ອງ</div>
        <div style={{ fontSize: "10px", color: "#3B5EA6" }}>|</div>
        <div style={{ fontSize: "10px", color: "#3B5EA6" }}>
          ເລກທີ: {slips.map(r => bookingNo(r.id)).join(", ")}
        </div>
      </div>

      <div style={{ padding: "18px 28px" }}>

        {/* ── ROOMS TABLE ── */}
        <div style={{ fontSize: "9px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
          ລາຍລະອຽດຫ້ອງພັກ / Room Details
        </div>
        <div style={{ display: "table", width: "100%", borderCollapse: "collapse" }}>
          <div style={{ display: "table-header-group" }}>
            <div style={{ display: "table-row", background: "#1B3A6B" }}>
              <div style={th()}>ຊື່ແຂກ / Guest</div>
              <div style={th("center")}>ຫ້ອງ</div>
              <div style={th()}>ປະເພດ</div>
              <div style={th("center")}>ເຊັກອິນ</div>
              <div style={th("center")}>ເຊັກເອົ້າ</div>
              <div style={th("center")}>ຄືນ</div>
              <div style={th("right")}>ລາຄາ/ຄືນ</div>
              <div style={{ ...th("right"), borderRight: "none" }}>ລວມ</div>
            </div>
          </div>
          <div style={{ display: "table-row-group" }}>
            {slips.map((r, i) => {
              const n = nights(r.checkIn, r.checkOut);
              return (
                <div key={r.id} style={{ display: "table-row", background: i % 2 === 0 ? "#fff" : "#F8FAFC" }}>
                  <div style={td()}>{r.guest.name}</div>
                  <div style={td("center", true)}>#{r.room.number}</div>
                  <div style={td()}>{r.room.type}</div>
                  <div style={td("center")}>{fmtDate(r.checkIn)}</div>
                  <div style={td("center")}>{fmtDate(r.checkOut)}</div>
                  <div style={td("center", true)}>{n}</div>
                  <div style={td("right")}>₭{fmt(r.room.price)}</div>
                  <div style={td("right", true)}>₭{fmt(r.totalAmount)}</div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Grand total bar (flex, not table — avoids needing colspan) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#1B3A6B", padding: "8px 10px", marginBottom: "16px", border: "1px solid #243F7A" }}>
          <span style={{ fontSize: "11px", fontWeight: "700", color: "#fff" }}>
            ລວມທັງໝົດ ({slips.length} ຫ້ອງ / Rooms)
          </span>
          <span style={{ fontSize: "12px", fontWeight: "800", color: "#FFD87A" }}>
            ₭{fmt(grandTotal)}
          </span>
        </div>

        {/* ── FINANCIAL SUMMARY (right-aligned) ── */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "24px", marginBottom: "16px" }}>

          {/* Payment breakdown by method */}
          {Object.keys(payByMethod).length > 0 && (
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "9px", fontWeight: "700", color: "#475569", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>
                ການຊຳລະ / Payments Received
              </div>
              <div style={{ display: "table", width: "100%", borderCollapse: "collapse", fontSize: "10px" }}>
                <div style={{ display: "table-header-group" }}>
                  <div style={{ display: "table-row", background: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
                    <div style={{ display: "table-cell", padding: "4px 8px", textAlign: "left", fontWeight: "600", color: "#64748B" }}>ວິທີ</div>
                    <div style={{ display: "table-cell", padding: "4px 8px", textAlign: "right", fontWeight: "600", color: "#64748B" }}>ຈຳນວນ</div>
                  </div>
                </div>
                <div style={{ display: "table-row-group" }}>
                  {Object.entries(payByMethod).map(([method, amount], i) => (
                    <div key={method} style={{ display: "table-row", background: i % 2 === 0 ? "#fff" : "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                      <div style={{ display: "table-cell", padding: "4px 8px", color: "#374151" }}>{methodLao[method] || method}</div>
                      <div style={{ display: "table-cell", padding: "4px 8px", textAlign: "right", fontWeight: "600", color: "#166534" }}>₭{fmt(amount)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Amount summary */}
          <div style={{ width: "230px", alignSelf: "flex-end" }}>
            <Row label="ລາຄາລວມທັງໝົດ"     value={`₭${fmt(grandTotal)}`} />
            <Row label="ເງິນມັດຈຳລວມ"       value={`₭${fmt(grandDeposit)}`} />
            {grandPaid > grandDeposit && (
              <Row label="ຊຳລະແລ້ວລວມ"      value={`₭${fmt(grandPaid)}`} />
            )}
            <div style={{ height: "1.5px", background: "#1B3A6B", margin: "6px 0" }} />
            <Row
              label={grandBalance <= 0 ? "ຊຳລະຄົບແລ້ວ" : "ຍັງຄ້າງຊຳລະ"}
              value={`₭${fmt(Math.abs(grandBalance))}`}
              total
              green={grandBalance <= 0}
            />
          </div>
        </div>

        {/* ── NOTE ── */}
        <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "5px", padding: "8px 12px", marginBottom: "16px" }}>
          <div style={{ fontSize: "8.5px", fontWeight: "700", color: "#92400E", marginBottom: "3px" }}>ໝາຍເຫດ / Notes</div>
          <div style={{ fontSize: "9px", color: "#78350F", lineHeight: "1.6" }}>
            • ໃບຢືນຢັນນີ້ສາມາດໃຊ້ເປັນຫຼັກຖານໃນການເບີກຄ່າໃຊ້ຈ່າຍຈາກບໍລິສັດໄດ້<br />
            • This confirmation may be used as a company reimbursement document<br />
            • ກ່ວາມຮວມຂອງ {slips.length} ຫ້ອງ ລາຍການ: {slips.map(r => `#${r.room.number}`).join(", ")}
          </div>
        </div>

        {/* ── SIGNATURES ── */}
        <div style={{ display: "flex", gap: "16px" }}>
          {[["ຜູ້ຮັບການຈອງ", "Received by"], ["ຜູ້ຈ່າຍ / Payer", "Authorized Signature"]].map(([lao, eng]) => (
            <div key={lao} style={{ flex: 1, borderTop: "1.5px solid #CBD5E1", paddingTop: "6px" }}>
              <div style={{ fontSize: "9.5px", fontWeight: "600", color: "#475569" }}>{lao}</div>
              <div style={{ fontSize: "8px", color: "#94A3B8" }}>{eng} &nbsp;|&nbsp; ວັນທີ: ____/____/________</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{ background: "#F8FAFC", borderTop: "1px solid #E2E8F0", padding: "6px 28px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: "8px", color: "#94A3B8" }}>
          ເລກທີ: {refNo} &nbsp;|&nbsp; ພິມ: {today} &nbsp;|&nbsp; {branch.code}
        </div>
        <div style={{ fontSize: "8px", color: "#94A3B8" }}>Jennida Hotel Management System</div>
      </div>
    </div>
  );
}

function Row({ label, value, total, green }: { label: string; value: string; total?: boolean; green?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: total ? "5px 0" : "2px 0", fontSize: total ? "12px" : "10.5px", fontWeight: total ? "800" : "500", color: total ? (green ? "#166534" : "#1B3A6B") : "#475569" }}>
      <span>{label}</span>
      <span style={{ color: total ? (green ? "#166534" : "#1B3A6B") : "#1A1A2E" }}>{value}</span>
    </div>
  );
}
