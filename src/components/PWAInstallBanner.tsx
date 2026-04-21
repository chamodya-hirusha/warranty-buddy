import React, { useState, useEffect } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { X, Download, Share } from "lucide-react";
import { cn } from "@/lib/utils";

export function PWAInstallBanner() {
  const { isInstallable, isInstalled, isIOS, installApp } = useInstallPrompt();
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("pwa-install-dismissed");
    if (isDismissed) {
      setDismissed(true);
    }

    // Delay showing the banner for a better UX
    const timer = setTimeout(() => {
      if (!isInstalled && !isDismissed && (isInstallable || isIOS)) {
        setIsVisible(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isIOS]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  const handleInstall = async () => {
    await installApp();
    setIsVisible(false);
  };

  if (!isVisible || dismissed || isInstalled) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-card border border-primary/20 shadow-2xl rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group">
        {/* Progress bar-like accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-primary/10">
          <div className="h-full bg-primary animate-progress-linear w-0" />
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Download className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Install WarrantyOps</h3>
            <p className="text-xs text-muted-foreground">
              Install the app for a full-screen experience and offline access.
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="bg-accent/50 rounded-lg p-2.5 flex items-start gap-2.5 text-[11px] leading-relaxed">
            <Share className="h-3.5 w-3.5 text-primary mt-0.5" />
            <span>
              To install: tap <span className="font-bold">Share</span> then{" "}
              <span className="font-bold text-primary">"Add to Home Screen"</span>
            </span>
          </div>
        ) : (
          <Button onClick={handleInstall} className="w-full h-9 text-xs gap-2 shadow-lg shadow-primary/20">
            <Download className="h-3.5 w-3.5" />
            Install App
          </Button>
        )}
      </div>
    </div>
  );
}
