import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calculator, AlertCircle, CheckCircle2, Info } from "lucide-react";

interface CalculatorInput {
  id: string;
  label: string;
  description: string;
  type: "boolean" | "number" | "select";
  options?: string[];
  min?: number;
  max?: number;
  value?: any;
}

interface CalculatorFormProps {
  calculatorName: string;
  calculatorDescription: string;
  inputs: CalculatorInput[];
  onSubmit: (values: Record<string, any>) => void;
  isLoading?: boolean;
}

export function CalculatorFormEnhanced({
  calculatorName,
  calculatorDescription,
  inputs,
  onSubmit,
  isLoading = false,
}: CalculatorFormProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateInput = (id: string, value: any, input: CalculatorInput) => {
    if (value === undefined || value === null || value === "") {
      return "This field is required";
    }

    if (input.type === "number") {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return "Please enter a valid number";
      }
      if (input.min !== undefined && numValue < input.min) {
        return `Value must be at least ${input.min}`;
      }
      if (input.max !== undefined && numValue > input.max) {
        return `Value must be at most ${input.max}`;
      }
    }

    return "";
  };

  const handleInputChange = (id: string, value: any) => {
    setFormValues((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Validate on change if field has been touched
    if (touched[id]) {
      const input = inputs.find((i) => i.id === id);
      if (input) {
        const error = validateInput(id, value, input);
        setErrors((prev) => ({
          ...prev,
          [id]: error,
        }));
      }
    }
  };

  const handleBlur = (id: string) => {
    setTouched((prev) => ({
      ...prev,
      [id]: true,
    }));

    const input = inputs.find((i) => i.id === id);
    if (input) {
      const error = validateInput(id, formValues[id], input);
      setErrors((prev) => ({
        ...prev,
        [id]: error,
      }));
    }
  };

  const isFormValid = () => {
    const newErrors: Record<string, string> = {};
    inputs.forEach((input) => {
      const error = validateInput(input.id, formValues[input.id], input);
      if (error) {
        newErrors[input.id] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onSubmit(formValues);
    }
  };

  const filledCount = Object.keys(formValues).filter((key) => formValues[key] !== undefined && formValues[key] !== null && formValues[key] !== "").length;
  const progressPercent = (filledCount / inputs.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calculator className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">{calculatorName}</h2>
            <p className="text-slate-600 mt-1">{calculatorDescription}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Patient Information</span>
          <span className="text-sm text-slate-500">
            {filledCount} of {inputs.length} fields
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inputs.map((input) => {
            const hasError = errors[input.id];
            const isTouched = touched[input.id];
            const value = formValues[input.id];
            const isValid = value !== undefined && value !== null && value !== "" && !hasError;

            return (
              <div key={input.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-900">
                    {input.label}
                  </label>
                  {isTouched && (
                    <div>
                      {isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : hasError ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>

                {input.description && (
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {input.description}
                  </p>
                )}

                {input.type === "boolean" && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => handleInputChange(input.id, true)}
                      onBlur={() => handleBlur(input.id)}
                      variant={value === true ? "default" : "outline"}
                      className="flex-1"
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleInputChange(input.id, false)}
                      onBlur={() => handleBlur(input.id)}
                      variant={value === false ? "default" : "outline"}
                      className="flex-1"
                    >
                      No
                    </Button>
                  </div>
                )}

                {input.type === "number" && (
                  <Input
                    type="number"
                    min={input.min}
                    max={input.max}
                    value={value || ""}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    onBlur={() => handleBlur(input.id)}
                    placeholder={`${input.min || 0} - ${input.max || "∞"}`}
                    className={`h-10 ${
                      hasError && isTouched
                        ? "border-red-500 focus:ring-red-500"
                        : isValid
                          ? "border-green-500 focus:ring-green-500"
                          : ""
                    }`}
                  />
                )}

                {input.type === "select" && (
                  <select
                    value={value || ""}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    onBlur={() => handleBlur(input.id)}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                      hasError && isTouched
                        ? "border-red-500 focus:ring-red-500"
                        : isValid
                          ? "border-green-500 focus:ring-green-500"
                          : "border-slate-300 focus:ring-blue-500"
                    }`}
                  >
                    <option value="">Select an option...</option>
                    {input.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {hasError && isTouched && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {hasError}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isLoading || filledCount !== inputs.length}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200"
          >
            {isLoading ? "Calculating..." : "Calculate Risk Score"}
          </Button>
        </div>
      </form>
    </div>
  );
}
