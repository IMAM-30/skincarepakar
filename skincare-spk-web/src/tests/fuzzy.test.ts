import { describe, expect, it } from "vitest";
import { evaluateMamdani } from "@/lib/fuzzy/mamdani";
import { triangle, trapezoid } from "@/lib/fuzzy/membership";
import { parseRules } from "@/lib/fuzzy/rules";
import { mapInputToScores } from "@/lib/recommendation/inputMapping";
import { rules, skinConditions, skinTypes } from "./fixtures";

describe("membership functions", () => {
  it("evaluates trapezoid and triangle boundaries", () => {
    expect(trapezoid(0, 0, 0, 2, 4)).toBe(1);
    expect(trapezoid(5, 0, 0, 2, 4)).toBe(0);
    expect(triangle(5, 3, 5, 7)).toBe(1);
    expect(triangle(3, 3, 5, 7)).toBe(0);
  });
});

describe("fuzzy Mamdani scenarios", () => {
  it("raises oil-control and acne-care for oily acne profile", () => {
    const scores = mapInputToScores(
      { skinType: "berminyak", conditions: ["jerawat", "komedo"], sensitivityLevel: "sedang" },
      skinTypes,
      skinConditions
    );
    const outputs = evaluateMamdani(scores, parseRules(rules));

    expect(outputs.oil_control_need).toBeGreaterThanOrEqual(70);
    expect(outputs.acne_care_need).toBeGreaterThanOrEqual(70);
    expect(outputs.soothing_need).toBeGreaterThanOrEqual(45);
  });

  it("raises hydration, barrier repair, irritation risk, and exfoliation caution for dry barrier profile", () => {
    const scores = mapInputToScores(
      { skinType: "kering", conditions: ["dehidrasi", "skin_barrier_terganggu"], sensitivityLevel: "tinggi" },
      skinTypes,
      skinConditions
    );
    const outputs = evaluateMamdani(scores, parseRules(rules));

    expect(outputs.hydration_need).toBeGreaterThanOrEqual(70);
    expect(outputs.barrier_repair_need).toBeGreaterThanOrEqual(70);
    expect(outputs.irritation_risk).toBeGreaterThanOrEqual(70);
    expect(outputs.exfoliation_caution).toBeGreaterThanOrEqual(70);
  });
});
