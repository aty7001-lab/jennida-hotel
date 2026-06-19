"use client";

export default function PrintControls() {
  return (
    <div className="print-controls">
      <button className="btn-print" onClick={() => window.print()}>
        🖨 ພິມ / Print
      </button>
      <button className="btn-close" onClick={() => window.close()}>
        ✕ ປິດ
      </button>
    </div>
  );
}
