import type { ScoredIngredient } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";

type IngredientCardProps = {
  item: ScoredIngredient;
};

const typeLabel = {
  recommended: "Direkomendasikan",
  supporting: "Pendukung",
  use_with_caution: "Gunakan dengan hati-hati",
  avoid_if_sensitive: "Hindari jika sensitif"
};

export function IngredientCard({ item }: IngredientCardProps) {
  const tone =
    item.recommendationType === "recommended"
      ? "good"
      : item.recommendationType === "supporting"
        ? "neutral"
        : item.recommendationType === "use_with_caution"
          ? "warn"
          : "risk";

  return (
    <article className="rounded-md border border-line bg-white p-4 shadow-soft">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-ink">{item.inciName}</h3>
          <p className="mt-1 text-sm text-muted">{item.cosmeticFunction || item.ingredientGroup || "Fungsi kosmetik"}</p>
        </div>
        <ScoreBadge label={typeLabel[item.recommendationType]} score={item.score} tone={tone} />
      </div>
      <p className="mt-3 text-sm leading-6 text-ink">{item.reason}</p>
      {item.warning ? <p className="mt-2 text-sm text-clay">{item.warning}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {item.benefitTags.slice(0, 4).map((tag) => (
          <span key={tag} className="rounded-md border border-line bg-mint px-2 py-1 text-xs text-sage">
            {tag}
          </span>
        ))}
        {item.riskTags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md border border-rose-200 bg-roseSoft px-2 py-1 text-xs text-clay">
            {tag}
          </span>
        ))}
      </div>
    </article>
  );
}
