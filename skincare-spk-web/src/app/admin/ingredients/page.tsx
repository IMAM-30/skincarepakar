import { IngredientTable } from "@/components/IngredientTable";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminIngredientsPage() {
  const ingredients = await prisma.ingredient.findMany({
    include: { benefits: true, risks: true },
    orderBy: { id: "asc" }
  });

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-sage">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Ingredient data</h1>
        <p className="mt-3 text-muted">Browser lokal untuk mengecek data seed dari tahap 1.</p>
      </section>
      <div className="overflow-x-auto">
        <IngredientTable ingredients={ingredients} />
      </div>
    </div>
  );
}
