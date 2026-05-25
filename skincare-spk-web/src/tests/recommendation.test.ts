import { describe, expect, it } from "vitest";
import { buildRecommendation } from "@/lib/recommendation/recommendationEngine";
import { ingredients, routines, rules, skinConditions, skinTypes } from "./fixtures";

describe("recommendation ranking", () => {
  it("prioritizes Niacinamide for oily acne profile", () => {
    const result = buildRecommendation({
      input: {
        skinType: "berminyak",
        conditions: ["jerawat", "komedo"],
        sensitivityLevel: "sedang",
        goals: ["oil_control", "acne_care"],
        avoidPreferences: []
      },
      skinTypes,
      skinConditions,
      rules,
      ingredients,
      routines
    });

    expect(result.recommended.map((item) => item.inciName)).toContain("Niacinamide");
  });

  it("prioritizes Glycerin for dry dehydrated profile", () => {
    const result = buildRecommendation({
      input: {
        skinType: "kering",
        conditions: ["dehidrasi"],
        sensitivityLevel: "sedang",
        goals: ["hidrasi"],
        avoidPreferences: []
      },
      skinTypes,
      skinConditions,
      rules,
      ingredients,
      routines
    });

    const allPositive = [...result.recommended, ...result.supporting].map((item) => item.inciName);
    expect(allPositive).toContain("Glycerin");
  });

  it("keeps fragrance and strong exfoliant away from recommended when sensitivity or barrier risk is high", () => {
    const result = buildRecommendation({
      input: {
        skinType: "sensitif",
        conditions: ["kemerahan", "skin_barrier_terganggu"],
        sensitivityLevel: "tinggi",
        goals: ["soothing", "barrier_repair"],
        avoidPreferences: ["hindari_fragrance", "hindari_exfoliant_kuat"]
      },
      skinTypes,
      skinConditions,
      rules,
      ingredients,
      routines
    });

    expect(result.recommended.map((item) => item.inciName)).not.toContain("Fragrance");
    expect(result.recommended.map((item) => item.inciName)).not.toContain("Glycolic Acid");
    expect([...result.recommended, ...result.supporting].map((item) => item.inciName)).toEqual(
      expect.arrayContaining(["Panthenol", "Centella Asiatica Extract"])
    );
    expect([...result.useWithCaution, ...result.avoidIfSensitive].map((item) => item.inciName)).toEqual(
      expect.arrayContaining(["Fragrance", "Glycolic Acid"])
    );
  });
});
