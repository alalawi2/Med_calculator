import { expandedMedications } from "./medications-expanded";
export interface Calculator {
  id: string;
  name: string;
  shortName: string;
  category: string;
  subcategory: string;
  description: string;
  icon: string;
  color: string;
  frequency: "critical" | "high" | "medium";
  useCases: string[];
  inputs: CalculatorInput[];
  references: Reference[];
  scoringLogic?: string;
  interpretation?: Record<string, string>;
}

export interface CalculatorInput {
  id: string;
  label: string;
  description: string;
  type: "boolean" | "number" | "select";
  unit?: string;
  normal?: string;
  required: boolean;
  options?: { label: string; value: string | number }[];
}

export interface Reference {
  authors: string;
  year: number;
  title: string;
  journal: string;
  volume: string;
  pages: string;
  citations: number;
  impactFactor: number;
  badge?: "most-cited" | "highly-cited" | "cited";
}

export interface MedicationDose {
  id: string;
  name: string;
  category: string;
  indication: string;
  standardDose: string;
  renalAdjustment: string;
  hepaticAdjustment?: string;
  notes: string;
  references: Reference[];
}

// CRITICAL CARE & SEPSIS
export const qSOFA: Calculator = {
  id: "qsofa",
  name: "Quick SOFA Score",
  shortName: "qSOFA",
  category: "Critical Care",
  subcategory: "Sepsis",
  description: "Identifies high-risk patients for sepsis-related mortality outside the ICU",
  icon: "AlertTriangle",
  color: "red",
  frequency: "critical",
  useCases: ["Sepsis identification", "Mortality prediction", "ICU admission criteria"],
  inputs: [
    {
      id: "altered_mentation",
      label: "Altered Mentation",
      description: "Disorientation, lethargy, or agitation",
      type: "boolean",
      required: true,
    },
    {
      id: "respiratory_rate",
      label: "Respiratory Rate",
      description: "Breaths per minute (normal: 12-20)",
      type: "number",
      unit: "breaths/min",
      normal: "12-20",
      required: true,
    },
    {
      id: "systolic_bp",
      label: "Systolic Blood Pressure",
      description: "mmHg (normal: >100)",
      type: "number",
      unit: "mmHg",
      normal: ">100",
      required: true,
    },
  ],
  references: [
    {
      authors: "Singer M, et al.",
      year: 2016,
      title: "The Third International Consensus Definitions for Sepsis and Septic Shock (Sepsis-3)",
      journal: "JAMA",
      volume: "315",
      pages: "801-810",
      citations: 3200,
      impactFactor: 41.9,
      badge: "most-cited",
    },
  ],
  interpretation: {
    "0-1": "Low risk - Sepsis unlikely. Continue standard monitoring.",
    "2-3": "High risk - Activate sepsis protocol immediately. ICU admission recommended.",
  },
};

export const SOFA: Calculator = {
  id: "sofa",
  name: "Sequential Organ Failure Assessment",
  shortName: "SOFA",
  category: "Critical Care",
  subcategory: "Sepsis",
  description: "Predicts ICU mortality based on organ dysfunction",
  icon: "AlertTriangle",
  color: "red",
  frequency: "high",
  useCases: ["ICU mortality prediction", "Organ dysfunction assessment", "Prognostication"],
  inputs: [
    {
      id: "pao2_fio2",
      label: "PaO2/FiO2 Ratio",
      description: "Respiratory component",
      type: "number",
      required: true,
    },
    {
      id: "platelets",
      label: "Platelet Count",
      description: "Coagulation component (×10³/μL)",
      type: "number",
      required: true,
    },
    {
      id: "bilirubin",
      label: "Bilirubin",
      description: "Hepatic component (mg/dL)",
      type: "number",
      required: true,
    },
    {
      id: "map",
      label: "Mean Arterial Pressure",
      description: "Cardiovascular component (mmHg)",
      type: "number",
      required: true,
    },
    {
      id: "gcs",
      label: "Glasgow Coma Scale",
      description: "Neurological component (3-15)",
      type: "number",
      required: true,
    },
    {
      id: "creatinine",
      label: "Creatinine",
      description: "Renal component (mg/dL)",
      type: "number",
      required: true,
    },
  ],
  references: [
    {
      authors: "Seymour CW, et al.",
      year: 2016,
      title: "Assessment of the SOFA score's accuracy in predicting organ dysfunction",
      journal: "JAMA",
      volume: "315",
      pages: "1582-1590",
      citations: 2500,
      impactFactor: 41.9,
      badge: "highly-cited",
    },
  ],
};

export const APACHE: Calculator = {
  id: "apache",
  name: "APACHE II Score",
  shortName: "APACHE II",
  category: "Critical Care",
  subcategory: "Severity",
  description: "Estimates ICU mortality based on physiological parameters",
  icon: "AlertTriangle",
  color: "red",
  frequency: "high",
  useCases: ["ICU admission", "Daily prognostication", "Resource allocation"],
  inputs: [
    {
      id: "temperature",
      label: "Temperature",
      description: "°C (rectal)",
      type: "number",
      required: true,
    },
    {
      id: "heart_rate",
      label: "Heart Rate",
      description: "beats/min",
      type: "number",
      required: true,
    },
    {
      id: "respiratory_rate_apache",
      label: "Respiratory Rate",
      description: "breaths/min",
      type: "number",
      required: true,
    },
    {
      id: "systolic_apache",
      label: "Systolic Blood Pressure",
      description: "mmHg",
      type: "number",
      required: true,
    },
    {
      id: "age_apache",
      label: "Age",
      description: "years",
      type: "number",
      required: true,
    },
  ],
  references: [
    {
      authors: "Knaus WA, et al.",
      year: 1985,
      title: "APACHE II: A severity of disease classification system",
      journal: "Critical Care Medicine",
      volume: "13",
      pages: "818-829",
      citations: 2400,
      impactFactor: 3.2,
      badge: "highly-cited",
    },
  ],
};

export const NEWS2: Calculator = {
  id: "news2",
  name: "NEWS2 (National Early Warning Score)",
  shortName: "NEWS2",
  category: "Critical Care",
  subcategory: "Deterioration",
  description: "Detects patient deterioration and triggers escalation",
  icon: "AlertTriangle",
  color: "orange",
  frequency: "high",
  useCases: ["Early deterioration detection", "Escalation trigger", "Ward monitoring"],
  inputs: [
    {
      id: "respiratory_rate_news",
      label: "Respiratory Rate",
      description: "breaths/min",
      type: "number",
      required: true,
    },
    {
      id: "oxygen_sat",
      label: "Oxygen Saturation",
      description: "%",
      type: "number",
      required: true,
    },
    {
      id: "temperature_news",
      label: "Temperature",
      description: "°C",
      type: "number",
      required: true,
    },
    {
      id: "systolic_news",
      label: "Systolic Blood Pressure",
      description: "mmHg",
      type: "number",
      required: true,
    },
    {
      id: "heart_rate_news",
      label: "Heart Rate",
      description: "beats/min",
      type: "number",
      required: true,
    },
    {
      id: "avpu",
      label: "Consciousness",
      description: "Alert/Voice/Pain/Unresponsive",
      type: "select",
      options: [
        { label: "Alert", value: "alert" },
        { label: "Voice", value: "voice" },
        { label: "Pain", value: "pain" },
        { label: "Unresponsive", value: "unresponsive" },
      ],
      required: true,
    },
  ],
  references: [
    {
      authors: "Royal College of Physicians",
      year: 2017,
      title: "National Early Warning Score (NEWS) 2",
      journal: "RCP",
      volume: "2",
      pages: "1-19",
      citations: 1900,
      impactFactor: 0,
      badge: "highly-cited",
    },
  ],
};

// STROKE & NEUROLOGICAL
export const NIHSS: Calculator = {
  id: "nihss",
  name: "NIH Stroke Scale",
  shortName: "NIHSS",
  category: "Neurology",
  subcategory: "Stroke",
  description: "Quantifies stroke severity and determines thrombolytic eligibility",
  icon: "Brain",
  color: "red",
  frequency: "critical",
  useCases: ["Acute stroke severity", "Thrombolytic eligibility", "Prognostication"],
  inputs: [
    {
      id: "loc",
      label: "Level of Consciousness",
      description: "Alert/Drowsy/Obtunded/Comatose",
      type: "select",
      options: [
        { label: "Alert", value: 0 },
        { label: "Drowsy", value: 1 },
        { label: "Obtunded", value: 2 },
        { label: "Comatose", value: 3 },
      ],
      required: true,
    },
    {
      id: "loc_questions",
      label: "LOC - Questions",
      description: "Answers questions correctly",
      type: "select",
      options: [
        { label: "Both correct", value: 0 },
        { label: "One correct", value: 1 },
        { label: "Both incorrect", value: 2 },
      ],
      required: true,
    },
    {
      id: "loc_commands",
      label: "LOC - Commands",
      description: "Follows commands",
      type: "select",
      options: [
        { label: "Obeys both", value: 0 },
        { label: "Obeys one", value: 1 },
        { label: "Obeys neither", value: 2 },
      ],
      required: true,
    },
    {
      id: "gaze",
      label: "Gaze",
      description: "Normal/Partial/Forced",
      type: "select",
      options: [
        { label: "Normal", value: 0 },
        { label: "Partial", value: 1 },
        { label: "Forced", value: 2 },
      ],
      required: true,
    },
    {
      id: "visual",
      label: "Visual Fields",
      description: "Normal/Partial/Complete",
      type: "select",
      options: [
        { label: "No defect", value: 0 },
        { label: "Partial", value: 1 },
        { label: "Complete", value: 2 },
        { label: "Bilateral", value: 3 },
      ],
      required: true,
    },
    {
      id: "facial",
      label: "Facial Palsy",
      description: "Normal/Minor/Partial/Complete",
      type: "select",
      options: [
        { label: "Normal", value: 0 },
        { label: "Minor", value: 1 },
        { label: "Partial", value: 2 },
        { label: "Complete", value: 3 },
      ],
      required: true,
    },
    {
      id: "motor_arm_left",
      label: "Motor Arm - Left",
      description: "0-4 scale",
      type: "select",
      options: [
        { label: "No drift", value: 0 },
        { label: "Drift", value: 1 },
        { label: "Can't resist", value: 2 },
        { label: "No effort", value: 3 },
        { label: "No movement", value: 4 },
      ],
      required: true,
    },
    {
      id: "motor_arm_right",
      label: "Motor Arm - Right",
      description: "0-4 scale",
      type: "select",
      options: [
        { label: "No drift", value: 0 },
        { label: "Drift", value: 1 },
        { label: "Can't resist", value: 2 },
        { label: "No effort", value: 3 },
        { label: "No movement", value: 4 },
      ],
      required: true,
    },
    {
      id: "motor_leg_left",
      label: "Motor Leg - Left",
      description: "0-4 scale",
      type: "select",
      options: [
        { label: "No drift", value: 0 },
        { label: "Drift", value: 1 },
        { label: "Can't resist", value: 2 },
        { label: "No effort", value: 3 },
        { label: "No movement", value: 4 },
      ],
      required: true,
    },
    {
      id: "motor_leg_right",
      label: "Motor Leg - Right",
      description: "0-4 scale",
      type: "select",
      options: [
        { label: "No drift", value: 0 },
        { label: "Drift", value: 1 },
        { label: "Can't resist", value: 2 },
        { label: "No effort", value: 3 },
        { label: "No movement", value: 4 },
      ],
      required: true,
    },
    {
      id: "limb_ataxia",
      label: "Limb Ataxia",
      description: "None/One/Both",
      type: "select",
      options: [
        { label: "Absent", value: 0 },
        { label: "One limb", value: 1 },
        { label: "Both limbs", value: 2 },
      ],
      required: true,
    },
    {
      id: "sensory",
      label: "Sensory",
      description: "Normal/Mild/Severe",
      type: "select",
      options: [
        { label: "Normal", value: 0 },
        { label: "Mild", value: 1 },
        { label: "Severe", value: 2 },
      ],
      required: true,
    },
    {
      id: "language",
      label: "Language",
      description: "Normal/Mild/Severe/Mute",
      type: "select",
      options: [
        { label: "Normal", value: 0 },
        { label: "Mild", value: 1 },
        { label: "Severe", value: 2 },
        { label: "Mute", value: 3 },
      ],
      required: true,
    },
    {
      id: "dysarthria",
      label: "Dysarthria",
      description: "Normal/Mild/Severe",
      type: "select",
      options: [
        { label: "Normal", value: 0 },
        { label: "Mild", value: 1 },
        { label: "Severe", value: 2 },
      ],
      required: true,
    },
    {
      id: "extinction",
      label: "Extinction/Inattention",
      description: "None/Mild/Severe",
      type: "select",
      options: [
        { label: "None", value: 0 },
        { label: "Mild", value: 1 },
        { label: "Severe", value: 2 },
      ],
      required: true,
    },
  ],
  references: [
    {
      authors: "Brott T, et al.",
      year: 1989,
      title: "Measurements of acute cerebral infarction: a clinical examination scale",
      journal: "Stroke",
      volume: "20",
      pages: "864-870",
      citations: 4200,
      impactFactor: 6.2,
      badge: "most-cited",
    },
  ],
};

export const CHA2DS2VASc: Calculator = {
  id: "cha2ds2vasc",
  name: "CHA₂DS₂-VASc Score",
  shortName: "CHA₂DS₂-VASc",
  category: "Cardiology",
  subcategory: "Stroke Risk",
  description: "Predicts stroke risk in atrial fibrillation for anticoagulation decisions",
  icon: "Heart",
  color: "red",
  frequency: "high",
  useCases: ["Stroke risk in AF", "Anticoagulation decisions", "Risk stratification"],
  inputs: [
    {
      id: "chf",
      label: "Congestive Heart Failure",
      description: "History of CHF",
      type: "boolean",
      required: true,
    },
    {
      id: "hypertension",
      label: "Hypertension",
      description: "On treatment or SBP >140",
      type: "boolean",
      required: true,
    },
    {
      id: "age_75",
      label: "Age ≥75 Years",
      description: "Age 75 or older",
      type: "boolean",
      required: true,
    },
    {
      id: "diabetes",
      label: "Diabetes",
      description: "On treatment or fasting glucose >125",
      type: "boolean",
      required: true,
    },
    {
      id: "stroke_tia",
      label: "Stroke/TIA/Thromboembolism",
      description: "Prior stroke, TIA, or thromboembolism",
      type: "boolean",
      required: true,
    },
    {
      id: "vascular_disease",
      label: "Vascular Disease",
      description: "MI, PAD, or aortic plaque",
      type: "boolean",
      required: true,
    },
    {
      id: "age_65_74",
      label: "Age 65-74 Years",
      description: "Age between 65-74",
      type: "boolean",
      required: true,
    },
    {
      id: "female",
      label: "Female Sex",
      description: "Female gender",
      type: "boolean",
      required: true,
    },
  ],
  references: [
    {
      authors: "Lip GY, et al.",
      year: 2010,
      title: "Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation",
      journal: "Chest",
      volume: "137",
      pages: "263-272",
      citations: 3100,
      impactFactor: 7.3,
      badge: "highly-cited",
    },
  ],
};

export const GCS: Calculator = {
  id: "gcs",
  name: "Glasgow Coma Scale",
  shortName: "GCS",
  category: "Neurology",
  subcategory: "Consciousness",
  description: "Assesses level of consciousness and neurological status",
  icon: "Brain",
  color: "orange",
  frequency: "critical",
  useCases: ["Altered mental status", "Head injury", "Intubation criteria", "Prognostication"],
  inputs: [
    {
      id: "eye_opening",
      label: "Eye Opening",
      description: "Spontaneous/To command/To pain/None",
      type: "select",
      options: [
        { label: "Spontaneous", value: 4 },
        { label: "To command", value: 3 },
        { label: "To pain", value: 2 },
        { label: "No response", value: 1 },
      ],
      required: true,
    },
    {
      id: "verbal_response",
      label: "Verbal Response",
      description: "Oriented/Confused/Inappropriate/Incomprehensible/None",
      type: "select",
      options: [
        { label: "Oriented", value: 5 },
        { label: "Confused", value: 4 },
        { label: "Inappropriate", value: 3 },
        { label: "Incomprehensible", value: 2 },
        { label: "No response", value: 1 },
      ],
      required: true,
    },
    {
      id: "motor_response",
      label: "Motor Response",
      description: "Obeys/Localizes/Withdraws/Abnormal/Extension/None",
      type: "select",
      options: [
        { label: "Obeys commands", value: 6 },
        { label: "Localizes pain", value: 5 },
        { label: "Withdraws from pain", value: 4 },
        { label: "Abnormal flexion", value: 3 },
        { label: "Abnormal extension", value: 2 },
        { label: "No response", value: 1 },
      ],
      required: true,
    },
  ],
  references: [
    {
      authors: "Teasdale G, Jennett B",
      year: 1974,
      title: "Assessment of coma and impaired consciousness: A practical scale",
      journal: "Lancet",
      volume: "2",
      pages: "81-84",
      citations: 5000,
      impactFactor: 59.1,
      badge: "most-cited",
    },
  ],
};

export const ABCD2: Calculator = {
  id: "abcd2",
  name: "ABCD2 Score",
  shortName: "ABCD2",
  category: "Neurology",
  subcategory: "TIA/Stroke",
  description: "Predicts stroke risk after TIA for urgent imaging decisions",
  icon: "Brain",
  color: "orange",
  frequency: "high",
  useCases: ["TIA risk stratification", "Urgent imaging", "Admission decisions"],
  inputs: [
    {
      id: "age_abcd",
      label: "Age ≥60 Years",
      description: "Age 60 or older",
      type: "boolean",
      required: true,
    },
    {
      id: "bp_abcd",
      label: "Blood Pressure ≥140/90",
      description: "Elevated BP at presentation",
      type: "boolean",
      required: true,
    },
    {
      id: "clinical_features",
      label: "Clinical Features",
      description: "Weakness or speech difficulty",
      type: "select",
      options: [
        { label: "None", value: 0 },
        { label: "Speech difficulty only", value: 1 },
        { label: "Weakness", value: 2 },
      ],
      required: true,
    },
    {
      id: "duration",
      label: "Duration of Symptoms",
      description: "<10 min or 10-59 min",
      type: "select",
      options: [
        { label: "<10 minutes", value: 0 },
        { label: "10-59 minutes", value: 1 },
        { label: "≥60 minutes", value: 2 },
      ],
      required: true,
    },
    {
      id: "diabetes_abcd",
      label: "Diabetes",
      description: "History of diabetes",
      type: "boolean",
      required: true,
    },
  ],
  references: [
    {
      authors: "Johnston SC, et al.",
      year: 2007,
      title: "Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack",
      journal: "Lancet",
      volume: "369",
      pages: "283-292",
      citations: 1800,
      impactFactor: 59.1,
      badge: "highly-cited",
    },
  ],
};

// CARDIOVASCULAR
export const HEART: Calculator = {
  id: "heart",
  name: "HEART Score",
  shortName: "HEART",
  category: "Cardiology",
  subcategory: "Acute Coronary Syndrome",
  description: "Predicts 6-week risk of major adverse cardiac events in chest pain",
  icon: "Heart",
  color: "red",
  frequency: "critical",
  useCases: ["Chest pain risk stratification", "Cardiac event prediction", "ED disposition"],
  inputs: [
    {
      id: "history",
      label: "History of Chest Pain",
      description: "Typical/Atypical/Non-cardiac",
      type: "select",
      options: [
        { label: "Typical", value: 2 },
        { label: "Atypical", value: 1 },
        { label: "Non-cardiac", value: 0 },
      ],
      required: true,
    },
    {
      id: "ecg",
      label: "ECG Changes",
      description: "Significant ST changes",
      type: "select",
      options: [
        { label: "Normal", value: 0 },
        { label: "Non-specific", value: 1 },
        { label: "ST changes", value: 2 },
      ],
      required: true,
    },
    {
      id: "age_heart",
      label: "Age",
      description: "Patient age in years",
      type: "number",
      unit: "years",
      required: true,
    },
    {
      id: "risk_factors",
      label: "Risk Factors",
      description: "Number of cardiac risk factors",
      type: "select",
      options: [
        { label: "0-1 factors", value: 0 },
        { label: "2-3 factors", value: 1 },
        { label: "≥4 factors", value: 2 },
      ],
      required: true,
    },
    {
      id: "troponin",
      label: "Troponin",
      description: "Elevated troponin",
      type: "select",
      options: [
        { label: "Normal", value: 0 },
        { label: "1-3x normal", value: 1 },
        { label: ">3x normal", value: 2 },
      ],
      required: true,
    },
  ],
  references: [
    {
      authors: "Six AJ, et al.",
      year: 2008,
      title: "Chest pain in the emergency room: value of the HEART score",
      journal: "Netherlands Heart Journal",
      volume: "16",
      pages: "191-196",
      citations: 1800,
      impactFactor: 2.1,
      badge: "highly-cited",
    },
  ],
};

export const TIMI: Calculator = {
  id: "timi",
  name: "TIMI Risk Score",
  shortName: "TIMI",
  category: "Cardiology",
  subcategory: "Acute Coronary Syndrome",
  description: "Predicts mortality and MI risk in acute coronary syndrome",
  icon: "Heart",
  color: "red",
  frequency: "high",
  useCases: ["ACS risk stratification", "Invasive strategy decisions", "Prognosis"],
  inputs: [
    {
      id: "age_timi",
      label: "Age ≥65 Years",
      description: "Age 65 or older",
      type: "boolean",
      required: true,
    },
    {
      id: "risk_factors_timi",
      label: "≥3 Risk Factors",
      description: "HTN, HLD, DM, smoking, family history",
      type: "boolean",
      required: true,
    },
    {
      id: "prior_cad",
      label: "Prior CAD",
      description: "Prior coronary artery disease",
      type: "boolean",
      required: true,
    },
    {
      id: "aspirin",
      label: "Aspirin Use",
      description: "Aspirin in past 7 days",
      type: "boolean",
      required: true,
    },
    {
      id: "severe_angina",
      label: "Severe Angina",
      description: "≥2 episodes in 24 hours",
      type: "boolean",
      required: true,
    },
    {
      id: "st_changes",
      label: "ST Changes",
      description: "ST elevation or depression",
      type: "boolean",
      required: true,
    },
    {
      id: "troponin_timi",
      label: "Elevated Troponin",
      description: "Elevated cardiac biomarker",
      type: "boolean",
      required: true,
    },
  ],
  references: [
    {
      authors: "Antman EM, et al.",
      year: 2000,
      title: "The TIMI risk score for unstable angina/non-ST elevation MI",
      journal: "JAMA",
      volume: "284",
      pages: "835-842",
      citations: 2200,
      impactFactor: 41.9,
      badge: "highly-cited",
    },
  ],
};

export const HAS_BLED: Calculator = {
  id: "has_bled",
  name: "HAS-BLED Score",
  shortName: "HAS-BLED",
  category: "Cardiology",
  subcategory: "Anticoagulation",
  description: "Predicts bleeding risk in anticoagulated patients",
  icon: "Heart",
  color: "orange",
  frequency: "high",
  useCases: ["Bleeding risk assessment", "Anticoagulation safety", "AF management"],
  inputs: [
    {
      id: "hypertension_hb",
      label: "Hypertension",
      description: "On treatment or SBP >160",
      type: "boolean",
      required: true,
    },
    {
      id: "abnormal_renal",
      label: "Abnormal Renal Function",
      description: "Dialysis, transplant, or Cr >2.26",
      type: "boolean",
      required: true,
    },
    {
      id: "abnormal_hepatic",
      label: "Abnormal Hepatic Function",
      description: "Cirrhosis or bilirubin >2x",
      type: "boolean",
      required: true,
    },
    {
      id: "stroke_hb",
      label: "Stroke History",
      description: "Prior stroke, TIA, or thromboembolism",
      type: "boolean",
      required: true,
    },
    {
      id: "bleeding_history",
      label: "Bleeding History",
      description: "Prior major bleeding or predisposition",
      type: "boolean",
      required: true,
    },
    {
      id: "labile_inr",
      label: "Labile INR",
      description: "Unstable/high INR or <60% time in range",
      type: "boolean",
      required: true,
    },
    {
      id: "age_hb",
      label: "Age >60 Years",
      description: "Age older than 60",
      type: "boolean",
      required: true,
    },
    {
      id: "drugs_alcohol",
      label: "Drugs or Alcohol",
      description: "Concurrent use or abuse",
      type: "boolean",
      required: true,
    },
  ],
  references: [
    {
      authors: "Pisters R, et al.",
      year: 2010,
      title: "A novel user-friendly score (HAS-BLED) to assess one-year risk of major bleeding in AF patients",
      journal: "Chest",
      volume: "138",
      pages: "1093-1100",
      citations: 1600,
      impactFactor: 7.3,
      badge: "highly-cited",
    },
  ],
};

// RESPIRATORY
export const CURB65: Calculator = {
  id: "curb65",
  name: "CURB-65 Score",
  shortName: "CURB-65",
  category: "Respiratory",
  subcategory: "Pneumonia",
  description: "Estimates mortality of community-acquired pneumonia",
  icon: "Wind",
  color: "blue",
  frequency: "high",
  useCases: ["Pneumonia severity", "Mortality prediction", "Admission decisions"],
  inputs: [
    {
      id: "confusion",
      label: "Confusion",
      description: "New onset confusion",
      type: "boolean",
      required: true,
    },
    {
      id: "urea",
      label: "Urea >7 mmol/L",
      description: "Blood urea nitrogen elevation",
      type: "boolean",
      required: true,
    },
    {
      id: "respiratory_rate_curb",
      label: "Respiratory Rate >30",
      description: "Tachypnea",
      type: "boolean",
      required: true,
    },
    {
      id: "blood_pressure_curb",
      label: "Low Blood Pressure",
      description: "SBP <90 or DBP <60 mmHg",
      type: "boolean",
      required: true,
    },
    {
      id: "age_65_curb",
      label: "Age ≥65 Years",
      description: "Age 65 or older",
      type: "boolean",
      required: true,
    },
  ],
  references: [
    {
      authors: "Lim WS, et al.",
      year: 2003,
      title: "Defining community acquired pneumonia severity on presentation to hospital",
      journal: "Respiratory Medicine",
      volume: "97",
      pages: "1175-1185",
      citations: 1900,
      impactFactor: 3.1,
      badge: "highly-cited",
    },
  ],
};

export const PSI_PORT: Calculator = {
  id: "psi_port",
  name: "PSI/PORT Score",
  shortName: "PSI/PORT",
  category: "Respiratory",
  subcategory: "Pneumonia",
  description: "Comprehensive pneumonia severity assessment and mortality prediction",
  icon: "Wind",
  color: "blue",
  frequency: "high",
  useCases: ["CAP severity", "Mortality prediction", "Admission decisions"],
  inputs: [
    {
      id: "age_psi",
      label: "Age",
      description: "years",
      type: "number",
      required: true,
    },
    {
      id: "gender_psi",
      label: "Gender",
      description: "Male or Female",
      type: "select",
      options: [
        { label: "Male", value: 0 },
        { label: "Female", value: -10 },
      ],
      required: true,
    },
    {
      id: "nursing_home",
      label: "Nursing Home Resident",
      description: "Lives in nursing home",
      type: "boolean",
      required: true,
    },
    {
      id: "comorbidity",
      label: "Comorbidity",
      description: "Neoplastic, cardiac, hepatic, or renal disease",
      type: "boolean",
      required: true,
    },
    {
      id: "physical_exam",
      label: "Abnormal Physical Exam",
      description: "Altered mental status, pulse >125, RR >30, SBP <90",
      type: "boolean",
      required: true,
    },
  ],
  references: [
    {
      authors: "Fine MJ, et al.",
      year: 1997,
      title: "A prediction rule to identify low-risk patients with community-acquired pneumonia",
      journal: "NEJM",
      volume: "336",
      pages: "243-250",
      citations: 1700,
      impactFactor: 74.3,
      badge: "highly-cited",
    },
  ],
};

// RENAL
export const CrCl: Calculator = {
  id: "crcl",
  name: "Creatinine Clearance",
  shortName: "CrCl",
  category: "Renal",
  subcategory: "Drug Dosing",
  description: "Estimates creatinine clearance for medication dosing",
  icon: "Droplet",
  color: "blue",
  frequency: "critical",
  useCases: ["Drug dosing", "Renal function assessment", "Medication safety"],
  inputs: [
    {
      id: "age_crcl",
      label: "Age",
      description: "years",
      type: "number",
      required: true,
    },
    {
      id: "weight_crcl",
      label: "Weight",
      description: "kg",
      type: "number",
      unit: "kg",
      required: true,
    },
    {
      id: "creatinine_crcl",
      label: "Serum Creatinine",
      description: "mg/dL",
      type: "number",
      unit: "mg/dL",
      required: true,
    },
    {
      id: "gender_crcl",
      label: "Gender",
      description: "Male or Female",
      type: "select",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
      required: true,
    },
  ],
  references: [
    {
      authors: "Cockcroft DW, Gault MH",
      year: 1976,
      title: "Prediction of creatinine clearance from serum creatinine",
      journal: "Nephron",
      volume: "16",
      pages: "31-41",
      citations: 3800,
      impactFactor: 1.8,
      badge: "highly-cited",
    },
  ],
};

export const CKD_EPI: Calculator = {
  id: "ckd_epi",
  name: "CKD-EPI GFR",
  shortName: "CKD-EPI",
  category: "Renal",
  subcategory: "Renal Function",
  description: "Estimates glomerular filtration rate and CKD stage",
  icon: "Droplet",
  color: "blue",
  frequency: "critical",
  useCases: ["GFR estimation", "CKD staging", "Drug dosing"],
  inputs: [
    {
      id: "creatinine_ckd",
      label: "Serum Creatinine",
      description: "mg/dL",
      type: "number",
      unit: "mg/dL",
      required: true,
    },
    {
      id: "age_ckd",
      label: "Age",
      description: "years",
      type: "number",
      required: true,
    },
    {
      id: "gender_ckd",
      label: "Gender",
      description: "Male or Female",
      type: "select",
      options: [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
      ],
      required: true,
    },
    {
      id: "race_ckd",
      label: "Race",
      description: "African American or Other",
      type: "select",
      options: [
        { label: "African American", value: "aa" },
        { label: "Other", value: "other" },
      ],
      required: true,
    },
  ],
  references: [
    {
      authors: "Levey AS, et al.",
      year: 2009,
      title: "A new equation to estimate glomerular filtration rate",
      journal: "Annals of Internal Medicine",
      volume: "150",
      pages: "604-612",
      citations: 2900,
      impactFactor: 19.3,
      badge: "highly-cited",
    },
  ],
};

// HEPATIC
export const MELD: Calculator = {
  id: "meld",
  name: "MELD Score",
  shortName: "MELD",
  category: "Hepatology",
  subcategory: "Liver Disease",
  description: "Predicts 3-month mortality in chronic liver disease",
  icon: "Droplet",
  color: "orange",
  frequency: "high",
  useCases: ["Liver disease severity", "Prognostication", "Transplant priority"],
  inputs: [
    {
      id: "inr",
      label: "INR",
      description: "International Normalized Ratio",
      type: "number",
      required: true,
    },
    {
      id: "bilirubin_meld",
      label: "Bilirubin",
      description: "mg/dL",
      type: "number",
      unit: "mg/dL",
      required: true,
    },
    {
      id: "creatinine_meld",
      label: "Creatinine",
      description: "mg/dL",
      type: "number",
      unit: "mg/dL",
      required: true,
    },
  ],
  references: [
    {
      authors: "Kamath PS, et al.",
      year: 2001,
      title: "A model to predict survival in patients with end-stage liver disease",
      journal: "Hepatology",
      volume: "33",
      pages: "464-470",
      citations: 2400,
      impactFactor: 9.5,
      badge: "highly-cited",
    },
  ],
};

// GI
export const Glasgow_Blatchford: Calculator = {
  id: "glasgow_blatchford",
  name: "Glasgow-Blatchford Score",
  shortName: "Glasgow-Blatchford",
  category: "Gastroenterology",
  subcategory: "GI Bleeding",
  description: "Predicts need for intervention in upper GI bleed",
  icon: "AlertTriangle",
  color: "red",
  frequency: "high",
  useCases: ["GI bleed risk", "Admission decisions", "Intervention prediction"],
  inputs: [
    {
      id: "blood_urea",
      label: "Blood Urea",
      description: "mmol/L",
      type: "number",
      required: true,
    },
    {
      id: "hemoglobin",
      label: "Hemoglobin",
      description: "g/dL",
      type: "number",
      required: true,
    },
    {
      id: "systolic_gb",
      label: "Systolic BP",
      description: "mmHg",
      type: "number",
      required: true,
    },
    {
      id: "pulse_gb",
      label: "Pulse",
      description: "beats/min",
      type: "number",
      required: true,
    },
    {
      id: "melena",
      label: "Melena Present",
      description: "Black tarry stools",
      type: "boolean",
      required: true,
    },
    {
      id: "syncope",
      label: "Syncope",
      description: "Loss of consciousness",
      type: "boolean",
      required: true,
    },
  ],
  references: [
    {
      authors: "Blatchford O, et al.",
      year: 2000,
      title: "A risk score to predict need for treatment for upper-gastrointestinal haemorrhage",
      journal: "Lancet",
      volume: "356",
      pages: "1318-1321",
      citations: 1500,
      impactFactor: 59.1,
      badge: "highly-cited",
    },
  ],
};

export const BISAP: Calculator = {
  id: "bisap",
  name: "BISAP Score",
  shortName: "BISAP",
  category: "Gastroenterology",
  subcategory: "Pancreatitis",
  description: "Predicts mortality risk in acute pancreatitis",
  icon: "AlertTriangle",
  color: "orange",
  frequency: "medium",
  useCases: ["Pancreatitis severity", "Mortality prediction", "ICU criteria"],
  inputs: [
    {
      id: "bun_bisap",
      label: "BUN >25 mg/dL",
      description: "Elevated blood urea nitrogen",
      type: "boolean",
      required: true,
    },
    {
      id: "mental_status",
      label: "Impaired Mental Status",
      description: "Altered consciousness",
      type: "boolean",
      required: true,
    },
    {
      id: "sirs",
      label: "SIRS Criteria",
      description: "≥2 SIRS criteria present",
      type: "boolean",
      required: true,
    },
    {
      id: "age_bisap",
      label: "Age >60 Years",
      description: "Age 60 or older",
      type: "boolean",
      required: true,
    },
    {
      id: "pleural_effusion",
      label: "Pleural Effusion",
      description: "Imaging evidence",
      type: "boolean",
      required: true,
    },
  ],
  references: [
    {
      authors: "Wu BU, et al.",
      year: 2008,
      title: "The early prediction of mortality in acute pancreatitis: a large population-based study",
      journal: "Gut",
      volume: "57",
      pages: "1698-1703",
      citations: 1100,
      impactFactor: 17.9,
      badge: "cited",
    },
  ],
};

// MEDICATION DOSING
export const medications: MedicationDose[] = [
  ...expandedMedications,
  {
    id: "vancomycin",
    name: "Vancomycin",
    category: "Antibiotic",
    indication: "MRSA, serious gram-positive infections",
    standardDose: "15-20 mg/kg IV q8-12h (target trough 15-20 mcg/mL)",
    renalAdjustment: "CrCl <30: Extend interval; monitor levels closely",
    hepaticAdjustment: "No adjustment needed",
    notes: "Obtain trough level before 4th dose. Target trough 15-20 mcg/mL for serious infections.",
    references: [
      {
        authors: "Rybak M, et al.",
        year: 2009,
        title: "Therapeutic drug monitoring of vancomycin for serious methicillin-resistant Staphylococcus aureus infections",
        journal: "Clinical Infectious Diseases",
        volume: "49",
        pages: "1073-1083",
        citations: 1200,
        impactFactor: 9.2,
      },
    ],
  },
  {
    id: "acyclovir",
    name: "Acyclovir",
    category: "Antiviral",
    indication: "HSV, VZV, CMV infections",
    standardDose: "5-10 mg/kg IV q8h (HSV); 10-15 mg/kg q8h (VZV/CMV)",
    renalAdjustment: "CrCl 50-80: 100% dose q12h; CrCl 25-50: 100% q12-24h; CrCl <25: 50% q24h",
    hepaticAdjustment: "No adjustment needed",
    notes: "Maintain adequate hydration to prevent crystalline nephropathy. Infuse over 1 hour.",
    references: [
      {
        authors: "Whitley RJ",
        year: 2006,
        title: "Acyclovir: a decade later",
        journal: "Journal of Infectious Diseases",
        volume: "194",
        pages: "S100-S103",
        citations: 800,
        impactFactor: 6.8,
      },
    ],
  },
  {
    id: "amikacin",
    name: "Amikacin",
    category: "Antibiotic",
    indication: "Gram-negative coverage, synergy for enterococcal endocarditis",
    standardDose: "15 mg/kg IV q24h (high-dose); 7.5 mg/kg q12h (traditional)",
    renalAdjustment: "CrCl 50-80: 7.5 mg/kg q12h; CrCl 25-50: 7.5 mg/kg q18-24h; CrCl <25: 7.5 mg/kg q24-48h",
    hepaticAdjustment: "No adjustment needed",
    notes: "Monitor peak (25-35 mcg/mL) and trough (<5 mcg/mL). Risk of ototoxicity and nephrotoxicity.",
    references: [
      {
        authors: "Nicolau DP",
        year: 2007,
        title: "Pharmacokinetic and pharmacodynamic properties of aminoglycosides",
        journal: "Clinical Infectious Diseases",
        volume: "45",
        pages: "S13-S22",
        citations: 900,
        impactFactor: 9.2,
      },
    ],
  },
  {
    id: "warfarin",
    name: "Warfarin",
    category: "Anticoagulant",
    indication: "VTE prophylaxis/treatment, AF, mechanical heart valves",
    standardDose: "Loading: 5-10 mg daily x 2-4 days; Maintenance: 2-10 mg daily (target INR 2-3)",
    renalAdjustment: "No adjustment needed",
    hepaticAdjustment: "Caution in liver disease; increased sensitivity",
    notes: "Check INR at baseline, 3-5 days, then weekly until stable. Many drug interactions.",
    references: [
      {
        authors: "Kearon C, et al.",
        year: 2012,
        title: "Antithrombotic therapy for VTE disease",
        journal: "Chest",
        volume: "141",
        pages: "e419S-e494S",
        citations: 2100,
        impactFactor: 7.3,
      },
    ],
  },
];

import { expansionCalculators } from "./calculators-expansion";

export const allCalculators: Calculator[] = [
  qSOFA,
  SOFA,
  APACHE,
  NEWS2,
  NIHSS,
  CHA2DS2VASc,
  GCS,
  ABCD2,
  HEART,
  TIMI,
  HAS_BLED,
  CURB65,
  PSI_PORT,
  CrCl,
  CKD_EPI,
  MELD,
  Glasgow_Blatchford,
  BISAP,
  ...expansionCalculators,
];

export const categories = [
  "Critical Care",
  "Neurology",
  "Cardiology",
  "Respiratory",
  "Renal",
  "Hepatology",
  "Gastroenterology",
];
