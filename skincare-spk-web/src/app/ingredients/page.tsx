import { IngredientTable } from "@/components/IngredientTable";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type IngredientsPageProps = {
  searchParams: Promise<{ q?: string; benefit?: string; risk?: string }>;
};

export default async function IngredientsPage({ searchParams }: IngredientsPageProps) {
  const params = await searchParams;
  const q = params.q?.trim();
  const benefit = params.benefit?.trim();
  const risk = params.risk?.trim();

  const [ingredients, benefitTags, riskTags] = await Promise.all([
    prisma.ingredient.findMany({
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
      include: { benefits: true, risks: true },
      orderBy: { inciName: "asc" },
      take: 150
    }),
    prisma.ingredientBenefit.findMany({ distinct: ["benefitTag"], orderBy: { benefitTag: "asc" } }),
    prisma.ingredientRisk.findMany({ distinct: ["riskTag"], orderBy: { riskTag: "asc" } })
  ]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-sage">Ingredient browser</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Daftar kandungan</h1>
        <p className="mt-3 text-muted">Cari dan filter kandungan berdasarkan benefit atau risk tag.</p>
      </section>

      <form className="grid gap-3 rounded-md border border-line bg-white p-4 shadow-soft md:grid-cols-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari ingredient"
          className="rounded-md border border-line px-3 py-2 text-sm"
        />
        <select name="benefit" defaultValue={benefit ?? ""} className="rounded-md border border-line px-3 py-2 text-sm">
          <option value="">Semua benefit</option>
          {benefitTags.map((tag) => (
            <option key={tag.benefitTag} value={tag.benefitTag}>
              {tag.benefitTag}
            </option>
          ))}
        </select>
        <select name="risk" defaultValue={risk ?? ""} className="rounded-md border border-line px-3 py-2 text-sm">
          <option value="">Semua risk</option>
          {riskTags.map((tag) => (
            <option key={tag.riskTag} value={tag.riskTag}>
              {tag.riskTag}
            </option>
          ))}
        </select>
        <button className="rounded-md bg-sage px-4 py-2 text-sm font-semibold text-white" type="submit">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto">
        <IngredientTable ingredients={ingredients} />
      </div>
    </div>
  );
}
