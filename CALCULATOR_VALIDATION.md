# Calculator Validation Report

## Purpose
This document tracks the validation of all clinical calculators against trusted medical sources (MDCalc, UpToDate, original publications, clinical guidelines).

## Validation Status

### qSOFA Score
**Source:** MDCalc (https://www.mdcalc.com/calc/2654/qsofa-quick-sofa-score-sepsis)
**Original Publication:** Singer M, et al. JAMA. 2016;315(8):801-810

**Validated Criteria:**
- Altered mental status (GCS <15): 1 point
- Respiratory rate ≥22/min: 1 point
- Systolic BP ≤100 mmHg: 1 point

**Interpretation:**
- Score ≥2: High risk for poor outcome
- Score <2: Not high risk

**Current Implementation Status:** ⏳ PENDING VERIFICATION

---

### SOFA Score
**Source:** MDCalc (https://www.mdcalc.com/calc/691/sequential-organ-failure-assessment-sofa-score)

**Current Implementation Status:** ⏳ PENDING VERIFICATION

---

### HEART Score
**Source:** MDCalc (https://www.mdcalc.com/calc/1752/heart-score-major-cardiac-events)

**Current Implementation Status:** ⏳ PENDING VERIFICATION

---

### Wells' DVT Score
**Source:** MDCalc (https://www.mdcalc.com/calc/362/wells-criteria-dvt)

**Current Implementation Status:** ⏳ PENDING VERIFICATION

---

### CKD-EPI GFR
**Source:** National Kidney Foundation, CKD-EPI 2021 equation

**Current Implementation Status:** ⏳ PENDING VERIFICATION

---

### Creatinine Clearance (Cockcroft-Gault)
**Source:** Cockcroft DW, Gault MH. Nephron. 1976;16(1):31-41

**Current Implementation Status:** ⏳ PENDING VERIFICATION

---

### MELD Score
**Source:** United Network for Organ Sharing (UNOS)

**Current Implementation Status:** ⏳ PENDING VERIFICATION

---

## Validation Methodology

1. **Formula Verification:** Compare implementation against validated source
2. **Test Cases:** Run known examples from literature
3. **Boundary Testing:** Test edge cases and limits
4. **Unit Conversion:** Verify conversions don't introduce errors
5. **Interpretation:** Confirm risk stratification thresholds

## Issues Found

*To be populated during audit*

## Corrections Made

*To be populated after fixes*
