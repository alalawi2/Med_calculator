import { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt?: () => Promise<void>;
  userChoice?: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function EnhancedInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBottomBanner, setShowBottomBanner] = useState(true);
  const [showFloatingBanner, setShowFloatingBanner] = useState(false);
  const [showResultPrompt, setShowResultPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBottomBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show floating banner after user opens a calculator (after 30 seconds)
    const floatingTimer = setTimeout(() => {
      setShowFloatingBanner(true);
    }, 30000);

    // Listen for result install prompt event
    const handleShowResultPrompt = () => {
      setShowResultPrompt(true);
    };

    window.addEventListener('show-result-install-prompt', handleShowResultPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowBottomBanner(false);
      setShowFloatingBanner(false);
      setShowResultPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('show-result-install-prompt', handleShowResultPrompt);
      clearTimeout(floatingTimer);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt?.();
      const { outcome } = await deferredPrompt.userChoice || { outcome: 'dismissed' };
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowBottomBanner(false);
        setShowFloatingBanner(false);
        setShowResultPrompt(false);
      }
    }
  };

  const handleDismiss = (banner: 'bottom' | 'floating' | 'result') => {
    if (banner === 'bottom') setShowBottomBanner(false);
    if (banner === 'floating') setShowFloatingBanner(false);
    if (banner === 'result') setShowResultPrompt(false);
  };

  // Bottom Banner - Always visible on mobile
  if (showBottomBanner && (isAndroid || isIOS)) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-lg z-40 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Download className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-sm">Install MedResearch Academy</div>
              <div className="text-xs opacity-90">Access 32+ calculators offline, anytime</div>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handleInstall}
              className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors"
            >
              Install
            </button>
            <button
              onClick={() => handleDismiss('bottom')}
              className="text-white hover:bg-blue-800 p-2 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Floating Banner - Shows after user interaction
  if (showFloatingBanner && (isAndroid || isIOS)) {
    return (
      <div className="fixed bottom-24 right-4 bg-white rounded-xl shadow-xl p-4 max-w-xs z-40 md:hidden border-l-4 border-blue-600">
        <div className="flex items-start gap-3">
          <Smartphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="font-semibold text-gray-900 text-sm mb-2">Get App-Like Experience</div>
            <ul className="text-xs text-gray-600 space-y-1 mb-3">
              <li>✓ Works offline</li>
              <li>✓ Instant access</li>
              <li>✓ No app store needed</li>
            </ul>
            <button
              onClick={handleInstall}
              className="w-full bg-blue-600 text-white px-3 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors mb-2"
            >
              Install Now
            </button>
            <button
              onClick={() => handleDismiss('floating')}
              className="w-full text-gray-600 text-xs hover:text-gray-900 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result Prompt - Shows after calculation
  if (showResultPrompt && (isAndroid || isIOS)) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 md:hidden p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm">
          <div className="flex items-center justify-between mb-4">
            <Smartphone className="w-8 h-8 text-blue-600" />
            <button
              onClick={() => handleDismiss('result')}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Save Your Results</h3>
          <p className="text-gray-600 text-sm mb-4">
            Install the app to save calculations offline and access them anytime, even without internet.
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-blue-600">✓</span> Offline access
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-blue-600">✓</span> Fast, app-like experience
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="text-blue-600">✓</span> No app store needed
            </div>
          </div>
          <button
            onClick={handleInstall}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-2"
          >
            Install App
          </button>
          <button
            onClick={() => handleDismiss('result')}
            className="w-full text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
          >
            Not now
          </button>
        </div>
      </div>
    );
  }

  return null;
}

// Export function to show result prompt from other components
export function triggerResultInstallPrompt() {
  const event = new CustomEvent('show-result-install-prompt');
  window.dispatchEvent(event);
}
