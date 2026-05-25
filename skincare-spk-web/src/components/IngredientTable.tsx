type IngredientTableProps = {
  ingredients: Array<{
    id: number;
    inciName: string;
    ingredientGroup?: string | null;
    cosmeticFunction?: string | null;
    benefits?: Array<{ benefitTag: string; strengthScore: number }>;
    risks?: Array<{ riskTag: string; riskScore: number }>;
  }>;
};

export function IngredientTable({ ingredients }: IngredientTableProps) {
  return (
    <div className="overflow-hidden rounded-md border border-line bg-white">
      <table className="w-full min-w-[760px] border-collapse text-left text-sm">
        <thead className="bg-mint text-sage">
          <tr>
            <th className="px-4 py-3 font-semibold">Kandungan</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Fungsi</th>
            <th className="px-4 py-3 font-semibold">Benefit</th>
            <th className="px-4 py-3 font-semibold">Risk</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((item) => (
            <tr key={item.id} className="border-t border-line align-top">
              <td className="px-4 py-3 font-medium text-ink">
                <a className="hover:text-sage" href={`/ingredients/${item.id}`}>
                  {item.inciName}
                </a>
              </td>
              <td className="px-4 py-3 text-muted">{item.ingredientGroup || "-"}</td>
              <td className="px-4 py-3 text-muted">{item.cosmeticFunction || "-"}</td>
              <td className="px-4 py-3 text-muted">
                {item.benefits?.slice(0, 3).map((benefit) => benefit.benefitTag).join(", ") || "-"}
              </td>
              <td className="px-4 py-3 text-muted">
                {item.risks?.slice(0, 3).map((risk) => risk.riskTag).join(", ") || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
