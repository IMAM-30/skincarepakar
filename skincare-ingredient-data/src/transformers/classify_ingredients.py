ALLOWED_GROUPS = {
    "humectant",
    "emollient",
    "occlusive",
    "active",
    "exfoliant",
    "soothing_agent",
    "barrier_support",
    "sunscreen_filter",
    "surfactant",
    "preservative",
    "fragrance",
    "essential_oil",
    "solvent",
    "absorbent",
    "cooling_agent",
    "thickener",
    "chelating_agent",
    "ph_adjuster",
    "unknown",
}


def normalize_group(group: str) -> str:
    return group if group in ALLOWED_GROUPS else "unknown"

