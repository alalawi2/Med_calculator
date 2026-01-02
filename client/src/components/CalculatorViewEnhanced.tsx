import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BookOpen, CheckCircle2, AlertCircle, TrendingUp, Zap } from "lucide-react";
import { Calculator } from "@/lib/calculators";
import { CalculationResult } from "@/lib/calculator-engine";
import { FeedbackModal } from "./FeedbackModal";
import { useFeedback } from "@/hooks/useFeedback";

interface CalculatorViewEnhancedProps {
  calculator: Calculator;
  onCalculate: (inputs: Record<string, any>) => CalculationResult | null;
}

export function CalculatorViewEnhanced({
  calculator,
  onCalculate,
}: CalculatorViewEnhancedProps) {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { submitFeedback } = useFeedback();

  const handleInputChange = (id: string, value: any) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    const calculationResult = onCalculate(inputs);
    if (calculationResult) {
      setResult(calculationResult);
    }
  };

  const handleSubmitFeedback = (data: any) => {
    submitFeedback({
      calculatorId: calculator.id,
      ...data,
    });
  };

  const isComplete = calculator.inputs.every((input) => inputs[input.id] !== undefined);

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-50 border-red-200 text-red-900";
      case "high":
        return "bg-orange-50 border-orange-200 text-orange-900";
      case "medium":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "low":
        return "bg-green-50 border-green-200 text-green-900";
      default:
        return "bg-slate-50 border-slate-200 text-slate-900";
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      case "medium":
        return "outline";
      case "low":
        return "default";
      default:
        return "outline";
    }
  };

  const getFrequencyBadge = (freq: string) => {
    switch (freq) {
      case "critical":
        return "destructive";
      case "high":
        return "secondary";
      default:
        return "default";
    }
  };

  const getFrequencyColor = (freq: string) => {
    switch (freq) {
      case "critical":
        return "bg-red-50 border-red-200";
      case "high":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className={`border-2 ${getFrequencyColor(calculator.frequency)}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{calculator.name}</CardTitle>
              <CardDescription className="mt-2">{calculator.description}</CardDescription>
            </div>
            <Badge variant={getFrequencyBadge(calculator.frequency) as any}>
              {calculator.frequency.toUpperCase()}
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {calculator.useCases.map((useCase) => (
              <Badge key={useCase} variant="outline" className="text-xs">
                {useCase}
              </Badge>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Patient Assessment</CardTitle>
          <CardDescription>Enter patient parameters to calculate score</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {calculator.inputs.map((input) => (
            <div key={input.id} className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <label className="text-sm font-semibold text-slate-900">{input.label}</label>
                  <p className="text-xs text-slate-600 mt-1">{input.description}</p>
                  {input.normal && (
                    <p className="text-xs text-slate-500 mt-1">Normal: {input.normal}</p>
                  )}
                </div>
              </div>

              {input.type === "boolean" && (
                <div className="flex gap-2">
                  <Button
                    variant={inputs[input.id] === false ? "default" : "outline"}
                    onClick={() => handleInputChange(input.id, false)}
                    className="flex-1"
                  >
                    No
                  </Button>
                  <Button
                    variant={inputs[input.id] === true ? "destructive" : "outline"}
                    onClick={() => handleInputChange(input.id, true)}
                    className="flex-1"
                  >
                    Yes
                  </Button>
                </div>
              )}

              {input.type === "number" && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={inputs[input.id] ?? ""}
                    onChange={(e) =>
                      handleInputChange(input.id, e.target.value ? parseFloat(e.target.value) : null)
                    }
                    placeholder={`Enter ${input.label.toLowerCase()}`}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {input.unit && (
                    <div className="text-xs text-slate-600 flex items-center px-2">
                      {inputs[input.id] ? `${inputs[input.id]} ${input.unit}` : "—"}
                    </div>
                  )}
                </div>
              )}

              {input.type === "select" && (
                <select
                  value={inputs[input.id] ?? ""}
                  onChange={(e) => handleInputChange(input.id, e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select option...</option>
                  {input.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}

          <Button onClick={handleCalculate} disabled={!isComplete} className="w-full mt-6">
            <Zap className="w-4 h-4 mr-2" />
            Calculate Score
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <>
          {/* Score Display */}
          <Card className={`border-2 ${getRiskColor(result.riskLevel)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Calculation Result</CardTitle>
                </div>
                <Badge variant={getRiskBadgeColor(result.riskLevel) as any}>
                  {result.riskLevel.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/50 rounded">
                  <p className="text-xs text-slate-600 uppercase font-semibold">Score</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {result.score}/{result.maxScore}
                  </p>
                </div>
                <div className="p-4 bg-white/50 rounded">
                  <p className="text-xs text-slate-600 uppercase font-semibold">Risk</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{result.riskPercentage}%</p>
                </div>
              </div>

              <div className="p-4 bg-white/50 rounded">
                <p className="font-semibold text-slate-900">{result.interpretation}</p>
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">Recommendations:</p>
                {result.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Management Pathway */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Management Pathway
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.managementPathway.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded border-l-4 ${
                    step.priority === "immediate"
                      ? "border-l-red-500 bg-red-50"
                      : step.priority === "urgent"
                        ? "border-l-orange-500 bg-orange-50"
                        : "border-l-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Badge
                      variant={
                        step.priority === "immediate"
                          ? "destructive"
                          : step.priority === "urgent"
                            ? "secondary"
                            : "default"
                      }
                      className="text-xs"
                    >
                      {step.priority.toUpperCase()}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{step.action}</p>
                      <p className="text-sm text-slate-700 mt-1">{step.rationale}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Feedback Button */}
          <Button
            onClick={() => setFeedbackOpen(true)}
            variant="outline"
            className="w-full"
          >
            Share Feedback
          </Button>
        </>
      )}

      {/* Tabs for Additional Info */}
      <Tabs defaultValue="references" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="references">References</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="references" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clinical Evidence</CardTitle>
              <CardDescription>Highly-cited research and clinical guidelines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {calculator.references.map((ref, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded border border-slate-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {ref.authors} ({ref.year})
                      </p>
                      <p className="text-sm text-slate-700 mt-2">{ref.title}</p>
                      <p className="text-xs text-slate-600 mt-2">
                        {ref.journal}. {ref.volume}:{ref.pages}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>Impact Factor:</strong> {ref.impactFactor} |{" "}
                        <strong>Citations:</strong> {ref.citations}+
                      </p>
                    </div>
                    {ref.badge && (
                      <Badge
                        className={`ml-2 ${
                          ref.badge === "most-cited"
                            ? "bg-blue-600"
                            : ref.badge === "highly-cited"
                              ? "bg-slate-600"
                              : "bg-slate-500"
                        }`}
                      >
                        {ref.badge === "most-cited"
                          ? "Most Cited"
                          : ref.badge === "highly-cited"
                            ? "Highly Cited"
                            : "Cited"}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calculator Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Category</p>
                <p className="text-sm text-slate-700 mt-1">{calculator.category}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Frequency</p>
                <Badge className="mt-1">{calculator.frequency}</Badge>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">Use Cases</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {calculator.useCases.map((useCase) => (
                    <Badge key={useCase} variant="outline">
                      {useCase}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        calculatorName={calculator.name}
        onSubmit={handleSubmitFeedback}
      />
    </div>
  );
}
