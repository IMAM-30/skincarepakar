export type FuzzyInputKey =
  | "oiliness"
  | "dryness"
  | "acne"
  | "sensitivity"
  | "barrier_damage"
  | "dullness";

export type FuzzyLabel = "low" | "medium" | "high";

export type FuzzyOutputKey =
  | "oil_control_need"
  | "hydration_need"
  | "acne_care_need"
  | "barrier_repair_need"
  | "soothing_need"
  | "brightening_need"
  | "exfoliation_caution"
  | "irritation_risk";

export type FuzzyScores = Record<FuzzyInputKey, number>;
export type FuzzyOutputs = Record<FuzzyOutputKey, number>;

export type SensitivityLevel = "rendah" | "sedang" | "tinggi";

export type RecommendationType =
  | "recommended"
  | "supporting"
  | "use_with_caution"
  | "avoid_if_sensitive";

export type RecommendationRequest = {
  skinType: string;
  conditions: string[];
  sensitivityLevel: SensitivityLevel;
  goals: string[];
  avoidPreferences: string[];
};

export type SkinTypeRecord = {
  name: string;
  oilinessDefault: number;
  drynessDefault: number;
  sensitivityDefault: number;
  barrierDamageDefault: number;
  description?: string | null;
};

export type SkinConditionRecord = {
  name: string;
  acneLevel: number;
  dullnessLevel: number;
  rednessLevel: number;
  barrierDamageLevel: number;
  drynessLevel: number;
  oilinessLevel: number;
  description?: string | null;
};

export type FuzzyRuleRecord = {
  ruleCode: string;
  antecedentJson: string;
  consequentJson: string;
  description?: string | null;
};

export type FuzzyRule = {
  code: string;
  if: Partial<Record<FuzzyInputKey, FuzzyLabel>>;
  then: Partial<Record<FuzzyOutputKey | "fragrance_penalty", FuzzyLabel>>;
  description?: string | null;
};

export type IngredientBenefitRecord = {
  benefitTag: string;
  strengthScore: number;
  evidenceNote?: string | null;
  source?: string | null;
};

export type IngredientRiskRecord = {
  riskTag: string;
  riskScore: number;
  riskCondition?: string | null;
  note?: string | null;
  source?: string | null;
};

export type IngredientAliasRecord = {
  aliasName: string;
  aliasType?: string | null;
  source?: string | null;
};

export type IngredientRecord = {
  id: number;
  inciName: string;
  normalizedName: string;
  aliasPrimary?: string | null;
  ingredientGroup?: string | null;
  cosmeticFunction?: string | null;
  description?: string | null;
  source?: string | null;
  referenceUrl?: string | null;
  status?: string | null;
  benefits: IngredientBenefitRecord[];
  risks: IngredientRiskRecord[];
  aliases?: IngredientAliasRecord[];
};

export type ScoredIngredient = {
  id: number;
  inciName: string;
  ingredientGroup?: string | null;
  cosmeticFunction?: string | null;
  score: number;
  benefitScore: number;
  riskPenalty: number;
  recommendationType: RecommendationType;
  benefitTags: string[];
  riskTags: string[];
  reason: string;
  warning?: string;
};

export type RoutineTemplate = {
  profile: string;
  morning: string[];
  night: string[];
  look_for: string[];
  caution: string[];
};

export type RecommendationResponse = {
  sessionId?: number;
  inputSummary: {
    skinType: string;
    conditions: string[];
    sensitivityLevel: string;
    goals: string[];
    avoidPreferences: string[];
  };
  mappedScores: FuzzyScores;
  fuzzyOutputs: FuzzyOutputs;
  recommended: ScoredIngredient[];
  supporting: ScoredIngredient[];
  useWithCaution: ScoredIngredient[];
  avoidIfSensitive: ScoredIngredient[];
  routine: RoutineTemplate | null;
  disclaimer: string;
};
