import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminRulesPage() {
  const rules = await prisma.fuzzyRule.findMany({ orderBy: { ruleCode: "asc" } });

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-sage">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Fuzzy rules</h1>
        <p className="mt-3 text-muted">Rule aktif yang dipakai endpoint rekomendasi.</p>
      </section>
      <div className="grid gap-3">
        {rules.map((rule) => (
          <article key={rule.id} className="rounded-md border border-line bg-white p-4 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-ink">{rule.ruleCode}</h2>
              <span className="rounded-md border border-line px-2 py-1 text-xs text-muted">
                {rule.isActive ? "active" : "inactive"}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{rule.description}</p>
            <pre className="mt-3 overflow-x-auto rounded-md bg-paper p-3 text-xs text-muted">
IF {rule.antecedentJson}
{"\n"}THEN {rule.consequentJson}
            </pre>
          </article>
        ))}
      </div>
    </div>
  );
}
