import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const skinTypes = await prisma.skinType.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(skinTypes);
}
