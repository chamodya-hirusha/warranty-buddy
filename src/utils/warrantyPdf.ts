// ============================================================
// Generate a thermal-receipt-style warranty card (80mm wide).
// Uses jsPDF + qrcode. Exposes:
//   - buildWarrantyPdf(...)  -> jsPDF doc
//   - printWarrantyCard(...) -> opens browser print dialog
//   - downloadWarrantyCard(...) -> saves .pdf
//   - shareWarrantyCard(...) -> Web Share with PDF file (fallback to download)
// ============================================================
import jsPDF from "jspdf";
import QRCode from "qrcode";
import type { WarrantyView } from "@/db/types";
import type { ShopInfo } from "@/hooks/useShop";
import { formatDate } from "./warranty";

const MM_WIDTH = 80;       // 80mm thermal roll
const MARGIN_X = 4;
const LINE_H = 4.5;

async function buildWarrantyPdf(w: WarrantyView, shop: ShopInfo): Promise<jsPDF> {
  // Estimated page height — jsPDF requires it up front. ~150mm covers content.
  const doc = new jsPDF({ unit: "mm", format: [MM_WIDTH, 160] });
  let y = 6;

  const writeCenter = (text: string, size: number, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.text(text, MM_WIDTH / 2, y, { align: "center" });
    y += size * 0.42 + 1;
  };

  const writeRow = (label: string, value: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(label, MARGIN_X, y);
    doc.setFont("helvetica", "bold");
    const wrapped = doc.splitTextToSize(value, MM_WIDTH - MARGIN_X * 2 - 22);
    doc.text(wrapped, MM_WIDTH - MARGIN_X, y, { align: "right" });
    y += LINE_H * Math.max(1, wrapped.length);
  };

  const hr = () => {
    doc.setDrawColor(160);
    doc.setLineDashPattern([0.6, 0.6], 0);
    doc.line(MARGIN_X, y, MM_WIDTH - MARGIN_X, y);
    doc.setLineDashPattern([], 0);
    y += 3;
  };

  // Header
  writeCenter(shop.name || "WarrantyOps", 12, true);
  if (shop.phone) writeCenter(shop.phone, 8);
  if (shop.address) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(shop.address, MM_WIDTH - MARGIN_X * 2);
    lines.forEach((l: string) => { doc.text(l, MM_WIDTH / 2, y, { align: "center" }); y += 3.5; });
  }
  y += 1;
  writeCenter("WARRANTY CARD", 10, true);
  hr();

  // Customer
  writeRow("Customer", w.customer?.name ?? "—");
  writeRow("Phone", w.customer?.phone ?? "—");
  hr();

  // Product
  writeRow("Product", w.product?.name ?? "—");
  writeRow("Brand", w.product?.brand ?? "—");
  writeRow("Serial", w.product?.serial ?? "—");
  hr();

  // Warranty
  writeRow("Purchased", formatDate(w.purchaseDate));
  writeRow("Period", `${w.months} months`);
  writeRow("Expires", formatDate(w.expiryDate));
  const statusText =
    w.status === "active" ? `ACTIVE · ${w.daysLeft}d left` :
    w.status === "soon" ? `EXPIRES IN ${Math.max(w.daysLeft, 0)}d` :
    `EXPIRED ${Math.abs(w.daysLeft)}d ago`;
  writeRow("Status", statusText);
  if (w.notes) {
    hr();
    doc.setFont("helvetica", "normal"); doc.setFontSize(8);
    doc.text("Notes:", MARGIN_X, y); y += 3.5;
    const wrapped = doc.splitTextToSize(w.notes, MM_WIDTH - MARGIN_X * 2);
    doc.setFont("helvetica", "italic");
    doc.text(wrapped, MARGIN_X, y);
    y += wrapped.length * 3.5;
  }
  hr();

  // QR of serial (or warranty id if no serial)
  const qrPayload = w.product?.serial || w.id;
  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 0, width: 200 });
  const qrSize = 28;
  doc.addImage(qrDataUrl, "PNG", (MM_WIDTH - qrSize) / 2, y, qrSize, qrSize);
  y += qrSize + 2;
  writeCenter(qrPayload, 7);

  y += 2;
  writeCenter("Keep this receipt for warranty claims.", 7);
  writeCenter(`Issued ${formatDate(new Date())}`, 7);

  return doc;
}

function fileName(w: WarrantyView) {
  const safe = (w.product?.serial || w.id).replace(/[^a-z0-9_-]+/gi, "_");
  return `warranty-${safe}.pdf`;
}

export async function downloadWarrantyCard(w: WarrantyView, shop: ShopInfo) {
  const doc = await buildWarrantyPdf(w, shop);
  doc.save(fileName(w));
}

export async function printWarrantyCard(w: WarrantyView, shop: ShopInfo) {
  const doc = await buildWarrantyPdf(w, shop);
  // Open the generated PDF in a new tab and trigger print.
  const blobUrl = doc.output("bloburl");
  const win = window.open(blobUrl, "_blank");
  if (win) {
    win.addEventListener("load", () => {
      try { win.focus(); win.print(); } catch { /* ignore */ }
    });
  }
}

export async function shareWarrantyCard(w: WarrantyView, shop: ShopInfo) {
  const doc = await buildWarrantyPdf(w, shop);
  const blob = doc.output("blob");
  const file = new File([blob], fileName(w), { type: "application/pdf" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  if (nav.canShare && nav.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Warranty card",
      text: `Warranty for ${w.product?.name ?? "product"}`,
    });
  } else {
    await downloadWarrantyCard(w, shop);
  }
}
