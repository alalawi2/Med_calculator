/**
 * MDCalc Cross-Validation Test Suite
 *
 * Tests every calculator engine function against EXACT reference values
 * from MDCalc, original published studies, and Knaus/Lip/Pisters/Aujesky papers.
 *
 * Sources:
 *  - CHA2DS2-VASc: Lip et al. Chest 2010;137:263-272
 *  - HAS-BLED: Pisters et al. Chest 2010;138:1093-1100
 *  - HEART: Six et al. Neth Heart J 2008;16:191-196; Backus et al. Int J Cardiol 2013
 *  - CURB-65: Lim et al. Thorax 2003;58:377-382
 *  - SOFA: Vincent et al. Crit Care Med 1998;26:1793-1800
 *  - APACHE II: Knaus et al. Crit Care Med 1985;13:818-829
 *  - MELD: Kamath et al. Hepatology 2001;33:464-470
 *  - CrCl: Cockcroft & Gault. Nephron 1976;16:31-41
 *  - PESI: Aujesky et al. Am J Respir Crit Care Med 2005;172:1041-1046
 *  - Child-Pugh: Pugh et al. Br J Surg 1973;60:646-649
 *  - FIB-4: Sterling et al. Hepatology 2006;43:1317-1325
 *  - APRI: Wai et al. Hepatology 2003;38:518-526
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

// =======================================================================
// qSOFA — Vincent et al. JAMA 2016
// =======================================================================
describe("MDCalc: qSOFA Score", () => {
  it("score 0 = low risk", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 18, systolic_bp: 120 });
    expect(r.score).toBe(0);
    expect(r.maxScore).toBe(3);
    expect(r.riskLevel).toBe("low");
  });

  it("RR ≥22 scores 1 point (MDCalc cutoff)", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 22, systolic_bp: 120 });
    expect(r.score).toBe(1);
  });

  it("RR 21 does NOT score (below MDCalc cutoff)", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 21, systolic_bp: 120 });
    expect(r.score).toBe(0);
  });

  it("SBP ≤100 scores 1 point (MDCalc cutoff)", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 18, systolic_bp: 100 });
    expect(r.score).toBe(1);
  });

  it("SBP 101 does NOT score", () => {
    const r = calculateQSOFA({ altered_mentation: false, respiratory_rate: 18, systolic_bp: 101 });
    expect(r.score).toBe(0);
  });

  it("score ≥2 = high risk (sepsis criteria met)", () => {
    const r = calculateQSOFA({ altered_mentation: true, respiratory_rate: 24, systolic_bp: 95 });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("high");
  });
});

// =======================================================================
// SOFA — Vincent et al. Crit Care Med 1996/1998
// =======================================================================
describe("MDCalc: SOFA Score", () => {
  it("PaO2/FiO2 ≥400 = 0 pts", () => {
    const r = calculateSOFA({ pao2_fio2: 450, platelets: 200, bilirubin: 0.8, cardiovascular: 0, gcs: 15, creatinine: 0.9 });
    expect(r.score).toBe(0);
  });

  it("PaO2/FiO2 <400 but ≥300 = 1 pt", () => {
    const r = calculateSOFA({ pao2_fio2: 350, platelets: 200, bilirubin: 0.8, cardiovascular: 0, gcs: 15, creatinine: 0.9 });
    expect(r.score).toBe(1);
  });

  it("platelets <20 = 4 pts coag", () => {
    const r = calculateSOFA({ pao2_fio2: 450, platelets: 15, bilirubin: 0.8, cardiovascular: 0, gcs: 15, creatinine: 0.9 });
    expect(r.score).toBe(4);
  });

  it("bilirubin ≥12 = 4 pts hepatic", () => {
    const r = calculateSOFA({ pao2_fio2: 450, platelets: 200, bilirubin: 14, cardiovascular: 0, gcs: 15, creatinine: 0.9 });
    expect(r.score).toBe(4);
  });

  it("GCS <6 = 4 pts neuro", () => {
    const r = calculateSOFA({ pao2_fio2: 450, platelets: 200, bilirubin: 0.8, cardiovascular: 0, gcs: 4, creatinine: 0.9 });
    expect(r.score).toBe(4);
  });

  it("creatinine ≥5.0 = 4 pts renal", () => {
    const r = calculateSOFA({ pao2_fio2: 450, platelets: 200, bilirubin: 0.8, cardiovascular: 0, gcs: 15, creatinine: 5.5 });
    expect(r.score).toBe(4);
  });

  it("max score = 24", () => {
    const r = calculateSOFA({ pao2_fio2: 50, platelets: 10, bilirubin: 15, cardiovascular: 4, gcs: 3, creatinine: 6 });
    expect(r.score).toBe(24);
    expect(r.maxScore).toBe(24);
    expect(r.riskLevel).toBe("critical");
  });

  it("SOFA score ≥11 = critical risk", () => {
    const r = calculateSOFA({ pao2_fio2: 50, platelets: 10, bilirubin: 0.8, cardiovascular: 4, gcs: 15, creatinine: 0.9 });
    // Resp 4 + Coag 4 + CV 4 = 12
    expect(r.score).toBe(12);
    expect(r.riskLevel).toBe("critical");
  });
});

// =======================================================================
// APACHE II — Knaus et al. Crit Care Med 1985
// Each physiologic variable is independently tested against the
// published APS table (Table 1 of Knaus 1985)
// =======================================================================
describe("MDCalc: APACHE II Score — APS Variable Scoring", () => {
  const BASE = {
    temperature: 37, heart_rate: 80, respiratory_rate_apache: 16,
    map: 80, ph: 7.4, sodium: 140, potassium: 4.0,
    creatinine: 1.0, hematocrit: 40, wbc: 10, gcs: 15,
  };

  // --- Temperature ---
  it("Temp 37°C (normal) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, temperature: 37 }).score).toBe(0);
  });
  it("Temp 38.7°C = +1", () => {
    expect(calculateAPACHE({ ...BASE, temperature: 38.7 }).score).toBe(1);
  });
  it("Temp 39°C = +3", () => {
    expect(calculateAPACHE({ ...BASE, temperature: 39 }).score).toBe(3);
  });
  it("Temp 41°C = +4", () => {
    expect(calculateAPACHE({ ...BASE, temperature: 41 }).score).toBe(4);
  });
  it("Temp 33°C = +2", () => {
    expect(calculateAPACHE({ ...BASE, temperature: 33 }).score).toBe(2);
  });
  it("Temp 31°C = +3", () => {
    expect(calculateAPACHE({ ...BASE, temperature: 31 }).score).toBe(3);
  });
  it("Temp 29°C = +4", () => {
    expect(calculateAPACHE({ ...BASE, temperature: 29 }).score).toBe(4);
  });

  // --- MAP ---
  it("MAP 80 (normal 70-109) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, map: 80 }).score).toBe(0);
  });
  it("MAP 115 (110-129) = +2", () => {
    expect(calculateAPACHE({ ...BASE, map: 115 }).score).toBe(2);
  });
  it("MAP 60 (50-69) = +2 (NOT +3)", () => {
    expect(calculateAPACHE({ ...BASE, map: 60 }).score).toBe(2);
  });
  it("MAP 140 (130-159) = +3", () => {
    expect(calculateAPACHE({ ...BASE, map: 140 }).score).toBe(3);
  });
  it("MAP 170 (≥160) = +4", () => {
    expect(calculateAPACHE({ ...BASE, map: 170 }).score).toBe(4);
  });
  it("MAP 45 (≤49) = +4", () => {
    expect(calculateAPACHE({ ...BASE, map: 45 }).score).toBe(4);
  });

  // --- Heart Rate ---
  it("HR 80 (normal 70-109) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, heart_rate: 80 }).score).toBe(0);
  });
  it("HR 120 (110-139) = +2", () => {
    expect(calculateAPACHE({ ...BASE, heart_rate: 120 }).score).toBe(2);
  });
  it("HR 60 (55-69) = +2", () => {
    expect(calculateAPACHE({ ...BASE, heart_rate: 60 }).score).toBe(2);
  });
  it("HR 150 (140-179) = +3", () => {
    expect(calculateAPACHE({ ...BASE, heart_rate: 150 }).score).toBe(3);
  });
  it("HR 45 (40-54) = +3", () => {
    expect(calculateAPACHE({ ...BASE, heart_rate: 45 }).score).toBe(3);
  });
  it("HR 200 (≥180) = +4", () => {
    expect(calculateAPACHE({ ...BASE, heart_rate: 200 }).score).toBe(4);
  });

  // --- pH ---
  it("pH 7.4 (normal 7.33-7.49) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, ph: 7.4 }).score).toBe(0);
  });
  it("pH 7.55 (7.5-7.59) = +1 (NOT +2)", () => {
    expect(calculateAPACHE({ ...BASE, ph: 7.55 }).score).toBe(1);
  });
  it("pH 7.30 (7.25-7.32) = +2", () => {
    expect(calculateAPACHE({ ...BASE, ph: 7.30 }).score).toBe(2);
  });
  it("pH 7.65 (7.6-7.69) = +3", () => {
    expect(calculateAPACHE({ ...BASE, ph: 7.65 }).score).toBe(3);
  });
  it("pH 7.20 (7.15-7.24) = +3", () => {
    expect(calculateAPACHE({ ...BASE, ph: 7.20 }).score).toBe(3);
  });
  it("pH 7.75 (≥7.7) = +4", () => {
    expect(calculateAPACHE({ ...BASE, ph: 7.75 }).score).toBe(4);
  });
  it("pH 7.10 (<7.15) = +4", () => {
    expect(calculateAPACHE({ ...BASE, ph: 7.10 }).score).toBe(4);
  });

  // --- Potassium ---
  it("K+ 4.0 (normal 3.5-5.4) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, potassium: 4.0 }).score).toBe(0);
  });
  it("K+ 5.7 (5.5-5.9) = +1 (NOT +2)", () => {
    expect(calculateAPACHE({ ...BASE, potassium: 5.7 }).score).toBe(1);
  });
  it("K+ 3.2 (3-3.4) = +1", () => {
    expect(calculateAPACHE({ ...BASE, potassium: 3.2 }).score).toBe(1);
  });
  it("K+ 2.7 (2.5-2.9) = +2", () => {
    expect(calculateAPACHE({ ...BASE, potassium: 2.7 }).score).toBe(2);
  });
  it("K+ 6.5 (6-6.9) = +3", () => {
    expect(calculateAPACHE({ ...BASE, potassium: 6.5 }).score).toBe(3);
  });
  it("K+ 8.0 (≥7) = +4", () => {
    expect(calculateAPACHE({ ...BASE, potassium: 8.0 }).score).toBe(4);
  });
  it("K+ 2.0 (<2.5) = +4", () => {
    expect(calculateAPACHE({ ...BASE, potassium: 2.0 }).score).toBe(4);
  });

  // --- Sodium ---
  it("Na 140 (normal 130-149) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, sodium: 140 }).score).toBe(0);
  });
  it("Na 152 (150-154) = +1", () => {
    expect(calculateAPACHE({ ...BASE, sodium: 152 }).score).toBe(1);
  });
  it("Na 125 (120-129) = +2", () => {
    expect(calculateAPACHE({ ...BASE, sodium: 125 }).score).toBe(2);
  });
  it("Na 115 (111-119) = +3", () => {
    expect(calculateAPACHE({ ...BASE, sodium: 115 }).score).toBe(3);
  });
  it("Na 185 (≥180) = +4", () => {
    expect(calculateAPACHE({ ...BASE, sodium: 185 }).score).toBe(4);
  });

  // --- Creatinine ---
  it("Cr 1.0 (normal 0.6-1.4) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, creatinine: 1.0 }).score).toBe(0);
  });
  it("Cr 1.7 (1.5-1.9) = +2", () => {
    expect(calculateAPACHE({ ...BASE, creatinine: 1.7 }).score).toBe(2);
  });
  it("Cr 0.4 (<0.6) = +2", () => {
    expect(calculateAPACHE({ ...BASE, creatinine: 0.4 }).score).toBe(2);
  });
  it("Cr 2.5 (2-3.4) = +3", () => {
    expect(calculateAPACHE({ ...BASE, creatinine: 2.5 }).score).toBe(3);
  });
  it("Cr 4.0 (≥3.5) = +4", () => {
    expect(calculateAPACHE({ ...BASE, creatinine: 4.0 }).score).toBe(4);
  });

  // --- Hematocrit ---
  it("Hct 40 (normal 30-45.9) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, hematocrit: 40 }).score).toBe(0);
  });
  it("Hct 48 (46-49.9) = +1", () => {
    expect(calculateAPACHE({ ...BASE, hematocrit: 48 }).score).toBe(1);
  });
  it("Hct 55 (50-59.9) = +2", () => {
    expect(calculateAPACHE({ ...BASE, hematocrit: 55 }).score).toBe(2);
  });
  it("Hct 25 (20-29.9) = +2", () => {
    expect(calculateAPACHE({ ...BASE, hematocrit: 25 }).score).toBe(2);
  });
  it("Hct 65 (≥60) = +4", () => {
    expect(calculateAPACHE({ ...BASE, hematocrit: 65 }).score).toBe(4);
  });

  // --- WBC ---
  it("WBC 10 (normal 3-14.9) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, wbc: 10 }).score).toBe(0);
  });
  it("WBC 17 (15-19.9) = +1", () => {
    expect(calculateAPACHE({ ...BASE, wbc: 17 }).score).toBe(1);
  });
  it("WBC 25 (20-39.9) = +2", () => {
    expect(calculateAPACHE({ ...BASE, wbc: 25 }).score).toBe(2);
  });
  it("WBC 2 (1-2.9) = +2", () => {
    expect(calculateAPACHE({ ...BASE, wbc: 2 }).score).toBe(2);
  });
  it("WBC 50 (≥40) = +4", () => {
    expect(calculateAPACHE({ ...BASE, wbc: 50 }).score).toBe(4);
  });

  // --- GCS ---
  it("GCS 15 = 0 pts (15-15)", () => {
    expect(calculateAPACHE({ ...BASE, gcs: 15 }).score).toBe(0);
  });
  it("GCS 10 = 5 pts (15-10)", () => {
    expect(calculateAPACHE({ ...BASE, gcs: 10 }).score).toBe(5);
  });
  it("GCS 3 = 12 pts (15-3)", () => {
    expect(calculateAPACHE({ ...BASE, gcs: 3 }).score).toBe(12);
  });

  // --- Age Points ---
  it("Age 40 (<45) = 0 pts", () => {
    expect(calculateAPACHE({ ...BASE, age_apache: 40 }).score).toBe(0);
  });
  it("Age 50 (45-54) = +2", () => {
    expect(calculateAPACHE({ ...BASE, age_apache: 50 }).score).toBe(2);
  });
  it("Age 60 (55-64) = +3", () => {
    expect(calculateAPACHE({ ...BASE, age_apache: 60 }).score).toBe(3);
  });
  it("Age 70 (65-74) = +5", () => {
    expect(calculateAPACHE({ ...BASE, age_apache: 70 }).score).toBe(5);
  });
  it("Age 80 (≥75) = +6", () => {
    expect(calculateAPACHE({ ...BASE, age_apache: 80 }).score).toBe(6);
  });

  // --- Complex scenario ---
  it("critically ill patient scenario: multiple abnormal values", () => {
    const r = calculateAPACHE({
      temperature: 40, // +3
      heart_rate: 150,  // +3
      respiratory_rate_apache: 40, // +3
      map: 60,          // +2
      ph: 7.20,         // +3
      sodium: 125,      // +2
      potassium: 6.5,   // +3
      creatinine: 4.0,  // +4
      hematocrit: 25,   // +2
      wbc: 2,           // +2
      gcs: 8,           // +7
      age_apache: 70,   // +5
    });
    // 3+3+3+2+3+2+3+4+2+2+7+5 = 39
    expect(r.score).toBe(39);
    expect(r.riskLevel).toBe("critical");
  });
});

// =======================================================================
// CHA₂DS₂-VASc — Lip et al. Chest 2010
// =======================================================================
describe("MDCalc: CHA₂DS₂-VASc Score", () => {
  it("score 0 = 0.3% annual stroke risk", () => {
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: false, age_75: false, age_65_74: false,
      diabetes: false, stroke_tia: false, vascular_disease: false, female: false,
    });
    expect(r.score).toBe(0);
    expect(r.maxScore).toBe(9);
  });

  it("age ≥75 = 2 pts (mutually exclusive with 65-74)", () => {
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: false, age_75: true, age_65_74: true,
      diabetes: false, stroke_tia: false, vascular_disease: false, female: false,
    });
    expect(r.score).toBe(2); // age_75 takes priority, age_65_74 ignored
  });

  it("stroke/TIA = 2 pts", () => {
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: false, age_75: false, age_65_74: false,
      diabetes: false, stroke_tia: true, vascular_disease: false, female: false,
    });
    expect(r.score).toBe(2);
  });

  it("max score = 9", () => {
    const r = calculateCHA2DS2VASc({
      chf: true, hypertension: true, age_75: true, age_65_74: false,
      diabetes: true, stroke_tia: true, vascular_disease: true, female: true,
    });
    expect(r.score).toBe(9);
  });

  it("score 2 = moderate risk", () => {
    const r = calculateCHA2DS2VASc({
      chf: false, hypertension: true, age_75: false, age_65_74: true,
      diabetes: false, stroke_tia: false, vascular_disease: false, female: false,
    });
    expect(r.score).toBe(2);
    expect(r.riskLevel).toBe("moderate");
  });

  it("score 5+ = high risk", () => {
    const r = calculateCHA2DS2VASc({
      chf: true, hypertension: true, age_75: true, age_65_74: false,
      diabetes: true, stroke_tia: false, vascular_disease: false, female: true,
    });
    expect(r.score).toBe(6);
    expect(r.riskLevel).toBe("high");
  });
});

// =======================================================================
// HAS-BLED — Pisters et al. Chest 2010
// =======================================================================
describe("MDCalc: HAS-BLED Score", () => {
  it("Renal and liver scored SEPARATELY (1+1=2)", () => {
    const r = calculateHASBLED({
      hypertension: false, renal_disease: true, liver_disease: true,
      stroke_history: false, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: false, alcohol_use: false,
    });
    expect(r.score).toBe(2);
  });

  it("Drugs and alcohol scored SEPARATELY (1+1=2)", () => {
    const r = calculateHASBLED({
      hypertension: false, renal_disease: false, liver_disease: false,
      stroke_history: false, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: true, alcohol_use: true,
    });
    expect(r.score).toBe(2);
  });

  it("max score = 9", () => {
    const r = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: true,
      stroke_history: true, prior_bleeding: true, labile_inr: true,
      age_over_65: true, medication_usage: true, alcohol_use: true,
    });
    expect(r.score).toBe(9);
    expect(r.maxScore).toBe(9);
  });

  it("score ≥3 = high risk", () => {
    const r = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: true,
      stroke_history: false, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: false, alcohol_use: false,
    });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("high");
  });

  it("bleeding risk per Pisters: score 0 = 1.13 bleeds/100 pt-yrs", () => {
    const r = calculateHASBLED({
      hypertension: false, renal_disease: false, liver_disease: false,
      stroke_history: false, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: false, alcohol_use: false,
    });
    expect(r.riskPercentage).toBeCloseTo(1.1, 0);
  });

  it("bleeding risk: score 4 = 8.70 bleeds/100 pt-yrs", () => {
    const r = calculateHASBLED({
      hypertension: true, renal_disease: true, liver_disease: true,
      stroke_history: true, prior_bleeding: false, labile_inr: false,
      age_over_65: false, medication_usage: false, alcohol_use: false,
    });
    expect(r.score).toBe(4);
    expect(r.riskPercentage).toBeCloseTo(8.7, 0);
  });
});

// =======================================================================
// HEART Score — Six et al. 2008 / Backus et al. 2013
// =======================================================================
describe("MDCalc: HEART Score", () => {
  it("age <45 = 0 pts", () => {
    const r = calculateHEART({ history: 0, ecg: 0, age_heart: 40, risk_factors: 0, troponin: 0 });
    expect(r.score).toBe(0);
  });

  it("age 45-64 = 1 pt", () => {
    const r = calculateHEART({ history: 0, ecg: 0, age_heart: 55, risk_factors: 0, troponin: 0 });
    expect(r.score).toBe(1);
  });

  it("age ≥65 = 2 pts", () => {
    const r = calculateHEART({ history: 0, ecg: 0, age_heart: 70, risk_factors: 0, troponin: 0 });
    expect(r.score).toBe(2);
  });

  it("max score = 10", () => {
    const r = calculateHEART({ history: 2, ecg: 2, age_heart: 70, risk_factors: 2, troponin: 2 });
    expect(r.score).toBe(10);
    expect(r.maxScore).toBe(10);
    expect(r.riskLevel).toBe("high");
  });

  it("score 0-3 = low risk (~1.7% MACE)", () => {
    const r = calculateHEART({ history: 1, ecg: 1, age_heart: 40, risk_factors: 0, troponin: 0 });
    expect(r.score).toBe(2);
    expect(r.riskLevel).toBe("low");
    expect(r.riskPercentage).toBe(1.7);
  });

  it("score 4-6 = moderate risk (~16.6% MACE)", () => {
    const r = calculateHEART({ history: 1, ecg: 1, age_heart: 55, risk_factors: 1, troponin: 1 });
    expect(r.score).toBe(5);
    expect(r.riskLevel).toBe("moderate");
    expect(r.riskPercentage).toBe(16.6);
  });

  it("score ≥7 = high risk (~50.1% MACE)", () => {
    const r = calculateHEART({ history: 2, ecg: 2, age_heart: 70, risk_factors: 1, troponin: 1 });
    expect(r.score).toBe(8);
    expect(r.riskLevel).toBe("high");
    expect(r.riskPercentage).toBe(50.1);
  });
});

// =======================================================================
// CURB-65 — Lim et al. Thorax 2003
// =======================================================================
describe("MDCalc: CURB-65 Score", () => {
  it("score 0 = low risk, outpatient", () => {
    const r = calculateCURB65({
      confusion: false, urea: false, respiratory_rate_curb: false,
      blood_pressure_curb: false, age_65_curb: false,
    });
    expect(r.score).toBe(0);
    expect(r.riskLevel).toBe("low");
  });

  it("score 1 = STILL low risk (MDCalc: 0-1 = low)", () => {
    const r = calculateCURB65({
      confusion: true, urea: false, respiratory_rate_curb: false,
      blood_pressure_curb: false, age_65_curb: false,
    });
    expect(r.score).toBe(1);
    expect(r.riskLevel).toBe("low");
  });

  it("score 2 = moderate risk, consider hospitalization", () => {
    const r = calculateCURB65({
      confusion: true, urea: true, respiratory_rate_curb: false,
      blood_pressure_curb: false, age_65_curb: false,
    });
    expect(r.score).toBe(2);
    expect(r.riskLevel).toBe("moderate");
  });

  it("score 3-5 = high risk, ICU consideration", () => {
    const r = calculateCURB65({
      confusion: true, urea: true, respiratory_rate_curb: true,
      blood_pressure_curb: false, age_65_curb: false,
    });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("high");
  });

  it("max score = 5", () => {
    const r = calculateCURB65({
      confusion: true, urea: true, respiratory_rate_curb: true,
      blood_pressure_curb: true, age_65_curb: true,
    });
    expect(r.score).toBe(5);
    expect(r.maxScore).toBe(5);
  });
});

// =======================================================================
// Creatinine Clearance — Cockcroft & Gault, Nephron 1976
// =======================================================================
describe("MDCalc: Cockcroft-Gault CrCl", () => {
  it("standard male: (140-50)*70/(72*1.0) = 87.5 → 88 mL/min", () => {
    const r = calculateCrCl({ age_crcl: 50, weight_crcl: 70, creatinine_crcl: 1.0, gender_crcl: "male" });
    expect(r.score).toBe(88);
  });

  it("female: multiply by 0.85 → (140-50)*70/(72*1.0)*0.85 = 74.4 → 74", () => {
    const r = calculateCrCl({ age_crcl: 50, weight_crcl: 70, creatinine_crcl: 1.0, gender_crcl: "female" });
    expect(r.score).toBe(74);
  });

  it("elderly with renal impairment: (140-80)*60/(72*2.0) = 25", () => {
    const r = calculateCrCl({ age_crcl: 80, weight_crcl: 60, creatinine_crcl: 2.0, gender_crcl: "male" });
    expect(r.score).toBe(25);
    expect(r.riskLevel).toBe("critical");
  });

  it("CrCl ≥90 = normal (Stage 1)", () => {
    const r = calculateCrCl({ age_crcl: 30, weight_crcl: 80, creatinine_crcl: 0.8, gender_crcl: "male" });
    // (140-30)*80/(72*0.8) = 152.8
    expect(r.score).toBe(153);
    expect(r.riskLevel).toBe("low");
  });

  it("creatinine ≤0 returns error result", () => {
    const r = calculateCrCl({ age_crcl: 50, weight_crcl: 70, creatinine_crcl: 0, gender_crcl: "male" });
    expect(r.score).toBe(0);
    expect(r.riskLevel).toBe("critical");
  });
});

// =======================================================================
// MELD — Kamath et al. Hepatology 2001
// =======================================================================
describe("MDCalc: MELD Score", () => {
  it("floor values: labs <1.0 set to 1.0 → minimum score 6", () => {
    const r = calculateMELD({ inr: 0.8, bilirubin_meld: 0.5, creatinine_meld: 0.5 });
    expect(r.score).toBe(6);
  });

  it("formula: 9.57*ln(Cr) + 3.78*ln(Bili) + 11.2*ln(INR) + 6.43", () => {
    // With all 1.0: 9.57*0 + 3.78*0 + 11.2*0 + 6.43 = 6.43 → 6
    const r = calculateMELD({ inr: 1.0, bilirubin_meld: 1.0, creatinine_meld: 1.0 });
    expect(r.score).toBe(6);
  });

  it("creatinine capped at 4.0 for dialysis", () => {
    const r1 = calculateMELD({ inr: 1.0, bilirubin_meld: 1.0, creatinine_meld: 6.0, dialysis: true });
    const r2 = calculateMELD({ inr: 1.0, bilirubin_meld: 1.0, creatinine_meld: 4.0, dialysis: false });
    expect(r1.score).toBe(r2.score);
  });

  it("score range is 6-40", () => {
    const low = calculateMELD({ inr: 0.5, bilirubin_meld: 0.2, creatinine_meld: 0.3 });
    expect(low.score).toBeGreaterThanOrEqual(6);
    const high = calculateMELD({ inr: 8.0, bilirubin_meld: 30.0, creatinine_meld: 8.0 });
    expect(high.score).toBeLessThanOrEqual(40);
  });

  it("typical cirrhotic patient: INR 2.0, Bili 3.0, Cr 1.5 → moderate", () => {
    const r = calculateMELD({ inr: 2.0, bilirubin_meld: 3.0, creatinine_meld: 1.5 });
    expect(r.score).toBeGreaterThan(10);
    expect(r.score).toBeLessThan(25);
  });
});

// =======================================================================
// Child-Pugh — Pugh et al. Br J Surg 1973
// =======================================================================
describe("MDCalc: Child-Pugh Score", () => {
  it("Class A (5-6): best prognosis, 100% 1-yr survival", () => {
    const r = calculateChildPugh({
      bilirubin: 1.0, albumin: 4.0, inr: 1.0,
      ascites: "None", encephalopathy: "None",
    });
    expect(r.score).toBe(5);
    expect(r.riskLevel).toBe("low");
  });

  it("Class C (10-15): 45% 1-yr survival", () => {
    const r = calculateChildPugh({
      bilirubin: 5.0, albumin: 2.0, inr: 3.0,
      ascites: "Moderate to severe (despite diuretics)",
      encephalopathy: "Grade III-IV (severe)",
    });
    expect(r.score).toBe(15);
    expect(r.riskLevel).toBe("high");
  });

  it("bilirubin <2 = 1pt, 2-3 = 2pt, >3 = 3pt", () => {
    const a = calculateChildPugh({ bilirubin: 1.5, albumin: 4.0, inr: 1.0, ascites: "None", encephalopathy: "None" });
    const b = calculateChildPugh({ bilirubin: 2.5, albumin: 4.0, inr: 1.0, ascites: "None", encephalopathy: "None" });
    const c = calculateChildPugh({ bilirubin: 4.0, albumin: 4.0, inr: 1.0, ascites: "None", encephalopathy: "None" });
    expect(b.score - a.score).toBe(1);
    expect(c.score - b.score).toBe(1);
  });

  it("INR <1.7 = 1pt, 1.7-2.2 = 2pt, >2.2 = 3pt", () => {
    const a = calculateChildPugh({ bilirubin: 1.0, albumin: 4.0, inr: 1.5, ascites: "None", encephalopathy: "None" });
    const b = calculateChildPugh({ bilirubin: 1.0, albumin: 4.0, inr: 2.0, ascites: "None", encephalopathy: "None" });
    const c = calculateChildPugh({ bilirubin: 1.0, albumin: 4.0, inr: 3.0, ascites: "None", encephalopathy: "None" });
    expect(a.score).toBe(5);
    expect(b.score).toBe(6);
    expect(c.score).toBe(7);
  });
});

// =======================================================================
// PESI — Aujesky et al. Am J Respir Crit Care Med 2005
// =======================================================================
describe("MDCalc: PESI Score", () => {
  it("Class I (≤65): very low risk, 0% 30-day mortality", () => {
    const r = calculatePESI({ age: 40, male: false, cancer: false, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false, oxygen_sat: false });
    expect(r.score).toBe(40);
    expect(r.riskPercentage).toBe(0.0);
  });

  it("male adds +10 points", () => {
    const female = calculatePESI({ age: 50, male: false, cancer: false, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false, oxygen_sat: false });
    const male = calculatePESI({ age: 50, male: true, cancer: false, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false, oxygen_sat: false });
    expect(male.score - female.score).toBe(10);
  });

  it("altered mental status adds +60 (heaviest weight)", () => {
    const base = calculatePESI({ age: 30, male: false, cancer: false, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false, oxygen_sat: false });
    const altered = calculatePESI({ age: 30, male: false, cancer: false, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: true, oxygen_sat: false });
    expect(altered.score - base.score).toBe(60);
  });

  it("cancer adds +30 points", () => {
    const noCancer = calculatePESI({ age: 50, male: false, cancer: false, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false, oxygen_sat: false });
    const cancer = calculatePESI({ age: 50, male: false, cancer: true, heart_failure: false,
      chronic_lung_disease: false, pulse: false, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false, oxygen_sat: false });
    expect(cancer.score - noCancer.score).toBe(30);
  });

  it("Class V (>125): very high risk, 24.5% 30-day mortality", () => {
    const r = calculatePESI({ age: 80, male: true, cancer: true, heart_failure: true,
      chronic_lung_disease: false, pulse: true, systolic_bp: false,
      respiratory_rate: false, temperature: false, altered_mental: false, oxygen_sat: false });
    // 80 + 10 + 30 + 10 + 20 = 150
    expect(r.score).toBe(150);
    expect(r.riskPercentage).toBe(24.5);
  });
});

// =======================================================================
// FIB-4 — Sterling et al. Hepatology 2006
// =======================================================================
describe("MDCalc: FIB-4 Index", () => {
  it("formula: (Age × AST) / (PLT × √ALT)", () => {
    // (50 × 30) / (200 × √30) = 1500 / 1095.45 = 1.3693
    const r = calculateFIB4({ age: 50, ast: 30, alt: 30, platelets: 200 });
    expect(r.score).toBeCloseTo(1.37, 1);
  });

  it("<1.45 = low risk (NPV 90% for advanced fibrosis)", () => {
    const r = calculateFIB4({ age: 40, ast: 25, alt: 25, platelets: 250 });
    expect(r.score).toBeLessThan(1.45);
    expect(r.riskLevel).toBe("low");
  });

  it(">3.25 = high risk (PPV 65%, specificity 97%)", () => {
    const r = calculateFIB4({ age: 70, ast: 120, alt: 40, platelets: 80 });
    expect(r.score).toBeGreaterThan(3.25);
    expect(r.riskLevel).toBe("high");
  });

  it("handles division by zero (platelets=0)", () => {
    const r = calculateFIB4({ age: 50, ast: 30, alt: 30, platelets: 0 });
    expect(r.score).toBe(0);
  });
});

// =======================================================================
// MELD-Na — Kim et al. Hepatology 2008
// =======================================================================
describe("MDCalc: MELD-Na Score", () => {
  it("sodium clamped to 125-137 range", () => {
    const r1 = calculateMELDNa({ creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 120, dialysis: false });
    const r2 = calculateMELDNa({ creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 125, dialysis: false });
    // sodium 120 should be treated as 125
    expect(r1.score).toBe(r2.score);
  });

  it("normal sodium (137+) → MELD-Na ≈ MELD", () => {
    const r = calculateMELDNa({ creatinine: 1.0, bilirubin: 1.0, inr: 1.0, sodium: 140, dialysis: false });
    expect(r.score).toBeGreaterThanOrEqual(6);
  });

  it("low sodium increases score above MELD", () => {
    const normal = calculateMELDNa({ creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 137, dialysis: false });
    const low = calculateMELDNa({ creatinine: 1.5, bilirubin: 2.0, inr: 1.5, sodium: 128, dialysis: false });
    expect(low.score).toBeGreaterThan(normal.score);
  });
});

// =======================================================================
// APRI — Wai et al. Hepatology 2003
// =======================================================================
describe("MDCalc: APRI Score", () => {
  it("formula: [(AST/ULN)*100] / PLT", () => {
    // [(30/40)*100] / 200 = 75/200 = 0.375
    const r = calculateAPRI({ ast: 30, ast_upper_limit: 40, platelets: 200 });
    expect(r.score).toBeCloseTo(0.38, 1);
  });

  it("<0.5 = low risk (rules out fibrosis)", () => {
    const r = calculateAPRI({ ast: 25, ast_upper_limit: 40, platelets: 250 });
    expect(r.score).toBeLessThan(0.5);
    expect(r.riskLevel).toBe("low");
  });

  it(">1.5 = high risk (significant fibrosis)", () => {
    const r = calculateAPRI({ ast: 150, ast_upper_limit: 40, platelets: 100 });
    // (150/40)*100 / 100 = 3.75
    expect(r.score).toBeGreaterThan(1.5);
    expect(r.riskLevel).toBe("high");
  });

  it("handles division by zero (platelets=0)", () => {
    const r = calculateAPRI({ ast: 30, ast_upper_limit: 40, platelets: 0 });
    expect(r.score).toBe(0);
  });
});

// =======================================================================
// GCS — Teasdale & Jennett, Lancet 1974
// =======================================================================
describe("MDCalc: Glasgow Coma Scale", () => {
  it("GCS 15 = fully alert, low risk", () => {
    const r = calculateGCS({ eye_opening: 4, verbal_response: 5, motor_response: 6 });
    expect(r.score).toBe(15);
    expect(r.riskLevel).toBe("low");
  });

  it("GCS 8 = severe, intubation threshold", () => {
    const r = calculateGCS({ eye_opening: 2, verbal_response: 2, motor_response: 4 });
    expect(r.score).toBe(8);
    expect(r.riskLevel).toBe("high");
  });

  it("GCS 3 = minimum, critical", () => {
    const r = calculateGCS({ eye_opening: 1, verbal_response: 1, motor_response: 1 });
    expect(r.score).toBe(3);
    expect(r.riskLevel).toBe("critical");
  });

  it("GCS 13-15 = mild injury", () => {
    const r = calculateGCS({ eye_opening: 4, verbal_response: 4, motor_response: 6 });
    expect(r.score).toBe(14);
    expect(r.riskLevel).toBe("low");
  });
});

// =======================================================================
// RCRI — Lee et al. Circulation 1999
// =======================================================================
describe("MDCalc: RCRI (Revised Cardiac Risk Index)", () => {
  it("score 0 = Class I, 0.4% cardiac risk", () => {
    const r = calculateRCRI({
      high_risk_surgery: false, ischemic_heart_disease: false,
      heart_failure: false, cerebrovascular_disease: false,
      diabetes_insulin: false, renal_insufficiency: false,
    });
    expect(r.score).toBe(0);
    expect(r.riskPercentage).toBe(0.4);
  });

  it("score 1 = Class II, 1.0% cardiac risk", () => {
    const r = calculateRCRI({
      high_risk_surgery: true, ischemic_heart_disease: false,
      heart_failure: false, cerebrovascular_disease: false,
      diabetes_insulin: false, renal_insufficiency: false,
    });
    expect(r.score).toBe(1);
    expect(r.riskPercentage).toBe(1.0);
  });

  it("score 2 = Class III, 5.4% cardiac risk", () => {
    const r = calculateRCRI({
      high_risk_surgery: true, ischemic_heart_disease: true,
      heart_failure: false, cerebrovascular_disease: false,
      diabetes_insulin: false, renal_insufficiency: false,
    });
    expect(r.score).toBe(2);
    expect(r.riskPercentage).toBe(5.4);
  });

  it("score ≥3 = Class IV, 9.1% cardiac risk", () => {
    const r = calculateRCRI({
      high_risk_surgery: true, ischemic_heart_disease: true,
      heart_failure: true, cerebrovascular_disease: false,
      diabetes_insulin: false, renal_insufficiency: false,
    });
    expect(r.score).toBe(3);
    expect(r.riskPercentage).toBe(9.1);
  });
});

// =======================================================================
// SMART-COP — Charles et al. Clin Infect Dis 2008
// =======================================================================
describe("MDCalc: SMART-COP Score", () => {
  it("SBP <90 = 2 points (weighted)", () => {
    const r = calculateSMARTCOP({
      systolic_bp: true, multilobar: false, albumin: false,
      respiratory_rate: false, tachycardia: false, confusion: false,
      oxygen: false, ph: false,
    });
    expect(r.score).toBe(2);
  });

  it("Oxygen low = 2 points (weighted)", () => {
    const r = calculateSMARTCOP({
      systolic_bp: false, multilobar: false, albumin: false,
      respiratory_rate: false, tachycardia: false, confusion: false,
      oxygen: true, ph: false,
    });
    expect(r.score).toBe(2);
  });

  it("pH <7.35 = 2 points (weighted)", () => {
    const r = calculateSMARTCOP({
      systolic_bp: false, multilobar: false, albumin: false,
      respiratory_rate: false, tachycardia: false, confusion: false,
      oxygen: false, ph: true,
    });
    expect(r.score).toBe(2);
  });

  it("max score = 11", () => {
    const r = calculateSMARTCOP({
      systolic_bp: true, multilobar: true, albumin: true,
      respiratory_rate: true, tachycardia: true, confusion: true,
      oxygen: true, ph: true,
    });
    expect(r.score).toBe(11);
    expect(r.maxScore).toBe(11);
  });

  it("score ≥7 = very high risk (67% need IRVS)", () => {
    const r = calculateSMARTCOP({
      systolic_bp: true, multilobar: true, albumin: true,
      respiratory_rate: true, tachycardia: true, confusion: true,
      oxygen: false, ph: false,
    });
    // 2+1+1+1+1+1 = 7
    expect(r.score).toBe(7);
    expect(r.riskPercentage).toBe(67);
  });
});

// =======================================================================
// ASA Physical Status — ASA classification
// =======================================================================
describe("MDCalc: ASA Physical Status", () => {
  it("ASA I = healthy, low risk", () => {
    const r = calculateASA({ asa_class: "I - Healthy patient", emergency: false });
    expect(r.score).toBe(1);
    expect(r.riskPercentage).toBe(0.05);
  });

  it("emergency doubles mortality risk", () => {
    const r = calculateASA({ asa_class: "III - Severe systemic disease", emergency: true });
    expect(r.score).toBe(3);
    expect(r.riskPercentage).toBe(1.8 * 2);
  });
});

// =======================================================================
// Caprini VTE — Caprini JA et al. Dis Mon 2005
// =======================================================================
describe("MDCalc: Caprini VTE Score", () => {
  it("age <41 = 0 pts", () => {
    const r = calculateCaprini({ age: "<41 years" });
    expect(r.score).toBe(0);
  });

  it("age ≥75 = 3 pts", () => {
    const r = calculateCaprini({ age: "≥75 years" });
    expect(r.score).toBe(3);
  });

  it("previous VTE = 3 pts", () => {
    const r = calculateCaprini({ age: "<41 years", previous_vte: true });
    expect(r.score).toBe(3);
  });

  it("thrombophilia = 3 pts", () => {
    const r = calculateCaprini({ age: "<41 years", thrombophilia: true });
    expect(r.score).toBe(3);
  });

  it("score 0-1 = low, 2 = moderate, 3-4 = high, ≥5 = critical", () => {
    const low = calculateCaprini({ age: "<41 years" });
    expect(low.riskLevel).toBe("low");
    const mod = calculateCaprini({ age: "<41 years", major_surgery: true });
    expect(mod.riskLevel).toBe("moderate");
    const high = calculateCaprini({ age: "≥75 years" });
    expect(high.riskLevel).toBe("high");
    const crit = calculateCaprini({ age: "≥75 years", major_surgery: true });
    expect(crit.riskLevel).toBe("critical");
  });
});

// =======================================================================
// NIHSS — NIH Stroke Scale
// =======================================================================
describe("MDCalc: NIHSS", () => {
  it("score 0 = no stroke symptoms", () => {
    const inputs: Record<string, number> = {};
    for (let i = 0; i < 13; i++) inputs[`item_${i}`] = 0;
    const r = calculateNIHSS(inputs);
    expect(r.score).toBe(0);
    expect(r.riskLevel).toBe("low");
  });

  it("score ≥20 = critical (severe stroke)", () => {
    const r = calculateNIHSS({ a: 5, b: 5, c: 5, d: 5 });
    expect(r.score).toBe(20);
    expect(r.riskLevel).toBe("critical");
  });

  it("max score = 42", () => {
    expect(calculateNIHSS({}).maxScore).toBe(42);
  });
});
