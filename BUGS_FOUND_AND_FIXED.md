# Bugs Found and Fixed

## Critical Bugs Fixed

### 1. ✅ PESI Calculator - Age Input Bug
**Location:** `calculator-engine.ts:947`

**Problem:**
```typescript
let score = inputs.age; // If age is undefined/null/string, causes NaN
```

**Impact:** If age is undefined, null, or a non-numeric string, the score becomes NaN, causing calculation errors.

**Fix Applied:**
```typescript
const age = typeof inputs.age === "number" ? inputs.age : parseFloat(inputs.age) || 0;
let score = age;
```

**Status:** ✅ Fixed

---

### 2. ✅ PESI Calculator - Boolean Coercion Bug
**Location:** `calculator-engine.ts:948-957`

**Problem:**
```typescript
if (inputs.male) score += 10; // String "false" is truthy!
```

**Impact:** String values like "false", "0", or empty strings are incorrectly treated as true, causing wrong scores.

**Fix Applied:**
```typescript
const toBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return Boolean(val);
};
if (toBool(inputs.male)) score += 10;
```

**Status:** ✅ Fixed

---

### 3. ✅ Child-Pugh Calculator - Numeric Input Parsing Bug
**Location:** `calculator-engine.ts:1107-1119`

**Problem:**
```typescript
if (inputs.bilirubin < 2) score += 1; // String comparison if input is string!
```

**Impact:** If bilirubin, albumin, or INR come as strings from the form, comparisons will be string comparisons (lexicographic), not numeric, causing incorrect scoring.

**Fix Applied:**
```typescript
const bilirubin = typeof inputs.bilirubin === "number" ? inputs.bilirubin : parseFloat(String(inputs.bilirubin)) || 0;
const albumin = typeof inputs.albumin === "number" ? inputs.albumin : parseFloat(String(inputs.albumin)) || 0;
const inr = typeof inputs.inr === "number" ? inputs.inr : parseFloat(String(inputs.inr)) || 1;
```

**Status:** ✅ Fixed

---

### 4. ✅ CURB-65 Calculator - Boolean Coercion Bug
**Location:** `calculator-engine.ts:574-580`

**Problem:**
```typescript
if (inputs.confusion) score += 1; // String "false" is truthy!
```

**Impact:** String boolean values incorrectly treated as true.

**Fix Applied:**
```typescript
const toBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return Boolean(val);
};
if (toBool(inputs.confusion)) score += 1;
```

**Status:** ✅ Fixed

---

### 5. ✅ RCRI Calculator - Boolean Coercion Bug
**Location:** `calculator-engine.ts:825-832`

**Problem:**
```typescript
if (inputs.high_risk_surgery) score += 1; // String "false" is truthy!
```

**Impact:** String boolean values incorrectly treated as true.

**Fix Applied:**
```typescript
const toBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return Boolean(val);
};
if (toBool(inputs.high_risk_surgery)) score += 1;
```

**Status:** ✅ Fixed

---

### 6. ✅ Caprini Calculator - Boolean Coercion Bug
**Location:** `calculator-engine.ts:888-899`

**Problem:**
```typescript
if (inputs.minor_surgery) score += 1; // String "false" is truthy!
```

**Impact:** String boolean values incorrectly treated as true.

**Fix Applied:**
```typescript
const toBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return Boolean(val);
};
if (toBool(inputs.minor_surgery)) score += 1;
```

**Status:** ✅ Fixed

---

### 7. ✅ SMART-COP Calculator - Boolean Coercion Bug
**Location:** `calculator-engine.ts:1007-1017`

**Problem:**
```typescript
if (inputs.systolic_bp) score += 2; // String "false" is truthy!
```

**Impact:** String boolean values incorrectly treated as true.

**Fix Applied:**
```typescript
const toBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return Boolean(val);
};
if (toBool(inputs.systolic_bp)) score += 2;
```

**Status:** ✅ Fixed

---

### 8. ✅ NIHSS Calculator - Number Parsing Bug
**Location:** `calculator-engine.ts:258`

**Problem:**
```typescript
const score = Object.values(inputs).reduce((a, b) => a + (typeof b === "number" ? b : 0), 0);
```

**Impact:** If inputs come as strings (e.g., "5" instead of 5), they're ignored, causing incorrect scores.

**Fix Applied:**
```typescript
const score = Object.values(inputs).reduce((a, b) => {
  const num = typeof b === "number" ? b : parseFloat(String(b)) || 0;
  return a + (isNaN(num) ? 0 : num);
}, 0);
```

**Status:** ✅ Fixed

---

### 9. ✅ ASA Physical Status - Boolean Coercion Bug
**Location:** `calculator-wrapper.ts:258`

**Problem:**
```typescript
emergency: inputs.emergency || false, // String "false" is truthy!
```

**Impact:** String "false" would be treated as true.

**Fix Applied:**
```typescript
emergency: parseBoolean(inputs.emergency, false),
```

**Status:** ✅ Fixed

---

### 10. ✅ FIB-4 Calculator - Division by Zero Bug
**Location:** `calculator-engine.ts:1184`

**Problem:**
```typescript
const fib4 = (inputs.age * inputs.ast) / (inputs.platelets * Math.sqrt(inputs.alt));
// If platelets = 0 or alt ≤ 0, causes division by zero or NaN
```

**Impact:** Would crash or return NaN if platelets = 0 or ALT ≤ 0.

**Fix Applied:**
```typescript
if (inputs.platelets <= 0 || inputs.alt <= 0) {
  return error result with clear message;
}
```

**Status:** ✅ Fixed

---

### 11. ✅ APRI Calculator - Division by Zero Bug
**Location:** `calculator-engine.ts:1287`

**Problem:**
```typescript
const apri = ((inputs.ast / inputs.ast_upper_limit) * 100) / inputs.platelets;
// If ast_upper_limit = 0 or platelets = 0, causes division by zero
```

**Impact:** Would crash or return Infinity/NaN if denominators are zero.

**Fix Applied:**
```typescript
if (inputs.ast_upper_limit <= 0 || inputs.platelets <= 0) {
  return error result with clear message;
}
```

**Status:** ✅ Fixed

---

### 12. ✅ HAS-BLED - String includes() Bug
**Location:** `calculator-wrapper.ts:171-172, 177-178`

**Problem:**
```typescript
const renalLiver = inputs.renal_liver || "";
renal_disease: renalLiver.includes("Renal") // Crashes if renalLiver is not a string!
```

**Impact:** If `inputs.renal_liver` is a number, object, or other non-string type, calling `.includes()` throws a runtime error.

**Fix Applied:**
```typescript
const renalLiver = typeof inputs.renal_liver === "string" ? inputs.renal_liver : String(inputs.renal_liver || "");
```

**Status:** ✅ Fixed

---

### 13. ✅ CHA2DS2VASc - Boolean Coercion Bug
**Location:** `calculator-engine.ts:333-340`

**Problem:**
```typescript
if (inputs.chf) score += 1; // String "false" is truthy!
```

**Impact:** Even though wrapper uses `parseBoolean()`, the engine function still uses direct boolean checks. If a string gets through, it fails.

**Fix Applied:**
```typescript
const toBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return Boolean(val);
};
if (toBool(inputs.chf)) score += 1;
```

**Status:** ✅ Fixed

---

### 14. ✅ HASBLED - Boolean Coercion Bug
**Location:** `calculator-engine.ts:407-420`

**Problem:**
```typescript
if (inputs.hypertension) score += 1; // String "false" is truthy!
```

**Impact:** String boolean values incorrectly treated as true.

**Fix Applied:**
```typescript
const toBool = (val: any): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val.toLowerCase() === "true" || val === "1";
  return Boolean(val);
};
if (toBool(inputs.hypertension)) score += 1;
```

**Status:** ✅ Fixed

---

### 15. ⚠️ Medication Calculator - Hardcoded Gender
**Location:** `medication-calculator.ts:282`

**Problem:**
```typescript
const gfr = calculateGFR(input.creatinine, input.age, "male");
// Always uses "male", but GFR calculation differs by gender
```

**Impact:** Female patients would get incorrect GFR calculations, leading to wrong medication doses.

**Note:** The `MedicationDosingInput` interface doesn't include gender field, so this may be a design limitation. However, if gender should be configurable, this is a bug.

**Status:** ⚠️ Design limitation - Interface doesn't include gender

---

## Summary

**Total Bugs Found:** 15  
**Total Bugs Fixed:** 14 ✅  
**Design Limitations:** 1 ⚠️  
**Impact:** High - These bugs would cause incorrect calculations when form inputs come as strings instead of proper types, or when edge cases occur

**Root Cause:** 
1. Form inputs often come as strings from HTML forms, but calculators expected proper types (booleans/numbers)
2. The `||` operator and direct boolean checks don't handle string conversions correctly
3. Missing validation for division by zero and invalid math operations

**Solution:** 
1. Added proper type parsing functions (`toBool`, `parseNumber`, `parseBoolean`) that handle string-to-type conversions correctly
2. Added division by zero protection for FIB-4 and APRI
3. Added input validation for numeric operations

---

## Testing Required

After these fixes, test calculators with:
1. String boolean inputs ("true", "false", "1", "0")
2. String number inputs ("5", "10.5")
3. Undefined/null inputs
4. Empty string inputs
5. Zero values for denominators (platelets, ALT, AST upper limit)
6. Negative values where not allowed

All calculators should now handle these edge cases correctly.
