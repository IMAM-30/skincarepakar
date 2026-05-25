import type { FuzzyScores, RoutineTemplate } from "@/lib/types";

export function selectRoutine(scores: FuzzyScores, routines: RoutineTemplate[]): RoutineTemplate | null {
  const profile =
    scores.barrier_damage >= 8
      ? "barrier_damage"
      : scores.sensitivity >= 8
        ? "sensitive_redness"
        : scores.dryness >= 8
          ? "dry_dehydrated"
          : scores.oiliness >= 7 && scores.acne >= 6
            ? "oily_acne_prone"
            : scores.dullness >= 7
              ? "dullness_brightening"
              : scores.oiliness >= 6 && scores.dryness >= 5
                ? "combination_skin"
                : "normal_basic";

  return routines.find((routine) => routine.profile === profile) ?? routines[0] ?? null;
}
