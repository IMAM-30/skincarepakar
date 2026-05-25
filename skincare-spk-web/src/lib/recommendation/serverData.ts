import { readFileSync } from "node:fs";
import path from "node:path";
import type {
  FuzzyRuleRecord,
  IngredientRecord,
  RoutineTemplate,
  SkinConditionRecord,
  SkinTypeRecord
} from "@/lib/types";

export function toSkinTypeRecord(row: {
  name: string;
  oilinessDefault: number;
  drynessDefault: number;
  sensitivityDefault: number;
  barrierDamageDefault: number;
  description?: string | null;
}): SkinTypeRecord {
  return row;
}

export function toSkinConditionRecord(row: {
  name: string;
  acneLevel: number;
  dullnessLevel: number;
  rednessLevel: number;
  barrierDamageLevel: number;
  drynessLevel: number;
  oilinessLevel: number;
  description?: string | null;
}): SkinConditionRecord {
  return row;
}

export function toFuzzyRuleRecord(row: {
  ruleCode: string;
  antecedentJson: string;
  consequentJson: string;
  description?: string | null;
}): FuzzyRuleRecord {
  return row;
}

export function toIngredientRecord(row: {
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
  benefits: Array<{ benefitTag: string; strengthScore: number; evidenceNote?: string | null; source?: string | null }>;
  risks: Array<{ riskTag: string; riskScore: number; riskCondition?: string | null; note?: string | null; source?: string | null }>;
  aliases?: Array<{ aliasName: string; aliasType?: string | null; source?: string | null }>;
}): IngredientRecord {
  return row;
}

export function loadRoutineTemplates(): RoutineTemplate[] {
  const fullPath = path.join(process.cwd(), "data", "processed", "routine_templates.json");
  return JSON.parse(readFileSync(fullPath, "utf8")) as RoutineTemplate[];
}

export function loadDatasetMetadata(): Record<string, unknown> {
  const fullPath = path.join(process.cwd(), "data", "processed", "dataset_metadata.json");
  return JSON.parse(readFileSync(fullPath, "utf8")) as Record<string, unknown>;
}
