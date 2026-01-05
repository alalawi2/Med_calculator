import { Calculator, ArrowRight, CheckCircle, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Calculator as CalculatorType } from "@/lib/calculators-extended";

interface WelcomeScreenProps {
  calculators: CalculatorType[];
  onSelectCalculator: (id: string) => void;
}

export default function WelcomeScreen({ calculators, onSelectCalculator }: WelcomeScreenProps) {
  // Get featured calculators (most commonly used)
  const featuredCalculators = [
    calculators.find((c) => c.id === "qsofa"),
    calculators.find((c) => c.id === "heart"),
    calculators.find((c) => c.id === "sofa"),
    calculators.find((c) => c.id === "apache2"),
  ].filter(Boolean) as CalculatorType[];

  // Get category overview
  const categoryMap = new Map<string, number>();
  calculators.forEach((calc) => {
    if (Array.isArray(calc.categories)) {
      calc.categories.forEach((cat) => {
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
      });
    }
  });

  const categories = Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-500 rounded-lg p-2">
              <Calculator className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">MedResearch Academy</h1>
          </div>
          <p className="text-blue-100 text-lg md:text-xl mb-2">Clinical Decision Support</p>
          <p className="text-blue-50 text-base md:text-lg max-w-2xl">
            Access 32+ evidence-based clinical calculators for rapid risk assessment, severity scoring, and clinical decision-making at the point of care.
          </p>
        </div>
      </div>

      {/* Getting Started Guide */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Getting Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <CardTitle className="text-lg">Browse Calculators</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Use the sidebar to browse calculators by specialty or search by name. Each calculator is tagged with relevant medical categories.
                </p>
              </CardContent>
            </Card>

            {/* Step 2 */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <CardTitle className="text-lg">Enter Patient Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Fill in the clinical parameters for your patient. All inputs are validated in real-time with helpful descriptions and ranges.
                </p>
              </CardContent>
            </Card>

            {/* Step 3 */}
            <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    3
                  </div>
                  <CardTitle className="text-lg">Get Results</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Receive instant risk stratification with clinical recommendations and evidence-based references to support your decision-making.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Featured Calculators */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Featured Calculators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCalculators.map((calc) => (
              <Card key={calc.id} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectCalculator(calc.id)}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="text-lg">{calc.name}</span>
                    <ArrowRight className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                  </CardTitle>
                  <CardDescription>{calc.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Clinical Uses</p>
                      <div className="flex flex-wrap gap-2">
                        {calc.clinicalUses.slice(0, 2).map((use, idx) => (
                          <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                            <CheckCircle className="w-3 h-3" />
                            {use}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCalculator(calc.id);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Use Calculator
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Overview */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Browse by Specialty</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.name} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <p className="font-semibold text-gray-900 mb-1">{cat.name}</p>
                  <p className="text-sm text-gray-600">{cat.count} calculators</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Key Features */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <Zap className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Instant Calculations</h3>
                <p className="text-sm text-gray-700">Real-time scoring with immediate risk stratification</p>
              </div>
            </div>
            <div className="flex gap-4">
              <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Evidence-Based</h3>
                <p className="text-sm text-gray-700">All calculators backed by peer-reviewed research</p>
              </div>
            </div>
            <div className="flex gap-4">
              <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Clinical References</h3>
                <p className="text-sm text-gray-700">Access original studies and clinical guidelines</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Calculator className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">32+ Calculators</h3>
                <p className="text-sm text-gray-700">Comprehensive coverage across all medical specialties</p>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-yellow-900">
            <strong>Disclaimer:</strong> These calculators are clinical decision support tools only and should NOT replace professional medical judgment, clinical expertise, or consultation with qualified healthcare providers. Always verify results with current clinical guidelines and patient-specific factors.
          </p>
        </div>
      </div>
    </div>
  );
}
