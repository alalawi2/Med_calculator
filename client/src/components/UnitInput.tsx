import { Input } from "@/components/ui/input";
import { useUnitSystem } from "@/contexts/UnitSystemContext";
import { getUnit, convertValue, getReferenceRange } from "@/lib/unit-conversions";
import { Info } from "lucide-react";
import { useState, useEffect } from "react";

interface UnitInputProps {
  id: string;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  value: number | string;
  onChange: (value: string) => void;
  onBlur: () => void;
  hasError?: boolean;
  isTouched?: boolean;
  isValid?: boolean;
  inputId: string;
  descriptionId?: string;
  errorId?: string;
  parameter?: string; // e.g., "creatinine", "bilirubin" - for unit conversion
}

export function UnitInput({
  id,
  label,
  description,
  min,
  max,
  value,
  onChange,
  onBlur,
  hasError,
  isTouched,
  isValid,
  inputId,
  descriptionId,
  errorId,
  parameter,
}: UnitInputProps) {
  const { unitSystem } = useUnitSystem();
  const [displayValue, setDisplayValue] = useState<string>(value?.toString() || "");

  // Check if this parameter has unit conversion support
  const hasUnitConversion = parameter && getUnit(parameter, unitSystem);
  const unit = hasUnitConversion ? getUnit(parameter, unitSystem) : "";
  const referenceRange = hasUnitConversion ? getReferenceRange(parameter, unitSystem) : "";

  // Update display value when unit system changes
  useEffect(() => {
    if (!hasUnitConversion || !value) return;

    const numValue = parseFloat(value.toString());
    if (isNaN(numValue)) return;

    // Convert from American (internal storage) to current display unit
    const converted = convertValue(numValue, parameter, "american", unitSystem);
    setDisplayValue(converted.toFixed(2));
  }, [unitSystem, hasUnitConversion, parameter]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    if (!hasUnitConversion) {
      // No conversion needed
      onChange(inputValue);
      return;
    }

    // Convert from display unit to American (internal storage)
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const converted = convertValue(numValue, parameter, unitSystem, "american");
      onChange(converted.toString());
    } else {
      onChange(inputValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type="number"
          id={inputId}
          min={min}
          max={max}
          value={displayValue}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={`${min || 0} - ${max || "∞"}`}
          aria-describedby={
            [description ? descriptionId : null, hasError && isTouched ? errorId : null]
              .filter(Boolean)
              .join(" ") || undefined
          }
          aria-invalid={hasError && isTouched ? "true" : undefined}
          aria-required="true"
          className={`h-11 w-full text-base pr-20 ${
            hasError && isTouched
              ? "border-red-500 focus:ring-red-500"
              : isValid
                ? "border-green-500 focus:ring-green-500"
                : ""
          }`}
        />
        {unit && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500 pointer-events-none">
            {unit}
          </div>
        )}
      </div>
      {referenceRange && (
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3" />
          Normal range: {referenceRange}
        </p>
      )}
    </div>
  );
}
