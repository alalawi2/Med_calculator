# Medad Calculator Fixes - Streamlined Plan

## Phase 1: Clean Up UI (Remove Non-Functional Calculators)
- [x] Remove 12 calculators without engine implementations:
  - [x] TIMI, Framingham, ASCVD (no engines)
  - [x] ABCD2, PSI/PORT, CKD-EPI (no engines)
  - [x] Glasgow-Blatchford, BISAP, Centor (no engines)
  - [x] NEWS2, Wells DVT, Wells PE (no engines)
- [x] Keep only 20 calculators with working engines

## Phase 2: Fix All 20 Calculator Wrappers
- [x] qSOFA - Verified correct
- [x] SOFA - Fixed select dropdown mappings
- [x] APACHE - Fixed parameter mapping
- [x] NIHSS - Verified correct (passes inputs object)
- [x] CHA2DS2-VASc - Fixed parameter name mismatches
- [x] HAS-BLED - Fixed combined input parsing
- [x] GCS - Verified correct
- [x] HEART - Fixed age parameter mapping
- [x] CURB-65 - Verified correct (passes inputs object)
- [x] CrCl - Fixed parameter name suffixes
- [x] MELD - Fixed parameter name suffixes
- [x] ASA - Verified correct
- [x] RCRI - Verified correct (passes inputs object)
- [x] Caprini - Verified correct (passes inputs object)
- [x] PESI - Verified correct (passes inputs object)
- [x] SMART-COP - Verified correct (passes inputs object)
- [x] Child-Pugh - Verified correct (passes inputs object)
- [x] FIB-4 - Verified correct
- [x] MELD-Na - Verified correct
- [x] APRI - Verified correct

## Phase 3: Testing & Validation
- [x] Run all 133 tests (ALL PASSING! +12 integration tests)
- [x] Integration test CHA2DS2-VASc (FIXED - now working correctly)
- [x] Integration test qSOFA, SOFA, GCS, MELD (all working)
- [x] Verify TypeScript clean

## Phase 4: Deploy
- [x] Save checkpoint (version 24ae5134)
- [x] Push to GitHub (automatic via checkpoint)


## UI Enhancement: Calculator Status Badges
- [x] Add "✓ Validated" badge to all 20 working calculators
- [x] Design badge styling (green checkmark, subtle, mobile-friendly)
- [x] Update calculator list component to show badges
- [x] Test on mobile and desktop (verified in screenshot)
