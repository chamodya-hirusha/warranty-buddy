import React, { useEffect } from "react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function InstallButton() {
  const { isInstallable, isInstalled, isIOS, installApp } = useInstallPrompt();

  useEffect(() => {
    if (isIOS) {
      console.log("Use Safari Share → Add to Home Screen to install");
    }
  }, [isIOS]);

  // Only show the button if the app is installable and not already installed
  if (!isInstallable || isInstalled || isIOS) {
    return null;
  }

  return (
    <Button
      onClick={installApp}
      variant="outline"
      size="sm"
      className="gap-2 text-xs h-8"
    >
      <Download className="h-3.5 w-3.5" />
      Install App
    </Button>
  );
}
