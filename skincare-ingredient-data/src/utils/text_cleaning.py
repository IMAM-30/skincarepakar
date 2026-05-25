import re
import unicodedata


def clean_text(value: str | None) -> str:
    if value is None:
        return ""
    value = unicodedata.normalize("NFKC", str(value))
    value = value.replace("\u00a0", " ")
    value = re.sub(r"\s+", " ", value).strip()
    return value


def normalize_name(value: str | None) -> str:
    value = clean_text(value).lower()
    value = value.replace(".", "")
    value = value.replace("_", " ")
    value = re.sub(r"[^a-z0-9/\-\s]", "", value)
    value = re.sub(r"\s+", " ", value).strip()
    alias_map = {
        "vitamin b3": "niacinamide",
        "nicotinamide": "niacinamide",
        "glycerol": "glycerin",
        "parfum": "fragrance",
        "perfume": "fragrance",
        "denatured alcohol": "alcohol denat",
        "alcohol denat": "alcohol denat",
        "green tea extract": "camellia sinensis leaf extract",
        "oat extract": "avena sativa kernel extract",
        "licorice root extract": "glycyrrhiza glabra root extract",
        "alpha arbutin": "alpha-arbutin",
        "tinosorb s": "bemotrizinol",
        "tinosorb m": "bisoctrizole",
        "uvinul a plus": "diethylamino hydroxybenzoyl hexyl benzoate",
        "uvinul t 150": "ethylhexyl triazone",
        "tea tree oil": "melaleuca alternifolia leaf oil",
        "lavender oil": "lavandula angustifolia oil",
        "eucalyptus oil": "eucalyptus globulus leaf oil",
        "water": "aqua",
    }
    return alias_map.get(value, value)


def split_pipe(value: str | None) -> list[str]:
    return [clean_text(part) for part in clean_text(value).split("|") if clean_text(part)]

