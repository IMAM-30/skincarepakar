type ScoreBadgeProps = {
  label?: string;
  score: number;
  tone?: "good" | "warn" | "risk" | "neutral";
};

export function ScoreBadge({ label, score, tone = "neutral" }: ScoreBadgeProps) {
  const toneClass = {
    good: "border-sage bg-mint text-sage",
    warn: "border-amber-300 bg-amberSoft text-amber-900",
    risk: "border-rose-300 bg-roseSoft text-clay",
    neutral: "border-line bg-white text-ink"
  }[tone];

  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm font-medium ${toneClass}`}>
      {label ? <span>{label}</span> : null}
      <span>{Math.round(score)}%</span>
    </span>
  );
}
