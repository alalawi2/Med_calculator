export interface Calculator {
 id: string;
 name: string;
 category: string;
 categories?: string[];
 subcategory?: string;
 description: string;
 inputs: any[];
 scoring?: any;
 clinicalUses: string[];
 references: any[];
}

export const allCalculators: Calculator[] = [
  {
    id: "qsofa",
    name: "qSOFA Score",
    category: "Critical Care",
    subcategory: "Sepsis",
    description: "Identifies high-risk patients for sepsis-related mortality outside the ICU",
    inputs: [
      {
        id: "altered_mentation",
        label: "Altered Mentation",
        description: "Disorientation, lethargy, or agitation",
        type: "boolean",
        value: 1,
      },
      {
        id: "respiratory_rate",
        label: "Respiratory Rate",
        description: "Breaths per minute (normal: 12-20)",
        type: "number",
        min: 0,
        max: 60,
        threshold: 22,
        value: 1,
      },
      {
        id: "systolic_bp",
        label: "Systolic Blood Pressure",
        description: "mmHg (normal: ≥100)",
        type: "number",
        min: 0,
        max: 300,
        threshold: 100,
        value: 1,
      },
    ],
    scoring: {
      type: "sum",
      thresholds: [
        { min: 0, max: 1, risk: "Low", color: "green", action: "Monitor for infection" },
        { min: 2, max: 3, risk: "High", color: "red", action: "Activate sepsis protocol" },
      ],
    },
    clinicalUses: ["Sepsis identification", "Mortality prediction", "ICU admission criteria"],
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
      },
      {
        authors: "Seymour CW, et al.",
        year: 2016,
        title: "Assessment of Clinical Criteria for Sepsis",
        journal: "JAMA",
        volume: "315",
        pages: "762-774",
        citations: 2500,
        impactFactor: 41.9,
      },
    ],
  },
  {
    id: "heart",
    name: "HEART Score",
    category: "Cardiology",
    subcategory: "Acute Coronary Syndrome",
    description: "Risk stratification for acute coronary syndrome in chest pain patients",
    inputs: [
      {
        id: "history",
        label: "History of Presenting Complaint",
        description: "Typical vs atypical vs non-cardiac",
        type: "select",
        options: ["Highly suspicious", "Moderately suspicious", "Slightly suspicious"],
        values: [3, 2, 1],
      },
      {
        id: "ecg",
        label: "ECG Changes",
        description: "Significant ST deviation",
        type: "select",
        options: ["Yes", "No"],
        values: [2, 0],
      },
      {
        id: "heart_age",
        label: "Age",
        description: "Years",
        type: "number",
        min: 0,
        max: 120,
      },
      {
        id: "risk_factors",
        label: "Risk Factors",
        description: "≥3 risk factors or history of CAD",
        type: "boolean",
      },
      {
        id: "troponin",
        label: "Troponin",
        description: "Elevated",
        type: "boolean",
      },
    ],
    scoring: {
      type: "custom",
    },
    clinicalUses: ["ACS risk assessment", "Admission decisions", "Discharge safety"],
    references: [
      {
        authors: "Six AJ, et al.",
        year: 2008,
        title: "Chest pain in the emergency room",
        journal: "Current Opinion in Critical Care",
        volume: "14",
        pages: "1-6",
        citations: 1500,
        impactFactor: 4.2,
      },
    ],
  },
  {
    id: "wells_dvt",
    name: "Wells' DVT Score",
    category: "Vascular",
    subcategory: "Venous Thromboembolism",
    description: "Pretest probability of deep vein thrombosis",
    inputs: [
      {
        id: "active_cancer",
        label: "Active Cancer",
        description: "Treatment ongoing or within 6 months",
        type: "boolean",
        value: 1,
      },
      {
        id: "paralysis",
        label: "Paralysis/Immobilization",
        description: "Recent immobilization of lower extremity",
        type: "boolean",
        value: 1,
      },
      {
        id: "bed_rest",
        label: "Recent Bed Rest",
        description: ">3 days or major surgery within 12 weeks",
        type: "boolean",
        value: 1,
      },
      {
        id: "tenderness",
        label: "Localized Tenderness",
        description: "Along deep venous system",
        type: "boolean",
        value: 1,
      },
      {
        id: "swelling",
        label: "Entire Leg Swelling",
        description: "Calf swelling >3cm compared to other leg",
        type: "boolean",
        value: 1,
      },
      {
        id: "pitting_edema",
        label: "Pitting Edema",
        description: "Greater in symptomatic leg",
        type: "boolean",
        value: 1,
      },
      {
        id: "collateral_veins",
        label: "Collateral Superficial Veins",
        description: "Non-varicose",
        type: "boolean",
        value: 1,
      },
      {
        id: "alternative_diagnosis",
        label: "Alternative Diagnosis as Likely",
        description: "Cellulitis, muscle strain, etc.",
        type: "boolean",
        value: -2,
      },
    ],
    scoring: {
      type: "sum",
      thresholds: [
        { min: -2, max: 0, risk: "Low", color: "green", action: "D-dimer or ultrasound" },
        { min: 1, max: 2, risk: "Moderate", color: "yellow", action: "Ultrasound recommended" },
        { min: 3, max: 10, risk: "High", color: "red", action: "Immediate ultrasound" },
      ],
    },
    clinicalUses: ["DVT risk assessment", "Imaging decisions", "Anticoagulation decisions"],
    references: [
      {
        authors: "Wells PS, et al.",
        year: 2003,
        title: "Evaluation of D-dimer in the diagnosis of suspected deep-vein thrombosis",
        journal: "New England Journal of Medicine",
        volume: "349",
        pages: "1227-1235",
        citations: 2000,
        impactFactor: 74.6,
      },
    ],
  },
  {
    id: "wells_pe",
    name: "Wells' PE Score",
    category: "Respiratory",
    subcategory: "Pulmonary Embolism",
    description: "Pretest probability of pulmonary embolism",
    inputs: [
      {
        id: "clinical_signs_dvt",
        label: "Clinical Signs of DVT",
        description: "Leg swelling and pain on palpation",
        type: "boolean",
        value: 3,
      },
      {
        id: "pe_most_likely",
        label: "PE Most Likely Diagnosis",
        description: "Alternative diagnosis less likely",
        type: "boolean",
        value: 3,
      },
      {
        id: "heart_rate",
        label: "Heart Rate >100",
        description: "Beats per minute",
        type: "boolean",
        value: 1.5,
      },
      {
        id: "immobilization",
        label: "Immobilization",
        description: ">3 days or surgery in last 4 weeks",
        type: "boolean",
        value: 1.5,
      },
      {
        id: "hemoptysis",
        label: "Hemoptysis",
        description: "Coughing up blood",
        type: "boolean",
        value: 1,
      },
      {
        id: "clinical_signs_dvt_alt",
        label: "Clinical Signs of DVT (Alternative)",
        description: "Leg swelling and pain",
        type: "boolean",
        value: 1,
      },
      {
        id: "syncope",
        label: "Syncope",
        description: "Loss of consciousness",
        type: "boolean",
        value: 1.5,
      },
    ],
    scoring: {
      type: "sum",
      thresholds: [
        { min: 0, max: 1, risk: "Low", color: "green", action: "D-dimer or discharge" },
        { min: 2, max: 6, risk: "Intermediate", color: "yellow", action: "CT angiography" },
        { min: 7, max: 20, risk: "High", color: "red", action: "Immediate CT angiography" },
      ],
    },
    clinicalUses: ["PE risk assessment", "Imaging decisions", "Anticoagulation decisions"],
    references: [
      {
        authors: "Wells PS, et al.",
        year: 2000,
        title: "Derivation of a simple clinical model to categorize patients probability of pulmonary embolism",
        journal: "Thrombosis and Haemostasis",
        volume: "83",
        pages: "416-420",
        citations: 1800,
        impactFactor: 5.8,
      },
    ],
  },
  {
    id: "curb65",
    name: "CURB-65",
    category: "Respiratory",
    subcategory: "Pneumonia",
    description: "Severity assessment for community-acquired pneumonia",
    inputs: [
      {
        id: "confusion",
        label: "Confusion",
        description: "New onset disorientation",
        type: "boolean",
        value: 1,
      },
      {
        id: "urea",
        label: "Urea >7 mmol/L",
        description: "Blood urea nitrogen",
        type: "boolean",
        value: 1,
      },
      {
        id: "respiratory_rate",
        label: "Respiratory Rate ≥30",
        description: "Breaths per minute",
        type: "boolean",
        value: 1,
      },
      {
        id: "blood_pressure",
        label: "Blood Pressure",
        description: "SBP <90 or DBP ≤60",
        type: "boolean",
        value: 1,
      },
      {
        id: "heart_age",
        label: "Age ≥65",
        description: "Years",
        type: "boolean",
        value: 1,
      },
    ],
    scoring: {
      type: "sum",
      thresholds: [
        { min: 0, max: 1, risk: "Low", color: "green", action: "Outpatient treatment" },
        { min: 2, max: 3, risk: "Moderate", color: "yellow", action: "Hospital admission" },
        { min: 4, max: 5, risk: "High", color: "red", action: "ICU admission" },
      ],
    },
    clinicalUses: ["CAP severity", "Admission decisions", "Mortality prediction"],
    references: [
      {
        authors: "Lim WS, et al.",
        year: 2003,
        title: "Defining community acquired pneumonia severity on presentation to hospital",
        journal: "Respiratory Medicine",
        volume: "97",
        pages: "1175-1185",
        citations: 1200,
        impactFactor: 3.5,
      },
    ],
  },
];

export const calculators = allCalculators;
