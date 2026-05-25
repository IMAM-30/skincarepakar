import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(dirname, "..");
const projectRoot = path.resolve(webRoot, "..");
const processedDir = path.join(webRoot, "data", "processed");
const docsDataDir = path.join(projectRoot, "docs", "data");

function parseCsv(content) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(current);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  const [headers, ...body] = rows;
  return body.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

function readCsv(fileName) {
  return parseCsv(fs.readFileSync(path.join(processedDir, fileName), "utf8"));
}

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(processedDir, fileName), "utf8"));
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function nullable(value) {
  return value === "" ? null : value;
}

const ingredientRows = readCsv("ingredients_master.csv");
const aliasRows = readCsv("ingredient_aliases.csv");
const benefitRows = readCsv("ingredient_benefits.csv");
const riskRows = readCsv("ingredient_risks.csv");

const ingredients = ingredientRows.map((row) => {
  const id = toNumber(row.id);
  return {
    id,
    inciName: row.inci_name,
    normalizedName: row.normalized_name,
    aliasPrimary: nullable(row.alias_primary),
    ingredientGroup: nullable(row.ingredient_group),
    cosmeticFunction: nullable(row.cosmetic_function),
    description: nullable(row.description),
    source: nullable(row.source),
    referenceUrl: nullable(row.reference_url),
    status: row.status || "active",
    aliases: aliasRows
      .filter((alias) => toNumber(alias.ingredient_id) === id)
      .map((alias) => ({
        aliasName: alias.alias_name,
        aliasType: nullable(alias.alias_type),
        source: nullable(alias.source)
      })),
    benefits: benefitRows
      .filter((benefit) => toNumber(benefit.ingredient_id) === id)
      .map((benefit) => ({
        benefitTag: benefit.benefit_tag,
        strengthScore: toNumber(benefit.strength_score),
        evidenceNote: nullable(benefit.evidence_note),
        source: nullable(benefit.source)
      })),
    risks: riskRows
      .filter((risk) => toNumber(risk.ingredient_id) === id)
      .map((risk) => ({
        riskTag: risk.risk_tag,
        riskScore: toNumber(risk.risk_score),
        riskCondition: nullable(risk.risk_condition),
        note: nullable(risk.note),
        source: nullable(risk.source)
      }))
  };
});

const payload = {
  generatedAt: new Date().toISOString(),
  metadata: readJson("dataset_metadata.json"),
  skinTypes: readCsv("skin_types.csv").map((row) => ({
    id: toNumber(row.id),
    name: row.name,
    oilinessDefault: toNumber(row.oiliness_default),
    drynessDefault: toNumber(row.dryness_default),
    sensitivityDefault: toNumber(row.sensitivity_default),
    barrierDamageDefault: toNumber(row.barrier_damage_default),
    description: nullable(row.description)
  })),
  skinConditions: readCsv("skin_conditions.csv").map((row) => ({
    id: toNumber(row.id),
    name: row.name,
    acneLevel: toNumber(row.acne_level),
    dullnessLevel: toNumber(row.dullness_level),
    rednessLevel: toNumber(row.redness_level),
    barrierDamageLevel: toNumber(row.barrier_damage_level),
    drynessLevel: toNumber(row.dryness_level),
    oilinessLevel: toNumber(row.oiliness_level),
    description: nullable(row.description)
  })),
  fuzzyRules: readJson("fuzzy_rules_seed.json"),
  routines: readJson("routine_templates.json"),
  ingredients
};

fs.mkdirSync(docsDataDir, { recursive: true });
fs.writeFileSync(path.join(docsDataDir, "app-data.json"), `${JSON.stringify(payload, null, 2)}\n`);

console.log(
  JSON.stringify({
    target: path.relative(projectRoot, path.join(docsDataDir, "app-data.json")),
    ingredients: payload.ingredients.length,
    aliases: aliasRows.length,
    benefits: benefitRows.length,
    risks: riskRows.length,
    skinTypes: payload.skinTypes.length,
    skinConditions: payload.skinConditions.length,
    fuzzyRules: payload.fuzzyRules.length
  })
);
