import fuzzySeed from "../../data/processed/fuzzy_rules_seed.json";
import routineTemplates from "../../data/processed/routine_templates.json";
import type {
  FuzzyRuleRecord,
  IngredientRecord,
  RoutineTemplate,
  SkinConditionRecord,
  SkinTypeRecord
} from "@/lib/types";

export const skinTypes: SkinTypeRecord[] = [
  {
    name: "berminyak",
    oilinessDefault: 8,
    drynessDefault: 2,
    sensitivityDefault: 4,
    barrierDamageDefault: 3
  },
  {
    name: "kering",
    oilinessDefault: 2,
    drynessDefault: 8,
    sensitivityDefault: 5,
    barrierDamageDefault: 5
  },
  {
    name: "sensitif",
    oilinessDefault: 4,
    drynessDefault: 5,
    sensitivityDefault: 9,
    barrierDamageDefault: 6
  }
];

export const skinConditions: SkinConditionRecord[] = [
  {
    name: "jerawat",
    acneLevel: 8,
    dullnessLevel: 2,
    rednessLevel: 4,
    barrierDamageLevel: 3,
    drynessLevel: 2,
    oilinessLevel: 6
  },
  {
    name: "komedo",
    acneLevel: 6,
    dullnessLevel: 2,
    rednessLevel: 2,
    barrierDamageLevel: 2,
    drynessLevel: 1,
    oilinessLevel: 7
  },
  {
    name: "dehidrasi",
    acneLevel: 1,
    dullnessLevel: 4,
    rednessLevel: 3,
    barrierDamageLevel: 5,
    drynessLevel: 8,
    oilinessLevel: 2
  },
  {
    name: "skin_barrier_terganggu",
    acneLevel: 2,
    dullnessLevel: 3,
    rednessLevel: 6,
    barrierDamageLevel: 9,
    drynessLevel: 7,
    oilinessLevel: 3
  },
  {
    name: "kemerahan",
    acneLevel: 2,
    dullnessLevel: 2,
    rednessLevel: 8,
    barrierDamageLevel: 6,
    drynessLevel: 4,
    oilinessLevel: 3
  }
];

export const rules: FuzzyRuleRecord[] = fuzzySeed.map((rule) => ({
  ruleCode: rule.code,
  antecedentJson: JSON.stringify(rule.if),
  consequentJson: JSON.stringify(rule.then),
  description: rule.description
}));

export const routines = routineTemplates as RoutineTemplate[];

export const ingredients: IngredientRecord[] = [
  {
    id: 1,
    inciName: "Niacinamide",
    normalizedName: "niacinamide",
    ingredientGroup: "active",
    cosmeticFunction: "skin conditioning",
    benefits: [
      { benefitTag: "oil_control", strengthScore: 8 },
      { benefitTag: "brightening", strengthScore: 7 },
      { benefitTag: "barrier_repair", strengthScore: 6 }
    ],
    risks: []
  },
  {
    id: 2,
    inciName: "Glycerin",
    normalizedName: "glycerin",
    ingredientGroup: "humectant",
    cosmeticFunction: "humectant",
    benefits: [{ benefitTag: "hydrating", strengthScore: 9 }],
    risks: []
  },
  {
    id: 3,
    inciName: "Panthenol",
    normalizedName: "panthenol",
    ingredientGroup: "barrier_support",
    cosmeticFunction: "skin conditioning",
    benefits: [
      { benefitTag: "hydrating", strengthScore: 7 },
      { benefitTag: "soothing", strengthScore: 8 },
      { benefitTag: "barrier_repair", strengthScore: 8 }
    ],
    risks: []
  },
  {
    id: 4,
    inciName: "Centella Asiatica Extract",
    normalizedName: "centella asiatica extract",
    ingredientGroup: "soothing_agent",
    cosmeticFunction: "skin conditioning",
    benefits: [
      { benefitTag: "soothing", strengthScore: 8 },
      { benefitTag: "barrier_repair", strengthScore: 6 }
    ],
    risks: []
  },
  {
    id: 5,
    inciName: "Fragrance",
    normalizedName: "fragrance",
    ingredientGroup: "fragrance",
    cosmeticFunction: "perfuming",
    benefits: [],
    risks: [{ riskTag: "fragrance_risk", riskScore: 8, riskCondition: "sensitive_skin" }]
  },
  {
    id: 6,
    inciName: "Glycolic Acid",
    normalizedName: "glycolic acid",
    ingredientGroup: "exfoliant",
    cosmeticFunction: "exfoliant",
    benefits: [
      { benefitTag: "exfoliating", strengthScore: 8 },
      { benefitTag: "brightening", strengthScore: 6 }
    ],
    risks: [
      { riskTag: "strong_exfoliant_risk", riskScore: 9, riskCondition: "sensitive_or_barrier_damage" },
      { riskTag: "barrier_caution", riskScore: 9, riskCondition: "barrier_damage" }
    ]
  }
];
