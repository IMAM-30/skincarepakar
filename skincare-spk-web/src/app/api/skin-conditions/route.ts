import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const conditions = await prisma.skinCondition.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(conditions);
}
