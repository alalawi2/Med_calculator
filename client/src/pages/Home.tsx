import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Clock, BookOpen, Stethoscope, AlertCircle } from "lucide-react";

export default function Home() {
  const [alteredMentation, setAlteredMentation] = useState<boolean | null>(null);
  const [respiratoryRate, setRespiratoryRate] = useState<number | null>(null);
  const [systolicBP, setSystolicBP] = useState<number | null>(null);

  // Calculate qSOFA score
  const calculateScore = () => {
    let score = 0;
    if (alteredMentation) score += 1;
    if (respiratoryRate && respiratoryRate > 22) score += 1;
    if (systolicBP && systolicBP < 100) score += 1;
    return score;
  };

  const score = calculateScore();
  const isComplete = alteredMentation !== null && respiratoryRate !== null && systolicBP !== null;
  
  const getRiskLevel = () => {
    if (score <= 1) return { level: "LOW RISK", color: "bg-green-50 border-green-200", textColor: "text-green-900", badge: "success" };
    if (score === 2) return { level: "MODERATE RISK", color: "bg-yellow-50 border-yellow-200", textColor: "text-yellow-900", badge: "warning" };
    return { level: "HIGH RISK", color: "bg-red-50 border-red-200", textColor: "text-red-900", badge: "destructive" };
  };

  const risk = getRiskLevel();

  const resetCalculator = () => {
    setAlteredMentation(null);
    setRespiratoryRate(null);
    setSystolicBP(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Medad</h1>
              <p className="text-sm text-slate-600 mt-1">Evidence-Based Clinical Decision Support</p>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                qSOFA Score
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Info */}
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  Quick SOFA Score
                </CardTitle>
                <CardDescription>
                  Identifies high-risk patients for sepsis-related mortality outside the ICU
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Assessment</CardTitle>
                <CardDescription>Enter patient parameters to calculate qSOFA score</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Altered Mentation */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <label className="text-sm font-semibold text-slate-900">Altered Mentation</label>
                      <p className="text-xs text-slate-600 mt-1">Disorientation, lethargy, or agitation</p>
                    </div>
                    <Badge variant={alteredMentation ? "destructive" : "outline"}>
                      {alteredMentation ? "1 point" : "0 points"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={alteredMentation === false ? "default" : "outline"}
                      onClick={() => setAlteredMentation(false)}
                      className="flex-1"
                    >
                      No
                    </Button>
                    <Button
                      variant={alteredMentation === true ? "destructive" : "outline"}
                      onClick={() => setAlteredMentation(true)}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                  </div>
                </div>

                {/* Respiratory Rate */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <label className="text-sm font-semibold text-slate-900">Respiratory Rate</label>
                      <p className="text-xs text-slate-600 mt-1">Breaths per minute (normal: 12–20)</p>
                    </div>
                    <Badge variant={respiratoryRate && respiratoryRate > 22 ? "destructive" : "outline"}>
                      {respiratoryRate && respiratoryRate > 22 ? "1 point" : "0 points"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={respiratoryRate ?? ""}
                      onChange={(e) => setRespiratoryRate(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Enter RR (breaths/min)"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-slate-600 flex items-center px-2">
                      {respiratoryRate ? `${respiratoryRate} /min` : "—"}
                    </div>
                  </div>
                  {respiratoryRate && respiratoryRate > 22 && (
                    <p className="text-xs text-red-600 font-medium">⚠️ Elevated (&gt;22): +1 point</p>
                  )}
                </div>

                {/* Systolic Blood Pressure */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <label className="text-sm font-semibold text-slate-900">Systolic Blood Pressure</label>
                      <p className="text-xs text-slate-600 mt-1">mmHg (normal: &gt;100)</p>
                    </div>
                    <Badge variant={systolicBP && systolicBP < 100 ? "destructive" : "outline"}>
                      {systolicBP && systolicBP < 100 ? "1 point" : "0 points"}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={systolicBP ?? ""}
                      onChange={(e) => setSystolicBP(e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Enter SBP (mmHg)"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="text-xs text-slate-600 flex items-center px-2">
                      {systolicBP ? `${systolicBP} mmHg` : "—"}
                    </div>
                  </div>
                  {systolicBP && systolicBP < 100 && (
                    <p className="text-xs text-red-600 font-medium">⚠️ Hypotensive (&lt;100): +1 point</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Score Result */}
            {isComplete && (
              <Card className={`border-2 ${risk.color}`}>
                <CardHeader>
                  <CardTitle className={`text-2xl ${risk.textColor}`}>
                    qSOFA Score: {score}/3
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-lg ${risk.color} border border-current`}>
                    <p className={`font-semibold ${risk.textColor}`}>{risk.level}</p>
                    {score <= 1 && (
                      <p className="text-sm text-green-800 mt-2">
                        ✓ Sepsis unlikely. Continue standard monitoring and consider other diagnoses.
                      </p>
                    )}
                    {score === 2 && (
                      <p className="text-sm text-yellow-800 mt-2">
                        ⚠️ Moderate risk for sepsis. Initiate sepsis protocol and close monitoring.
                      </p>
                    )}
                    {score >= 3 && (
                      <p className="text-sm text-red-800 mt-2">
                        🚨 High risk for sepsis. Immediate action required. ICU admission recommended.
                      </p>
                    )}
                  </div>

                  {score >= 2 && (
                    <Alert className="border-red-300 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Activate Sepsis Protocol:</strong> Blood cultures, lactate, IV fluids, broad-spectrum antibiotics
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button onClick={resetCalculator} variant="outline" className="w-full">
                    Reset Calculator
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Clinical Information */}
          <div className="space-y-6">
            {/* Evidence Card */}
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  Evidence Base
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-slate-900">Sensitivity: 81-92%</p>
                  <p className="text-xs text-slate-600">Identifies sepsis cases</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Specificity: 83-87%</p>
                  <p className="text-xs text-slate-600">Reduces false positives</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">PPV: 68-72%</p>
                  <p className="text-xs text-slate-600">Positive predictive value</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">NPV: 89-94%</p>
                  <p className="text-xs text-slate-600">Negative predictive value</p>
                </div>
              </CardContent>
            </Card>

            {/* Key Points */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Clinical Pearls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>qSOFA ≥2 = 10-fold mortality risk increase</p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Lactate is key prognostic marker</p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Time to antibiotics matters critically</p>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <p>Use SOFA instead for ICU patients</p>
                </div>
              </CardContent>
            </Card>

            {/* When to Use */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  When to Use
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div>
                  <p className="font-semibold text-green-700">✓ Use qSOFA when:</p>
                  <ul className="text-xs text-slate-600 mt-1 space-y-1 ml-3">
                    <li>• Suspected infection</li>
                    <li>• Outside ICU setting</li>
                    <li>• Need rapid assessment</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-red-700">✗ Don't use when:</p>
                  <ul className="text-xs text-slate-600 mt-1 space-y-1 ml-3">
                    <li>• Already in ICU</li>
                    <li>• No suspected infection</li>
                    <li>• Chronic altered mental status</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="management" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="management">Management</TabsTrigger>
              <TabsTrigger value="interpretation">Interpretation</TabsTrigger>
              <TabsTrigger value="references">References</TabsTrigger>
              <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
            </TabsList>

            {/* Management Pathways */}
            <TabsContent value="management" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sepsis Management Protocol</CardTitle>
                  <CardDescription>Evidence-based management for qSOFA ≥2</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 pl-4 py-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">0-1h</span>
                        Immediate Actions (0-1 hour)
                      </h4>
                      <ul className="text-sm text-slate-700 mt-3 space-y-2 ml-8">
                        <li>✓ Blood cultures (before antibiotics)</li>
                        <li>✓ Lactate measurement</li>
                        <li>✓ IV fluid bolus: 30 mL/kg crystalloid</li>
                        <li>✓ Broad-spectrum antibiotics</li>
                        <li>✓ ICU notification</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-yellow-500 pl-4 py-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1-3h</span>
                        Next Steps (1-3 hours)
                      </h4>
                      <ul className="text-sm text-slate-700 mt-3 space-y-2 ml-8">
                        <li>✓ Source control (imaging, procedures)</li>
                        <li>✓ Vasopressors if hypotensive</li>
                        <li>✓ Repeat lactate at 3 hours</li>
                        <li>✓ Organ support as needed</li>
                      </ul>
                    </div>

                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                      <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                        <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3-6h</span>
                        Ongoing Management (3-6 hours)
                      </h4>
                      <ul className="text-sm text-slate-700 mt-3 space-y-2 ml-8">
                        <li>✓ Reassess lactate clearance</li>
                        <li>✓ Monitor organ function</li>
                        <li>✓ Adjust antibiotics based on cultures</li>
                        <li>✓ ICU transfer if deteriorating</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interpretation Guide */}
            <TabsContent value="interpretation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Score Interpretation</CardTitle>
                  <CardDescription>Understanding qSOFA results and clinical implications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900">Score 0-1: LOW RISK</h4>
                      <p className="text-sm text-green-800 mt-2">
                        Sepsis is unlikely. Continue standard monitoring. Consider alternative diagnoses. No sepsis protocol activation needed.
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-900">Score 2: MODERATE RISK</h4>
                      <p className="text-sm text-yellow-800 mt-2">
                        Sepsis is possible. Activate sepsis protocol. Close monitoring required. Prepare for potential ICU admission.
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-900">Score 3: HIGH RISK</h4>
                      <p className="text-sm text-red-800 mt-2">
                        Sepsis is likely. Immediate action required. Full sepsis protocol activation. ICU admission strongly recommended.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-semibold text-slate-900 mb-2">What is Sepsis?</h4>
                    <p className="text-sm text-slate-700">
                      Sepsis is life-threatening organ dysfunction caused by a dysregulated host response to infection. It differs from infection alone and requires rapid recognition and treatment. Mortality increases with every hour of delay in appropriate therapy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* References */}
            <TabsContent value="references" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Evidence & Guidelines</CardTitle>
                  <CardDescription>Research basis and clinical recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Primary Studies</h4>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="font-medium text-slate-900">Seymour CW, et al. (2016)</p>
                        <p className="text-slate-700 mt-1">Assessment of the SOFA score's accuracy in predicting the onset of organ dysfunction/failure in acutely ill patients. JAMA. 315(15):1582-1590.</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded border border-slate-200">
                        <p className="font-medium text-slate-900">Singer M, et al. (2016)</p>
                        <p className="text-slate-700 mt-1">The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3). JAMA. 315(8):801-810.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Clinical Guidelines</h4>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span> Surviving Sepsis Campaign Bundle 2021
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span> SCCM Critical Care Guidelines
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span> CDC Sepsis Toolkit
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="text-blue-600">✓</span> WHO Sepsis Recommendations
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Clinical Scenarios */}
            <TabsContent value="scenarios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Clinical Scenarios</CardTitle>
                  <CardDescription>Real-world examples and how to interpret them</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-900">Scenario 1: Septic Shock</h4>
                      <p className="text-sm text-slate-700 mt-2">
                        <strong>Patient:</strong> 72-year-old with fever, confusion, BP 95/60, RR 26
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        <strong>qSOFA:</strong> Altered mentation (1) + RR &gt;22 (1) + SBP &lt;100 (1) = <span className="font-bold text-red-900">3/3</span>
                      </p>
                      <p className="text-sm text-red-800 mt-2 font-semibold">
                        → SEPTIC SHOCK - Immediate sepsis protocol, ICU admission
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-semibold text-yellow-900">Scenario 2: Possible Sepsis</h4>
                      <p className="text-sm text-slate-700 mt-2">
                        <strong>Patient:</strong> 45-year-old with UTI, RR 24, alert, BP 115/70
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        <strong>qSOFA:</strong> Altered mentation (0) + RR &gt;22 (1) + SBP &lt;100 (0) = <span className="font-bold text-yellow-900">1/3</span>
                      </p>
                      <p className="text-sm text-yellow-800 mt-2 font-semibold">
                        → LOW RISK - Monitor closely, consider sepsis protocol if deteriorates
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900">Scenario 3: Low Risk</h4>
                      <p className="text-sm text-slate-700 mt-2">
                        <strong>Patient:</strong> 60-year-old post-op, alert, RR 18, BP 110/70
                      </p>
                      <p className="text-sm text-slate-700 mt-1">
                        <strong>qSOFA:</strong> Altered mentation (0) + RR &gt;22 (0) + SBP &lt;100 (0) = <span className="font-bold text-green-900">0/3</span>
                      </p>
                      <p className="text-sm text-green-800 mt-2 font-semibold">
                        → NO SEPSIS SIGNS - Standard post-op monitoring
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
          <p>
            <strong>Disclaimer:</strong> This calculator is for educational purposes only. Clinical judgment and patient assessment are essential. Always consult current clinical guidelines and institutional protocols.
          </p>
          <p className="mt-4 text-xs">
            © 2026 Medad. Evidence-based clinical decision support for on-call physicians.
          </p>
        </div>
      </main>
    </div>
  );
}
