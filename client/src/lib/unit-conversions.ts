/**
 * Unit Conversion System for Clinical Calculators
 * Supports conversion between American/Conventional and International (SI) units
 */

export type UnitSystem = "american" | "si";

export interface UnitConversion {
  american: string;
  si: string;
  toSI: (value: number) => number;
  toAmerican: (value: number) => number;
}

/**
 * Unit conversion mappings for common lab values
 */
export const unitConversions: Record<string, UnitConversion> = {
  creatinine: {
    american: "mg/dL",
    si: "μmol/L",
    toSI: (mg_dL) => mg_dL * 88.4, // 1 mg/dL = 88.4 μmol/L
    toAmerican: (umol_L) => umol_L / 88.4,
  },
  bilirubin: {
    american: "mg/dL",
    si: "μmol/L",
    toSI: (mg_dL) => mg_dL * 17.1, // 1 mg/dL = 17.1 μmol/L
    toAmerican: (umol_L) => umol_L / 17.1,
  },
  glucose: {
    american: "mg/dL",
    si: "mmol/L",
    toSI: (mg_dL) => mg_dL / 18.0, // 1 mg/dL = 0.0555 mmol/L
    toAmerican: (mmol_L) => mmol_L * 18.0,
  },
  sodium: {
    american: "mEq/L",
    si: "mmol/L",
    toSI: (mEq_L) => mEq_L, // Same value, different notation
    toAmerican: (mmol_L) => mmol_L,
  },
  potassium: {
    american: "mEq/L",
    si: "mmol/L",
    toSI: (mEq_L) => mEq_L, // Same value, different notation
    toAmerican: (mmol_L) => mmol_L,
  },
  hemoglobin: {
    american: "g/dL",
    si: "g/L",
    toSI: (g_dL) => g_dL * 10, // 1 g/dL = 10 g/L
    toAmerican: (g_L) => g_L / 10,
  },
  platelets: {
    american: "×10³/μL",
    si: "×10⁹/L",
    toSI: (k_uL) => k_uL, // Same value, different notation
    toAmerican: (b_L) => b_L,
  },
  albumin: {
    american: "g/dL",
    si: "g/L",
    toSI: (g_dL) => g_dL * 10, // 1 g/dL = 10 g/L
    toAmerican: (g_L) => g_L / 10,
  },
  bun: {
    american: "mg/dL",
    si: "mmol/L",
    toSI: (mg_dL) => mg_dL / 2.8, // 1 mg/dL = 0.357 mmol/L
    toAmerican: (mmol_L) => mmol_L * 2.8,
  },
  calcium: {
    american: "mg/dL",
    si: "mmol/L",
    toSI: (mg_dL) => mg_dL / 4.0, // 1 mg/dL = 0.25 mmol/L
    toAmerican: (mmol_L) => mmol_L * 4.0,
  },
  wbc: {
    american: "×10³/μL",
    si: "×10⁹/L",
    toSI: (k_uL) => k_uL, // Same value, different notation
    toAmerican: (b_L) => b_L,
  },
  lactate: {
    american: "mg/dL",
    si: "mmol/L",
    toSI: (mg_dL) => mg_dL / 9.0, // 1 mg/dL = 0.111 mmol/L
    toAmerican: (mmol_L) => mmol_L * 9.0,
  },
};

/**
 * Convert a value from one unit system to another
 */
export function convertValue(
  value: number,
  parameter: string,
  fromSystem: UnitSystem,
  toSystem: UnitSystem
): number {
  if (fromSystem === toSystem) return value;
  
  const conversion = unitConversions[parameter];
  if (!conversion) return value; // No conversion available
  
  if (fromSystem === "american" && toSystem === "si") {
    return conversion.toSI(value);
  } else if (fromSystem === "si" && toSystem === "american") {
    return conversion.toAmerican(value);
  }
  
  return value;
}

/**
 * Get the unit string for a parameter in a given system
 */
export function getUnit(parameter: string, system: UnitSystem): string {
  const conversion = unitConversions[parameter];
  if (!conversion) return "";
  
  return system === "american" ? conversion.american : conversion.si;
}

/**
 * Format a value with appropriate precision based on the parameter
 */
export function formatValue(value: number, parameter: string): string {
  // Define precision for different parameters
  const precision: Record<string, number> = {
    creatinine: 2,
    bilirubin: 2,
    glucose: 1,
    sodium: 0,
    potassium: 1,
    hemoglobin: 1,
    platelets: 0,
    albumin: 1,
    bun: 1,
    calcium: 1,
    wbc: 1,
    lactate: 1,
  };
  
  const decimals = precision[parameter] ?? 2;
  return value.toFixed(decimals);
}

/**
 * Get reference ranges for a parameter in a given unit system
 */
export function getReferenceRange(parameter: string, system: UnitSystem): string {
  const ranges: Record<string, { american: string; si: string }> = {
    creatinine: {
      american: "0.7-1.3 mg/dL",
      si: "62-115 μmol/L",
    },
    bilirubin: {
      american: "0.1-1.2 mg/dL",
      si: "2-21 μmol/L",
    },
    glucose: {
      american: "70-100 mg/dL",
      si: "3.9-5.6 mmol/L",
    },
    sodium: {
      american: "135-145 mEq/L",
      si: "135-145 mmol/L",
    },
    potassium: {
      american: "3.5-5.0 mEq/L",
      si: "3.5-5.0 mmol/L",
    },
    hemoglobin: {
      american: "12-16 g/dL",
      si: "120-160 g/L",
    },
    platelets: {
      american: "150-400 ×10³/μL",
      si: "150-400 ×10⁹/L",
    },
    albumin: {
      american: "3.5-5.5 g/dL",
      si: "35-55 g/L",
    },
    bun: {
      american: "7-20 mg/dL",
      si: "2.5-7.1 mmol/L",
    },
    calcium: {
      american: "8.5-10.5 mg/dL",
      si: "2.1-2.6 mmol/L",
    },
    wbc: {
      american: "4-11 ×10³/μL",
      si: "4-11 ×10⁹/L",
    },
    lactate: {
      american: "4.5-19.8 mg/dL",
      si: "0.5-2.2 mmol/L",
    },
  };
  
  const range = ranges[parameter];
  if (!range) return "";
  
  return system === "american" ? range.american : range.si;
}
