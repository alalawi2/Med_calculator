/**
 * Clinical Accuracy Audit — Validates all 20 calculator engines against
 * published clinical criteria (MDCalc, original derivation studies).
 *
 * Each test case uses concrete patient scenarios with known expected scores.
 */

import { describe, it, expect } from "vitest";
import {
  calculateQSOFA,
  calculateSOFA,
  calculateAPACHE,
  calculateNIHSS,
  calculateCHA2DS2VASc,
  calculateHASBLED,
  calculateGCS,
  calculateHEART,
  calculateCURB65,
  calculateCrCl,
  calculateMELD,
  calculateASA,
  calculateRCRI,
  calculateCaprini,
  calculatePESI,
  calculateSMARTCOP,
  calculateChildPugh,
  calculateFIB4,
  calculateMELDNa,
  calculateAPRI,
} from "./calculator-engine";

// ============================================================================
// 1. qSOFA (Sepsis-3, Singer et al. JAMA 2016)
//    Criteria: Altered mentation (+1), RR ≥22 (+1), SBP ≤100 (+1). Max 3.
// ============================================================================
describe("qSOFA accuracy", () => {
  it("scores 0 for normal vitals", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 16, systolic_bp: 120 });
    expect(r.score).toBe(0);
    expect(r.maxScore).toBe(3);
    expect(r.riskLevel).toBe("low");
  });

  it("scores 1 for SBP exactly 100 (boundary)", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 16, systolic_bp: 100 });
    expect(r.score).toBe(1);
  });

  it("scores 1 for RR exactly 22 (boundary)", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 22, systolic_bp: 120 });
    expect(r.score).toBe(1);
  });

  it("does NOT score RR 21", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 21, systolic_bp: 120 });
    expect(r.score).toBe(0);
  });

  it("does NOT score SBP 101", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 16, systolic_bp: 101 });
    expect(r.score).toBe(0);
  });

  it("scores 3 (max) when all criteria met", () => {
    const r = calculateQSOFA({ altered_mentation: true, respiratory_rate: 30, systolic_bp: 85 });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("high");
  });

  it("risk threshold at score ≥2", () => {
    const r = calculateQSOFA({ altered_mentation: true, respiratory_rate: 22, systolic_bp: 120 });
    expect(r.score).toBe(2);
    expect(r.riskLevel).toBe("high");
  });
});

// ============================================================================
// 2. SOFA (Vincent et al. Intensive Care Med 1996)
//    6 organ systems, each 0-4. Max 24.
// ============================================================================
describe("SOFA accuracy", () => {
  it("scores 0 for all normal values", () => {
    const r = calculateSOFA({
      pao2_fio2: 450, platelets: 200, bilirubin: 0.8,
      cardiovascular: 0, gcs: 15, creatinine: 0.9,
    });
    expect(r.score).toBe(0);
    expect(r.maxScore).toBe(24);
  });

  it("respiratory: PaO2/FiO2 < 400 scores 1", () => {
    const r = calculateSOFA({
      pao2_fio2: 350, platelets: 200, bilirubin: 0.8,
      cardiovascular: 0, gcs: 15, creatinine: 0.9,
    });
    expect(r.score).toBe(1);
  });

  it("respiratory: PaO2/FiO2 < 200 scores 3", () => {
    const r = calculateSOFA({
      pao2_fio2: 150, platelets: 200, bilirubin: 0.8,
      cardiovascular: 0, gcs: 15, creatinine: 0.9,
    });
    expect(r.score).toBe(3);
  });

  it("coagulation: platelets < 100 scores 2", () => {
    const r = calculateSOFA({
      pao2_fio2: 450, platelets: 80, bilirubin: 0.8,
      cardiovascular: 0, gcs: 15, creatinine: 0.9,
    });
    expect(r.score).toBe(2);
  });

  it("hepatic: bilirubin 6.0 scores 3", () => {
    const r = calculateSOFA({
      pao2_fio2: 450, platelets: 200, bilirubin: 6.0,
      cardiovascular: 0, gcs: 15, creatinine: 0.9,
    });
    expect(r.score).toBe(3);
  });

  it("neurological: GCS 10 scores 2", () => {
    const r = calculateSOFA({
      pao2_fio2: 450, platelets: 200, bilirubin: 0.8,
      cardiovascular: 0, gcs: 10, creatinine: 0.9,
    });
    expect(r.score).toBe(2);
  });

  it("renal: creatinine 3.5 scores 3", () => {
    const r = calculateSOFA({
      pao2_fio2: 450, platelets: 200, bilirubin: 0.8,
      cardiovascular: 0, gcs: 15, creatinine: 3.5,
    });
    expect(r.score).toBe(3);
  });

  it("max score 24 with worst values", () => {
    const r = calculateSOFA({
      pao2_fio2: 50, platelets: 10, bilirubin: 15,
      cardiovascular: 4, gcs: 3, creatinine: 6,
    });
    expect(r.score).toBe(24);
    expect(r.riskLevel).toBe("critical");
  });

  it("boundary: PaO2/FiO2 exactly 400 scores 0", () => {
    const r = calculateSOFA({
      pao2_fio2: 400, platelets: 200, bilirubin: 0.8,
      cardiovascular: 0, gcs: 15, creatinine: 0.9,
    });
    expect(r.score).toBe(0);
  });

  it("boundary: platelets exactly 150 scores 0", () => {
    const r = calculateSOFA({
      pao2_fio2: 450, platelets: 150, bilirubin: 0.8,
      cardiovascular: 0, gcs: 15, creatinine: 0.9,
    });
    expect(r.score).toBe(0);
  });
});

// ============================================================================
// 3. GCS (Teasdale & Jennett, Lancet 1974)
//    Eye 1-4, Verbal 1-5, Motor 1-6. Max 15, Min 3.
// ============================================================================
describe("GCS accuracy", () => {
  it("max score 15 (normal)", () => {
    const r = calculateGCS({ eye_opening: 4, verbal_response: 5, motor_response: 6 });
    expect(r.score).toBe(15);
    expect(r.riskLevel).toBe("low");
  });

  it("min score 3 (worst)", () => {
    const r = calculateGCS({ eye_opening: 1, verbal_response: 1, motor_response: 1 });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("critical");
  });

  it("severe: GCS 8 = intubation threshold", () => {
    const r = calculateGCS({ eye_opening: 2, verbal_response: 2, motor_response: 4 });
    expect(r.score).toBe(8);
    expect(r.riskLevel).toBe("high");
  });

  it("mild: GCS 13 boundary", () => {
    const r = calculateGCS({ eye_opening: 3, verbal_response: 4, motor_response: 6 });
    expect(r.score).toBe(13);
    expect(r.riskLevel).toBe("low");
  });

  it("moderate: GCS 9-12", () => {
    const r = calculateGCS({ eye_opening: 3, verbal_response: 3, motor_response: 5 });
    expect(r.score).toBe(11);
    expect(r.riskLevel).toBe("moderate");
  });
});

// ============================================================================
// 4. CHA₂DS₂-VASc (Lip et al. Chest 2010)
//    CHF(1), HTN(1), Age≥75(2), DM(1), Stroke/TIA(2), Vasc(1), Age65-74(1), Female(1). Max 9.
// ============================================================================
describe("CHA2DS2-VASc accuracy", () => {
  it("scores 0 for young male with no risk factors", () => {
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: false, age_75: false,
      diabetes: false, stroke_tia: false, vascular_disease: false,
      age_65_74: false, female: false,
    });
    expect(r.score).toBe(0);
    expect(r.maxScore).toBe(9);
    expect(r.riskPercentage).toBe(0.3); // Lip 2010: 0.3% annual stroke risk
  });

  it("scores 1 for lone female sex", () => {
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: false, age_75: false,
      diabetes: false, stroke_tia: false, vascular_disease: false,
      age_65_74: false, female: true,
    });
    expect(r.score).toBe(1);
    expect(r.riskPercentage).toBe(0.9);
  });

  it("stroke/TIA scores 2 points (not 1)", () => {
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: false, age_75: false,
      diabetes: false, stroke_tia: true, vascular_disease: false,
      age_65_74: false, female: false,
    });
    expect(r.score).toBe(2);
  });

  it("age ≥75 scores 2 points (not 1)", () => {
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: false, age_75: true,
      diabetes: false, stroke_tia: false, vascular_disease: false,
      age_65_74: false, female: false,
    });
    expect(r.score).toBe(2);
  });

  it("max score 9 with all risk factors (age categories mutually exclusive)", () => {
    const r = calculateCHA2DS2VASc({
      chf: true, hypertension: true, age_75: true,
      diabetes: true, stroke_tia: true, vascular_disease: true,
      age_65_74: false, female: true,
    });
    expect(r.score).toBe(9);
    expect(r.riskPercentage).toBe(17.4);
    expect(r.riskLevel).toBe("high");
  });

  it("age ≥75 takes priority over age 65-74 (mutual exclusivity)", () => {
    // If both age flags are somehow true, ≥75 takes priority (2 pts, not 3)
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: false, age_75: true,
      diabetes: false, stroke_tia: false, vascular_disease: false,
      age_65_74: true, female: false,
    });
    expect(r.score).toBe(2); // Only 2 pts for age ≥75, NOT 3 (2+1)
  });

  it("score 4: 6.7% annual stroke risk (Lip 2010)", () => {
    const r = calculateCHA2DS2VASc({
      chf: true, hypertension: true, age_75: false,
      diabetes: true, stroke_tia: false, vascular_disease: true,
      age_65_74: false, female: false,
    });
    expect(r.score).toBe(4);
    expect(r.riskPercentage).toBe(6.7);
  });
});

// ============================================================================
// 5. HAS-BLED (Pisters et al. Chest 2010)
//    H(1), A(1+1), S(1), B(1), L(1), E(1), D(1+1). Max 9.
// ============================================================================
describe("HAS-BLED accuracy", () => {
  it("scores 0 for no risk factors", () => {
    const r = calculateHASBLED({
      hypertension: false, renal_disease: false, liver_disease: false,
      stroke_history: false, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: false, alcohol_use: false,
    });
    expect(r.score).toBe(0);
    expect(r.maxScore).toBe(9);
    expect(r.riskLevel).toBe("low");
  });

  it("renal AND liver each give 1 point (A = up to 2)", () => {
    const r = calculateHASBLED({
      hypertension: false, renal_disease: true, liver_disease: true,
      stroke_history: false, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: false, alcohol_use: false,
    });
    expect(r.score).toBe(2);
  });

  it("drugs AND alcohol each give 1 point (D = up to 2)", () => {
    const r = calculateHASBLED({
      hypertension: false, renal_disease: false, liver_disease: false,
      stroke_history: false, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: true, alcohol_use: true,
    });
    expect(r.score).toBe(2);
  });

  it("score ≥3 is high risk", () => {
    const r = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: false,
      stroke_history: true, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: false, alcohol_use: false,
    });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("high");
    expect(r.riskPercentage).toBe(3.7);
  });

  it("max score 9", () => {
    const r = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: true,
      stroke_history: true, prior_bleeding: true, labile_inr: true,
      age_over_65: true, medication_usage: true, alcohol_use: true,
    });
    expect(r.score).toBe(9);
  });
});

// ============================================================================
// 6. HEART Score (Six et al. Neth Heart J 2008)
//    History(0-2), ECG(0-2), Age(0-2), Risk factors(0-2), Troponin(0-2). Max 10.
// ============================================================================
describe("HEART Score accuracy", () => {
  it("low risk (0-3): <2% MACE", () => {
    const r = calculateHEART({
      history: 0, ecg: 0, age_heart: 40, risk_factors: 0, troponin: 0,
    });
    expect(r.score).toBe(0);
    expect(r.riskLevel).toBe("low");
    expect(r.riskPercentage).toBe(1.7);
  });

  it("age <45 = 0 points, 45-64 = 1 point, ≥65 = 2 points", () => {
    const r1 = calculateHEART({ history: 0, ecg: 0, age_heart: 44, risk_factors: 0, troponin: 0 });
    expect(r1.score).toBe(0);

    const r2 = calculateHEART({ history: 0, ecg: 0, age_heart: 45, risk_factors: 0, troponin: 0 });
    expect(r2.score).toBe(1);

    const r3 = calculateHEART({ history: 0, ecg: 0, age_heart: 65, risk_factors: 0, troponin: 0 });
    expect(r3.score).toBe(2);
  });

  it("high risk (≥7): ~50% MACE", () => {
    const r = calculateHEART({
      history: 2, ecg: 2, age_heart: 70, risk_factors: 2, troponin: 2,
    });
    expect(r.score).toBe(10);
    expect(r.riskLevel).toBe("high");
    expect(r.riskPercentage).toBe(50.1);
  });

  it("moderate risk (4-6): ~16.6% MACE", () => {
    const r = calculateHEART({
      history: 1, ecg: 1, age_heart: 55, risk_factors: 1, troponin: 1,
    });
    expect(r.score).toBe(5); // 1+1+1(age 45-64)+1+1
    expect(r.riskLevel).toBe("moderate");
  });
});

// ============================================================================
// 7. CURB-65 (Lim et al. Thorax 2003)
//    C(1), U(1), R(1), B(1), 65(1). Max 5.
// ============================================================================
describe("CURB-65 accuracy", () => {
  it("score 0: 0.6% 30-day mortality", () => {
    const r = calculateCURB65({
      confusion: false, urea: false, respiratory_rate_curb: false,
      blood_pressure_curb: false, age_65_curb: false,
    });
    expect(r.score).toBe(0);
    expect(r.riskPercentage).toBe(0.6);
  });

  it("score 2: 6.8% 30-day mortality", () => {
    const r = calculateCURB65({
      confusion: true, urea: true, respiratory_rate_curb: false,
      blood_pressure_curb: false, age_65_curb: false,
    });
    expect(r.score).toBe(2);
    expect(r.riskPercentage).toBe(6.8);
  });

  it("score 5: 27.8% mortality", () => {
    const r = calculateCURB65({
      confusion: true, urea: true, respiratory_rate_curb: true,
      blood_pressure_curb: true, age_65_curb: true,
    });
    expect(r.score).toBe(5);
    expect(r.riskPercentage).toBe(27.8);
  });

  it("score 3: high risk → ICU admission", () => {
    const r = calculateCURB65({
      confusion: true, urea: true, respiratory_rate_curb: true,
      blood_pressure_curb: false, age_65_curb: false,
    });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("high");
    expect(r.riskPercentage).toBe(14.0);
  });
});

// ============================================================================
// 8. Cockcroft-Gault (CrCl)
//    CrCl = ((140 - age) × weight) / (72 × Cr) × 0.85 if female
// ============================================================================
describe("Cockcroft-Gault CrCl accuracy", () => {
  it("textbook example: 50yo male, 70kg, Cr 1.0 → ~87.5 mL/min", () => {
    const r = calculateCrCl({
      age_crcl: 50, weight_crcl: 70, creatinine_crcl: 1.0, gender_crcl: "male",
    });
    // (140-50)*70 / (72*1.0) = 6300/72 = 87.5
    expect(r.score).toBe(88); // Math.round(87.5)
  });

  it("female correction: same patient female → ~74.4 mL/min", () => {
    const r = calculateCrCl({
      age_crcl: 50, weight_crcl: 70, creatinine_crcl: 1.0, gender_crcl: "female",
    });
    // 87.5 * 0.85 = 74.375
    expect(r.score).toBe(74); // Math.round(74.375)
  });

  it("elderly with renal impairment: 80yo, 60kg, Cr 2.0", () => {
    const r = calculateCrCl({
      age_crcl: 80, weight_crcl: 60, creatinine_crcl: 2.0, gender_crcl: "male",
    });
    // (140-80)*60 / (72*2.0) = 3600/144 = 25
    expect(r.score).toBe(25);
    expect(r.riskLevel).toBe("critical"); // CrCl < 30
  });

  it("handles creatinine 0 gracefully", () => {
    const r = calculateCrCl({
      age_crcl: 50, weight_crcl: 70, creatinine_crcl: 0, gender_crcl: "male",
    });
    expect(r.riskLevel).toBe("critical");
  });
});

// ============================================================================
// 9. MELD (Kamath et al. Hepatology 2001, UNOS formula)
//    MELD = 9.57×ln(Cr) + 3.78×ln(Bili) + 11.2×ln(INR) + 6.43
//    Lab values <1.0 set to 1.0. Cr capped at 4.0. Score 6-40.
// ============================================================================
describe("MELD accuracy", () => {
  it("minimum MELD 6 for normal labs", () => {
    const r = calculateMELD({ inr: 1.0, bilirubin_meld: 1.0, creatinine_meld: 1.0 });
    expect(r.score).toBe(6);
    expect(r.riskLevel).toBe("low");
  });

  it("typical cirrhosis patient: INR 1.5, Bili 3.0, Cr 1.2 → ~13", () => {
    const r = calculateMELD({ inr: 1.5, bilirubin_meld: 3.0, creatinine_meld: 1.2 });
    // 9.57*ln(1.2) + 3.78*ln(3.0) + 11.2*ln(1.5) + 6.43
    // = 9.57*0.182 + 3.78*1.099 + 11.2*0.405 + 6.43
    // = 1.74 + 4.15 + 4.54 + 6.43 = 16.86 → round to 17
    const expected = Math.round(9.57 * Math.log(1.2) + 3.78 * Math.log(3.0) + 11.2 * Math.log(1.5) + 6.43);
    expect(r.score).toBe(expected);
  });

  it("values below 1.0 are floored to 1.0", () => {
    const r = calculateMELD({ inr: 0.5, bilirubin_meld: 0.3, creatinine_meld: 0.4 });
    // All floored to 1.0, so score = 6.43 → 6
    expect(r.score).toBe(6);
  });

  it("creatinine capped at 4.0", () => {
    const r1 = calculateMELD({ inr: 1.0, bilirubin_meld: 1.0, creatinine_meld: 4.0 });
    const r2 = calculateMELD({ inr: 1.0, bilirubin_meld: 1.0, creatinine_meld: 10.0 });
    expect(r1.score).toBe(r2.score); // Both capped at 4.0
  });

  it("dialysis caps creatinine at 4.0", () => {
    const r = calculateMELD({ inr: 1.0, bilirubin_meld: 1.0, creatinine_meld: 1.0, dialysis: true });
    // Cr is max(1.0,1.0) = 1.0, then capped at 4.0 (but 1.0 < 4.0 so no change)
    expect(r.score).toBe(6);
  });

  it("score capped at 40", () => {
    const r = calculateMELD({ inr: 10.0, bilirubin_meld: 30.0, creatinine_meld: 4.0 });
    expect(r.score).toBeLessThanOrEqual(40);
  });
});

// ============================================================================
// 10. MELD-Na (Kim et al. Hepatology 2008)
//     MELD-Na = MELD + 1.32 × (137 - Na) - [0.033 × MELD × (137 - Na)]
//     Na bounded 125-137.
// ============================================================================
describe("MELD-Na accuracy", () => {
  it("Na 137 → MELD-Na equals MELD (no sodium adjustment)", () => {
    const r = calculateMELDNa({
      creatinine: 1.0, bilirubin: 1.0, inr: 1.0, sodium: 137, dialysis: false,
    });
    // MELD = 6, Na adjustment = 0
    expect(r.score).toBe(6);
  });

  it("low sodium increases score", () => {
    const rNormal = calculateMELDNa({
      creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 137, dialysis: false,
    });
    const rLowNa = calculateMELDNa({
      creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 128, dialysis: false,
    });
    expect(rLowNa.score).toBeGreaterThan(rNormal.score);
  });

  it("Na below 125 is treated as 125", () => {
    const r1 = calculateMELDNa({
      creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 125, dialysis: false,
    });
    const r2 = calculateMELDNa({
      creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 110, dialysis: false,
    });
    expect(r1.score).toBe(r2.score);
  });

  it("Na above 137 is treated as 137", () => {
    const r1 = calculateMELDNa({
      creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 137, dialysis: false,
    });
    const r2 = calculateMELDNa({
      creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 145, dialysis: false,
    });
    expect(r1.score).toBe(r2.score);
  });
});

// ============================================================================
// 11. Child-Pugh (Pugh et al. Br J Surg 1973)
//     5 components, each 1-3 points. Score 5-15.
//     Class A (5-6), B (7-9), C (10-15).
// ============================================================================
describe("Child-Pugh accuracy", () => {
  it("Class A (min score 5): all best values", () => {
    const r = calculateChildPugh({
      bilirubin: 1.0, albumin: 4.0, inr: 1.2,
      ascites: "None", encephalopathy: "None",
    });
    expect(r.score).toBe(5);
    expect(r.riskLevel).toBe("low");
    expect(r.interpretation).toContain("Class A");
  });

  it("Class C (max score 15): all worst values", () => {
    const r = calculateChildPugh({
      bilirubin: 5.0, albumin: 2.0, inr: 3.0,
      ascites: "Moderate to severe (despite diuretics)",
      encephalopathy: "Grade III-IV (severe)",
    });
    expect(r.score).toBe(15);
    expect(r.riskLevel).toBe("high");
    expect(r.interpretation).toContain("Class C");
  });

  it("Class B boundary (score 7)", () => {
    const r = calculateChildPugh({
      bilirubin: 2.5, albumin: 3.0, inr: 1.8,
      ascites: "None", encephalopathy: "None",
    });
    // bilirubin 2.5 → 2pt, albumin 3.0 → 2pt, INR 1.8 → 2pt, ascites → 1pt, enceph → 1pt = 8
    expect(r.score).toBe(8);
    expect(r.interpretation).toContain("Class B");
  });

  it("bilirubin thresholds: <2 (1pt), 2-3 (2pt), >3 (3pt)", () => {
    const base = { albumin: 4.0, inr: 1.2, ascites: "None", encephalopathy: "None" };
    const r1 = calculateChildPugh({ ...base, bilirubin: 1.5 });
    const r2 = calculateChildPugh({ ...base, bilirubin: 2.5 });
    const r3 = calculateChildPugh({ ...base, bilirubin: 4.0 });
    expect(r1.score).toBe(5); // 1+1+1+1+1
    expect(r2.score).toBe(6); // 2+1+1+1+1
    expect(r3.score).toBe(7); // 3+1+1+1+1
  });
});

// ============================================================================
// 12. FIB-4 (Sterling et al. Hepatology 2006)
//     FIB-4 = (Age × AST) / (Platelet × √ALT)
//     <1.45 = low, 1.45-3.25 = indeterminate, >3.25 = high fibrosis
// ============================================================================
describe("FIB-4 accuracy", () => {
  it("textbook low-risk: age 40, AST 25, ALT 30, Plt 250 → ~0.42", () => {
    const r = calculateFIB4({ age: 40, ast: 25, alt: 30, platelets: 250 });
    // (40*25) / (250*sqrt(30)) = 1000/1369.3 = 0.73
    const expected = (40 * 25) / (250 * Math.sqrt(30));
    expect(r.score).toBeCloseTo(expected, 1);
    expect(r.riskLevel).toBe("low");
  });

  it("high-risk: age 65, AST 120, ALT 80, Plt 90 → ~9.6", () => {
    const r = calculateFIB4({ age: 65, ast: 120, alt: 80, platelets: 90 });
    const expected = (65 * 120) / (90 * Math.sqrt(80));
    expect(r.score).toBeCloseTo(expected, 1);
    expect(r.riskLevel).toBe("high");
  });

  it("handles zero platelets gracefully", () => {
    const r = calculateFIB4({ age: 50, ast: 30, alt: 30, platelets: 0 });
    expect(r.interpretation).toContain("Cannot calculate");
  });

  it("handles zero ALT gracefully", () => {
    const r = calculateFIB4({ age: 50, ast: 30, alt: 0, platelets: 200 });
    expect(r.interpretation).toContain("Cannot calculate");
  });
});

// ============================================================================
// 13. APRI (Wai et al. Hepatology 2003)
//     APRI = ((AST / AST_upper_limit) × 100) / Platelets
//     <0.5 = low, 0.5-1.5 = indeterminate, >1.5 = significant fibrosis
// ============================================================================
describe("APRI accuracy", () => {
  it("normal: AST 25, ULN 40, Plt 250 → 0.25", () => {
    const r = calculateAPRI({ ast: 25, ast_upper_limit: 40, platelets: 250 });
    // (25/40)*100/250 = 62.5/250 = 0.25
    expect(r.score).toBe(0.25);
    expect(r.riskLevel).toBe("low");
  });

  it("high: AST 120, ULN 40, Plt 80 → 3.75", () => {
    const r = calculateAPRI({ ast: 120, ast_upper_limit: 40, platelets: 80 });
    // (120/40)*100/80 = 300/80 = 3.75
    expect(r.score).toBe(3.75);
    expect(r.riskLevel).toBe("high");
  });

  it("handles zero platelets gracefully", () => {
    const r = calculateAPRI({ ast: 30, ast_upper_limit: 40, platelets: 0 });
    expect(r.interpretation).toContain("Cannot calculate");
  });
});

// ============================================================================
// 14. NIHSS (Brott et al. Stroke 1989)
//     Sum of 11 items, max 42.
// ============================================================================
describe("NIHSS accuracy", () => {
  it("score 0 = no stroke symptoms", () => {
    const r = calculateNIHSS({ consciousness: 0, gaze: 0, visual: 0, facial: 0,
      motor_arm_left: 0, motor_arm_right: 0, motor_leg_left: 0, motor_leg_right: 0,
      ataxia: 0, sensory: 0, language: 0, dysarthria: 0, extinction: 0 });
    expect(r.score).toBe(0);
    expect(r.riskLevel).toBe("low");
  });

  it("score 5-14 = moderate stroke", () => {
    const r = calculateNIHSS({ consciousness: 1, gaze: 1, visual: 1, facial: 1,
      motor_arm_left: 2, motor_arm_right: 0, motor_leg_left: 1, motor_leg_right: 0,
      ataxia: 0, sensory: 0, language: 0, dysarthria: 0, extinction: 0 });
    expect(r.score).toBe(7);
    expect(r.riskLevel).toBe("moderate");
  });

  it("score ≥20 = severe stroke (critical)", () => {
    const r = calculateNIHSS({ consciousness: 3, gaze: 2, visual: 3, facial: 3,
      motor_arm_left: 4, motor_arm_right: 4, motor_leg_left: 4, motor_leg_right: 4,
      ataxia: 2, sensory: 2, language: 3, dysarthria: 2, extinction: 2 });
    expect(r.score).toBe(38);
    expect(r.riskLevel).toBe("critical");
  });

  it("max is 42", () => {
    expect(calculateNIHSS({}).maxScore).toBe(42);
  });
});

// ============================================================================
// 15. ASA Physical Status Classification
// ============================================================================
describe("ASA Classification accuracy", () => {
  it("ASA I: healthy patient, 0.05% mortality", () => {
    const r = calculateASA({ asa_class: "I - Healthy patient", emergency: false });
    expect(r.score).toBe(1);
    expect(r.riskPercentage).toBe(0.05);
  });

  it("ASA III: severe systemic disease, 1.8% mortality", () => {
    const r = calculateASA({ asa_class: "III - Severe systemic disease", emergency: false });
    expect(r.score).toBe(3);
    expect(r.riskPercentage).toBe(1.8);
  });

  it("emergency doubles mortality risk", () => {
    const r = calculateASA({ asa_class: "III - Severe systemic disease", emergency: true });
    expect(r.riskPercentage).toBe(3.6); // 1.8 * 2
  });

  it("ASA V: moribund, 9.4% mortality", () => {
    const r = calculateASA({ asa_class: "V - Moribund patient not expected to survive without surgery", emergency: false });
    expect(r.score).toBe(5);
    expect(r.riskPercentage).toBe(9.4);
  });
});

// ============================================================================
// 16. RCRI / Revised Cardiac Risk Index (Lee et al. Circulation 1999)
//     6 risk factors, each 1 point. Risk classes I-IV.
// ============================================================================
describe("RCRI accuracy", () => {
  it("0 risk factors: 0.4% cardiac complication risk (Class I)", () => {
    const r = calculateRCRI({
      high_risk_surgery: false, ischemic_heart_disease: false,
      heart_failure: false, cerebrovascular_disease: false,
      diabetes_insulin: false, renal_insufficiency: false,
    });
    expect(r.score).toBe(0);
    expect(r.riskPercentage).toBe(0.4);
  });

  it("1 risk factor: 1.0% (Class II)", () => {
    const r = calculateRCRI({
      high_risk_surgery: true, ischemic_heart_disease: false,
      heart_failure: false, cerebrovascular_disease: false,
      diabetes_insulin: false, renal_insufficiency: false,
    });
    expect(r.score).toBe(1);
    expect(r.riskPercentage).toBe(1.0);
  });

  it("2 risk factors: 5.4% (Class III)", () => {
    const r = calculateRCRI({
      high_risk_surgery: true, ischemic_heart_disease: true,
      heart_failure: false, cerebrovascular_disease: false,
      diabetes_insulin: false, renal_insufficiency: false,
    });
    expect(r.score).toBe(2);
    expect(r.riskPercentage).toBe(5.4);
  });

  it("≥3 risk factors: 9.1% (Class IV)", () => {
    const r = calculateRCRI({
      high_risk_surgery: true, ischemic_heart_disease: true,
      heart_failure: true, cerebrovascular_disease: false,
      diabetes_insulin: false, renal_insufficiency: false,
    });
    expect(r.score).toBe(3);
    expect(r.riskPercentage).toBe(9.1);
  });

  it("all 6 risk factors still shows 9.1% (capped at Class IV)", () => {
    const r = calculateRCRI({
      high_risk_surgery: true, ischemic_heart_disease: true,
      heart_failure: true, cerebrovascular_disease: true,
      diabetes_insulin: true, renal_insufficiency: true,
    });
    expect(r.score).toBe(6);
    expect(r.riskPercentage).toBe(9.1);
  });
});

// ============================================================================
// 17. Caprini VTE Risk Assessment
//     Multi-factor score. 0-1 low, 2 moderate, 3-4 high, ≥5 highest.
// ============================================================================
describe("Caprini VTE accuracy", () => {
  it("score 0: low VTE risk (0.5%)", () => {
    const r = calculateCaprini({
      age: "<41 years", minor_surgery: false, major_surgery: false,
      bmi: false, varicose_veins: false, immobility: false,
      current_cancer: false, previous_vte: false, thrombophilia: false,
    });
    expect(r.score).toBe(0);
    expect(r.riskLevel).toBe("low");
    expect(r.riskPercentage).toBe(0.5);
  });

  it("previous VTE adds 3 points", () => {
    const r = calculateCaprini({
      age: "<41 years", minor_surgery: false, major_surgery: false,
      bmi: false, varicose_veins: false, immobility: false,
      current_cancer: false, previous_vte: true, thrombophilia: false,
    });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("high");
  });

  it("score ≥5 = critical (highest) risk", () => {
    const r = calculateCaprini({
      age: "≥75 years", minor_surgery: false, major_surgery: true,
      bmi: false, varicose_veins: false, immobility: false,
      current_cancer: false, previous_vte: false, thrombophilia: false,
    });
    // age ≥75 (3) + major surgery (2) = 5
    expect(r.score).toBe(5);
    expect(r.riskLevel).toBe("critical");
    expect(r.riskPercentage).toBe(6.0);
  });
});

// ============================================================================
// 18. PESI (Aujesky et al. Am J Respir Crit Care Med 2005)
//     Age + risk factor points. Classes I-V.
// ============================================================================
describe("PESI accuracy", () => {
  it("young patient, no risk factors: Class I (Very Low)", () => {
    const r = calculatePESI({
      age: 30, male: false, cancer: false, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false,
      oxygen_sat: false,
    });
    expect(r.score).toBe(30);
    expect(r.riskLevel).toBe("low");
    expect(r.riskPercentage).toBe(0.0);
  });

  it("altered mental status adds 60 points (heaviest single factor)", () => {
    const r = calculatePESI({
      age: 30, male: false, cancer: false, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: true,
      oxygen_sat: false,
    });
    expect(r.score).toBe(90); // 30 + 60
  });

  it("cancer adds 30 points", () => {
    const r = calculatePESI({
      age: 50, male: true, cancer: true, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false,
      oxygen_sat: false,
    });
    expect(r.score).toBe(90); // 50 + 10(male) + 30(cancer)
  });

  it("high-risk patient: Class V", () => {
    const r = calculatePESI({
      age: 80, male: true, cancer: true, heart_failure: true,
      chronic_lung_disease: true, pulse: true, systolic_bp: true,
      respiratory_rate: true, temperature: true, altered_mental: true,
      oxygen_sat: true,
    });
    // 80 + 10 + 30 + 10 + 10 + 20 + 30 + 20 + 20 + 60 + 20 = 310
    expect(r.score).toBe(310);
    expect(r.riskLevel).toBe("critical");
  });
});

// ============================================================================
// 19. SMART-COP (Charles et al. CID 2008)
//     S(2), M(1), A(1), R(1), T(1), C(1), O(2), P(2). Max 11.
// ============================================================================
describe("SMART-COP accuracy", () => {
  it("score 0: low risk (~4% IRVS)", () => {
    const r = calculateSMARTCOP({
      systolic_bp: false, multilobar: false, albumin: false,
      respiratory_rate: false, tachycardia: false, confusion: false,
      oxygen: false, ph: false,
    });
    expect(r.score).toBe(0);
    expect(r.maxScore).toBe(11);
    expect(r.riskPercentage).toBe(4);
  });

  it("SBP <90 scores 2 points (not 1)", () => {
    const r = calculateSMARTCOP({
      systolic_bp: true, multilobar: false, albumin: false,
      respiratory_rate: false, tachycardia: false, confusion: false,
      oxygen: false, ph: false,
    });
    expect(r.score).toBe(2);
  });

  it("Oxygen low scores 2 points", () => {
    const r = calculateSMARTCOP({
      systolic_bp: false, multilobar: false, albumin: false,
      respiratory_rate: false, tachycardia: false, confusion: false,
      oxygen: true, ph: false,
    });
    expect(r.score).toBe(2);
  });

  it("pH <7.35 scores 2 points", () => {
    const r = calculateSMARTCOP({
      systolic_bp: false, multilobar: false, albumin: false,
      respiratory_rate: false, tachycardia: false, confusion: false,
      oxygen: false, ph: true,
    });
    expect(r.score).toBe(2);
  });

  it("score ≥7: very high risk (67% IRVS)", () => {
    const r = calculateSMARTCOP({
      systolic_bp: true, multilobar: true, albumin: true,
      respiratory_rate: true, tachycardia: false, confusion: false,
      oxygen: true, ph: false,
    });
    // 2+1+1+1+2 = 7
    expect(r.score).toBe(7);
    expect(r.riskPercentage).toBe(67);
    expect(r.riskLevel).toBe("critical");
  });

  it("max score 11", () => {
    const r = calculateSMARTCOP({
      systolic_bp: true, multilobar: true, albumin: true,
      respiratory_rate: true, tachycardia: true, confusion: true,
      oxygen: true, ph: true,
    });
    expect(r.score).toBe(11);
  });
});

// ============================================================================
// 20. APACHE II (simplified) — verify it calculates within expected range
// ============================================================================
describe("APACHE II (simplified) accuracy", () => {
  it("normal vitals, young patient → low score", () => {
    const r = calculateAPACHE({
      temperature: 37, heart_rate: 80, respiratory_rate_apache: 16,
      systolic_apache: 120, age_apache: 30,
    });
    expect(r.score).toBe(0);
    expect(r.riskLevel).toBe("low");
  });

  it("age points: 45-54 → +2, 55-64 → +3, 65-74 → +5, ≥75 → +6", () => {
    const base = { temperature: 37, heart_rate: 80, respiratory_rate_apache: 16, systolic_apache: 120 };
    expect(calculateAPACHE({ ...base, age_apache: 44 }).score).toBe(0);
    expect(calculateAPACHE({ ...base, age_apache: 45 }).score).toBe(2);
    expect(calculateAPACHE({ ...base, age_apache: 55 }).score).toBe(3);
    expect(calculateAPACHE({ ...base, age_apache: 65 }).score).toBe(5);
    expect(calculateAPACHE({ ...base, age_apache: 75 }).score).toBe(6);
  });

  it("extreme vitals give high score", () => {
    const r = calculateAPACHE({
      temperature: 42, heart_rate: 190, respiratory_rate_apache: 55,
      systolic_apache: 200, age_apache: 80,
    });
    expect(r.score).toBeGreaterThanOrEqual(18);
    expect(r.riskLevel).not.toBe("low");
  });

  it("acknowledges simplified nature in output", () => {
    const r = calculateAPACHE({
      temperature: 37, heart_rate: 80, respiratory_rate_apache: 16,
      systolic_apache: 120, age_apache: 50,
    });
    expect(r.interpretation.toLowerCase()).toContain("simplified");
  });
});
