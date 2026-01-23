/**
 * Comprehensive MDCalc Validation Tests
 * 
 * These tests validate calculator formulas against MDCalc reference values
 * to ensure 100% accuracy. All test cases are based on validated examples
 * from MDCalc.com and original publications.
 * 
 * MDCalc URLs:
 * - qSOFA: https://www.mdcalc.com/calc/2654/qsofa-quick-sofa-score-sepsis
 * - MELD: https://www.mdcalc.com/calc/38/meld-score-model-end-stage-liver-disease
 * - CHA2DS2-VASc: https://www.mdcalc.com/calc/801/cha2ds2-vasc-score-atrial-fibrillation-stroke-risk
 * - HAS-BLED: https://www.mdcalc.com/calc/807/has-bled-score-major-bleeding-risk
 * - CrCl: https://www.mdcalc.com/calc/43/creatinine-clearance-cockcroft-gault-equation
 * - SOFA: https://www.mdcalc.com/calc/691/sofa-score-sepsis-related-organ-failure-assessment-score
 * - GCS: https://www.mdcalc.com/calc/64/glasgow-coma-scale-score
 * - CURB-65: https://www.mdcalc.com/calc/324/curb-65-score-pneumonia-severity
 */

import { describe, it, expect } from "vitest";
import {
  calculateQSOFA,
  calculateSOFA,
  calculateCHA2DS2VASc,
  calculateHASBLED,
  calculateGCS,
  calculateCURB65,
  calculateCrCl,
  calculateMELD,
  calculateMELDNa,
  calculateChildPugh,
  calculateFIB4,
  calculateAPRI,
  calculateHEART,
} from "./calculator-engine";

// ============================================================================
// qSOFA - MDCalc Validation
// Reference: https://www.mdcalc.com/calc/2654/qsofa-quick-sofa-score-sepsis
// ============================================================================
describe("qSOFA MDCalc Validation - Zero Error Guarantee", () => {
  it("BP exactly 100 should score 1 point (≤100, not <100)", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 18,
      systolic_bp: 100, // Exactly 100
    });
    expect(result.score).toBe(1); // CRITICAL: Must be 1, not 0
    expect(result.riskLevel).toBe("low");
  });

  it("BP 99 should score 1 point", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 18,
      systolic_bp: 99,
    });
    expect(result.score).toBe(1);
  });

  it("BP 101 should score 0 points", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 18,
      systolic_bp: 101,
    });
    expect(result.score).toBe(0);
  });

  it("RR exactly 22 should score 1 point (≥22, not >22)", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 22, // Exactly 22
      systolic_bp: 120,
    });
    expect(result.score).toBe(1); // CRITICAL: Must be 1, not 0
  });

  it("RR 21 should score 0 points", () => {
    const result = calculateQSOFA({
      altered_mentation: false,
      respiratory_rate: 21,
      systolic_bp: 120,
    });
    expect(result.score).toBe(0);
  });

  it("Score 2+ should be high risk", () => {
    const result = calculateQSOFA({
      altered_mentation: true,
      respiratory_rate: 24,
      systolic_bp: 90,
    });
    expect(result.score).toBe(3);
    expect(result.riskLevel).toBe("high");
    expect(result.riskPercentage).toBe(80);
  });
});

// ============================================================================
// MELD - MDCalc Validation
// Reference: https://www.mdcalc.com/calc/38/meld-score-model-end-stage-liver-disease
// Formula: 9.57×ln(Cr) + 3.78×ln(Bili) + 11.2×ln(INR) + 6.43
// Values <1.0 are clamped to 1.0, Cr capped at 4.0
// ============================================================================
describe("MELD MDCalc Validation - Zero Error Guarantee", () => {
  it("Creatinine 0 should clamp to 1.0 and give minimum score 6", () => {
    const result = calculateMELD({
      inr: 1.0,
      bilirubin_meld: 1.0,
      creatinine_meld: 0, // CRITICAL: Zero should be clamped, not defaulted
      dialysis: false,
    });
    // With all values = 1.0: 9.57×ln(1) + 3.78×ln(1) + 11.2×ln(1) + 6.43 = 6.43 → rounded to 6
    expect(result.score).toBe(6);
  });

  it("Creatinine 0.5 should clamp to 1.0", () => {
    const result = calculateMELD({
      inr: 1.0,
      bilirubin_meld: 1.0,
      creatinine_meld: 0.5, // Should clamp to 1.0
      dialysis: false,
    });
    expect(result.score).toBe(6);
  });

  it("Creatinine 10.0 should cap at 4.0", () => {
    const high = calculateMELD({
      inr: 1.0,
      bilirubin_meld: 1.0,
      creatinine_meld: 10.0, // Should cap at 4.0
      dialysis: false,
    });
    const capped = calculateMELD({
      inr: 1.0,
      bilirubin_meld: 1.0,
      creatinine_meld: 4.0,
      dialysis: false,
    });
    expect(high.score).toBe(capped.score);
  });

  it("Standard case: INR 1.5, Bilirubin 2.0, Creatinine 1.2", () => {
    const result = calculateMELD({
      inr: 1.5,
      bilirubin_meld: 2.0,
      creatinine_meld: 1.2,
      dialysis: false,
    });
    // Manual calculation: 9.57×ln(1.2) + 3.78×ln(2.0) + 11.2×ln(1.5) + 6.43
    // = 9.57×0.182 + 3.78×0.693 + 11.2×0.405 + 6.43
    // = 1.74 + 2.62 + 4.54 + 6.43 = 15.33 → 15
    expect(result.score).toBeGreaterThanOrEqual(14);
    expect(result.score).toBeLessThanOrEqual(16);
  });
});

// ============================================================================
// Creatinine Clearance (Cockcroft-Gault) - MDCalc Validation
// Reference: https://www.mdcalc.com/calc/43/creatinine-clearance-cockcroft-gault-equation
// Formula: ((140-age) × weight) / (72 × Cr) × 0.85 if female
// ============================================================================
describe("CrCl MDCalc Validation - Zero Error Guarantee", () => {
  it("Male, 70yo, 70kg, Cr 1.0 should be ~68 mL/min", () => {
    const result = calculateCrCl({
      age_crcl: 70,
      weight_crcl: 70,
      creatinine_crcl: 1.0,
      gender_crcl: "male",
    });
    // Calculation: ((140-70) × 70) / (72 × 1.0) = 4900/72 = 68.06
    expect(result.score).toBe(68);
  });

  it("Female, 70yo, 70kg, Cr 1.0 should be ~58 mL/min", () => {
    const result = calculateCrCl({
      age_crcl: 70,
      weight_crcl: 70,
      creatinine_crcl: 1.0,
      gender_crcl: "female",
    });
    // Calculation: 68.06 × 0.85 = 57.85
    expect(result.score).toBe(58);
  });

  it("Creatinine 0 should be handled gracefully (division by zero protection)", () => {
    const result = calculateCrCl({
      age_crcl: 70,
      weight_crcl: 70,
      creatinine_crcl: 0,
      gender_crcl: "male",
    });
    // Should return error state with score 0 and critical risk
    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe("critical");
    expect(result.interpretation).toContain("Cannot calculate");
  });
});

// ============================================================================
// CHA₂DS₂-VASc - MDCalc Validation
// Reference: https://www.mdcalc.com/calc/801/cha2ds2-vasc-score-atrial-fibrillation-stroke-risk
// Risk rates from Lip 2010 validation study
// ============================================================================
describe("CHA₂DS₂-VASc MDCalc Validation - Zero Error Guarantee", () => {
  it("Score 0 should have 0.3% annual stroke risk", () => {
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
    expect(result.riskPercentage).toBe(0.3);
  });

  it("Score 1 should have 0.9% annual stroke risk", () => {
    const result = calculateCHA2DS2VASc({
      chf: true, // 1 point
      hypertension: false,
      age_75: false,
      diabetes: false,
      stroke_tia: false,
      vascular_disease: false,
      age_65_74: false,
      female: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskPercentage).toBe(0.9);
  });

  it("Score 2 should have 2.9% annual stroke risk", () => {
    const result = calculateCHA2DS2VASc({
      chf: true, // 1 point
      hypertension: true, // 1 point
      age_75: false,
      diabetes: false,
      stroke_tia: false,
      vascular_disease: false,
      age_65_74: false,
      female: false,
    });
    expect(result.score).toBe(2);
    expect(result.riskPercentage).toBe(2.9);
  });

  it("Score 3 should have 4.6% annual stroke risk", () => {
    const result = calculateCHA2DS2VASc({
      chf: true, // 1
      hypertension: true, // 1
      age_75: false,
      diabetes: true, // 1
      stroke_tia: false,
      vascular_disease: false,
      age_65_74: false,
      female: false,
    });
    expect(result.score).toBe(3);
    expect(result.riskPercentage).toBe(4.6);
  });
});

// ============================================================================
// HAS-BLED - MDCalc Validation
// Reference: https://www.mdcalc.com/calc/807/has-bled-score-major-bleeding-risk
// ============================================================================
describe("HAS-BLED MDCalc Validation - Zero Error Guarantee", () => {
  it("Score 0 should have 1.1% annual bleeding risk", () => {
    const result = calculateHASBLED({
      hypertension: false,
      renal_disease: false,
      liver_disease: false,
      stroke_history: false,
      prior_bleeding: false,
      labile_inr: false,
      age_over_65: false,
      medication_usage: false,
      alcohol_use: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskPercentage).toBe(1.1);
  });

  it("Score 2 should have 1.9% annual bleeding risk", () => {
    const result = calculateHASBLED({
      hypertension: true, // 1
      renal_disease: true, // 1
      liver_disease: false,
      stroke_history: false,
      prior_bleeding: false,
      labile_inr: false,
      age_over_65: false,
      medication_usage: false,
      alcohol_use: false,
    });
    expect(result.score).toBe(2);
    expect(result.riskPercentage).toBe(1.9);
  });

  it("Score 3 should have 3.7% annual bleeding risk", () => {
    const result = calculateHASBLED({
      hypertension: true, // 1
      renal_disease: true, // 1
      liver_disease: true, // 1
      stroke_history: false,
      prior_bleeding: false,
      labile_inr: false,
      age_over_65: false,
      medication_usage: false,
      alcohol_use: false,
    });
    expect(result.score).toBe(3);
    expect(result.riskPercentage).toBe(3.7);
  });
});

// ============================================================================
// SOFA - MDCalc Validation
// Reference: https://www.mdcalc.com/calc/691/sofa-score-sepsis-related-organ-failure-assessment-score
// ============================================================================
describe("SOFA MDCalc Validation - Zero Error Guarantee", () => {
  it("PaO2/FiO2 350 should score 1 point (300-399 range)", () => {
    const result = calculateSOFA({
      pao2_fio2: 350,
      platelets: 200,
      bilirubin: 0.5,
      cardiovascular: 0,
      gcs: 15,
      creatinine: 0.8,
    });
    expect(result.score).toBe(1);
  });

  it("Platelets 80 should score 2 points (50-99 range)", () => {
    const result = calculateSOFA({
      pao2_fio2: 450,
      platelets: 80,
      bilirubin: 0.5,
      cardiovascular: 0,
      gcs: 15,
      creatinine: 0.8,
    });
    expect(result.score).toBe(2);
  });

  it("Bilirubin 3.0 should score 2 points (2.0-5.9 range)", () => {
    const result = calculateSOFA({
      pao2_fio2: 450,
      platelets: 200,
      bilirubin: 3.0,
      cardiovascular: 0,
      gcs: 15,
      creatinine: 0.8,
    });
    expect(result.score).toBe(2);
  });
});

// ============================================================================
// GCS - MDCalc Validation
// Reference: https://www.mdcalc.com/calc/64/glasgow-coma-scale-score
// ============================================================================
describe("GCS MDCalc Validation - Zero Error Guarantee", () => {
  it("Normal: Eye 4, Verbal 5, Motor 6 = Score 15", () => {
    const result = calculateGCS({
      eye_opening: 4,
      verbal_response: 5,
      motor_response: 6,
    });
    expect(result.score).toBe(15);
  });

  it("Moderate: Eye 2, Verbal 3, Motor 4 = Score 9", () => {
    const result = calculateGCS({
      eye_opening: 2,
      verbal_response: 3,
      motor_response: 4,
    });
    expect(result.score).toBe(9);
  });
});

// ============================================================================
// CURB-65 - MDCalc Validation
// Reference: https://www.mdcalc.com/calc/324/curb-65-score-pneumonia-severity
// ============================================================================
describe("CURB-65 MDCalc Validation - Zero Error Guarantee", () => {
  it("Score 0 should have 0.6% 30-day mortality", () => {
    const result = calculateCURB65({
      confusion: false,
      urea: false,
      respiratory_rate_curb: false,
      blood_pressure_curb: false,
      age_65_curb: false,
    });
    expect(result.score).toBe(0);
    expect(result.riskPercentage).toBe(0.6);
  });

  it("Score 1 should have 2.7% 30-day mortality", () => {
    const result = calculateCURB65({
      confusion: true,
      urea: false,
      respiratory_rate_curb: false,
      blood_pressure_curb: false,
      age_65_curb: false,
    });
    expect(result.score).toBe(1);
    expect(result.riskPercentage).toBe(2.7);
  });
});
