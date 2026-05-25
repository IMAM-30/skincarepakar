import type { FuzzyLabel, FuzzyOutputKey, FuzzyOutputs, FuzzyRule, FuzzyScores } from "@/lib/types";
import { centroid, type OutputActivation } from "./defuzzification";
import { evaluateAntecedent, fuzzyOutputKeys, isFuzzyOutputKey } from "./rules";

export function emptyFuzzyOutputs(): FuzzyOutputs {
  return Object.fromEntries(fuzzyOutputKeys.map((key) => [key, 0])) as FuzzyOutputs;
}

export function evaluateMamdani(scores: FuzzyScores, rules: FuzzyRule[]): FuzzyOutputs {
  const activations = Object.fromEntries(
    fuzzyOutputKeys.map((key) => [key, {} as OutputActivation])
  ) as Record<FuzzyOutputKey, OutputActivation>;

  for (const rule of rules) {
    const strength = evaluateAntecedent(rule, scores);
    if (strength <= 0) continue;

    for (const [outputKey, label] of Object.entries(rule.then)) {
      if (!isFuzzyOutputKey(outputKey)) continue;
      const fuzzyLabel = label as FuzzyLabel;
      activations[outputKey][fuzzyLabel] = Math.max(activations[outputKey][fuzzyLabel] ?? 0, strength);
    }
  }

  return Object.fromEntries(
    fuzzyOutputKeys.map((key) => [key, centroid(activations[key])])
  ) as FuzzyOutputs;
}
