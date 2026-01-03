import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { medications } from "@/lib/calculators";
import { Search } from "lucide-react";

export function MedicationDosing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMed, setSelectedMed] = useState<string | null>(null);

  const filteredMeds = medications.filter(
    (med) =>
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.indication.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentMed = medications.find((m) => m.id === selectedMed);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Medication Dosing</h2>
        <p className="text-slate-600 mt-2">Evidence-based dosing for common on-call medications</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Medication List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Medications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search medications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMeds.map((med) => (
                  <button
                    key={med.id}
                    onClick={() => setSelectedMed(med.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedMed === med.id
                        ? "bg-blue-100 text-blue-900 font-medium"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="font-medium">{med.name}</div>
                    <div className="text-xs text-slate-600">{med.category}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medication Details */}
        <div className="lg:col-span-2">
          {currentMed ? (
            <div className="space-y-4">
              {/* Header */}
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{currentMed.name}</CardTitle>
                      <CardDescription className="mt-2">{currentMed.indication}</CardDescription>
                    </div>
                    <Badge>{currentMed.category}</Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Dosing Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dosing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-blue-900 uppercase mb-1">Standard Dose</p>
                    <p className="text-sm font-mono text-blue-900">{currentMed.standardDose}</p>
                  </div>

                  <div className="p-4 bg-orange-50 rounded border border-orange-200">
                    <p className="text-xs font-semibold text-orange-900 uppercase mb-1">Renal Adjustment</p>
                    <p className="text-sm font-mono text-orange-900">{currentMed.renalAdjustment}</p>
                  </div>

                  {currentMed.hepaticAdjustment && (
                    <div className="p-4 bg-amber-50 rounded border border-amber-200">
                      <p className="text-xs font-semibold text-amber-900 uppercase mb-1">Hepatic Adjustment</p>
                      <p className="text-sm font-mono text-amber-900">{currentMed.hepaticAdjustment}</p>
                    </div>
                  )}

                  <div className="p-4 bg-slate-50 rounded border border-slate-200">
                    <p className="text-xs font-semibold text-slate-900 uppercase mb-1">Clinical Notes</p>
                    <p className="text-sm text-slate-900">{currentMed.notes}</p>
                  </div>
                </CardContent>
              </Card>

              {/* References */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Clinical Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  {currentMed.references.map((ref: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded border border-slate-200">
                      <p className="font-semibold text-slate-900">
                        {ref.authors} ({ref.year})
                      </p>
                      <p className="text-sm text-slate-700 mt-2">{ref.title}</p>
                      <p className="text-xs text-slate-600 mt-2">
                        {ref.journal}. {ref.volume}:{ref.pages}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        <strong>Impact Factor:</strong> {ref.impactFactor}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex items-center justify-center min-h-96">
              <CardContent className="text-center">
                <p className="text-slate-600">Select a medication to view dosing information</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
