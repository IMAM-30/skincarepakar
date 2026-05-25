import type { FuzzyScores, RecommendationRequest, SkinConditionRecord, SkinTypeRecord } from "@/lib/types";

export function clampScore(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value)));
}

const sensitivityManualScore = {
  rendah: 2,
  sedang: 5,
  tinggi: 9
} as const;

export function mapInputToScores(
  input: Pick<RecommendationRequest, "skinType" | "conditions" | "sensitivityLevel">,
  skinTypes: SkinTypeRecord[],
  skinConditions: SkinConditionRecord[]
): FuzzyScores {
  const skinType = skinTypes.find((item) => item.name === input.skinType);
  if (!skinType) {
    throw new Error(`Jenis kulit tidak ditemukan: ${input.skinType}`);
  }

  const selectedConditions = skinConditions.filter((condition) =>
    input.conditions.includes(condition.name)
  );

  const scores: FuzzyScores = {
    oiliness: skinType.oilinessDefault,
    dryness: skinType.drynessDefault,
    acne: 0,
    sensitivity: skinType.sensitivityDefault,
    barrier_damage: skinType.barrierDamageDefault,
    dullness: 0
  };

  for (const condition of selectedConditions) {
    scores.acne += condition.acneLevel;
    scores.dullness += condition.dullnessLevel;
    scores.sensitivity += Math.ceil(condition.rednessLevel / 2);
    scores.barrier_damage += condition.barrierDamageLevel;
    scores.dryness += condition.drynessLevel;
    scores.oiliness += condition.oilinessLevel;
  }

  scores.sensitivity = Math.max(scores.sensitivity, sensitivityManualScore[input.sensitivityLevel]);

  return {
    oiliness: clampScore(scores.oiliness),
    dryness: clampScore(scores.dryness),
    acne: clampScore(scores.acne),
    sensitivity: clampScore(scores.sensitivity),
    barrier_damage: clampScore(scores.barrier_damage),
    dullness: clampScore(scores.dullness)
  };
}
