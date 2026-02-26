/**
 * Integration Tests for Calculator Wrappers
 * Tests the full UI → Wrapper → Engine pipeline
 */

import { describe, it, expect } from "vitest";
import { executeCalculator } from "./calculator-wrapper";
import { completeCalculators } from "./calculators-complete";

describe("Calculator Wrapper Integration Tests", () => {
  // ===================================================================
  // CHA₂DS₂-VASc - User reported this was broken
  // ===================================================================
  describe("CHA₂DS₂-VASc Calculator", () => {
    const calculator = completeCalculators.find((c) => c.id === "cha2ds2vasc")!;

    it("should calculate score 0 for low-risk patient", () => {
      const inputs = {
        chf: false,
        hypertension: false,
        age: 50,
        diabetes: false,
        stroke: false,
        vascular: false,
        sex: false,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(0);
    });

    it("should calculate score 2 for age ≥75", () => {
      const inputs = {
        chf: false,
        hypertension: false,
        age: 80,
        diabetes: false,
        stroke: false,
        vascular: false,
        sex: false,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(2);
    });

    it("should calculate score 1 for age 65-74", () => {
      const inputs = {
        chf: false,
        hypertension: false,
        age: 70,
        diabetes: false,
        stroke: false,
        vascular: false,
        sex: false,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(1);
    });

    it("should add 1 point for female sex", () => {
      const inputs = {
        chf: false,
        hypertension: false,
        age: 50,
        diabetes: false,
        stroke: false,
        vascular: false,
        sex: true,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(1);
    });

    it("should calculate maximum score 9", () => {
      const inputs = {
        chf: true,
        hypertension: true,
        age: 80,
        diabetes: true,
        stroke: true,
        vascular: true,
        sex: true,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(9);
    });
  });

  // ===================================================================
  // qSOFA - Should be working correctly
  // ===================================================================
  describe("qSOFA Calculator", () => {
    const calculator = completeCalculators.find((c) => c.id === "qsofa")!;

    it("should calculate score 0 for normal vitals", () => {
      const inputs = {
        altered_mentation: false,
        respiratory_rate: 16,
        systolic_bp: 120,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(0);
    });

    it("should calculate score 3 for all criteria met", () => {
      const inputs = {
        altered_mentation: true,
        respiratory_rate: 24,
        systolic_bp: 95,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(3);
    });
  });

  // ===================================================================
  // SOFA - Test select dropdown mapping
  // ===================================================================
  describe("SOFA Calculator", () => {
    const calculator = completeCalculators.find((c) => c.id === "sofa")!;

    it("should handle select dropdown inputs correctly", () => {
      const inputs = {
        respiration: "PaO2/FiO2 ≥400",
        coagulation: 150,
        liver: 1.0,
        cardiovascular: "No hypotension",
        cns: 15,
        renal: 1.0,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(0);
    });

    it("should map cardiovascular dropdown to score", () => {
      const inputs = {
        respiration: "PaO2/FiO2 ≥400",
        coagulation: 150,
        liver: 1.0,
        cardiovascular: "Dopamine >5 or epinephrine/norepinephrine ≤0.1",
        cns: 15,
        renal: 1.0,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      // Cardiovascular score 3 should contribute to total
      expect(result?.score).toBeGreaterThan(0);
    });
  });

  // ===================================================================
  // Glasgow Coma Scale - Simple numeric inputs
  // ===================================================================
  describe("Glasgow Coma Scale", () => {
    const calculator = completeCalculators.find((c) => c.id === "glasgow_coma")!;

    it("should calculate maximum score 15", () => {
      const inputs = {
        eye_opening: 4,
        verbal_response: 5,
        motor_response: 6,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(15);
    });

    it("should calculate minimum score 3", () => {
      const inputs = {
        eye_opening: 1,
        verbal_response: 1,
        motor_response: 1,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBe(3);
    });
  });

  // ===================================================================
  // MELD - Test parameter name mapping
  // ===================================================================
  describe("MELD Calculator", () => {
    const calculator = completeCalculators.find((c) => c.id === "meld")!;

    it("should handle UI input names correctly", () => {
      const inputs = {
        inr: 1.0,
        creatinine: 1.0,
        bilirubin: 1.0,
      };

      const result = executeCalculator(calculator, inputs);
      expect(result).not.toBeNull();
      expect(result?.score).toBeGreaterThanOrEqual(6);
    });
  });
});
