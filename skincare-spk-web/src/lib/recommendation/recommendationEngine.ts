import type {
  FuzzyRuleRecord,
  IngredientRecord,
  RecommendationRequest,
  RecommendationResponse,
  RoutineTemplate,
  SkinConditionRecord,
  SkinTypeRecord
} from "@/lib/types";
import { disclaimer } from "@/lib/validation";
import { evaluateMamdani } from "@/lib/fuzzy/mamdani";
import { parseRules } from "@/lib/fuzzy/rules";
import { mapInputToScores } from "./inputMapping";
import { scoreIngredients } from "./ingredientScoring";
import { selectRoutine } from "./routineSelector";

export function buildRecommendation(params: {
  input: RecommendationRequest;
  skinTypes: SkinTypeRecord[];
  skinConditions: SkinConditionRecord[];
  rules: FuzzyRuleRecord[];
  ingredients: IngredientRecord[];
  routines: RoutineTemplate[];
}): RecommendationResponse {
  const mappedScores = mapInputToScores(params.input, params.skinTypes, params.skinConditions);
  const fuzzyOutputs = evaluateMamdani(mappedScores, parseRules(params.rules));
  const scored = scoreIngredients(params.ingredients, fuzzyOutputs, mappedScores, params.input);

  const byType = {
    recommended: scored.filter((item) => item.recommendationType === "recommended").slice(0, 8),
    supporting: scored.filter((item) => item.recommendationType === "supporting").slice(0, 8),
    useWithCaution: scored.filter((item) => item.recommendationType === "use_with_caution").slice(0, 8),
    avoidIfSensitive: scored.filter((item) => item.recommendationType === "avoid_if_sensitive").slice(0, 8)
  };

  return {
    inputSummary: {
      skinType: params.input.skinType,
      conditions: params.input.conditions,
      sensitivityLevel: params.input.sensitivityLevel,
      goals: params.input.goals,
      avoidPreferences: params.input.avoidPreferences
    },
    mappedScores,
    fuzzyOutputs,
    ...byType,
    routine: selectRoutine(mappedScores, params.routines),
    disclaimer
  };
}
