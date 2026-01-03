/**
 * Multi-Category Classification System for Calculators
 * Allows calculators to belong to multiple relevant categories
 */

export interface CalculatorMultiCategory {
  id: string;
  name: string;
  shortName: string;
  categories: string[]; // Changed from single category to array
  subcategory: string;
  description: string;
  icon: string;
  color: string;
  frequency: "critical" | "high" | "medium";
  useCases: string[];
  relevantFor: string[]; // Additional specialties that use this calculator
  inputs: any[];
  references: any[];
  scoringLogic?: string;
  interpretation?: Record<string, string>;
}

/**
 * Multi-Category Mapping
 * Shows which calculators belong to multiple categories
 */
export const multiCategoryMapping = {
  // Bleeding Risk - Relevant for Cardiology, Neurology, GI
  "hasbled": ["Cardiology", "Neurology", "Gastroenterology"],
  
  // Stroke Risk - Relevant for Cardiology, Neurology
  "cha2ds2vasc": ["Cardiology", "Neurology"],
  "abcd2": ["Neurology", "Cardiology"],
  
  // Renal Function - Relevant for all specialties (drug dosing)
  "ckd_epi": ["Renal", "Cardiology", "Respiratory", "Critical Care", "Gastroenterology"],
  "creatinine_clearance": ["Renal", "Cardiology", "Respiratory", "Critical Care"],
  
  // Coagulation - Relevant for Cardiology, Neurology, GI
  "timi": ["Cardiology", "Neurology"],
  
  // Sepsis/Infection - Relevant for Critical Care, Respiratory, GI
  "qsofa": ["Critical Care", "Respiratory", "Gastroenterology", "Infectious Disease"],
  "sofa": ["Critical Care", "Respiratory"],
  "news2": ["Critical Care", "Respiratory"],
  
  // GI Bleed - Relevant for GI, Cardiology (anticoagulation), Critical Care
  "glasgow_blatchford": ["Gastroenterology", "Cardiology", "Critical Care"],
  "bisap": ["Gastroenterology", "Critical Care"],
  
  // Pneumonia - Relevant for Respiratory, Critical Care
  "curb65": ["Respiratory", "Critical Care"],
  "psi": ["Respiratory", "Critical Care"],
  

  
  // Liver Disease - Relevant for Hepatology, Critical Care, GI
  "meld": ["Hepatology", "Critical Care", "Gastroenterology"],
  
  // Frailty - Relevant for Geriatric, Critical Care, Neurology
  "frailty": ["Geriatric", "Critical Care", "Neurology"],
  
  // Infection/Strep - Relevant for Infectious Disease, Primary Care
  "centor": ["Infectious Disease", "Respiratory"],
};

/**
 * Category Hierarchy
 * Organizes categories by specialty
 */
export const categoryHierarchy = {
  "Critical Care": {
    icon: "AlertTriangle",
    color: "red",
    description: "Emergency and ICU decision support",
    calculators: ["qsofa", "sofa", "apache", "news2", "glasgow_blatchford", "bisap", "meld"]
  },
  "Cardiology": {
    icon: "Heart",
    color: "red",
    description: "Cardiovascular risk and management",
    calculators: ["cha2ds2vasc", "heart", "timi", "framingham", "ascvd", "hasbled"]
  },
  "Neurology": {
    icon: "Brain",
    color: "purple",
    description: "Neurological assessment and stroke",
    calculators: ["nihss", "gcs", "abcd2", "cha2ds2vasc", "hasbled", "frailty"]
  },
  "Respiratory": {
    icon: "Wind",
    color: "blue",
    description: "Pulmonary and respiratory conditions",
    calculators: ["curb65", "psi", "gold_copd", "qsofa", "news2"]
  },
  "Renal": {
    icon: "Droplet",
    color: "blue",
    description: "Kidney function and drug dosing",
    calculators: ["ckd_epi", "creatinine_clearance", "meld"]
  },
  "Hepatology": {
    icon: "Liver",
    color: "orange",
    description: "Liver disease assessment",
    calculators: ["meld", "glasgow_blatchford", "bisap"]
  },
  "Gastroenterology": {
    icon: "Stomach",
    color: "orange",
    description: "GI bleeding and pancreatic disease",
    calculators: ["glasgow_blatchford", "bisap", "qsofa", "meld"]
  },
  "Infectious Disease": {
    icon: "Virus",
    color: "red",
    description: "Infection and sepsis management",
    calculators: ["qsofa", "centor", "sofa", "news2"]
  },
  "Geriatric": {
    icon: "Users",
    color: "gray",
    description: "Elderly patient assessment",
    calculators: ["frailty", "gcs", "nihss", "abcd2"]
  }
};
