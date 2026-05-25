import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { recommendationRequestSchema } from "@/lib/validation";
import { buildRecommendation } from "@/lib/recommendation/recommendationEngine";
import {
  loadRoutineTemplates,
  toFuzzyRuleRecord,
  toIngredientRecord,
  toSkinConditionRecord,
  toSkinTypeRecord
} from "@/lib/recommendation/serverData";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = recommendationRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Input rekomendasi tidak valid.", errors: parsed.error.flatten() }, { status: 400 });
  }

  const [skinTypes, skinConditions, rules, ingredients] = await Promise.all([
    prisma.skinType.findMany({ orderBy: { id: "asc" } }),
    prisma.skinCondition.findMany({ orderBy: { id: "asc" } }),
    prisma.fuzzyRule.findMany({ where: { isActive: true }, orderBy: { ruleCode: "asc" } }),
    prisma.ingredient.findMany({
      where: { status: "active" },
      include: { benefits: true, risks: true, aliases: true },
      orderBy: { inciName: "asc" }
    })
  ]);

  const result = buildRecommendation({
    input: parsed.data,
    skinTypes: skinTypes.map(toSkinTypeRecord),
    skinConditions: skinConditions.map(toSkinConditionRecord),
    rules: rules.map(toFuzzyRuleRecord),
    ingredients: ingredients.map(toIngredientRecord),
    routines: loadRoutineTemplates()
  });

  const session = await prisma.recommendationSession.create({
    data: {
      skinType: parsed.data.skinType,
      selectedConditions: JSON.stringify(parsed.data.conditions),
      sensitivityLevel: parsed.data.sensitivityLevel,
      selectedGoals: JSON.stringify(parsed.data.goals),
      avoidPreferences: JSON.stringify(parsed.data.avoidPreferences),
      oilinessScore: result.mappedScores.oiliness,
      drynessScore: result.mappedScores.dryness,
      acneScore: result.mappedScores.acne,
      sensitivityScore: result.mappedScores.sensitivity,
      barrierDamageScore: result.mappedScores.barrier_damage,
      dullnessScore: result.mappedScores.dullness
    }
  });

  const allResults = [
    ...result.recommended,
    ...result.supporting,
    ...result.useWithCaution,
    ...result.avoidIfSensitive
  ].slice(0, 32);

  if (allResults.length > 0) {
    await prisma.recommendationResult.createMany({
      data: allResults.map((item) => ({
        sessionId: session.id,
        ingredientId: item.id,
        recommendationType: item.recommendationType,
        score: item.score,
        reason: item.reason,
        warning: item.warning ?? null
      }))
    });
  }

  return NextResponse.json({ ...result, sessionId: session.id });
}
