"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { RecommendationResponse, ScoredIngredient } from "@/lib/types";
import { IngredientCard } from "./IngredientCard";
import { RiskWarning } from "./RiskWarning";
import { RoutineTemplate } from "./RoutineTemplate";
import { ScoreBadge } from "./ScoreBadge";

function ResultSection({ title, items }: { title: string; items: ScoredIngredient[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {items.map((item) => (
          <IngredientCard key={`${title}-${item.id}`} item={item} />
        ))}
      </div>
    </section>
  );
}

export function ResultSummary() {
  const [result, setResult] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("latestRecommendation");
    if (raw) {
      setResult(JSON.parse(raw) as RecommendationResponse);
    }
  }, []);

  if (!result) {
    return (
      <div className="rounded-md border border-line bg-white p-6 shadow-soft">
        <h1 className="text-xl font-semibold text-ink">Belum ada hasil rekomendasi</h1>
        <p className="mt-2 text-sm text-muted">Isi form rekomendasi terlebih dahulu.</p>
        <Link href="/rekomendasi" className="mt-4 inline-flex rounded-md bg-sage px-4 py-2 text-sm font-semibold text-white">
          Buka form
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">Hasil rekomendasi kandungan</h1>
        <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-2">
          <p>Jenis kulit: <span className="font-medium text-ink">{result.inputSummary.skinType}</span></p>
          <p>Sensitivitas: <span className="font-medium text-ink">{result.inputSummary.sensitivityLevel}</span></p>
          <p>Kondisi: <span className="font-medium text-ink">{result.inputSummary.conditions.join(", ") || "-"}</span></p>
          <p>Tujuan: <span className="font-medium text-ink">{result.inputSummary.goals.join(", ") || "-"}</span></p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Profil skor fuzzy</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(result.mappedScores).map(([key, value]) => (
              <span key={key} className="rounded-md border border-line px-3 py-2 text-sm text-muted">
                {key}: <span className="font-medium text-ink">{value}/10</span>
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-line bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-ink">Kebutuhan kandungan</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(result.fuzzyOutputs).map(([key, value]) => (
              <ScoreBadge key={key} label={key} score={value} tone={key.includes("risk") || key.includes("caution") ? "warn" : "neutral"} />
            ))}
          </div>
        </div>
      </section>

      <ResultSection title="Kandungan utama" items={result.recommended} />
      <ResultSection title="Kandungan pendukung" items={result.supporting} />
      <ResultSection title="Gunakan dengan hati-hati" items={result.useWithCaution} />
      <ResultSection title="Hindari jika sensitif" items={result.avoidIfSensitive} />

      <RiskWarning>
        Saat memilih produk, cek daftar ingredient. Prioritaskan kandungan pada daftar utama, dan perhatikan kandungan yang masuk daftar kehati-hatian.
      </RiskWarning>

      {result.routine ? <RoutineTemplate routine={result.routine} /> : null}

      <RiskWarning>{result.disclaimer}</RiskWarning>
    </div>
  );
}
