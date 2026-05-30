(function attachProductCheckerCore(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.ProductCheckerCore = api;
})(typeof window !== "undefined" ? window : globalThis, function createProductCheckerCore() {
  const productTypes = [
    {
      id: "face_wash",
      label: "Face Wash / Cleanser",
      expectedBenefits: ["basic_support", "oil_control", "soothing", "hydrating"],
      cautionTags: ["fragrance_risk", "essential_oil_risk", "strong_exfoliant_risk"]
    },
    {
      id: "moisturizer",
      label: "Moisturizer",
      expectedBenefits: ["hydrating", "barrier_repair", "soothing", "basic_support"],
      cautionTags: ["fragrance_risk", "essential_oil_risk", "alcohol_denat_risk"]
    },
    {
      id: "serum",
      label: "Serum",
      expectedBenefits: ["brightening", "acne_care", "hydrating", "barrier_repair", "soothing"],
      cautionTags: ["strong_exfoliant_risk", "fragrance_risk", "essential_oil_risk"]
    },
    {
      id: "sunscreen",
      label: "Sunscreen",
      expectedBenefits: ["basic_support", "soothing", "hydrating", "barrier_repair"],
      cautionTags: ["fragrance_risk", "essential_oil_risk", "alcohol_denat_risk"]
    },
    {
      id: "toner",
      label: "Toner",
      expectedBenefits: ["hydrating", "soothing", "brightening", "basic_support"],
      cautionTags: ["strong_exfoliant_risk", "fragrance_risk", "alcohol_denat_risk"]
    },
    {
      id: "exfoliant",
      label: "Exfoliant",
      expectedBenefits: ["brightening", "acne_care"],
      cautionTags: ["strong_exfoliant_risk", "barrier_caution", "dryness_irritation_risk"]
    },
    {
      id: "acne_treatment",
      label: "Acne Treatment",
      expectedBenefits: ["acne_care", "oil_control", "soothing", "barrier_repair"],
      cautionTags: ["strong_exfoliant_risk", "dryness_irritation_risk", "fragrance_risk"]
    },
    {
      id: "mask",
      label: "Mask",
      expectedBenefits: ["hydrating", "soothing", "brightening", "basic_support"],
      cautionTags: ["fragrance_risk", "essential_oil_risk", "strong_exfoliant_risk"]
    },
    {
      id: "cleansing_oil_balm",
      label: "Cleansing Oil / Balm",
      expectedBenefits: ["basic_support", "soothing"],
      cautionTags: ["fragrance_risk", "essential_oil_risk"]
    }
  ];

  function cleanName(value) {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\b(ingredients?|komposisi|composition|mengandung|contains?|inci|list|daftar)\b/g, " ")
      .replace(/\b(aqua\/water)\b/g, "aqua water")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function titleize(value) {
    return String(value ?? "-").replaceAll("_", " ");
  }

  function ingredientAliases(ingredient) {
    const aliases = [
      ingredient.inciName,
      ingredient.normalizedName,
      ingredient.aliasPrimary,
      ...(ingredient.aliases ?? []).map((alias) => alias.aliasName)
    ];
    return [...new Set(aliases.map(cleanName).filter((alias) => alias.length >= 3))].sort((a, b) => b.length - a.length);
  }

  function extractIngredientCandidates(rawText) {
    const cleaned = String(rawText ?? "")
      .replace(/\r/g, "\n")
      .replace(/[|]/g, ",")
      .replace(/[•·]/g, ",")
      .replace(/\b(ingredients?|komposisi|composition)\s*[:;-]/gi, "")
      .replace(/\s{2,}/g, " ");

    return cleaned
      .split(/[,;\n]+/)
      .map((part) => part.replace(/\([^)]*\)/g, " ").trim())
      .map((part) => ({
        raw: part,
        normalized: cleanName(part)
      }))
      .filter((part) => part.normalized.length >= 3);
  }

  function matchKnownIngredients(rawText, ingredients) {
    const candidates = extractIngredientCandidates(rawText);
    const normalizedFullText = cleanName(rawText);
    const matches = new Map();

    for (const ingredient of ingredients.filter((item) => item.status !== "inactive")) {
      const aliases = ingredientAliases(ingredient);
      let best = null;

      for (const alias of aliases) {
        for (const candidate of candidates) {
          const exact = candidate.normalized === alias;
          const contains =
            candidate.normalized.length >= 4 &&
            alias.length >= 4 &&
            candidate.normalized.includes(alias);

          if (exact || contains) {
            best = {
              ingredient,
              matchedText: candidate.raw || ingredient.inciName,
              matchedAlias: alias,
              confidence: exact ? "exact" : "partial"
            };
            break;
          }
        }

        if (best) break;

        if (alias.length >= 5 && normalizedFullText.includes(alias)) {
          best = {
            ingredient,
            matchedText: ingredient.inciName,
            matchedAlias: alias,
            confidence: "text_scan"
          };
          break;
        }
      }

      if (best) matches.set(ingredient.id, best);
    }

    return {
      candidates,
      matches: [...matches.values()].sort((a, b) => a.ingredient.inciName.localeCompare(b.ingredient.inciName))
    };
  }

  function flattenRecommendation(recommendation) {
    if (!recommendation) return new Map();

    const groups = [
      ["recommended", recommendation.recommended ?? []],
      ["supporting", recommendation.supporting ?? []],
      ["use_with_caution", recommendation.useWithCaution ?? []],
      ["avoid_if_sensitive", recommendation.avoidIfSensitive ?? []]
    ];
    const flattened = new Map();

    for (const [type, items] of groups) {
      for (const item of items) {
        flattened.set(item.id, {
          ...item,
          productMatchType: type
        });
      }
    }

    return flattened;
  }

  function classifyMatch(match, recommendationMap) {
    const recommendation = recommendationMap.get(match.ingredient.id);
    if (!recommendation) {
      return {
        ...match,
        productMatchType: "known",
        productMatchLabel: "Terbaca di knowledge base",
        scoreImpact: 1,
        recommendation: null
      };
    }

    if (recommendation.productMatchType === "recommended") {
      return {
        ...match,
        productMatchType: "recommended",
        productMatchLabel: "Sesuai rekomendasi utama",
        scoreImpact: 11,
        recommendation
      };
    }

    if (recommendation.productMatchType === "supporting") {
      return {
        ...match,
        productMatchType: "supporting",
        productMatchLabel: "Mendukung profil kulit",
        scoreImpact: 7,
        recommendation
      };
    }

    if (recommendation.productMatchType === "use_with_caution") {
      return {
        ...match,
        productMatchType: "use_with_caution",
        productMatchLabel: "Perlu kehati-hatian",
        scoreImpact: -11,
        recommendation
      };
    }

    return {
      ...match,
      productMatchType: "avoid_if_sensitive",
      productMatchLabel: "Sebaiknya dihindari",
      scoreImpact: -20,
      recommendation
    };
  }

  function countByType(matches) {
    return matches.reduce(
      (acc, match) => {
        acc[match.productMatchType] = (acc[match.productMatchType] ?? 0) + 1;
        return acc;
      },
      {
        recommended: 0,
        supporting: 0,
        use_with_caution: 0,
        avoid_if_sensitive: 0,
        known: 0
      }
    );
  }

  function categoryFitScore(matches, productType) {
    if (!productType) return 0;
    const expected = new Set(productType.expectedBenefits);
    const caution = new Set(productType.cautionTags);

    let aligned = 0;
    let categoryRisk = 0;

    for (const match of matches) {
      const benefits = match.ingredient.benefits ?? [];
      const risks = match.ingredient.risks ?? [];
      if (benefits.some((benefit) => expected.has(benefit.benefitTag))) aligned += 1;
      if (risks.some((risk) => caution.has(risk.riskTag))) categoryRisk += 1;
    }

    return Math.min(10, aligned * 3) - Math.min(12, categoryRisk * 4);
  }

  function statusFromScore(score, counts, hasRecommendation) {
    if (!hasRecommendation) {
      return {
        level: "needs_profile",
        label: "Profil belum siap",
        message: "Jalankan rekomendasi profil kulit dulu agar produk bisa dibandingkan dengan hasil sistem."
      };
    }

    if (counts.avoid_if_sensitive > 0 && score < 72) {
      return {
        level: "avoid",
        label: "Sebaiknya dihindari",
        message: "Produk memuat kandungan yang masuk daftar hindari untuk profil kulit saat ini."
      };
    }

    if (score >= 75 && counts.avoid_if_sensitive === 0) {
      return {
        level: "match",
        label: "Sesuai",
        message: "Produk memiliki kandungan yang cukup selaras dengan rekomendasi sistem."
      };
    }

    if (score >= 55) {
      return {
        level: "caution",
        label: "Cukup sesuai",
        message: "Produk masih bisa dipertimbangkan, tetapi ada bagian yang perlu diperhatikan."
      };
    }

    return {
      level: "avoid",
      label: "Sebaiknya dihindari",
      message: "Komposisi produk kurang selaras dengan kebutuhan atau risiko profil kulit saat ini."
    };
  }

  function assessProduct(params) {
    const rawText = params.rawText ?? "";
    const productType = productTypes.find((type) => type.id === params.productTypeId) ?? productTypes[0];
    const recommendationMap = flattenRecommendation(params.recommendation);
    const { candidates, matches } = matchKnownIngredients(rawText, params.ingredients ?? []);
    const classified = matches.map((match) => classifyMatch(match, recommendationMap));
    const counts = countByType(classified);
    const hasRecommendation = recommendationMap.size > 0;

    if (classified.length === 0) {
      return {
        productType,
        score: hasRecommendation ? 35 : null,
        status: {
          level: hasRecommendation ? "unknown" : "needs_profile",
          label: hasRecommendation ? "Belum cukup data" : "Profil belum siap",
          message: hasRecommendation
            ? "OCR berhasil, tetapi ingredient yang terbaca belum cocok dengan knowledge base."
            : "Jalankan rekomendasi profil kulit dulu agar produk bisa dibandingkan dengan hasil sistem."
        },
        counts,
        candidates,
        matches: classified,
        knownCoverage: 0,
        extractedCount: candidates.length
      };
    }

    const impact = classified.reduce((sum, match) => sum + match.scoreImpact, 0);
    const fit = categoryFitScore(classified, productType);
    const coverageBonus = Math.min(8, classified.length * 1.5);
    const lowCoveragePenalty = classified.length < 2 ? 12 : 0;
    const rawScore = 52 + impact + fit + coverageBonus - lowCoveragePenalty;
    const score = Math.max(0, Math.min(100, Math.round(rawScore)));
    const knownCoverage = candidates.length === 0 ? 0 : Math.round((classified.length / candidates.length) * 100);

    return {
      productType,
      score: hasRecommendation ? score : null,
      status: statusFromScore(score, counts, hasRecommendation),
      counts,
      candidates,
      matches: classified,
      knownCoverage,
      extractedCount: candidates.length
    };
  }

  return {
    productTypes,
    cleanName,
    extractIngredientCandidates,
    matchKnownIngredients,
    assessProduct,
    titleize
  };
});
