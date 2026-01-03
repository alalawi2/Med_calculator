import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
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

  if (!calculator) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No calculator selected</p>
      </div>
    );
  }

  const handleInputChange = (id: string, value: any) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleCalculate = () => {
    const calculationResult = onCalculate(inputs);
    setResult(calculationResult);
  };

  const getRiskColor = (risk: string | undefined) => {
    if (!risk) return "border-slate-200";
    if (risk.toLowerCase().includes("low")) return "border-green-500";
    if (risk.toLowerCase().includes("high") || risk.toLowerCase().includes("critical")) return "border-red-500";
    return "border-yellow-500";
  };

  const getRiskBgColor = (risk: string | undefined) => {
    if (!risk) return "bg-slate-50";
    if (risk.toLowerCase().includes("low")) return "bg-green-50";
    if (risk.toLowerCase().includes("high") || risk.toLowerCase().includes("critical")) return "bg-red-50";
    return "bg-yellow-50";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{calculator.name}</CardTitle>
              <CardDescription className="mt-2">{calculator.description}</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {calculator.category}
            </Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {calculator.clinicalUses?.map((useCase: string) => (
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
          <CardTitle className="text-lg">Patient Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {calculator.inputs?.map((input: any) => (
            <div key={input.id} className="space-y-2">
              <label className="text-sm font-medium">{input.label}</label>
              <p className="text-xs text-slate-600">{input.description}</p>
              {input.type === "boolean" ? (
                <div className="flex gap-2">
                  <Button
                    variant={inputs[input.id] === true ? "default" : "outline"}
                    onClick={() => handleInputChange(input.id, true)}
                    className="w-20"
                  >
                    Yes
                  </Button>
                  <Button
                    variant={inputs[input.id] === false ? "default" : "outline"}
                    onClick={() => handleInputChange(input.id, false)}
                    className="w-20"
                  >
                    No
                  </Button>
                </div>
              ) : input.type === "number" ? (
                <input
                  type="number"
                  min={input.min}
                  max={input.max}
                  value={inputs[input.id] ?? ""}
                  onChange={(e) => handleInputChange(input.id, parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder={`Enter ${input.label.toLowerCase()}`}
                />
              ) : input.type === "select" ? (
                <select
                  value={inputs[input.id] ?? ""}
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Select an option</option>
                  {input.options?.map((option: string, idx: number) => (
                    <option key={idx} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>
          ))}

          <Button onClick={handleCalculate} className="w-full mt-6" size="lg">
            Calculate Score
          </Button>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card className={`border-2 ${getRiskColor(result.riskLevel)}`}>
          <CardHeader className={getRiskBgColor(result.riskLevel)}>
            <CardTitle className="flex items-center gap-2">
              {result.riskLevel?.toLowerCase().includes("low") && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              {result.riskLevel?.toLowerCase().includes("high") && (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              {result.riskLevel?.toLowerCase().includes("critical") && (
                <AlertTriangle className="w-5 h-5 text-red-700" />
              )}
              {result.riskLevel?.toLowerCase().includes("medium") && (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              Score: {result.score} / {result.maxScore}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div>
              <p className="text-sm font-semibold">
                Risk Level: <span className="uppercase">{result.riskLevel}</span> ({result.riskPercentage}%)
              </p>
              <p className="text-sm text-slate-600 mt-1">{result.interpretation}</p>
            </div>

            {result.recommendations && result.recommendations.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-semibold mb-2">Recommended Actions:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {result.recommendations.map((rec: string, idx: number) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {result.managementPathway && result.managementPathway.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-sm mb-2">Management Pathway:</p>
                <div className="space-y-2">
                  {result.managementPathway.map((step, idx) => (
                    <div key={idx} className="text-sm">
                      <p className="font-medium text-slate-900">{step.action}</p>
                      <p className="text-xs text-slate-600">{step.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => setFeedbackOpen(true)} variant="outline" className="w-full">
              Provide Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {/* References Section */}
      {calculator.references && calculator.references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Evidence & References
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {calculator.references.map((ref: any, idx: number) => (
              <div key={idx} className="text-sm border-l-2 border-blue-300 pl-3 py-2">
                <p className="font-semibold">{ref.authors} ({ref.year})</p>
                <p className="text-slate-700">{ref.title}</p>
                <p className="text-xs text-slate-600">
                  {ref.journal} {ref.volume && `Vol. ${ref.volume}`} {ref.pages && `pp. ${ref.pages}`}
                </p>
                {ref.citations && (
                  <p className="text-xs text-blue-600 mt-1">
                    Citations: {ref.citations} | Impact Factor: {ref.impactFactor}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        calculatorName={calculator.name}
        onSubmit={(feedback) => {
          submitFeedback({
            calculatorId: calculator.id,
            ...feedback,
          });
          setFeedbackOpen(false);
        }}
      />
    </div>
  );
}
