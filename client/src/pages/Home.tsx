import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CalculatorView } from "@/components/CalculatorView";
import { calculators } from "@/lib/calculators";

export default function Home() {
  const [selectedCalculatorId, setSelectedCalculatorId] = useState("qsofa");
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>(() => {
    const stored = localStorage.getItem("medresearch_recent");
    return stored ? JSON.parse(stored) : [];
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem("medresearch_favorites");
    return stored ? JSON.parse(stored) : [];
  });

  // Update recently used when calculator is selected
  useEffect(() => {
    setRecentlyUsed((prev) => {
      const updated = [selectedCalculatorId, ...prev.filter((id) => id !== selectedCalculatorId)].slice(0, 5);
      localStorage.setItem("medresearch_recent", JSON.stringify(updated));
      return updated;
    });
  }, [selectedCalculatorId]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id];
      localStorage.setItem("medresearch_favorites", JSON.stringify(updated));
      return updated;
    });
  };

  const selectedCalculator = calculators.find((c) => c.id === selectedCalculatorId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        selectedCalculatorId={selectedCalculatorId}
        onSelectCalculator={setSelectedCalculatorId}
        recentlyUsed={recentlyUsed}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  MedResearch Academy
                </p>
                <h1 className="text-3xl font-bold text-slate-900 mt-1">Clinical Decision Support</h1>
                <p className="text-sm text-slate-600 mt-1">Evidence-based calculators for on-call physicians</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-8 py-8 max-w-4xl">
            {selectedCalculator ? (
              <CalculatorView calculator={selectedCalculator} />
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-600">Select a calculator from the sidebar to begin</p>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="px-8 py-4 text-center text-xs text-slate-600">
            <p>
              <strong>Disclaimer:</strong> This calculator is for educational purposes only. Clinical judgment and
              patient assessment are essential. Always consult current clinical guidelines and institutional protocols.
            </p>
            <p className="mt-2">© 2026 MedResearch Academy. Evidence-based clinical decision support.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
