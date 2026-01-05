import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, CheckCircle, TrendingUp, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalculationResult {
  score: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
  riskPercentage: number;
  recommendations: string[];
  managementPathway: any;
  interpretation: string;
}

interface ResultsDisplayEnhancedProps {
  result: CalculationResult;
  calculatorName: string;
  onPrint?: () => void;
  onShare?: () => void;
}

export function ResultsDisplayEnhanced({
  result,
  calculatorName,
  onPrint,
  onShare,
}: ResultsDisplayEnhancedProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "low":
        return { bg: "bg-green-50", border: "border-green-200", text: "text-green-900", badge: "bg-green-100 text-green-800" };
      case "moderate":
        return { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-900", badge: "bg-yellow-100 text-yellow-800" };
      case "high":
        return { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-900", badge: "bg-orange-100 text-orange-800" };
      case "critical":
        return { bg: "bg-red-50", border: "border-red-200", text: "text-red-900", badge: "bg-red-100 text-red-800" };
      default:
        return { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-900", badge: "bg-slate-100 text-slate-800" };
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "low":
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case "moderate":
        return <AlertCircle className="w-8 h-8 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="w-8 h-8 text-orange-600" />;
      case "critical":
        return <AlertTriangle className="w-8 h-8 text-red-600" />;
      default:
        return <CheckCircle className="w-8 h-8 text-slate-600" />;
    }
  };

  const colors = getRiskColor(result.riskLevel);

  const renderManagementPathway = () => {
    if (typeof result.managementPathway === "string") {
      return result.managementPathway.split("\n").map((line: string, idx: number) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            {idx + 1}
          </div>
          <p className={`text-sm ${colors.text}`}>{line}</p>
        </div>
      ));
    } else if (Array.isArray(result.managementPathway)) {
      return result.managementPathway.map((step: any, idx: number) => (
        <div key={idx} className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
            {idx + 1}
          </div>
          <div>
            <p className={`text-sm font-semibold ${colors.text}`}>{step.action}</p>
            <p className="text-xs text-slate-600 mt-1">{step.rationale}</p>
          </div>
        </div>
      ));
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Main Result Card */}
      <Card className={`${colors.bg} border-2 ${colors.border}`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {getRiskIcon(result.riskLevel)}
              <div>
                <CardTitle className={`text-2xl ${colors.text}`}>
                  Risk Assessment Result
                </CardTitle>
                <CardDescription className={colors.text}>
                  {calculatorName}
                </CardDescription>
              </div>
            </div>
            <Badge className={colors.badge}>{result.riskLevel.toUpperCase()}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Score</p>
              <p className={`text-3xl font-bold ${colors.text}`}>{result.score}</p>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Risk Percentage</p>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-bold ${colors.text}`}>{result.riskPercentage}%</p>
                <TrendingUp className={`w-6 h-6 ${colors.text}`} />
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Risk Level</p>
              <p className={`text-xl font-bold capitalize ${colors.text}`}>{result.riskLevel}</p>
            </div>
          </div>

          {/* Interpretation */}
          <div className="p-4 bg-white rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-2">Clinical Interpretation</p>
            <p className={`text-sm leading-relaxed ${colors.text}`}>{result.interpretation}</p>
          </div>

          {/* Management Pathway */}
          <div className="p-4 bg-white rounded-lg border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 uppercase mb-3">Recommended Management Pathway</p>
            <div className="space-y-2">
              {renderManagementPathway()}
            </div>
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase">Clinical Recommendations</p>
            <div className="space-y-2">
              {result.recommendations.map((rec: string, idx: number) => (
                <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200 flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </div>
                  <p className="text-sm text-slate-700">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onPrint}
          variant="outline"
          className="flex-1 h-10 gap-2"
        >
          <Download className="w-4 h-4" />
          Export PDF
        </Button>
        <Button
          onClick={onShare}
          variant="outline"
          className="flex-1 h-10 gap-2"
        >
          <Share2 className="w-4 h-4" />
          Share Result
        </Button>
      </div>

      {/* Disclaimer */}
      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600">
          <strong>Disclaimer:</strong> This calculator is for clinical decision support only. It should not replace clinical judgment or professional medical advice. Always consult with appropriate specialists for definitive diagnosis and treatment decisions.
        </p>
      </div>
    </div>
  );
}
