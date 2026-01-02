/**
 * Calculator Engine - Scoring Logic for All Clinical Calculators
 * Implements evidence-based scoring algorithms with risk stratification
 */

export interface CalculationResult {
  score: number;
  maxScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  riskPercentage: number;
  interpretation: string;
  recommendations: string[];
  managementPathway: ManagementStep[];
}

export interface ManagementStep {
  priority: "immediate" | "urgent" | "routine";
  action: string;
  rationale: string;
}

// ============================================================================
// CRITICAL CARE & SEPSIS
// ============================================================================

export function calculateQSOFA(inputs: {
  altered_mentation: boolean;
  respiratory_rate: number;
  systolic_bp: number;
}): CalculationResult {
  let score = 0;
  if (inputs.altered_mentation) score += 1;
  if (inputs.respiratory_rate >= 22) score += 1;
  if (inputs.systolic_bp < 100) score += 1;

  const riskLevel = score >= 2 ? "high" : "low";
  const riskPercentage = score >= 2 ? 80 : 10;

  return {
    score,
    maxScore: 3,
    riskLevel,
    riskPercentage,
    interpretation:
      score >= 2
        ? "HIGH RISK: Patient meets criteria for sepsis. Immediate ICU evaluation recommended."
        : "LOW RISK: Sepsis unlikely based on qSOFA criteria. Continue standard monitoring.",
    recommendations: [
      score >= 2 ? "✓ Activate sepsis protocol immediately" : "✓ Continue routine monitoring",
      score >= 2 ? "✓ Obtain blood cultures before antibiotics" : "✓ Reassess if clinical deterioration",
      score >= 2 ? "✓ Initiate broad-spectrum antibiotics within 1 hour" : "✓ Monitor vital signs q4h",
      score >= 2 ? "✓ Arrange ICU bed" : "✓ Consider repeat qSOFA in 6-12 hours",
    ],
    managementPathway: [
      {
        priority: score >= 2 ? "immediate" : "routine",
        action: score >= 2 ? "Activate sepsis protocol" : "Continue standard care",
        rationale: score >= 2 ? "qSOFA ≥2 predicts 10-fold mortality increase" : "Low risk profile",
      },
      {
        priority: score >= 2 ? "immediate" : "routine",
        action: score >= 2 ? "Blood cultures x2, lactate, CBC, CMP, LFTs" : "Routine labs if indicated",
        rationale: "Identify source and assess organ dysfunction",
      },
      {
        priority: score >= 2 ? "immediate" : "routine",
        action: score >= 2 ? "Empiric antibiotics (within 1 hour)" : "Supportive care",
        rationale: "Each hour delay increases mortality by 7.6%",
      },
    ],
  };
}

export function calculateSOFA(inputs: {
  pao2_fio2: number;
  platelets: number;
  bilirubin: number;
  map: number;
  gcs: number;
  creatinine: number;
}): CalculationResult {
  let score = 0;

  // Respiratory
  if (inputs.pao2_fio2 < 100) score += 4;
  else if (inputs.pao2_fio2 < 200) score += 3;
  else if (inputs.pao2_fio2 < 300) score += 2;
  else if (inputs.pao2_fio2 < 400) score += 1;

  // Coagulation
  if (inputs.platelets < 20) score += 4;
  else if (inputs.platelets < 50) score += 3;
  else if (inputs.platelets < 100) score += 2;
  else if (inputs.platelets < 150) score += 1;

  // Hepatic
  if (inputs.bilirubin >= 12) score += 4;
  else if (inputs.bilirubin >= 6) score += 3;
  else if (inputs.bilirubin >= 2) score += 2;
  else if (inputs.bilirubin >= 1.2) score += 1;

  // Cardiovascular
  if (inputs.map < 70) score += 4;
  else if (inputs.map < 80) score += 3;
  else if (inputs.map < 90) score += 2;
  else if (inputs.map < 100) score += 1;

  // Neurological
  if (inputs.gcs <= 6) score += 4;
  else if (inputs.gcs <= 9) score += 3;
  else if (inputs.gcs <= 12) score += 2;
  else if (inputs.gcs <= 14) score += 1;

  // Renal
  if (inputs.creatinine >= 5) score += 4;
  else if (inputs.creatinine >= 3.5) score += 3;
  else if (inputs.creatinine >= 2) score += 2;
  else if (inputs.creatinine >= 1.2) score += 1;

  const riskLevel = score >= 11 ? "critical" : score >= 8 ? "high" : score >= 5 ? "medium" : "low";
  const mortalityRates: Record<string, number> = {
    critical: 95,
    high: 60,
    medium: 25,
    low: 5,
  };

  return {
    score,
    maxScore: 24,
    riskLevel,
    riskPercentage: mortalityRates[riskLevel],
    interpretation: `SOFA Score: ${score}/24 - ${riskLevel.toUpperCase()} RISK (${mortalityRates[riskLevel]}% ICU mortality)`,
    recommendations: [
      `✓ Predicted ICU mortality: ${mortalityRates[riskLevel]}%`,
      "✓ Assess for organ dysfunction",
      "✓ Consider ICU admission if score ≥8",
      "✓ Repeat SOFA daily for trend assessment",
    ],
    managementPathway: [
      {
        priority: score >= 11 ? "immediate" : "urgent",
        action: "ICU admission and continuous monitoring",
        rationale: `SOFA ${score} predicts ${mortalityRates[riskLevel]}% mortality`,
      },
      {
        priority: "urgent",
        action: "Identify and treat organ dysfunction",
        rationale: "Each organ system failure increases mortality exponentially",
      },
    ],
  };
}

export function calculateAPACHE(inputs: {
  temperature: number;
  heart_rate: number;
  respiratory_rate_apache: number;
  systolic_apache: number;
  age_apache: number;
}): CalculationResult {
  let score = 0;

  // Temperature
  if (inputs.temperature >= 41 || inputs.temperature <= 29.9) score += 4;
  else if (inputs.temperature >= 39 || inputs.temperature <= 32) score += 3;
  else if (inputs.temperature >= 38.5 || inputs.temperature <= 32.1) score += 1;

  // Heart Rate
  if (inputs.heart_rate >= 180 || inputs.heart_rate <= 39) score += 4;
  else if (inputs.heart_rate >= 140 || inputs.heart_rate <= 54) score += 3;
  else if (inputs.heart_rate >= 110 || inputs.heart_rate <= 69) score += 1;

  // Respiratory Rate
  if (inputs.respiratory_rate_apache >= 50 || inputs.respiratory_rate_apache <= 5) score += 4;
  else if (inputs.respiratory_rate_apache >= 35 || inputs.respiratory_rate_apache <= 9) score += 3;
  else if (inputs.respiratory_rate_apache >= 25 || inputs.respiratory_rate_apache <= 11) score += 1;

  // Systolic BP
  if (inputs.systolic_apache >= 180 || inputs.systolic_apache <= 49) score += 4;
  else if (inputs.systolic_apache >= 130 || inputs.systolic_apache <= 69) score += 3;
  else if (inputs.systolic_apache >= 110 || inputs.systolic_apache <= 79) score += 1;

  // Age
  if (inputs.age_apache >= 75) score += 6;
  else if (inputs.age_apache >= 65) score += 5;
  else if (inputs.age_apache >= 55) score += 3;
  else if (inputs.age_apache >= 45) score += 1;

  const riskLevel = score >= 25 ? "critical" : score >= 20 ? "high" : score >= 15 ? "medium" : "low";
  const mortalityRates: Record<string, number> = {
    critical: 85,
    high: 55,
    medium: 25,
    low: 8,
  };

  return {
    score,
    maxScore: 71,
    riskLevel,
    riskPercentage: mortalityRates[riskLevel],
    interpretation: `APACHE II Score: ${score} - ${riskLevel.toUpperCase()} RISK (${mortalityRates[riskLevel]}% predicted mortality)`,
    recommendations: [
      `✓ Predicted ICU mortality: ${mortalityRates[riskLevel]}%`,
      "✓ Daily APACHE II assessment",
      "✓ Intensive monitoring and support",
      "✓ Multidisciplinary team involvement",
    ],
    managementPathway: [
      {
        priority: score >= 25 ? "immediate" : "urgent",
        action: "ICU admission with intensive monitoring",
        rationale: `APACHE II ${score} indicates high severity`,
      },
    ],
  };
}

// ============================================================================
// STROKE & NEUROLOGICAL
// ============================================================================

export function calculateNIHSS(inputs: Record<string, number>): CalculationResult {
  const score = Object.values(inputs).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  let interpretation = "";
  let recommendations: string[] = [];

  if (score === 0) {
    riskLevel = "low";
    interpretation = "No stroke symptoms detected";
    recommendations = ["✓ Continue routine care", "✓ Monitor for symptom development"];
  } else if (score <= 4) {
    riskLevel = "low";
    interpretation = "Minor stroke - Consider thrombolytics if within window";
    recommendations = [
      "✓ Assess thrombolytic eligibility (within 4.5 hours)",
      "✓ Neurology consultation",
      "✓ Intensive monitoring",
    ];
  } else if (score <= 14) {
    riskLevel = "medium";
    interpretation = "Moderate stroke - High thrombolytic benefit";
    recommendations = [
      "✓ Activate stroke protocol",
      "✓ Thrombolytics indicated if within 4.5 hours",
      "✓ ICU admission",
      "✓ Thrombectomy evaluation if within 24 hours",
    ];
  } else if (score <= 20) {
    riskLevel = "high";
    interpretation = "Moderate-to-severe stroke - Consider thrombectomy";
    recommendations = [
      "✓ Activate stroke protocol",
      "✓ Thrombectomy evaluation (if within 24 hours)",
      "✓ ICU admission",
      "✓ Neurology consultation",
    ];
  } else {
    riskLevel = "critical";
    interpretation = "Severe stroke - Highest mortality risk";
    recommendations = [
      "✓ ICU admission",
      "✓ Airway protection consideration",
      "✓ Neurology/neurosurgery consultation",
      "✓ Family discussion regarding prognosis",
    ];
  }

  return {
    score,
    maxScore: 42,
    riskLevel,
    riskPercentage: score >= 20 ? 90 : score >= 14 ? 70 : score >= 5 ? 40 : 10,
    interpretation,
    recommendations,
    managementPathway: [
      {
        priority: score >= 14 ? "immediate" : "urgent",
        action: "Activate stroke protocol",
        rationale: `NIHSS ${score} indicates significant stroke burden`,
      },
      {
        priority: "immediate",
        action: "Stat CT/CTA head",
        rationale: "Differentiate ischemic vs hemorrhagic stroke",
      },
    ],
  };
}

export function calculateCHA2DS2VASc(inputs: Record<string, boolean>): CalculationResult {
  let score = 0;
  if (inputs.chf) score += 1;
  if (inputs.hypertension) score += 1;
  if (inputs.age_75) score += 2;
  if (inputs.diabetes) score += 1;
  if (inputs.stroke_tia) score += 2;
  if (inputs.vascular_disease) score += 1;
  if (inputs.age_65_74) score += 1;
  if (inputs.female) score += 1;

  const strokeRiskRates: Record<number, number> = {
    0: 0,
    1: 1.3,
    2: 2.2,
    3: 3.2,
    4: 4.0,
    5: 6.7,
    6: 9.6,
    7: 15.7,
    8: 15.2,
    9: 17.4,
  };

  const riskPercentage = strokeRiskRates[Math.min(score, 9)] || 17.4;
  const riskLevel = score >= 5 ? "high" : score >= 2 ? "medium" : "low";

  return {
    score,
    maxScore: 9,
    riskLevel,
    riskPercentage,
    interpretation: `CHA₂DS₂-VASc Score: ${score} - Annual stroke risk: ${riskPercentage}%`,
    recommendations: [
      riskLevel === "high"
        ? "✓ Anticoagulation strongly recommended"
        : riskLevel === "medium"
          ? "✓ Anticoagulation recommended"
          : "✓ Anticoagulation may be considered",
      "✓ Assess bleeding risk (HAS-BLED score)",
      "✓ Patient education on AF management",
      "✓ Rate control strategy",
    ],
    managementPathway: [
      {
        priority: riskLevel === "high" ? "urgent" : "routine",
        action: `Anticoagulation decision (${riskPercentage}% annual stroke risk)`,
        rationale: "CHA₂DS₂-VASc predicts stroke risk in AF",
      },
    ],
  };
}

export function calculateGCS(inputs: {
  eye_opening: number;
  verbal_response: number;
  motor_response: number;
}): CalculationResult {
  const score = inputs.eye_opening + inputs.verbal_response + inputs.motor_response;

  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  let interpretation = "";
  let recommendations: string[] = [];

  if (score >= 13) {
    riskLevel = "low";
    interpretation = "Mild head injury - Good prognosis";
    recommendations = ["✓ Observation", "✓ Repeat neuro checks q1h", "✓ Discharge if criteria met"];
  } else if (score >= 9) {
    riskLevel = "medium";
    interpretation = "Moderate head injury - Consider ICU admission";
    recommendations: [
      "✓ ICU admission",
      "✓ CT head if not done",
      "✓ Neuro checks q15-30min",
      "✓ Prepare for possible intubation",
    ];
  } else if (score >= 6) {
    riskLevel = "high";
    interpretation = "Severe head injury - Intubation likely needed";
    recommendations: [
      "✓ ICU admission mandatory",
      "✓ Prepare for intubation",
      "✓ Neurosurgery consultation",
      "✓ ICP monitoring consideration",
    ];
  } else {
    riskLevel = "critical";
    interpretation = "Critical head injury - Immediate intubation required";
    recommendations: [
      "✓ Immediate intubation",
      "✓ ICU admission",
      "✓ Neurosurgery consultation",
      "✓ ICP monitoring",
    ];
  }

  return {
    score,
    maxScore: 15,
    riskLevel,
    riskPercentage: score >= 13 ? 5 : score >= 9 ? 20 : score >= 6 ? 60 : 95,
    interpretation,
    recommendations,
    managementPathway: [
      {
        priority: score <= 8 ? "immediate" : "urgent",
        action: score <= 8 ? "Prepare for intubation" : "ICU admission",
        rationale: `GCS ${score} indicates severe neurological injury`,
      },
    ],
  };
}

// ============================================================================
// CARDIOVASCULAR
// ============================================================================

export function calculateHEART(inputs: {
  history: number;
  ecg: number;
  age_heart: number;
  risk_factors: number;
  troponin: number;
}): CalculationResult {
  let score = inputs.history + inputs.ecg + inputs.troponin + inputs.risk_factors;

  // Age scoring
  if (inputs.age_heart < 45) score += 0;
  else if (inputs.age_heart < 65) score += 1;
  else score += 2;

  const riskLevel = score <= 3 ? "low" : score <= 6 ? "medium" : "high";
  const maceRates: Record<string, number> = {
    low: 1.7,
    medium: 20.3,
    high: 72.7,
  };

  return {
    score,
    maxScore: 10,
    riskLevel,
    riskPercentage: maceRates[riskLevel],
    interpretation: `HEART Score: ${score} - ${riskLevel.toUpperCase()} RISK (${maceRates[riskLevel]}% 6-week MACE)`,
    recommendations: [
      score <= 3 ? "✓ Low risk - Safe for discharge" : "✓ Admission recommended",
      score <= 3 ? "✓ Outpatient follow-up in 24-72 hours" : "✓ Continuous cardiac monitoring",
      "✓ Serial troponins if indicated",
      "✓ Stress testing or coronary imaging as needed",
    ],
    managementPathway: [
      {
        priority: score >= 7 ? "immediate" : score >= 4 ? "urgent" : "routine",
        action: score <= 3 ? "Discharge with outpatient follow-up" : "Admission and monitoring",
        rationale: `HEART ${score} predicts ${maceRates[riskLevel]}% MACE risk`,
      },
    ],
  };
}

// ============================================================================
// RESPIRATORY
// ============================================================================

export function calculateCURB65(inputs: Record<string, boolean>): CalculationResult {
  let score = 0;
  if (inputs.confusion) score += 1;
  if (inputs.urea) score += 1;
  if (inputs.respiratory_rate_curb) score += 1;
  if (inputs.blood_pressure_curb) score += 1;
  if (inputs.age_65_curb) score += 1;

  const mortalityRates: Record<number, number> = {
    0: 0.7,
    1: 3.2,
    2: 13.0,
    3: 17.0,
    4: 41.5,
    5: 57.0,
  };

  const riskLevel = score === 0 ? "low" : score <= 2 ? "medium" : "high";

  return {
    score,
    maxScore: 5,
    riskLevel,
    riskPercentage: mortalityRates[score],
    interpretation: `CURB-65 Score: ${score} - ${riskLevel.toUpperCase()} RISK (${mortalityRates[score]}% 30-day mortality)`,
    recommendations: [
      score === 0
        ? "✓ Outpatient management possible"
        : score <= 2
          ? "✓ Hospital admission recommended"
          : "✓ ICU admission strongly recommended",
      "✓ Empiric antibiotics based on local resistance",
      "✓ Oxygen to maintain SpO2 >90%",
      "✓ Supportive care",
    ],
    managementPathway: [
      {
        priority: score >= 3 ? "immediate" : score >= 1 ? "urgent" : "routine",
        action:
          score === 0
            ? "Outpatient management"
            : score <= 2
              ? "Hospital admission"
              : "ICU admission",
        rationale: `CURB-65 ${score} predicts ${mortalityRates[score]}% mortality`,
      },
    ],
  };
}

// ============================================================================
// RENAL
// ============================================================================

export function calculateCrCl(inputs: {
  age_crcl: number;
  weight_crcl: number;
  creatinine_crcl: number;
  gender_crcl: "male" | "female";
}): CalculationResult {
  // Cockcroft-Gault equation
  let crcl =
    ((140 - inputs.age_crcl) * inputs.weight_crcl) / (72 * inputs.creatinine_crcl);
  if (inputs.gender_crcl === "female") crcl *= 0.85;

  const riskLevel: "low" | "medium" | "high" | "critical" = crcl >= 90 ? "low" : crcl >= 60 ? "medium" : crcl >= 30 ? "high" : "critical";
  const ckcStage: string =
    crcl >= 90
      ? "Stage 1 (Normal)"
      : crcl >= 60
        ? "Stage 2 (Mild)"
        : crcl >= 30
          ? "Stage 3 (Moderate)"
          : "Stage 4 (Severe)";

  return {
    score: Math.round(crcl),
    maxScore: 120,
    riskLevel,
    riskPercentage: crcl >= 90 ? 0 : crcl >= 60 ? 10 : crcl >= 30 ? 50 : 90,
    interpretation: `Creatinine Clearance: ${Math.round(crcl)} mL/min - ${ckcStage}`,
    recommendations: [
      `✓ CKD Stage: ${ckcStage}`,
      "✓ Adjust medication doses accordingly",
      "✓ Monitor renal function regularly",
      crcl < 30 ? "✓ Consider nephrology referral" : "✓ Routine monitoring",
    ],
    managementPathway: [
      {
        priority: crcl < 30 ? "urgent" : "routine",
        action: `Medication dosing adjustment (CrCl ${Math.round(crcl)})`,
        rationale: "Prevent drug accumulation and toxicity",
      },
    ],
  };
}

// ============================================================================
// HEPATIC
// ============================================================================

export function calculateMELD(inputs: {
  inr: number;
  bilirubin_meld: number;
  creatinine_meld: number;
}): CalculationResult {
  // MELD formula
  const meld =
    3.78 * Math.log(inputs.inr) +
    11.2 * Math.log(inputs.bilirubin_meld) +
    9.57 * Math.log(inputs.creatinine_meld) -
    6.43;

  const score = Math.min(Math.max(Math.round(meld), 6), 40);

  const mortalityRates: Record<string, number> = {
    low: 2,
    medium: 10,
    high: 40,
    critical: 80,
  };

  const riskLevel: "low" | "medium" | "high" | "critical" = score < 10 ? "low" : score < 20 ? "medium" : score < 30 ? "high" : "critical";

  return {
    score,
    maxScore: 40,
    riskLevel,
    riskPercentage: mortalityRates[riskLevel],
    interpretation: `MELD Score: ${score} - ${riskLevel.toUpperCase()} RISK (${mortalityRates[riskLevel]}% 3-month mortality)`,
    recommendations: [
      `✓ Predicted 3-month mortality: ${mortalityRates[riskLevel]}%`,
      score >= 20 ? "✓ Liver transplant evaluation recommended" : "✓ Medical management",
      "✓ Avoid hepatotoxic medications",
      "✓ Monitor for complications",
    ],
    managementPathway: [
      {
        priority: score >= 30 ? "immediate" : score >= 20 ? "urgent" : "routine",
        action: score >= 20 ? "Transplant evaluation" : "Medical management",
        rationale: `MELD ${score} predicts ${mortalityRates[riskLevel]}% mortality`,
      },
    ],
  };
}

// Generic calculator for simple scoring
export function calculateGenericScore(inputs: Record<string, boolean | number>): CalculationResult {
  const score: number = Object.values(inputs).reduce((sum: number, val: boolean | number) => {
    if (typeof val === "boolean") return sum + (val ? 1 : 0);
    if (typeof val === "number") return sum + (val as number);
    return sum;
  }, 0);

  const riskLevel: "low" | "medium" | "high" = score === 0 ? "low" : score <= 2 ? "medium" : "high";

  return {
    score: score as number,
    maxScore: 10,
    riskLevel,
    riskPercentage: score === 0 ? 5 : score <= 2 ? 25 : 75,
    interpretation: `Score: ${score} - ${riskLevel.toUpperCase()} RISK`,
    recommendations: ["✓ Clinical assessment required", "✓ Specialist consultation if indicated"],
    managementPathway: [
      {
        priority: riskLevel === "high" ? "urgent" : "routine",
        action: "Risk-based management",
        rationale: "Score-based risk stratification",
      },
    ],
  };
}
