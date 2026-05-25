import { describe, expect, it } from "vitest";
import { buildRecommendation } from "@/lib/recommendation/recommendationEngine";
import { ingredients, routines, rules, skinConditions, skinTypes } from "./fixtures";

describe("end-to-end recommendation response", () => {
  it("returns complete result sections and a disclaimer", () => {
    const result = buildRecommendation({
      input: {
        skinType: "berminyak",
        conditions: ["jerawat"],
        sensitivityLevel: "sedang",
        goals: ["oil_control", "acne_care"],
        avoidPreferences: ["hindari_fragrance"]
      },
      skinTypes,
      skinConditions,
      rules,
      ingredients,
      routines
    });

    expect(result.inputSummary.skinType).toBe("berminyak");
    expect(result.mappedScores.oiliness).toBeGreaterThanOrEqual(8);
    expect(result.fuzzyOutputs.oil_control_need).toBeGreaterThan(0);
    expect(result.recommended.length + result.supporting.length).toBeGreaterThan(0);
    expect(result.routine).not.toBeNull();
    expect(result.disclaimer).toContain("bukan alat diagnosis medis");
  });
});
