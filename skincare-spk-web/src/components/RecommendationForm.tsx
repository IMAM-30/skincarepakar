"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  avoidOptions,
  conditionOptions,
  goalOptions,
  sensitivityOptions,
  skinTypeOptions
} from "@/lib/validation";
import type { RecommendationResponse } from "@/lib/types";

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function RecommendationForm() {
  const router = useRouter();
  const [skinType, setSkinType] = useState("berminyak");
  const [conditions, setConditions] = useState<string[]>(["jerawat"]);
  const [sensitivityLevel, setSensitivityLevel] = useState("sedang");
  const [goals, setGoals] = useState<string[]>(["oil_control", "acne_care"]);
  const [avoidPreferences, setAvoidPreferences] = useState<string[]>(["hindari_fragrance"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sessionStorage.removeItem("latestRecommendation");
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skinType, conditions, sensitivityLevel, goals, avoidPreferences })
    });

    if (!response.ok) {
      setLoading(false);
      setError("Rekomendasi belum bisa diproses. Periksa input dan database seed.");
      return;
    }

    const data = (await response.json()) as RecommendationResponse;
    sessionStorage.setItem("latestRecommendation", JSON.stringify(data));
    router.push("/rekomendasi/hasil");
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <label className="text-sm font-semibold text-ink" htmlFor="skinType">
          Jenis kulit
        </label>
        <select
          id="skinType"
          value={skinType}
          onChange={(event) => setSkinType(event.target.value)}
          className="mt-2 w-full rounded-md border border-line bg-white px-3 py-2 text-sm"
        >
          {skinTypeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-ink">Kondisi kulit</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {conditionOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={conditions.includes(option)}
                onChange={() => setConditions((current) => toggleValue(current, option))}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-ink">Tingkat sensitivitas</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {sensitivityOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
              <input
                type="radio"
                name="sensitivity"
                value={option}
                checked={sensitivityLevel === option}
                onChange={() => setSensitivityLevel(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-ink">Tujuan skincare</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {goalOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={goals.includes(option)}
                onChange={() => setGoals((current) => toggleValue(current, option))}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-md border border-line bg-white p-5 shadow-soft">
        <h2 className="text-sm font-semibold text-ink">Preferensi kehati-hatian</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {avoidOptions.map((option) => (
            <label key={option} className="flex items-center gap-2 rounded-md border border-line px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={avoidPreferences.includes(option)}
                onChange={() => setAvoidPreferences((current) => toggleValue(current, option))}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </section>

      {error ? <p className="rounded-md border border-clay bg-roseSoft px-3 py-2 text-sm text-clay">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-md bg-sage px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        Proses rekomendasi
      </button>
    </form>
  );
}
