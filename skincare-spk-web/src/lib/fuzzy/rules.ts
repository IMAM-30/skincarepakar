import type {
  FuzzyInputKey,
  FuzzyLabel,
  FuzzyOutputKey,
  FuzzyRule,
  FuzzyRuleRecord,
  FuzzyScores
} from "@/lib/types";
import { inputMembership } from "./membership";

export const fuzzyOutputKeys: FuzzyOutputKey[] = [
  "oil_control_need",
  "hydration_need",
  "acne_care_need",
  "barrier_repair_need",
  "soothing_need",
  "brightening_need",
  "exfoliation_caution",
  "irritation_risk"
];

export function parseRule(record: FuzzyRuleRecord): FuzzyRule {
  return {
    code: record.ruleCode,
    if: JSON.parse(record.antecedentJson) as FuzzyRule["if"],
    then: JSON.parse(record.consequentJson) as FuzzyRule["then"],
    description: record.description
  };
}

export function parseRules(records: FuzzyRuleRecord[]): FuzzyRule[] {
  return records.map(parseRule);
}

export function evaluateAntecedent(rule: FuzzyRule, scores: FuzzyScores): number {
  const entries = Object.entries(rule.if) as Array<[FuzzyInputKey, FuzzyLabel]>;
  if (entries.length === 0) return 0;
  return Math.min(...entries.map(([key, label]) => inputMembership(label, scores[key])));
}

export function isFuzzyOutputKey(key: string): key is FuzzyOutputKey {
  return fuzzyOutputKeys.includes(key as FuzzyOutputKey);
}
