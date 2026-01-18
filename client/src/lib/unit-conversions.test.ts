import { describe, expect, it } from "vitest";
import {
  convertValue,
  getUnit,
  getReferenceRange,
  formatValue,
} from "./unit-conversions";

describe("Unit Conversions", () => {
  describe("convertValue", () => {
    it("converts creatinine from American to SI", () => {
      const result = convertValue(1.0, "creatinine", "american", "si");
      expect(result).toBeCloseTo(88.4, 1);
    });

    it("converts creatinine from SI to American", () => {
      const result = convertValue(88.4, "creatinine", "si", "american");
      expect(result).toBeCloseTo(1.0, 2);
    });

    it("converts bilirubin from American to SI", () => {
      const result = convertValue(1.0, "bilirubin", "american", "si");
      expect(result).toBeCloseTo(17.1, 1);
    });

    it("converts glucose from American to SI", () => {
      const result = convertValue(100, "glucose", "american", "si");
      expect(result).toBeCloseTo(5.56, 2);
    });

    it("converts glucose from SI to American", () => {
      const result = convertValue(5.56, "glucose", "si", "american");
      expect(result).toBeCloseTo(100, 0);
    });

    it("converts hemoglobin from American to SI", () => {
      const result = convertValue(14.0, "hemoglobin", "american", "si");
      expect(result).toBe(140);
    });

    it("converts albumin from American to SI", () => {
      const result = convertValue(4.0, "albumin", "american", "si");
      expect(result).toBe(40);
    });

    it("converts BUN from American to SI", () => {
      const result = convertValue(14, "bun", "american", "si");
      expect(result).toBeCloseTo(5.0, 1);
    });

    it("returns same value when converting same system", () => {
      const result = convertValue(1.0, "creatinine", "american", "american");
      expect(result).toBe(1.0);
    });

    it("returns same value for unknown parameter", () => {
      const result = convertValue(100, "unknown_param", "american", "si");
      expect(result).toBe(100);
    });

    it("handles sodium/potassium (same value in both systems)", () => {
      const resultSodium = convertValue(140, "sodium", "american", "si");
      expect(resultSodium).toBe(140);

      const resultPotassium = convertValue(4.0, "potassium", "american", "si");
      expect(resultPotassium).toBe(4.0);
    });
  });

  describe("getUnit", () => {
    it("returns American units", () => {
      expect(getUnit("creatinine", "american")).toBe("mg/dL");
      expect(getUnit("glucose", "american")).toBe("mg/dL");
      expect(getUnit("hemoglobin", "american")).toBe("g/dL");
    });

    it("returns SI units", () => {
      expect(getUnit("creatinine", "si")).toBe("μmol/L");
      expect(getUnit("glucose", "si")).toBe("mmol/L");
      expect(getUnit("hemoglobin", "si")).toBe("g/L");
    });

    it("returns empty string for unknown parameter", () => {
      expect(getUnit("unknown", "american")).toBe("");
    });
  });

  describe("getReferenceRange", () => {
    it("returns American reference ranges", () => {
      expect(getReferenceRange("creatinine", "american")).toBe("0.7-1.3 mg/dL");
      expect(getReferenceRange("glucose", "american")).toBe("70-100 mg/dL");
    });

    it("returns SI reference ranges", () => {
      expect(getReferenceRange("creatinine", "si")).toBe("62-115 μmol/L");
      expect(getReferenceRange("glucose", "si")).toBe("3.9-5.6 mmol/L");
    });

    it("returns empty string for unknown parameter", () => {
      expect(getReferenceRange("unknown", "american")).toBe("");
    });
  });

  describe("formatValue", () => {
    it("formats creatinine with 2 decimals", () => {
      expect(formatValue(1.234, "creatinine")).toBe("1.23");
    });

    it("formats glucose with 1 decimal", () => {
      expect(formatValue(100.56, "glucose")).toBe("100.6");
    });

    it("formats sodium with 0 decimals", () => {
      expect(formatValue(140.7, "sodium")).toBe("141");
    });

    it("formats platelets with 0 decimals", () => {
      expect(formatValue(250.8, "platelets")).toBe("251");
    });

    it("uses default 2 decimals for unknown parameter", () => {
      expect(formatValue(123.456, "unknown")).toBe("123.46");
    });
  });

  describe("Round-trip conversions", () => {
    it("maintains accuracy for creatinine", () => {
      const original = 1.5;
      const toSI = convertValue(original, "creatinine", "american", "si");
      const backToAmerican = convertValue(toSI, "creatinine", "si", "american");
      expect(backToAmerican).toBeCloseTo(original, 2);
    });

    it("maintains accuracy for glucose", () => {
      const original = 120;
      const toSI = convertValue(original, "glucose", "american", "si");
      const backToAmerican = convertValue(toSI, "glucose", "si", "american");
      expect(backToAmerican).toBeCloseTo(original, 1);
    });

    it("maintains accuracy for bilirubin", () => {
      const original = 2.5;
      const toSI = convertValue(original, "bilirubin", "american", "si");
      const backToAmerican = convertValue(toSI, "bilirubin", "si", "american");
      expect(backToAmerican).toBeCloseTo(original, 2);
    });
  });
});
