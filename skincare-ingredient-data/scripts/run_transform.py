#!/usr/bin/env python3
import csv
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from src.transformers.build_fuzzy_seed import FUZZY_RULES
from src.transformers.classify_ingredients import normalize_group
from src.transformers.generate_tags import BENEFIT_TAGS, CONDITION_RULES, RISK_TAGS, ROUTINE_TEMPLATES, SKIN_CONDITIONS, SKIN_TYPES
from src.transformers.normalize_ingredients import normalize_seed_row
from src.utils.text_cleaning import normalize_name


PROCESSED = ROOT / "data" / "processed"
INTERIM = ROOT / "data" / "interim"
RAW = ROOT / "data" / "raw"
TODAY = datetime.now(timezone.utc).date().isoformat()
KNOWLEDGE_STATUS = "source_documented"
KNOWLEDGE_METHOD = "trusted_source_literature_review"
DIRECT_EXPERT_VALIDATION = "not_performed"
OPTIONAL_EXPERT_REVIEW = "available_if_required"


def write_csv(path: Path, fieldnames: list[str], rows: list[dict]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def knowledge_source_audit_row(
    item_number: int,
    item_type: str,
    source_table: str,
    source_id: str,
    item_label: str,
    current_value: str,
    rationale: str,
    recommended_sources: str,
    evidence_level: str = "source_supported_seed",
) -> dict:
    return {
        "item_id": f"KVI-{item_number:04d}",
        "item_type": item_type,
        "source_table": source_table,
        "source_id": source_id,
        "item_label": item_label,
        "current_value": current_value,
        "knowledge_status": KNOWLEDGE_STATUS,
        "knowledge_method": KNOWLEDGE_METHOD,
        "evidence_level": evidence_level,
        "recommended_sources": recommended_sources,
        "rationale": rationale,
        "direct_expert_validation": DIRECT_EXPERT_VALIDATION,
        "optional_expert_review": OPTIONAL_EXPERT_REVIEW,
    }


def cleanup_obsolete_outputs() -> None:
    obsolete_paths = [
        PROCESSED / "knowledge_validation_status.csv",
        PROCESSED / "expert_profiles_template.csv",
        PROCESSED / "expert_review_decisions_template.csv",
        ROOT / "docs" / "expert_validation_plan.md",
        ROOT / "docs" / "expert_validation_form.md",
    ]
    for path in obsolete_paths:
        if path.exists():
            path.unlink()


def load_manual_seed() -> list[dict]:
    path = RAW / "manual_seed" / "ingredient_seed.csv"
    with path.open(encoding="utf-8", newline="") as handle:
        return [normalize_seed_row(row) for row in csv.DictReader(handle)]


def load_openbeautyfacts_index() -> tuple[dict[str, dict], int, int]:
    path = RAW / "openbeautyfacts" / "ingredients.json"
    if not path.exists():
        return {}, 0, 0
    payload = json.loads(path.read_text(encoding="utf-8"))
    index: dict[str, dict] = {}
    for tag in payload.get("tags", []):
        names = set()
        if tag.get("name"):
            names.add(str(tag["name"]))
        if tag.get("id") and ":" in str(tag["id"]):
            names.add(str(tag["id"]).split(":", 1)[1].replace("-", " "))
        for name in names:
            normalized = normalize_name(name)
            if normalized and normalized not in index:
                index[normalized] = tag
    returned = len(payload.get("tags", []))
    reported_total = int(payload.get("count") or returned)
    return index, reported_total, returned


def build_rows() -> dict[str, list[dict] | dict]:
    seed_rows = load_manual_seed()
    obf_index, obf_total, obf_returned = load_openbeautyfacts_index()

    ingredient_rows = []
    alias_rows = []
    benefit_rows = []
    risk_rows = []
    obf_matches = []
    seen_names: set[str] = set()
    alias_id = 1
    benefit_id = 1
    risk_id = 1

    for ingredient_id, seed in enumerate(seed_rows, start=1):
        normalized = seed["normalized_name"]
        if normalized in seen_names:
            raise ValueError(f"Duplikat normalized_name pada seed: {normalized}")
        seen_names.add(normalized)

        candidates = [normalized] + [normalize_name(alias) for alias in seed["aliases"]]
        obf_match = next((obf_index[name] for name in candidates if name in obf_index), None)
        source = seed["source"]
        reference_url = seed["reference_url"]
        if obf_match:
            source = f"{source};openbeautyfacts"
            reference_url = obf_match.get("url") or reference_url
            obf_matches.append(
                {
                    "ingredient_id": ingredient_id,
                    "inci_name": seed["inci_name"],
                    "normalized_name": normalized,
                    "openbeautyfacts_name": obf_match.get("name", ""),
                    "frequency_count": obf_match.get("products", ""),
                    "reference_url": obf_match.get("url", ""),
                }
            )

        ingredient_rows.append(
            {
                "id": ingredient_id,
                "inci_name": seed["inci_name"],
                "normalized_name": normalized,
                "alias_primary": seed["alias_primary"],
                "ingredient_group": normalize_group(seed["ingredient_group"]),
                "cosmetic_function": seed["cosmetic_function"],
                "description": seed["description"],
                "source": source,
                "reference_url": reference_url,
                "status": seed["status"],
                "created_at": TODAY,
                "updated_at": TODAY,
            }
        )

        for alias in seed["aliases"]:
            alias_rows.append(
                {
                    "id": alias_id,
                    "ingredient_id": ingredient_id,
                    "alias_name": alias,
                    "alias_type": "common_name",
                    "source": "manual_seed",
                }
            )
            alias_id += 1

        if obf_match and obf_match.get("name") and obf_match.get("name") != seed["inci_name"]:
            alias_rows.append(
                {
                    "id": alias_id,
                    "ingredient_id": ingredient_id,
                    "alias_name": obf_match.get("name", ""),
                    "alias_type": "openbeautyfacts_name",
                    "source": "openbeautyfacts",
                }
            )
            alias_id += 1

        for benefit in seed["benefits"]:
            benefit_rows.append(
                {
                    "id": benefit_id,
                    "ingredient_id": ingredient_id,
                    "benefit_tag": benefit["tag"],
                    "strength_score": benefit["score"],
                    "evidence_note": f"Curated seed: {seed['inci_name']} mendukung tag {benefit['tag']}.",
                    "source": source,
                }
            )
            benefit_id += 1

        for risk in seed["risks"]:
            risk_rows.append(
                {
                    "id": risk_id,
                    "ingredient_id": ingredient_id,
                    "risk_tag": risk["tag"],
                    "risk_score": risk["score"],
                    "risk_condition": risk["condition"],
                    "note": f"Curated caution untuk {seed['inci_name']} pada kondisi {risk['condition'] or 'tertentu'}.",
                    "source": seed["source"],
                }
            )
            risk_id += 1

    return {
        "ingredients": ingredient_rows,
        "aliases": alias_rows,
        "benefits": benefit_rows,
        "risks": risk_rows,
        "obf_matches": obf_matches,
        "meta": {"openbeautyfacts_total_tags": obf_total, "openbeautyfacts_returned_tags": obf_returned, "openbeautyfacts_matched_seed": len(obf_matches)},
    }


def write_static_tables() -> None:
    write_csv(PROCESSED / "benefit_tags.csv", ["id", "tag_name", "description"], [{"id": i, "tag_name": name, "description": desc} for i, (name, desc) in enumerate(BENEFIT_TAGS, start=1)])
    write_csv(PROCESSED / "risk_tags.csv", ["id", "tag_name", "description"], [{"id": i, "tag_name": name, "description": desc} for i, (name, desc) in enumerate(RISK_TAGS, start=1)])
    write_csv(
        PROCESSED / "skin_types.csv",
        ["id", "name", "oiliness_default", "dryness_default", "sensitivity_default", "barrier_damage_default", "description"],
        [
            {
                "id": row[0],
                "name": row[1],
                "oiliness_default": row[2],
                "dryness_default": row[3],
                "sensitivity_default": row[4],
                "barrier_damage_default": row[5],
                "description": row[6],
            }
            for row in SKIN_TYPES
        ],
    )
    write_csv(
        PROCESSED / "skin_conditions.csv",
        ["id", "name", "acne_level", "dullness_level", "redness_level", "barrier_damage_level", "dryness_level", "oiliness_level", "description"],
        [
            {
                "id": row[0],
                "name": row[1],
                "acne_level": row[2],
                "dullness_level": row[3],
                "redness_level": row[4],
                "barrier_damage_level": row[5],
                "dryness_level": row[6],
                "oiliness_level": row[7],
                "description": row[8],
            }
            for row in SKIN_CONDITIONS
        ],
    )
    write_csv(
        PROCESSED / "condition_ingredient_rules.csv",
        ["id", "condition_name", "recommended_benefit_tag", "caution_risk_tag", "priority_score", "note"],
        [
            {
                "id": row[0],
                "condition_name": row[1],
                "recommended_benefit_tag": row[2],
                "caution_risk_tag": row[3],
                "priority_score": row[4],
                "note": row[5],
            }
            for row in CONDITION_RULES
        ],
    )
    write_json(PROCESSED / "routine_templates.json", ROUTINE_TEMPLATES)
    write_json(PROCESSED / "fuzzy_rules_seed.json", FUZZY_RULES)


def build_knowledge_source_audit_items(built: dict) -> list[dict]:
    rows = []
    number = 1

    def add(
        item_type: str,
        source_table: str,
        source_id: str,
        item_label: str,
        current_value: str,
        rationale: str,
        recommended_sources: str,
        evidence_level: str = "source_supported_seed",
    ) -> None:
        nonlocal number
        rows.append(
            knowledge_source_audit_row(
                number,
                item_type,
                source_table,
                source_id,
                item_label,
                current_value,
                rationale,
                recommended_sources,
                evidence_level,
            )
        )
        number += 1

    for row in built["ingredients"]:
        add(
            "ingredient_master",
            "ingredients_master.csv",
            str(row["id"]),
            row["inci_name"],
            f"group={row['ingredient_group']}; function={row['cosmetic_function']}",
            "Nama, kategori, dan fungsi ingredient disusun dari seed terkurasi serta dicocokkan dengan sumber kosmetik tepercaya bila tersedia.",
            "CosIng;COSMILE;CosmeticsInfo;Open Beauty Facts",
        )

    ingredient_by_id = {str(row["id"]): row["inci_name"] for row in built["ingredients"]}
    for row in built["benefits"]:
        ingredient_name = ingredient_by_id.get(str(row["ingredient_id"]), f"ingredient_id={row['ingredient_id']}")
        add(
            "ingredient_benefit",
            "ingredient_benefits.csv",
            str(row["id"]),
            f"{ingredient_name} -> {row['benefit_tag']}",
            f"strength_score={row['strength_score']}",
            "Benefit tag dan skor digunakan sebagai bobot keputusan fuzzy, bukan klaim medis atau jaminan hasil.",
            "COSMILE;CosmeticsInfo;CosIng;curated literature synthesis",
        )

    for row in built["risks"]:
        ingredient_name = ingredient_by_id.get(str(row["ingredient_id"]), f"ingredient_id={row['ingredient_id']}")
        add(
            "ingredient_risk",
            "ingredient_risks.csv",
            str(row["id"]),
            f"{ingredient_name} -> {row['risk_tag']}",
            f"risk_score={row['risk_score']}; condition={row['risk_condition']}",
            "Risk tag dan skor dipakai untuk kehati-hatian pada kondisi sensitif, kering, atau barrier terganggu.",
            "CosIng;COSMILE;CosmeticsInfo;curated literature synthesis",
        )

    for row in SKIN_TYPES:
        add(
            "skin_type_mapping",
            "skin_types.csv",
            str(row[0]),
            row[1],
            f"oiliness={row[2]}; dryness={row[3]}; sensitivity={row[4]}; barrier_damage={row[5]}",
            "Skor default dibuat sebagai representasi fuzzy 0-10 untuk kebutuhan rekomendasi, bukan diagnosis kulit.",
            "skincare domain literature;fuzzy Mamdani design rationale",
            "rule_engine_design",
        )

    for row in SKIN_CONDITIONS:
        add(
            "skin_condition_mapping",
            "skin_conditions.csv",
            str(row[0]),
            row[1],
            f"acne={row[2]}; dullness={row[3]}; redness={row[4]}; barrier_damage={row[5]}; dryness={row[6]}; oiliness={row[7]}",
            "Kontribusi kondisi kulit dipakai untuk menaikkan kebutuhan fuzzy tertentu secara terbatas dan informatif.",
            "skincare domain literature;fuzzy Mamdani design rationale",
            "rule_engine_design",
        )

    for row in CONDITION_RULES:
        add(
            "condition_ingredient_rule",
            "condition_ingredient_rules.csv",
            str(row[0]),
            f"{row[1]} -> {row[2]}",
            f"caution={row[3]}; priority={row[4]}",
            "Mapping kondisi ke benefit/risk dibuat untuk menghubungkan kebutuhan kulit dengan tag ingredient.",
            "COSMILE;CosmeticsInfo;curated literature synthesis",
            "rule_engine_design",
        )

    for rule in FUZZY_RULES:
        add(
            "fuzzy_rule",
            "fuzzy_rules_seed.json",
            rule["code"],
            rule["description"],
            f"if={json.dumps(rule['if'], ensure_ascii=False)}; then={json.dumps(rule['then'], ensure_ascii=False)}",
            "Rule fuzzy Mamdani menerjemahkan pengetahuan berbasis sumber ke kebutuhan kandungan dan kehati-hatian.",
            "fuzzy Mamdani method;skincare domain literature;curated rule synthesis",
            "source_documented_rule",
        )

    for template in ROUTINE_TEMPLATES:
        add(
            "routine_template",
            "routine_templates.json",
            template["profile"],
            template["profile"],
            f"look_for={', '.join(template.get('look_for', []))}; caution={', '.join(template.get('caution', []))}",
            "Template routine bersifat edukatif dan berbasis kandungan, bukan instruksi medis atau rekomendasi produk.",
            "COSMILE;CosmeticsInfo;curated literature synthesis",
        )

    return rows


def build_source_references() -> list[dict]:
    return [
        {
            "source_id": "SRC-001",
            "source_name": "CosIng - European Commission Cosmetic Ingredient Database",
            "source_type": "official_cosmetic_ingredient_database",
            "url": "https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en",
            "used_for": "INCI naming, cosmetic function reference, regulatory context.",
            "trust_level": "high",
            "collection_method": "reference_page_saved",
        },
        {
            "source_id": "SRC-002",
            "source_name": "COSMILE Europe",
            "source_type": "cosmetic_ingredient_education_reference",
            "url": "https://cosmileeurope.eu/inci/",
            "used_for": "Ingredient function explanation and user-friendly cosmetic context.",
            "trust_level": "high",
            "collection_method": "reference_page_saved",
        },
        {
            "source_id": "SRC-003",
            "source_name": "CosmeticsInfo",
            "source_type": "cosmetic_ingredient_education_reference",
            "url": "https://www.cosmeticsinfo.org/ingredients/",
            "used_for": "Ingredient description, cosmetic use context, and safety-oriented wording.",
            "trust_level": "medium_high",
            "collection_method": "reference_page_saved",
        },
        {
            "source_id": "SRC-004",
            "source_name": "Open Beauty Facts ingredient facets",
            "source_type": "public_ingredient_dataset",
            "url": "https://world.openbeautyfacts.org/ingredients.json?page_size=1000",
            "used_for": "Ingredient name normalization, alias matching, and aggregate frequency signal.",
            "trust_level": "medium",
            "collection_method": "api_json_fetch",
        },
        {
            "source_id": "SRC-005",
            "source_name": "Manual curated seed",
            "source_type": "internal_source_synthesis",
            "url": "data/raw/manual_seed/ingredient_seed.csv",
            "used_for": "Initial knowledge base, benefit/risk tag seed, fuzzy rule seed, and routine seed.",
            "trust_level": "controlled_project_seed",
            "collection_method": "curated_from_project_scope_and_trusted_reference_categories",
        },
    ]


def write_source_documentation_outputs(built: dict) -> dict:
    items = build_knowledge_source_audit_items(built)
    source_references = build_source_references()

    write_csv(
        PROCESSED / "knowledge_source_audit.csv",
        [
            "item_id",
            "item_type",
            "source_table",
            "source_id",
            "item_label",
            "current_value",
            "knowledge_status",
            "knowledge_method",
            "evidence_level",
            "recommended_sources",
            "rationale",
            "direct_expert_validation",
            "optional_expert_review",
        ],
        items,
    )
    write_csv(
        PROCESSED / "source_references.csv",
        ["source_id", "source_name", "source_type", "url", "used_for", "trust_level", "collection_method"],
        source_references,
    )

    summary = {
        "knowledge_status": KNOWLEDGE_STATUS,
        "knowledge_method": KNOWLEDGE_METHOD,
        "direct_expert_validation": DIRECT_EXPERT_VALIDATION,
        "optional_expert_review": OPTIONAL_EXPERT_REVIEW,
        "total_source_documented_items": len(items),
        "source_reference_count": len(source_references),
        "expert_validated_items": 0,
        "notes": "Dataset ini menggunakan pengetahuan berbasis sumber tepercaya dan tidak mengklaim validasi pakar langsung.",
    }
    write_json(PROCESSED / "knowledge_status_summary.json", summary)
    return {
        "knowledge_source_audit_items": len(items),
        "source_references": len(source_references),
    }


def write_docs(counts: dict) -> None:
    docs = ROOT / "docs"
    docs.mkdir(parents=True, exist_ok=True)
    (docs / "source_policy.md").write_text(
        """# Source Policy

Project ini hanya mengumpulkan data ingredient skincare dan metadata sumber.

Data yang tidak dikumpulkan:

- brand
- nama produk
- harga
- marketplace
- rating
- review
- username
- foto pengguna
- data personal

Sumber yang dipakai:

- Manual curated seed untuk knowledge base awal.
- Open Beauty Facts ingredient facet API untuk normalisasi nama dan frekuensi ingredient secara agregat.
- CosIng dan COSMILE disimpan sebagai halaman rujukan resmi. Pipeline tidak melakukan bulk scrape pada search interaktif.
- CosmeticsInfo disimpan sebagai halaman rujukan pendukung. Pipeline tidak melakukan bulk scrape pada detail ingredient.

CosIng diperlakukan sebagai rujukan nomenklatur dan fungsi kosmetik informatif, bukan bukti bahwa ingredient pasti direkomendasikan.
""",
        encoding="utf-8",
    )
    (docs / "data_dictionary.md").write_text(
        """# Data Dictionary

## ingredients_master.csv
Master kandungan skincare. Berisi INCI name, normalized name, group, cosmetic function, deskripsi, sumber, status, dan timestamp.

## ingredient_aliases.csv
Alias atau nama umum ingredient, termasuk alias manual dan nama dari Open Beauty Facts jika cocok.

## ingredient_benefits.csv
Mapping ingredient ke benefit tag dengan strength score skala 1-10.

## ingredient_risks.csv
Mapping ingredient ke risk tag dengan risk score skala 1-10 dan kondisi pemicu risiko.

## benefit_tags.csv
Daftar tag manfaat yang dipakai sistem rekomendasi.

## risk_tags.csv
Daftar tag kehati-hatian yang dipakai sistem rekomendasi.

## skin_types.csv
Jenis kulit dan skor default fuzzy 0-10.

## skin_conditions.csv
Kondisi kulit dan kontribusi skor fuzzy 0-10.

## condition_ingredient_rules.csv
Mapping kondisi kulit ke benefit tag prioritas dan risk tag yang perlu diperhatikan.

## fuzzy_rules_seed.json
Rule awal Fuzzy Mamdani untuk tahap aplikasi web.

## routine_templates.json
Template routine sederhana berbasis profil kebutuhan kandungan.

## knowledge_source_audit.csv
Daftar seluruh item pengetahuan yang dipakai sistem, status sumbernya, alasan penggunaannya, dan sumber rujukan yang direkomendasikan.

## source_references.csv
Daftar sumber resmi/tepercaya yang dipakai untuk menyusun dan mengaudit basis pengetahuan.

## knowledge_status_summary.json
Ringkasan status basis pengetahuan berbasis sumber.
""",
        encoding="utf-8",
    )
    (docs / "crawling_notes.md").write_text(
        f"""# Crawling Notes

Tanggal transformasi: {TODAY}

## Hasil sumber

- Open Beauty Facts ingredient tags ditarik: {counts['openbeautyfacts_returned_tags']}
- Open Beauty Facts total facet yang dilaporkan API: {counts['openbeautyfacts_total_tags']}
- Ingredient seed yang cocok dengan Open Beauty Facts: {counts['openbeautyfacts_matched_seed']}
- CosIng: halaman rujukan berhasil disimpan jika `run_crawl.py` sukses, tetapi bulk data tidak di-scrape.
- COSMILE: halaman rujukan berhasil disimpan jika `run_crawl.py` sukses, tetapi search interaktif tidak di-bulk-scrape.
- CosmeticsInfo: halaman rujukan berhasil disimpan jika `run_crawl.py` sukses, tetapi detail ingredient tidak di-bulk-scrape.

## Catatan etis

Pipeline ini tidak mengambil brand, produk, harga, review, foto, atau data personal. Open Beauty Facts dipakai hanya pada level facet ingredient agregat.
""",
        encoding="utf-8",
    )
    (docs / "dataset_report.md").write_text(
        f"""# Dataset Report

## Ringkasan

- Ingredient master: {counts['ingredients']}
- Alias ingredient: {counts['aliases']}
- Benefit rows: {counts['benefits']}
- Risk rows: {counts['risks']}
- Benefit tags: {counts['benefit_tags']}
- Risk tags: {counts['risk_tags']}
- Skin types: {counts['skin_types']}
- Skin conditions: {counts['skin_conditions']}
- Condition rules: {counts['condition_rules']}
- Fuzzy rules: {counts['fuzzy_rules']}
- Routine templates: {counts['routine_templates']}
- Knowledge source audit items: {counts['knowledge_source_audit_items']}
- Source references: {counts['source_references']}

## Batasan

Dataset ini adalah knowledge base edukatif untuk sistem pendukung keputusan kandungan skincare. Dataset bukan diagnosis medis dan tidak membuktikan satu ingredient cocok untuk semua orang.

Status saat ini adalah `{KNOWLEDGE_STATUS}` dengan metode `{KNOWLEDGE_METHOD}`. Dataset tidak mengklaim validasi pakar langsung, tetapi disusun dari sumber kosmetik tepercaya dan dokumentasi resmi/edukatif yang relevan.

## Sumber

- Manual curated seed sebagai baseline agar MVP tetap berjalan.
- Open Beauty Facts ingredient facet untuk normalisasi nama dan frekuensi ingredient agregat.
- CosIng, COSMILE, dan CosmeticsInfo sebagai rujukan konsep dan nomenklatur.
""",
        encoding="utf-8",
    )
    (docs / "knowledge_acquisition_report.md").write_text(
        f"""# Knowledge Acquisition Report

## Tujuan

Menjelaskan cara basis pengetahuan sistem pakar disusun tanpa mengklaim validasi pakar langsung.

## Status

- Knowledge status: `{KNOWLEDGE_STATUS}`
- Knowledge method: `{KNOWLEDGE_METHOD}`
- Direct expert validation: `{DIRECT_EXPERT_VALIDATION}`
- Optional expert review: `{OPTIONAL_EXPERT_REVIEW}`

## Metode Akuisisi Pengetahuan

1. Mengumpulkan sumber resmi dan tepercaya tentang ingredient kosmetik.
2. Menyusun daftar ingredient inti yang relevan untuk rekomendasi skincare.
3. Menormalisasi nama ingredient dan alias agar konsisten.
4. Mengelompokkan ingredient ke fungsi kosmetik, benefit tag, dan risk tag.
5. Mengubah pengetahuan tersebut menjadi skor 1-10 untuk kebutuhan sistem fuzzy.
6. Menyusun rule Fuzzy Mamdani untuk memetakan kondisi kulit ke kebutuhan kandungan.
7. Memvalidasi struktur data dengan script agar tidak ada duplikasi, field kosong, tag tidak dikenal, atau klaim terlarang.

## Sumber Utama

- CosIng: rujukan nama INCI, fungsi kosmetik, dan konteks regulasi kosmetik.
- COSMILE Europe: rujukan penjelasan ingredient untuk pengguna umum.
- CosmeticsInfo: rujukan deskripsi ingredient dan bahasa kehati-hatian.
- Open Beauty Facts: rujukan agregat ingredient dan variasi nama.
- Manual curated seed: sintesis awal yang dibatasi pada kebutuhan sistem dan sumber tepercaya.

## Batas Klaim

Sistem tidak melakukan diagnosis, tidak menjamin cocok untuk semua orang, dan tidak merekomendasikan brand atau produk tertentu.
""",
        encoding="utf-8",
    )
    (docs / "optional_expert_review_note.md").write_text(
        f"""# Optional Expert Review Note

Review pakar langsung bersifat opsional untuk scope tugas ini. Dataset saat ini tetap dapat dipakai untuk MVP karena statusnya sudah `source_documented`.

Jika nanti tersedia pakar, file `data/processed/knowledge_source_audit.csv` dapat dipakai sebagai daftar item yang perlu dicek.

## Contoh pakar yang relevan

1. Dokter kulit atau tenaga kesehatan kulit.
2. Apoteker atau reviewer keamanan kosmetik.
3. Formulator skincare.
4. Beauty consultant atau esthetician.
5. Dosen pembimbing atau reviewer metode fuzzy.

## Aturan klaim

Jangan menulis bahwa dataset sudah divalidasi pakar langsung kecuali review tersebut benar-benar dilakukan.
""",
        encoding="utf-8",
    )
    (docs / "source_based_methodology.md").write_text(
        """# Source-Based Expert System Methodology

Project ini menggunakan pendekatan source-based expert system.

Artinya, pengetahuan sistem tidak diambil dari klaim acak atau data marketplace, tetapi dari sumber ingredient kosmetik yang kredibel, lalu distrukturkan menjadi rule dan skor fuzzy.

## Cara Menulis di Laporan

Kalimat yang aman:

"Basis pengetahuan pada sistem ini disusun berdasarkan studi literatur dan sumber tepercaya terkait ingredient skincare, kemudian direpresentasikan ke dalam rule Fuzzy Mamdani."

Kalimat yang harus dihindari:

"Basis pengetahuan telah divalidasi oleh lima pakar" jika review tersebut tidak dilakukan.
""",
        encoding="utf-8",
    )
    (docs / "stage1_handoff_to_web.md").write_text(
        f"""# Stage 1 Handoff to Web App

## Status

Tahap 1 siap dipakai untuk MVP web tahap 2.

- Knowledge status: `{KNOWLEDGE_STATUS}`
- Knowledge method: `{KNOWLEDGE_METHOD}`
- Direct expert validation: `{DIRECT_EXPERT_VALIDATION}`
- Ingredient master: {counts['ingredients']}
- Benefit rows: {counts['benefits']}
- Risk rows: {counts['risks']}
- Fuzzy rules: {counts['fuzzy_rules']}
- Routine templates: {counts['routine_templates']}

## File yang Dipakai Tahap 2

- `data/processed/ingredients_master.csv`
- `data/processed/ingredient_aliases.csv`
- `data/processed/ingredient_benefits.csv`
- `data/processed/ingredient_risks.csv`
- `data/processed/skin_types.csv`
- `data/processed/skin_conditions.csv`
- `data/processed/fuzzy_rules_seed.json`
- `data/processed/routine_templates.json`
- `data/processed/skincare_ingredients.sqlite`

## Prinsip Implementasi Web

1. Tampilkan rekomendasi kandungan, bukan brand atau produk.
2. Gunakan disclaimer bahwa sistem bukan diagnosis medis.
3. Jangan memakai klaim pasti seperti cocok untuk semua orang atau menyembuhkan jerawat.
4. Tampilkan alasan rekomendasi berdasarkan benefit tag, risk tag, dan output fuzzy.
5. Simpan status dataset sebagai source-documented pada halaman admin/data bila ditampilkan.
""",
        encoding="utf-8",
    )


def run() -> dict:
    PROCESSED.mkdir(parents=True, exist_ok=True)
    INTERIM.mkdir(parents=True, exist_ok=True)
    cleanup_obsolete_outputs()
    built = build_rows()

    write_csv(
        PROCESSED / "ingredients_master.csv",
        ["id", "inci_name", "normalized_name", "alias_primary", "ingredient_group", "cosmetic_function", "description", "source", "reference_url", "status", "created_at", "updated_at"],
        built["ingredients"],
    )
    write_csv(PROCESSED / "ingredient_aliases.csv", ["id", "ingredient_id", "alias_name", "alias_type", "source"], built["aliases"])
    write_csv(PROCESSED / "ingredient_benefits.csv", ["id", "ingredient_id", "benefit_tag", "strength_score", "evidence_note", "source"], built["benefits"])
    write_csv(PROCESSED / "ingredient_risks.csv", ["id", "ingredient_id", "risk_tag", "risk_score", "risk_condition", "note", "source"], built["risks"])
    write_csv(INTERIM / "openbeautyfacts_matched_ingredients.csv", ["ingredient_id", "inci_name", "normalized_name", "openbeautyfacts_name", "frequency_count", "reference_url"], built["obf_matches"])
    write_static_tables()
    source_doc_counts = write_source_documentation_outputs(built)

    counts = {
        "ingredients": len(built["ingredients"]),
        "aliases": len(built["aliases"]),
        "benefits": len(built["benefits"]),
        "risks": len(built["risks"]),
        "benefit_tags": len(BENEFIT_TAGS),
        "risk_tags": len(RISK_TAGS),
        "skin_types": len(SKIN_TYPES),
        "skin_conditions": len(SKIN_CONDITIONS),
        "condition_rules": len(CONDITION_RULES),
        "fuzzy_rules": len(FUZZY_RULES),
        "routine_templates": len(ROUTINE_TEMPLATES),
        **source_doc_counts,
        **built["meta"],
    }
    metadata = {
        "project": "SPK Rekomendasi Kandungan Skincare Fuzzy Mamdani",
        "dataset_type": "ingredient_knowledge_base",
        "uses_brand_data": False,
        "uses_product_data": False,
        "uses_personal_data": False,
        "sources": ["manual_seed", "openbeautyfacts_ingredient_facets", "cosing_reference", "cosmile_reference", "cosmeticsinfo_reference"],
        "created_at": TODAY,
        "updated_at": TODAY,
        "ingredient_count": counts["ingredients"],
        "benefit_tag_count": counts["benefit_tags"],
        "risk_tag_count": counts["risk_tags"],
        "fuzzy_rule_count": counts["fuzzy_rules"],
        "openbeautyfacts_total_tags": counts["openbeautyfacts_total_tags"],
        "openbeautyfacts_returned_tags": counts["openbeautyfacts_returned_tags"],
        "openbeautyfacts_matched_seed": counts["openbeautyfacts_matched_seed"],
        "knowledge_status": KNOWLEDGE_STATUS,
        "knowledge_method": KNOWLEDGE_METHOD,
        "direct_expert_validation": DIRECT_EXPERT_VALIDATION,
        "expert_validation_required": False,
        "optional_expert_review": OPTIONAL_EXPERT_REVIEW,
        "expert_validated_items": 0,
        "knowledge_source_audit_item_count": counts["knowledge_source_audit_items"],
        "source_reference_count": counts["source_references"],
        "notes": "Dataset ini source-documented berbasis sumber tepercaya dan tidak mengklaim validasi pakar langsung.",
    }
    write_json(PROCESSED / "dataset_metadata.json", metadata)
    write_docs(counts)

    for key, value in counts.items():
        print(f"{key}: {value}")
    return counts


if __name__ == "__main__":
    run()
