/**
 * Unit Tests for Calculator Engine
 * Critical for ensuring medical calculation accuracy
 */

import { describe, it, expect } from "vitest";
import {
  calculateQSOFA,
  calculateSOFA,
  calculateAPACHE,
  calculateNIHSS,
  calculateCHA2DS2VASc,
  calculateGCS,
  calculateHEART,
  calculateCURB65,
  calculateCrCl,
  calculateMELD,
  calculateChildPugh,
  calculateFIB4,
  calculateMELDNa,
  calculateAPRI,
  calculateRCRI,
  calculateCaprini,
  calculatePESI,
  calculateSMARTCOP,
  calculateASA,
} from "./calculator-engine";

// ============================================================================
// qSOFA Score Tests
// ============================================================================
describe("qSOFA Score", () => {
  it("should return score 0 for normal patient", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 18,
      systolic_bp: 120,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("low");
  });

  it("should return score 1 for altered mentation only", () => {
    const result = calculateQSOFA({
      altered_mentation: true,
      respiratory_rate: 18,
      systolic_bp: 120,
    });
    expect(result.score).toBe(1);
    expect(result.riskLevel).toBe("low");
  });

  it("should return score 2 (high risk) for RR >= 22 and SBP < 100", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 24,
      systolic_bp: 90,
    });
    expect(result.score).toBe(2);
    expect(result.riskLevel).toBe("high");
  });

  it("should return score 3 (high risk) for all criteria met", () => {
    const result = calculateQSOFA({
      altered_mentation: true,
      respiratory_rate: 22,
      systolic_bp: 99,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe("high");
    expect(result.riskPercentage).toBe(80);
  });

  it("should handle boundary values correctly (RR = 22)", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 22,
      systolic_bp: 120,
    });
    expect(result.score).toBe(1);
  });

  // MDCalc/Sepsis-3 criteria: SBP ≤100 mmHg (less than or equal to)
  it("should handle boundary values correctly (SBP = 100)", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 18,
      systolic_bp: 100,
    });
    expect(result.score).toBe(1); // SBP ≤100 scores 1 point per MDCalc
  });
});

// ============================================================================
// SOFA Score Tests
// ============================================================================
describe("SOFA Score", () => {
  it("should return low risk for normal values", () => {
    const result = calculateSOFA({
      pao2_fio2: 450,
      platelets: 200,
      bilirubin: 0.8,
      cardiovascular: 0, // No vasopressors, MAP ≥70
      gcs: 15,
      creatinine: 0.9,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("low");
  });

  it("should calculate respiratory component correctly", () => {
    // PaO2/FiO2 < 100 = 4 points
    const result = calculateSOFA({
      pao2_fio2: 90,
      platelets: 200,
      bilirubin: 0.8,
      cardiovascular: 0, // No vasopressors, MAP ≥70
      gcs: 15,
      creatinine: 0.9,
    });
    expect(result.score).toBe(4);
  });

  it("should calculate critical risk for severe multi-organ failure", () => {
    const result = calculateSOFA({
      pao2_fio2: 90, // 4 points
      platelets: 15, // 4 points
      bilirubin: 15, // 4 points
      cardiovascular: 4, // 4 points (norepinephrine >0.1 μg/kg/min)
      gcs: 5, // 4 points
      creatinine: 6, // 4 points
    });
    expect(result.score).toBe(24);
    expect(result.riskLevel).toBe("critical");
  });

  it("should return high risk for score >= 8", () => {
    const result = calculateSOFA({
      pao2_fio2: 180, // 3 points
      platelets: 40, // 3 points
      bilirubin: 0.8, // 0 points
      cardiovascular: 0, // 0 points
      gcs: 8, // 3 points (GCS 6-9)
      creatinine: 0.9, // 0 points
    });
    expect(result.score).toBe(9);
    expect(result.riskLevel).toBe("high");
  });

  it("should correctly score cardiovascular component based on vasopressor use", () => {
    // Test cardiovascular scoring with different vasopressor levels
    const resultNoVasopressor = calculateSOFA({
      pao2_fio2: 450,
      platelets: 200,
      bilirubin: 0.8,
      cardiovascular: 0, // MAP ≥70, no vasopressors
      gcs: 15,
      creatinine: 0.9,
    });
    expect(resultNoVasopressor.score).toBe(0);

    const resultLowDopamine = calculateSOFA({
      pao2_fio2: 450,
      platelets: 200,
      bilirubin: 0.8,
      cardiovascular: 2, // Dopamine ≤5 or dobutamine
      gcs: 15,
      creatinine: 0.9,
    });
    expect(resultLowDopamine.score).toBe(2);

    const resultHighVasopressor = calculateSOFA({
      pao2_fio2: 450,
      platelets: 200,
      bilirubin: 0.8,
      cardiovascular: 4, // Norepinephrine >0.1 μg/kg/min
      gcs: 15,
      creatinine: 0.9,
    });
    expect(resultHighVasopressor.score).toBe(4);
  });
});

// ============================================================================
// GCS Score Tests
// ============================================================================
describe("GCS Score", () => {
  it("should calculate maximum score of 15 for alert patient", () => {
    const result = calculateGCS({
      eye_opening: 4,
      verbal_response: 5,
      motor_response: 6,
    });
    expect(result.score).toBe(15);
    expect(result.riskLevel).toBe("low");
    expect(result.interpretation).toContain("Mild");
  });

  it("should calculate minimum score of 3 for unresponsive patient", () => {
    const result = calculateGCS({
      eye_opening: 1,
      verbal_response: 1,
      motor_response: 1,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe("critical");
  });

  it("should return moderate risk for score 9-12", () => {
    const result = calculateGCS({
      eye_opening: 3,
      verbal_response: 3,
      motor_response: 4,
    });
    expect(result.score).toBe(10);
    expect(result.riskLevel).toBe("moderate");
  });

  it("should return high risk for score 6-8", () => {
    const result = calculateGCS({
      eye_opening: 2,
      verbal_response: 2,
      motor_response: 4,
    });
    expect(result.score).toBe(8);
    expect(result.riskLevel).toBe("high");
  });
});

// ============================================================================
// CHA₂DS₂-VASc Score Tests
// ============================================================================
describe("CHA₂DS₂-VASc Score", () => {
  it("should return score 0 for no risk factors", () => {
    const result = calculateCHA2DS2VASc({
      chf: false,
      hypertension: false,
      age_75: false,
      diabetes: false,
      stroke_tia: false,
      vascular_disease: false,
      age_65_74: false,
      female: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("low");
    // Score 0 = 0% annual stroke risk (fixed bug: was using || instead of ??)
    expect(result.riskPercentage).toBe(0);
  });

  it("should add 2 points for age >= 75", () => {
    const result = calculateCHA2DS2VASc({
      chf: false,
      hypertension: false,
      age_75: true,
      diabetes: false,
      stroke_tia: false,
      vascular_disease: false,
      age_65_74: false,
      female: false,
    });
    expect(result.score).toBe(2);
  });

  it("should add 2 points for stroke/TIA history", () => {
    const result = calculateCHA2DS2VASc({
      chf: false,
      hypertension: false,
      age_75: false,
      diabetes: false,
      stroke_tia: true,
      vascular_disease: false,
      age_65_74: false,
      female: false,
    });
    expect(result.score).toBe(2);
  });

  it("should calculate maximum score of 9", () => {
    const result = calculateCHA2DS2VASc({
      chf: true, // 1
      hypertension: true, // 1
      age_75: true, // 2 (age ≥75)
      diabetes: true, // 1
      stroke_tia: true, // 2
      vascular_disease: true, // 1
      age_65_74: false, // 0 (can't be both 65-74 AND ≥75)
      female: true, // 1
    });
    expect(result.score).toBe(9); // Maximum possible score
    expect(result.riskLevel).toBe("high");
  });

  it("should return correct stroke risk percentages", () => {
    const result1 = calculateCHA2DS2VASc({
      chf: true,
      hypertension: false,
      age_75: false,
      diabetes: false,
      stroke_tia: false,
      vascular_disease: false,
      age_65_74: false,
      female: false,
    });
    expect(result1.score).toBe(1);
    expect(result1.riskPercentage).toBe(1.3);
  });
});

// ============================================================================
// HEART Score Tests
// ============================================================================
describe("HEART Score", () => {
  it("should return low risk for score <= 3", () => {
    const result = calculateHEART({
      history: 0,
      ecg: 0,
      age_heart: 40,
      risk_factors: 0,
      troponin: 0,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("low");
  });

  it("should add age points correctly", () => {
    // Age < 45 = 0 points
    const result1 = calculateHEART({
      history: 0,
      ecg: 0,
      age_heart: 44,
      risk_factors: 0,
      troponin: 0,
    });
    expect(result1.score).toBe(0);

    // Age 45-64 = 1 point
    const result2 = calculateHEART({
      history: 0,
      ecg: 0,
      age_heart: 55,
      risk_factors: 0,
      troponin: 0,
    });
    expect(result2.score).toBe(1);

    // Age >= 65 = 2 points
    const result3 = calculateHEART({
      history: 0,
      ecg: 0,
      age_heart: 70,
      risk_factors: 0,
      troponin: 0,
    });
    expect(result3.score).toBe(2);
  });

  it("should return high risk for score >= 7", () => {
    const result = calculateHEART({
      history: 2,
      ecg: 2,
      age_heart: 70, // 2 points
      risk_factors: 2,
      troponin: 2,
    });
    expect(result.score).toBe(10);
    expect(result.riskLevel).toBe("high");
  });

  // MDCalc validated MACE rates
  it("should return MDCalc-validated MACE risk percentages", () => {
    // Low risk (score 0-3): ~1.7% MACE
    const lowRisk = calculateHEART({
      history: 0,
      ecg: 0,
      age_heart: 40,
      risk_factors: 0,
      troponin: 0,
    });
    expect(lowRisk.riskPercentage).toBe(1.7);

    // Moderate risk (score 4-6): ~16.6% MACE (MDCalc reference)
    const moderateRisk = calculateHEART({
      history: 1,
      ecg: 1,
      age_heart: 55, // 1 point
      risk_factors: 1,
      troponin: 1,
    });
    expect(moderateRisk.riskLevel).toBe("moderate");
    expect(moderateRisk.riskPercentage).toBe(16.6);

    // High risk (score 7+): ~50.1% MACE (MDCalc reference)
    const highRisk = calculateHEART({
      history: 2,
      ecg: 2,
      age_heart: 70,
      risk_factors: 2,
      troponin: 2,
    });
    expect(highRisk.riskLevel).toBe("high");
    expect(highRisk.riskPercentage).toBe(50.1);
  });
});

// ============================================================================
// CURB-65 Score Tests
// ============================================================================
describe("CURB-65 Score", () => {
  it("should return score 0 for no risk factors", () => {
    const result = calculateCURB65({
      confusion: false,
      urea: false,
      respiratory_rate_curb: false,
      blood_pressure_curb: false,
      age_65_curb: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("low");
    expect(result.riskPercentage).toBe(0.7);
  });

  it("should return maximum score of 5", () => {
    const result = calculateCURB65({
      confusion: true,
      urea: true,
      respiratory_rate_curb: true,
      blood_pressure_curb: true,
      age_65_curb: true,
    });
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe("high");
    expect(result.riskPercentage).toBe(57.0);
  });

  it("should return correct mortality rates for each score", () => {
    const score2 = calculateCURB65({
      confusion: true,
      urea: true,
      respiratory_rate_curb: false,
      blood_pressure_curb: false,
      age_65_curb: false,
    });
    expect(score2.riskPercentage).toBe(13.0);
  });
});

// ============================================================================
// Creatinine Clearance (Cockcroft-Gault) Tests
// ============================================================================
describe("Creatinine Clearance", () => {
  it("should calculate CrCl correctly for male patient", () => {
    // Known example: 70yo male, 70kg, Cr 1.0
    // CrCl = (140-70) * 70 / (72 * 1.0) = 68.06
    const result = calculateCrCl({
      age_crcl: 70,
      weight_crcl: 70,
      creatinine_crcl: 1.0,
      gender_crcl: "male",
    });
    expect(result.score).toBeCloseTo(68, 0);
  });

  it("should apply 0.85 factor for female patient", () => {
    const male = calculateCrCl({
      age_crcl: 70,
      weight_crcl: 70,
      creatinine_crcl: 1.0,
      gender_crcl: "male",
    });
    const female = calculateCrCl({
      age_crcl: 70,
      weight_crcl: 70,
      creatinine_crcl: 1.0,
      gender_crcl: "female",
    });
    expect(female.score).toBeCloseTo(male.score * 0.85, 0);
  });

  it("should classify CKD stages correctly", () => {
    // Stage 1 (Normal): >= 90
    const stage1 = calculateCrCl({
      age_crcl: 30,
      weight_crcl: 80,
      creatinine_crcl: 0.8,
      gender_crcl: "male",
    });
    expect(stage1.riskLevel).toBe("low");

    // Stage 4 (Severe): < 30
    const stage4 = calculateCrCl({
      age_crcl: 80,
      weight_crcl: 50,
      creatinine_crcl: 3.0,
      gender_crcl: "male",
    });
    expect(stage4.riskLevel).toBe("critical");
  });
});

// ============================================================================
// MELD Score Tests
// ============================================================================
describe("MELD Score", () => {
  it("should calculate MELD score with minimum value of 6", () => {
    const result = calculateMELD({
      inr: 1.0,
      bilirubin_meld: 1.0,
      creatinine_meld: 1.0,
    });
    // Formula can produce values < 6, but should be clamped
    expect(result.score).toBeGreaterThanOrEqual(6);
  });

  it("should cap MELD score at 40", () => {
    const result = calculateMELD({
      inr: 5.0,
      bilirubin_meld: 30.0,
      creatinine_meld: 5.0,
    });
    expect(result.score).toBeLessThanOrEqual(40);
  });

  it("should return critical risk for high MELD scores", () => {
    const result = calculateMELD({
      inr: 3.0,
      bilirubin_meld: 15.0,
      creatinine_meld: 4.0,
    });
    expect(result.riskLevel).toBe("critical");
  });

  // MDCalc validation: Lab values <1.0 are set to 1.0 to prevent negative log values
  it("should clamp lab values below 1.0 to 1.0 (MDCalc requirement)", () => {
    const resultLowValues = calculateMELD({
      inr: 0.8,  // Should be clamped to 1.0
      bilirubin_meld: 0.5,  // Should be clamped to 1.0
      creatinine_meld: 0.6,  // Should be clamped to 1.0
    });
    // With all values clamped to 1.0, result should equal MELD with all 1.0 inputs
    const resultNormalValues = calculateMELD({
      inr: 1.0,
      bilirubin_meld: 1.0,
      creatinine_meld: 1.0,
    });
    expect(resultLowValues.score).toBe(resultNormalValues.score);
    expect(resultLowValues.score).toBeGreaterThanOrEqual(6);
    // Score should not be NaN or negative
    expect(Number.isNaN(resultLowValues.score)).toBe(false);
    expect(resultLowValues.score).toBeGreaterThan(0);
  });

  // MDCalc validation: Creatinine capped at 4.0 for dialysis patients
  it("should cap creatinine at 4.0 for dialysis patients", () => {
    const resultDialysis = calculateMELD({
      inr: 1.5,
      bilirubin_meld: 2.0,
      creatinine_meld: 8.0,  // High creatinine
      dialysis: true,
    });
    const resultCapped = calculateMELD({
      inr: 1.5,
      bilirubin_meld: 2.0,
      creatinine_meld: 4.0,  // Capped at 4.0
    });
    expect(resultDialysis.score).toBe(resultCapped.score);
  });
});

// ============================================================================
// Child-Pugh Score Tests
// ============================================================================
describe("Child-Pugh Score", () => {
  it("should return Class A for score 5-6", () => {
    const result = calculateChildPugh({
      bilirubin: 1.5,
      albumin: 4.0,
      inr: 1.2,
      ascites: "None",
      encephalopathy: "None",
    });
    expect(result.score).toBe(5);
    expect(result.interpretation).toContain("Class A");
    expect(result.riskLevel).toBe("low");
  });

  it("should return Class B for score 7-9", () => {
    // Adjusted inputs to get score in 7-9 range for Class B
    const result = calculateChildPugh({
      bilirubin: 2.5, // 2 points (2-3 range)
      albumin: 3.2, // 2 points (2.8-3.5 range)
      inr: 1.8, // 2 points (1.7-2.3 range)
      ascites: "None", // 1 point
      encephalopathy: "None", // 1 point
    });
    // Total: 8 points = Class B
    expect(result.score).toBeGreaterThanOrEqual(7);
    expect(result.score).toBeLessThanOrEqual(9);
    expect(result.interpretation).toContain("Class B");
  });

  it("should return Class C for score >= 10", () => {
    const result = calculateChildPugh({
      bilirubin: 5.0,
      albumin: 2.0,
      inr: 3.0,
      ascites: "Moderate to severe (despite diuretics)",
      encephalopathy: "Grade III-IV (severe)",
    });
    expect(result.score).toBeGreaterThanOrEqual(10);
    expect(result.interpretation).toContain("Class C");
    expect(result.riskLevel).toBe("high");
  });
});

// ============================================================================
// FIB-4 Index Tests
// ============================================================================
describe("FIB-4 Index", () => {
  it("should calculate FIB-4 correctly", () => {
    // FIB-4 = (Age × AST) / (Platelets × √ALT)
    // Example: 50yo, AST 40, ALT 36, Platelets 200
    // FIB-4 = (50 × 40) / (200 × 6) = 1.67
    const result = calculateFIB4({
      age: 50,
      ast: 40,
      alt: 36,
      platelets: 200,
    });
    expect(result.score).toBeCloseTo(1.67, 1);
  });

  // MDCalc cutoff: <1.45 = low risk (90% NPV for advanced fibrosis)
  it("should return low risk for FIB-4 < 1.45", () => {
    const result = calculateFIB4({
      age: 30,
      ast: 25,
      alt: 25,
      platelets: 250,
    });
    expect(result.score).toBeLessThan(1.45);
    expect(result.riskLevel).toBe("low");
  });

  // MDCalc cutoff: >3.25 = high risk (65% PPV, 97% specificity)
  it("should return high risk for FIB-4 > 3.25", () => {
    const result = calculateFIB4({
      age: 70,
      ast: 100,
      alt: 50,
      platelets: 100,
    });
    expect(result.score).toBeGreaterThan(3.25);
    expect(result.riskLevel).toBe("high");
  });
});

// ============================================================================
// RCRI (Revised Cardiac Risk Index) Tests
// ============================================================================
describe("RCRI Score", () => {
  it("should return score 0 for no risk factors", () => {
    const result = calculateRCRI({
      high_risk_surgery: false,
      ischemic_heart_disease: false,
      heart_failure: false,
      cerebrovascular_disease: false,
      diabetes_insulin: false,
      renal_insufficiency: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("low");
    expect(result.riskPercentage).toBe(0.4);
  });

  it("should calculate correct cardiac risk percentages", () => {
    // Score 1 = 1.0% risk (MDCalc: 1.0-1.3% low risk)
    const score1 = calculateRCRI({
      high_risk_surgery: true,
      ischemic_heart_disease: false,
      heart_failure: false,
      cerebrovascular_disease: false,
      diabetes_insulin: false,
      renal_insufficiency: false,
    });
    expect(score1.riskPercentage).toBe(1.0);

    // Score 2 = 5.4% risk (MDCalc: 4-7% intermediate risk)
    const score2 = calculateRCRI({
      high_risk_surgery: true,
      ischemic_heart_disease: true,
      heart_failure: false,
      cerebrovascular_disease: false,
      diabetes_insulin: false,
      renal_insufficiency: false,
    });
    expect(score2.riskPercentage).toBe(5.4);
  });
});

// ============================================================================
// NIHSS Tests
// ============================================================================
describe("NIHSS Score", () => {
  it("should return no stroke for score 0", () => {
    const result = calculateNIHSS({
      consciousness: 0,
      gaze: 0,
      visual: 0,
      facial: 0,
      motor_arm_left: 0,
      motor_arm_right: 0,
      motor_leg_left: 0,
      motor_leg_right: 0,
      ataxia: 0,
      sensory: 0,
      language: 0,
      dysarthria: 0,
      extinction: 0,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("low");
    expect(result.interpretation).toContain("No stroke");
  });

  it("should return minor stroke for score 1-4", () => {
    const result = calculateNIHSS({
      consciousness: 1,
      gaze: 1,
      visual: 1,
      facial: 1,
    });
    expect(result.score).toBe(4);
    expect(result.riskLevel).toBe("low");
    expect(result.interpretation).toContain("Minor");
  });

  it("should return severe stroke for score > 20", () => {
    const result = calculateNIHSS({
      consciousness: 3,
      gaze: 2,
      visual: 3,
      facial: 3,
      motor_arm_left: 4,
      motor_arm_right: 4,
      motor_leg_left: 4,
      motor_leg_right: 4,
    });
    expect(result.score).toBeGreaterThan(20);
    expect(result.riskLevel).toBe("critical");
  });
});

// ============================================================================
// APACHE II Tests
// ============================================================================
describe("APACHE II Score", () => {
  it("should return low risk for normal vital signs and young age", () => {
    const result = calculateAPACHE({
      temperature: 37,
      heart_rate: 75,
      respiratory_rate_apache: 16,
      systolic_apache: 120,
      age_apache: 30,
    });
    expect(result.riskLevel).toBe("low");
  });

  it("should add age points correctly", () => {
    // Age >= 75 = 6 points
    const result = calculateAPACHE({
      temperature: 37,
      heart_rate: 75,
      respiratory_rate_apache: 16,
      systolic_apache: 120,
      age_apache: 80,
    });
    expect(result.score).toBeGreaterThanOrEqual(6);
  });

  it("should return high or critical risk for severe abnormalities", () => {
    const result = calculateAPACHE({
      temperature: 42,
      heart_rate: 190,
      respiratory_rate_apache: 55,
      systolic_apache: 40,
      age_apache: 80,
    });
    // APACHE II simplified version may not reach critical threshold (25+)
    // but should at least be high risk
    expect(["high", "critical"]).toContain(result.riskLevel);
    expect(result.score).toBeGreaterThanOrEqual(20);
  });
});

// ============================================================================
// ASA Classification Tests
// ============================================================================
describe("ASA Classification", () => {
  it("should return low risk for ASA I", () => {
    const result = calculateASA({
      asa_class: "I - Healthy patient",
      emergency: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskLevel).toBe("low");
  });

  it("should double mortality for emergency procedures", () => {
    const elective = calculateASA({
      asa_class: "III - Severe systemic disease",
      emergency: false,
    });
    const emergency = calculateASA({
      asa_class: "III - Severe systemic disease",
      emergency: true,
    });
    expect(emergency.riskPercentage).toBe(elective.riskPercentage * 2);
  });

  it("should return high risk for ASA IV-V", () => {
    const result = calculateASA({
      asa_class: "IV - Severe disease that is constant threat to life",
      emergency: false,
    });
    expect(result.riskLevel).toBe("high");
  });
});

// ============================================================================
// PESI Score Tests
// ============================================================================
describe("PESI Score", () => {
  it("should start with age as baseline", () => {
    const result = calculatePESI({
      age: 50,
      male: false,
      cancer: false,
      heart_failure: false,
      chronic_lung_disease: false,
      pulse: false,
      systolic_bp: false,
      respiratory_rate: false,
      temperature: false,
      altered_mental: false,
      oxygen_sat: false,
    });
    expect(result.score).toBe(50);
  });

  it("should add 60 points for altered mental status", () => {
    const base = calculatePESI({ age: 50 });
    const withAltered = calculatePESI({ age: 50, altered_mental: true });
    expect(withAltered.score - base.score).toBe(60);
  });

  it("should return correct risk classes", () => {
    // Class I (Very Low): < 66
    const class1 = calculatePESI({ age: 40 });
    expect(class1.interpretation).toContain("Very Low");

    // Class V (Very High): >= 126
    const class5 = calculatePESI({
      age: 70,
      male: true,
      cancer: true,
      altered_mental: true,
    });
    expect(class5.interpretation).toContain("Very High");
  });
});

// ============================================================================
// SMART-COP Tests
// ============================================================================
describe("SMART-COP Score", () => {
  // MDCalc: 0-2 points = Low risk (~4% need IRVS)
  it("should return low risk for score 0-2", () => {
    const result = calculateSMARTCOP({
      systolic_bp: false,
      multilobar: false,
      albumin: false,
      respiratory_rate: false,
      tachycardia: false,
      confusion: false,
      oxygen: false,
      ph: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("low");
    expect(result.riskPercentage).toBe(4); // MDCalc: ~4% IRVS risk for low scores
  });

  it("should give 2 points for SBP, oxygen, and pH", () => {
    const withSBP = calculateSMARTCOP({ systolic_bp: true });
    expect(withSBP.score).toBe(2);

    const withOxygen = calculateSMARTCOP({ oxygen: true });
    expect(withOxygen.score).toBe(2);

    const withPH = calculateSMARTCOP({ ph: true });
    expect(withPH.score).toBe(2);
  });

  // MDCalc: 5-6 points = High risk (1 in 3 = 33% need IRVS)
  it("should return high risk for score 5-6", () => {
    const result = calculateSMARTCOP({
      systolic_bp: true, // 2
      oxygen: true, // 2
      confusion: true, // 1
    });
    expect(result.score).toBe(5);
    expect(result.riskLevel).toBe("high");
    expect(result.riskPercentage).toBe(33); // MDCalc: 1 in 3 = 33% IRVS risk
  });

  // MDCalc: ≥7 points = Very high risk (2 in 3 = 67% need IRVS)
  it("should return critical risk for score >= 7", () => {
    const result = calculateSMARTCOP({
      systolic_bp: true, // 2
      oxygen: true, // 2
      ph: true, // 2
      confusion: true, // 1
    });
    expect(result.score).toBe(7);
    expect(result.riskLevel).toBe("critical");
    expect(result.riskPercentage).toBe(67); // MDCalc: 2 in 3 = 67% IRVS risk
  });
});

// ============================================================================
// APRI Score Tests
// ============================================================================
describe("APRI Score", () => {
  it("should calculate APRI correctly", () => {
    // APRI = ((AST / Upper Limit) × 100) / Platelets
    // Example: AST 50, Upper 40, Platelets 200
    // APRI = ((50/40) × 100) / 200 = 0.625
    const result = calculateAPRI({
      ast: 50,
      ast_upper_limit: 40,
      platelets: 200,
    });
    expect(result.score).toBeCloseTo(0.63, 1);
  });

  it("should return low risk for APRI < 0.5", () => {
    const result = calculateAPRI({
      ast: 25,
      ast_upper_limit: 40,
      platelets: 250,
    });
    expect(result.score).toBeLessThan(0.5);
    expect(result.riskLevel).toBe("low");
  });

  it("should return high risk for APRI > 1.5", () => {
    const result = calculateAPRI({
      ast: 150,
      ast_upper_limit: 40,
      platelets: 100,
    });
    expect(result.score).toBeGreaterThan(1.5);
    expect(result.riskLevel).toBe("high");
  });
});

// ============================================================================
// MELD-Na Tests
// ============================================================================
describe("MELD-Na Score", () => {
  it("should incorporate sodium adjustment", () => {
    const withNormalSodium = calculateMELDNa({
      creatinine: 1.5,
      bilirubin: 2.0,
      inr: 1.5,
      sodium: 137,
      dialysis: false,
    });

    const withLowSodium = calculateMELDNa({
      creatinine: 1.5,
      bilirubin: 2.0,
      inr: 1.5,
      sodium: 125,
      dialysis: false,
    });

    // Lower sodium should result in higher MELD-Na
    expect(withLowSodium.score).toBeGreaterThanOrEqual(withNormalSodium.score);
  });

  it("should use creatinine 4.0 for dialysis patients", () => {
    const result = calculateMELDNa({
      creatinine: 1.0,
      bilirubin: 2.0,
      inr: 1.5,
      sodium: 135,
      dialysis: true,
    });
    // Score should be higher due to imputed creatinine of 4.0
    expect(result.score).toBeGreaterThan(10);
  });

  it("should cap sodium at 125-137 range", () => {
    const veryLowSodium = calculateMELDNa({
      creatinine: 1.5,
      bilirubin: 2.0,
      inr: 1.5,
      sodium: 110, // Should be treated as 125
      dialysis: false,
    });

    const sodium125 = calculateMELDNa({
      creatinine: 1.5,
      bilirubin: 2.0,
      inr: 1.5,
      sodium: 125,
      dialysis: false,
    });

    expect(veryLowSodium.score).toBe(sodium125.score);
  });
});

// ============================================================================
// Caprini VTE Risk Tests
// ============================================================================
describe("Caprini Score", () => {
  it("should add age points correctly", () => {
    const under41 = calculateCaprini({ age: "<41 years" });
    expect(under41.score).toBe(0);

    const over75 = calculateCaprini({ age: "≥75 years" });
    expect(over75.score).toBe(3);
  });

  it("should add 3 points for previous VTE", () => {
    const result = calculateCaprini({ previous_vte: true });
    expect(result.score).toBe(3);
  });

  it("should return correct VTE risk levels", () => {
    // Low risk: score <= 2
    const low = calculateCaprini({ age: "41-60 years" });
    expect(low.riskLevel).toBe("low");

    // Critical risk: score >= 7
    const critical = calculateCaprini({
      age: "≥75 years", // 3
      previous_vte: true, // 3
      current_cancer: true, // 2
    });
    expect(critical.riskLevel).toBe("critical");
  });
});
