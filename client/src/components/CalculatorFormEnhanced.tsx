import { useState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const formId = useId();
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

  // Handle keyboard navigation for boolean buttons
  const handleBooleanKeyDown = (
    e: React.KeyboardEvent,
    id: string,
    currentValue: boolean | undefined
  ) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      // Toggle between true and false
      handleInputChange(id, currentValue === true ? false : true);
    }
  };

  const filledCount = Object.keys(formValues).filter(
    (key) => formValues[key] !== undefined && formValues[key] !== null && formValues[key] !== ""
  ).length;
  const progressPercent = (filledCount / inputs.length) * 100;

  return (
    <div className="space-y-8 max-w-4xl" role="region" aria-label={`${calculatorName} input form`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border border-blue-200">
        <div className="flex items-start gap-6">
          <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0" aria-hidden="true">
            <Calculator className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 id={`${formId}-title`} className="text-3xl font-bold text-slate-900 mb-2">
              {calculatorName}
            </h2>
            <p id={`${formId}-description`} className="text-slate-600 text-base leading-relaxed">
              {calculatorDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span id={`${formId}-progress-label`} className="text-sm font-medium text-slate-700">
            Patient Information
          </span>
          <span className="text-sm text-slate-500" aria-live="polite">
            {filledCount} of {inputs.length} fields completed
          </span>
        </div>
        <div
          className="w-full bg-slate-200 rounded-full h-2"
          role="progressbar"
          aria-valuenow={filledCount}
          aria-valuemin={0}
          aria-valuemax={inputs.length}
          aria-labelledby={`${formId}-progress-label`}
        >
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-8"
        aria-labelledby={`${formId}-title`}
        aria-describedby={`${formId}-description`}
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {inputs.map((input, index) => {
            const hasError = errors[input.id];
            const isTouched = touched[input.id];
            const value = formValues[input.id];
            const isValid = value !== undefined && value !== null && value !== "" && !hasError;

            const inputId = `${formId}-${input.id}`;
            const descriptionId = `${inputId}-description`;
            const errorId = `${inputId}-error`;

            return (
              <div key={input.id} className="space-y-3" role="group" aria-labelledby={`${inputId}-label`}>
                <div className="flex items-center justify-between gap-2">
                  <label
                    id={`${inputId}-label`}
                    htmlFor={inputId}
                    className="block text-base font-semibold text-slate-900"
                  >
                    {input.label}
                    <span className="sr-only"> (required)</span>
                  </label>
                  {isTouched && (
                    <div className="flex-shrink-0" aria-hidden="true">
                      {isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : hasError ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>

                {input.description && (
                  <p id={descriptionId} className="text-sm text-slate-600 flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{input.description}</span>
                  </p>
                )}

                {input.type === "boolean" && (
                  <div
                    className="flex gap-3"
                    role="radiogroup"
                    aria-labelledby={`${inputId}-label`}
                    aria-describedby={input.description ? descriptionId : undefined}
                  >
                    <Button
                      type="button"
                      id={`${inputId}-yes`}
                      role="radio"
                      aria-checked={value === true}
                      onClick={() => handleInputChange(input.id, true)}
                      onBlur={() => handleBlur(input.id)}
                      onKeyDown={(e) => handleBooleanKeyDown(e, input.id, value)}
                      variant={value === true ? "default" : "outline"}
                      className="flex-1 h-10 text-base"
                      tabIndex={value === true || value === undefined ? 0 : -1}
                    >
                      Yes
                    </Button>
                    <Button
                      type="button"
                      id={`${inputId}-no`}
                      role="radio"
                      aria-checked={value === false}
                      onClick={() => handleInputChange(input.id, false)}
                      onBlur={() => handleBlur(input.id)}
                      onKeyDown={(e) => handleBooleanKeyDown(e, input.id, value)}
                      variant={value === false ? "default" : "outline"}
                      className="flex-1 h-10 text-base"
                      tabIndex={value === false ? 0 : -1}
                    >
                      No
                    </Button>
                  </div>
                )}

                {input.type === "number" && (
                  <Input
                    type="number"
                    id={inputId}
                    min={input.min}
                    max={input.max}
                    value={value || ""}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    onBlur={() => handleBlur(input.id)}
                    placeholder={`${input.min || 0} - ${input.max || "∞"}`}
                    aria-describedby={
                      [input.description ? descriptionId : null, hasError && isTouched ? errorId : null]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    aria-invalid={hasError && isTouched ? "true" : undefined}
                    aria-required="true"
                    className={`h-11 w-full text-base ${
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
                    id={inputId}
                    value={value || ""}
                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                    onBlur={() => handleBlur(input.id)}
                    aria-describedby={
                      [input.description ? descriptionId : null, hasError && isTouched ? errorId : null]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                    aria-invalid={hasError && isTouched ? "true" : undefined}
                    aria-required="true"
                    className={`w-full h-11 px-3 py-2 border rounded-md text-base focus:outline-none focus:ring-2 ${
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
                  <p id={errorId} className="text-sm text-red-600 flex items-start gap-2 mt-2" role="alert">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{hasError}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Submit Button */}
        <div className="pt-4 col-span-full">
          <Button
            type="submit"
            disabled={isLoading || filledCount !== inputs.length}
            aria-disabled={isLoading || filledCount !== inputs.length}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="sr-only">Calculating risk score</span>
                <span aria-hidden="true">Calculating...</span>
              </>
            ) : (
              "Calculate Risk Score"
            )}
          </Button>
          {filledCount !== inputs.length && (
            <p className="text-sm text-slate-500 text-center mt-2" aria-live="polite">
              Please complete all {inputs.length - filledCount} remaining field
              {inputs.length - filledCount !== 1 ? "s" : ""} to calculate
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
