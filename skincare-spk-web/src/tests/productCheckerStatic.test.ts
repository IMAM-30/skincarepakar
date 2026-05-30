import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(process.cwd(), "..");
const corePath = path.join(projectRoot, "docs", "assets", "product-checker-core.js");
const indexPath = path.join(projectRoot, "docs", "index.html");

type ProductCheckerCore = {
  productTypes: Array<{ id: string; label: string }>;
  assessProduct: (params: {
    rawText: string;
    productTypeId: string;
    recommendation: unknown;
    ingredients: unknown[];
  }) => {
    score: number | null;
    status: { level: string; label: string };
    counts: Record<string, number>;
    matches: Array<{ ingredient: { inciName: string }; productMatchType: string }>;
  };
};

function loadCore(): ProductCheckerCore {
  const context = {
    window: {},
    module: { exports: {} },
    exports: {},
    globalThis: {}
  };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(corePath, "utf8"), context);
  return context.module.exports as ProductCheckerCore;
}

const ingredients = [
  {
    id: 1,
    inciName: "Niacinamide",
    normalizedName: "niacinamide",
    status: "active",
    aliases: [{ aliasName: "Vitamin B3" }],
    benefits: [{ benefitTag: "brightening" }, { benefitTag: "oil_control" }],
    risks: []
  },
  {
    id: 2,
    inciName: "Glycerin",
    normalizedName: "glycerin",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "hydrating" }],
    risks: []
  },
  {
    id: 3,
    inciName: "Panthenol",
    normalizedName: "panthenol",
    status: "active",
    aliases: [{ aliasName: "Provitamin B5" }],
    benefits: [{ benefitTag: "barrier_repair" }, { benefitTag: "soothing" }],
    risks: []
  },
  {
    id: 4,
    inciName: "Fragrance",
    normalizedName: "fragrance",
    status: "active",
    aliases: [{ aliasName: "Parfum" }],
    benefits: [],
    risks: [{ riskTag: "fragrance_risk" }]
  },
  {
    id: 5,
    inciName: "Alcohol Denat",
    normalizedName: "alcohol denat",
    status: "active",
    aliases: [{ aliasName: "Denatured Alcohol" }],
    benefits: [],
    risks: [{ riskTag: "alcohol_denat_risk" }]
  },
  {
    id: 6,
    inciName: "Salicylic Acid",
    normalizedName: "salicylic acid",
    status: "active",
    aliases: [{ aliasName: "BHA" }],
    benefits: [{ benefitTag: "acne_care" }],
    risks: [{ riskTag: "strong_exfoliant_risk" }]
  },
  {
    id: 7,
    inciName: "Ethylhexylglycerin",
    normalizedName: "ethylhexylglycerin",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "basic_support" }],
    risks: []
  }
];

const recommendation = {
  recommended: [{ id: 1, reason: "Niacinamide sesuai rekomendasi utama." }],
  supporting: [{ id: 2, reason: "Glycerin mendukung hidrasi." }],
  useWithCaution: [{ id: 6, reason: "Salicylic Acid perlu dipakai bertahap." }],
  avoidIfSensitive: [
    { id: 4, reason: "Fragrance sebaiknya dihindari pada profil sensitif." },
    { id: 5, reason: "Alcohol Denat berisiko mengeringkan kulit." }
  ]
};

describe("static product checker", () => {
  it("exposes fixed product type options for user selection", () => {
    const core = loadCore();

    expect(core.productTypes.map((type) => type.id)).toEqual(
      expect.arrayContaining(["face_wash", "moisturizer", "serum", "sunscreen", "toner", "acne_treatment"])
    );
  });

  it("marks a moisturizer as matching when OCR text contains recommended and supporting ingredients", () => {
    const core = loadCore();
    const result = core.assessProduct({
      rawText: "Ingredients: Aqua, Niacinamide, Glycerin, Panthenol",
      productTypeId: "moisturizer",
      recommendation,
      ingredients
    });

    expect(result.status.level).toBe("match");
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(result.counts.recommended).toBe(1);
    expect(result.counts.supporting).toBe(1);
    expect(result.matches.map((match) => match.ingredient.inciName)).toEqual(
      expect.arrayContaining(["Niacinamide", "Glycerin", "Panthenol"])
    );
    expect(result.matches.map((match) => match.ingredient.inciName)).not.toContain("Ethylhexylglycerin");
  });

  it("marks a product as avoid when OCR text contains ingredients from the avoid list", () => {
    const core = loadCore();
    const result = core.assessProduct({
      rawText: "Komposisi: Aqua, Parfum, Alcohol Denat, Salicylic Acid",
      productTypeId: "moisturizer",
      recommendation,
      ingredients
    });

    expect(result.status.level).toBe("avoid");
    expect(result.counts.avoid_if_sensitive).toBe(2);
    expect(result.counts.use_with_caution).toBe(1);
  });

  it("requires a recommendation profile before giving compatibility score", () => {
    const core = loadCore();
    const result = core.assessProduct({
      rawText: "Aqua, Glycerin, Panthenol",
      productTypeId: "moisturizer",
      recommendation: null,
      ingredients
    });

    expect(result.score).toBeNull();
    expect(result.status.level).toBe("needs_profile");
  });

  it("wires the product checker section and OCR scripts into the static page", () => {
    const html = fs.readFileSync(indexPath, "utf8");

    expect(html).toContain('id="cek-produk"');
    expect(html).toContain('id="productType"');
    expect(html).toContain("tesseract.js@7.0.0");
    expect(html).toContain("assets/product-checker-core.js");
  });
});
