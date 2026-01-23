# GCS Calculator Fix

## Issue
Glasgow Coma Scale calculator was only showing 3 options instead of the full set of options for each component.

## Root Cause
1. The calculator wrapper was expecting numeric inputs, but the UI provides select dropdowns with text options
2. The wrapper needed to map text options to their numeric GCS scores
3. Both "gcs" and "glasgow_coma" calculator IDs needed to be supported

## Fix Applied

### Updated `calculator-wrapper.ts`
- Added mapping from text options to numeric scores:
  - **Eye Opening**: Spontaneous (4), To verbal command (3), To pain (2), No response (1)
  - **Verbal Response**: Oriented (5), Confused (4), Inappropriate (3), Incomprehensible (2), No response (1)
  - **Motor Response**: Obeys commands (6), Localizes pain (5), Withdraws (4), Abnormal flexion (3), Abnormal extension (2), No response (1)
- Added support for both "gcs" and "glasgow_coma" calculator IDs
- Handles both text (from select) and numeric (direct input) values

## Expected Behavior
Now the GCS calculator should show:
- **Eye Opening**: 4 options (Spontaneous, To verbal command, To pain, No response)
- **Verbal Response**: 5 options (Oriented, Confused, Inappropriate, Incomprehensible, No response)
- **Motor Response**: 6 options (Obeys commands, Localizes pain, Withdraws, Abnormal flexion, Abnormal extension, No response)

## Testing
1. Select Glasgow Coma Scale calculator
2. Verify all options appear in each dropdown
3. Select options and calculate - should produce correct GCS score (3-15)
