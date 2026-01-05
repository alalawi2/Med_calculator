import { Calculator, Heart, Brain, Zap, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Calculator as CalculatorType } from '@/lib/calculators-extended';

interface WelcomeScreenProps {
  calculators: CalculatorType[];
  onSelectCalculator: (id: string) => void;
}

export default function WelcomeScreen({ calculators, onSelectCalculator }: WelcomeScreenProps) {
  // Featured calculators - most commonly used
  const featuredIds = ['qsofa', 'heart', 'wells_pe', 'nihss', 'curb65'];
  const featured = calculators.filter(c => featuredIds.includes(c.id)).slice(0, 5);

  // Get calculators by category
  const categoriesSummary = [
    { name: 'Critical Care', icon: Zap, count: calculators.filter(c => c.categories?.includes('Intensive Care')).length },
    { name: 'Cardiology', icon: Heart, count: calculators.filter(c => c.categories?.includes('Cardiology')).length },
    { name: 'Neurology', icon: Brain, count: calculators.filter(c => c.categories?.includes('Neurology')).length },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Welcome to MedResearch Academy</h1>
          </div>
          <p className="text-blue-100 text-lg md:text-xl mb-2">Clinical Decision Support Platform</p>
          <p className="text-blue-100">Access 32+ evidence-based calculators and medication dosing tools for on-call physicians</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {categoriesSummary.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.name} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{cat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{cat.count}</p>
                    <p className="text-xs text-gray-500 mt-1">Calculators</p>
                  </div>
                  <Icon className="h-8 w-8 text-blue-600 opacity-20" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured Calculators */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Featured Calculators</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((calc) => (
              <div
                key={calc.id}
                className="bg-white rounded-lg border border-gray-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                onClick={() => onSelectCalculator(calc.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{calc.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">{calc.categories?.[0] || 'Clinical'}</p>
                  </div>
                  <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{calc.description}</p>
                <Button
                  size="sm"
                  className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCalculator(calc.id);
                  }}
                >
                  Use Calculator
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6 md:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Browse Calculators</h4>
                  <p className="text-sm text-gray-600 mt-1">Use the sidebar to explore calculators by specialty</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3 mb-4">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Enter Patient Data</h4>
                  <p className="text-sm text-gray-600 mt-1">Input patient information in the form</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Get Results</h4>
                  <p className="text-sm text-gray-600 mt-1">View risk-stratified results and recommendations</p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-semibold flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Provide Feedback</h4>
                  <p className="text-sm text-gray-600 mt-1">Help us improve by rating the calculator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
