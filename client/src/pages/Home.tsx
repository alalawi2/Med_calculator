import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CalculatorFormEnhanced } from "@/components/CalculatorFormEnhanced";
import { ResultsDisplayEnhanced } from "@/components/ResultsDisplayEnhanced";
import { MedicationDosing } from "@/components/MedicationDosing";
import { SearchBar } from "@/components/SearchBar";
import { LayoutEnhanced } from "@/components/LayoutEnhanced";
import { calculators, medications } from "@/lib/calculators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { executeCalculator } from "@/lib/calculator-wrapper";
import { CalculationResult } from "@/lib/calculator-engine";
import { FeedbackModal } from "@/components/FeedbackModal";

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
  const [activeTab, setActiveTab] = useState("calculators");
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCalculate = (inputs: Record<string, any>) => {
    if (!selectedCalculator) return;
    
    setIsLoading(true);
    // Simulate calculation delay for better UX
    setTimeout(() => {
      const result = executeCalculator(selectedCalculator, inputs);
      setCalculationResult(result);
      setIsLoading(false);
      setShowFeedback(false);
    }, 500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${selectedCalculator?.name} Result`,
        text: `Risk Score: ${calculationResult?.score}`,
      });
    }
  };

  const sidebarContent = (
    <Sidebar
      calculators={calculators}
      selectedCalculatorId={selectedCalculatorId}
      onSelectCalculator={setSelectedCalculatorId}
      favorites={favorites}
      onToggleFavorite={toggleFavorite}
      recentlyUsed={recentlyUsed}
    />
  );

  return (
    <LayoutEnhanced sidebar={sidebarContent}>
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="calculators">Clinical Calculators</TabsTrigger>
          <TabsTrigger value="medications">Medication Dosing</TabsTrigger>
        </TabsList>

        {/* Clinical Calculators Tab */}
        <TabsContent value="calculators" className="space-y-8">
          {selectedCalculator && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <CalculatorFormEnhanced
                  calculatorName={selectedCalculator.name}
                  calculatorDescription={selectedCalculator.description}
                  inputs={selectedCalculator.inputs}
                  onSubmit={handleCalculate}
                  isLoading={isLoading}
                />
              </div>

              {/* Results */}
              <div className="lg:col-span-1">
                {calculationResult ? (
                  <div className="sticky top-20">
                    <ResultsDisplayEnhanced
                      result={calculationResult}
                      calculatorName={selectedCalculator.name}
                      onPrint={handlePrint}
                      onShare={handleShare}
                    />
                    <button
                      onClick={() => setShowFeedback(true)}
                      className="w-full mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-sm font-medium transition-colors"
                    >
                      Provide Feedback
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-white rounded-lg border border-slate-200 text-center">
                    <p className="text-slate-600">Enter patient information to see results</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Medication Dosing Tab */}
        <TabsContent value="medications">
          <MedicationDosing />
        </TabsContent>
      </Tabs>

      {/* Feedback Modal */}
      {calculationResult && selectedCalculator && (
        <FeedbackModal
          open={showFeedback}
          onOpenChange={setShowFeedback}
          calculatorName={selectedCalculator.name}
          onSubmit={(data) => {
            console.log("Feedback submitted:", data);
            setShowFeedback(false);
          }}
        />
      )}
    </LayoutEnhanced>
  );
}
