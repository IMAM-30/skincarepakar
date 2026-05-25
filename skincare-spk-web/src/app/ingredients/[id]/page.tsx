import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type IngredientDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function IngredientDetailPage({ params }: IngredientDetailPageProps) {
  const { id } = await params;
  const ingredient = await prisma.ingredient.findUnique({
    where: { id: Number(id) },
    include: { aliases: true, benefits: true, risks: true }
  });

  if (!ingredient) notFound();

  return (
    <div className="space-y-6">
      <Link href="/ingredients" className="text-sm font-medium text-sage">
        Kembali ke daftar ingredient
      </Link>
      <section className="rounded-md border border-line bg-white p-6 shadow-soft">
        <p className="text-sm text-muted">{ingredient.ingredientGroup || "ingredient"}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{ingredient.inciName}</h1>
        <p className="mt-3 leading-7 text-muted">{ingredient.description || "Belum ada deskripsi ringkas."}</p>
        <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="font-medium text-ink">Fungsi kosmetik</dt>
            <dd className="mt-1 text-muted">{ingredient.cosmeticFunction || "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-ink">Sumber</dt>
            <dd className="mt-1 break-words text-muted">{ingredient.source || "-"}</dd>
          </div>
        </dl>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-ink">Alias</h2>
          <p className="mt-2 text-sm text-muted">
            {ingredient.aliases.map((alias) => alias.aliasName).join(", ") || ingredient.aliasPrimary || "-"}
          </p>
        </article>
        <article className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-ink">Benefit tag</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {ingredient.benefits.map((benefit) => (
              <li key={benefit.id}>{benefit.benefitTag} ({benefit.strengthScore}/10)</li>
            ))}
          </ul>
        </article>
        <article className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="font-semibold text-ink">Risk tag</h2>
          <ul className="mt-2 space-y-2 text-sm text-muted">
            {ingredient.risks.length === 0 ? <li>Tidak ada risk tag utama.</li> : null}
            {ingredient.risks.map((risk) => (
              <li key={risk.id}>{risk.riskTag} ({risk.riskScore}/10)</li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}
