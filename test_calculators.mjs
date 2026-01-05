/**
 * Automated Calculator Testing Suite
 * Tests all calculator functions and compares with expected values
 */

import { 
  calculateQSOFA,
  calculateCHA2DS2VASc,
  calculateGCS,
  calculateCURB65,
  calculateCrCl,
  calculateMELD,
  calculateHEART,
  calculateNIHSS,
  calculateSOFA
} from './client/src/lib/calculator-engine.js';

class CalculatorTester {
  constructor() {
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.results = [];
  }

  // Color codes for terminal output
  colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m'
  };

  log(message, color = '') {
    console.log(`${color}${message}${this.colors.reset}`);
  }

  logHeader(title) {
    console.log('\n' + '='.repeat(80));
    this.log(title, this.colors.bold + this.colors.cyan);
    console.log('='.repeat(80) + '\n');
  }

  logTestCase(name) {
    this.log(`\nTest: ${name}`, this.colors.blue);
    console.log('-'.repeat(80));
  }

  testCalculator(name, calculatorFn, inputs, expected, tolerance = 1) {
    this.totalTests++;
    this.logTestCase(name);
    
    try {
      const result = calculatorFn(inputs);
      
      // Log inputs
      console.log('Inputs:');
      Object.entries(inputs).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      
      // Log results
      console.log('\nResults:');
      console.log(`  Score: ${result.score}/${result.maxScore}`);
      console.log(`  Risk Level: ${result.riskLevel}`);
      console.log(`  Risk %: ${result.riskPercentage}%`);
      
      // Check if score matches expected (within tolerance)
      const scoreMatches = Math.abs(result.score - expected.score) <= tolerance;
      const riskMatches = !expected.riskLevel || result.riskLevel === expected.riskLevel;
      
      const passed = scoreMatches && riskMatches;
      
      console.log('\nExpected:');
      console.log(`  Score: ${expected.score}`);
      if (expected.riskLevel) {
        console.log(`  Risk Level: ${expected.riskLevel}`);
      }
      
      if (passed) {
        this.passedTests++;
        this.log('✓ PASSED', this.colors.green + this.colors.bold);
      } else {
        this.failedTests++;
        this.log('✗ FAILED', this.colors.red + this.colors.bold);
        if (!scoreMatches) {
          this.log(`  Expected score: ${expected.score}, Got: ${result.score}`, this.colors.red);
        }
        if (!riskMatches) {
          this.log(`  Expected risk: ${expected.riskLevel}, Got: ${result.riskLevel}`, this.colors.red);
        }
      }
      
      console.log(`\nInterpretation: ${result.interpretation}`);
      
      this.results.push({
        name,
        passed,
        score: result.score,
        expectedScore: expected.score,
        riskLevel: result.riskLevel
      });
      
      return passed;
    } catch (error) {
      this.failedTests++;
      this.log(`✗ ERROR: ${error.message}`, this.colors.red + this.colors.bold);
      return false;
    }
  }

  runAllTests() {
    this.logHeader('MEDICAL CALCULATOR AUTOMATED TEST SUITE');
    this.log('Testing all calculators against validated reference values\n', this.colors.yellow);

    // Test qSOFA Score
    this.logHeader('qSOFA Score Tests');
    
    this.testCalculator(
      'qSOFA = 0 (Low Risk - Normal Patient)',
      calculateQSOFA,
      { altered_mentation: false, respiratory_rate: 18, systolic_bp: 120 },
      { score: 0, riskLevel: 'low' }
    );
    
    this.testCalculator(
      'qSOFA = 1 (Tachypnea Only)',
      calculateQSOFA,
      { altered_mentation: false, respiratory_rate: 24, systolic_bp: 110 },
      { score: 1, riskLevel: 'low' }
    );
    
    this.testCalculator(
      'qSOFA = 2 (High Risk)',
      calculateQSOFA,
      { altered_mentation: true, respiratory_rate: 26, systolic_bp: 110 },
      { score: 2, riskLevel: 'high' }
    );
    
    this.testCalculator(
      'qSOFA = 3 (Critical)',
      calculateQSOFA,
      { altered_mentation: true, respiratory_rate: 28, systolic_bp: 88 },
      { score: 3, riskLevel: 'high' }
    );

    // Test CHA2DS2-VASc
    this.logHeader('CHA2DS2-VASc Score Tests');
    
    this.testCalculator(
      'CHA2DS2-VASc = 0 (Lowest Risk)',
      calculateCHA2DS2VASc,
      { 
        chf: false, hypertension: false, age_75_plus: false, 
        diabetes: false, stroke: false, vascular_disease: false,
        age_65_74: false, female: false 
      },
      { score: 0, riskLevel: 'low' }
    );
    
    this.testCalculator(
      'CHA2DS2-VASc = 2 (Moderate Risk)',
      calculateCHA2DS2VASc,
      { 
        chf: false, hypertension: true, age_75_plus: false,
        diabetes: false, stroke: false, vascular_disease: false,
        age_65_74: true, female: false 
      },
      { score: 2, riskLevel: 'medium' }
    );

    // Test Glasgow Coma Scale
    this.logHeader('Glasgow Coma Scale Tests');
    
    this.testCalculator(
      'GCS = 15 (Normal)',
      calculateGCS,
      { eye_response: 4, verbal_response: 5, motor_response: 6 },
      { score: 15, riskLevel: 'low' }
    );
    
    this.testCalculator(
      'GCS = 9 (Moderate TBI)',
      calculateGCS,
      { eye_response: 3, verbal_response: 3, motor_response: 3 },
      { score: 9, riskLevel: 'medium' }
    );
    
    this.testCalculator(
      'GCS = 3 (Worst Score)',
      calculateGCS,
      { eye_response: 1, verbal_response: 1, motor_response: 1 },
      { score: 3, riskLevel: 'critical' }
    );

    // Test CURB-65
    this.logHeader('CURB-65 Score Tests');
    
    this.testCalculator(
      'CURB-65 = 0 (Very Low Risk)',
      calculateCURB65,
      { 
        confusion: false, urea_high: false, respiratory_rate_high: false,
        bp_low: false, age_65_plus: false 
      },
      { score: 0, riskLevel: 'low' }
    );
    
    this.testCalculator(
      'CURB-65 = 3 (High Risk)',
      calculateCURB65,
      { 
        confusion: true, urea_high: true, respiratory_rate_high: true,
        bp_low: false, age_65_plus: false 
      },
      { score: 3, riskLevel: 'high' }
    );

    // Test Creatinine Clearance
    this.logHeader('Creatinine Clearance Tests');
    
    this.testCalculator(
      'CrCl ~107 (Normal Young Male)',
      calculateCrCl,
      { age: 30, weight: 70, creatinine: 1.0, female: false },
      { score: 107, riskLevel: 'low' },
      5  // Allow ±5 mL/min tolerance
    );
    
    this.testCalculator(
      'CrCl ~91 (Normal Young Female)',
      calculateCrCl,
      { age: 30, weight: 60, creatinine: 1.0, female: true },
      { score: 91, riskLevel: 'low' },
      5
    );
    
    this.testCalculator(
      'CrCl ~42 (Moderate CKD)',
      calculateCrCl,
      { age: 65, weight: 80, creatinine: 2.0, female: false },
      { score: 42, riskLevel: 'medium' },
      3
    );

    // Test MELD Score
    this.logHeader('MELD Score Tests');
    
    this.testCalculator(
      'MELD = 6 (Minimal Disease)',
      calculateMELD,
      { creatinine: 1.0, bilirubin: 1.0, inr: 1.0, dialysis: false },
      { score: 6 },
      1
    );
    
    this.testCalculator(
      'MELD ~25 (Severe Disease)',
      calculateMELD,
      { creatinine: 2.5, bilirubin: 8.0, inr: 2.2, dialysis: false },
      { score: 25 },
      2
    );

    // Test HEART Score
    this.logHeader('HEART Score Tests');
    
    this.testCalculator(
      'HEART = 1 (Low Risk)',
      calculateHEART,
      { history: 0, ecg: 0, age: 40, risk_factors: 0, troponin: 1 },
      { score: 1, riskLevel: 'low' }
    );
    
    this.testCalculator(
      'HEART = 5 (Moderate Risk)',
      calculateHEART,
      { history: 1, ecg: 1, age: 55, risk_factors: 1, troponin: 1 },
      { score: 5, riskLevel: 'medium' }
    );

    // Test NIHSS
    this.logHeader('NIH Stroke Scale Tests');
    
    const nihss_inputs_zero = {
      loc: 0, loc_questions: 0, loc_commands: 0, gaze: 0, visual: 0,
      facial_palsy: 0, motor_arm_left: 0, motor_arm_right: 0,
      motor_leg_left: 0, motor_leg_right: 0, limb_ataxia: 0,
      sensory: 0, language: 0, dysarthria: 0, extinction: 0
    };
    
    this.testCalculator(
      'NIHSS = 0 (No Stroke)',
      calculateNIHSS,
      nihss_inputs_zero,
      { score: 0, riskLevel: 'low' }
    );

    // Print Summary
    this.printSummary();
  }

  printSummary() {
    this.logHeader('TEST RESULTS SUMMARY');
    
    const passRate = ((this.passedTests / this.totalTests) * 100).toFixed(1);
    
    console.log(`Total Tests: ${this.totalTests}`);
    this.log(`Passed: ${this.passedTests}`, this.colors.green);
    this.log(`Failed: ${this.failedTests}`, this.failedTests > 0 ? this.colors.red : this.colors.green);
    this.log(`Pass Rate: ${passRate}%\n`, passRate >= 90 ? this.colors.green : this.colors.yellow);
    
    if (this.failedTests === 0) {
      this.log('🎉 All tests passed! Calculators are accurate.', this.colors.green + this.colors.bold);
    } else {
      this.log('⚠️  Some tests failed. Please review the calculations above.', this.colors.yellow + this.colors.bold);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
}

// Run tests
const tester = new CalculatorTester();
tester.runAllTests();
