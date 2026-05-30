import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { describe, expect, it } from "vitest";

const projectRoot = path.resolve(process.cwd(), "..");
const corePath = path.join(projectRoot, "docs", "assets", "product-checker-core.js");
const appPath = path.join(projectRoot, "docs", "assets", "app.js");
const indexPath = path.join(projectRoot, "docs", "index.html");
const stylesPath = path.join(projectRoot, "docs", "assets", "styles.css");

type ProductCheckerCore = {
  productTypes: Array<{ id: string; label: string }>;
  rewriteIngredientText: (
    rawText: string,
    ingredients: unknown[],
    options?: { productTypeId?: string }
  ) => {
    rewrittenText: string;
    knownNames: string[];
    unknownNames: string[];
    rewrittenItems: string[];
    matches: Array<{ ingredient: { inciName: string }; confidence: string }>;
  };
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
  },
  {
    id: 8,
    inciName: "Cocamidopropyl Betaine",
    normalizedName: "cocamidopropyl betaine",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "basic_support" }],
    risks: []
  },
  {
    id: 9,
    inciName: "Sodium Stearoyl Glutamate",
    normalizedName: "sodium stearoyl glutamate",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "basic_support" }],
    risks: []
  },
  {
    id: 10,
    inciName: "Glyceryl Stearate SE",
    normalizedName: "glyceryl stearate se",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "basic_support" }],
    risks: []
  },
  {
    id: 11,
    inciName: "Citric Acid",
    normalizedName: "citric acid",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "basic_support" }],
    risks: []
  },
  {
    id: 12,
    inciName: "Phenoxyethanol",
    normalizedName: "phenoxyethanol",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "basic_support" }],
    risks: []
  },
  {
    id: 13,
    inciName: "Hydroxypropyltrimonium Hyaluronate",
    normalizedName: "hydroxypropyltrimonium hyaluronate",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "hydrating" }],
    risks: []
  },
  {
    id: 14,
    inciName: "Aqua",
    normalizedName: "aqua",
    status: "active",
    aliases: [{ aliasName: "Water" }],
    benefits: [{ benefitTag: "basic_support" }],
    risks: []
  },
  {
    id: 15,
    inciName: "Betaine",
    normalizedName: "betaine",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "hydrating" }],
    risks: []
  },
  {
    id: 16,
    inciName: "Butylene Glycol",
    normalizedName: "butylene glycol",
    status: "active",
    aliases: [],
    benefits: [{ benefitTag: "hydrating" }],
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

  it("rewrites noisy OCR text into known ingredient names before matching", () => {
    const core = loadCore();
    const noisyText = [
      "oe eli] Cocamidopropy! Betaine, PEG-400, Decyl Glucoside, Pot Eaoe",
      "Sycinate, Sodum Stearoy! Glutamate, Giycery! Stearate Sz. Citric Acid",
      "Disodium Cf rr Phenoxyethanol, eg ro Sodium Soot Gitamate,",
      "Disodium Hydroxypropyl Methyiceiluioss, PYPrOpYtrimonium Hyaluronate"
    ].join("\n");

    const rewrite = core.rewriteIngredientText(noisyText, ingredients);

    expect(rewrite.knownNames).toEqual(
      expect.arrayContaining([
        "Cocamidopropyl Betaine",
        "Sodium Stearoyl Glutamate",
        "Glyceryl Stearate SE",
        "Phenoxyethanol",
        "Hydroxypropyltrimonium Hyaluronate"
      ])
    );
    expect(rewrite.rewrittenText).toContain("Cocamidopropyl Betaine");
    expect(rewrite.rewrittenText).not.toContain("Cocamidopropy!");
  });

  it("uses product-type hints only when the OCR fragment is close enough", () => {
    const core = loadCore();

    const rewrite = core.rewriteIngredientText("Ingredients: Aqua, glyc", ingredients, { productTypeId: "face_wash" });

    expect(rewrite.knownNames).toContain("Glycerin");
    expect(rewrite.rewrittenText).toBe("Aqua, Glycerin");
    expect(rewrite.matches.find((match) => match.ingredient.inciName === "Glycerin")?.confidence).toBe("product_type_hint");
  });

  it("does not promote weak OCR fragments even when product type has a likely ingredient", () => {
    const core = loadCore();

    const rewrite = core.rewriteIngredientText("Ingredients: Aqua, gly, acid", ingredients, { productTypeId: "face_wash" });

    expect(rewrite.knownNames).not.toContain("Glycerin");
    expect(rewrite.knownNames).not.toContain("Citric Acid");
    expect(rewrite.rewrittenText).toContain("Gly");
  });

  it("keeps all readable OCR ingredients in the rewritten text, not only database matches", () => {
    const core = loadCore();
    const labelText = [
      "AQUA, PEG-6 CAPRYLIC/CAPRIC GLYCERIDES,",
      "PROPYLENE GLYCOL, PRUNUS SPECIOSA",
      "FLOWER EXTRACT, BETAINE, SORBITOL,",
      "BUTYLENE GLYCOL, PEG-40 HYDROGENATED",
      "CASTOR OIL, POLOXAMER 407, BHT, DISODIUM",
      "EDTA, CHLORPHENESIN, POLYAMINOPROPYL",
      "BIGUANIDE"
    ].join("\n");

    const rewrite = core.rewriteIngredientText(labelText, ingredients, { productTypeId: "face_wash" });

    expect(rewrite.knownNames).toEqual(expect.arrayContaining(["Aqua", "Betaine", "Butylene Glycol"]));
    expect(rewrite.unknownNames).toEqual(
      expect.arrayContaining([
        "PEG-6 Caprylic/Capric Glycerides",
        "Propylene Glycol",
        "Prunus Speciosa Flower Extract",
        "Sorbitol",
        "PEG-40 Hydrogenated Castor Oil",
        "Poloxamer 407",
        "BHT",
        "Chlorphenesin",
        "Polyaminopropyl Biguanide"
      ])
    );
    expect(rewrite.rewrittenText).toContain("PEG-6 Caprylic/Capric Glycerides");
    expect(rewrite.rewrittenText).toContain("Disodium EDTA");
    expect(rewrite.rewrittenText).toContain("Polyaminopropyl Biguanide");
  });

  it("isolates the ingredient block, joins hyphenated line breaks, and avoids unsafe mineral swaps", () => {
    const core = loadCore();
    const labelText = [
      "EXFOLIATING SCRUB FACIAL WASH",
      "INGREDIENTS",
      "AQUA, GLYCERIN, SODIUM COCOYL GLYCINATE, COCAMIDO-",
      "PROPYL BETAINE, SODIUM CHLORIDE, SODIUM LAUROAMPHO-",
      "ACETATE, ACRYLATES COPOLYMER, PANTHENOL, MENTHOL,",
      "CITRIC ACID, CELLULOSE, HYDRATED SILICA, POLYQUATERNIUM-7,",
      "ETHYLHEXYLGLYCERIN, DISODIUM EDTA, PHENOXYETHANOL, SODIUM BENZOATE",
      "DIRECTIONS",
      "Use on wet face, rinse thoroughly."
    ].join("\n");

    const rewrite = core.rewriteIngredientText(labelText, ingredients, { productTypeId: "face_wash" });

    expect(rewrite.rewrittenText).not.toContain("Facial Wash");
    expect(rewrite.rewrittenText).not.toContain("Directions");
    expect(rewrite.rewrittenText).toContain("Sodium Cocoyl Glycinate");
    expect(rewrite.rewrittenText).toContain("Cocamidopropyl Betaine");
    expect(rewrite.rewrittenText).toContain("Sodium Lauroamphoacetate");
    expect(rewrite.rewrittenText).not.toContain("Potassium Cocoyl Glycinate");
  });

  it("recovers common face wash ingredients from damaged OCR fragments without keeping short noise", () => {
    const core = loadCore();
    const latestOcrText = [
      "Re I Es 0, Pe Ts Ers Tet, Te Prev Y Pope Clycerin, Sodium Cocoyl Glycinate,",
      "Cocamido- I Hetaine, Sodium Chloride, Sodium Lauroamphocopol 7198 R,",
      "Glycol Distearate, Panthenol, Cellulose, Hydrated Silica, Ethylhexylglycerin,",
      "Disodium EDTA, Fophenone, Phenoxyethanol, Sodium Rfum, Caramel, C115985, CI 19140"
    ].join(" ");

    const rewrite = core.rewriteIngredientText(latestOcrText, ingredients, { productTypeId: "face_wash" });

    expect(rewrite.rewrittenText).toContain("Glycerin");
    expect(rewrite.rewrittenText).toContain("Cocamidopropyl Betaine");
    expect(rewrite.rewrittenText).toContain("Sodium Lauroamphoacetate");
    expect(rewrite.rewrittenText).toContain("Hydroxyacetophenone");
    expect(rewrite.rewrittenText).toContain("Sodium Benzoate");
    expect(rewrite.rewrittenText).toContain("Parfum");
    expect(rewrite.rewrittenText).toContain("CI 15985");
    expect(rewrite.rewrittenText).not.toContain("Re I Es");
    expect(rewrite.rewrittenText).not.toContain("Pe Ts Ers");
    expect(rewrite.rewrittenText).not.toContain("Fophenone");
    expect(rewrite.rewrittenText).not.toContain("Sodium Rfum");
    expect(rewrite.rewrittenText).not.toContain("C115985");
  });

  it("does not fall back to random OCR noise when no ingredient candidate is readable", () => {
    const core = loadCore();

    const rewrite = core.rewriteIngredientText("rrr xqz 12 oo aa", ingredients, { productTypeId: "face_wash" });

    expect(rewrite.rewrittenItems).toEqual([]);
    expect(rewrite.rewrittenText).toBe("");
  });

  it("wires the product checker section and OCR scripts into the static page", () => {
    const html = fs.readFileSync(indexPath, "utf8");
    const appScript = fs.readFileSync(appPath, "utf8");
    const styles = fs.readFileSync(stylesPath, "utf8");

    expect(html).toContain('id="cek-produk"');
    expect(html).toContain('class="apple-polished"');
    expect(html).toContain('class="hero-panel hero-showcase"');
    expect(html).toContain('id="productType"');
    expect(html).toContain('id="productCropBox"');
    expect(html).toContain('id="rotateLeftButton"');
    expect(html).toContain('id="rotateRightButton"');
    expect(html).toContain(">Atur crop</button>");
    expect(html).toContain("tesseract.js@7.0.0");
    expect(html).toContain("assets/product-checker-core.js");
    expect(appScript).toContain("ImageCapture");
    expect(appScript).toContain("waitForCameraFrame");
    expect(appScript).toContain("captureVisibleCameraFrame");
    expect(appScript).toContain("const visibleFrameSource = await captureVisibleCameraFrame(camera, canvas)");
    expect(appScript).toContain("stopProductCamera();\n      await setProductImageForCrop(capturedSource);");
    expect(appScript).toContain("let productCropModeActive = false");
    expect(appScript).toContain("if (!productCropModeActive) {\n      layer.hidden = true;");
    expect(appScript).toContain("Mode crop aktif");
    expect(appScript).toContain("rotateProductImage");
    expect(appScript).toContain("context.rotate(direction * Math.PI / 2)");
    expect(appScript).toContain('$("#rotateLeftButton").addEventListener("click", () => rotateProductImage(-1))');
    expect(appScript).toContain('$("#rotateRightButton").addEventListener("click", () => rotateProductImage(1))');
    expect(appScript).toContain('productTypeId: $("#productType").value');
    expect(appScript).toContain("ingredient ditulis ulang");
    expect(appScript).toContain("belum menemukan teks ingredient yang jelas");
    expect(appScript).toContain("tessedit_pageseg_mode");
    expect(styles).toContain("[hidden]");
    expect(styles).toContain("display: none !important");
    expect(styles).toContain("--page-bg: #f5f5f7");
    expect(styles).toContain("saturate(180%) blur(22px)");
    expect(styles).toContain("font-size: 6rem");
    expect(styles).toContain(".hero-showcase");
    expect(styles).toContain("@media (max-width: 720px)");
  });
});
