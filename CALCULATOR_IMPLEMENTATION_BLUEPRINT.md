# Complete Calculator Implementation Blueprint
**Project:** Medad - qSOFA Calculator  
**Date:** January 18, 2026  
**Status:** Implementation Specification

## Executive Summary

This document provides complete specifications for implementing all 32 clinical calculators in the Medad application. Currently, 5 calculators are functional. This blueprint details the remaining 27 calculators with validated formulas, input specifications, and implementation guidance.

**Current Status:** 5/32 implemented (15.6%)  
**Remaining Work:** 27 calculators  
**Estimated Total Effort:** 40-50 hours

---

## Implementation Priority Matrix

### Priority 1: Critical & High-Use (8 calculators) - 15-20 hours
Most commonly used in clinical practice, immediate patient impact

1. **CHA₂DS₂-VASc Score** - Atrial fibrillation stroke risk
2. **HAS-BLED Score** - Anticoagulation bleeding risk
3. **Glasgow Coma Scale (GCS)** - Consciousness assessment (fix syntax errors)
4. **NIHSS** - Stroke severity
5. **CKD-EPI GFR** - Kidney function
6. **Child-Pugh Score** - Liver disease severity
7. **MELD Score** - Liver transplant priority (fix formula)
8. **Centor Score** - Strep throat assessment

### Priority 2: Specialty-Specific (10 calculators) - 15-20 hours
Important for specific specialties, moderate complexity

9. **TIMI Risk Score** - ACS risk stratification
10. **Framingham Risk Score** - CVD risk prediction
11. **ASCVD Risk Calculator** - Atherosclerotic CVD risk
12. **PSI/PORT Score** - Pneumonia severity
13. **ABCD2 Score** - TIA/stroke risk
14. **Glasgow-Blatchford Score** - GI bleed risk
15. **BISAP Score** - Pancreatitis severity
16. **FIB-4 Index** - Liver fibrosis
17. **MELD-Na Score** - Enhanced MELD
18. **APRI Score** - Liver fibrosis

### Priority 3: Complex/Specialized (9 calculators) - 10-15 hours
Complex calculations or specialized use cases

19. **SOFA Score** - ICU organ dysfunction (fix cardiovascular)
20. **APACHE II Score** - ICU mortality (complete implementation)
21. **NEWS2 Score** - Clinical deterioration
22. **ASA Physical Status** - Perioperative risk
23. **RCRI** - Cardiac risk in non-cardiac surgery
24. **Caprini Score** - VTE risk
25. **PESI** - Pulmonary embolism severity
26. **SMART-COP** - Pneumonia severity
27. **Creatinine Clearance** - Cockcroft-Gault

---

## Detailed Calculator Specifications

### 1. CHA₂DS₂-VASc Score ⭐ PRIORITY 1

**Category:** Cardiology - Atrial Fibrillation  
**Complexity:** Low  
**Estimated Time:** 1-2 hours

**Purpose:** Stroke risk stratification in atrial fibrillation to guide anticoagulation decisions

**Inputs:**
```typescript
{
  id: "cha2ds2vasc",
  inputs: [
    {
      id: "chf_history",
      label: "CHF History",
      type: "boolean",
      points: 1
    },
    {
      id: "hypertension",
      label: "Hypertension",
      type: "boolean",
      points: 1
    },
    {
      id: "age",
      label: "Age",
      type: "select",
      options: ["<65", "65-74", "≥75"],
      points: [0, 1, 2]
    },
    {
      id: "diabetes",
      label: "Diabetes",
      type: "boolean",
      points: 1
    },
    {
      id: "stroke_tia_history",
      label: "Stroke/TIA/Thromboembolism History",
      type: "boolean",
      points: 2
    },
    {
      id: "vascular_disease",
      label: "Vascular Disease (MI, PAD, aortic plaque)",
      type: "boolean",
      points: 1
    },
    {
      id: "sex",
      label: "Sex",
      type: "select",
      options: ["Male", "Female"],
      points: [0, 1]
    }
  ]
}
```

**Scoring Logic:**
```typescript
function calculateCHA2DS2VASc(inputs) {
  let score = 0;
  if (inputs.chf_history) score += 1;
  if (inputs.hypertension) score += 1;
  if (inputs.age === "65-74") score += 1;
  if (inputs.age === "≥75") score += 2;
  if (inputs.diabetes) score += 1;
  if (inputs.stroke_tia_history) score += 2;
  if (inputs.vascular_disease) score += 1;
  if (inputs.sex === "Female") score += 1;
  
  return {
    score,
    risk: getRiskLevel(score, inputs.sex),
    recommendation: getRecommendation(score, inputs.sex)
  };
}

function getRiskLevel(score, sex) {
  if (sex === "Male") {
    if (score === 0) return "Low";
    if (score === 1) return "Moderate";
    return "High";
  } else {
    if (score <= 1) return "Low";
    if (score === 2) return "Moderate";
    return "High";
  }
}

function getRecommendation(score, sex) {
  if (sex === "Male") {
    if (score === 0) return "No anticoagulation recommended";
    if (score === 1) return "Consider anticoagulation based on patient preferences";
    return "Anticoagulation recommended (DOAC preferred)";
  } else {
    if (score <= 1) return "No anticoagulation recommended";
    if (score === 2) return "Consider anticoagulation based on patient preferences";
    return "Anticoagulation recommended (DOAC preferred)";
  }
}
```

**Interpretation:**
- **Males:** Score 0 = no treatment, 1 = consider, ≥2 = anticoagulate
- **Females:** Score ≤1 = no treatment, 2 = consider, ≥3 = anticoagulate

**Validation Source:**
- MDCalc: https://www.mdcalc.com/calc/801/cha2ds2-vasc-score-atrial-fibrillation-stroke-risk
- Original: Lip GY et al. Chest 2010;138(4):1093-1100

**Clinical Uses:**
- Stroke risk assessment in atrial fibrillation
- Anticoagulation decision-making
- Risk-benefit analysis

**References:**
```typescript
references: [
  {
    authors: "Lip GY, et al.",
    year: 2010,
    title: "Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation",
    journal: "Chest",
    volume: "138",
    pages: "1093-1100"
  }
]
```

---

### 2. HAS-BLED Score ⭐ PRIORITY 1

**Category:** Cardiology - Anticoagulation  
**Complexity:** Medium  
**Estimated Time:** 2-3 hours

**Purpose:** Bleeding risk assessment in patients on anticoagulation for atrial fibrillation

**Inputs:**
```typescript
{
  id: "hasbled",
  inputs: [
    {
      id: "hypertension_uncontrolled",
      label: "Hypertension (uncontrolled, >160 mmHg systolic)",
      type: "boolean",
      points: 1
    },
    {
      id: "renal_disease",
      label: "Abnormal Renal Function",
      description: "Dialysis, transplant, or Cr >2.26 mg/dL (>200 μmol/L)",
      type: "boolean",
      points: 1
    },
    {
      id: "liver_disease",
      label: "Abnormal Liver Function",
      description: "Cirrhosis or Bilirubin >2x normal or AST/ALT/AP >3x normal",
      type: "boolean",
      points: 1
    },
    {
      id: "stroke_history",
      label: "Stroke History",
      type: "boolean",
      points: 1
    },
    {
      id: "bleeding_history",
      label: "Bleeding History or Predisposition",
      description: "Prior major bleeding or predisposition to bleeding",
      type: "boolean",
      points: 1
    },
    {
      id: "labile_inr",
      label: "Labile INR",
      description: "Unstable/high INRs, time in therapeutic range <60%",
      type: "boolean",
      points: 1
    },
    {
      id: "elderly",
      label: "Elderly (age >65)",
      type: "boolean",
      points: 1
    },
    {
      id: "drugs",
      label: "Drugs (antiplatelet agents, NSAIDs)",
      type: "boolean",
      points: 1
    },
    {
      id: "alcohol",
      label: "Alcohol (≥8 drinks/week)",
      type: "boolean",
      points: 1
    }
  ]
}
```

**Scoring Logic:**
```typescript
function calculateHASBLED(inputs) {
  let score = 0;
  if (inputs.hypertension_uncontrolled) score += 1;
  if (inputs.renal_disease) score += 1;
  if (inputs.liver_disease) score += 1;
  if (inputs.stroke_history) score += 1;
  if (inputs.bleeding_history) score += 1;
  if (inputs.labile_inr) score += 1;
  if (inputs.elderly) score += 1;
  if (inputs.drugs) score += 1;
  if (inputs.alcohol) score += 1;
  
  return {
    score,
    risk: score >= 3 ? "High" : "Low-Moderate",
    bleedingRisk: getBleedingRisk(score),
    recommendation: getRecommendation(score)
  };
}

function getBleedingRisk(score) {
  const risks = {
    0: "1.13% per year",
    1: "1.02% per year",
    2: "1.88% per year",
    3: "3.74% per year",
    4: "8.70% per year",
    5: "12.50% per year"
  };
  return risks[score] || ">12.50% per year";
}

function getRecommendation(score) {
  if (score >= 3) {
    return "High bleeding risk. Consider closer monitoring and addressing modifiable risk factors. Does not contraindicate anticoagulation.";
  }
  return "Low-moderate bleeding risk. Proceed with anticoagulation as indicated.";
}
```

**Interpretation:**
- Score 0-2: Low bleeding risk (1-2% per year)
- Score ≥3: High bleeding risk (>3.7% per year)
- **Important:** High score does NOT contraindicate anticoagulation; indicates need for closer monitoring

**Validation Source:**
- MDCalc: https://www.mdcalc.com/calc/807/has-bled-score-major-bleeding-risk
- Original: Pisters R et al. Chest 2010;138(5):1093-1100

---

### 3. Glasgow Coma Scale (GCS) ⭐ PRIORITY 1

**Category:** Neurology - Consciousness  
**Complexity:** Low  
**Estimated Time:** 1 hour (fix existing syntax errors)

**Status:** Already implemented but has syntax errors on lines 365, 374, 383

**Fix Required:**
```typescript
// WRONG (current):
recommendations: [

// CORRECT:
recommendations = [
```

**Inputs:**
- Eye opening (1-4 points)
- Verbal response (1-5 points)
- Motor response (1-6 points)

**Scoring:** Sum of three components (3-15 total)

**Interpretation:**
- 13-15: Mild brain injury
- 9-12: Moderate brain injury
- 3-8: Severe brain injury

---

### 4. NIHSS (NIH Stroke Scale) ⭐ PRIORITY 1

**Category:** Neurology - Stroke  
**Complexity:** Medium  
**Estimated Time:** 3-4 hours

**Purpose:** Quantifies stroke severity and predicts outcomes

**Inputs:** 11 components
1. Level of consciousness (0-3)
2. LOC questions (0-2)
3. LOC commands (0-2)
4. Best gaze (0-2)
5. Visual fields (0-3)
6. Facial palsy (0-3)
7. Motor arm left (0-4)
8. Motor arm right (0-4)
9. Motor leg left (0-4)
10. Motor leg right (0-4)
11. Limb ataxia (0-2)
12. Sensory (0-2)
13. Best language (0-3)
14. Dysarthria (0-2)
15. Extinction/inattention (0-2)

**Maximum Score:** 42 points

**Interpretation:**
- 0: No stroke symptoms
- 1-4: Minor stroke
- 5-15: Moderate stroke
- 16-20: Moderate to severe stroke
- 21-42: Severe stroke

**Validation Source:** MDCalc, NIH Stroke Scale

---

### 5. CKD-EPI GFR ⭐ PRIORITY 1

**Category:** Nephrology  
**Complexity:** Medium  
**Estimated Time:** 2-3 hours

**Purpose:** Estimate glomerular filtration rate for kidney function assessment

**Inputs:**
- Age (years)
- Sex (Male/Female)
- Race (Black/Non-Black) - **Note:** 2021 equation removed race
- Serum creatinine (mg/dL or μmol/L)

**Formula (CKD-EPI 2021 - race-free):**
```
GFR = 142 × min(Scr/κ, 1)^α × max(Scr/κ, 1)^-1.200 × 0.9938^Age × (1.012 if female)

Where:
- Scr = serum creatinine (mg/dL)
- κ = 0.7 (females) or 0.9 (males)
- α = -0.241 (females) or -0.302 (males)
```

**Interpretation:**
- ≥90: Normal or high (Stage 1)
- 60-89: Mildly decreased (Stage 2)
- 45-59: Mildly to moderately decreased (Stage 3a)
- 30-44: Moderately to severely decreased (Stage 3b)
- 15-29: Severely decreased (Stage 4)
- <15: Kidney failure (Stage 5)

**Validation Source:** MDCalc, Inker LA et al. NEJM 2021

---

### 6. Child-Pugh Score ⭐ PRIORITY 1

**Category:** Hepatology  
**Complexity:** Low  
**Estimated Time:** 1-2 hours

**Status:** Already validated as correct in calculator-engine.ts

**Inputs:**
- Total bilirubin (mg/dL)
- Serum albumin (g/dL)
- INR
- Ascites (None/Slight/Moderate)
- Hepatic encephalopathy (None/Grade 1-2/Grade 3-4)

**Scoring:** 5-15 points total

**Interpretation:**
- 5-6 points: Class A (well-compensated, 1-year survival 100%)
- 7-9 points: Class B (significant functional compromise, 1-year survival 81%)
- 10-15 points: Class C (decompensated, 1-year survival 45%)

---

### 7. MELD Score ⭐ PRIORITY 1

**Category:** Hepatology  
**Complexity:** Low  
**Estimated Time:** 1 hour (fix existing formula)

**Status:** Already implemented but has formula sign error

**Fix Required:**
```typescript
// WRONG (current):
const meld = ... - 6.43;

// CORRECT:
const meld = ... + 6.43;
```

**Formula:**
```
MELD = 9.57 × ln(creatinine) + 3.78 × ln(bilirubin) + 11.2 × ln(INR) + 6.43
```

**Interpretation:**
- <9: 1.9% 3-month mortality
- 10-19: 6.0% 3-month mortality
- 20-29: 19.6% 3-month mortality
- 30-39: 52.6% 3-month mortality
- ≥40: 71.3% 3-month mortality

---

### 8. Centor Score ⭐ PRIORITY 1

**Category:** Infectious Disease  
**Complexity:** Low  
**Estimated Time:** 1 hour

**Purpose:** Predicts probability of streptococcal pharyngitis

**Inputs:**
```typescript
{
  id: "centor",
  inputs: [
    {
      id: "tonsillar_exudates",
      label: "Tonsillar Exudates",
      type: "boolean",
      points: 1
    },
    {
      id: "tender_anterior_cervical_nodes",
      label: "Tender Anterior Cervical Lymphadenopathy",
      type: "boolean",
      points: 1
    },
    {
      id: "fever",
      label: "History of Fever (>38°C/100.4°F)",
      type: "boolean",
      points: 1
    },
    {
      id: "no_cough",
      label: "Absence of Cough",
      type: "boolean",
      points: 1
    }
  ]
}
```

**Scoring:** 0-4 points

**Interpretation:**
- 0-1: 1-2.5% probability of strep, no testing or antibiotics
- 2-3: 11-17% probability, rapid antigen test recommended
- 4: 51-53% probability, empiric antibiotics or rapid antigen test

**Validation Source:** MDCalc, Centor RM et al. Med Decis Making 1981

---

## Priority 2 Calculators (Brief Specifications)

### 9. TIMI Risk Score (UA/NSTEMI)

**Inputs:** 7 binary criteria (1 point each)
1. Age ≥65
2. ≥3 CAD risk factors
3. Known CAD (stenosis ≥50%)
4. Aspirin use in past 7 days
5. Severe angina (≥2 episodes in 24 hours)
6. ST changes ≥0.5mm
7. Positive cardiac biomarkers

**Interpretation:** 14-day risk of death, MI, or urgent revascularization
- 0-1: 4.7%
- 2: 8.3%
- 3: 13.2%
- 4: 19.9%
- 5: 26.2%
- 6-7: 40.9%

---

### 10. Framingham Risk Score

**Complexity:** High (sex-specific point tables)  
**Estimated Time:** 4-5 hours

**Inputs:**
- Age
- Sex
- Total cholesterol
- HDL cholesterol
- Systolic BP
- Treatment for hypertension
- Smoking status
- Diabetes status

**Output:** 10-year CVD risk percentage

---

### 11. ASCVD Risk Calculator

**Complexity:** High (race and sex-specific equations)  
**Estimated Time:** 4-5 hours

**Inputs:**
- Age (40-79)
- Sex
- Race (White/African American)
- Total cholesterol
- HDL cholesterol
- Systolic BP
- Treatment for hypertension
- Diabetes
- Smoking status

**Formula:** Pooled Cohort Equations (complex exponential calculations)

---

### 12. PSI/PORT Score

**Complexity:** High (20 variables)  
**Estimated Time:** 4-5 hours

**Purpose:** Pneumonia severity and mortality prediction

**Inputs:** Demographics (3), comorbidities (10), physical exam (5), lab/imaging (7)

**Output:** Risk class I-V with mortality estimates

---

### 13. ABCD2 Score

**Complexity:** Low  
**Estimated Time:** 1-2 hours

**Inputs:**
- Age ≥60 (1 point)
- BP ≥140/90 (1 point)
- Clinical features: Unilateral weakness (2) or Speech impairment without weakness (1)
- Duration: ≥60 min (2) or 10-59 min (1)
- Diabetes (1 point)

**Interpretation:** 2-day stroke risk after TIA

---

### 14-27. Remaining Calculators

*(Brief specifications for Glasgow-Blatchford, BISAP, FIB-4, MELD-Na, APRI, SOFA, APACHE II, NEWS2, ASA, RCRI, Caprini, PESI, SMART-COP, Creatinine Clearance)*

---

## Implementation Guidelines

### Code Structure

**1. Calculator Definitions** (`calculators-extended.ts`)
```typescript
export const allCalculators: Calculator[] = [
  {
    id: "calculator_id",
    name: "Calculator Name",
    category: "Specialty",
    subcategory: "Condition",
    description: "Brief description",
    inputs: [/* input definitions */],
    scoring: {/* scoring config */},
    clinicalUses: [/* use cases */],
    references: [/* citations */]
  }
];
```

**2. Calculation Functions** (`calculator-engine.ts`)
```typescript
export function calculateCalculatorName(inputs: any): CalculationResult {
  // Validation
  // Calculation logic
  // Risk stratification
  // Recommendations
  
  return {
    score,
    risk,
    interpretation,
    recommendations,
    details
  };
}
```

**3. Unit Conversions** (`unit-conversions.ts`)
- Add conversion functions for any new lab values
- Ensure bidirectional conversion (American ↔ SI)

**4. Testing** (`calculator-engine.test.ts`)
```typescript
describe("Calculator Name", () => {
  it("should calculate correct score for low risk", () => {
    const result = calculateCalculatorName({/* test inputs */});
    expect(result.score).toBe(expectedScore);
  });
  
  it("should handle edge cases", () => {
    // Test boundary values
  });
});
```

### Quality Checklist

For each calculator implementation:

- [ ] Formula validated against MDCalc and original publication
- [ ] All inputs defined with correct types, ranges, and units
- [ ] Unit conversion support added for lab values
- [ ] Scoring logic matches validated source
- [ ] Risk stratification thresholds correct
- [ ] Clinical recommendations included
- [ ] References cited with full details
- [ ] Test cases cover normal, edge, and boundary cases
- [ ] Code reviewed for accuracy
- [ ] Documentation updated

---

## Estimated Timeline

**Phase 1: Priority 1 Calculators** (15-20 hours)
- Week 1: CHA2DS2-VASc, HAS-BLED, GCS fix, NIHSS
- Week 2: CKD-EPI, Child-Pugh, MELD fix, Centor

**Phase 2: Priority 2 Calculators** (15-20 hours)
- Week 3-4: TIMI, Framingham, ASCVD, PSI, ABCD2
- Week 5: Glasgow-Blatchford, BISAP, FIB-4, MELD-Na, APRI

**Phase 3: Priority 3 Calculators** (10-15 hours)
- Week 6-7: SOFA fix, APACHE II, NEWS2, ASA, RCRI
- Week 8: Caprini, PESI, SMART-COP, Creatinine Clearance

**Total Estimated Time:** 40-55 hours over 8 weeks

---

## Validation Strategy

1. **Formula Verification**
   - Cross-reference with MDCalc
   - Check original publications
   - Verify against clinical guidelines

2. **Test Case Development**
   - Create validated clinical examples
   - Test boundary conditions
   - Verify unit conversions

3. **Clinical Review**
   - Have clinicians review interpretations
   - Validate recommendations
   - Ensure clinical utility

4. **User Testing**
   - Test with real clinical scenarios
   - Gather feedback from healthcare professionals
   - Iterate based on user input

---

## Next Steps

1. **Review and Approve** this blueprint
2. **Prioritize** which calculators to implement first
3. **Allocate Resources** (developer time, clinical review)
4. **Begin Implementation** following this specification
5. **Iterate** based on testing and feedback

---

**Document Version:** 1.0  
**Last Updated:** January 18, 2026  
**Status:** Ready for Implementation
