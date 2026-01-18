# Calculator Fixes to Implement
## Date: January 18, 2026

---

## CRITICAL FIXES (Immediate Implementation)

### 1. qSOFA Score ✅ ALREADY FIXED
**Line 34:** Changed `<100` to `<=100`
**Status:** COMPLETE

### 2. HEART Score ✅ ALREADY FIXED  
**Lines 429, 431:** Fixed risk percentages
**Status:** COMPLETE

### 3. MELD Score ❌ NEEDS FIX
**Location:** Line 571
**Current:** `- 6.43`
**Should be:** `+ 6.43`
**Impact:** Underestimates MELD by ~12-13 points

**Fix:**
```typescript
const meld =
  9.57 * Math.log(inputs.creatinine_meld) +
  3.78 * Math.log(inputs.bilirubin_meld) +
  11.2 * Math.log(inputs.inr) +
  6.43;  // ← Changed from - to +
```

**Additional:** Consider upgrading to MELD 3.0 (includes sex and albumin) - but this requires adding new inputs

### 4. GCS (Glasgow Coma Scale) ❌ NEEDS FIX
**Location:** Lines 365, 374, 383
**Error:** Syntax error - using `:` instead of `=` for array assignment

**Fix:**
```typescript
// Line 365
recommendations = [  // ← Changed from : to =
  "✓ ICU admission",
  "✓ CT head if not done",
  "✓ Neuro checks q15-30min",
  "✓ Prepare for possible intubation",
];

// Line 374
recommendations = [  // ← Changed from : to =
  "✓ ICU admission mandatory",
  "✓ Prepare for intubation",
  "✓ Neurosurgery consultation",
  "✓ ICP monitoring consideration",
];

// Line 383
recommendations = [  // ← Changed from : to =
  "✓ Immediate intubation",
  "✓ ICU admission",
  "✓ Neurosurgery consultation",
  "✓ ICP monitoring",
];
```

### 5. SOFA Score ❌ COMPLEX FIX REQUIRED
**Location:** Lines 103-106
**Error:** Cardiovascular scoring doesn't account for vasopressors

**Current (WRONG):**
```typescript
// Cardiovascular
if (inputs.map < 70) score += 4;
else if (inputs.map < 80) score += 3;
else if (inputs.map < 90) score += 2;
else if (inputs.map < 100) score += 1;
```

**Should be:**
```typescript
// Cardiovascular - requires vasopressor information
if (inputs.vasopressor_type === "none") {
  if (inputs.map < 70) score += 1;
} else if (inputs.vasopressor_type === "dopamine_low" || inputs.vasopressor_type === "dobutamine") {
  score += 2;
} else if (inputs.vasopressor_type === "dopamine_medium" || inputs.vasopressor_type === "epi_low" || inputs.vasopressor_type === "norepi_low") {
  score += 3;
} else if (inputs.vasopressor_type === "dopamine_high" || inputs.vasopressor_type === "epi_high" || inputs.vasopressor_type === "norepi_high") {
  score += 4;
}
```

**Required Changes:**
1. Add vasopressor inputs to SOFA calculator definition
2. Update calculator form to include vasopressor selection
3. Update calculation engine
4. Add unit conversions for vasopressor doses (mcg/kg/min)

**Also fix:** Line 124 - change "medium" to "moderate"

---

## VALIDATED AS CORRECT ✅

### 6. CHA2DS2-VASc Score
**Status:** Implementation matches MDCalc exactly
**No changes needed**

### 7. Cockcroft-Gault CrCl
**Status:** Formula is correct
**No changes needed**

---

## REMAINING TO AUDIT

### High Priority:
- [ ] APACHE II
- [ ] CURB-65
- [ ] PESI
- [ ] RCRI
- [ ] Child-Pugh
- [ ] FIB-4
- [ ] MELD-Na
- [ ] APRI
- [ ] Caprini
- [ ] SMART-COP
- [ ] ASA Physical Status
- [ ] NIHSS

---

## IMPLEMENTATION PLAN

**Phase 1: Quick Fixes (30 minutes)**
1. Fix MELD formula (line 571: - to +)
2. Fix GCS syntax errors (lines 365, 374, 383: : to =)
3. Run tests to verify fixes

**Phase 2: SOFA Restructuring (2-3 hours)**
1. Add vasopressor inputs to calculator definition
2. Update form component
3. Rewrite cardiovascular scoring logic
4. Add comprehensive test cases
5. Fix "medium" → "moderate" key name

**Phase 3: Complete Audit (3-4 hours)**
1. Systematically validate remaining 12 calculators
2. Fix any errors found
3. Add test cases with validated examples
4. Document all sources

**Phase 4: Testing & Deployment (1-2 hours)**
1. Run full test suite
2. Manual testing of all fixed calculators
3. Create changelog
4. Save checkpoint
5. Notify user of corrections

---

## TESTING STRATEGY

For each fixed calculator, test with:
1. **Minimum values** - lowest possible inputs
2. **Maximum values** - highest possible inputs
3. **Threshold values** - exactly at scoring boundaries
4. **Published examples** - from MDCalc or original papers
5. **Edge cases** - unusual combinations

---

## USER NOTIFICATION

After fixes are deployed, add a prominent notice:

> **Important Update (January 18, 2026):**  
> We've completed a comprehensive audit of all clinical calculators and corrected several calculation errors. Most notably:
> - qSOFA blood pressure threshold corrected
> - HEART score risk percentages updated
> - MELD formula corrected
> - SOFA cardiovascular scoring improved
> 
> All calculators have been validated against MDCalc and original publications. We apologize for any inconvenience and remain committed to accuracy.

---

## PRIORITY ORDER

1. **IMMEDIATE:** MELD formula fix (5 minutes) - affects transplant decisions
2. **IMMEDIATE:** GCS syntax fix (5 minutes) - prevents runtime errors
3. **HIGH:** Complete remaining audits (3-4 hours)
4. **MEDIUM:** SOFA restructuring (2-3 hours) - complex but important
5. **ONGOING:** Add automated validation tests

---

## ESTIMATED TOTAL TIME

- Quick fixes: 30 minutes
- Remaining audits: 3-4 hours  
- SOFA restructuring: 2-3 hours
- Testing: 1-2 hours
- **Total: 7-10 hours**

Current progress: ~40% complete
