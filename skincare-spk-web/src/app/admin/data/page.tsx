import Link from "next/link";
import { prisma } from "@/lib/db";
import { loadDatasetMetadata } from "@/lib/recommendation/serverData";

export const dynamic = "force-dynamic";

export default async function AdminDataPage() {
  const [ingredientCount, benefitCount, riskCount, ruleCount, sessionCount] = await Promise.all([
    prisma.ingredient.count(),
    prisma.ingredientBenefit.count(),
    prisma.ingredientRisk.count(),
    prisma.fuzzyRule.count(),
    prisma.recommendationSession.count()
  ]);
  const metadata = loadDatasetMetadata();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-sage">Admin data browser</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Status dataset</h1>
        <p className="mt-3 text-muted">MVP lokal tanpa autentikasi. Untuk production, halaman admin perlu auth.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-5">
        {[
          ["Ingredient", ingredientCount],
          ["Benefit", benefitCount],
          ["Risk", riskCount],
          ["Rules", ruleCount],
          ["Session", sessionCount]
        ].map(([label, value]) => (
          <article key={label} className="rounded-md border border-line bg-white p-4 shadow-soft">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink">Knowledge status</h2>
        <dl className="mt-3 grid gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-muted">Status</dt>
            <dd className="font-medium text-ink">{String(metadata.knowledge_status ?? "-")}</dd>
          </div>
          <div>
            <dt className="text-muted">Metode</dt>
            <dd className="font-medium text-ink">{String(metadata.knowledge_method ?? "-")}</dd>
          </div>
          <div>
            <dt className="text-muted">Validasi pakar langsung</dt>
            <dd className="font-medium text-ink">{String(metadata.direct_expert_validation ?? "-")}</dd>
          </div>
          <div>
            <dt className="text-muted">Sumber data produk/brand</dt>
            <dd className="font-medium text-ink">Tidak digunakan</dd>
          </div>
        </dl>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href="/admin/ingredients" className="rounded-md bg-sage px-4 py-2 text-sm font-semibold text-white">
          Lihat ingredient
        </Link>
        <Link href="/admin/rules" className="rounded-md border border-line bg-white px-4 py-2 text-sm font-semibold text-ink">
          Lihat rules
        </Link>
      </div>
    </div>
  );
}
