# Medad - qSOFA Calculator TODO

## Current Tasks

- [x] Add dual unit system support (IU/SI and American/conventional units)
- [x] Create unit conversion mappings for all calculator inputs
- [x] Implement unit toggle UI in calculator forms
- [x] Test unit conversions across all calculators

## Completed Features

- [x] iOS Safari PWA installation instructions
- [x] Backend feedback system with database storage
- [x] Owner notifications for feedback submissions
- [x] Enhanced install prompts (bottom banner, floating banner, result prompt)
- [x] Benefits and social proof sections

## Critical: Calculator Accuracy Audit

- [x] Audit qSOFA Score formula and thresholds - FIXED (BP threshold ≤100)
- [x] Audit SOFA Score formula and thresholds - PARTIAL (key name fixed, cardiovascular needs restructure)
- [x] Audit HEART Score formula and thresholds - FIXED (risk percentages corrected)
- [x] Audit Wells' DVT Score formula and thresholds - VERIFIED CORRECT
- [ ] Audit APACHE II formula and thresholds - NOT IN UI (errors found in engine)
- [ ] Audit NIHSS (NIH Stroke Scale) formula and thresholds - NOT IN UI
- [ ] Audit PESI (Pulmonary Embolism Severity Index) formula - NOT IN UI
- [ ] Audit SMART-COP formula and thresholds - NOT IN UI
- [x] Audit Wells' PE Score formula and thresholds - FIXED (wrong inputs)
- [x] Audit Creatinine Clearance (Cockcroft-Gault) formula - VERIFIED CORRECT
- [x] Audit MELD Score formula and thresholds - FIXED (sign error corrected)
- [x] Audit Child-Pugh Score formula and thresholds - VERIFIED CORRECT
- [x] Audit FIB-4 Score formula and thresholds - VERIFIED CORRECT
- [x] Audit MELD-Na Score formula and thresholds - VERIFIED CORRECT
- [x] Audit APRI Score formula and thresholds - VERIFIED CORRECT
- [x] Audit CHA2DS2-VASc Score - VERIFIED CORRECT
- [x] Audit GCS (Glasgow Coma Scale) - FIXED (syntax errors)
- [x] Audit CURB-65 Score - VERIFIED (minor mortality rate differences)
- [x] Audit ASA Physical Status - VERIFIED CORRECT
- [x] Audit RCRI (Revised Cardiac Risk Index) - VERIFIED CORRECT
- [x] Audit Caprini Score - VERIFIED CORRECT
- [ ] Fix SOFA cardiovascular scoring (requires adding vasopressor inputs)
- [x] Create comprehensive test cases with validated examples
- [x] Document all formula sources and validation - See CALCULATOR_VALIDATION_REPORT.md

## Phase 2: Complete Remaining Calculator Validations
- [ ] Validate APACHE II against original Knaus publication
- [ ] Validate NIHSS against NIH stroke scale guidelines
- [ ] Validate PESI against Aujesky publication
- [ ] Validate SMART-COP against pneumonia severity criteria
- [ ] Validate Wells DVT against original Wells criteria
- [ ] Fix any errors found in above calculators
- [ ] Restructure SOFA cardiovascular with vasopressor inputs (dopamine, dobutamine, epinephrine, norepinephrine)
- [ ] Add vasopressor dose inputs (mcg/kg/min)
- [ ] Update SOFA scoring logic for cardiovascular component
- [ ] Create comprehensive tests for all fixes
- [ ] Update validation report with 100% completion status

## Implement All 32 Calculators

**STATUS:** Complete implementation blueprint created (see CALCULATOR_IMPLEMENTATION_BLUEPRINT.md)
**ESTIMATED EFFORT:** 40-55 hours total
**RECOMMENDATION:** Implement in 3 phases over 8 weeks

### Currently Functional (5/32)
- [x] qSOFA Score
- [x] HEART Score
- [x] Wells' DVT Score
- [x] Wells' PE Score
- [x] CURB-65

### Cardiovascular Calculators (5)
- [ ] CHA₂DS₂-VASc Score - Stroke risk in atrial fibrillation
- [ ] HAS-BLED Score - Bleeding risk in atrial fibrillation
- [ ] TIMI Risk Score - Acute Coronary Syndrome risk
- [ ] Framingham Risk Score - 10-year cardiovascular disease risk
- [ ] ASCVD Risk Calculator - Atherosclerotic cardiovascular disease risk

### Critical Care Calculators (3)
- [ ] SOFA Score - Sequential Organ Failure Assessment (fix cardiovascular component)
- [ ] APACHE II Score - ICU mortality prediction (complete implementation)
- [ ] NEWS2 Score - National Early Warning Score

### Neurology Calculators (3)
- [ ] NIHSS (NIH Stroke Scale) - Acute stroke severity
- [ ] ABCD2 Score - TIA/Stroke risk after TIA
- [ ] Glasgow Coma Scale - Consciousness assessment (fix syntax errors)

### Respiratory & Infectious Disease Calculators (3)
- [ ] PSI/PORT Score - Pneumonia Severity Index
- [ ] Centor Score - Strep throat risk
- [ ] SMART-COP Score - Pneumonia severity

### Nephrology Calculators (2)
- [ ] CKD-EPI GFR - Estimated Glomerular Filtration Rate
- [ ] Creatinine Clearance - Cockcroft-Gault equation

### Hepatology & GI Calculators (7)
- [ ] MELD Score - Model for End-Stage Liver Disease (fix formula sign)
- [ ] Child-Pugh Score - Liver disease severity
- [ ] FIB-4 Index - Liver fibrosis assessment
- [ ] MELD-Na Score - Enhanced MELD with sodium
- [ ] APRI Score - AST to Platelet Ratio Index
- [ ] Glasgow-Blatchford Score - Upper GI bleed risk
- [ ] BISAP Score - Acute pancreatitis severity

### Perioperative Medicine Calculators (3)
- [ ] ASA Physical Status - Perioperative risk assessment
- [ ] RCRI (Revised Cardiac Risk Index) - Cardiac complications after non-cardiac surgery
- [ ] Caprini Score - VTE risk in surgical patients
- [ ] PESI (Pulmonary Embolism Severity Index) - PE mortality prediction

### Testing & Validation
- [ ] Add comprehensive test cases for all 32 calculators
- [ ] Validate all formulas against MDCalc and original publications
- [ ] Test unit conversions for all calculators
- [ ] Create validation report for all 32 calculators
