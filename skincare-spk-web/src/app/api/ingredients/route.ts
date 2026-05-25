import { NextRequest, NextResponse } from "next/server";
import { parseTakeLimit } from "@/lib/api/pagination";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const benefit = searchParams.get("benefit")?.trim();
  const risk = searchParams.get("risk")?.trim();
  const limit = parseTakeLimit(searchParams.get("limit"));

  const ingredients = await prisma.ingredient.findMany({
    where: {
      status: "active",
      ...(q
        ? {
            OR: [
              { inciName: { contains: q } },
              { normalizedName: { contains: q.toLowerCase() } },
              { aliasPrimary: { contains: q } }
            ]
          }
        : {}),
      ...(benefit ? { benefits: { some: { benefitTag: benefit } } } : {}),
      ...(risk ? { risks: { some: { riskTag: risk } } } : {})
    },
    include: {
      benefits: true,
      risks: true,
      aliases: true
    },
    orderBy: { inciName: "asc" },
    take: limit
  });

  return NextResponse.json(ingredients);
}
