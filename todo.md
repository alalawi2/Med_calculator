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
- [ ] Audit Wells' DVT Score formula and thresholds
- [ ] Audit APACHE II formula and thresholds
- [ ] Audit NIHSS (NIH Stroke Scale) formula and thresholds
- [ ] Audit PESI (Pulmonary Embolism Severity Index) formula
- [ ] Audit SMART-COP formula and thresholds
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
