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

export function executeCalculator(
  calculator: Calculator,
  inputs: Record<string, any>
): CalculationResult | null {
  try {
    switch (calculator.id) {
      // ===================================================================
      // qSOFA - UI inputs match engine params
      // ===================================================================
      case "qsofa":
        return calculateQSOFA({
          altered_mentation: parseBoolean(inputs.altered_mentation, false),
          respiratory_rate: parseNumber(inputs.respiratory_rate, 0),
          systolic_bp: parseNumber(inputs.systolic_bp, 0),
        });

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

        return calculateSOFA({
          pao2_fio2: respirationMap[inputs.respiration] ?? 400,
          platelets: parseNumber(inputs.coagulation, 150),
          bilirubin: parseNumber(inputs.liver, 1),
          cardiovascular: cardiovascularMap[inputs.cardiovascular] ?? 0,
          gcs: parseNumber(inputs.cns, 15),
          creatinine: parseNumber(inputs.renal, 1),
        });
      }

      // ===================================================================
      // APACHE II - Full 12-variable scoring
      // UI: temperature, map, hr, rr, fio2, ph, sodium, potassium,
      //     creatinine, hematocrit, wbc, gcs
      // ===================================================================
      case "apache2":
        return calculateAPACHE({
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

      // ===================================================================
      // NIHSS - passes entire inputs object (select options → index scores)
      // ===================================================================
      case "nihss":
        return calculateNIHSS(inputs);

      // ===================================================================
      // CHA2DS2-VASc - UI has age (number) and sex (boolean "Female Sex")
      // Engine expects age_75, age_65_74, female (booleans)
      // ===================================================================
      case "cha2ds2vasc": {
        const ageNum = parseNumber(inputs.age, 0);
        return calculateCHA2DS2VASc({
          chf: parseBoolean(inputs.chf, false),
          hypertension: parseBoolean(inputs.hypertension, false),
          age_75: ageNum >= 75,
          diabetes: parseBoolean(inputs.diabetes, false),
          stroke_tia: parseBoolean(inputs.stroke, false),
          vascular_disease: parseBoolean(inputs.vascular, false),
          age_65_74: ageNum >= 65 && ageNum < 75,
          female: parseBoolean(inputs.sex, false),
        });
      }

      // ===================================================================
      // HAS-BLED - UI has individual boolean inputs matching engine params
      // ===================================================================
      case "hasbled":
        return calculateHASBLED({
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

        return calculateGCS({
          eye_opening: eyeOpening,
          verbal_response: verbalResponse,
          motor_response: motorResponse,
        });
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

        return calculateHEART({
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
      }

      // ===================================================================
      // CURB-65 - Map UI field IDs (rr, bp, age) to engine param names
      // ===================================================================
      case "curb65":
        return calculateCURB65({
          confusion: inputs.confusion,
          urea: inputs.urea,
          respiratory_rate_curb: inputs.rr,
          blood_pressure_curb: inputs.bp,
          age_65_curb: inputs.age,
        });

      // ===================================================================
      // Creatinine Clearance (Cockcroft-Gault) - Map UI field IDs
      // UI: age, weight, sex, creatinine
      // Engine: age_crcl, weight_crcl, creatinine_crcl, gender_crcl
      // ===================================================================
      case "creatinine_clearance":
        return calculateCrCl({
          age_crcl: parseNumber(inputs.age, 50),
          weight_crcl: parseNumber(inputs.weight, 70),
          creatinine_crcl: parseNumber(inputs.creatinine, 1),
          gender_crcl: inputs.sex === "Female" ? "female" : "male",
        });

      // ===================================================================
      // MELD - Map UI field IDs to engine param names
      // ===================================================================
      case "meld":
        return calculateMELD({
          inr: parseNumber(inputs.inr, 1),
          bilirubin_meld: parseNumber(inputs.bilirubin, 1),
          creatinine_meld: parseNumber(inputs.creatinine, 1),
          dialysis: parseBoolean(inputs.dialysis, false),
        });

      // ===================================================================
      // ASA Physical Status - UI inputs match engine params
      // ===================================================================
      case "asa_physical_status":
        return calculateASA({
          asa_class: inputs.asa_class || "I - Healthy patient",
          emergency: parseBoolean(inputs.emergency, false),
        });

      // ===================================================================
      // RCRI - passes entire inputs object
      // ===================================================================
      case "rcri":
        return calculateRCRI(inputs);

      // ===================================================================
      // Caprini VTE - passes entire inputs object
      // ===================================================================
      case "caprini_vte":
        return calculateCaprini(inputs);

      // ===================================================================
      // PESI - passes entire inputs object
      // ===================================================================
      case "pesi":
        return calculatePESI(inputs);

      // ===================================================================
      // SMART-COP - passes entire inputs object
      // ===================================================================
      case "smart_cop":
        return calculateSMARTCOP(inputs);

      // ===================================================================
      // Child-Pugh - passes entire inputs object
      // ===================================================================
      case "child_pugh":
        return calculateChildPugh(inputs);

      // ===================================================================
      // FIB-4 - UI inputs match engine params
      // ===================================================================
      case "fib4":
        return calculateFIB4({
          age: parseNumber(inputs.age, 50),
          ast: parseNumber(inputs.ast, 30),
          alt: parseNumber(inputs.alt, 30),
          platelets: parseNumber(inputs.platelets, 200),
        });

      // ===================================================================
      // MELD-Na - UI inputs match engine params
      // ===================================================================
      case "meld_na":
        return calculateMELDNa({
          creatinine: parseNumber(inputs.creatinine, 1.0),
          bilirubin: parseNumber(inputs.bilirubin, 1.0),
          inr: parseNumber(inputs.inr, 1.0),
          sodium: parseNumber(inputs.sodium, 140),
          dialysis: parseBoolean(inputs.dialysis, false),
        });

      // ===================================================================
      // APRI - UI inputs match engine params
      // ===================================================================
      case "apri":
        return calculateAPRI({
          ast: parseNumber(inputs.ast, 30),
          ast_upper_limit: parseNumber(inputs.ast_upper_limit, 40),
          platelets: parseNumber(inputs.platelets, 200),
        });

      default:
        return calculateGenericScore(inputs);
    }
  } catch (error) {
    console.error(`Error calculating ${calculator.id}:`, error);
    return null;
  }
}
