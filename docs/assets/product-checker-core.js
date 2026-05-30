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

  const productTypeIngredientHints = {
    face_wash: [
      "Glycerin",
      "Cocamidopropyl Betaine",
      "Decyl Glucoside",
      "Sodium Cocoyl Glycinate",
      "Sodium Cocoyl Glutamate",
      "Potassium Cocoyl Glycinate",
      "Sodium Lauroamphoacetate",
      "Citric Acid",
      "Disodium EDTA",
      "Phenoxyethanol",
      "Panthenol"
    ],
    moisturizer: [
      "Glycerin",
      "Panthenol",
      "Niacinamide",
      "Glyceryl Stearate SE",
      "Hydroxypropyltrimonium Hyaluronate",
      "Citric Acid",
      "Disodium EDTA",
      "Phenoxyethanol"
    ],
    serum: ["Niacinamide", "Glycerin", "Panthenol", "Salicylic Acid", "Citric Acid", "Phenoxyethanol"],
    sunscreen: ["Glycerin", "Niacinamide", "Panthenol", "Citric Acid", "Disodium EDTA", "Phenoxyethanol"],
    toner: ["Glycerin", "Niacinamide", "Panthenol", "Citric Acid", "Disodium EDTA", "Phenoxyethanol"],
    exfoliant: ["Salicylic Acid", "Citric Acid", "Glycerin", "Phenoxyethanol"],
    acne_treatment: ["Salicylic Acid", "Niacinamide", "Panthenol", "Glycerin", "Phenoxyethanol"],
    mask: ["Glycerin", "Niacinamide", "Panthenol", "Citric Acid", "Phenoxyethanol"],
    cleansing_oil_balm: ["Glycerin", "Citric Acid", "Disodium EDTA", "Phenoxyethanol"]
  };

  const commonIngredientNames = [
    "Cocamidopropyl Betaine",
    "PEG-400",
    "Decyl Glucoside",
    "Sodium Cocoyl Glycinate",
    "Potassium Cocoyl Glycinate",
    "Sodium Lauroamphoacetate",
    "Sodium Stearoyl Glutamate",
    "Glyceryl Stearate SE",
    "Citric Acid",
    "Lauric Acid",
    "Stearic Acid",
    "Sodium Chloride",
    "Disodium EDTA",
    "Phenoxyethanol",
    "Sodium Cocoyl Glutamate",
    "Juglans Regia Shell Powder",
    "Acrylates Copolymer",
    "Glycol Distearate",
    "Menthol",
    "Cellulose",
    "Hydrated Silica",
    "Polyquaternium-7",
    "Sodium Benzoate",
    "Hydroxyacetophenone",
    "Parfum",
    "Caramel",
    "CI 15985",
    "CI 19140",
    "Hydroxypropyl Methylcellulose",
    "Hydroxypropyltrimonium Hyaluronate"
  ];

  const protectedChemistryWords = new Set([
    "sodium",
    "potassium",
    "calcium",
    "magnesium",
    "ammonium",
    "zinc",
    "aluminum",
    "aluminium",
    "disodium",
    "trisodium",
    "tetrasodium"
  ]);

  function normalizeOcrGlyphs(value) {
    return String(value ?? "")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/([A-Za-z])[\]!1]([A-Za-z])/g, "$1l$2")
      .replace(/([A-Za-z])0([A-Za-z])/g, "$1o$2")
      .replace(/([A-Za-z])5([A-Za-z])/g, "$1s$2")
      .replace(/!/g, "l")
      .replace(/\bbetalne\b/gi, "Betaine")
      .replace(/\bcapryllc\b/gi, "Caprylic")
      .replace(/\bcaprlc\b/gi, "Capric")
      .replace(/\bglycerldes\b/gi, "Glycerides")
      .replace(/\bsorbltol\b/gi, "Sorbitol")
      .replace(/\boll\b/gi, "Oil")
      .replace(/\bdlsodlum\b/gi, "Disodium")
      .replace(/\bsodum\b/gi, "Sodium")
      .replace(/\bgiyceryl\b/gi, "Glyceryl")
      .replace(/\bsodium\s+soot\s+gitamate\b/gi, "Sodium Cocoyl Glutamate")
      .replace(/\bmethyiceiluioss\b/gi, "Methylcellulose")
      .replace(/\bpypropyltrimonium\b/gi, "Hydroxypropyltrimonium")
      .replace(/\b(?:pope\s+)?[cv]lycerin\b/gi, "Glycerin")
      .replace(/\bcocamido\s*-\s*(?:i|l|1)?\s*h?etaine\b/gi, "Cocamidopropyl Betaine")
      .replace(/\bsodium\s+lauroampho(?:copol|copo[il])?(?:\s+\d+\s*r)?\b/gi, "Sodium Lauroamphoacetate")
      .replace(/\bfophenone\b/gi, "Hydroxyacetophenone")
      .replace(/\bsodium\s+rfum\b/gi, "Sodium Benzoate, Parfum")
      .replace(/\bc1\s*15985\b|\bc115985\b/gi, "CI 15985")
      .replace(/\bc1\s*19140\b|\bc119140\b/gi, "CI 19140")
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'");
  }

  function isolateIngredientBlock(rawText) {
    const text = normalizeOcrGlyphs(rawText).replace(/\r/g, "\n");
    const startMatch = text.match(/\b(ingredients?|komposisi|composition|inci)\b\s*[:;-]*/i);
    let block = startMatch ? text.slice(startMatch.index + startMatch[0].length) : text;
    const endMatch = block.match(/\b(directions?|usage|cara\s+pakai|how\s+to\s+use|warnings?|caution|perhatian)\b/i);
    if (endMatch) block = block.slice(0, endMatch.index);
    return block;
  }

  function normalizeIngredientListText(rawText) {
    return isolateIngredientBlock(rawText)
      .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g, "$1$2")
      .replace(/[|]/g, ",")
      .replace(/[•·]/g, ",")
      .replace(/\b(ingredients?|komposisi|composition)\s*[:;-]/gi, "")
      .replace(/\s{2,}/g, " ");
  }

  function cleanName(value) {
    return normalizeOcrGlyphs(value)
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

  function formatIngredientWord(word) {
    const value = String(word ?? "").trim();
    if (!value) return "";
    if (/\d/.test(value)) return value.toUpperCase();
    if (new Set(["AHA", "BHA", "BHT", "EDTA", "PEG", "UV"]).has(value.toUpperCase())) return value.toUpperCase();
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  function formatIngredientToken(token) {
    return String(token ?? "")
      .split(/([/-])/)
      .map((part) => (part === "/" || part === "-" ? part : formatIngredientWord(part)))
      .join("");
  }

  function formatOcrIngredientCandidate(value) {
    return normalizeOcrGlyphs(value)
      .replace(/\b(ingredients?|komposisi|composition)\s*[:;-]?\s*/gi, "")
      .replace(/[^\w\s/.,+-]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^[,.;:\s]+|[,.;:\s]+$/g, "")
      .trim()
      .split(" ")
      .map(formatIngredientToken)
      .join(" ")
      .trim();
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

  function findProductType(productTypeId) {
    return productTypes.find((type) => type.id === productTypeId) ?? null;
  }

  function productTypeHintSet(productType) {
    return new Set((productTypeIngredientHints[productType?.id] ?? []).map(cleanName));
  }

  function ingredientBenefitsAlignWithType(ingredient, productType) {
    if (!productType) return false;
    const expected = new Set(productType.expectedBenefits ?? []);
    return (ingredient.benefits ?? []).some((benefit) => expected.has(benefit.benefitTag));
  }

  function aliasStartsWithCandidate(candidate, alias) {
    if (candidate.length < 4 || alias.length < 6) return false;
    if (alias.startsWith(candidate)) return candidate.length / alias.length >= 0.45;
    return false;
  }

  function productTypeAssistedScore(candidate, alias, ingredient, productType) {
    if (!productType || !aliasStartsWithCandidate(candidate, alias)) return null;
    if (hasProtectedWordConflict(candidate, alias)) return null;

    const aliases = ingredientAliases(ingredient);
    const hints = productTypeHintSet(productType);
    const hinted = aliases.some((item) => hints.has(item));
    const aligned = ingredientBenefitsAlignWithType(ingredient, productType);

    if (!hinted && (candidate.length < 6 || !aligned)) return null;

    const firstAliasWord = alias.split(" ").find((word) => word.startsWith(candidate)) ?? alias;
    const prefixRatio = candidate.length / Math.max(firstAliasWord.length, 1);
    const singleWordBonus = alias.split(" ").length === 1 ? 6 : 0;
    const hintBonus = hinted ? 34 : 0;
    const alignBonus = aligned ? 12 : 0;
    const ratioBonus = Math.round(prefixRatio * 22);

    return 46 + candidate.length * 4 + hintBonus + alignBonus + ratioBonus + singleWordBonus;
  }

  function buildCommonIngredientLibrary(ingredients) {
    const existing = new Set((ingredients ?? []).map((ingredient) => cleanName(ingredient.inciName)));
    return commonIngredientNames
      .filter((name) => !existing.has(cleanName(name)))
      .map((name, index) => ({
        id: `ocr-common-${index}`,
        inciName: name,
        normalizedName: cleanName(name),
        status: "active",
        aliases: [],
        benefits: [],
        risks: []
      }));
  }

  function extractIngredientCandidates(rawText) {
    const cleaned = normalizeIngredientListText(rawText);
    const hasListSeparators = /[,;]/.test(cleaned);
    const splitSource = hasListSeparators ? cleaned.replace(/\n+/g, " ") : cleaned;

    return splitSource
      .split(hasListSeparators ? /[,;]+/ : /[,;\n]+/)
      .map((part) => part.replace(/\([^)]*\)/g, " ").trim())
      .map((part) => ({
        raw: part,
        normalized: cleanName(part)
      }))
      .filter((part) => part.normalized.length >= 3)
      .filter((part) => !isLikelyOcrNoiseCandidate(part));
  }

  function isLikelyOcrNoiseCandidate(part) {
    const words = part.normalized.split(" ").filter(Boolean);
    if (words.length <= 1) return false;
    if (words[0] === "ci" && words.some((word) => /\d/.test(word))) return false;
    if (words.some((word) => new Set(["aha", "bha", "bht", "ci", "edta", "peg", "uv"]).has(word))) return false;

    const shortAlphaCount = words.filter((word) => /^[a-z]{1,2}$/.test(word)).length;
    const allTiny = words.every((word) => word.length <= 3 || /^\d+$/.test(word));
    const hasCosmeticLengthWord = words.some((word) => word.length >= 5);

    if (words.length >= 3 && allTiny) return true;
    return words.length >= 3 && shortAlphaCount >= 2 && !hasCosmeticLengthWord;
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
    const current = Array.from({ length: b.length + 1 }, () => 0);

    for (let i = 1; i <= a.length; i += 1) {
      current[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      }
      for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
    }

    return previous[b.length];
  }

  function lastWord(value) {
    const words = value.split(" ").filter(Boolean);
    return words[words.length - 1] ?? "";
  }

  function isFuzzyAliasMatch(candidate, alias) {
    if (candidate.length < 6 || alias.length < 8) return false;
    if (hasProtectedWordConflict(candidate, alias)) return false;
    const candidateWords = candidate.split(" ").filter(Boolean);
    const aliasWords = alias.split(" ").filter(Boolean);
    if (candidateWords.length === 1 && aliasWords.length === 1 && Math.max(candidate.length, alias.length) < 10) return false;
    const maxLength = Math.max(candidate.length, alias.length);
    const distance = levenshtein(candidate, alias);
    const ratio = distance / maxLength;
    const sameLead = candidate[0] === alias[0];
    const sharedTail = lastWord(candidate).length >= 8 && lastWord(candidate) === lastWord(alias);
    const threshold = sharedTail ? 0.24 : maxLength >= 20 ? 0.17 : 0.14;

    return ratio <= threshold && (sameLead || sharedTail);
  }

  function candidateVariants(normalized) {
    const words = normalized.split(" ").filter(Boolean);
    const variants = new Set([normalized]);
    const maxWindow = Math.min(5, words.length);

    for (let size = 1; size <= maxWindow; size += 1) {
      for (let start = 0; start <= words.length - size; start += 1) {
        const value = words.slice(start, start + size).join(" ");
        if (value.length >= 3) variants.add(value);
      }
    }

    return [...variants].sort((a, b) => b.length - a.length);
  }

  function protectedWords(value) {
    return String(value ?? "")
      .split(" ")
      .filter((word) => protectedChemistryWords.has(word));
  }

  function hasProtectedWordConflict(candidate, alias) {
    const candidateWords = protectedWords(candidate);
    const aliasWords = protectedWords(alias);
    if (!candidateWords.length || !aliasWords.length) return false;
    return candidateWords.some((candidateWord) => aliasWords.some((aliasWord) => aliasWord !== candidateWord));
  }

  function applyProductTypeAssistedMatches(matches, candidates, ingredients, productType) {
    if (!productType) return;

    for (const candidate of candidates) {
      const suggestionsByIngredient = new Map();

      for (const candidateValue of candidateVariants(candidate.normalized)) {
        if (candidateValue.length < 4 || candidateValue.length > 12) continue;

        for (const ingredient of ingredients.filter((item) => item.status !== "inactive")) {
          if (matches.has(ingredient.id)) continue;

          for (const alias of ingredientAliases(ingredient)) {
            const score = productTypeAssistedScore(candidateValue, alias, ingredient, productType);
            if (score === null) continue;

            const current = suggestionsByIngredient.get(ingredient.id);
            if (!current || score > current.score) {
              suggestionsByIngredient.set(ingredient.id, {
                ingredient,
                matchedText: candidate.raw || ingredient.inciName,
                matchedAlias: alias,
                confidence: "product_type_hint",
                score
              });
            }
          }
        }
      }

      const suggestions = [...suggestionsByIngredient.values()].sort((a, b) => b.score - a.score);
      const best = suggestions[0];
      const second = suggestions[1];
      if (!best || best.score < 92) continue;
      if (second && best.score - second.score < 14) continue;

      matches.set(best.ingredient.id, best);
    }
  }

  function matchKnownIngredients(rawText, ingredients, options = {}) {
    const candidates = extractIngredientCandidates(rawText);
    const normalizedFullText = cleanName(normalizeIngredientListText(rawText));
    const matches = new Map();
    const productType = findProductType(options.productTypeId);

    for (const ingredient of ingredients.filter((item) => item.status !== "inactive")) {
      const aliases = ingredientAliases(ingredient);
      let best = null;

      for (const alias of aliases) {
        for (const candidate of candidates) {
          const variant = candidateVariants(candidate.normalized).find((candidateValue) => {
            const exact = candidateValue === alias;
            const contains = candidateValue.length >= 4 && alias.length >= 4 && candidateValue.includes(alias);
            const fuzzy = !exact && !contains && isFuzzyAliasMatch(candidateValue, alias);
            return exact || contains || fuzzy;
          });

          if (variant) {
            best = {
              ingredient,
              matchedText: candidate.raw || ingredient.inciName,
              matchedAlias: alias,
              confidence: variant === alias ? "exact" : variant.includes(alias) ? "partial" : "fuzzy"
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

    applyProductTypeAssistedMatches(matches, candidates, ingredients, productType);

    return {
      candidates,
      matches: [...matches.values()].sort((a, b) => a.ingredient.inciName.localeCompare(b.ingredient.inciName))
    };
  }

  function findMatchForCandidate(candidate, matches) {
    const variants = candidateVariants(candidate.normalized);
    return matches
      .filter((match) => {
        const matchedText = cleanName(match.matchedText);
        if (matchedText && matchedText === candidate.normalized) return true;
        if (variants.includes(match.matchedAlias)) return true;
        if (candidate.normalized.length >= 4 && candidate.normalized.includes(match.matchedAlias)) return true;
        if (match.confidence === "product_type_hint" && match.matchedText === candidate.raw) return true;
        return false;
      })
      .sort((a, b) => b.matchedAlias.length - a.matchedAlias.length)[0];
  }

  function displayNameForCandidate(candidate, match) {
    const formattedRaw = formatOcrIngredientCandidate(candidate.raw);
    if (
      formattedRaw &&
      cleanName(formattedRaw) === match.matchedAlias &&
      cleanName(formattedRaw) !== cleanName(match.ingredient.inciName)
    ) {
      return formattedRaw;
    }
    return match.ingredient.inciName;
  }

  function dedupeDisplayNames(names) {
    const seen = new Set();
    const result = [];
    for (const name of names.map((item) => String(item ?? "").trim()).filter(Boolean)) {
      const key = cleanName(name);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(name);
    }
    return result;
  }

  function rewriteIngredientText(rawText, ingredients, options = {}) {
    const searchableIngredients = [...(ingredients ?? []), ...buildCommonIngredientLibrary(ingredients ?? [])];
    const { candidates, matches } = matchKnownIngredients(rawText, searchableIngredients, options);
    const knownNames = dedupeContainedNames([...new Set(matches.map((match) => match.ingredient.inciName))]);
    const rewrittenItems = dedupeDisplayNames(
      candidates.map((candidate) => {
        const match = findMatchForCandidate(candidate, matches);
        return match ? displayNameForCandidate(candidate, match) : formatOcrIngredientCandidate(candidate.raw);
      })
    );
    const unknownNames = rewrittenItems.filter((name) => !knownNames.some((knownName) => cleanName(knownName) === cleanName(name)));
    const rewrittenText = rewrittenItems.length ? rewrittenItems.join(", ") : "";

    return {
      rewrittenText,
      knownNames,
      unknownNames,
      rewrittenItems,
      candidates,
      matches
    };
  }

  function dedupeContainedNames(names) {
    return names.filter((name) => {
      const normalized = cleanName(name);
      return !names.some((other) => {
        const otherNormalized = cleanName(other);
        return other !== name && otherNormalized.length > normalized.length && otherNormalized.includes(normalized);
      });
    });
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
    const productType = findProductType(params.productTypeId) ?? productTypes[0];
    const recommendationMap = flattenRecommendation(params.recommendation);
    const { candidates, matches } = matchKnownIngredients(rawText, params.ingredients ?? [], { productTypeId: productType.id });
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
    rewriteIngredientText,
    assessProduct,
    titleize
  };
});
