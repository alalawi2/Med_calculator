/**
 * Calculator Wrapper - Maps calculator inputs to calculation engine functions
 * Maps UI form field IDs to engine function parameter names
 */

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
  calculateGenericScore,
  type CalculationResult,
  type ScoreBreakdownItem,
} from "./calculator-engine";
import { Calculator } from "./calculators";

/**
 * Safely parse a number value, preserving zero but defaulting NaN/undefined
 * CRITICAL: parseFloat("0") || defaultValue incorrectly replaces 0 with defaultValue
 */
function parseNumber(value: any, defaultValue: number): number {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  const parsed = parseFloat(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parse a boolean value, handling string "true"/"false"
 */
function parseBoolean(value: any, defaultValue: boolean): boolean {
  if (value === null || value === undefined || value === "") {
    return defaultValue;
  }
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true" || value === "1";
  }
  return Boolean(value);
}

/**
 * Build a score breakdown showing how each input contributed to the total.
 * This gives clinicians transparency into the calculation.
 */
function buildBreakdown(
  calculatorId: string,
  inputs: Record<string, any>,
  calculator: Calculator
): ScoreBreakdownItem[] | undefined {
  const breakdown: ScoreBreakdownItem[] = [];
  const b = (label: string, value: string | number | boolean, points: number) =>
    breakdown.push({ label, value, points });

  switch (calculatorId) {
    case "qsofa": {
      const mentation = parseBoolean(inputs.altered_mentation, false);
      const rr = parseNumber(inputs.respiratory_rate, 0);
      const sbp = parseNumber(inputs.systolic_bp, 0);
      b("Altered Mentation", mentation ? "Yes" : "No", mentation ? 1 : 0);
      b("Respiratory Rate", rr, rr >= 22 ? 1 : 0);
      b("Systolic BP", `${sbp} mmHg`, sbp <= 100 ? 1 : 0);
      return breakdown;
    }
    case "cha2ds2vasc": {
      const age = parseNumber(inputs.age, 0);
      b("CHF", parseBoolean(inputs.chf, false) ? "Yes" : "No", parseBoolean(inputs.chf, false) ? 1 : 0);
      b("Hypertension", parseBoolean(inputs.hypertension, false) ? "Yes" : "No", parseBoolean(inputs.hypertension, false) ? 1 : 0);
      b("Age", `${age} years`, age >= 75 ? 2 : age >= 65 ? 1 : 0);
      b("Diabetes", parseBoolean(inputs.diabetes, false) ? "Yes" : "No", parseBoolean(inputs.diabetes, false) ? 1 : 0);
      b("Stroke/TIA", parseBoolean(inputs.stroke, false) ? "Yes" : "No", parseBoolean(inputs.stroke, false) ? 2 : 0);
      b("Vascular Disease", parseBoolean(inputs.vascular, false) ? "Yes" : "No", parseBoolean(inputs.vascular, false) ? 1 : 0);
      b("Female Sex", parseBoolean(inputs.sex, false) ? "Yes" : "No", parseBoolean(inputs.sex, false) ? 1 : 0);
      return breakdown;
    }
    case "hasbled": {
      b("Hypertension", parseBoolean(inputs.hypertension, false) ? "Yes" : "No", parseBoolean(inputs.hypertension, false) ? 1 : 0);
      b("Renal Disease", parseBoolean(inputs.renal_disease, false) ? "Yes" : "No", parseBoolean(inputs.renal_disease, false) ? 1 : 0);
      b("Liver Disease", parseBoolean(inputs.liver_disease, false) ? "Yes" : "No", parseBoolean(inputs.liver_disease, false) ? 1 : 0);
      b("Stroke History", parseBoolean(inputs.stroke, false) ? "Yes" : "No", parseBoolean(inputs.stroke, false) ? 1 : 0);
      b("Prior Bleeding", parseBoolean(inputs.bleeding, false) ? "Yes" : "No", parseBoolean(inputs.bleeding, false) ? 1 : 0);
      b("Labile INR", parseBoolean(inputs.labile_inr, false) ? "Yes" : "No", parseBoolean(inputs.labile_inr, false) ? 1 : 0);
      b("Age >65", parseBoolean(inputs.elderly, false) ? "Yes" : "No", parseBoolean(inputs.elderly, false) ? 1 : 0);
      b("Medications", parseBoolean(inputs.medication_usage, false) ? "Yes" : "No", parseBoolean(inputs.medication_usage, false) ? 1 : 0);
      b("Alcohol", parseBoolean(inputs.alcohol_use, false) ? "Yes" : "No", parseBoolean(inputs.alcohol_use, false) ? 1 : 0);
      return breakdown;
    }
    case "heart": {
      const historyMap: Record<string, number> = { "Non-anginal chest pain": 0, "Atypical angina": 1, "Typical angina": 2 };
      const ecgMap: Record<string, number> = { Normal: 0, "Nonspecific changes": 1, "Ischemic changes": 2 };
      const rfMap: Record<string, number> = { "No known risk factors": 0, "1-2 risk factors": 1, "3+ risk factors or history of CAD": 2 };
      const tropMap: Record<string, number> = { "≤0.01 ng/mL": 0, "0.01-0.03 ng/mL": 1, ">0.03 ng/mL": 2 };
      const age = parseNumber(inputs.age, 50);
      b("History", String(inputs.history), typeof inputs.history === "string" ? historyMap[inputs.history] ?? 0 : parseNumber(inputs.history, 0));
      b("ECG", String(inputs.ecg), typeof inputs.ecg === "string" ? ecgMap[inputs.ecg] ?? 0 : parseNumber(inputs.ecg, 0));
      b("Age", `${age} years`, age < 45 ? 0 : age < 65 ? 1 : 2);
      b("Risk Factors", String(inputs.risk_factors), typeof inputs.risk_factors === "string" ? rfMap[inputs.risk_factors] ?? 0 : parseNumber(inputs.risk_factors, 0));
      b("Troponin", String(inputs.troponin), typeof inputs.troponin === "string" ? tropMap[inputs.troponin] ?? 0 : parseNumber(inputs.troponin, 0));
      return breakdown;
    }
    case "curb65": {
      b("Confusion", parseBoolean(inputs.confusion, false) ? "Yes" : "No", parseBoolean(inputs.confusion, false) ? 1 : 0);
      b("Urea >7 mmol/L", parseBoolean(inputs.urea, false) ? "Yes" : "No", parseBoolean(inputs.urea, false) ? 1 : 0);
      b("RR ≥30", parseBoolean(inputs.rr, false) ? "Yes" : "No", parseBoolean(inputs.rr, false) ? 1 : 0);
      b("Low BP", parseBoolean(inputs.bp, false) ? "Yes" : "No", parseBoolean(inputs.bp, false) ? 1 : 0);
      b("Age ≥65", parseBoolean(inputs.age, false) ? "Yes" : "No", parseBoolean(inputs.age, false) ? 1 : 0);
      return breakdown;
    }
    case "rcri": {
      b("High-Risk Surgery", parseBoolean(inputs.high_risk_surgery, false) ? "Yes" : "No", parseBoolean(inputs.high_risk_surgery, false) ? 1 : 0);
      b("Ischemic Heart Disease", parseBoolean(inputs.ischemic_heart_disease, false) ? "Yes" : "No", parseBoolean(inputs.ischemic_heart_disease, false) ? 1 : 0);
      b("Heart Failure", parseBoolean(inputs.heart_failure, false) ? "Yes" : "No", parseBoolean(inputs.heart_failure, false) ? 1 : 0);
      b("Cerebrovascular Disease", parseBoolean(inputs.cerebrovascular_disease, false) ? "Yes" : "No", parseBoolean(inputs.cerebrovascular_disease, false) ? 1 : 0);
      b("Diabetes on Insulin", parseBoolean(inputs.diabetes_insulin, false) ? "Yes" : "No", parseBoolean(inputs.diabetes_insulin, false) ? 1 : 0);
      b("Renal Insufficiency", parseBoolean(inputs.renal_insufficiency, false) ? "Yes" : "No", parseBoolean(inputs.renal_insufficiency, false) ? 1 : 0);
      return breakdown;
    }
    default:
      // For calculators without explicit breakdown, generate from input definitions
      if (calculator.inputs) {
        for (const input of calculator.inputs) {
          const val = inputs[input.id];
          if (val !== undefined && val !== null) {
            b(input.label, typeof val === "boolean" ? (val ? "Yes" : "No") : String(val), 0);
          }
        }
        if (breakdown.length > 0) return breakdown;
      }
      return undefined;
  }
}

export function executeCalculator(
  calculator: Calculator,
  inputs: Record<string, any>
): CalculationResult | null {
  try {
    let result: CalculationResult | null = null;

    switch (calculator.id) {
      // ===================================================================
      // qSOFA - UI inputs match engine params
      // ===================================================================
      case "qsofa":
        result = calculateQSOFA({
          altered_mentation: parseBoolean(inputs.altered_mentation, false),
          respiratory_rate: parseNumber(inputs.respiratory_rate, 0),
          systolic_bp: parseNumber(inputs.systolic_bp, 0),
        });
        break;

      // ===================================================================
      // SOFA - UI has select dropdowns, engine expects numbers
      // ===================================================================
      case "sofa": {
        // Map respiration select to PaO2/FiO2 ratio
        const respirationMap: Record<string, number> = {
          "PaO2/FiO2 ≥400": 400,
          "PaO2/FiO2 300-399": 350,
          "PaO2/FiO2 200-299 (intubated)": 250,
          "PaO2/FiO2 100-199 (intubated)": 150,
          "PaO2/FiO2 <100 (intubated)": 90,
        };

        // Map cardiovascular select to score (0-4)
        const cardiovascularMap: Record<string, number> = {
          "No hypotension": 0,
          "MAP <70 mmHg": 1,
          "Dopamine ≤5 or dobutamine": 2,
          "Dopamine >5 or epinephrine/norepinephrine ≤0.1": 3,
          "Dopamine >15 or norepinephrine/epinephrine >0.1": 4,
        };

        result = calculateSOFA({
          pao2_fio2: respirationMap[inputs.respiration] ?? 400,
          platelets: parseNumber(inputs.coagulation, 150),
          bilirubin: parseNumber(inputs.liver, 1),
          cardiovascular: cardiovascularMap[inputs.cardiovascular] ?? 0,
          gcs: parseNumber(inputs.cns, 15),
          creatinine: parseNumber(inputs.renal, 1),
        });
        break;
      }

      // ===================================================================
      // APACHE II - Full 12-variable scoring
      // UI: temperature, map, hr, rr, fio2, ph, sodium, potassium,
      //     creatinine, hematocrit, wbc, gcs
      // ===================================================================
      case "apache2":
        result = calculateAPACHE({
          temperature: parseNumber(inputs.temperature, 37),
          heart_rate: parseNumber(inputs.hr, 80),
          respiratory_rate_apache: parseNumber(inputs.rr, 16),
          map: parseNumber(inputs.map, 80),
          ph: parseNumber(inputs.ph, 7.4),
          sodium: parseNumber(inputs.sodium, 140),
          potassium: parseNumber(inputs.potassium, 4.0),
          creatinine: parseNumber(inputs.creatinine, 1.0),
          hematocrit: parseNumber(inputs.hematocrit, 40),
          wbc: parseNumber(inputs.wbc, 10),
          gcs: parseNumber(inputs.gcs, 15),
        });
        break;

      // ===================================================================
      // NIHSS - passes entire inputs object (select options → index scores)
      // ===================================================================
      case "nihss":
        result = calculateNIHSS(inputs);
        break;

      // ===================================================================
      // CHA2DS2-VASc - UI has age (number) and sex (boolean "Female Sex")
      // Engine expects age_75, age_65_74, female (booleans)
      // ===================================================================
      case "cha2ds2vasc": {
        const ageNum = parseNumber(inputs.age, 0);
        result = calculateCHA2DS2VASc({
          chf: parseBoolean(inputs.chf, false),
          hypertension: parseBoolean(inputs.hypertension, false),
          age_75: ageNum >= 75,
          diabetes: parseBoolean(inputs.diabetes, false),
          stroke_tia: parseBoolean(inputs.stroke, false),
          vascular_disease: parseBoolean(inputs.vascular, false),
          age_65_74: ageNum >= 65 && ageNum < 75,
          female: parseBoolean(inputs.sex, false),
        });
        break;
      }

      // ===================================================================
      // HAS-BLED - UI has individual boolean inputs matching engine params
      // ===================================================================
      case "hasbled":
        result = calculateHASBLED({
          hypertension: parseBoolean(inputs.hypertension, false),
          renal_disease: parseBoolean(inputs.renal_disease, false),
          liver_disease: parseBoolean(inputs.liver_disease, false),
          stroke_history: parseBoolean(inputs.stroke, false),
          prior_bleeding: parseBoolean(inputs.bleeding, false),
          labile_inr: parseBoolean(inputs.labile_inr, false),
          age_over_65: parseBoolean(inputs.elderly, false),
          medication_usage: parseBoolean(inputs.medication_usage, false),
          alcohol_use: parseBoolean(inputs.alcohol_use, false),
        });
        break;

      // ===================================================================
      // Glasgow Coma Scale - UI has select dropdowns with text
      // ===================================================================
      case "gcs":
      case "glasgow_coma": {
        const eyeOpeningMap: Record<string, number> = {
          Spontaneous: 4,
          "To verbal command": 3,
          "To pain": 2,
          "No response": 1,
        };
        const verbalResponseMap: Record<string, number> = {
          Oriented: 5,
          Confused: 4,
          Inappropriate: 3,
          Incomprehensible: 2,
          "No response": 1,
        };
        const motorResponseMap: Record<string, number> = {
          "Obeys commands": 6,
          "Localizes pain": 5,
          Withdraws: 4,
          "Abnormal flexion": 3,
          "Abnormal extension": 2,
          "No response": 1,
        };

        const eyeOpening =
          typeof inputs.eye_opening === "string"
            ? eyeOpeningMap[inputs.eye_opening] || parseNumber(inputs.eye_opening, 4)
            : parseNumber(inputs.eye_opening, 4);
        const verbalResponse =
          typeof inputs.verbal_response === "string"
            ? verbalResponseMap[inputs.verbal_response] || parseNumber(inputs.verbal_response, 5)
            : parseNumber(inputs.verbal_response, 5);
        const motorResponse =
          typeof inputs.motor_response === "string"
            ? motorResponseMap[inputs.motor_response] || parseNumber(inputs.motor_response, 6)
            : parseNumber(inputs.motor_response, 6);

        result = calculateGCS({
          eye_opening: eyeOpening,
          verbal_response: verbalResponse,
          motor_response: motorResponse,
        });
        break;
      }

      // ===================================================================
      // HEART Score - UI has select dropdowns for history, ecg, risk_factors, troponin
      // Must map text options to numeric scores (0-2 each)
      // ===================================================================
      case "heart": {
        const historyMap: Record<string, number> = {
          "Non-anginal chest pain": 0,
          "Atypical angina": 1,
          "Typical angina": 2,
        };
        const ecgMap: Record<string, number> = {
          Normal: 0,
          "Nonspecific changes": 1,
          "Ischemic changes": 2,
        };
        const riskFactorsMap: Record<string, number> = {
          "No known risk factors": 0,
          "1-2 risk factors": 1,
          "3+ risk factors or history of CAD": 2,
        };
        const troponinMap: Record<string, number> = {
          "≤0.01 ng/mL": 0,
          "0.01-0.03 ng/mL": 1,
          ">0.03 ng/mL": 2,
        };

        result = calculateHEART({
          history:
            typeof inputs.history === "string"
              ? historyMap[inputs.history] ?? 0
              : parseNumber(inputs.history, 0),
          ecg:
            typeof inputs.ecg === "string"
              ? ecgMap[inputs.ecg] ?? 0
              : parseNumber(inputs.ecg, 0),
          age_heart: parseNumber(inputs.age, 50),
          risk_factors:
            typeof inputs.risk_factors === "string"
              ? riskFactorsMap[inputs.risk_factors] ?? 0
              : parseNumber(inputs.risk_factors, 0),
          troponin:
            typeof inputs.troponin === "string"
              ? troponinMap[inputs.troponin] ?? 0
              : parseNumber(inputs.troponin, 0),
        });
        break;
      }

      // ===================================================================
      // CURB-65 - Map UI field IDs (rr, bp, age) to engine param names
      // ===================================================================
      case "curb65":
        result = calculateCURB65({
          confusion: inputs.confusion,
          urea: inputs.urea,
          respiratory_rate_curb: inputs.rr,
          blood_pressure_curb: inputs.bp,
          age_65_curb: inputs.age,
        });
        break;

      // ===================================================================
      // Creatinine Clearance (Cockcroft-Gault) - Map UI field IDs
      // UI: age, weight, sex, creatinine
      // Engine: age_crcl, weight_crcl, creatinine_crcl, gender_crcl
      // ===================================================================
      case "creatinine_clearance":
        result = calculateCrCl({
          age_crcl: parseNumber(inputs.age, 50),
          weight_crcl: parseNumber(inputs.weight, 70),
          creatinine_crcl: parseNumber(inputs.creatinine, 1),
          gender_crcl: inputs.sex === "Female" ? "female" : "male",
        });
        break;

      // ===================================================================
      // MELD - Map UI field IDs to engine param names
      // ===================================================================
      case "meld":
        result = calculateMELD({
          inr: parseNumber(inputs.inr, 1),
          bilirubin_meld: parseNumber(inputs.bilirubin, 1),
          creatinine_meld: parseNumber(inputs.creatinine, 1),
          dialysis: parseBoolean(inputs.dialysis, false),
        });
        break;

      // ===================================================================
      // ASA Physical Status - UI inputs match engine params
      // ===================================================================
      case "asa_physical_status":
        result = calculateASA({
          asa_class: inputs.asa_class || "I - Healthy patient",
          emergency: parseBoolean(inputs.emergency, false),
        });
        break;

      // ===================================================================
      // RCRI - passes entire inputs object
      // ===================================================================
      case "rcri":
        result = calculateRCRI(inputs);
        break;

      // ===================================================================
      // Caprini VTE - passes entire inputs object
      // ===================================================================
      case "caprini_vte":
        result = calculateCaprini(inputs);
        break;

      // ===================================================================
      // PESI - passes entire inputs object
      // ===================================================================
      case "pesi":
        result = calculatePESI(inputs);
        break;

      // ===================================================================
      // SMART-COP - passes entire inputs object
      // ===================================================================
      case "smart_cop":
        result = calculateSMARTCOP(inputs);
        break;

      // ===================================================================
      // Child-Pugh - passes entire inputs object
      // ===================================================================
      case "child_pugh":
        result = calculateChildPugh(inputs);
        break;

      // ===================================================================
      // FIB-4 - UI inputs match engine params
      // ===================================================================
      case "fib4":
        result = calculateFIB4({
          age: parseNumber(inputs.age, 50),
          ast: parseNumber(inputs.ast, 30),
          alt: parseNumber(inputs.alt, 30),
          platelets: parseNumber(inputs.platelets, 200),
        });
        break;

      // ===================================================================
      // MELD-Na - UI inputs match engine params
      // ===================================================================
      case "meld_na":
        result = calculateMELDNa({
          creatinine: parseNumber(inputs.creatinine, 1.0),
          bilirubin: parseNumber(inputs.bilirubin, 1.0),
          inr: parseNumber(inputs.inr, 1.0),
          sodium: parseNumber(inputs.sodium, 140),
          dialysis: parseBoolean(inputs.dialysis, false),
        });
        break;

      // ===================================================================
      // APRI - UI inputs match engine params
      // ===================================================================
      case "apri":
        result = calculateAPRI({
          ast: parseNumber(inputs.ast, 30),
          ast_upper_limit: parseNumber(inputs.ast_upper_limit, 40),
          platelets: parseNumber(inputs.platelets, 200),
        });
        break;

      default:
        result = calculateGenericScore(inputs);
        break;
    }

    // Attach score breakdown for transparency
    if (result && !result.scoreBreakdown) {
      result.scoreBreakdown = buildBreakdown(calculator.id, inputs, calculator);
    }

    return result;
  } catch (error) {
    console.error(`Error calculating ${calculator.id}:`, error);
    return null;
  }
}
