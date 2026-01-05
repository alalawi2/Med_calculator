/**
 * Calculator Wrapper - Maps calculator inputs to calculation engine functions
 */

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
      case "qsofa":
        return calculateQSOFA({
          altered_mentation: inputs.altered_mentation || false,
          respiratory_rate: parseFloat(inputs.respiratory_rate) || 0,
          systolic_bp: parseFloat(inputs.systolic_bp) || 0,
        });

      case "sofa":
        return calculateSOFA({
          pao2_fio2: parseFloat(inputs.pao2_fio2) || 400,
          platelets: parseFloat(inputs.platelets) || 150,
          bilirubin: parseFloat(inputs.bilirubin) || 1,
          map: parseFloat(inputs.map) || 100,
          gcs: parseFloat(inputs.gcs) || 15,
          creatinine: parseFloat(inputs.creatinine) || 1,
        });

      case "apache":
        return calculateAPACHE({
          temperature: parseFloat(inputs.temperature) || 37,
          heart_rate: parseFloat(inputs.heart_rate) || 80,
          respiratory_rate_apache: parseFloat(inputs.respiratory_rate_apache) || 16,
          systolic_apache: parseFloat(inputs.systolic_apache) || 120,
          age_apache: parseFloat(inputs.age_apache) || 50,
        });

      case "nihss":
        return calculateNIHSS(inputs);

      case "cha2ds2vasc":
        return calculateCHA2DS2VASc({
          chf: inputs.chf || false,
          hypertension: inputs.hypertension || false,
          age_75: inputs.age_75 || false,
          diabetes: inputs.diabetes || false,
          stroke_tia: inputs.stroke_tia || false,
          vascular_disease: inputs.vascular_disease || false,
          age_65_74: inputs.age_65_74 || false,
          female: inputs.female || false,
        });

      case "gcs":
        return calculateGCS({
          eye_opening: parseFloat(inputs.eye_opening) || 4,
          verbal_response: parseFloat(inputs.verbal_response) || 5,
          motor_response: parseFloat(inputs.motor_response) || 6,
        });

      case "heart":
        return calculateHEART({
          history: parseFloat(inputs.history) || 0,
          ecg: parseFloat(inputs.ecg) || 0,
          age_heart: parseFloat(inputs.age_heart) || 50,
          risk_factors: parseFloat(inputs.risk_factors) || 0,
          troponin: parseFloat(inputs.troponin) || 0,
        });

      case "curb65":
        return calculateCURB65({
          confusion: inputs.confusion || false,
          urea: inputs.urea || false,
          respiratory_rate_curb: inputs.respiratory_rate_curb || false,
          blood_pressure_curb: inputs.blood_pressure_curb || false,
          age_65_curb: inputs.age_65_curb || false,
        });

      case "crcl":
        return calculateCrCl({
          age_crcl: parseFloat(inputs.age_crcl) || 50,
          weight_crcl: parseFloat(inputs.weight_crcl) || 70,
          creatinine_crcl: parseFloat(inputs.creatinine_crcl) || 1,
          gender_crcl: inputs.gender_crcl || "male",
        });

      case "meld":
        return calculateMELD({
          inr: parseFloat(inputs.inr) || 1,
          bilirubin_meld: parseFloat(inputs.bilirubin_meld) || 1,
          creatinine_meld: parseFloat(inputs.creatinine_meld) || 1,
        });

      // Perioperative Medicine
      case "asa_physical_status":
        return calculateASA({
          asa_class: inputs.asa_class || "I - Healthy patient",
          emergency: inputs.emergency || false,
        });

      case "rcri":
        return calculateRCRI({
          high_risk_surgery: inputs.high_risk_surgery || false,
          ischemic_heart_disease: inputs.ischemic_heart_disease || false,
          heart_failure: inputs.heart_failure || false,
          cerebrovascular_disease: inputs.cerebrovascular_disease || false,
          diabetes_insulin: inputs.diabetes_insulin || false,
          renal_insufficiency: inputs.renal_insufficiency || false,
        });

      case "caprini_vte":
        return calculateCaprini({
          age: inputs.age || "<41 years",
          minor_surgery: inputs.minor_surgery || false,
          major_surgery: inputs.major_surgery || false,
          bmi: inputs.bmi || false,
          varicose_veins: inputs.varicose_veins || false,
          current_cancer: inputs.current_cancer || false,
          previous_vte: inputs.previous_vte || false,
          thrombophilia: inputs.thrombophilia || false,
          immobility: inputs.immobility || false,
        });

      case "pesi":
        return calculatePESI({
          age: parseFloat(inputs.age) || 50,
          male: inputs.male || false,
          cancer: inputs.cancer || false,
          heart_failure: inputs.heart_failure || false,
          chronic_lung_disease: inputs.chronic_lung_disease || false,
          pulse: inputs.pulse || false,
          systolic_bp: inputs.systolic_bp || false,
          respiratory_rate: inputs.respiratory_rate || false,
          temperature: inputs.temperature || false,
          altered_mental: inputs.altered_mental || false,
          oxygen_sat: inputs.oxygen_sat || false,
        });

      case "smart_cop":
        return calculateSMARTCOP({
          systolic_bp: inputs.systolic_bp || false,
          multilobar: inputs.multilobar || false,
          albumin: inputs.albumin || false,
          respiratory_rate: inputs.respiratory_rate || false,
          tachycardia: inputs.tachycardia || false,
          confusion: inputs.confusion || false,
          oxygen: inputs.oxygen || false,
          ph: inputs.ph || false,
        });

      // Hepatology
      case "child_pugh":
        return calculateChildPugh({
          bilirubin: parseFloat(inputs.bilirubin) || 1.0,
          albumin: parseFloat(inputs.albumin) || 3.5,
          inr: parseFloat(inputs.inr) || 1.0,
          ascites: inputs.ascites || "None",
          encephalopathy: inputs.encephalopathy || "None",
        });

      case "fib4":
        return calculateFIB4({
          age: parseFloat(inputs.age) || 50,
          ast: parseFloat(inputs.ast) || 30,
          alt: parseFloat(inputs.alt) || 30,
          platelets: parseFloat(inputs.platelets) || 200,
        });

      case "meld_na":
        return calculateMELDNa({
          creatinine: parseFloat(inputs.creatinine) || 1.0,
          bilirubin: parseFloat(inputs.bilirubin) || 1.0,
          inr: parseFloat(inputs.inr) || 1.0,
          sodium: parseFloat(inputs.sodium) || 140,
          dialysis: inputs.dialysis || false,
        });

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
