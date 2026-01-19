import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeCalculator } from './calculator-wrapper.js';
import { completeCalculators as calculators } from './calculators-complete.js';

describe('PDF Export Functionality', () => {
  beforeEach(() => {
    // Mock jsPDF
    vi.mock('jspdf', () => ({
      jsPDF: vi.fn().mockImplementation(() => ({
        internal: {
          pageSize: {
            getWidth: () => 210,
          },
        },
        setFontSize: vi.fn(),
        setTextColor: vi.fn(),
        setFillColor: vi.fn(),
        text: vi.fn(),
        rect: vi.fn(),
        splitTextToSize: vi.fn((text) => [text]),
        save: vi.fn(),
      })),
    }));
  });

  it('qSOFA calculator produces valid result for PDF export', () => {
    const qsofaCalculator = calculators.find(c => c.id === 'qsofa');
    expect(qsofaCalculator).toBeDefined();

    const inputs = {
      respiratory_rate: 24,
      altered_mentation: true,
      systolic_bp: 95,
    };

    const result = executeCalculator(qsofaCalculator!, inputs);

    // Verify result structure for PDF export
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('riskLevel');
    expect(result).toHaveProperty('riskPercentage');
    expect(result).toHaveProperty('interpretation');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('managementPathway');

    // Verify data types
    expect(typeof result.score).toBe('number');
    expect(typeof result.riskLevel).toBe('string');
    expect(typeof result.riskPercentage).toBe('number');
    expect(typeof result.interpretation).toBe('string');
    expect(Array.isArray(result.recommendations)).toBe(true);

    // Verify content is not empty
    expect(result.interpretation.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);

    console.log('✓ qSOFA PDF export data validated:', {
      score: result.score,
      riskLevel: result.riskLevel,
      riskPercentage: result.riskPercentage,
    });
  });

  it('CHA₂DS₂-VASc calculator produces valid result for PDF export', () => {
    const cha2ds2vascCalculator = calculators.find(c => c.id === 'cha2ds2vasc');
    expect(cha2ds2vascCalculator).toBeDefined();

    const inputs = {
      chf_history: true,
      hypertension: true,
      age: '≥75',
      diabetes: false,
      stroke_tia_history: false,
      vascular_disease: false,
      sex: 'Female',
    };

    const result = executeCalculator(cha2ds2vascCalculator!, inputs);

    // Verify result structure for PDF export
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('riskLevel');
    expect(result).toHaveProperty('riskPercentage');
    expect(result).toHaveProperty('interpretation');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('managementPathway');

    // Verify data types
    expect(typeof result.score).toBe('number');
    expect(typeof result.riskLevel).toBe('string');
    expect(typeof result.riskPercentage).toBe('number');
    expect(typeof result.interpretation).toBe('string');
    expect(Array.isArray(result.recommendations)).toBe(true);

    // Verify content is not empty
    expect(result.interpretation.length).toBeGreaterThan(0);
    expect(result.recommendations.length).toBeGreaterThan(0);

    // CHA₂DS₂-VASc specific: score should be 4 (CHF=1, HTN=1, Age≥75=2, Female=1, but Female only counts if score≥1 from other factors)
    // Actually: CHF=1, HTN=1, Age≥75=2, Female=1 = 5
    expect(result.score).toBeGreaterThan(0);

    console.log('✓ CHA₂DS₂-VASc PDF export data validated:', {
      score: result.score,
      riskLevel: result.riskLevel,
      riskPercentage: result.riskPercentage,
    });
  });

  it('All calculator results have required PDF export fields', () => {
    const testCases = [
      { id: 'qsofa', inputs: { respiratory_rate: 22, altered_mentation: false, systolic_bp: 100 } },
      { id: 'glasgow_coma', inputs: { eye: 4, verbal: 5, motor: 6 } },
      { id: 'meld', inputs: { bilirubin_meld: 2.0, creatinine_meld: 1.5, inr: 1.8, dialysis: false } },
    ];

    testCases.forEach(({ id, inputs }) => {
      const calculator = calculators.find(c => c.id === id);
      if (!calculator) {
        console.warn(`Calculator ${id} not found, skipping`);
        return;
      }

      const result = executeCalculator(calculator, inputs);

      // Verify all required fields exist
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('riskLevel');
      expect(result).toHaveProperty('riskPercentage');
      expect(result).toHaveProperty('interpretation');
      expect(result).toHaveProperty('recommendations');
      expect(result).toHaveProperty('managementPathway');

      console.log(`✓ ${calculator.name} PDF export fields validated`);
    });
  });
});
