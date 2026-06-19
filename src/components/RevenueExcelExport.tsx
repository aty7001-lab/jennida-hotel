"use client";

import { FileSpreadsheet, Loader2 } from "lucide-react";
import { useState } from "react";

interface Expense {
  id: string;
  date: string | Date;
  description: string;
  category: string;
  amount: number;
  branch?: { name: string } | null;
}

interface FinancialData {
  totalRevenue: number;
  ADR: number;
  RevPAR: number;
  sourceBreakdown: Record<string, number>;
  paymentMethods: Record<string, number>;
  totalBookings: number;
}

interface Props {
  financialData: FinancialData;
  expenses: Expense[];
  startDate: string;
  endDate: string;
  branchName?: string;
  fileName?: string;
}

const NAVY   = "#1B3A6B";
const NAVY2  = "#243F7A";
const GOLD   = "#B8963E";
const GREEN  = "#1D6335";
const GREEN2 = "#E8F5EE";
const RED    = "#8B1A1A";
const RED2   = "#FDF0F0";
const GRAY1  = "#F5F7FA";
const GRAY2  = "#EEF1F6";
const GRAY3  = "#D1D9E6";
const TEXT   = "#1A1A2E";
const TEXT2  = "#4A5568";
const WHITE  = "#FFFFFF";

const categoryLao: Record<string, string> = {
  Utilities:   "ສາທາລະນູປະໂພກ",
  Salary:      "ເງີນເດືອນ",
  Maintenance: "ສ້ອມແປງ",
  Supplies:    "ອຸປະກອນ",
  Marketing:   "ການຕະຫຼາດ",
  General:     "ທົ່ວໄປ",
  Other:       "ອື່ນໆ",
};

const sourceLao: Record<string, string> = {
  WALK_IN:     "Walk-in",
  PHONE:       "ໂທລະສັບ",
  OTA_AGODA:   "Agoda",
  OTA_BOOKING: "Booking.com",
};

function fmt(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function fmtDate(d: string | Date): string {
  const dt = typeof d === "string" ? new Date(d) : d;
  return `${String(dt.getDate()).padStart(2,"0")}/${String(dt.getMonth()+1).padStart(2,"0")}/${dt.getFullYear()}`;
}

function pct(part: number, total: number): string {
  return total > 0 ? ((part / total) * 100).toFixed(1) + "%" : "0.0%";
}

export default function RevenueExcelExport({
  financialData,
  expenses,
  startDate,
  endDate,
  branchName,
  fileName = "ລາຍງານລາຍຮັບ-ລາຍຈ່າຍ",
}: Props) {
  const [loading, setLoading] = useState(false);

  function buildHtml(): string {
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const netProfit     = financialData.totalRevenue - totalExpenses;
    const isProfit      = netProfit >= 0;
    const profitColor   = isProfit ? GREEN  : RED;
    const profitBg      = isProfit ? GREEN2 : RED2;

    const catTotals: Record<string, number> = {};
    expenses.forEach(e => { catTotals[e.category] = (catTotals[e.category] || 0) + e.amount; });

    const totalCash   = financialData.paymentMethods["CASH"]        || 0;
    const totalXfer   = financialData.paymentMethods["TRANSFER"]     || 0;
    const totalCard   = financialData.paymentMethods["CREDIT_CARD"]  || 0;
    const totalPaid   = totalCash + totalXfer + totalCard;

    const period      = `${fmtDate(startDate)} – ${fmtDate(endDate)}`;
    const branch      = branchName || "ທຸກສາຂາ";
    const printedAt   = fmtDate(new Date().toISOString());

    // ─── shared style helpers ────────────────────────────────────────────
    const cell = (
      content: string,
      opts: {
        bg?: string; color?: string; bold?: boolean; align?: string;
        pt?: number; pb?: number; pl?: number; pr?: number;
        border?: string; borderTop?: string; borderBottom?: string;
        fontSize?: number; italic?: boolean; colspan?: number; width?: string;
        noWrap?: boolean;
      } = {}
    ) => {
      const {
        bg="", color=TEXT, bold=false, align="left",
        pt=6, pb=6, pl=10, pr=10,
        border=`1px solid ${GRAY3}`, borderTop, borderBottom,
        fontSize=11, italic=false, colspan=1, width="", noWrap=false,
      } = opts;
      const styles = [
        bg            && `background:${bg}`,
        `color:${color}`,
        bold          && "font-weight:700",
        italic        && "font-style:italic",
        `font-size:${fontSize}px`,
        `text-align:${align}`,
        `padding:${pt}px ${pr}px ${pb}px ${pl}px`,
        border        && `border:${border}`,
        borderTop     && `border-top:${borderTop}`,
        borderBottom  && `border-bottom:${borderBottom}`,
        width         && `width:${width}`,
        noWrap        && "white-space:nowrap",
      ].filter(Boolean).join(";");
      return `<td colspan="${colspan}" style="${styles}">${content}</td>`;
    };

    const th = (text: string, align="left", width="") =>
      cell(text, { bg:NAVY, color:WHITE, bold:true, align, fontSize:10.5,
                   border:`1px solid ${NAVY2}`, pt:7, pb:7, width });

    const sectionBar = (text: string, cols=5) =>
      `<tr><td colspan="${cols}" style="background:${NAVY};color:${WHITE};font-weight:700;font-size:11px;
        padding:6px 12px;border:1px solid ${NAVY2};letter-spacing:0.5px">${text}</td></tr>`;

    const subtotalRow = (label: string, value: number, cols=2, green=false) =>
      `<tr>
        <td colspan="${cols-1}" style="background:${GRAY2};color:${TEXT};font-weight:700;font-size:11px;
          padding:7px 10px;border-top:2px solid ${GRAY3};border-bottom:1px solid ${GRAY3};
          border-left:1px solid ${GRAY3}">
          ${label}
        </td>
        <td style="background:${GRAY2};color:${green?GREEN:TEXT};font-weight:700;font-size:11px;
          text-align:right;padding:7px 10px;border-top:2px solid ${GRAY3};
          border-bottom:1px solid ${GRAY3};border-right:1px solid ${GRAY3}">
          ₭ ${fmt(value)}
        </td>
      </tr>`;

    const netRow = (value: number) =>
      `<tr>
        <td colspan="4" style="background:${profitBg};color:${profitColor};font-weight:700;
          font-size:13px;padding:10px 12px;border-top:2.5px double ${profitColor};
          border-bottom:2.5px double ${profitColor};border-left:1px solid ${GRAY3}">
          ${isProfit ? "ກຳໄລສຸດທິ (Net Profit)" : "ຂາດທຶນສຸດທິ (Net Loss)"}
        </td>
        <td style="background:${profitBg};color:${profitColor};font-weight:700;font-size:14px;
          text-align:right;padding:10px 12px;border-top:2.5px double ${profitColor};
          border-bottom:2.5px double ${profitColor};border-right:1px solid ${GRAY3}">
          ₭ ${fmt(Math.abs(value))}
        </td>
      </tr>`;

    const spacer = (cols=5, h=14) =>
      `<tr><td colspan="${cols}" style="height:${h}px;border:none;background:${WHITE}"></td></tr>`;

    // ─── income rows ──────────────────────────────────────────────────────
    const incomeRows = Object.entries(financialData.sourceBreakdown).map(([src, amt], i) => `
      <tr>
        ${cell(`&nbsp;&nbsp;&nbsp;${sourceLao[src] || src.replace(/_/g," ")}`, { bg: i%2===0 ? WHITE : GRAY1 })}
        ${cell("ລາຍຮັບຈາກຫ້ອງພັກ", { bg: i%2===0 ? WHITE : GRAY1, color:TEXT2, fontSize:10 })}
        ${cell(pct(amt, financialData.totalRevenue), { bg: i%2===0 ? WHITE : GRAY1, align:"center", color:TEXT2 })}
        ${cell("", { bg: i%2===0 ? WHITE : GRAY1 })}
        ${cell(`₭ ${fmt(amt)}`, { bg: i%2===0 ? WHITE : GRAY1, align:"right", color:GREEN, bold:true })}
      </tr>`).join("");

    // ─── expense rows ────────────────────────────────────────────────────
    const expenseCatRows = Object.entries(catTotals).map(([cat, amt], i) => `
      <tr>
        ${cell(`&nbsp;&nbsp;&nbsp;${categoryLao[cat] || cat}`, { bg: i%2===0 ? WHITE : GRAY1 })}
        ${cell("ລາຍຈ່າຍດຳເນີນງານ", { bg: i%2===0 ? WHITE : GRAY1, color:TEXT2, fontSize:10 })}
        ${cell(pct(amt, totalExpenses), { bg: i%2===0 ? WHITE : GRAY1, align:"center", color:TEXT2 })}
        ${cell("", { bg: i%2===0 ? WHITE : GRAY1 })}
        ${cell(`(₭ ${fmt(amt)})`, { bg: i%2===0 ? WHITE : GRAY1, align:"right", color:RED, bold:true })}
      </tr>`).join("");

    // ─── detail expense rows ─────────────────────────────────────────────
    const expenseDetailRows = expenses.map((e, i) => `
      <tr>
        ${cell(fmtDate(e.date), { bg: i%2===0 ? WHITE : GRAY1, noWrap:true })}
        ${cell(e.description,   { bg: i%2===0 ? WHITE : GRAY1 })}
        ${cell(categoryLao[e.category] || e.category, { bg: i%2===0 ? WHITE : GRAY1, align:"center" })}
        ${cell(e.branch?.name || "–", { bg: i%2===0 ? WHITE : GRAY1, color:TEXT2 })}
        ${cell(`₭ ${fmt(e.amount)}`, { bg: i%2===0 ? WHITE : GRAY1, align:"right", color:RED, bold:true })}
      </tr>`).join("");

    return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Noto Sans Lao', 'Segoe UI', Tahoma, Arial, sans-serif;
         margin:0; padding:20px; background:#fff; color:${TEXT}; }
  table { border-collapse:collapse; }
  p,div { margin:0; padding:0; }
</style>
<!--[if gte mso 9]><xml>
<x:ExcelWorkbook><x:ExcelWorksheets>
<x:ExcelWorksheet>
  <x:Name>ລາຍງານ</x:Name>
  <x:WorksheetOptions><x:DisplayGridlines/><x:Print><x:FitWidth/><x:FitHeight/></x:Print></x:WorksheetOptions>
</x:ExcelWorksheet>
</x:ExcelWorksheets></x:ExcelWorkbook>
</xml><![endif]-->
</head>
<body>

<!--══════════════════════════════════════════════════════════════
    COMPANY HEADER
══════════════════════════════════════════════════════════════-->
<table style="width:780px; margin-bottom:0">
  <tr>
    <td style="background:${NAVY}; padding:0">
      <table style="width:100%">
        <tr>
          <!-- Left: logo placeholder + company -->
          <td style="width:60px; padding:16px 0 16px 20px; vertical-align:middle">
            <div style="width:48px;height:48px;background:${GOLD};border-radius:6px;
              display:flex;align-items:center;justify-content:center;
              font-weight:900;font-size:20px;color:${WHITE};text-align:center;
              line-height:48px">H</div>
          </td>
          <td style="padding:16px 0 16px 14px; vertical-align:middle">
            <div style="font-size:17px;font-weight:800;color:${WHITE};
              letter-spacing:0.5px">HOTEL MANAGEMENT</div>
            <div style="font-size:10px;color:#A8BDD6;margin-top:2px;letter-spacing:0.3px">
              ລະບົບຄຸ້ມຄອງໂຮງແຮມ &bull; Hotel Accounting System
            </div>
          </td>
          <!-- Right: report meta -->
          <td style="padding:16px 20px; vertical-align:top; text-align:right">
            <div style="font-size:14px;font-weight:700;color:${GOLD};
              letter-spacing:0.5px">ລາຍງານລາຍຮັບ-ລາຍຈ່າຍ</div>
            <div style="font-size:10px;color:#A8BDD6;margin-top:4px">Income &amp; Expense Report</div>
            <div style="margin-top:8px">
              <span style="background:rgba(255,255,255,0.12);color:#CBD8EC;
                font-size:9.5px;padding:2px 8px;border-radius:10px">
                ໄລຍະ: ${period}
              </span>
            </div>
            <div style="margin-top:4px">
              <span style="background:rgba(255,255,255,0.08);color:#A8BDD6;
                font-size:9.5px;padding:2px 8px;border-radius:10px">
                ສາຂາ: ${branch} &nbsp;|&nbsp; ພິມ: ${printedAt}
              </span>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Gold accent bar -->
  <tr>
    <td style="background:${GOLD};height:3px;padding:0"></td>
  </tr>
</table>

<!--══════════════════════════════════════════════════════════════
    EXECUTIVE SUMMARY — KPI CARDS
══════════════════════════════════════════════════════════════-->
<table style="width:780px;margin-top:0;border:1px solid ${GRAY3};border-top:none">
  <tr>
    <!-- Revenue -->
    <td style="width:20%;background:${GREEN2};border-right:1px solid ${GRAY3};
      padding:14px 16px;vertical-align:top">
      <div style="font-size:9px;font-weight:700;color:${GREEN};text-transform:uppercase;
        letter-spacing:0.8px;margin-bottom:4px">ລາຍຮັບລວມ</div>
      <div style="font-size:18px;font-weight:800;color:${GREEN}">₭ ${fmt(financialData.totalRevenue)}</div>
      <div style="font-size:9px;color:${GREEN};margin-top:2px;opacity:0.8">Total Revenue</div>
    </td>
    <!-- Expenses -->
    <td style="width:20%;background:${RED2};border-right:1px solid ${GRAY3};
      padding:14px 16px;vertical-align:top">
      <div style="font-size:9px;font-weight:700;color:${RED};text-transform:uppercase;
        letter-spacing:0.8px;margin-bottom:4px">ລາຍຈ່າຍລວມ</div>
      <div style="font-size:18px;font-weight:800;color:${RED}">(₭ ${fmt(totalExpenses)})</div>
      <div style="font-size:9px;color:${RED};margin-top:2px;opacity:0.8">Total Expenses</div>
    </td>
    <!-- Net Profit -->
    <td style="width:20%;background:${profitBg};border-right:1px solid ${GRAY3};
      padding:14px 16px;vertical-align:top;border-left:3px solid ${profitColor}">
      <div style="font-size:9px;font-weight:700;color:${profitColor};text-transform:uppercase;
        letter-spacing:0.8px;margin-bottom:4px">${isProfit ? "ກຳໄລສຸດທິ" : "ຂາດທຶນສຸດທິ"}</div>
      <div style="font-size:18px;font-weight:800;color:${profitColor}">₭ ${fmt(Math.abs(netProfit))}</div>
      <div style="font-size:9px;color:${profitColor};margin-top:2px;opacity:0.8">
        ${isProfit ? "Net Profit" : "Net Loss"}
      </div>
    </td>
    <!-- Bookings -->
    <td style="width:13%;background:${GRAY1};border-right:1px solid ${GRAY3};
      padding:14px 16px;vertical-align:top">
      <div style="font-size:9px;font-weight:700;color:${TEXT2};text-transform:uppercase;
        letter-spacing:0.8px;margin-bottom:4px">ການຈອງ</div>
      <div style="font-size:18px;font-weight:800;color:${TEXT}">${financialData.totalBookings}</div>
      <div style="font-size:9px;color:${TEXT2};margin-top:2px">Bookings</div>
    </td>
    <!-- ADR -->
    <td style="width:13%;background:${GRAY1};border-right:1px solid ${GRAY3};
      padding:14px 16px;vertical-align:top">
      <div style="font-size:9px;font-weight:700;color:${TEXT2};text-transform:uppercase;
        letter-spacing:0.8px;margin-bottom:4px">ADR</div>
      <div style="font-size:15px;font-weight:800;color:${TEXT}">₭ ${fmt(financialData.ADR)}</div>
      <div style="font-size:9px;color:${TEXT2};margin-top:2px">Avg Daily Rate</div>
    </td>
    <!-- RevPAR -->
    <td style="width:14%;background:${GRAY1};
      padding:14px 16px;vertical-align:top">
      <div style="font-size:9px;font-weight:700;color:${TEXT2};text-transform:uppercase;
        letter-spacing:0.8px;margin-bottom:4px">RevPAR</div>
      <div style="font-size:15px;font-weight:800;color:${TEXT}">₭ ${fmt(financialData.RevPAR)}</div>
      <div style="font-size:9px;color:${TEXT2};margin-top:2px">Rev per Avail Room</div>
    </td>
  </tr>
</table>

<!--══════════════════════════════════════════════════════════════
    INCOME STATEMENT
══════════════════════════════════════════════════════════════-->
<table style="width:780px;margin-top:18px;border-collapse:collapse">

  ${sectionBar("A.  ລາຍຮັບ  (REVENUE)", 5)}

  <!-- Column headers -->
  <tr>
    ${th("ຊ່ອງທາງ / Source", "left", "28%")}
    ${th("ປະເພດ / Category", "left", "24%")}
    ${th("ສ່ວນ%", "center", "10%")}
    ${th("ໝາຍເຫດ", "left", "18%")}
    ${th("ຈຳນວນ (₭)", "right", "20%")}
  </tr>

  ${incomeRows || `<tr>
    <td colspan="5" style="padding:16px;text-align:center;color:${TEXT2};
      font-style:italic;border:1px solid ${GRAY3}">ບໍ່ມີຂໍ້ມູນລາຍຮັບໃນຊ່ວງນີ້</td>
  </tr>`}

  ${subtotalRow("ລວມລາຍຮັບທັງໝົດ  (Total Revenue)", financialData.totalRevenue, 5, true)}

  ${spacer(5, 10)}

  ${sectionBar("B.  ລາຍຈ່າຍ  (EXPENSES)", 5)}

  <tr>
    ${th("ປະເພດລາຍຈ່າຍ / Category", "left", "28%")}
    ${th("ໝວດ / Class", "left", "24%")}
    ${th("ສ່ວນ%", "center", "10%")}
    ${th("ໝາຍເຫດ", "left", "18%")}
    ${th("ຈຳນວນ (₭)", "right", "20%")}
  </tr>

  ${expenseCatRows || `<tr>
    <td colspan="5" style="padding:16px;text-align:center;color:${TEXT2};
      font-style:italic;border:1px solid ${GRAY3}">ບໍ່ມີລາຍຈ່າຍໃນຊ່ວງນີ້</td>
  </tr>`}

  ${subtotalRow("ລວມລາຍຈ່າຍທັງໝົດ  (Total Expenses)", totalExpenses, 5)}

  ${spacer(5, 6)}

  <!-- Net Profit/Loss -->
  ${netRow(netProfit)}

</table>

<!--══════════════════════════════════════════════════════════════
    BREAKDOWN TABLES — side by side
══════════════════════════════════════════════════════════════-->
<table style="width:780px;margin-top:20px;border-collapse:collapse">
  <tr style="vertical-align:top">

    <!-- Payment Methods -->
    <td style="width:50%;padding-right:8px;border:none">
      <table style="width:100%;border-collapse:collapse">
        ${sectionBar("ການຊຳລະ  (Payment Methods)", 3)}
        <tr>
          ${th("ວິທີຊຳລະ", "left", "55%")}
          ${th("ຈຳນວນ (₭)", "right", "25%")}
          ${th("ສ່ວນ%", "center", "20%")}
        </tr>
        ${[
          ["ເງິນສົດ (Cash)",           totalCash],
          ["ໂອນເງິນ (Bank Transfer)",  totalXfer],
          ["ບັດເຄຣດິດ (Credit Card)",  totalCard],
        ].map(([lbl, amt], i) => `<tr>
          ${cell(`&nbsp;&nbsp;${lbl}`, { bg: i%2===0?WHITE:GRAY1, fontSize:10.5 })}
          ${cell(`₭ ${fmt(amt as number)}`, { bg: i%2===0?WHITE:GRAY1, align:"right", bold:true })}
          ${cell(pct(amt as number, totalPaid), { bg: i%2===0?WHITE:GRAY1, align:"center", color:TEXT2 })}
        </tr>`).join("")}
        <tr>
          <td style="background:${GRAY2};font-weight:700;font-size:11px;padding:7px 10px;
            border-top:2px solid ${GRAY3};border:1px solid ${GRAY3}">ລວມ</td>
          <td style="background:${GRAY2};font-weight:700;font-size:11px;text-align:right;
            padding:7px 10px;border-top:2px solid ${GRAY3};border:1px solid ${GRAY3}">
            ₭ ${fmt(totalPaid)}
          </td>
          <td style="background:${GRAY2};font-weight:700;font-size:11px;text-align:center;
            padding:7px 10px;border-top:2px solid ${GRAY3};border:1px solid ${GRAY3}">100%</td>
        </tr>
      </table>
    </td>

    <!-- Revenue by Source -->
    <td style="width:50%;padding-left:8px;border:none">
      <table style="width:100%;border-collapse:collapse">
        ${sectionBar("ລາຍຮັບຕາມຊ່ອງທາງ  (Revenue by Channel)", 3)}
        <tr>
          ${th("ຊ່ອງທາງ", "left", "55%")}
          ${th("ລາຍຮັບ (₭)", "right", "25%")}
          ${th("ສ່ວນ%", "center", "20%")}
        </tr>
        ${Object.entries(financialData.sourceBreakdown).map(([src, amt], i) => `<tr>
          ${cell(`&nbsp;&nbsp;${sourceLao[src]||src}`, { bg: i%2===0?WHITE:GRAY1, fontSize:10.5 })}
          ${cell(`₭ ${fmt(amt)}`, { bg: i%2===0?WHITE:GRAY1, align:"right", bold:true, color:GREEN })}
          ${cell(pct(amt, financialData.totalRevenue), { bg: i%2===0?WHITE:GRAY1, align:"center", color:TEXT2 })}
        </tr>`).join("") || `<tr><td colspan="3" style="padding:12px;text-align:center;
          color:${TEXT2};font-style:italic;border:1px solid ${GRAY3}">ບໍ່ມີຂໍ້ມູນ</td></tr>`}
        <tr>
          <td style="background:${GRAY2};font-weight:700;font-size:11px;padding:7px 10px;
            border-top:2px solid ${GRAY3};border:1px solid ${GRAY3}">ລວມ</td>
          <td style="background:${GRAY2};font-weight:700;font-size:11px;text-align:right;
            padding:7px 10px;border-top:2px solid ${GRAY3};border:1px solid ${GRAY3};color:${GREEN}">
            ₭ ${fmt(financialData.totalRevenue)}
          </td>
          <td style="background:${GRAY2};font-weight:700;font-size:11px;text-align:center;
            padding:7px 10px;border-top:2px solid ${GRAY3};border:1px solid ${GRAY3}">100%</td>
        </tr>
      </table>
    </td>

  </tr>
</table>

<!--══════════════════════════════════════════════════════════════
    EXPENSE DETAIL LEDGER
══════════════════════════════════════════════════════════════-->
<table style="width:780px;margin-top:20px;border-collapse:collapse">

  ${sectionBar("C.  ລາຍຈ່າຍລະອຽດ  (Expense Ledger)", 5)}

  ${expenses.length > 0 ? `
  <tr>
    ${th("ວັນທີ", "left",   "13%")}
    ${th("ລາຍລະອຽດ / Description", "left", "33%")}
    ${th("ປະເພດ / Category", "center", "20%")}
    ${th("ສາຂາ / Branch", "left", "16%")}
    ${th("ຈຳນວນ (₭)", "right", "18%")}
  </tr>
  ${expenseDetailRows}
  <tr>
    <td colspan="4" style="background:${RED};color:${WHITE};font-weight:700;font-size:11px;
      padding:8px 10px;border:1px solid #6B1414;letter-spacing:0.3px">
      ລວມລາຍຈ່າຍທັງໝົດ &nbsp;&nbsp;Total Expenses
    </td>
    <td style="background:${RED};color:${WHITE};font-weight:700;font-size:12px;
      text-align:right;padding:8px 10px;border:1px solid #6B1414">
      ₭ ${fmt(totalExpenses)}
    </td>
  </tr>` : `
  <tr><td colspan="5" style="padding:20px;text-align:center;color:${TEXT2};
    font-style:italic;border:1px solid ${GRAY3}">ບໍ່ມີລາຍຈ່າຍໃນຊ່ວງນີ້</td></tr>`}

</table>

<!--══════════════════════════════════════════════════════════════
    SIGNATURE / APPROVAL SECTION
══════════════════════════════════════════════════════════════-->
<table style="width:780px;margin-top:24px;border-collapse:collapse">
  <tr>
    <td style="border:1px solid ${GRAY3};padding:0">
      <table style="width:100%">
        <tr>
          <td style="background:${GRAY2};padding:6px 12px;font-size:9.5px;font-weight:700;
            color:${TEXT2};letter-spacing:0.5px;border-bottom:1px solid ${GRAY3}" colspan="3">
            ລາຍເຊັນ / AUTHORIZATION
          </td>
        </tr>
        <tr>
          ${["ຜູ້ຈັດທຳ (Prepared By)", "ຜູ້ກວດສອບ (Reviewed By)", "ຜູ້ອະນຸມັດ (Approved By)"].map((role, i) => `
          <td style="width:33.33%;padding:20px 16px 12px;
            ${i < 2 ? `border-right:1px solid ${GRAY3};` : ""}vertical-align:bottom">
            <div style="border-bottom:1.5px solid ${TEXT};margin-bottom:6px;height:28px"></div>
            <div style="font-size:9.5px;color:${TEXT2};font-weight:600">${role}</div>
            <div style="font-size:9px;color:#9AAABB;margin-top:2px">ລາຍເຊັນ &nbsp;|&nbsp; ວັນທີ: ___/___/______</div>
          </td>`).join("")}
        </tr>
      </table>
    </td>
  </tr>
</table>

<!--══════════════════════════════════════════════════════════════
    FOOTER NOTE
══════════════════════════════════════════════════════════════-->
<table style="width:780px;margin-top:8px;border-collapse:collapse">
  <tr>
    <td style="padding:6px 0;font-size:9px;color:#9AAABB;border-top:1px solid ${GRAY3}">
      * ເອກະສານນີ້ສ້າງໂດຍລະບົບຄຸ້ມຄອງໂຮງແຮມ ອັດຕະໂນມັດ &nbsp;|&nbsp;
      ພິມ: ${printedAt} &nbsp;|&nbsp; ໄລຍະ: ${period} &nbsp;|&nbsp; ສາຂາ: ${branch}
    </td>
    <td style="padding:6px 0;font-size:9px;color:#9AAABB;text-align:right;
      border-top:1px solid ${GRAY3};white-space:nowrap">
      Hotel Management System &copy; ${new Date().getFullYear()}
    </td>
  </tr>
</table>

</body>
</html>`;
  }

  async function downloadExcel() {
    setLoading(true);
    try {
      const blob = new Blob(["﻿" + buildHtml()], {
        type: "application/vnd.ms-excel;charset=UTF-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={downloadExcel}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-700 rounded-md hover:bg-emerald-800 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 size={13} className="animate-spin" /> : <FileSpreadsheet size={13} />}
      Excel
    </button>
  );
}
