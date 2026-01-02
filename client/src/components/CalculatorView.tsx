import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, BookOpen, CheckCircle2, AlertCircle } from "lucide-react";
import { Calculator } from "@/lib/calculators";
import { FeedbackModal } from "./FeedbackModal";
import { useFeedback } from "@/hooks/useFeedback";

interface CalculatorViewProps {
  calculator: Calculator;
}

export function CalculatorView({ calculator }: CalculatorViewProps) {
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const { submitFeedback, getAverageRating, getHelpfulPercentage } = useFeedback();

  const handleInputChange = (id: string, value: any) => {
    setInputs((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmitFeedback = (data: any) => {
    submitFeedback({
      calculatorId: calculator.id,
      ...data,
    });
  };

  const isComplete = calculator.inputs.every((input) => inputs[input.id] !== undefined);

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
                      handleInputChange(input.id, e.target.value ? parseInt(e.target.value) : null)
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
                  onChange={(e) => handleInputChange(input.id, e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select option...</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              )}
            </div>
          ))}

          {isComplete && (
            <Button
              onClick={() => setFeedbackOpen(true)}
              variant="outline"
              className="w-full mt-4"
            >
              Provide Feedback
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="interpretation" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="interpretation">Interpretation</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
          <TabsTrigger value="references">References</TabsTrigger>
        </TabsList>

        <TabsContent value="interpretation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Score Interpretation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">
                Interpretation content for {calculator.name} will be displayed here based on the calculated score.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Management Protocol</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">
                Management recommendations for {calculator.name} will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

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
