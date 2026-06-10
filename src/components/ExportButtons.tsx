"use client";

import { useState } from "react";
import { Download, FileImage, Printer, Loader2 } from "lucide-react";

interface ExportButtonsProps {
  targetId: string;   // id of the element to capture
  fileName?: string;  // base name without extension
}

export default function ExportButtons({ targetId, fileName = "report" }: ExportButtonsProps) {
  const [loading, setLoading] = useState<"image" | "pdf" | null>(null);

  async function captureElement() {
    const el = document.getElementById(targetId);
    if (!el) throw new Error("Element not found: " + targetId);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    return canvas;
  }

  async function downloadImage() {
    setLoading("image");
    try {
      const canvas = await captureElement();
      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  async function downloadPDF() {
    setLoading("pdf");
    try {
      const canvas = await captureElement();
      const { jsPDF } = await import("jspdf");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfW = 210; // A4 width mm
      const pdfH = Math.round((imgHeight / imgWidth) * pdfW);
      const orientation = pdfH > 295 ? "p" : "l";
      const pageW = orientation === "p" ? 210 : 297;
      const pageH = orientation === "p" ? 297 : 210;
      const scale = pageW / imgWidth;
      const finalH = imgHeight * scale;
      const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });

      if (finalH <= pageH) {
        pdf.addImage(imgData, "PNG", 0, 0, pageW, finalH);
      } else {
        // Multi-page: slice canvas
        let y = 0;
        const sliceH = Math.floor(pageH / scale);
        while (y < imgHeight) {
          const sliceCanvas = document.createElement("canvas");
          sliceCanvas.width = imgWidth;
          sliceCanvas.height = Math.min(sliceH, imgHeight - y);
          const ctx = sliceCanvas.getContext("2d")!;
          ctx.drawImage(canvas, 0, -y);
          const sliceData = sliceCanvas.toDataURL("image/png");
          const sliceHeightMm = sliceCanvas.height * scale;
          if (y > 0) pdf.addPage();
          pdf.addImage(sliceData, "PNG", 0, 0, pageW, sliceHeightMm);
          y += sliceH;
        }
      }
      pdf.save(`${fileName}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  }

  function printPage() {
    window.print();
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={downloadImage}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        {loading === "image" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <FileImage size={13} />
        )}
        ດາວໂຫຼດ PNG
      </button>

      <button
        onClick={downloadPDF}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700 transition-colors disabled:opacity-50"
      >
        {loading === "pdf" ? (
          <Loader2 size={13} className="animate-spin" />
        ) : (
          <Download size={13} />
        )}
        ດາວໂຫຼດ PDF
      </button>

      <button
        onClick={printPage}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-md bg-white hover:bg-slate-50 transition-colors"
      >
        <Printer size={13} />
        ພິມ
      </button>
    </div>
  );
}
