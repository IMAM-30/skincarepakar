import { RecommendationForm } from "@/components/RecommendationForm";

export default function RecommendationPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <section>
        <p className="text-sm font-medium text-sage">Form rekomendasi</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Input ringkas kondisi kulit</h1>
        <p className="mt-3 leading-7 text-muted">
          Pilih opsi yang paling mendekati kondisi kulit. Sistem akan mengubah pilihan menjadi skor fuzzy dan memberi rekomendasi kandungan.
        </p>
      </section>
      <RecommendationForm />
    </div>
  );
}
