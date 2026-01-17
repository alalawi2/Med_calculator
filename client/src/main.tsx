import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker for PWA offline support
if ('serviceWorker' in navigator) {
  // Register immediately on load
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully');
        console.log('Scope:', registration.scope);
        
        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
} else {
  console.warn('⚠️ Service Workers not supported in this browser');
}

createRoot(document.getElementById("root")!).render(<App />);
