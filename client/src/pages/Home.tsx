import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { CalculatorFormEnhanced } from "@/components/CalculatorFormEnhanced";
import { ResultsDisplayEnhanced } from "@/components/ResultsDisplayEnhanced";
import { MedicationDosing } from "@/components/MedicationDosing";
import { SearchBar } from "@/components/SearchBar";
import { calculators, medications } from "@/lib/calculators";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { executeCalculator } from "@/lib/calculator-wrapper";
import { CalculationResult } from "@/lib/calculator-engine";
import { FeedbackModal } from "@/components/FeedbackModal";
import { Menu, X, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Professional Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">MedResearch Academy</h1>
                <p className="text-xs text-slate-500">Clinical Decision Support</p>
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-md mx-8">
              <SearchBar
                calculators={calculators}
                medications={medications}
                onSelectCalculator={setSelectedCalculatorId}
                onSelectMedication={() => setActiveTab("medications")}
              />
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Search Bar - Mobile */}
          <div className="md:hidden pb-4">
            <SearchBar
              calculators={calculators}
              medications={medications}
              onSelectCalculator={setSelectedCalculatorId}
              onSelectMedication={() => setActiveTab("medications")}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? "w-full md:w-80" : "hidden md:w-80"
          } bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 md:block`}
        >
          <Sidebar
            selectedCalculatorId={selectedCalculatorId}
            onSelectCalculator={setSelectedCalculatorId}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            recentlyUsed={recentlyUsed}
          />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-white">
                <TabsTrigger value="calculators" className="text-base">
                  Clinical Calculators
                </TabsTrigger>
                <TabsTrigger value="medications" className="text-base">
                  Medication Dosing
                </TabsTrigger>
              </TabsList>

              {/* Clinical Calculators Tab */}
              <TabsContent value="calculators" className="space-y-8">
                {selectedCalculator && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form - Left Column */}
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                        <CalculatorFormEnhanced
                          calculatorName={selectedCalculator.name}
                          calculatorDescription={selectedCalculator.description}
                          inputs={selectedCalculator.inputs}
                          onSubmit={handleCalculate}
                          isLoading={isLoading}
                        />
                      </div>
                    </div>

                    {/* Results - Right Column */}
                    <div className="lg:col-span-1">
                      {calculationResult ? (
                        <div className="sticky top-20 space-y-4">
                          <div className="bg-white rounded-xl shadow-lg p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                            <ResultsDisplayEnhanced
                              result={calculationResult}
                              calculatorName={selectedCalculator.name}
                              onPrint={handlePrint}
                              onShare={handleShare}
                            />
                          </div>
                          <Button
                            onClick={() => setShowFeedback(true)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
                          >
                            Provide Feedback
                          </Button>
                        </div>
                      ) : (
                        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                          <div className="text-slate-400 mb-3">
                            <Stethoscope className="w-12 h-12 mx-auto opacity-50" />
                          </div>
                          <p className="text-slate-600 font-medium">Enter patient information</p>
                          <p className="text-sm text-slate-500 mt-1">Results will appear here</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Medication Dosing Tab */}
              <TabsContent value="medications">
                <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
                  <MedicationDosing />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {/* Feedback Modal */}
      {showFeedback && calculationResult && selectedCalculator && (
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
    </div>
  );
}
