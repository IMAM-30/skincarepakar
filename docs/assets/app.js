(() => {
  const fuzzyOutputKeys = [
    "oil_control_need",
    "hydration_need",
    "acne_care_need",
    "barrier_repair_need",
    "soothing_need",
    "brightening_need",
    "exfoliation_caution",
    "irritation_risk"
  ];

  const goalOptions = ["oil_control", "hidrasi", "acne_care", "soothing", "barrier_repair", "brightening", "basic_care"];
  const avoidOptions = ["hindari_fragrance", "hindari_essential_oil", "hindari_alcohol_denat", "hindari_exfoliant_kuat"];
  const sensitivityOptions = ["rendah", "sedang", "tinggi"];
  const outputToBenefitTag = {
    oil_control_need: "oil_control",
    hydration_need: "hydrating",
    acne_care_need: "acne_care",
    barrier_repair_need: "barrier_repair",
    soothing_need: "soothing",
    brightening_need: "brightening"
  };
  const outputLabels = {
    oil_control_need: "Oil-control need",
    hydration_need: "Hydration need",
    acne_care_need: "Acne-care need",
    barrier_repair_need: "Barrier-repair need",
    soothing_need: "Soothing need",
    brightening_need: "Brightening need",
    exfoliation_caution: "Exfoliation caution",
    irritation_risk: "Irritation risk"
  };
  const scoreLabels = {
    oiliness: "Oiliness",
    dryness: "Dryness",
    acne: "Acne",
    sensitivity: "Sensitivity",
    barrier_damage: "Barrier damage",
    dullness: "Dullness"
  };
  const disclaimer =
    "Sistem ini adalah sistem pendukung keputusan, bukan alat diagnosis medis. Hasil rekomendasi bersifat informatif berdasarkan data kandungan skincare dan aturan fuzzy. Keputusan akhir tetap berada pada pengguna. Jika terjadi iritasi berat, alergi, luka, atau kondisi kulit memburuk, konsultasikan dengan tenaga profesional.";

  let appData = null;

  function $(selector) {
    return document.querySelector(selector);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function titleize(value) {
    return String(value ?? "-").replaceAll("_", " ");
  }

  function normalizeGoal(goal) {
    if (goal === "hidrasi") return "hydrating";
    if (goal === "basic_care") return "basic_support";
    return goal;
  }

  function clampScore(value) {
    return Math.max(0, Math.min(10, Math.round(value)));
  }

  function trapezoid(x, a, b, c, d) {
    if (x < a || x > d) return 0;
    if (x >= b && x <= c) return 1;
    if (x >= a && x < b) return a === b ? 1 : (x - a) / (b - a);
    if (x > c && x <= d) return c === d ? 1 : (d - x) / (d - c);
    return 0;
  }

  function triangle(x, a, b, c) {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
  }

  function inputMembership(label, x) {
    if (label === "low") return trapezoid(x, 0, 0, 2, 4);
    if (label === "medium") return triangle(x, 3, 5, 7);
    return trapezoid(x, 6, 8, 10, 10);
  }

  function outputMembership(label, x) {
    if (label === "low") return trapezoid(x, 0, 0, 25, 45);
    if (label === "medium") return triangle(x, 35, 50, 65);
    return trapezoid(x, 55, 75, 100, 100);
  }

  function centroid(activations) {
    let numerator = 0;
    let denominator = 0;
    for (let x = 0; x <= 100; x += 1) {
      const membership = Math.max(
        ...["low", "medium", "high"].map((label) => Math.min(activations[label] ?? 0, outputMembership(label, x)))
      );
      numerator += x * membership;
      denominator += membership;
    }
    return denominator === 0 ? 0 : Math.round(numerator / denominator);
  }

  function evaluateAntecedent(rule, scores) {
    const entries = Object.entries(rule.if ?? {});
    if (entries.length === 0) return 0;
    return Math.min(...entries.map(([key, label]) => inputMembership(label, scores[key])));
  }

  function evaluateMamdani(scores, rules) {
    const activations = Object.fromEntries(fuzzyOutputKeys.map((key) => [key, {}]));
    for (const rule of rules) {
      const strength = evaluateAntecedent(rule, scores);
      if (strength <= 0) continue;
      for (const [outputKey, label] of Object.entries(rule.then ?? {})) {
        if (!fuzzyOutputKeys.includes(outputKey)) continue;
        activations[outputKey][label] = Math.max(activations[outputKey][label] ?? 0, strength);
      }
    }
    return Object.fromEntries(fuzzyOutputKeys.map((key) => [key, centroid(activations[key])]));
  }

  function mapInputToScores(input) {
    const skinType = appData.skinTypes.find((item) => item.name === input.skinType);
    if (!skinType) throw new Error(`Jenis kulit tidak ditemukan: ${input.skinType}`);

    const selectedConditions = appData.skinConditions.filter((condition) => input.conditions.includes(condition.name));
    const scores = {
      oiliness: skinType.oilinessDefault,
      dryness: skinType.drynessDefault,
      acne: 0,
      sensitivity: skinType.sensitivityDefault,
      barrier_damage: skinType.barrierDamageDefault,
      dullness: 0
    };

    for (const condition of selectedConditions) {
      scores.acne += condition.acneLevel;
      scores.dullness += condition.dullnessLevel;
      scores.sensitivity += Math.ceil(condition.rednessLevel / 2);
      scores.barrier_damage += condition.barrierDamageLevel;
      scores.dryness += condition.drynessLevel;
      scores.oiliness += condition.oilinessLevel;
    }

    const manualSensitivity = { rendah: 2, sedang: 5, tinggi: 9 };
    scores.sensitivity = Math.max(scores.sensitivity, manualSensitivity[input.sensitivityLevel]);

    return {
      oiliness: clampScore(scores.oiliness),
      dryness: clampScore(scores.dryness),
      acne: clampScore(scores.acne),
      sensitivity: clampScore(scores.sensitivity),
      barrier_damage: clampScore(scores.barrier_damage),
      dullness: clampScore(scores.dullness)
    };
  }

  function preferenceMatchesRisk(preferences, riskTag) {
    return (
      (preferences.includes("hindari_fragrance") && riskTag === "fragrance_risk") ||
      (preferences.includes("hindari_essential_oil") && riskTag === "essential_oil_risk") ||
      (preferences.includes("hindari_alcohol_denat") && riskTag === "alcohol_denat_risk") ||
      (preferences.includes("hindari_exfoliant_kuat") && riskTag === "strong_exfoliant_risk")
    );
  }

  function riskMultiplier(riskTag, scores, outputs, preferences) {
    let multiplier = 0.75;
    if (scores.sensitivity >= 8) {
      if (riskTag === "fragrance_risk" || riskTag === "essential_oil_risk") multiplier = 3.8;
      if (riskTag === "strong_exfoliant_risk") multiplier = 2.6;
      if (riskTag === "alcohol_denat_risk") multiplier = 2.1;
      if (riskTag === "dryness_irritation_risk") multiplier = Math.max(multiplier, 1.8);
    }
    if (scores.barrier_damage >= 8 && (riskTag === "strong_exfoliant_risk" || riskTag === "barrier_caution")) {
      multiplier = Math.max(multiplier, 3.2);
    }
    if (scores.dryness >= 8 && (riskTag === "alcohol_denat_risk" || riskTag === "dryness_irritation_risk")) {
      multiplier = Math.max(multiplier, 2.4);
    }
    if (outputs.exfoliation_caution >= 65 && riskTag === "strong_exfoliant_risk") {
      multiplier = Math.max(multiplier, 2.4);
    }
    if (preferenceMatchesRisk(preferences, riskTag)) {
      multiplier += 2.5;
    }
    return multiplier;
  }

  function recommendationCategory({ finalScore, benefitScore, riskPenalty, riskTags, scores, preferences }) {
    const riskHigh = riskPenalty >= 18 || riskTags.some((tag) => preferenceMatchesRisk(preferences, tag));
    const sensitiveRisk =
      scores.sensitivity >= 8 && riskTags.some((tag) => ["fragrance_risk", "essential_oil_risk", "strong_exfoliant_risk"].includes(tag));
    const barrierRisk = scores.barrier_damage >= 8 && riskTags.some((tag) => ["strong_exfoliant_risk", "barrier_caution"].includes(tag));
    const drynessRisk = scores.dryness >= 8 && riskTags.some((tag) => ["alcohol_denat_risk", "dryness_irritation_risk"].includes(tag));

    if ((sensitiveRisk || barrierRisk || drynessRisk) && benefitScore < 72) return "avoid_if_sensitive";
    if (riskHigh && benefitScore >= 42) return "use_with_caution";
    if (riskHigh) return "avoid_if_sensitive";
    if (finalScore >= 75) return "recommended";
    if (finalScore >= 55) return "supporting";
    return "supporting";
  }

  function topNeeds(outputs) {
    return Object.entries(outputs)
      .filter(([key]) => !["exfoliation_caution", "irritation_risk"].includes(key))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => outputLabels[key].toLowerCase());
  }

  function generateReason({ inciName, recommendationType, benefitTags, outputs }) {
    const needs = topNeeds(outputs).join(", ");
    const benefits = benefitTags.slice(0, 3).map(titleize).join(", ");

    if (recommendationType === "avoid_if_sensitive") {
      return `${inciName} tidak menjadi prioritas karena profil kulit menunjukkan risiko iritasi atau sensitivitas yang perlu diperhatikan.`;
    }
    if (recommendationType === "use_with_caution") {
      return `${inciName} dapat relevan untuk ${benefits}, tetapi masuk kategori gunakan dengan hati-hati karena ada risk tag yang sesuai dengan profil kulit.`;
    }
    if (recommendationType === "recommended") {
      return `${inciName} direkomendasikan karena kebutuhan ${needs} cukup menonjol dan kandungan ini mendukung ${benefits}.`;
    }
    return `${inciName} menjadi kandungan pendukung karena profil kulit masih menunjukkan kebutuhan ${needs}.`;
  }

  function generateWarning(riskTags, scores) {
    if (riskTags.length === 0) return "";
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

  function scoreIngredients(ingredients, outputs, scores, input) {
    const normalizedGoals = input.goals.map(normalizeGoal);

    return ingredients
      .map((ingredient) => {
        const benefitContributions = ingredient.benefits.map((benefit) => {
          const needKey = Object.entries(outputToBenefitTag).find(([, tag]) => tag === benefit.benefitTag)?.[0];
          const need = needKey ? outputs[needKey] : benefit.benefitTag === "basic_support" ? 42 : 0;
          return need * (benefit.strengthScore / 10);
        });
        const sortedBenefits = [...benefitContributions].sort((a, b) => b - a);
        const maxBenefit = Math.max(0, ...sortedBenefits);
        const secondaryBenefit = sortedBenefits.slice(1).reduce((sum, value) => sum + value * 0.35, 0);
        const benefitTags = ingredient.benefits.map((benefit) => benefit.benefitTag);
        const goalBonus = benefitTags.some((tag) => normalizedGoals.includes(tag)) ? 7 : 0;
        const calmBonus =
          outputs.irritation_risk >= 65 && benefitTags.some((tag) => ["soothing", "barrier_repair", "hydrating"].includes(tag)) ? 4 : 0;
        const benefitScore = Math.min(100, maxBenefit + secondaryBenefit + goalBonus + calmBonus);

        const riskContributions = ingredient.risks.map(
          (risk) => risk.riskScore * riskMultiplier(risk.riskTag, scores, outputs, input.avoidPreferences)
        );
        const riskPenalty = Math.min(100, Math.max(0, ...riskContributions) + riskContributions.slice(1).reduce((sum, value) => sum + value * 0.25, 0));
        const safePreferenceBonus = ingredient.risks.length === 0 && normalizedGoals.some((goal) => benefitTags.includes(goal)) ? 3 : 0;
        const finalScore = Math.max(0, Math.min(100, Math.round(benefitScore - riskPenalty + safePreferenceBonus)));
        const riskTags = ingredient.risks.map((risk) => risk.riskTag);
        const recommendationType = recommendationCategory({
          finalScore,
          benefitScore,
          riskPenalty,
          riskTags,
          scores,
          preferences: input.avoidPreferences
        });

        return {
          id: ingredient.id,
          inciName: ingredient.inciName,
          ingredientGroup: ingredient.ingredientGroup,
          cosmeticFunction: ingredient.cosmeticFunction,
          score: finalScore,
          benefitScore: Math.round(benefitScore),
          riskPenalty: Math.round(riskPenalty),
          recommendationType,
          benefitTags,
          riskTags,
          reason: generateReason({ inciName: ingredient.inciName, recommendationType, benefitTags, outputs }),
          warning: generateWarning(riskTags, scores)
        };
      })
      .filter((item) => item.benefitScore >= 18 || item.riskPenalty >= 12)
      .sort((a, b) => b.score - a.score);
  }

  function selectRoutine(scores) {
    const profile =
      scores.barrier_damage >= 8
        ? "barrier_damage"
        : scores.sensitivity >= 8
          ? "sensitive_redness"
          : scores.dryness >= 8
            ? "dry_dehydrated"
            : scores.oiliness >= 7 && scores.acne >= 6
              ? "oily_acne_prone"
              : scores.dullness >= 7
                ? "dullness_brightening"
                : scores.oiliness >= 6 && scores.dryness >= 5
                  ? "combination_skin"
                  : "normal_basic";
    return appData.routines.find((routine) => routine.profile === profile) ?? appData.routines[0] ?? null;
  }

  function buildRecommendation(input) {
    const mappedScores = mapInputToScores(input);
    const fuzzyOutputs = evaluateMamdani(mappedScores, appData.fuzzyRules);
    const scored = scoreIngredients(appData.ingredients.filter((item) => item.status === "active"), fuzzyOutputs, mappedScores, input);

    return {
      inputSummary: input,
      mappedScores,
      fuzzyOutputs,
      recommended: scored.filter((item) => item.recommendationType === "recommended").slice(0, 8),
      supporting: scored.filter((item) => item.recommendationType === "supporting").slice(0, 8),
      useWithCaution: scored.filter((item) => item.recommendationType === "use_with_caution").slice(0, 8),
      avoidIfSensitive: scored.filter((item) => item.recommendationType === "avoid_if_sensitive").slice(0, 8),
      routine: selectRoutine(mappedScores),
      disclaimer
    };
  }

  function selectedValues(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
  }

  function renderCheckboxes(target, name, options, defaults = []) {
    target.innerHTML = options
      .map(
        (option) => `
          <label class="check-option">
            <input type="checkbox" name="${escapeHtml(name)}" value="${escapeHtml(option)}" ${defaults.includes(option) ? "checked" : ""} />
            <span>${escapeHtml(titleize(option))}</span>
          </label>
        `
      )
      .join("");
  }

  function renderRadios(target, name, options, defaultValue) {
    target.innerHTML = options
      .map(
        (option) => `
          <label class="radio-option">
            <input type="radio" name="${escapeHtml(name)}" value="${escapeHtml(option)}" ${option === defaultValue ? "checked" : ""} />
            <span>${escapeHtml(titleize(option))}</span>
          </label>
        `
      )
      .join("");
  }

  function initForm() {
    $("#skinType").innerHTML = appData.skinTypes
      .map((skinType) => `<option value="${escapeHtml(skinType.name)}">${escapeHtml(titleize(skinType.name))}</option>`)
      .join("");
    $("#skinType").value = "berminyak";
    renderCheckboxes($("#conditionOptions"), "conditions", appData.skinConditions.map((item) => item.name), ["jerawat"]);
    renderRadios($("#sensitivityOptions"), "sensitivityLevel", sensitivityOptions, "sedang");
    renderCheckboxes($("#goalOptions"), "goals", goalOptions, ["oil_control", "acne_care"]);
    renderCheckboxes($("#avoidOptions"), "avoidPreferences", avoidOptions, ["hindari_fragrance"]);

    $("#recommendationForm").addEventListener("submit", (event) => {
      event.preventDefault();
      $("#formError").hidden = true;
      try {
        const input = {
          skinType: $("#skinType").value,
          conditions: selectedValues("conditions"),
          sensitivityLevel: document.querySelector('input[name="sensitivityLevel"]:checked')?.value ?? "sedang",
          goals: selectedValues("goals"),
          avoidPreferences: selectedValues("avoidPreferences")
        };
        renderResult(buildRecommendation(input));
      } catch (error) {
        $("#formError").textContent = error instanceof Error ? error.message : "Rekomendasi belum bisa diproses.";
        $("#formError").hidden = false;
      }
    });
  }

  function renderScoreGrid(items, suffix = "") {
    return `
      <div class="score-grid">
        ${Object.entries(items)
          .map(
            ([key, value]) => `
              <div class="score-item">
                <span>${escapeHtml(scoreLabels[key] ?? outputLabels[key] ?? titleize(key))}</span>
                <strong>${Math.round(value)}${suffix}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    `;
  }

  function renderRecommendationGroup(title, items) {
    if (!items.length) {
      return `
        <article class="result-card">
          <h3>${escapeHtml(title)}</h3>
          <p class="section-lead">Tidak ada kandungan pada kategori ini untuk input sekarang.</p>
        </article>
      `;
    }

    return `
      <article class="result-card">
        <h3>${escapeHtml(title)}</h3>
        <div class="recommendation-list">
          ${items
            .map(
              (item) => `
                <div class="recommendation-item">
                  <header>
                    <h4>${escapeHtml(item.inciName)}</h4>
                    <span class="score-pill">${item.score}%</span>
                  </header>
                  <p>${escapeHtml(item.reason)}</p>
                  <div class="tag-row">
                    ${item.benefitTags.map((tag) => `<span class="tag">${escapeHtml(titleize(tag))}</span>`).join("")}
                    ${item.riskTags.map((tag) => `<span class="tag">${escapeHtml(titleize(tag))}</span>`).join("")}
                  </div>
                  ${item.warning ? `<p class="warning">${escapeHtml(item.warning)}</p>` : ""}
                </div>
              `
            )
            .join("")}
        </div>
      </article>
    `;
  }

  function renderRoutine(routine) {
    if (!routine) return "";
    return `
      <article class="result-card">
        <h3>Routine sederhana</h3>
        <p><strong>Profil:</strong> ${escapeHtml(titleize(routine.profile))}</p>
        <div class="two-column">
          <div>
            <strong>Pagi</strong>
            <ol>${routine.morning.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
          </div>
          <div>
            <strong>Malam</strong>
            <ol>${routine.night.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
          </div>
        </div>
        <div class="tag-row">${routine.look_for.map((item) => `<span class="tag">${escapeHtml(item)}</span>`).join("")}</div>
      </article>
    `;
  }

  function renderResult(result) {
    $("#resultPanel").innerHTML = `
      <article class="result-card">
        <h3>Ringkasan input</h3>
        <p>
          Jenis kulit: <strong>${escapeHtml(titleize(result.inputSummary.skinType))}</strong><br />
          Kondisi: <strong>${escapeHtml(result.inputSummary.conditions.map(titleize).join(", ") || "-")}</strong><br />
          Sensitivitas: <strong>${escapeHtml(titleize(result.inputSummary.sensitivityLevel))}</strong><br />
          Tujuan: <strong>${escapeHtml(result.inputSummary.goals.map(titleize).join(", ") || "-")}</strong>
        </p>
      </article>
      <article class="result-card">
        <h3>Profil skor fuzzy</h3>
        ${renderScoreGrid(result.mappedScores, "/10")}
      </article>
      <article class="result-card">
        <h3>Kebutuhan kandungan</h3>
        ${renderScoreGrid(result.fuzzyOutputs, "%")}
      </article>
      ${renderRecommendationGroup("Direkomendasikan", result.recommended)}
      ${renderRecommendationGroup("Pendukung", result.supporting)}
      ${renderRecommendationGroup("Gunakan dengan hati-hati", result.useWithCaution)}
      ${renderRecommendationGroup("Hindari jika sensitif", result.avoidIfSensitive)}
      ${renderRoutine(result.routine)}
      <article class="result-card">
        <h3>Panduan memilih produk</h3>
        <p>Saat memilih produk, cek daftar ingredient. Prioritaskan kandungan pada daftar utama, dan perhatikan kandungan yang masuk daftar kehati-hatian.</p>
        <p class="warning">${escapeHtml(result.disclaimer)}</p>
      </article>
    `;
  }

  function uniqueSorted(values) {
    return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  function initIngredientFilters() {
    const benefitTags = uniqueSorted(appData.ingredients.flatMap((ingredient) => ingredient.benefits.map((benefit) => benefit.benefitTag)));
    const riskTags = uniqueSorted(appData.ingredients.flatMap((ingredient) => ingredient.risks.map((risk) => risk.riskTag)));
    $("#benefitFilter").innerHTML += benefitTags.map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(titleize(tag))}</option>`).join("");
    $("#riskFilter").innerHTML += riskTags.map((tag) => `<option value="${escapeHtml(tag)}">${escapeHtml(titleize(tag))}</option>`).join("");
    ["ingredientSearch", "benefitFilter", "riskFilter"].forEach((id) => {
      $(`#${id}`).addEventListener("input", renderIngredients);
    });
    renderIngredients();
  }

  function renderIngredients() {
    const query = $("#ingredientSearch").value.trim().toLowerCase();
    const benefit = $("#benefitFilter").value;
    const risk = $("#riskFilter").value;
    const filtered = appData.ingredients
      .filter((ingredient) => ingredient.status === "active")
      .filter((ingredient) => {
        const searchable = [ingredient.inciName, ingredient.aliasPrimary, ingredient.normalizedName, ...(ingredient.aliases ?? []).map((alias) => alias.aliasName)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return !query || searchable.includes(query);
      })
      .filter((ingredient) => !benefit || ingredient.benefits.some((item) => item.benefitTag === benefit))
      .filter((ingredient) => !risk || ingredient.risks.some((item) => item.riskTag === risk));

    $("#ingredientCount").textContent = `${filtered.length} ingredient`;
    $("#ingredientList").innerHTML = filtered
      .slice(0, 36)
      .map(
        (ingredient) => `
          <article class="ingredient-card">
            <h3>${escapeHtml(ingredient.inciName)}</h3>
            <p>${escapeHtml(ingredient.description ?? "Tidak ada deskripsi.")}</p>
            <p><strong>Fungsi:</strong> ${escapeHtml(ingredient.cosmeticFunction ?? "-")}</p>
            <div class="tag-row">
              ${ingredient.benefits.slice(0, 4).map((item) => `<span class="tag">${escapeHtml(titleize(item.benefitTag))}</span>`).join("")}
              ${ingredient.risks.slice(0, 3).map((item) => `<span class="tag">${escapeHtml(titleize(item.riskTag))}</span>`).join("")}
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderDataStatus() {
    const benefits = appData.ingredients.reduce((sum, ingredient) => sum + ingredient.benefits.length, 0);
    const risks = appData.ingredients.reduce((sum, ingredient) => sum + ingredient.risks.length, 0);
    const aliases = appData.ingredients.reduce((sum, ingredient) => sum + (ingredient.aliases?.length ?? 0), 0);
    const cards = [
      ["Ingredient", appData.ingredients.length],
      ["Alias", aliases],
      ["Benefit mapping", benefits],
      ["Risk mapping", risks],
      ["Skin type", appData.skinTypes.length],
      ["Skin condition", appData.skinConditions.length],
      ["Fuzzy rule", appData.fuzzyRules.length],
      ["Knowledge status", appData.metadata?.knowledge_status ?? "source_documented"]
    ];
    $("#dataStatus").innerHTML = cards
      .map(
        ([label, value]) => `
          <div class="stat-card">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(value)}</strong>
          </div>
        `
      )
      .join("");
  }

  async function boot() {
    try {
      const response = await fetch("data/app-data.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Gagal memuat data static: ${response.status}`);
      appData = await response.json();
      initForm();
      initIngredientFilters();
      renderDataStatus();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Data static gagal dimuat.";
      $("#resultPanel").innerHTML = `<article class="empty-state"><h2>Data gagal dimuat</h2><p>${escapeHtml(message)}</p></article>`;
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
