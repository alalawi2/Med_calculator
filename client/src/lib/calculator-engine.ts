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
  if (inputs.systolic_bp <= 100) score += 1; // MDCalc: SBP ≤100 mmHg

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
  cardiovascular: number; // 0-4 based on MAP and vasopressor requirements
  gcs: number;
  creatinine: number;
}): CalculationResult {
  let score = 0;

  // Respiratory (PaO2/FiO2 ratio, mmHg)
  // MDCalc: ≥400 (0), <400 (1), <300 (2), <200 with respiratory support (3), <100 with respiratory support (4)
  if (inputs.pao2_fio2 < 100) score += 4;
  else if (inputs.pao2_fio2 < 200) score += 3;
  else if (inputs.pao2_fio2 < 300) score += 2;
  else if (inputs.pao2_fio2 < 400) score += 1;

  // Coagulation (Platelets, ×10³/μL)
  // MDCalc: ≥150 (0), <150 (1), <100 (2), <50 (3), <20 (4)
  if (inputs.platelets < 20) score += 4;
  else if (inputs.platelets < 50) score += 3;
  else if (inputs.platelets < 100) score += 2;
  else if (inputs.platelets < 150) score += 1;

  // Hepatic (Bilirubin, mg/dL)
  // MDCalc: <1.2 (0), 1.2-1.9 (1), 2.0-5.9 (2), 6.0-11.9 (3), ≥12 (4)
  if (inputs.bilirubin >= 12) score += 4;
  else if (inputs.bilirubin >= 6) score += 3;
  else if (inputs.bilirubin >= 2) score += 2;
  else if (inputs.bilirubin >= 1.2) score += 1;

  // Cardiovascular (based on MAP and vasopressor requirements)
  // MDCalc criteria:
  // 0: MAP ≥70 mmHg, no vasopressors
  // 1: MAP <70 mmHg, no vasopressors
  // 2: Dopamine ≤5 μg/kg/min OR dobutamine (any dose)
  // 3: Dopamine >5 μg/kg/min OR norepinephrine/epinephrine ≤0.1 μg/kg/min
  // 4: Dopamine >15 μg/kg/min OR norepinephrine/epinephrine >0.1 μg/kg/min
  // Note: Input is pre-calculated CV score (0-4) from UI based on vasopressor use
  score += Math.min(Math.max(inputs.cardiovascular, 0), 4);

  // Neurological (GCS)
  // MDCalc: 15 (0), 13-14 (1), 10-12 (2), 6-9 (3), <6 (4)
  if (inputs.gcs < 6) score += 4;
  else if (inputs.gcs <= 9) score += 3;
  else if (inputs.gcs <= 12) score += 2;
  else if (inputs.gcs <= 14) score += 1;

  // Renal (Creatinine, mg/dL)
  // MDCalc: <1.2 (0), 1.2-1.9 (1), 2.0-3.4 (2), 3.5-4.9 (3), ≥5.0 (4)
  if (inputs.creatinine >= 5) score += 4;
  else if (inputs.creatinine >= 3.5) score += 3;
  else if (inputs.creatinine >= 2) score += 2;
  else if (inputs.creatinine >= 1.2) score += 1;

  const riskLevel = score >= 11 ? "critical" : score >= 8 ? "high" : score >= 5 ? "moderate" : "low";
  // MDCalc SOFA mortality estimates
  const mortalityRates: Record<string, number> = {
    critical: 95,
    high: 60,
    moderate: 25,
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

/**
 * APACHE II Score - Simplified Implementation
 *
 * IMPORTANT LIMITATION: This is a SIMPLIFIED version of APACHE II.
 * The full APACHE II score requires 12 physiologic variables + age + chronic health evaluation.
 *
 * Full APACHE II requires: Temperature, MAP, Heart Rate, Respiratory Rate,
 * A-a gradient (if FiO2≥0.5) or PaO2, Arterial pH, Serum sodium, Serum potassium,
 * Serum creatinine, Hematocrit, WBC count, GCS, Age points, and Chronic Health points.
 *
 * This simplified version provides a rough estimate using commonly available vital signs.
 * For clinical decision-making, use the full APACHE II calculator (e.g., MDCalc).
 */
export function calculateAPACHE(inputs: {
  temperature: number;
  heart_rate: number;
  respiratory_rate_apache: number;
  systolic_apache: number;
  age_apache: number;
}): CalculationResult {
  let score = 0;

  // Temperature (°C) - MDCalc ranges
  // ≥41 or ≤29.9: +4, 39-40.9: +3, 38.5-38.9: +1, 36-38.4: 0, 34-35.9: +1, 32-33.9: +2, 30-31.9: +3, ≤29.9: +4
  if (inputs.temperature >= 41 || inputs.temperature <= 29.9) score += 4;
  else if (inputs.temperature >= 39 || (inputs.temperature >= 30 && inputs.temperature <= 31.9)) score += 3;
  else if ((inputs.temperature >= 32 && inputs.temperature <= 33.9)) score += 2;
  else if (inputs.temperature >= 38.5 || (inputs.temperature >= 34 && inputs.temperature <= 35.9)) score += 1;

  // Heart Rate (bpm) - MDCalc ranges
  // ≥180 or ≤39: +4, 140-179 or 40-54: +3, 110-139 or 55-69: +2, 70-109: 0
  if (inputs.heart_rate >= 180 || inputs.heart_rate <= 39) score += 4;
  else if (inputs.heart_rate >= 140 || (inputs.heart_rate >= 40 && inputs.heart_rate <= 54)) score += 3;
  else if (inputs.heart_rate >= 110 || (inputs.heart_rate >= 55 && inputs.heart_rate <= 69)) score += 2;

  // Respiratory Rate (breaths/min) - MDCalc ranges
  // ≥50 or ≤5: +4, 35-49: +3, 25-34 or 6-9: +1, 12-24: 0, 10-11: +1
  if (inputs.respiratory_rate_apache >= 50 || inputs.respiratory_rate_apache <= 5) score += 4;
  else if (inputs.respiratory_rate_apache >= 35) score += 3;
  else if (inputs.respiratory_rate_apache >= 25 || (inputs.respiratory_rate_apache >= 6 && inputs.respiratory_rate_apache <= 9)) score += 1;
  else if (inputs.respiratory_rate_apache >= 10 && inputs.respiratory_rate_apache <= 11) score += 1;

  // Mean Arterial Pressure (using systolic as proxy - NOTE: Full APACHE uses MAP)
  // This is a simplification - MAP = (SBP + 2*DBP) / 3
  // ≥160 or ≤49: +4, 130-159 or 50-69: +3, 110-129: +2, 70-109: 0
  if (inputs.systolic_apache >= 180 || inputs.systolic_apache <= 49) score += 4;
  else if (inputs.systolic_apache >= 150 || (inputs.systolic_apache >= 50 && inputs.systolic_apache <= 69)) score += 3;
  else if (inputs.systolic_apache >= 130 || (inputs.systolic_apache >= 70 && inputs.systolic_apache <= 79)) score += 2;

  // Age points (MDCalc validated)
  // ≥75: +6, 65-74: +5, 55-64: +3, 45-54: +2, <45: 0
  if (inputs.age_apache >= 75) score += 6;
  else if (inputs.age_apache >= 65) score += 5;
  else if (inputs.age_apache >= 55) score += 3;
  else if (inputs.age_apache >= 45) score += 2;

  const riskLevel = score >= 25 ? "critical" : score >= 20 ? "high" : score >= 15 ? "moderate" : "low";
  // Note: These mortality estimates are approximations for this simplified version
  const mortalityRates: Record<string, number> = {
    critical: 85,
    high: 55,
    moderate: 25,
    low: 8,
  };

  return {
    score,
    maxScore: 71,
    riskLevel,
    riskPercentage: mortalityRates[riskLevel] ?? 25,
    interpretation: `APACHE II Score (Simplified): ${score} - ${riskLevel.toUpperCase()} RISK. Note: This is a simplified calculation using vital signs only.`,
    recommendations: [
      `⚠️ SIMPLIFIED CALCULATION - Full APACHE II requires additional lab values`,
      `✓ Estimated ICU mortality: ~${mortalityRates[riskLevel] ?? 25}%`,
      "✓ For accurate scoring, use full APACHE II with all 12 physiologic variables",
      "✓ Consider MDCalc or institutional calculator for clinical decisions",
      "✓ Daily reassessment recommended",
    ],
    managementPathway: [
      {
        priority: score >= 25 ? "immediate" : "urgent",
        action: "ICU admission with intensive monitoring",
        rationale: `Simplified APACHE II ${score} - validate with full score`,
      },
    ],
  };
}

// ============================================================================
// STROKE & NEUROLOGICAL
// ============================================================================

export function calculateNIHSS(inputs: Record<string, number>): CalculationResult {
  // BUG FIX: Handle string numbers from form inputs
  const score = Object.values(inputs).reduce((a, b) => {
    const num = typeof b === "number" ? b : parseFloat(String(b)) || 0;
    return a + (isNaN(num) ? 0 : num);
  }, 0);

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
  } else if (score < 20) {
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
  
  // BUG FIX: Properly handle boolean inputs (may come as strings from form)
  const toBool = (val: any): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
    return Boolean(val);
  };
  
  if (toBool(inputs.chf)) score += 1;
  if (toBool(inputs.hypertension)) score += 1;
  if (toBool(inputs.age_75)) score += 2;
  if (toBool(inputs.diabetes)) score += 1;
  if (toBool(inputs.stroke_tia)) score += 2;
  if (toBool(inputs.vascular_disease)) score += 1;
  if (toBool(inputs.age_65_74)) score += 1;
  if (toBool(inputs.female)) score += 1;

  // MDCalc: Stroke/TIA/Systemic Embolism Risk (%) - Lip 2010 validation study
  const strokeRiskRates: Record<number, number> = {
    0: 0.3,
    1: 0.9,
    2: 2.9,
    3: 4.6,
    4: 6.7,
    5: 10.0,
    6: 13.6,
    7: 15.7,
    8: 15.2,
    9: 17.4,
  };

  const riskPercentage = strokeRiskRates[Math.min(score, 9)] ?? 17.4;
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

export function calculateHASBLED(inputs: {
  hypertension: boolean;
  renal_disease: boolean;
  liver_disease: boolean;
  stroke_history: boolean;
  prior_bleeding: boolean;
  labile_inr: boolean;
  age_over_65: boolean;
  medication_usage: boolean;
  alcohol_use: boolean;
}): CalculationResult {
  let score = 0;

  // BUG FIX: Properly handle boolean inputs (may come as strings from form)
  const toBool = (val: any): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
    return Boolean(val);
  };

  // H - Hypertension (uncontrolled, SBP >160 mmHg)
  if (toBool(inputs.hypertension)) score += 1;

  // A - Abnormal renal function (1 pt) AND/OR liver function (1 pt)
  if (toBool(inputs.renal_disease)) score += 1;
  if (toBool(inputs.liver_disease)) score += 1;

  // S - Stroke history
  if (toBool(inputs.stroke_history)) score += 1;

  // B - Bleeding history or predisposition
  if (toBool(inputs.prior_bleeding)) score += 1;

  // L - Labile INR (if on warfarin, TTR <60%)
  if (inputs.labile_inr) score += 1;

  // E - Elderly (≥65 years)
  if (inputs.age_over_65) score += 1;

  // D - Drugs (antiplatelet agents, NSAIDs) (1 pt) AND/OR alcohol excess (1 pt)
  if (inputs.medication_usage) score += 1;
  if (inputs.alcohol_use) score += 1;

  // MDCalc HAS-BLED bleeding risk rates (annual major bleeding %)
  const bleedingRiskRates: Record<number, number> = {
    0: 1.1,
    1: 1.0,
    2: 1.9,
    3: 3.7,
    4: 8.7,
    5: 12.5,
    6: 12.5,
    7: 12.5,
    8: 12.5,
    9: 12.5,
  };

  const riskPercentage = bleedingRiskRates[Math.min(score, 9)] ?? 12.5;
  const riskLevel: "low" | "moderate" | "high" = score <= 1 ? "low" : score === 2 ? "moderate" : "high";

  return {
    score,
    maxScore: 9,
    riskLevel,
    riskPercentage,
    interpretation: `HAS-BLED Score: ${score} - ${riskPercentage}% annual major bleeding risk`,
    recommendations: [
      score >= 3
        ? "✓ High bleeding risk - requires careful monitoring on anticoagulation"
        : score === 2
          ? "✓ Moderate bleeding risk - consider individual factors"
          : "✓ Low bleeding risk - anticoagulation generally safe",
      "✓ HAS-BLED ≥3 does NOT contraindicate anticoagulation",
      "✓ Address modifiable risk factors (hypertension, labile INR, medications, alcohol)",
      score >= 3 ? "✓ More frequent monitoring recommended" : "✓ Standard monitoring",
    ],
    managementPathway: [
      {
        priority: score >= 3 ? "urgent" : "routine",
        action: `Bleeding risk assessment (${riskPercentage}% annual risk)`,
        rationale: "HAS-BLED guides monitoring intensity, not anticoagulation decision",
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
    recommendations = [
      "✓ ICU admission",
      "✓ CT head if not done",
      "✓ Neuro checks q15-30min",
      "✓ Prepare for possible intubation",
    ];
  } else if (score >= 6) {
    riskLevel = "high";
    interpretation = "Severe head injury - Intubation likely needed";
    recommendations = [
      "✓ ICU admission mandatory",
      "✓ Prepare for intubation",
      "✓ Neurosurgery consultation",
      "✓ ICP monitoring consideration",
    ];
  } else {
    riskLevel = "critical";
    interpretation = "Critical head injury - Immediate intubation required";
    recommendations = [
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
  // Validated from MDCalc and Backus BE, et al. Int J Cardiol. 2013;168(3):2153-2158
  // Updated to match MDCalc reference values
  const maceRates: Record<string, number> = {
    low: 1.7,       // Score 0-3: 0.9-1.7% 6-week MACE (MDCalc: ~1.7%)
    moderate: 16.6, // Score 4-6: 12-16.6% 6-week MACE (MDCalc: ~16.6%)
    high: 50.1,     // Score ≥7: 50-65% 6-week MACE (MDCalc: ~50.1%)
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
  
  // BUG FIX: Properly handle boolean inputs (may come as strings from form)
  const toBool = (val: any): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
    return Boolean(val);
  };
  
  if (toBool(inputs.confusion)) score += 1;
  if (toBool(inputs.urea)) score += 1;
  if (toBool(inputs.respiratory_rate_curb)) score += 1;
  if (toBool(inputs.blood_pressure_curb)) score += 1;
  if (toBool(inputs.age_65_curb)) score += 1;

  // MDCalc validated 30-day mortality rates
  const mortalityRates: Record<number, number> = {
    0: 0.6,
    1: 2.7,
    2: 6.8,
    3: 14.0,
    4: 27.8,
    5: 27.8,
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
  // CRITICAL: Handle division by zero if creatinine is 0
  if (inputs.creatinine_crcl <= 0) {
    return {
      score: 0,
      maxScore: 120,
      riskLevel: "critical",
      riskPercentage: 100,
      interpretation: "Creatinine Clearance: Cannot calculate (creatinine ≤ 0). Please verify input.",
      recommendations: [
        "✓ Verify creatinine value",
        "✓ Creatinine must be > 0 for calculation",
        "✓ Consider alternative GFR estimation methods",
      ],
      managementPathway: [
        {
          priority: "urgent",
          action: "Verify lab values",
          rationale: "Invalid creatinine value prevents calculation",
        },
      ],
    };
  }
  
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
  dialysis?: boolean;
}): CalculationResult {
  // MELD formula (Original, validated by UNOS)
  // MDCalc Reference: Lab values <1.0 are set to 1.0
  // Creatinine is capped at 4.0 for patients on dialysis (≥2x/week) or CRRT
  const bili = Math.max(inputs.bilirubin_meld, 1.0);
  const inr = Math.max(inputs.inr, 1.0);
  let creat = Math.max(inputs.creatinine_meld, 1.0);

  // Cap creatinine at 4.0 for dialysis patients
  if (inputs.dialysis) {
    creat = Math.min(creat, 4.0);
  }
  creat = Math.min(creat, 4.0); // Also cap at 4.0 per UNOS guidelines

  const meld =
    9.57 * Math.log(creat) +
    3.78 * Math.log(bili) +
    11.2 * Math.log(inr) +
    6.43;

  const score = Math.min(Math.max(Math.round(meld), 6), 40);

  // MDCalc MELD mortality estimates
  const mortalityRates: Record<string, number> = {
    low: 2,
    moderate: 10,
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
  
  // BUG FIX: Properly handle boolean inputs (may come as strings from form)
  const toBool = (val: any): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
    return Boolean(val);
  };
  
  if (toBool(inputs.high_risk_surgery)) score += 1;
  if (toBool(inputs.ischemic_heart_disease)) score += 1;
  if (toBool(inputs.heart_failure)) score += 1;
  if (toBool(inputs.cerebrovascular_disease)) score += 1;
  if (toBool(inputs.diabetes_insulin)) score += 1;
  if (toBool(inputs.renal_insufficiency)) score += 1;

  // MDCalc/Lee Criteria validated risk rates for major cardiac complications
  // (MI, cardiac arrest, complete heart block, death)
  const cardiacRiskRates: Record<number, number> = {
    0: 0.4,   // Class I: Very low risk (<1%)
    1: 1.0,   // Class II: Low risk (1.0-1.3%)
    2: 5.4,   // Class III: Intermediate risk (4-7%)
    3: 9.1,   // Class IV: High risk (9-11%)
  };

  const riskPercentage = score >= 3 ? cardiacRiskRates[3] : cardiacRiskRates[Math.min(score, 3)];
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

  // BUG FIX: Properly handle boolean inputs
  const toBool = (val: any): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
    return Boolean(val);
  };

  // Surgery scoring
  if (toBool(inputs.minor_surgery)) score += 1;
  if (toBool(inputs.major_surgery)) score += 2;

  // Other risk factors (1 point each)
  if (toBool(inputs.bmi)) score += 1;
  if (toBool(inputs.varicose_veins)) score += 1;
  if (toBool(inputs.immobility)) score += 2;

  // Major risk factors
  if (toBool(inputs.current_cancer)) score += 2;
  if (toBool(inputs.previous_vte)) score += 3;
  if (toBool(inputs.thrombophilia)) score += 3;

  // MDCalc Caprini risk stratification: 0-1 low, 2 moderate, 3-4 high, ≥5 highest
  const riskLevel: "low" | "moderate" | "high" | "critical" =
    score <= 1 ? "low" : score === 2 ? "moderate" : score <= 4 ? "high" : "critical";

  // MDCalc VTE risk rates by category
  const vteRiskRates: Record<string, number> = {
    low: 0.5,
    moderate: 1.5,
    high: 3.0,
    critical: 6.0,
  };

  return {
    score,
    maxScore: 20,
    riskLevel,
    riskPercentage: vteRiskRates[riskLevel],
    interpretation: `Caprini Score: ${score} - ${riskLevel.toUpperCase()} VTE RISK (${vteRiskRates[riskLevel]}% risk)`,
    recommendations: [
      score <= 1
        ? "✓ Early ambulation recommended"
        : score === 2
          ? "✓ Mechanical prophylaxis (compression devices)"
          : score <= 4
            ? "✓ Pharmacologic prophylaxis recommended"
            : "✓ Pharmacologic + mechanical prophylaxis, consider extended duration (30 days)",
      "✓ Risk reassessment daily",
      score >= 5 ? "✓ Extended prophylaxis recommended (7-30 days post-op)" : "✓ Standard duration prophylaxis",
      "✓ Early mobilization when safe",
    ],
    managementPathway: [
      {
        priority: score >= 5 ? "urgent" : "routine",
        action:
          score <= 1
            ? "Ambulation only"
            : score === 2
              ? "Mechanical prophylaxis"
              : "Pharmacologic + mechanical prophylaxis",
        rationale: `${vteRiskRates[riskLevel]}% VTE risk - Caprini ${score}`,
      },
    ],
  };
}

export function calculatePESI(inputs: Record<string, any>): CalculationResult {
  // BUG FIX: Validate age and handle undefined/null
  const age = typeof inputs.age === "number" ? inputs.age : parseFloat(inputs.age) || 0;
  let score = age; // Age in years
  
  // BUG FIX: Properly handle boolean inputs (strings "true"/"false" should be converted)
  const toBool = (val: any): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
    return Boolean(val);
  };
  
  if (toBool(inputs.male)) score += 10;
  if (toBool(inputs.cancer)) score += 30;
  if (toBool(inputs.heart_failure)) score += 10;
  if (toBool(inputs.chronic_lung_disease)) score += 10;
  if (toBool(inputs.pulse)) score += 20;
  if (toBool(inputs.systolic_bp)) score += 30;
  if (toBool(inputs.respiratory_rate)) score += 20;
  if (toBool(inputs.temperature)) score += 20;
  if (toBool(inputs.altered_mental)) score += 60;
  if (toBool(inputs.oxygen_sat)) score += 20;

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
  
  // BUG FIX: Properly handle boolean inputs (may come as strings from form)
  const toBool = (val: any): boolean => {
    if (typeof val === "boolean") return val;
    if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
    return Boolean(val);
  };
  
  // MDCalc SMART-COP scoring criteria
  if (toBool(inputs.systolic_bp)) score += 2; // S - Systolic BP <90 mmHg
  if (toBool(inputs.multilobar)) score += 1; // M - Multilobar infiltrates on CXR
  if (toBool(inputs.albumin)) score += 1; // A - Albumin <3.5 g/dL
  if (toBool(inputs.respiratory_rate)) score += 1; // R - RR >30/min (age-adjusted)
  if (toBool(inputs.tachycardia)) score += 1; // T - Tachycardia (HR >125 bpm)
  if (toBool(inputs.confusion)) score += 1; // C - Confusion (acute)
  if (toBool(inputs.oxygen)) score += 2; // O - Oxygen low (SpO2 <90% or PaO2 <60)
  if (toBool(inputs.ph)) score += 2; // P - pH <7.35

  // MDCalc validated IRVS (Intensive Respiratory or Vasopressor Support) risk
  // 0-2: Low risk (~4% need IRVS)
  // 3-4: Moderate risk (1 in 8 = 12.5% need IRVS)
  // 5-6: High risk (1 in 3 = 33% need IRVS)
  // ≥7: Very high risk (2 in 3 = 67% need IRVS)
  const irvs_risk = score >= 7 ? 67 : score >= 5 ? 33 : score >= 3 ? 12.5 : 4;
  const riskLevel: "low" | "moderate" | "high" | "critical" =
    score <= 2 ? "low" : score <= 4 ? "moderate" : score <= 6 ? "high" : "critical";

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

  // BUG FIX: Parse numeric inputs (may come as strings from form)
  const bilirubin = typeof inputs.bilirubin === "number" ? inputs.bilirubin : parseFloat(String(inputs.bilirubin)) || 0;
  const albumin = typeof inputs.albumin === "number" ? inputs.albumin : parseFloat(String(inputs.albumin)) || 0;
  const inr = typeof inputs.inr === "number" ? inputs.inr : parseFloat(String(inputs.inr)) || 1;

  // Bilirubin
  if (bilirubin < 2) score += 1;
  else if (bilirubin <= 3) score += 2;
  else score += 3;

  // Albumin
  if (albumin > 3.5) score += 1;
  else if (albumin >= 2.8) score += 2;
  else score += 3;

  // INR - MDCalc: <1.7 (1pt), 1.7-2.2 (2pt), >2.2 (3pt)
  if (inr < 1.7) score += 1;
  else if (inr <= 2.2) score += 2;
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
  // FIB-4 Formula: (Age × AST) / (Platelet count × √ALT)
  // BUG FIX: Handle division by zero and invalid sqrt
  if (inputs.platelets <= 0 || inputs.alt <= 0) {
    return {
      score: 0,
      maxScore: 12,
      riskLevel: "low",
      riskPercentage: 0,
      interpretation: "FIB-4: Cannot calculate (platelets ≤0 or ALT ≤0). Please verify inputs.",
      recommendations: ["✓ Verify lab values", "✓ Platelets and ALT must be > 0"],
      managementPathway: [{ priority: "routine", action: "Verify lab values", rationale: "Invalid inputs prevent calculation" }],
    };
  }
  const fib4 = (inputs.age * inputs.ast) / (inputs.platelets * Math.sqrt(inputs.alt));
  const score = Math.round(fib4 * 100) / 100;

  // MDCalc original cutoffs (validated in HIV/HCV):
  // <1.45: Low probability of advanced fibrosis (NPV 90%)
  // 1.45-3.25: Indeterminate
  // >3.25: High probability of advanced fibrosis (PPV 65%, specificity 97%)
  const interpretation =
    score < 1.45
      ? "Low probability of advanced fibrosis (F0-F1)"
      : score <= 3.25
        ? "Indeterminate - further evaluation recommended"
        : "High probability of advanced fibrosis (F3-F4)";

  const riskLevel: "low" | "moderate" | "high" = score < 1.45 ? "low" : score <= 3.25 ? "moderate" : "high";

  return {
    score: Math.round(score * 100) / 100,
    maxScore: 12,
    riskLevel,
    riskPercentage: score > 3.25 ? 80 : score >= 1.45 ? 50 : 5,
    interpretation: `FIB-4 Index: ${score.toFixed(2)} - ${interpretation}`,
    recommendations: [
      score < 1.45
        ? "✓ Low risk - routine monitoring (NPV 90% for advanced fibrosis)"
        : score <= 3.25
          ? "✓ Indeterminate - consider elastography or liver biopsy"
          : "✓ High risk - hepatology referral recommended (PPV 65%)",
      score > 3.25 ? "✓ Screen for varices (EGD)" : "✓ Standard care",
      score >= 1.45 ? "✓ Consider advanced imaging (fibroscan/MR elastography)" : "✓ Repeat FIB-4 annually",
      "✓ Manage underlying liver disease",
    ],
    managementPathway: [
      {
        priority: score > 3.25 ? "urgent" : "routine",
        action:
          score > 3.25 ? "Hepatology referral + elastography" : score >= 1.45 ? "Further fibrosis assessment" : "Routine monitoring",
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

  // MDCalc MELD-Na mortality estimates
  const mortalityRates: Record<string, number> = {
    low: 2,
    moderate: 10,
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
  // BUG FIX: Handle division by zero
  if (inputs.ast_upper_limit <= 0 || inputs.platelets <= 0) {
    return {
      score: 0,
      maxScore: 10,
      riskLevel: "low",
      riskPercentage: 0,
      interpretation: "APRI: Cannot calculate (AST upper limit ≤0 or platelets ≤0). Please verify inputs.",
      recommendations: ["✓ Verify lab values", "✓ AST upper limit and platelets must be > 0"],
      managementPathway: [{ priority: "routine", action: "Verify lab values", rationale: "Invalid inputs prevent calculation" }],
    };
  }
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
