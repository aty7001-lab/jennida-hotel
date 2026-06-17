"use client";

import { useState } from "react";
import { Download, FileImage, Printer, Loader2 } from "lucide-react";

interface ExportButtonsProps {
  targetId: string;
  fileName?: string;
}

export default function ExportButtons({ targetId, fileName = "report" }: ExportButtonsProps) {
  const [loading, setLoading] = useState<"image" | "pdf" | null>(null);
  const [error, setError] = useState("");

  function triggerDownload(url: string, name: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  async function getCanvas() {
    const el = document.getElementById(targetId);
    if (!el) throw new Error("ບໍ່ພົບ element: " + targetId);
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      onclone: (_doc, cloned) => {
        // html2canvas v1 doesn't support oklch/lab (Tailwind v4).
        // Force all computed colors to rgb() before capture.
        cloned.querySelectorAll("*").forEach((node) => {
          const el = node as HTMLElement;
          const cs = window.getComputedStyle(el);
          el.style.color = cs.color;
          el.style.backgroundColor = cs.backgroundColor;
          el.style.borderColor = cs.borderColor;
        });
      },
    });
  }

  async function downloadImage() {
    setLoading("image");
    setError("");
    try {
      const canvas = await getCanvas();
      triggerDownload(canvas.toDataURL("image/png"), `${fileName}.png`);
    } catch (e: any) {
      setError(e?.message || "ດາວໂຫຼດລົ້ມ");
    } finally {
      setLoading(null);
    }
  }

  async function downloadPDF() {
    setLoading("pdf");
    setError("");
    try {
      const canvas = await getCanvas();
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = await import("jspdf");

      const pageW = 210; // A4 mm
      const ratio = canvas.height / canvas.width;
      const pageH = Math.min(pageW * ratio, 297);
      const orientation = ratio > 297 / 210 ? "p" : "l";
      const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
      const pW = orientation === "p" ? 210 : 297;
      const pH = orientation === "p" ? 297 : 210;
      const imgH = pW * ratio;

      if (imgH <= pH) {
        pdf.addImage(imgData, "PNG", 0, 0, pW, imgH);
      } else {
        // Multi-page
        const pxPerPage = Math.floor((canvas.width * pH) / pW);
        let srcY = 0;
        while (srcY < canvas.height) {
          const sliceH = Math.min(pxPerPage, canvas.height - srcY);
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceH;
          sliceCanvas.getContext("2d")!.drawImage(canvas, 0, -srcY);
          pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, pW, sliceH * (pW / canvas.width));
          srcY += pxPerPage;
          if (srcY < canvas.height) pdf.addPage();
        }
      }
      pdf.save(`${fileName}.pdf`);
    } catch (e: any) {
      setError(e?.message || "PDF ລົ້ມ");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={downloadImage}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          {loading === "image" ? <Loader2 size={13} className="animate-spin" /> : <FileImage size={13} />}
          PNG
        </button>

        <button
          onClick={downloadPDF}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50"
        >
          {loading === "pdf" ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
          PDF
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors"
        >
          <Printer size={13} />
          ພິມ
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
