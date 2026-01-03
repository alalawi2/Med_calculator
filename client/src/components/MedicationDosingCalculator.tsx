import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Calculator } from "lucide-react";
import { calculateMedicationDose, calculateGFR, weightBasedMedications } from "@/lib/medication-calculator";

export default function MedicationDosingCalculator() {
  const [selectedMed, setSelectedMed] = useState<string>("gentamicin");
  const [weight, setWeight] = useState<number>(70);
  const [age, setAge] = useState<number>(45);
  const [creatinine, setCreatinine] = useState<number>(1.0);
  const [childPugh, setChildPugh] = useState<"A" | "B" | "C">("A");
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    try {
      const res = calculateMedicationDose(selectedMed, {
        medicationId: selectedMed,
        weight,
        age,
        creatinine,
        childPughScore: childPugh,
      });
      setResult(res);
    } catch (error) {
      console.error("Calculation error:", error);
    }
  };

  const gfr = calculateGFR(creatinine, age, "male");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          Medication Dosing Calculator
        </h2>
        <p className="text-muted-foreground mt-2">
          Weight-based and renal-adjusted dosing for critical medications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Patient Parameters</h3>

            {/* Medication Selection */}
            <div>
              <label className="text-sm font-medium text-foreground">Medication</label>
              <select
                value={selectedMed}
                onChange={(e) => setSelectedMed(e.target.value)}
                className="w-full mt-2 p-2 border border-input rounded-md bg-background text-foreground"
              >
                {Object.entries(weightBasedMedications).map(([id, med]) => (
                  <option key={id} value={id}>
                    {med.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label className="text-sm font-medium text-foreground">Weight (kg)</label>
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                min="1"
                max="200"
                className="mt-2"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-sm font-medium text-foreground">Age (years)</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                min="0"
                max="120"
                className="mt-2"
              />
            </div>

            {/* Creatinine */}
            <div>
              <label className="text-sm font-medium text-foreground">Serum Creatinine (mg/dL)</label>
              <Input
                type="number"
                value={creatinine}
                onChange={(e) => setCreatinine(Number(e.target.value))}
                min="0.1"
                max="10"
                step="0.1"
                className="mt-2"
              />
            </div>

            {/* Child-Pugh */}
            <div>
              <label className="text-sm font-medium text-foreground">Hepatic Function</label>
              <select
                value={childPugh}
                onChange={(e) => setChildPugh(e.target.value as "A" | "B" | "C")}
                className="w-full mt-2 p-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="A">Child-Pugh A (Normal)</option>
                <option value="B">Child-Pugh B (Moderate)</option>
                <option value="C">Child-Pugh C (Severe)</option>
              </select>
            </div>

            {/* Calculate Button */}
            <Button onClick={handleCalculate} className="w-full mt-4">
              Calculate Dose
            </Button>
          </Card>

          {/* GFR Display */}
          <Card className="p-4 mt-4 bg-blue-50 border-blue-200">
            <p className="text-sm text-muted-foreground">Calculated GFR</p>
            <p className="text-2xl font-bold text-primary">{Math.round(gfr)} mL/min</p>
            <p className="text-xs text-muted-foreground mt-2">
              {gfr > 80
                ? "Normal kidney function"
                : gfr >= 60
                ? "Mild reduction"
                : gfr >= 30
                ? "Moderate reduction"
                : "Severe reduction"}
            </p>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          {result ? (
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground mb-4">
                  {result.medicationName}
                </h3>

                {/* Dosing Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Standard Dose</p>
                    <p className="text-lg font-semibold text-foreground">
                      {result.standardDose}
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <p className="text-sm text-muted-foreground">Calculated Dose</p>
                    <p className="text-lg font-bold text-green-700">
                      {result.calculatedDose}
                    </p>
                  </div>
                </div>

                {/* Adjustments */}
                <div className="space-y-3 mb-6">
                  <div className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                    <p className="text-sm font-medium text-blue-900">Renal Adjustment</p>
                    <p className="text-sm text-blue-800">{result.renalAdjustment}</p>
                  </div>

                  {result.hepaticAdjustment && (
                    <div className="p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                      <p className="text-sm font-medium text-orange-900">Hepatic Adjustment</p>
                      <p className="text-sm text-orange-800">{result.hepaticAdjustment}</p>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      Important Warnings
                    </h4>
                    <ul className="space-y-2">
                      {result.warnings.map((warning: string, idx: number) => (
                        <li key={idx} className="text-sm text-amber-700 flex gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* References */}
                {result.references && result.references.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold text-foreground mb-3">References</h4>
                    <div className="space-y-2">
                      {result.references.map((ref: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <p className="font-medium text-primary">{ref.source}</p>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {ref.lastUpdated}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-12 flex items-center justify-center min-h-96">
              <div className="text-center">
                <Calculator className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Enter patient parameters and click "Calculate Dose" to see results
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> This calculator provides evidence-based dosing recommendations. Always verify doses with current clinical guidelines and institutional protocols. Consult UpToDate, Micromedex, or Sanford Guide for comprehensive medication information.
        </p>
      </Card>
    </div>
  );
}
