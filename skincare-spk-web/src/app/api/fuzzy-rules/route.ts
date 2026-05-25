import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const rules = await prisma.fuzzyRule.findMany({
    where: { isActive: true },
    orderBy: { ruleCode: "asc" }
  });
  return NextResponse.json(rules);
}
