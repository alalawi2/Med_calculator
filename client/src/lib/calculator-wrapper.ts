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
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:32',message:'executeCalculator entry',data:{calculatorId:calculator.id,rawInputs:inputs,inputTypes:Object.keys(inputs).reduce((acc: Record<string, string>,k)=>{acc[k]=typeof inputs[k];return acc},{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B,C,D,E'})}).catch(()=>{});
  // #endregion
  try {
    switch (calculator.id) {
      // ===================================================================
      // qSOFA - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "qsofa":
        // #region agent log
        const qsofaParsed = {
          altered_mentation: parseBoolean(inputs.altered_mentation, false),
          respiratory_rate: parseNumber(inputs.respiratory_rate, 0),
          systolic_bp: parseNumber(inputs.systolic_bp, 0),
        };
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:42',message:'qSOFA parsed inputs',data:{raw:inputs,parsed:qsofaParsed,rawRespRate:inputs.respiratory_rate,rawSystolicBP:inputs.systolic_bp,parsedRespRate:qsofaParsed.respiratory_rate,parsedSystolicBP:qsofaParsed.systolic_bp,alteredMentationType:typeof inputs.altered_mentation,alteredMentationValue:inputs.altered_mentation},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion
        const qsofaResult = calculateQSOFA(qsofaParsed);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:46',message:'qSOFA result',data:{result:qsofaResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
        // #endregion
        return qsofaResult;

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
          pao2_fio2: respirationMap[inputs.respiration] ?? 400,
          platelets: parseNumber(inputs.coagulation, 150),
          bilirubin: parseNumber(inputs.liver, 1),
          cardiovascular: cardiovascularMap[inputs.cardiovascular] ?? 0,
          gcs: parseNumber(inputs.cns, 15),
          creatinine: parseNumber(inputs.renal, 1),
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
          temperature: parseNumber(inputs.temperature, 37),
          heart_rate: parseNumber(inputs.hr, 80),
          respiratory_rate_apache: parseNumber(inputs.rr, 16),
          systolic_apache: parseNumber(inputs.map, 70), // MAP ~= systolic/1.5
          age_apache: parseNumber(inputs.age, 50),
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
        // #region agent log
        const cha2ds2Parsed = {
          chf: parseBoolean(inputs.chf, false),
          hypertension: parseBoolean(inputs.hypertension, false),
          age_75: inputs.age === "≥75",
          diabetes: parseBoolean(inputs.diabetes, false),
          stroke_tia: parseBoolean(inputs.stroke, false),
          vascular_disease: parseBoolean(inputs.vascular, false),
          age_65_74: inputs.age === "65-74",
          female: inputs.sex === "Female",
        };
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:145',message:'CHA2DS2VASc parsed inputs',data:{raw:inputs,parsed:cha2ds2Parsed,age:inputs.age,ageType:typeof inputs.age,sex:inputs.sex,sexType:typeof inputs.sex},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const cha2ds2Result = calculateCHA2DS2VASc(cha2ds2Parsed);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:155',message:'CHA2DS2VASc result',data:{result:cha2ds2Result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return cha2ds2Result;

      // ===================================================================
      // HAS-BLED - NEEDS MAPPING (UI has combined inputs)
      // UI: hypertension, renal_liver (combined), stroke, bleeding,
      //     labile_inr, elderly, drugs_alcohol (combined)
      // Engine: hypertension, renal_disease, liver_disease, stroke_history,
      //         prior_bleeding, labile_inr, age_over_65, medication_usage, alcohol_use
      // ===================================================================
      case "hasbled":
        // Parse combined inputs - BUG FIX: Ensure strings before calling .includes()
        const renalLiver = typeof inputs.renal_liver === "string" ? inputs.renal_liver : String(inputs.renal_liver || "");
        const drugsAlcohol = typeof inputs.drugs_alcohol === "string" ? inputs.drugs_alcohol : String(inputs.drugs_alcohol || "");
        // #region agent log
        const hasbledParsed = {
          hypertension: parseBoolean(inputs.hypertension, false),
          renal_disease: renalLiver.includes("Renal") || renalLiver.includes("renal"),
          liver_disease: renalLiver.includes("Liver") || renalLiver.includes("liver"),
          stroke_history: parseBoolean(inputs.stroke, false),
          prior_bleeding: parseBoolean(inputs.bleeding, false),
          labile_inr: parseBoolean(inputs.labile_inr, false),
          age_over_65: parseBoolean(inputs.elderly, false),
          medication_usage: drugsAlcohol.includes("Drugs") || drugsAlcohol.includes("medication"),
          alcohol_use: drugsAlcohol.includes("Alcohol") || drugsAlcohol.includes("alcohol"),
        };
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:127',message:'HAS-BLED parsed inputs',data:{raw:{hypertension:inputs.hypertension,stroke:inputs.stroke,bleeding:inputs.bleeding,labile_inr:inputs.labile_inr,elderly:inputs.elderly,renalLiver,drugsAlcohol},parsed:hasbledParsed,hypertensionType:typeof inputs.hypertension,hypertensionValue:inputs.hypertension,strokeType:typeof inputs.stroke,strokeValue:inputs.stroke},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'})}).catch(()=>{});
        // #endregion
        const hasbledResult = calculateHASBLED(hasbledParsed);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:142',message:'HAS-BLED result',data:{result:hasbledResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,D'})}).catch(()=>{});
        // #endregion
        return hasbledResult;

      // ===================================================================
      // Glasgow Coma Scale - NEEDS MAPPING (UI has select dropdowns with text, engine expects numbers)
      // UI: eye_opening (select), verbal_response (select), motor_response (select)
      // Engine: eye_opening (1-4), verbal_response (1-5), motor_response (1-6)
      // ===================================================================
      case "gcs":
      case "glasgow_coma":
        // Map text options to numeric scores
        const eyeOpeningMap: Record<string, number> = {
          "Spontaneous": 4,
          "To verbal command": 3,
          "To pain": 2,
          "No response": 1,
        };
        const verbalResponseMap: Record<string, number> = {
          "Oriented": 5,
          "Confused": 4,
          "Inappropriate": 3,
          "Incomprehensible": 2,
          "No response": 1,
        };
        const motorResponseMap: Record<string, number> = {
          "Obeys commands": 6,
          "Localizes pain": 5,
          "Withdraws": 4,
          "Abnormal flexion": 3,
          "Abnormal extension": 2,
          "No response": 1,
        };
        
        // Handle both text (from select) and numeric (direct input) values
        const eyeOpening = typeof inputs.eye_opening === "string" 
          ? eyeOpeningMap[inputs.eye_opening] || parseNumber(inputs.eye_opening, 4)
          : parseNumber(inputs.eye_opening, 4);
        const verbalResponse = typeof inputs.verbal_response === "string"
          ? verbalResponseMap[inputs.verbal_response] || parseNumber(inputs.verbal_response, 5)
          : parseNumber(inputs.verbal_response, 5);
        const motorResponse = typeof inputs.motor_response === "string"
          ? motorResponseMap[inputs.motor_response] || parseNumber(inputs.motor_response, 6)
          : parseNumber(inputs.motor_response, 6);
        
        return calculateGCS({
          eye_opening: eyeOpening,
          verbal_response: verbalResponse,
          motor_response: motorResponse,
        });

      // ===================================================================
      // HEART Score - NEEDS MAPPING (age vs age_heart)
      // ===================================================================
      case "heart":
        return calculateHEART({
          history: parseNumber(inputs.history, 0),
          ecg: parseNumber(inputs.ecg, 0),
          age_heart: parseNumber(inputs.age, 50),
          risk_factors: parseNumber(inputs.risk_factors, 0),
          troponin: parseNumber(inputs.troponin, 0),
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
          age_crcl: parseNumber(inputs.age, 50),
          weight_crcl: parseNumber(inputs.weight, 70),
          creatinine_crcl: parseNumber(inputs.creatinine, 1),
          gender_crcl: inputs.sex || "male",
        });

      // ===================================================================
      // MELD - NEEDS MAPPING (param name suffixes)
      // UI: inr, creatinine, bilirubin
      // Engine: inr, bilirubin_meld, creatinine_meld, dialysis
      // ===================================================================
      case "meld":
        // #region agent log
        const meldRaw = {inr:inputs.inr,bilirubin:inputs.bilirubin,creatinine:inputs.creatinine,dialysis:inputs.dialysis};
        const meldParsed = {
          inr: parseNumber(inputs.inr, 1),
          bilirubin_meld: parseNumber(inputs.bilirubin, 1),
          creatinine_meld: parseNumber(inputs.creatinine, 1),
          dialysis: parseBoolean(inputs.dialysis, false),
        };
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:190',message:'MELD parsed inputs',data:{raw:meldRaw,parsed:meldParsed,rawCreatinine:inputs.creatinine,parsedCreatinine:meldParsed.creatinine_meld,rawBilirubin:inputs.bilirubin,parsedBilirubin:meldParsed.bilirubin_meld,creatinineIsZero:parseFloat(inputs.creatinine)===0,bilirubinIsZero:parseFloat(inputs.bilirubin)===0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
        // #endregion
        const meldResult = calculateMELD(meldParsed);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:196',message:'MELD result',data:{result:meldResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,C'})}).catch(()=>{});
        // #endregion
        return meldResult;

      // ===================================================================
      // ASA Physical Status - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "asa_physical_status":
        return calculateASA({
          asa_class: inputs.asa_class || "I - Healthy patient",
          emergency: parseBoolean(inputs.emergency, false),
        });

      // ===================================================================
      // RCRI - CORRECT (passes entire inputs object)
      // ===================================================================
      case "rcri":
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:264',message:'RCRI inputs',data:{inputs,inputTypes:Object.keys(inputs).reduce((acc: Record<string, string>,k)=>{acc[k]=typeof inputs[k];return acc},{})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:276',message:'PESI inputs',data:{inputs,age:inputs.age,ageType:typeof inputs.age},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const pesiResult = calculatePESI(inputs);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:277',message:'PESI result',data:{result:pesiResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return pesiResult;

      // ===================================================================
      // SMART-COP - CORRECT (passes entire inputs object)
      // ===================================================================
      case "smart_cop":
        return calculateSMARTCOP(inputs);

      // ===================================================================
      // Child-Pugh - CORRECT (passes entire inputs object)
      // ===================================================================
      case "child_pugh":
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:288',message:'Child-Pugh inputs',data:{inputs,bilirubin:inputs.bilirubin,bilirubinType:typeof inputs.bilirubin,albumin:inputs.albumin,albuminType:typeof inputs.albumin,inr:inputs.inr,inrType:typeof inputs.inr},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const childPughResult = calculateChildPugh(inputs);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/a211a2ec-f066-4fc4-95bc-89cfb5ea6b15',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'calculator-wrapper.ts:289',message:'Child-Pugh result',data:{result:childPughResult},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        return childPughResult;

      // ===================================================================
      // FIB-4 - CORRECT (UI inputs match engine params)
      // ===================================================================
      case "fib4":
        return calculateFIB4({
          age: parseNumber(inputs.age, 50),
          ast: parseNumber(inputs.ast, 30),
          alt: parseNumber(inputs.alt, 30),
          platelets: parseNumber(inputs.platelets, 200),
        });

      // ===================================================================
      // MELD-Na - CORRECT (UI inputs match engine params)
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
      // APRI - CORRECT (UI inputs match engine params)
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
