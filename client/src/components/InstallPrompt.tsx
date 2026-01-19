import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Check device type
    const userAgent = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(userAgent);
    const Android = /Android/.test(userAgent);
    
    setIsIOS(iOS);
    setIsAndroid(Android);

    // Check if user dismissed the prompt recently
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedTime = parseInt(dismissed, 10);
      // Don't show for 7 days after dismissal
      if (Date.now() - dismissedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // Listen for the beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt immediately
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Show prompt for iOS or Android (even without beforeinstallprompt event)
    if ((iOS || Android) && !standalone) {
      // Show after a short delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // Fallback for Android without beforeinstallprompt event
      if (isAndroid) {
        alert("To install this app:\n\n1. Tap the menu (⋮) in your browser\n2. Select 'Install app' or 'Add to Home Screen'\n3. Confirm the installation");
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.error("Install prompt error:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg animate-in slide-in-from-bottom duration-300"
      role="alert"
      aria-label="Install app prompt"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg" aria-hidden="true">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-sm md:text-base">Install MedResearch Academy</p>
            {isIOS ? (
              <p className="text-xs md:text-sm text-blue-100">
                Tap{" "}
                <span className="inline-flex items-center px-1 bg-white/20 rounded">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M12 2L12 14M12 2L8 6M12 2L16 6M4 14V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V14"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  </svg>
                </span>{" "}
                then "Add to Home Screen"
              </p>
            ) : (
              <p className="text-xs md:text-sm text-blue-100">
                Access 20 clinical calculators offline, anytime
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Show install button for Android (with or without beforeinstallprompt) and iOS */}
          {(isAndroid || isIOS) && (
            <Button
              onClick={handleInstall}
              size="sm"
              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              aria-label={isIOS ? "Manual installation instructions" : "Install app"}
            >
              <Download className="w-4 h-4 mr-1" aria-hidden="true" />
              {isIOS ? "How to Install" : "Install"}
            </Button>
          )}
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            aria-label="Dismiss install prompt"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
