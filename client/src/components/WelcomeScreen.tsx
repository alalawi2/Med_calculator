import { Calculator, ArrowRight, CheckCircle, BookOpen, Zap, Stethoscope } from "lucide-react";
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
    .slice(0, 8);

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* Hero Section - Full Width */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white px-6 md:px-12 py-16 md:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-500 rounded-lg p-3">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">MedResearch Academy</h1>
              </div>
              <p className="text-blue-100 text-lg md:text-xl mb-4 font-semibold">Clinical Decision Support</p>
              <p className="text-blue-50 text-lg md:text-base leading-relaxed mb-8">
                Access 32+ evidence-based clinical calculators for rapid risk assessment, severity scoring, and clinical decision-making at the point of care. Trusted by healthcare professionals worldwide.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => onSelectCalculator("qsofa")}
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-2 h-auto"
                >
                  Explore Calculators
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-blue-700 font-semibold px-6 py-2 h-auto"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-blue-500 bg-opacity-30 rounded-lg p-6 backdrop-blur-sm border border-blue-400 border-opacity-30">
                <p className="text-4xl font-bold mb-2">32+</p>
                <p className="text-blue-100">Clinical Calculators</p>
              </div>
              <div className="bg-blue-500 bg-opacity-30 rounded-lg p-6 backdrop-blur-sm border border-blue-400 border-opacity-30">
                <p className="text-4xl font-bold mb-2">10</p>
                <p className="text-blue-100">Medical Specialties</p>
              </div>
              <div className="bg-blue-500 bg-opacity-30 rounded-lg p-6 backdrop-blur-sm border border-blue-400 border-opacity-30">
                <p className="text-4xl font-bold mb-2">100%</p>
                <p className="text-blue-100">Evidence-Based</p>
              </div>
              <div className="bg-blue-500 bg-opacity-30 rounded-lg p-6 backdrop-blur-sm border border-blue-400 border-opacity-30">
                <p className="text-4xl font-bold mb-2">Real-time</p>
                <p className="text-blue-100">Calculations</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Calculators - Full Width */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-4">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Featured Calculators</h2>
          <p className="text-gray-600">Start with our most commonly used clinical tools</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {featuredCalculators.map((calc) => (
            <Card
              key={calc.id}
              className="border-0 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1"
              onClick={() => onSelectCalculator(calc.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-blue-700">{calc.name}</CardTitle>
                <CardDescription className="text-xs text-gray-500 line-clamp-2">{calc.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {calc.clinicalUses.slice(0, 2).map((use, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        {use}
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCalculator(calc.id);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Use Now
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Getting Started Guide - Full Width */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">How It Works</h2>
            <p className="text-gray-600">Three simple steps to clinical insights</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold text-lg">1</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Browse & Select</h3>
                  <p className="text-gray-600">
                    Use the sidebar to browse calculators by specialty or search by name. Each calculator is tagged with relevant medical categories for easy discovery.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold text-lg">2</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Data</h3>
                  <p className="text-gray-600">
                    Fill in the clinical parameters for your patient. All inputs are validated in real-time with helpful descriptions and normal ranges.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white font-bold text-lg">3</div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Get Results</h3>
                  <p className="text-gray-600">
                    Receive instant risk stratification with clinical recommendations and evidence-based references to support your decision-making.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browse by Specialty - Full Width */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Browse by Specialty</h2>
          <p className="text-gray-600">Explore calculators across all medical disciplines</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat.name} className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer hover:bg-blue-50">
              <CardContent className="pt-6">
                <p className="font-semibold text-gray-900 mb-1">{cat.name}</p>
                <p className="text-sm text-gray-600">{cat.count} calculators</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Key Features - Full Width */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Why Choose MedResearch Academy</h2>
            <p className="text-gray-600">Trusted tools for clinical excellence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <Zap className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Instant Calculations</h3>
              <p className="text-sm text-gray-600">Real-time scoring with immediate risk stratification</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <BookOpen className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Evidence-Based</h3>
              <p className="text-sm text-gray-600">All calculators backed by peer-reviewed research</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <CheckCircle className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Clinical References</h3>
              <p className="text-sm text-gray-600">Access original studies and clinical guidelines</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <Calculator className="w-8 h-8 text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">Comprehensive</h3>
              <p className="text-sm text-gray-600">32+ calculators across all medical specialties</p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Disclaimer - Full Width */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded">
          <p className="text-sm text-yellow-900">
            <strong>Clinical Disclaimer:</strong> These calculators are clinical decision support tools only and should NOT replace professional medical judgment, clinical expertise, or consultation with qualified healthcare providers. Always verify results with current clinical guidelines and patient-specific factors. MedResearch Academy and its calculators are provided for educational and informational purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
