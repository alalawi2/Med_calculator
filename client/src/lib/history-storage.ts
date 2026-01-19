import { CalculationResult } from './calculator-engine';

export interface CalculationHistoryEntry {
  id: string;
  timestamp: number;
  calculatorId: string;
  calculatorName: string;
  inputs: Record<string, any>;
  result: CalculationResult;
}

interface CalculationHistory {
  entries: CalculationHistoryEntry[];
  maxEntries: number;
}

const STORAGE_KEY = 'medad_calculator_history';
const MAX_ENTRIES = 50;

// Generate UUID v4
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Get history from localStorage
export function getHistory(): CalculationHistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const history: CalculationHistory = JSON.parse(stored);
    return history.entries || [];
  } catch (error) {
    console.error('Error loading calculation history:', error);
    return [];
  }
}

// Save calculation to history
export function saveCalculation(
  calculatorId: string,
  calculatorName: string,
  inputs: Record<string, any>,
  result: CalculationResult
): void {
  try {
    const history = getHistory();
    
    const entry: CalculationHistoryEntry = {
      id: generateId(),
      timestamp: Date.now(),
      calculatorId,
      calculatorName,
      inputs,
      result,
    };
    
    // Add new entry at the beginning (newest first)
    history.unshift(entry);
    
    // Keep only the most recent MAX_ENTRIES
    const trimmedHistory = history.slice(0, MAX_ENTRIES);
    
    const historyData: CalculationHistory = {
      entries: trimmedHistory,
      maxEntries: MAX_ENTRIES,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
  } catch (error) {
    console.error('Error saving calculation to history:', error);
  }
}

// Delete a single entry
export function deleteEntry(id: string): void {
  try {
    const history = getHistory();
    const filtered = history.filter(entry => entry.id !== id);
    
    const historyData: CalculationHistory = {
      entries: filtered,
      maxEntries: MAX_ENTRIES,
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historyData));
  } catch (error) {
    console.error('Error deleting history entry:', error);
  }
}

// Clear all history
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// Get history count
export function getHistoryCount(): number {
  return getHistory().length;
}

// Get history for a specific calculator
export function getHistoryByCalculator(calculatorId: string): CalculationHistoryEntry[] {
  return getHistory().filter(entry => entry.calculatorId === calculatorId);
}

// Get history within date range
export function getHistoryByDateRange(startDate: Date, endDate: Date): CalculationHistoryEntry[] {
  const start = startDate.getTime();
  const end = endDate.getTime();
  
  return getHistory().filter(entry => 
    entry.timestamp >= start && entry.timestamp <= end
  );
}
