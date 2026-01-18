# Remaining Calculator Audit - Critical Findings

**Date:** January 18, 2026  
**Status:** CRITICAL ERRORS FOUND

---

## Summary

Audit of remaining 5 calculators revealed **2 CRITICAL ERRORS** requiring major restructuring:

1. **APACHE II** - Missing 7+ required variables (INCOMPLETE IMPLEMENTATION)
2. **SOFA Cardiovascular** - Wrong scoring logic (already documented)

---

## Detailed Findings

### 1. APACHE II Score - **CRITICAL ERROR**

**Status:** ❌ INCOMPLETE IMPLEMENTATION

**Current Implementation:**
- Only includes 5 variables: temperature, heart rate, respiratory rate, systolic BP, age
- Missing 8+ required variables

**Required Variables (per MDCalc & Knaus et al. 1985):**
1. ✅ Temperature
2. ❌ Mean Arterial Pressure (MAP) - MISSING
3. ❌ pH - MISSING
4. ✅ Heart Rate
5. ✅ Respiratory Rate
6. ❌ Sodium - MISSING
7. ❌ Potassium - MISSING
8. ❌ Creatinine - MISSING
9. ❌ Acute Renal Failure flag - MISSING
10. ❌ Hematocrit - MISSING
11. ❌ White Blood Cell Count - MISSING
12. ❌ Glasgow Coma Scale (15 - GCS) - MISSING
13. ❌ FiO₂ (A-a gradient if FiO₂ ≥50%) - MISSING
14. ✅ Age
15. ❌ Chronic Health Points - MISSING

**Impact:**
- APACHE II scores dramatically underestimated
- Missing >50% of required inputs
- Mortality predictions completely inaccurate
- Could lead to inappropriate ICU triage decisions

**Fix Required:**
1. Add 8+ new inputs to calculator definition
2. Implement complete APACHE II scoring algorithm
3. Add chronic health evaluation (organ failure, immunocompromise)
4. Update form UI to collect all required data
5. Add comprehensive test cases

**Reference:** Knaus WA, et al. APACHE II: a severity of disease classification system. Crit Care Med. 1985;13(10):818-829.

---

### 2. SOFA Score - Cardiovascular Component - **CRITICAL ERROR**

**Status:** ❌ WRONG SCORING LOGIC (previously documented)

**Current Implementation:**
```typescript
if (inputs.map < 70) score += 4;
else if (inputs.map < 80) score += 3;
else if (inputs.map < 90) score += 2;
else if (inputs.map < 100) score += 1;
```

**Correct Scoring (per Vincent et al. 1996):**
- 0 points: No hypotension
- 1 point: MAP <70 mmHg
- 2 points: Dopamine ≤5 mcg/kg/min OR Dobutamine (any dose)
- 3 points: Dopamine >5 mcg/kg/min OR Epinephrine ≤0.1 mcg/kg/min OR Norepinephrine ≤0.1 mcg/kg/min
- 4 points: Dopamine >15 mcg/kg/min OR Epinephrine >0.1 mcg/kg/min OR Norepinephrine >0.1 mcg/kg/min

**Impact:**
- Dramatically overestimates SOFA scores
- MAP <70 incorrectly scores 4 points (should be 1 point if no vasopressors)
- Missing entire vasopressor assessment
- Affects ICU mortality predictions and organ failure assessment

**Fix Required:**
1. Add vasopressor type inputs (dopamine, dobutamine, epinephrine, norepinephrine)
2. Add vasopressor dose inputs (mcg/kg/min)
3. Rewrite cardiovascular scoring logic
4. Update calculator definition and form UI
5. Add test cases with vasopressor scenarios

**Reference:** Vincent JL, et al. The SOFA (Sepsis-related Organ Failure Assessment) score to describe organ dysfunction/failure. Intensive Care Med. 1996;22(7):707-710.

---

### 3. NIHSS (NIH Stroke Scale) - **NEEDS VERIFICATION**

**Status:** ⏳ IMPLEMENTATION REVIEW NEEDED

**Current Implementation:**
```typescript
const score = Object.values(inputs).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
```

**Expected Components (per NIH/MDCalc):**
1. Level of consciousness (0-3)
2. LOC questions (0-2)
3. LOC commands (0-2)
4. Horizontal eye movement (0-2)
5. Visual fields (0-3)
6. Facial palsy (0-3)
7. Left arm motor (0-4)
8. Right arm motor (0-4)
9. Left leg motor (0-4)
10. Right leg motor (0-4)
11. Limb ataxia (0-2)
12. Sensory (0-2)
13. Language/aphasia (0-3)
14. Dysarthria (0-2)
15. Extinction/inattention (0-2)

**Total Range:** 0-42 points

**Assessment:**
- Implementation appears to be a simple sum of all inputs
- This is CORRECT for NIHSS (additive scoring)
- Need to verify calculator definition includes all 15 components
- Need to verify scoring ranges for each component

**Action:** Verify calculator definition in calculators.ts

---

### 4. PESI (Pulmonary Embolism Severity Index) - **PENDING**

**Status:** ⏳ NOT YET AUDITED

**Priority:** MEDIUM

**Action:** Validate against Aujesky et al. publication and MDCalc

---

### 5. SMART-COP - **PENDING**

**Status:** ⏳ NOT YET AUDITED

**Priority:** MEDIUM

**Action:** Validate against pneumonia severity criteria

---

### 6. Wells DVT Score - **PENDING**

**Status:** ⏳ NOT YET AUDITED

**Priority:** MEDIUM

**Action:** Validate against original Wells criteria

---

## Recommendations

### Immediate Actions

1. **Disable APACHE II calculator** until complete implementation is ready
   - Add warning message: "Calculator under validation - do not use for clinical decisions"
   - Or remove from calculator list temporarily

2. **Add prominent disclaimer to SOFA calculator**
   - "Cardiovascular component uses simplified MAP-only scoring"
   - "Full vasopressor-based scoring coming soon"

3. **Complete NIHSS verification**
   - Check calculator definition has all 15 components
   - Verify scoring ranges

### Short-term Actions

1. **Implement complete APACHE II**
   - Add all 12 physiologic variables
   - Add chronic health evaluation
   - Add A-a gradient calculation for FiO₂ ≥50%
   - Comprehensive testing

2. **Fix SOFA cardiovascular**
   - Add vasopressor inputs
   - Implement correct scoring logic
   - Update UI and tests

3. **Complete remaining validations**
   - PESI, SMART-COP, Wells DVT

---

## Impact Assessment

**Patient Safety Risk:** HIGH

- APACHE II: Severely underestimates ICU mortality risk
- SOFA: Overestimates organ failure severity
- Both affect critical care triage decisions

**Recommendation:** Prioritize fixing APACHE II and SOFA before completing other validations.

---

**Next Steps:**
1. Verify NIHSS implementation
2. Implement complete APACHE II
3. Fix SOFA cardiovascular
4. Validate remaining 3 calculators
5. Comprehensive testing
6. Update validation report

---

**Audit Status:** 75% Complete → Need to complete remaining work
