from src.utils.text_cleaning import clean_text, normalize_name, split_pipe


def parse_benefit_tags(value: str | None) -> list[dict]:
    rows = []
    for part in split_pipe(value):
        pieces = part.split(":")
        if len(pieces) < 2:
            continue
        rows.append({"tag": normalize_name(pieces[0]).replace(" ", "_"), "score": int(pieces[1])})
    return rows


def parse_risk_tags(value: str | None) -> list[dict]:
    rows = []
    for part in split_pipe(value):
        pieces = part.split(":")
        if len(pieces) < 2:
            continue
        rows.append(
            {
                "tag": normalize_name(pieces[0]).replace(" ", "_"),
                "score": int(pieces[1]),
                "condition": clean_text(pieces[2]) if len(pieces) > 2 else "",
            }
        )
    return rows


def normalize_seed_row(row: dict) -> dict:
    inci_name = clean_text(row.get("inci_name"))
    aliases = split_pipe(row.get("aliases"))
    return {
        "inci_name": inci_name,
        "normalized_name": normalize_name(inci_name),
        "alias_primary": aliases[0] if aliases else "",
        "aliases": aliases,
        "ingredient_group": normalize_name(row.get("ingredient_group")).replace(" ", "_"),
        "cosmetic_function": clean_text(row.get("cosmetic_function")),
        "description": clean_text(row.get("description")),
        "benefits": parse_benefit_tags(row.get("benefits")),
        "risks": parse_risk_tags(row.get("risks")),
        "source": clean_text(row.get("source")) or "manual_seed",
        "reference_url": clean_text(row.get("reference_url")),
        "status": clean_text(row.get("status")) or "active",
    }

