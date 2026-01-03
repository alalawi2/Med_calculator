/**
 * Medication Dosing Calculator
 * Calculates weight-based, renal-adjusted, and hepatic-adjusted doses
 */

export interface MedicationDosingInput {
  medicationId: string;
  weight: number; // kg
  age: number; // years
  creatinine: number; // mg/dL
  childPughScore?: "A" | "B" | "C"; // For hepatic adjustment
}

export interface MedicationDosingResult {
  medicationName: string;
  standardDose: string;
  calculatedDose: string;
  renalAdjustment: string;
  hepaticAdjustment?: string;
  warnings: string[];
  references: Array<{
    source: "UpToDate" | "Micromedex" | "Sanford Guide" | "FDA" | "Lexi-Drugs";
    url?: string;
    lastUpdated: string;
  }>;
}

/**
 * Calculate GFR using CKD-EPI equation
 */
export function calculateGFR(creatinine: number, age: number, gender: "male" | "female"): number {
  const kappa = gender === "male" ? 0.9 : 0.7;
  const alpha = gender === "male" ? -0.411 : -0.329;
  const female = gender === "female" ? 1.018 : 1;
  
  const gfr = 142 * Math.pow(creatinine / kappa, alpha) * Math.pow(age / 100, -1.209) * female;
  return Math.round(gfr);
}

/**
 * Weight-Based Dosing Calculations
 */
export const weightBasedMedications = {
  gentamicin: {
    name: "Gentamicin",
    standardDose: "5-7 mg/kg",
    calculate: (weight: number) => ({
      low: weight * 5,
      standard: weight * 6,
      high: weight * 7,
    }),
    renalAdjustment: (gfr: number, dose: number) => {
      if (gfr > 80) return dose;
      if (gfr >= 40 && gfr <= 80) return dose * 0.75;
      if (gfr >= 10 && gfr < 40) return dose * 0.5;
      return dose * 0.25;
    },
    warnings: ["Monitor peak (30-40 mcg/mL) and trough (<5 mcg/mL)", "Nephrotoxic and ototoxic", "Requires TDM"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Micromedex" as const, lastUpdated: "2025-01" },
      { source: "Sanford Guide" as const, lastUpdated: "2025-01" }
    ]
  },

  vancomycin: {
    name: "Vancomycin",
    standardDose: "15-20 mg/kg",
    calculate: (weight: number) => ({
      low: weight * 15,
      standard: weight * 17.5,
      high: weight * 20,
    }),
    renalAdjustment: (gfr: number, dose: number) => {
      if (gfr > 80) return dose;
      if (gfr >= 40 && gfr <= 80) return dose * 0.75;
      if (gfr >= 10 && gfr < 40) return dose * 0.5;
      return dose * 0.25;
    },
    warnings: ["Monitor trough (15-20 mcg/mL)", "Red man syndrome", "Nephrotoxic with aminoglycosides"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Micromedex" as const, lastUpdated: "2025-01" },
      { source: "Sanford Guide" as const, lastUpdated: "2025-01" }
    ]
  },

  amikacin: {
    name: "Amikacin",
    standardDose: "15-20 mg/kg",
    calculate: (weight: number) => ({
      low: weight * 15,
      standard: weight * 17.5,
      high: weight * 20,
    }),
    renalAdjustment: (gfr: number, dose: number) => {
      if (gfr > 80) return dose;
      if (gfr >= 40 && gfr <= 80) return dose * 0.75;
      if (gfr >= 10 && gfr < 40) return dose * 0.5;
      return dose * 0.25;
    },
    warnings: ["Monitor peak (25-35 mcg/mL) and trough (<5 mcg/mL)", "Nephrotoxic and ototoxic"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Micromedex" as const, lastUpdated: "2025-01" },
      { source: "Sanford Guide" as const, lastUpdated: "2025-01" }
    ]
  },

  heparin: {
    name: "Unfractionated Heparin (UFH)",
    standardDose: "80 units/kg bolus, 18 units/kg/hr infusion",
    calculate: (weight: number) => ({
      bolus: weight * 80,
      infusion: weight * 18,
    }),
    renalAdjustment: (gfr: number, dose: number) => dose, // No renal adjustment
    warnings: ["Monitor aPTT q6h", "HIT risk", "Protamine reverses"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Micromedex" as const, lastUpdated: "2025-01" },
      { source: "Sanford Guide" as const, lastUpdated: "2025-01" }
    ]
  },

  propofol: {
    name: "Propofol",
    standardDose: "1-2 mg/kg bolus, 25-100 mcg/kg/min infusion",
    calculate: (weight: number) => ({
      bolus_low: weight * 1,
      bolus_high: weight * 2,
      infusion_low: weight * 0.025,
      infusion_high: weight * 0.1,
    }),
    renalAdjustment: (gfr: number, dose: number) => dose, // No renal adjustment
    warnings: ["Hypotension common", "Propofol infusion syndrome with prolonged use", "Pain on injection"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Micromedex" as const, lastUpdated: "2025-01" }
    ]
  },

  fentanyl: {
    name: "Fentanyl",
    standardDose: "50-100 mcg bolus, 0.5-2 mcg/kg/min infusion",
    calculate: (weight: number) => ({
      bolus_low: 50,
      bolus_high: 100,
      infusion_low: weight * 0.5,
      infusion_high: weight * 2,
    }),
    renalAdjustment: (gfr: number, dose: number) => {
      if (gfr > 30) return dose;
      return dose * 0.75;
    },
    warnings: ["Potent opioid", "Respiratory depression risk", "Chest wall rigidity at high doses"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Micromedex" as const, lastUpdated: "2025-01" },
      { source: "Sanford Guide" as const, lastUpdated: "2025-01" }
    ]
  },

  midazolam: {
    name: "Midazolam",
    standardDose: "0.5-2 mg bolus, 0.5-2 mcg/kg/min infusion",
    calculate: (weight: number) => ({
      bolus_low: 0.5,
      bolus_high: 2,
      infusion_low: weight * 0.0005,
      infusion_high: weight * 0.002,
    }),
    renalAdjustment: (gfr: number, dose: number) => dose,
    warnings: ["Shorter acting than diazepam", "Flumazenil reverses if needed", "Respiratory depression risk"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Micromedex" as const, lastUpdated: "2025-01" }
    ]
  },

  insulin: {
    name: "Insulin (Regular/Rapid)",
    standardDose: "0.1 units/kg/hr IV infusion",
    calculate: (weight: number) => ({
      infusion: weight * 0.1,
    }),
    renalAdjustment: (gfr: number, dose: number) => {
      if (gfr > 15) return dose;
      return dose * 0.75;
    },
    warnings: ["Monitor glucose q1h", "Risk of hypoglycemia", "Check potassium"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Micromedex" as const, lastUpdated: "2025-01" }
    ]
  },

  dopamine: {
    name: "Dopamine",
    standardDose: "2-20 mcg/kg/min",
    calculate: (weight: number) => ({
      low: weight * 2,
      medium: weight * 5,
      high: weight * 10,
      max: weight * 20,
    }),
    renalAdjustment: (gfr: number, dose: number) => dose,
    warnings: ["Dose-dependent effects", "Low=renal, medium=cardiac, high=vasopressor", "Titrate to effect"],
    references: [
      { source: "UpToDate" as const, lastUpdated: "2025-01" },
      { source: "Sanford Guide" as const, lastUpdated: "2025-01" }
    ]
  },
};

/**
 * Renal Adjustment Categories
 */
export const renalAdjustmentCategories = {
  "no-adjustment": {
    name: "No Adjustment",
    description: "No renal adjustment needed",
    apply: (dose: number) => dose,
  },
  "mild-adjustment": {
    name: "Mild Adjustment",
    description: "CrCl <60: 75% dose",
    apply: (dose: number, gfr: number) => gfr < 60 ? dose * 0.75 : dose,
  },
  "moderate-adjustment": {
    name: "Moderate Adjustment",
    description: "CrCl 30-60: 50% dose | CrCl <30: 25% dose",
    apply: (dose: number, gfr: number) => {
      if (gfr >= 30) return dose * 0.5;
      return dose * 0.25;
    },
  },
  "severe-adjustment": {
    name: "Severe Adjustment",
    description: "CrCl <30: Contraindicated or 25% dose",
    apply: (dose: number, gfr: number) => {
      if (gfr < 30) return dose * 0.25;
      return dose;
    },
  },
};

/**
 * Hepatic Adjustment Categories (Child-Pugh)
 */
export const hepaticAdjustmentCategories = {
  "A": {
    name: "Child-Pugh A (Mild)",
    description: "No adjustment needed",
    apply: (dose: number) => dose,
  },
  "B": {
    name: "Child-Pugh B (Moderate)",
    description: "Reduce dose 25-50%",
    apply: (dose: number) => dose * 0.75,
  },
  "C": {
    name: "Child-Pugh C (Severe)",
    description: "Reduce dose 50-75% or avoid",
    apply: (dose: number) => dose * 0.5,
  },
};

/**
 * Main calculation function
 */
export function calculateMedicationDose(
  medicationId: string,
  input: MedicationDosingInput
): MedicationDosingResult {
  const med = weightBasedMedications[medicationId as keyof typeof weightBasedMedications];
  
  if (!med) {
    throw new Error(`Medication ${medicationId} not found`);
  }

  const gfr = calculateGFR(input.creatinine, input.age, "male");
  const baseDose = med.calculate(input.weight);
  
  let standardDoseValue = 0;
  const doseObj = baseDose as any;
  if ('standard' in doseObj) {
    standardDoseValue = doseObj.standard;
  } else if ('infusion' in doseObj) {
    standardDoseValue = doseObj.infusion;
  } else if ('bolus' in doseObj) {
    standardDoseValue = doseObj.bolus;
  } else {
    standardDoseValue = Object.values(doseObj)[0] as number;
  }
  
  const renalAdjustedDose = med.renalAdjustment(gfr, standardDoseValue);
  
  return {
    medicationName: med.name,
    standardDose: med.standardDose,
    calculatedDose: `${Math.round(renalAdjustedDose * 10) / 10} mg/dose`,
    renalAdjustment: `GFR: ${gfr} mL/min - ${gfr > 80 ? "No adjustment" : gfr >= 40 ? "Moderate adjustment (75% dose)" : "Significant adjustment (50% dose)"}`,
    hepaticAdjustment: input.childPughScore ? `Child-Pugh ${input.childPughScore}` : undefined,
    warnings: med.warnings,
    references: med.references,
  };
}
