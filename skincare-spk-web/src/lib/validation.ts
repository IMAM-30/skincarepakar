import { z } from "zod";

export const skinTypeOptions = ["berminyak", "kering", "kombinasi", "normal", "sensitif"] as const;
export const conditionOptions = [
  "jerawat",
  "komedo",
  "dehidrasi",
  "kemerahan",
  "skin_barrier_terganggu",
  "kusam",
  "bekas_jerawat_ringan"
] as const;
export const sensitivityOptions = ["rendah", "sedang", "tinggi"] as const;
export const goalOptions = [
  "oil_control",
  "hidrasi",
  "acne_care",
  "soothing",
  "barrier_repair",
  "brightening",
  "basic_care"
] as const;
export const avoidOptions = [
  "hindari_fragrance",
  "hindari_essential_oil",
  "hindari_alcohol_denat",
  "hindari_exfoliant_kuat"
] as const;

export const recommendationRequestSchema = z.object({
  skinType: z.enum(skinTypeOptions),
  conditions: z.array(z.enum(conditionOptions)).default([]),
  sensitivityLevel: z.enum(sensitivityOptions),
  goals: z.array(z.enum(goalOptions)).default([]),
  avoidPreferences: z.array(z.enum(avoidOptions)).default([])
});

export const disclaimer =
  "Sistem ini adalah sistem pendukung keputusan, bukan alat diagnosis medis. Hasil rekomendasi bersifat informatif berdasarkan data kandungan skincare dan aturan fuzzy. Keputusan akhir tetap berada pada pengguna. Jika terjadi iritasi berat, alergi, luka, atau kondisi kulit memburuk, konsultasikan dengan tenaga profesional.";

export function normalizeGoal(goal: string): string {
  if (goal === "hidrasi") return "hydrating";
  if (goal === "basic_care") return "basic_support";
  return goal;
}
