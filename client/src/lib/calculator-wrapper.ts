/**
 * Calculator Wrapper - Maps calculator inputs to calculation engine functions
 * CORRECTED VERSION - All mappings match UI input IDs
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

export function executeCalculator(
  calculator: Calculator,
  inputs: Record<string, any>
): CalculationResult | null {
  try {
    switch (calculator.id) {
      // ===================================================================
      // qSOFA - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "qsofa":
        return calculateQSOFA({
          altered_mentation: inputs.altered_mentation || false,
          respiratory_rate: parseFloat(inputs.respiratory_rate) || 0,
          systolic_bp: parseFloat(inputs.systolic_bp) || 0,
        });

      // ===================================================================
      // SOFA - NEEDS MAPPING (UI has select dropdowns, engine expects numbers)
      // UI: respiration (select), coagulation (number), liver (number),
      //     cardiovascular (select), cns (number), renal (number)
      // Engine: pao2_fio2, platelets, bilirubin, cardiovascular, gcs, creatinine
      // ===================================================================
      case "sofa":
        // Map respiration select to PaO2/FiO2 ratio
        const respirationMap: Record<string, number> = {
          "PaO2/FiO2 ≥400": 400,
          "PaO2/FiO2 300-399": 350,
          "PaO2/FiO2 200-299 (intubated)": 250,
          "PaO2/FiO2 <100 (intubated)": 90,
        };
        
        // Map cardiovascular select to score
        const cardiovascularMap: Record<string, number> = {
          "No hypotension": 0,
          "MAP <70 mmHg": 1,
          "Dopamine ≤5 or dobutamine": 2,
          "Dopamine >5 or epinephrine/norepinephrine": 3,
        };
        
        return calculateSOFA({
          pao2_fio2: respirationMap[inputs.respiration] || 400,
          platelets: parseFloat(inputs.coagulation) || 150,
          bilirubin: parseFloat(inputs.liver) || 1,
          cardiovascular: cardiovascularMap[inputs.cardiovascular] || 0,
          gcs: parseFloat(inputs.cns) || 15,
          creatinine: parseFloat(inputs.renal) || 1,
        });

      // ===================================================================
      // APACHE II - NEEDS MAPPING (UI has different param names)
      // UI: temperature, map, hr, rr, fio2, ph, sodium, potassium,
      //     creatinine, hematocrit, wbc, gcs
      // Engine: temperature, heart_rate, respiratory_rate_apache,
      //         systolic_apache, age_apache
      // ===================================================================
      case "apache":
        return calculateAPACHE({
          temperature: parseFloat(inputs.temperature) || 37,
          heart_rate: parseFloat(inputs.hr) || 80,
          respiratory_rate_apache: parseFloat(inputs.rr) || 16,
          systolic_apache: parseFloat(inputs.map) || 70, // MAP ~= systolic/1.5
          age_apache: parseFloat(inputs.age) || 50,
        });

      // ===================================================================
      // NIHSS - CORRECT (passes entire inputs object)
      // ===================================================================
      case "nihss":
        return calculateNIHSS(inputs);

      // ===================================================================
      // CHA2DS2-VASc - NEEDS MAPPING (UI has different param names)
      // UI: chf, hypertension, age (select), diabetes, stroke, vascular, sex (select)
      // Engine: chf, hypertension, age_75, diabetes, stroke_tia,
      //         vascular_disease, age_65_74, female
      // ===================================================================
      case "cha2ds2vasc":
        return calculateCHA2DS2VASc({
          chf: inputs.chf || false,
          hypertension: inputs.hypertension || false,
          age_75: inputs.age === "≥75",
          diabetes: inputs.diabetes || false,
          stroke_tia: inputs.stroke || false,
          vascular_disease: inputs.vascular || false,
          age_65_74: inputs.age === "65-74",
          female: inputs.sex === "Female",
        });

      // ===================================================================
      // HAS-BLED - NEEDS MAPPING (UI has combined inputs)
      // UI: hypertension, renal_liver (combined), stroke, bleeding,
      //     labile_inr, elderly, drugs_alcohol (combined)
      // Engine: hypertension, renal_disease, liver_disease, stroke_history,
      //         prior_bleeding, labile_inr, age_over_65, medication_usage, alcohol_use
      // ===================================================================
      case "hasbled":
        // Parse combined inputs
        const renalLiver = inputs.renal_liver || "";
        const drugsAlcohol = inputs.drugs_alcohol || "";
        
        return calculateHASBLED({
          hypertension: inputs.hypertension || false,
          renal_disease: renalLiver.includes("Renal") || renalLiver.includes("renal"),
          liver_disease: renalLiver.includes("Liver") || renalLiver.includes("liver"),
          stroke_history: inputs.stroke || false,
          prior_bleeding: inputs.bleeding || false,
          labile_inr: inputs.labile_inr || false,
          age_over_65: inputs.elderly || false,
          medication_usage: drugsAlcohol.includes("Drugs") || drugsAlcohol.includes("medication"),
          alcohol_use: drugsAlcohol.includes("Alcohol") || drugsAlcohol.includes("alcohol"),
        });

      // ===================================================================
      // Glasgow Coma Scale - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "gcs":
        return calculateGCS({
          eye_opening: parseFloat(inputs.eye_opening) || 4,
          verbal_response: parseFloat(inputs.verbal_response) || 5,
          motor_response: parseFloat(inputs.motor_response) || 6,
        });

      // ===================================================================
      // HEART Score - NEEDS MAPPING (age vs age_heart)
      // ===================================================================
      case "heart":
        return calculateHEART({
          history: parseFloat(inputs.history) || 0,
          ecg: parseFloat(inputs.ecg) || 0,
          age_heart: parseFloat(inputs.age) || 50,
          risk_factors: parseFloat(inputs.risk_factors) || 0,
          troponin: parseFloat(inputs.troponin) || 0,
        });

      // ===================================================================
      // CURB-65 - CORRECT (passes entire inputs object)
      // ===================================================================
      case "curb65":
        return calculateCURB65(inputs);

      // ===================================================================
      // Creatinine Clearance - NEEDS MAPPING (param name suffixes)
      // UI: age, weight, sex, creatinine
      // Engine: age_crcl, weight_crcl, creatinine_crcl, gender_crcl
      // ===================================================================
      case "crcl":
        return calculateCrCl({
          age_crcl: parseFloat(inputs.age) || 50,
          weight_crcl: parseFloat(inputs.weight) || 70,
          creatinine_crcl: parseFloat(inputs.creatinine) || 1,
          gender_crcl: inputs.sex || "male",
        });

      // ===================================================================
      // MELD - NEEDS MAPPING (param name suffixes)
      // UI: inr, creatinine, bilirubin
      // Engine: inr, bilirubin_meld, creatinine_meld, dialysis
      // ===================================================================
      case "meld":
        return calculateMELD({
          inr: parseFloat(inputs.inr) || 1,
          bilirubin_meld: parseFloat(inputs.bilirubin) || 1,
          creatinine_meld: parseFloat(inputs.creatinine) || 1,
          dialysis: inputs.dialysis || false,
        });

      // ===================================================================
      // ASA Physical Status - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "asa_physical_status":
        return calculateASA({
          asa_class: inputs.asa_class || "I - Healthy patient",
          emergency: inputs.emergency || false,
        });

      // ===================================================================
      // RCRI - CORRECT (passes entire inputs object)
      // ===================================================================
      case "rcri":
        return calculateRCRI(inputs);

      // ===================================================================
      // Caprini VTE - CORRECT (passes entire inputs object)
      // ===================================================================
      case "caprini_vte":
        return calculateCaprini(inputs);

      // ===================================================================
      // PESI - CORRECT (passes entire inputs object)
      // ===================================================================
      case "pesi":
        return calculatePESI(inputs);

      // ===================================================================
      // SMART-COP - CORRECT (passes entire inputs object)
      // ===================================================================
      case "smart_cop":
        return calculateSMARTCOP(inputs);

      // ===================================================================
      // Child-Pugh - CORRECT (passes entire inputs object)
      // ===================================================================
      case "child_pugh":
        return calculateChildPugh(inputs);

      // ===================================================================
      // FIB-4 - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "fib4":
        return calculateFIB4({
          age: parseFloat(inputs.age) || 50,
          ast: parseFloat(inputs.ast) || 30,
          alt: parseFloat(inputs.alt) || 30,
          platelets: parseFloat(inputs.platelets) || 200,
        });

      // ===================================================================
      // MELD-Na - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "meld_na":
        return calculateMELDNa({
          creatinine: parseFloat(inputs.creatinine) || 1.0,
          bilirubin: parseFloat(inputs.bilirubin) || 1.0,
          inr: parseFloat(inputs.inr) || 1.0,
          sodium: parseFloat(inputs.sodium) || 140,
          dialysis: inputs.dialysis || false,
        });

      // ===================================================================
      // APRI - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "apri":
        return calculateAPRI({
          ast: parseFloat(inputs.ast) || 30,
          ast_upper_limit: parseFloat(inputs.ast_upper_limit) || 40,
          platelets: parseFloat(inputs.platelets) || 200,
        });

      default:
        return calculateGenericScore(inputs);
    }
  } catch (error) {
    console.error(`Error calculating ${calculator.id}:`, error);
    return null;
  }
}
