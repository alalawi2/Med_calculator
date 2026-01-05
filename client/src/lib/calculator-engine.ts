/**
 * Calculator Engine - Scoring Logic for All Clinical Calculators
 * Implements evidence-based scoring algorithms with risk stratification
 */

export interface CalculationResult {
  score: number;
  maxScore: number;
  riskLevel: "low" | "moderate" | "high" | "critical";
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

  const riskLevel = score >= 11 ? "critical" : score >= 8 ? "high" : score >= 5 ? "moderate" : "low";
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

  const riskLevel = score >= 25 ? "critical" : score >= 20 ? "high" : score >= 15 ? "moderate" : "low";
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

  let riskLevel: "low" | "moderate" | "high" | "critical" = "low";
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
    riskLevel = "moderate";
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
  const riskLevel = score >= 5 ? "high" : score >= 2 ? "moderate" : "low";

  return {
    score,
    maxScore: 9,
    riskLevel,
    riskPercentage,
    interpretation: `CHA₂DS₂-VASc Score: ${score} - Annual stroke risk: ${riskPercentage}%`,
    recommendations: [
      riskLevel === "high"
        ? "✓ Anticoagulation strongly recommended"
        : riskLevel === "moderate"
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

  let riskLevel: "low" | "moderate" | "high" | "critical" = "low";
  let interpretation = "";
  let recommendations: string[] = [];

  if (score >= 13) {
    riskLevel = "low";
    interpretation = "Mild head injury - Good prognosis";
    recommendations = ["✓ Observation", "✓ Repeat neuro checks q1h", "✓ Discharge if criteria met"];
  } else if (score >= 9) {
    riskLevel = "moderate";
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

  const riskLevel = score <= 3 ? "low" : score <= 6 ? "moderate" : "high";
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

  const riskLevel = score === 0 ? "low" : score <= 2 ? "moderate" : "high";

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

  const riskLevel: "low" | "moderate" | "high" | "critical" = crcl >= 90 ? "low" : crcl >= 60 ? "moderate" : crcl >= 30 ? "high" : "critical";
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

  const riskLevel: "low" | "moderate" | "high" | "critical" = score < 10 ? "low" : score < 20 ? "moderate" : score < 30 ? "high" : "critical";

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

// ============================================================================
// PERIOPERATIVE & ANESTHESIOLOGY
// ============================================================================

export function calculateASA(inputs: { asa_class: string; emergency: boolean }): CalculationResult {
  const classMap: Record<string, number> = {
    "I - Healthy patient": 1,
    "II - Mild systemic disease": 2,
    "III - Severe systemic disease": 3,
    "IV - Severe disease that is constant threat to life": 4,
    "V - Moribund patient not expected to survive without surgery": 5,
    "VI - Brain-dead patient for organ donation": 6,
  };

  const score = classMap[inputs.asa_class] || 1;
  const emergency = inputs.emergency;

  const mortalityRates: Record<number, number> = {
    1: 0.05,
    2: 0.3,
    3: 1.8,
    4: 7.8,
    5: 9.4,
    6: 0,
  };

  const riskLevel: "low" | "moderate" | "high" | "critical" =
    score === 1 ? "low" : score === 2 ? "low" : score === 3 ? "moderate" : "high";

  return {
    score,
    maxScore: 6,
    riskLevel,
    riskPercentage: mortalityRates[score] * (emergency ? 2 : 1),
    interpretation: `ASA Class ${score}${emergency ? "E" : ""} - ${
      score === 1
        ? "Normal healthy patient"
        : score === 2
          ? "Mild systemic disease"
          : score === 3
            ? "Severe systemic disease"
            : score === 4
              ? "Constant threat to life"
              : score === 5
                ? "Moribund patient"
                : "Brain death"
    }`,
    recommendations: [
      score >= 4
        ? "✓ High-risk surgery - intensive monitoring required"
        : score >= 3
          ? "✓ Consider ICU postoperatively"
          : "✓ Standard perioperative care",
      emergency ? "✓ Emergency procedure increases risk 2-fold" : "✓ Elective procedure",
      "✓ Optimize medical conditions preoperatively if time permits",
      score >= 3 ? "✓ Cardiology/medicine consultation recommended" : "✓ Standard surgical clearance",
    ],
    managementPathway: [
      {
        priority: score >= 4 ? "immediate" : "urgent",
        action: `ASA ${score}${emergency ? "E" : ""} perioperative management`,
        rationale: `Mortality risk ${(mortalityRates[score] * (emergency ? 2 : 1)).toFixed(1)}%`,
      },
    ],
  };
}

export function calculateRCRI(inputs: Record<string, boolean>): CalculationResult {
  let score = 0;
  if (inputs.high_risk_surgery) score += 1;
  if (inputs.ischemic_heart_disease) score += 1;
  if (inputs.heart_failure) score += 1;
  if (inputs.cerebrovascular_disease) score += 1;
  if (inputs.diabetes_insulin) score += 1;
  if (inputs.renal_insufficiency) score += 1;

  const cardiacRiskRates: Record<number, number> = {
    0: 0.4,
    1: 0.9,
    2: 6.6,
    3: 11.0,
  };

  const riskPercentage = score >= 3 ? 11.0 : cardiacRiskRates[score];
  const riskLevel: "low" | "moderate" | "high" =
    score === 0 ? "low" : score === 1 ? "low" : score === 2 ? "moderate" : "high";

  return {
    score,
    maxScore: 6,
    riskLevel,
    riskPercentage,
    interpretation: `RCRI Score: ${score} - ${riskPercentage}% risk of major cardiac complications (MI, cardiac arrest, death)`,
    recommendations: [
      score === 0
        ? "✓ Very low risk - proceed with surgery"
        : score === 1
          ? "✓ Low risk - routine perioperative care"
          : score === 2
            ? "✓ Intermediate risk - consider stress testing or cardiology consultation"
            : "✓ High risk - cardiology evaluation recommended",
      score >= 2 ? "✓ Consider beta-blocker therapy if indicated" : "✓ Standard perioperative medications",
      score >= 2 ? "✓ Intensive cardiac monitoring postoperatively" : "✓ Routine monitoring",
      "✓ Optimize medical management before elective surgery",
    ],
    managementPathway: [
      {
        priority: score >= 3 ? "urgent" : "routine",
        action: score >= 2 ? "Cardiology consultation" : "Standard perioperative care",
        rationale: `${riskPercentage}% cardiac complication risk`,
      },
    ],
  };
}

export function calculateCaprini(inputs: Record<string, any>): CalculationResult {
  let score = 0;

  // Age scoring
  const ageMap: Record<string, number> = {
    "<41 years": 0,
    "41-60 years": 1,
    "61-74 years": 2,
    "≥75 years": 3,
  };
  score += ageMap[inputs.age] || 0;

  // Surgery scoring
  if (inputs.minor_surgery) score += 1;
  if (inputs.major_surgery) score += 2;

  // Other risk factors (1 point each)
  if (inputs.bmi) score += 1;
  if (inputs.varicose_veins) score += 1;
  if (inputs.immobility) score += 2;

  // Major risk factors
  if (inputs.current_cancer) score += 2;
  if (inputs.previous_vte) score += 3;
  if (inputs.thrombophilia) score += 3;

  const riskLevel: "low" | "moderate" | "high" | "critical" =
    score <= 2 ? "low" : score <= 4 ? "moderate" : score <= 6 ? "high" : "critical";

  const vteRiskRates: Record<string, number> = {
    low: 0.5,
    medium: 1.5,
    high: 3.0,
    critical: 10.7,
  };

  return {
    score,
    maxScore: 20,
    riskLevel,
    riskPercentage: vteRiskRates[riskLevel],
    interpretation: `Caprini Score: ${score} - ${riskLevel.toUpperCase()} VTE RISK (${vteRiskRates[riskLevel]}% risk)`,
    recommendations: [
      score <= 2
        ? "✓ Early ambulation recommended"
        : score <= 4
          ? "✓ Mechanical prophylaxis (compression devices)"
          : score <= 6
            ? "✓ Mechanical + pharmacologic prophylaxis (LMWH/heparin)"
            : "✓ Aggressive prophylaxis - LMWH + mechanical devices + extended duration",
      "✓ Risk reassessment daily",
      score >= 5 ? "✓ Consider extended prophylaxis (30 days post-op)" : "✓ Standard duration prophylaxis",
      "✓ Early mobilization when safe",
    ],
    managementPathway: [
      {
        priority: score >= 7 ? "immediate" : "routine",
        action:
          score <= 2
            ? "Ambulation only"
            : score <= 4
              ? "Mechanical prophylaxis"
              : "Pharmacologic + mechanical prophylaxis",
        rationale: `${vteRiskRates[riskLevel]}% VTE risk - Caprini ${score}`,
      },
    ],
  };
}

export function calculatePESI(inputs: Record<string, any>): CalculationResult {
  let score = inputs.age; // Age in years
  if (inputs.male) score += 10;
  if (inputs.cancer) score += 30;
  if (inputs.heart_failure) score += 10;
  if (inputs.chronic_lung_disease) score += 10;
  if (inputs.pulse) score += 20;
  if (inputs.systolic_bp) score += 30;
  if (inputs.respiratory_rate) score += 20;
  if (inputs.temperature) score += 20;
  if (inputs.altered_mental) score += 60;
  if (inputs.oxygen_sat) score += 20;

  const riskClass =
    score < 66
      ? "I (Very Low)"
      : score < 86
        ? "II (Low)"
        : score < 106
          ? "III (Moderate)"
          : score < 126
            ? "IV (High)"
            : "V (Very High)";

  const mortalityRates: Record<string, number> = {
    "I (Very Low)": 0.0,
    "II (Low)": 1.6,
    "III (Moderate)": 3.5,
    "IV (High)": 10.4,
    "V (Very High)": 24.5,
  };

  const riskLevel: "low" | "moderate" | "high" | "critical" =
    score < 86 ? "low" : score < 106 ? "moderate" : score < 126 ? "high" : "critical";

  return {
    score,
    maxScore: 300,
    riskLevel,
    riskPercentage: mortalityRates[riskClass],
    interpretation: `PESI Class ${riskClass} - ${mortalityRates[riskClass]}% 30-day mortality`,
    recommendations: [
      score < 86
        ? "✓ Low risk - consider outpatient management if stable"
        : score < 106
          ? "✓ Moderate risk - hospital admission recommended"
          : "✓ High risk - ICU admission strongly recommended",
      score < 86 ? "✓ Anticoagulation and close outpatient follow-up" : "✓ Inpatient anticoagulation",
      score >= 106 ? "✓ Consider thrombolysis if hemodynamically unstable" : "✓ Anticoagulation alone",
      "✓ Risk stratification for recurrent VTE",
    ],
    managementPathway: [
      {
        priority: score >= 126 ? "immediate" : score >= 86 ? "urgent" : "routine",
        action: score < 86 ? "Outpatient management possible" : score < 106 ? "Hospital admission" : "ICU admission",
        rationale: `PESI Class ${riskClass} - ${mortalityRates[riskClass]}% mortality`,
      },
    ],
  };
}

export function calculateSMARTCOP(inputs: Record<string, boolean>): CalculationResult {
  let score = 0;
  if (inputs.systolic_bp) score += 2; // S
  if (inputs.multilobar) score += 1; // M
  if (inputs.albumin) score += 1; // A
  if (inputs.respiratory_rate) score += 1; // R
  if (inputs.tachycardia) score += 1; // T
  if (inputs.confusion) score += 1; // C
  if (inputs.oxygen) score += 2; // O
  if (inputs.ph) score += 2; // P

  const irvs_risk = score >= 5 ? 92 : score >= 3 ? 62 : 8;
  const riskLevel: "low" | "moderate" | "high" = score <= 2 ? "low" : score <= 4 ? "moderate" : "high";

  return {
    score,
    maxScore: 11,
    riskLevel,
    riskPercentage: irvs_risk,
    interpretation: `SMART-COP: ${score} - ${irvs_risk}% risk of needing IRVS (intensive respiratory or vasopressor support)`,
    recommendations: [
      score <= 2
        ? "✓ Low risk - medical floor appropriate"
        : score <= 4
          ? "✓ Intermediate risk - high-dependency unit or close monitoring"
          : "✓ High risk - ICU admission recommended",
      "✓ Empiric antibiotics within 4 hours",
      score >= 3 ? "✓ Early ICU consultation" : "✓ Standard ward care",
      "✓ Reassess at 24-48 hours",
    ],
    managementPathway: [
      {
        priority: score >= 5 ? "immediate" : "urgent",
        action: score <= 2 ? "Ward admission" : score <= 4 ? "High-dependency unit" : "ICU admission",
        rationale: `${irvs_risk}% risk of requiring intensive support`,
      },
    ],
  };
}

// ============================================================================
// HEPATOLOGY (EXPANDED)
// ============================================================================

export function calculateChildPugh(inputs: Record<string, any>): CalculationResult {
  let score = 0;

  // Bilirubin
  if (inputs.bilirubin < 2) score += 1;
  else if (inputs.bilirubin <= 3) score += 2;
  else score += 3;

  // Albumin
  if (inputs.albumin > 3.5) score += 1;
  else if (inputs.albumin >= 2.8) score += 2;
  else score += 3;

  // INR
  if (inputs.inr < 1.7) score += 1;
  else if (inputs.inr <= 2.3) score += 2;
  else score += 3;

  // Ascites
  const ascitesMap: Record<string, number> = {
    None: 1,
    "Mild (controlled with diuretics)": 2,
    "Moderate to severe (despite diuretics)": 3,
  };
  score += ascitesMap[inputs.ascites] || 1;

  // Encephalopathy
  const encephalopathyMap: Record<string, number> = {
    None: 1,
    "Grade I-II (mild)": 2,
    "Grade III-IV (severe)": 3,
  };
  score += encephalopathyMap[inputs.encephalopathy] || 1;

  const childClass = score <= 6 ? "A" : score <= 9 ? "B" : "C";
  const oneYearSurvival = score <= 6 ? 100 : score <= 9 ? 80 : 45;
  const twoYearSurvival = score <= 6 ? 85 : score <= 9 ? 60 : 35;
  const perioperativeMortality = score <= 6 ? 10 : score <= 9 ? 30 : 82;

  const riskLevel: "low" | "moderate" | "high" = score <= 6 ? "low" : score <= 9 ? "moderate" : "high";

  return {
    score,
    maxScore: 15,
    riskLevel,
    riskPercentage: 100 - oneYearSurvival,
    interpretation: `Child-Pugh Class ${childClass} (Score ${score}) - ${oneYearSurvival}% 1-year survival`,
    recommendations: [
      `✓ Child-Pugh Class ${childClass}`,
      `✓ 1-year survival: ${oneYearSurvival}%`,
      `✓ 2-year survival: ${twoYearSurvival}%`,
      `✓ Perioperative mortality: ${perioperativeMortality}%`,
      childClass === "C"
        ? "✓ Consider liver transplant evaluation"
        : childClass === "B"
          ? "✓ Medical management, monitor for decompensation"
          : "✓ Routine follow-up, prevent progression",
      childClass !== "A" ? "✓ High surgical risk - consider alternatives" : "✓ Surgery generally well-tolerated",
    ],
    managementPathway: [
      {
        priority: childClass === "C" ? "urgent" : "routine",
        action:
          childClass === "C"
            ? "Transplant evaluation"
            : childClass === "B"
              ? "Optimize medical management"
              : "Routine hepatology follow-up",
        rationale: `Child-Pugh ${childClass} - ${100 - oneYearSurvival}% 1-year mortality`,
      },
    ],
  };
}

export function calculateFIB4(inputs: { age: number; ast: number; alt: number; platelets: number }): CalculationResult {
  const fib4 = (inputs.age * inputs.ast) / (inputs.platelets * Math.sqrt(inputs.alt));
  const score = Math.round(fib4 * 100) / 100;

  const interpretation =
    score < 1.3
      ? "Low probability of advanced fibrosis (F0-F1)"
      : score <= 2.67
        ? "Indeterminate - further evaluation recommended"
        : "High probability of advanced fibrosis (F3-F4)";

  const riskLevel: "low" | "moderate" | "high" = score < 1.3 ? "low" : score <= 2.67 ? "moderate" : "high";

  return {
    score: Math.round(score * 100) / 100,
    maxScore: 12,
    riskLevel,
    riskPercentage: score >= 2.67 ? 80 : score >= 1.3 ? 50 : 5,
    interpretation: `FIB-4 Index: ${score.toFixed(2)} - ${interpretation}`,
    recommendations: [
      score < 1.3
        ? "✓ Low risk - routine monitoring"
        : score <= 2.67
          ? "✓ Indeterminate - consider elastography or liver biopsy"
          : "✓ High risk - hepatology referral recommended",
      score >= 2.67 ? "✓ Screen for varices (EGD)" : "✓ Standard care",
      score >= 1.3 ? "✓ Consider advanced imaging (fibroscan/MR elastography)" : "✓ Repeat FIB-4 annually",
      "✓ Manage underlying liver disease",
    ],
    managementPathway: [
      {
        priority: score >= 2.67 ? "urgent" : "routine",
        action:
          score >= 2.67 ? "Hepatology referral + elastography" : score >= 1.3 ? "Further fibrosis assessment" : "Routine monitoring",
        rationale: `FIB-4 ${score.toFixed(2)} - ${interpretation}`,
      },
    ],
  };
}

export function calculateMELDNa(inputs: {
  creatinine: number;
  bilirubin: number;
  inr: number;
  sodium: number;
  dialysis: boolean;
}): CalculationResult {
  // Standard MELD calculation
  let meld =
    3.78 * Math.log(Math.max(inputs.bilirubin, 1.0)) +
    11.2 * Math.log(Math.max(inputs.inr, 1.0)) +
    9.57 * Math.log(Math.max(inputs.creatinine, 1.0)) +
    6.43;

  // If on dialysis, set creatinine to 4.0
  if (inputs.dialysis) {
    meld = 3.78 * Math.log(Math.max(inputs.bilirubin, 1.0)) + 11.2 * Math.log(Math.max(inputs.inr, 1.0)) + 9.57 * Math.log(4.0) + 6.43;
  }

  meld = Math.min(Math.max(Math.round(meld), 6), 40);

  // Add sodium component
  const sodiumAdjusted = Math.max(125, Math.min(inputs.sodium, 137));
  const meldNa = meld + 1.32 * (137 - sodiumAdjusted) - (0.033 * meld * (137 - sodiumAdjusted));
  const score = Math.min(Math.max(Math.round(meldNa), 6), 40);

  const riskLevel: "low" | "moderate" | "high" | "critical" =
    score < 10 ? "low" : score < 20 ? "moderate" : score < 30 ? "high" : "critical";

  const mortalityRates: Record<string, number> = {
    low: 2,
    medium: 10,
    high: 40,
    critical: 80,
  };

  return {
    score,
    maxScore: 40,
    riskLevel,
    riskPercentage: mortalityRates[riskLevel],
    interpretation: `MELD-Na: ${score} (MELD ${meld}) - ${mortalityRates[riskLevel]}% 3-month mortality`,
    recommendations: [
      `✓ MELD-Na: ${score}, MELD: ${meld}`,
      score >= 20 ? "✓ Liver transplant evaluation indicated" : "✓ Medical management",
      score >= 15 ? "✓ Monitor for hepatic decompensation" : "✓ Routine hepatology follow-up",
      inputs.sodium < 130 ? "✓ Hyponatremia management - fluid restriction" : "✓ Sodium within acceptable range",
    ],
    managementPathway: [
      {
        priority: score >= 30 ? "immediate" : score >= 20 ? "urgent" : "routine",
        action: score >= 20 ? "Transplant evaluation" : "Medical optimization",
        rationale: `MELD-Na ${score} - ${mortalityRates[riskLevel]}% 3-month mortality`,
      },
    ],
  };
}

export function calculateAPRI(inputs: { ast: number; ast_upper_limit: number; platelets: number }): CalculationResult {
  const apri = ((inputs.ast / inputs.ast_upper_limit) * 100) / inputs.platelets;
  const score = Math.round(apri * 100) / 100;

  const interpretation =
    score < 0.5
      ? "Low probability of significant fibrosis"
      : score <= 1.5
        ? "Indeterminate"
        : score > 2.0
          ? "High probability of cirrhosis"
          : "High probability of significant fibrosis";

  const riskLevel: "low" | "moderate" | "high" = score < 0.5 ? "low" : score <= 1.5 ? "moderate" : "high";

  return {
    score: Math.round(score * 100) / 100,
    maxScore: 10,
    riskLevel,
    riskPercentage: score > 1.5 ? 75 : score >= 0.5 ? 40 : 10,
    interpretation: `APRI Score: ${score.toFixed(2)} - ${interpretation}`,
    recommendations: [
      score < 0.5
        ? "✓ Low risk of fibrosis - routine monitoring"
        : score <= 1.5
          ? "✓ Indeterminate - consider additional testing (FIB-4, elastography)"
          : "✓ High risk - hepatology referral recommended",
      score > 2.0 ? "✓ High probability of cirrhosis - screen for varices" : "✓ Monitor for progression",
      score >= 1.5 ? "✓ Consider liver biopsy or elastography" : "✓ Repeat APRI in 6-12 months",
      "✓ Address underlying liver disease",
    ],
    managementPathway: [
      {
        priority: score > 1.5 ? "urgent" : "routine",
        action: score > 1.5 ? "Hepatology referral" : score >= 0.5 ? "Further assessment" : "Routine follow-up",
        rationale: `APRI ${score.toFixed(2)} - ${interpretation}`,
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

  const riskLevel: "low" | "moderate" | "high" = score === 0 ? "low" : score <= 2 ? "moderate" : "high";

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
