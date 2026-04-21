// ============================================================
// Camera-based barcode/QR scanner using html5-qrcode.
// Opens in a dialog. Calls onResult with the decoded text and
// closes itself automatically. Falls back gracefully if the
// camera is denied or unsupported.
// ============================================================
import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Keyboard } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onResult: (text: string) => void;
}

const REGION_ID = "warranty-scanner-region";

export function BarcodeScanner({ open, onOpenChange, onResult }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manual, setManual] = useState("");

  useEffect(() => {
    if (!open) return;
    setError(null);
    setManual("");
    let cancelled = false;

    const start = async () => {
      try {
        // Wait one tick so the region div is mounted.
        await new Promise((r) => setTimeout(r, 50));
        if (cancelled) return;
        const instance = new Html5Qrcode(REGION_ID, { verbose: false });
        scannerRef.current = instance;
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 160 } },
          (decoded) => {
            // Stop on first hit, then bubble up.
            instance.stop().catch(() => {}).finally(() => {
              onResult(decoded.trim());
              onOpenChange(false);
            });
          },
          () => { /* ignore per-frame decode failures */ },
        );
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Couldn't access camera. Check permissions or enter the serial manually.");
      }
    };

    start();

    return () => {
      cancelled = true;
      const s = scannerRef.current;
      scannerRef.current = null;
      if (!s) return;
      const safeClear = () => { try { s.clear(); } catch { /* ignore */ } };
      if (s.isScanning) {
        Promise.resolve(s.stop()).catch(() => {}).finally(safeClear);
      } else {
        safeClear();
      }
    };
  }, [open, onOpenChange, onResult]);

  const submitManual = () => {
    const v = manual.trim();
    if (!v) return;
    onResult(v);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-5 w-5" /> Scan barcode or QR
          </DialogTitle>
          <DialogDescription>
            Point the camera at the serial number sticker on the product.
          </DialogDescription>
        </DialogHeader>

        <div
          id={REGION_ID}
          className="w-full overflow-hidden rounded-lg bg-muted aspect-[4/3] flex items-center justify-center"
        >
          {error && (
            <p className="px-4 text-sm text-muted-foreground text-center">{error}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground inline-flex items-center gap-1.5">
            <Keyboard className="h-3.5 w-3.5" /> Or type the serial manually
          </label>
          <div className="flex gap-2">
            <Input
              value={manual}
              onChange={(e) => setManual(e.target.value)}
              placeholder="e.g. SN-123456"
              onKeyDown={(e) => e.key === "Enter" && submitManual()}
            />
            <Button onClick={submitManual} disabled={!manual.trim()}>Use</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
