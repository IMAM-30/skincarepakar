import csv
import json
from pathlib import Path


REQUIRED_FILES = [
    "ingredients_master.csv",
    "ingredient_aliases.csv",
    "ingredient_benefits.csv",
    "ingredient_risks.csv",
    "skin_types.csv",
    "skin_conditions.csv",
    "condition_ingredient_rules.csv",
    "benefit_tags.csv",
    "risk_tags.csv",
    "routine_templates.json",
    "fuzzy_rules_seed.json",
    "dataset_metadata.json",
    "knowledge_source_audit.csv",
    "source_references.csv",
    "knowledge_status_summary.json",
]

FORBIDDEN_TABULAR_FIELDS = {"brand", "product", "produk", "price", "harga", "marketplace", "rating", "review", "username", "email", "phone", "foto", "image"}
FORBIDDEN_CLAIMS = ["menyembuhkan jerawat", "menghilangkan flek secara pasti", "aman 100%", "cocok untuk semua orang", "pengganti dokter"]


def read_csv(path: Path) -> list[dict]:
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle))


def validate(processed: Path) -> tuple[bool, list[str], dict]:
    errors: list[str] = []
    counts: dict[str, int] = {}

    for filename in REQUIRED_FILES:
        if not (processed / filename).exists():
            errors.append(f"File wajib belum ada: {filename}")
    if errors:
        return False, errors, counts

    ingredients = read_csv(processed / "ingredients_master.csv")
    aliases = read_csv(processed / "ingredient_aliases.csv")
    benefits = read_csv(processed / "ingredient_benefits.csv")
    risks = read_csv(processed / "ingredient_risks.csv")
    benefit_tags = read_csv(processed / "benefit_tags.csv")
    risk_tags = read_csv(processed / "risk_tags.csv")
    skin_types = read_csv(processed / "skin_types.csv")
    skin_conditions = read_csv(processed / "skin_conditions.csv")
    condition_rules = read_csv(processed / "condition_ingredient_rules.csv")
    fuzzy_rules = json.loads((processed / "fuzzy_rules_seed.json").read_text(encoding="utf-8"))
    routines = json.loads((processed / "routine_templates.json").read_text(encoding="utf-8"))
    metadata = json.loads((processed / "dataset_metadata.json").read_text(encoding="utf-8"))
    knowledge_source_rows = read_csv(processed / "knowledge_source_audit.csv")
    source_references = read_csv(processed / "source_references.csv")
    knowledge_summary = json.loads((processed / "knowledge_status_summary.json").read_text(encoding="utf-8"))

    counts.update(
        {
            "ingredients": len(ingredients),
            "aliases": len(aliases),
            "benefit_rows": len(benefits),
            "risk_rows": len(risks),
            "benefit_tags": len(benefit_tags),
            "risk_tags": len(risk_tags),
            "skin_types": len(skin_types),
            "skin_conditions": len(skin_conditions),
            "condition_rules": len(condition_rules),
            "fuzzy_rules": len(fuzzy_rules),
            "routine_templates": len(routines),
            "knowledge_source_audit_items": len(knowledge_source_rows),
            "source_references": len(source_references),
        }
    )

    ingredient_ids = {row["id"] for row in ingredients}
    normalized_names = [row["normalized_name"] for row in ingredients]
    if any(not name for name in normalized_names):
        errors.append("Ada ingredient dengan normalized_name kosong.")
    duplicates = sorted({name for name in normalized_names if normalized_names.count(name) > 1})
    if duplicates:
        errors.append(f"Ada duplikat normalized_name: {', '.join(duplicates[:10])}")

    for row in ingredients:
        if not row.get("source"):
            errors.append(f"Ingredient tanpa source: {row.get('inci_name')}")
        lower_blob = " ".join(str(value).lower() for value in row.values())
        for claim in FORBIDDEN_CLAIMS:
            if claim in lower_blob:
                errors.append(f"Klaim terlarang ditemukan pada ingredient {row.get('inci_name')}: {claim}")

    for row in benefits:
        if row["ingredient_id"] not in ingredient_ids:
            errors.append(f"Benefit mengarah ke ingredient_id tidak valid: {row['ingredient_id']}")
        score = int(row["strength_score"])
        if score < 1 or score > 10:
            errors.append(f"Benefit score di luar 1-10: {row}")

    for row in risks:
        if row["ingredient_id"] not in ingredient_ids:
            errors.append(f"Risk mengarah ke ingredient_id tidak valid: {row['ingredient_id']}")
        score = int(row["risk_score"])
        if score < 1 or score > 10:
            errors.append(f"Risk score di luar 1-10: {row}")

    valid_benefit_tags = {row["tag_name"] for row in benefit_tags}
    valid_risk_tags = {row["tag_name"] for row in risk_tags}
    unknown_benefits = sorted({row["benefit_tag"] for row in benefits if row["benefit_tag"] not in valid_benefit_tags})
    unknown_risks = sorted({row["risk_tag"] for row in risks if row["risk_tag"] not in valid_risk_tags})
    if unknown_benefits:
        errors.append(f"Benefit tag belum terdaftar: {', '.join(unknown_benefits)}")
    if unknown_risks:
        errors.append(f"Risk tag belum terdaftar: {', '.join(unknown_risks)}")

    for filename in ["ingredients_master.csv", "ingredient_aliases.csv", "ingredient_benefits.csv", "ingredient_risks.csv"]:
        with (processed / filename).open(encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle)
            bad_fields = [field for field in (reader.fieldnames or []) if field.lower() in FORBIDDEN_TABULAR_FIELDS]
            if bad_fields:
                errors.append(f"Field terlarang pada {filename}: {', '.join(bad_fields)}")

    tagged_ingredient_ids = {row["ingredient_id"] for row in benefits} | {row["ingredient_id"] for row in risks}
    counts["tagged_ingredients"] = len(tagged_ingredient_ids)
    if len(ingredients) < 80:
        errors.append(f"Ingredient kurang dari 80: {len(ingredients)}")
    if len(tagged_ingredient_ids) < 50:
        errors.append(f"Ingredient dengan benefit/risk tag kurang dari 50: {len(tagged_ingredient_ids)}")
    if len(fuzzy_rules) < 15:
        errors.append(f"Fuzzy rules kurang dari 15: {len(fuzzy_rules)}")
    if len(skin_types) < 5:
        errors.append(f"Skin types kurang dari 5: {len(skin_types)}")
    if len(skin_conditions) < 6:
        errors.append(f"Skin conditions kurang dari 6: {len(skin_conditions)}")

    if metadata.get("uses_brand_data") is not False:
        errors.append("dataset_metadata harus menyatakan uses_brand_data=false.")
    if metadata.get("uses_product_data") is not False:
        errors.append("dataset_metadata harus menyatakan uses_product_data=false.")
    if metadata.get("uses_personal_data") is not False:
        errors.append("dataset_metadata harus menyatakan uses_personal_data=false.")
    if metadata.get("knowledge_status") != "source_documented":
        errors.append("dataset_metadata harus berstatus source_documented.")
    if metadata.get("knowledge_method") != "trusted_source_literature_review":
        errors.append("dataset_metadata harus memakai knowledge_method trusted_source_literature_review.")
    if metadata.get("expert_validation_required") is not False:
        errors.append("dataset_metadata harus menyatakan expert_validation_required=false untuk scope source-documented.")
    if metadata.get("direct_expert_validation") != "not_performed":
        errors.append("dataset_metadata harus menyatakan direct_expert_validation=not_performed.")
    if int(metadata.get("expert_validated_items", -1)) != 0:
        errors.append("Tidak boleh ada expert_validated_items tanpa review pakar nyata.")

    if len(source_references) < 5:
        errors.append(f"Minimal 5 source references harus tersedia: {len(source_references)}")
    if not knowledge_source_rows:
        errors.append("knowledge_source_audit.csv kosong.")
    knowledge_values = {row.get("knowledge_status", "") for row in knowledge_source_rows}
    if knowledge_values != {"source_documented"}:
        errors.append(f"Knowledge status awal harus source_documented: {sorted(knowledge_values)}")
    method_values = {row.get("knowledge_method", "") for row in knowledge_source_rows}
    if method_values != {"trusted_source_literature_review"}:
        errors.append(f"Knowledge method harus trusted_source_literature_review: {sorted(method_values)}")
    expert_values = {row.get("direct_expert_validation", "") for row in knowledge_source_rows}
    if expert_values != {"not_performed"}:
        errors.append(f"Direct expert validation harus not_performed: {sorted(expert_values)}")
    if knowledge_summary.get("expert_validated_items") != 0:
        errors.append("knowledge_status_summary harus expert_validated_items=0 tanpa review pakar nyata.")
    if knowledge_summary.get("knowledge_status") != "source_documented":
        errors.append("knowledge_status_summary harus berstatus source_documented.")

    return not errors, errors, counts
