# Medad Calculator Fixes - Streamlined Plan

## Phase 1: Clean Up UI (Remove Non-Functional Calculators)
- [x] Remove 12 calculators without engine implementations:
  - [x] TIMI, Framingham, ASCVD (no engines)
  - [x] ABCD2, PSI/PORT, CKD-EPI (no engines)
  - [x] Glasgow-Blatchford, BISAP, Centor (no engines)
  - [x] NEWS2, Wells DVT, Wells PE (no engines)
- [x] Keep only 20 calculators with working engines

## Phase 2: Fix All 20 Calculator Wrappers
- [ ] qSOFA - Verify wrapper (appears correct)
- [ ] SOFA - Fix to use UI select inputs properly
- [ ] APACHE - Fix parameter mapping
- [ ] NIHSS - Create complete wrapper
- [ ] CHA2DS2-VASc - Fix parameter name mismatches
- [ ] HAS-BLED - Fix parameter name mismatches
- [ ] GCS - Verify wrapper (appears correct)
- [ ] HEART - Fix parameter mapping
- [ ] CURB-65 - Fix parameter name mismatches
- [ ] CrCl - Fix parameter mapping
- [ ] MELD - Verify wrapper (appears correct)
- [ ] ASA - Verify wrapper (appears correct)
- [ ] RCRI - Verify wrapper (appears correct)
- [ ] Caprini - Fix parameter mapping
- [ ] PESI - Verify wrapper (appears correct)
- [ ] SMART-COP - Verify wrapper (appears correct)
- [ ] Child-Pugh - Verify wrapper (appears correct)
- [ ] FIB-4 - Verify wrapper (appears correct)
- [ ] MELD-Na - Verify wrapper (appears correct)
- [ ] APRI - Verify wrapper (appears correct)

## Phase 3: Testing & Validation
- [ ] Run all 121 tests
- [ ] Manual test CHA2DS2-VASc (user reported broken)
- [ ] Manual test 5 other key calculators
- [ ] Verify TypeScript clean

## Phase 4: Deploy
- [ ] Save checkpoint
- [ ] Push to GitHub
