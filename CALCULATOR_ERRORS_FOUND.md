# Critical Calculator Errors Found

## Date: January 18, 2026
## Auditor: Manus AI System
## Status: URGENT - Patient Safety Issue

---

## ERROR #1: qSOFA Score - Incorrect Blood Pressure Threshold

**Location:** `client/src/lib/calculator-engine.ts` Line 34

**Current Code:**
```typescript
if (inputs.systolic_bp < 100) score += 1;
```

**Should Be:**
```typescript
if (inputs.systolic_bp <= 100) score += 1;
```

**Source:** MDCalc (https://www.mdcalc.com/calc/2654/qsofa-quick-sofa-score-sepsis)
**Reference:** Singer M, et al. JAMA. 2016;315(8):801-810 (Sepsis-3 Criteria)

**Impact:** 
- Patients with BP exactly 100 mmHg incorrectly score 0 points instead of 1 point
- Could miss high-risk sepsis patients (qSOFA ≥2 indicates 10-fold mortality increase)
- **CRITICAL PATIENT SAFETY ISSUE**

**Validated Criteria:**
- Systolic BP ≤100 mmHg (NOT <100)
- Respiratory rate ≥22/min ✓ CORRECT
- Altered mentation (GCS <15) ✓ CORRECT

---

## ERROR #2: HEART Score - Incorrect Risk Percentages

**Location:** `client/src/lib/calculator-engine.ts` Lines 427-431

**Current Code:**
```typescript
const maceRates: Record<string, number> = {
  low: 1.7,
  medium: 20.3,  // ← Key name mismatch
  high: 72.7,    // ← Wrong percentage
};
```

**Should Be:**
```typescript
const maceRates: Record<string, number> = {
  low: 1.7,
  moderate: 14.0,  // Changed from "medium" to "moderate" and corrected percentage
  high: 57.5,      // Corrected percentage
};
```

**Source:** MDCalc (https://www.mdcalc.com/calc/1752/heart-score-major-cardiac-events)
**Reference:** Backus BE, et al. Int J Cardiol. 2013;168(3):2153-2158

**Impact:**
- Key name mismatch ("medium" vs "moderate") causes runtime error
- Overstates moderate risk as 20.3% instead of 12-16.6%
- Overstates high risk as 72.7% instead of 50-65%
- **MISLEADS ADMISSION DECISIONS**

**Validated Risk Stratification:**
- Score 0-3: 0.9-1.7% risk (LOW) - Safe for discharge
- Score 4-6: 12-16.6% risk (MODERATE) - Admission recommended
- Score ≥7: 50-65% risk (HIGH) - Early invasive measures

---

## ERROR #3: HEART Score - Calculation Logic Issue

**Location:** `client/src/lib/calculator-engine.ts` Line 419

**Current Code:**
```typescript
let score = inputs.history + inputs.ecg + inputs.troponin + inputs.risk_factors;

// Age scoring
if (inputs.age_heart < 45) score += 0;
else if (inputs.age_heart < 65) score += 1;
else score += 2;
```

**Analysis:**
- The code is technically correct but confusing
- Age is added separately after initial sum
- Could lead to maintenance errors

**Recommendation:**
- Keep current logic but add comment explaining why age is separate
- OR refactor to include age in initial sum for clarity

---

## PENDING VALIDATION

The following calculators require immediate audit:

### High Priority (Life-threatening if wrong):
- [ ] SOFA Score
- [ ] APACHE II
- [ ] Wells' DVT Score  
- [ ] MELD Score
- [ ] CHA2DS2-VASc Score

### Medium Priority (Treatment-altering if wrong):
- [ ] CKD-EPI GFR (2021 equation - race-free)
- [ ] Cockcroft-Gault Creatinine Clearance
- [ ] Child-Pugh Score
- [ ] FIB-4 Score
- [ ] MELD-Na Score
- [ ] APRI Score

### Requires Formula Verification:
- [ ] All remaining 20+ calculators

---

## IMMEDIATE ACTIONS REQUIRED

1. **STOP DEPLOYMENT** - Do not publish until all errors are fixed
2. **Fix Critical Errors** - qSOFA and HEART score corrections
3. **Complete Audit** - Validate all remaining calculators
4. **Add Test Cases** - Create validation tests with known examples from literature
5. **Document Sources** - Add references to all formulas
6. **User Notification** - Inform users of the accuracy issues and timeline for fixes

---

## VALIDATION METHODOLOGY

For each calculator:
1. Find original publication or validated source (MDCalc, NKF, official guidelines)
2. Compare formula implementation line-by-line
3. Test with published examples
4. Verify risk stratification thresholds
5. Check unit conversions
6. Document source and validation date

---

## NOTES

- Multiple users have reported accuracy issues
- This is a **PATIENT SAFETY EMERGENCY**
- All calculators must be re-validated before any further deployment
- Consider adding disclaimer about ongoing validation process


## ERROR #3: SOFA Score - Completely Wrong Cardiovascular Scoring

**Location:** `client/src/lib/calculator-engine.ts` Lines 103-106

**Current Code:**
```typescript
// Cardiovascular
if (inputs.map < 70) score += 4;  // ← WRONG
else if (inputs.map < 80) score += 3;  // ← WRONG
else if (inputs.map < 90) score += 2;  // ← WRONG
else if (inputs.map < 100) score += 1;  // ← WRONG
```

**Should Be:**
```typescript
// Cardiovascular - requires vasopressor dosing information
// 0 points: No hypotension
// 1 point: MAP <70 mmHg
// 2 points: Dopamine ≤5 or Dobutamine (any dose)
// 3 points: Dopamine >5, Epinephrine ≤0.1, or Norepinephrine ≤0.1
// 4 points: Dopamine >15, Epinephrine >0.1, or Norepinephrine >0.1
```

**Source:** MDCalc (https://www.mdcalc.com/calc/691/sequential-organ-failure-assessment-sofa-score)
**Reference:** Vincent JL, et al. Intensive Care Med. 1996;22(7):707-710

**Impact:**
- **DOES NOT ACCOUNT FOR VASOPRESSOR USE AT ALL**
- Dramatically overestimates SOFA scores
- MAP <70 incorrectly gives 4 points instead of 1 point
- **CRITICAL PATIENT SAFETY ISSUE** - affects ICU triage decisions

**Additional Error:**
Line 124: Key name "medium" should be "moderate" (runtime error)

---

## ERROR #4: SOFA Score - Missing Vasopressor Input

**Location:** Calculator inputs definition

**Problem:**
The SOFA calculator only accepts MAP as input, but cardiovascular scoring requires:
- MAP value
- Vasopressor type (dopamine, dobutamine, epinephrine, norepinephrine)
- Vasopressor dose (mcg/kg/min)

**Required Fix:**
Add vasopressor inputs to SOFA calculator definition

---
