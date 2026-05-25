import type {
  FuzzyOutputs,
  FuzzyScores,
  IngredientRecord,
  RecommendationRequest,
  RecommendationType,
  ScoredIngredient
} from "@/lib/types";
import { normalizeGoal } from "@/lib/validation";
import { generateReason, generateWarning } from "./reasonGenerator";

const outputToBenefitTag: Partial<Record<keyof FuzzyOutputs, string>> = {
  oil_control_need: "oil_control",
  hydration_need: "hydrating",
  acne_care_need: "acne_care",
  barrier_repair_need: "barrier_repair",
  soothing_need: "soothing",
  brightening_need: "brightening"
};

function preferenceMatchesRisk(preferences: string[], riskTag: string): boolean {
  return (
    (preferences.includes("hindari_fragrance") && riskTag === "fragrance_risk") ||
    (preferences.includes("hindari_essential_oil") && riskTag === "essential_oil_risk") ||
    (preferences.includes("hindari_alcohol_denat") && riskTag === "alcohol_denat_risk") ||
    (preferences.includes("hindari_exfoliant_kuat") && riskTag === "strong_exfoliant_risk")
  );
}

function riskMultiplier(riskTag: string, scores: FuzzyScores, outputs: FuzzyOutputs, preferences: string[]): number {
  let multiplier = 0.75;
  if (scores.sensitivity >= 8) {
    if (riskTag === "fragrance_risk" || riskTag === "essential_oil_risk") multiplier = 3.8;
    if (riskTag === "strong_exfoliant_risk") multiplier = 2.6;
    if (riskTag === "alcohol_denat_risk") multiplier = 2.1;
    if (riskTag === "dryness_irritation_risk") multiplier = Math.max(multiplier, 1.8);
  }
  if (scores.barrier_damage >= 8 && (riskTag === "strong_exfoliant_risk" || riskTag === "barrier_caution")) {
    multiplier = Math.max(multiplier, 3.2);
  }
  if (scores.dryness >= 8 && (riskTag === "alcohol_denat_risk" || riskTag === "dryness_irritation_risk")) {
    multiplier = Math.max(multiplier, 2.4);
  }
  if (outputs.exfoliation_caution >= 65 && riskTag === "strong_exfoliant_risk") {
    multiplier = Math.max(multiplier, 2.4);
  }
  if (preferenceMatchesRisk(preferences, riskTag)) {
    multiplier += 2.5;
  }
  return multiplier;
}

function category(params: {
  finalScore: number;
  benefitScore: number;
  riskPenalty: number;
  riskTags: string[];
  scores: FuzzyScores;
  preferences: string[];
}): RecommendationType {
  const riskHigh = params.riskPenalty >= 18 || params.riskTags.some((tag) => preferenceMatchesRisk(params.preferences, tag));
  const sensitiveRisk =
    params.scores.sensitivity >= 8 &&
    params.riskTags.some((tag) => ["fragrance_risk", "essential_oil_risk", "strong_exfoliant_risk"].includes(tag));
  const barrierRisk =
    params.scores.barrier_damage >= 8 &&
    params.riskTags.some((tag) => ["strong_exfoliant_risk", "barrier_caution"].includes(tag));
  const drynessRisk =
    params.scores.dryness >= 8 &&
    params.riskTags.some((tag) => ["alcohol_denat_risk", "dryness_irritation_risk"].includes(tag));

  if ((sensitiveRisk || barrierRisk || drynessRisk) && params.benefitScore < 72) return "avoid_if_sensitive";
  if (riskHigh && params.benefitScore >= 42) return "use_with_caution";
  if (riskHigh) return "avoid_if_sensitive";
  if (params.finalScore >= 75) return "recommended";
  if (params.finalScore >= 55) return "supporting";
  return "supporting";
}

export function scoreIngredients(
  ingredients: IngredientRecord[],
  outputs: FuzzyOutputs,
  scores: FuzzyScores,
  input: Pick<RecommendationRequest, "goals" | "avoidPreferences">
): ScoredIngredient[] {
  const normalizedGoals = input.goals.map(normalizeGoal);

  return ingredients
    .map((ingredient) => {
      const benefitContributions = ingredient.benefits.map((benefit) => {
        const needEntry = Object.entries(outputToBenefitTag).find(([, tag]) => tag === benefit.benefitTag);
        const need = needEntry ? outputs[needEntry[0] as keyof FuzzyOutputs] : benefit.benefitTag === "basic_support" ? 42 : 0;
        return need * (benefit.strengthScore / 10);
      });
      const maxBenefit = Math.max(0, ...benefitContributions);
      const secondaryBenefit = benefitContributions
        .sort((a, b) => b - a)
        .slice(1)
        .reduce((sum, value) => sum + value * 0.35, 0);
      const benefitTags = ingredient.benefits.map((benefit) => benefit.benefitTag);
      const goalBonus = benefitTags.some((tag) => normalizedGoals.includes(tag)) ? 7 : 0;
      const calmBonus =
        outputs.irritation_risk >= 65 && benefitTags.some((tag) => ["soothing", "barrier_repair", "hydrating"].includes(tag))
          ? 4
          : 0;
      const benefitScore = Math.min(100, maxBenefit + secondaryBenefit + goalBonus + calmBonus);

      const riskContributions = ingredient.risks.map(
        (risk) => risk.riskScore * riskMultiplier(risk.riskTag, scores, outputs, input.avoidPreferences)
      );
      const riskPenalty = Math.min(
        100,
        Math.max(0, ...riskContributions) + riskContributions.slice(1).reduce((sum, value) => sum + value * 0.25, 0)
      );
      const safePreferenceBonus = ingredient.risks.length === 0 && normalizedGoals.some((goal) => benefitTags.includes(goal)) ? 3 : 0;
      const finalScore = Math.max(0, Math.min(100, Math.round(benefitScore - riskPenalty + safePreferenceBonus)));
      const riskTags = ingredient.risks.map((risk) => risk.riskTag);
      const recommendationType = category({
        finalScore,
        benefitScore,
        riskPenalty,
        riskTags,
        scores,
        preferences: input.avoidPreferences
      });

      return {
        id: ingredient.id,
        inciName: ingredient.inciName,
        ingredientGroup: ingredient.ingredientGroup,
        cosmeticFunction: ingredient.cosmeticFunction,
        score: finalScore,
        benefitScore: Math.round(benefitScore),
        riskPenalty: Math.round(riskPenalty),
        recommendationType,
        benefitTags,
        riskTags,
        reason: generateReason({
          inciName: ingredient.inciName,
          recommendationType,
          benefitTags,
          riskTags,
          outputs
        }),
        warning: generateWarning(riskTags, scores)
      };
    })
    .filter((item) => item.benefitScore >= 18 || item.riskPenalty >= 12)
    .sort((a, b) => b.score - a.score);
}
