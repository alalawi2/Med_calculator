export interface Calculator {
  id: string;
  name: string;
  shortName: string;
  category: string;
  description: string;
  icon: string;
  color: string;
  frequency: "critical" | "high" | "medium";
  useCases: string[];
  inputs: CalculatorInput[];
  references: Reference[];
}

export interface CalculatorInput {
  id: string;
  label: string;
  description: string;
  type: "boolean" | "number" | "select";
  unit?: string;
  normal?: string;
  required: boolean;
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

export const calculators: Calculator[] = [
  {
    id: "qsofa",
    name: "Quick SOFA Score",
    shortName: "qSOFA",
    category: "Critical Care",
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
      {
        authors: "Seymour CW, et al.",
        year: 2016,
        title: "Assessment of the SOFA score's accuracy in predicting organ dysfunction/failure",
        journal: "JAMA",
        volume: "315",
        pages: "1582-1590",
        citations: 2500,
        impactFactor: 41.9,
        badge: "highly-cited",
      },
    ],
  },
  {
    id: "heart",
    name: "HEART Score",
    shortName: "HEART",
    category: "Cardiology",
    description: "Predicts 6-week risk of major adverse cardiac events in chest pain patients",
    icon: "Heart",
    color: "red",
    frequency: "high",
    useCases: ["Chest pain risk stratification", "Cardiac event prediction", "ED disposition"],
    inputs: [
      {
        id: "history",
        label: "History",
        description: "Chest pain characteristics",
        type: "select",
        required: true,
      },
      {
        id: "ecg",
        label: "ECG Changes",
        description: "Significant ST changes",
        type: "select",
        required: true,
      },
      {
        id: "age",
        label: "Age",
        description: "Patient age in years",
        type: "number",
        unit: "years",
        required: true,
      },
      {
        id: "risk_factors",
        label: "Risk Factors",
        description: "Cardiac risk factors present",
        type: "select",
        required: true,
      },
      {
        id: "troponin",
        label: "Troponin",
        description: "Elevated troponin",
        type: "select",
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
  },
  {
    id: "wells_dvt",
    name: "Wells' Criteria for DVT",
    shortName: "Wells DVT",
    category: "Vascular",
    description: "Objectifies risk of deep vein thrombosis based on clinical findings",
    icon: "Zap",
    color: "orange",
    frequency: "high",
    useCases: ["DVT risk stratification", "D-dimer ordering", "Imaging decisions"],
    inputs: [
      {
        id: "active_cancer",
        label: "Active Cancer",
        description: "Ongoing treatment or diagnosed within 6 months",
        type: "boolean",
        required: true,
      },
      {
        id: "paralysis",
        label: "Paralysis/Immobilization",
        description: "Recent surgery or immobilization",
        type: "boolean",
        required: true,
      },
      {
        id: "bed_rest",
        label: "Bed Rest >3 Days",
        description: "Recent immobilization",
        type: "boolean",
        required: true,
      },
      {
        id: "swelling",
        label: "Leg Swelling",
        description: "Calf swelling >3cm compared to other leg",
        type: "boolean",
        required: true,
      },
      {
        id: "tenderness",
        label: "Calf Tenderness",
        description: "Localized tenderness along deep veins",
        type: "boolean",
        required: true,
      },
    ],
    references: [
      {
        authors: "Wells PS, et al.",
        year: 1997,
        title: "Excluding pulmonary embolism at the bedside without diagnostic imaging",
        journal: "Clinical and Applied Thrombosis/Hemostasis",
        volume: "3",
        pages: "147-152",
        citations: 2200,
        impactFactor: 1.8,
        badge: "highly-cited",
      },
    ],
  },
  {
    id: "wells_pe",
    name: "Wells' Criteria for PE",
    shortName: "Wells PE",
    category: "Vascular",
    description: "Assesses clinical probability of pulmonary embolism",
    icon: "Zap",
    color: "orange",
    frequency: "high",
    useCases: ["PE risk stratification", "D-dimer ordering", "Imaging decisions"],
    inputs: [
      {
        id: "dvt_signs",
        label: "DVT Signs",
        description: "Clinical signs of DVT",
        type: "boolean",
        required: true,
      },
      {
        id: "pe_likely",
        label: "PE Most Likely",
        description: "PE is #1 diagnosis or equally likely",
        type: "boolean",
        required: true,
      },
      {
        id: "heart_rate",
        label: "Heart Rate >100",
        description: "Tachycardia present",
        type: "boolean",
        required: true,
      },
      {
        id: "immobilization",
        label: "Immobilization",
        description: "Bed rest >3 days or surgery in past 4 weeks",
        type: "boolean",
        required: true,
      },
      {
        id: "hemoptysis",
        label: "Hemoptysis",
        description: "Coughing up blood",
        type: "boolean",
        required: true,
      },
    ],
    references: [
      {
        authors: "Wells PS, et al.",
        year: 2000,
        title: "Derivation of a simple clinical model to categorize patients probability of pulmonary embolism",
        journal: "Thrombosis and Haemostasis",
        volume: "83",
        pages: "416-420",
        citations: 2100,
        impactFactor: 4.2,
        badge: "highly-cited",
      },
    ],
  },
  {
    id: "curb65",
    name: "CURB-65 Score",
    shortName: "CURB-65",
    category: "Respiratory",
    description: "Estimates mortality of community-acquired pneumonia for treatment decisions",
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
        id: "blood_pressure",
        label: "Low Blood Pressure",
        description: "SBP <90 or DBP <60 mmHg",
        type: "boolean",
        required: true,
      },
      {
        id: "age_65",
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
  },
];

export const categories = ["Critical Care", "Cardiology", "Vascular", "Respiratory"];
export const frequencies = ["critical", "high", "medium"];
