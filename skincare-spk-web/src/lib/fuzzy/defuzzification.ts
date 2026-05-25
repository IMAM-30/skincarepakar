import type { FuzzyLabel } from "@/lib/types";
import { outputMembership } from "./membership";

export type OutputActivation = Partial<Record<FuzzyLabel, number>>;

export function centroid(activations: OutputActivation): number {
  let numerator = 0;
  let denominator = 0;

  for (let x = 0; x <= 100; x += 1) {
    const membership = Math.max(
      ...(["low", "medium", "high"] as FuzzyLabel[]).map((label) =>
        Math.min(activations[label] ?? 0, outputMembership(label, x))
      )
    );
    numerator += x * membership;
    denominator += membership;
  }

  if (denominator === 0) return 0;
  return Math.round(numerator / denominator);
}
