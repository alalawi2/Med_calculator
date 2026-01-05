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
import { Menu, X, Stethoscope, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    setIsLoading(true);
    try {
      if (selectedCalculator) {
        const result = executeCalculator(selectedCalculator, inputs);
        setCalculationResult(result);
      }
    } catch (error) {
      console.error("Calculation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCalculator = (id: string) => {
    setSelectedCalculatorId(id);
    if (isMobile) {
      setSidebarOpen(false);
    }
    setCalculationResult(null);
  };

  const handleSelectMedication = (medicationId: string) => {
    // Handle medication selection if needed
  };

  return (
    <div className="flex flex-col h-screen bg-white md:flex-row">
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 md:hidden">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <img src="/medresearch-academy-logo.jpg" alt="MedResearch Academy" className="h-10 w-10 object-contain" />
            <div>
              <span className="text-xs font-bold text-blue-700 block">MedResearch Academy</span>
              <span className="text-xs text-gray-500">Clinical Support</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 w-full bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 items-center justify-between px-8 py-3">
        <div className="flex items-center gap-3">
          <img src="/medresearch-academy-logo.jpg" alt="MedResearch Academy" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-blue-700">MedResearch Academy</h1>
            <p className="text-xs text-gray-500">Clinical Decision Support</p>
          </div>
        </div>
        <SearchBar
          calculators={calculators}
          medications={medications}
          onSelectCalculator={handleSelectCalculator}
        />
      </header>

      {/* Sidebar */}
      {(sidebarOpen || !isMobile) && (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto pt-14 md:pt-0 md:sticky md:top-16 md:h-[calc(100vh-64px)]">
        <Sidebar
          selectedCalculatorId={selectedCalculatorId}
          onSelectCalculator={handleSelectCalculator}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          recentlyUsed={recentlyUsed}
        />
        </aside>
      )}
      
      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto md:mt-16 mt-0 w-full">
        {/* Mobile Search */}
        <div className="md:hidden px-4 py-3 border-b border-gray-200">
          <SearchBar
            calculators={calculators}
            medications={medications}
            onSelectCalculator={handleSelectCalculator}
          />
        </div>

        {/* Disclaimer Alert */}
        <div className="bg-blue-50 border-b border-blue-200 p-3 md:p-4">
          <Alert className="border-0 bg-transparent">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-xs md:text-sm text-blue-800 ml-2">
              <strong>Disclaimer:</strong> These calculators are clinical decision support tools only and should NOT replace professional medical judgment, clinical expertise, or consultation with qualified healthcare providers. Always verify results with current clinical guidelines and patient-specific factors. Brought by MedResearch Academy.
            </AlertDescription>
          </Alert>
        </div>

        {/* Tabs */}
        <div className="p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="calculators">Clinical Calculators</TabsTrigger>
              <TabsTrigger value="medications">Medication Dosing</TabsTrigger>
            </TabsList>

            {/* Calculators Tab */}
            <TabsContent value="calculators" className="space-y-6">
              {selectedCalculator && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{selectedCalculator.name}</h2>
                    <p className="text-sm md:text-base text-gray-600">{selectedCalculator.description}</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Form */}
                    <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 p-3 md:p-6 shadow-sm">
                      <CalculatorFormEnhanced
                        calculatorName={selectedCalculator.name}
                        calculatorDescription={selectedCalculator.description}
                        inputs={selectedCalculator.inputs}
                        onSubmit={handleCalculate}
                        isLoading={isLoading}
                      />
                    </div>

                    {/* Results */}
                    {calculationResult && (
                      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-3 md:p-6 shadow-sm lg:sticky lg:top-24">
                        <ResultsDisplayEnhanced
                          result={calculationResult}
                          calculatorName={selectedCalculator.name}
                        />
                        <Button
                          onClick={() => setShowFeedback(true)}
                          variant="outline"
                          className="w-full mt-4"
                        >
                          Provide Feedback
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Medications Tab */}
            <TabsContent value="medications">
              <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-6 shadow-sm">
                <MedicationDosing />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Feedback Modal */}
      {showFeedback && selectedCalculator && (
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
