import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), "data", "processed");

type CsvRow = Record<string, string>;

function parseCsv(content: string): CsvRow[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }
    field += char;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const [header, ...body] = rows;
  return body.map((values) =>
    Object.fromEntries(header.map((key, index) => [key, values[index] ?? ""]))
  );
}

function csv(name: string): CsvRow[] {
  return parseCsv(readFileSync(path.join(dataDir, name), "utf8"));
}

function json<T>(name: string): T {
  return JSON.parse(readFileSync(path.join(dataDir, name), "utf8")) as T;
}

function int(value: string): number {
  return Number.parseInt(value, 10);
}

async function main() {
  await prisma.recommendationResult.deleteMany();
  await prisma.recommendationSession.deleteMany();
  await prisma.ingredientRisk.deleteMany();
  await prisma.ingredientBenefit.deleteMany();
  await prisma.ingredientAlias.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.skinType.deleteMany();
  await prisma.skinCondition.deleteMany();
  await prisma.fuzzyRule.deleteMany();

  await prisma.ingredient.createMany({
    data: csv("ingredients_master.csv").map((row) => ({
      id: int(row.id),
      inciName: row.inci_name,
      normalizedName: row.normalized_name,
      aliasPrimary: row.alias_primary || null,
      ingredientGroup: row.ingredient_group || null,
      cosmeticFunction: row.cosmetic_function || null,
      description: row.description || null,
      source: row.source || null,
      referenceUrl: row.reference_url || null,
      status: row.status || "active"
    }))
  });

  await prisma.ingredientAlias.createMany({
    data: csv("ingredient_aliases.csv").map((row) => ({
      id: int(row.id),
      ingredientId: int(row.ingredient_id),
      aliasName: row.alias_name,
      aliasType: row.alias_type || null,
      source: row.source || null
    }))
  });

  await prisma.ingredientBenefit.createMany({
    data: csv("ingredient_benefits.csv").map((row) => ({
      id: int(row.id),
      ingredientId: int(row.ingredient_id),
      benefitTag: row.benefit_tag,
      strengthScore: int(row.strength_score),
      evidenceNote: row.evidence_note || null,
      source: row.source || null
    }))
  });

  await prisma.ingredientRisk.createMany({
    data: csv("ingredient_risks.csv").map((row) => ({
      id: int(row.id),
      ingredientId: int(row.ingredient_id),
      riskTag: row.risk_tag,
      riskScore: int(row.risk_score),
      riskCondition: row.risk_condition || null,
      note: row.note || null,
      source: row.source || null
    }))
  });

  await prisma.skinType.createMany({
    data: csv("skin_types.csv").map((row) => ({
      id: int(row.id),
      name: row.name,
      oilinessDefault: int(row.oiliness_default),
      drynessDefault: int(row.dryness_default),
      sensitivityDefault: int(row.sensitivity_default),
      barrierDamageDefault: int(row.barrier_damage_default),
      description: row.description || null
    }))
  });

  await prisma.skinCondition.createMany({
    data: csv("skin_conditions.csv").map((row) => ({
      id: int(row.id),
      name: row.name,
      acneLevel: int(row.acne_level),
      dullnessLevel: int(row.dullness_level),
      rednessLevel: int(row.redness_level),
      barrierDamageLevel: int(row.barrier_damage_level),
      drynessLevel: int(row.dryness_level),
      oilinessLevel: int(row.oiliness_level),
      description: row.description || null
    }))
  });

  const rules = json<Array<{ code: string; if: object; then: object; description?: string }>>(
    "fuzzy_rules_seed.json"
  );
  await prisma.fuzzyRule.createMany({
    data: rules.map((rule) => ({
      ruleCode: rule.code,
      antecedentJson: JSON.stringify(rule.if),
      consequentJson: JSON.stringify(rule.then),
      description: rule.description ?? null,
      isActive: true
    }))
  });

  console.log("Seed complete:", {
    ingredients: await prisma.ingredient.count(),
    benefits: await prisma.ingredientBenefit.count(),
    risks: await prisma.ingredientRisk.count(),
    rules: await prisma.fuzzyRule.count()
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
