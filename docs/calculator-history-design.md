# Calculator History Feature Design

## Overview
Allow users to view and re-export previous calculator results from local storage. This enables clinicians to review past calculations, track patient assessments over time, and re-export PDFs without re-entering data.

## Storage Schema

### LocalStorage Key
`medad_calculator_history`

### Data Structure
```typescript
interface CalculationHistoryEntry {
  id: string; // UUID
  timestamp: number; // Unix timestamp in milliseconds
  calculatorId: string; // e.g., 'qsofa', 'cha2ds2vasc'
  calculatorName: string; // e.g., 'qSOFA Score', 'CHA₂DS₂-VASc'
  inputs: Record<string, any>; // Original input values
  result: CalculationResult; // Complete result object
}

interface CalculationHistory {
  entries: CalculationHistoryEntry[];
  maxEntries: number; // Default: 50
}
```

## Features

### 1. Automatic Save
- Save calculation to history after every successful calculation
- Include timestamp, calculator info, inputs, and results
- Limit to 50 most recent calculations (configurable)
- Oldest entries automatically removed when limit reached

### 2. History View
- Display calculations in reverse chronological order (newest first)
- Show: calculator name, date/time, score, risk level
- Group by calculator type or date (optional)
- Search/filter by calculator name or date range

### 3. History Actions
- **View Details**: Show full calculation with inputs and results
- **Re-export PDF**: Generate PDF from saved result
- **Delete Entry**: Remove single calculation
- **Clear All**: Remove all history (with confirmation)

### 4. Privacy & Security
- All data stored locally in browser (no server storage)
- No patient identifiable information stored by default
- User can clear history anytime
- History cleared when browser cache cleared

## UI Components

### 1. History Button
- Location: Top navigation bar (next to search)
- Icon: Clock/History icon
- Badge: Show count of saved calculations

### 2. History Modal/Page
- Full-screen modal or dedicated page
- List view with cards for each calculation
- Filters: Calculator type, date range
- Sort: Newest first (default), oldest first, by calculator

### 3. History Entry Card
```
┌─────────────────────────────────────┐
│ qSOFA Score          ✓ Validated    │
│ Jan 19, 2026 11:30 PM               │
│                                     │
│ Score: 3 | High Risk | 80%         │
│                                     │
│ [View Details] [Export PDF] [Delete]│
└─────────────────────────────────────┘
```

## Implementation Plan

1. Create history storage module (`client/src/lib/history-storage.ts`)
2. Add history save to ResultsDisplayEnhanced component
3. Create History UI component (`client/src/components/CalculatorHistory.tsx`)
4. Add history button to navigation
5. Implement export from history
6. Add tests for history storage and retrieval

## Mobile Optimization
- Swipe to delete on mobile
- Compact card view for small screens
- Bottom sheet modal instead of full-screen on mobile
- Touch-friendly buttons and spacing
