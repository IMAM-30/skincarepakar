import type { FuzzyOutputs, FuzzyScores, RecommendationType } from "@/lib/types";

const outputLabels: Record<string, string> = {
  oil_control_need: "oil-control",
  hydration_need: "hidrasi",
  acne_care_need: "acne-care ringan",
  barrier_repair_need: "barrier repair",
  soothing_need: "soothing",
  brightening_need: "brightening",
  exfoliation_caution: "kehati-hatian eksfoliasi",
  irritation_risk: "risiko iritasi"
};

export function topNeeds(outputs: FuzzyOutputs): string[] {
  return Object.entries(outputs)
    .filter(([key]) => !["exfoliation_caution", "irritation_risk"].includes(key))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key]) => outputLabels[key]);
}

export function generateReason(params: {
  inciName: string;
  recommendationType: RecommendationType;
  benefitTags: string[];
  riskTags: string[];
  outputs: FuzzyOutputs;
}): string {
  const needs = topNeeds(params.outputs).join(", ");
  const benefits = params.benefitTags.slice(0, 3).join(", ");

  if (params.recommendationType === "avoid_if_sensitive") {
    return `${params.inciName} tidak menjadi prioritas karena profil kulit menunjukkan risiko iritasi atau sensitivitas yang perlu diperhatikan.`;
  }

  if (params.recommendationType === "use_with_caution") {
    return `${params.inciName} dapat relevan untuk ${benefits}, tetapi masuk kategori gunakan dengan hati-hati karena ada risk tag yang sesuai dengan profil kulit.`;
  }

  if (params.recommendationType === "recommended") {
    return `${params.inciName} direkomendasikan karena kebutuhan ${needs} cukup menonjol dan kandungan ini mendukung ${benefits}.`;
  }

  return `${params.inciName} menjadi kandungan pendukung karena profil kulit masih menunjukkan kebutuhan ${needs}.`;
}

export function generateWarning(riskTags: string[], scores: FuzzyScores): string | undefined {
  if (riskTags.length === 0) return undefined;
  if (scores.sensitivity >= 8 && riskTags.some((tag) => tag.includes("fragrance") || tag.includes("essential"))) {
    return "Perhatikan fragrance atau essential oil pada kulit sensitif.";
  }
  if (scores.barrier_damage >= 8 && riskTags.some((tag) => tag.includes("exfoliant") || tag.includes("barrier"))) {
    return "Gunakan bertahap karena skin barrier sedang membutuhkan kehati-hatian.";
  }
  if (scores.dryness >= 8 && riskTags.some((tag) => tag.includes("alcohol") || tag.includes("dryness"))) {
    return "Perhatikan potensi rasa kering pada kulit kering atau dehidrasi.";
  }
  return "Gunakan bertahap dan hentikan jika terasa tidak nyaman.";
}
