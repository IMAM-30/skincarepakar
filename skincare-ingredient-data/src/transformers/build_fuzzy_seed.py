FUZZY_RULES = [
    {
        "code": "R1",
        "if": {"oiliness": "high", "acne": "high"},
        "then": {"oil_control_need": "high", "acne_care_need": "high", "soothing_need": "medium", "irritation_risk": "medium"},
        "description": "Kulit berminyak dan berjerawat membutuhkan oil-control dan acne-care dengan dukungan soothing.",
    },
    {
        "code": "R2",
        "if": {"dryness": "high"},
        "then": {"hydration_need": "high", "barrier_repair_need": "high"},
        "description": "Kulit kering membutuhkan hidrasi dan barrier support tinggi.",
    },
    {
        "code": "R3",
        "if": {"sensitivity": "high"},
        "then": {"soothing_need": "high", "irritation_risk": "high"},
        "description": "Sensitivitas tinggi menaikkan kebutuhan soothing dan risiko iritasi.",
    },
    {
        "code": "R4",
        "if": {"acne": "high", "sensitivity": "high"},
        "then": {"acne_care_need": "medium", "soothing_need": "high", "irritation_risk": "high", "exfoliation_caution": "high"},
        "description": "Acne dengan sensitivitas tinggi perlu acne-care lebih hati-hati.",
    },
    {
        "code": "R5",
        "if": {"barrier_damage": "high"},
        "then": {"barrier_repair_need": "high", "hydration_need": "high", "exfoliation_caution": "high"},
        "description": "Barrier terganggu memprioritaskan barrier repair dan membatasi eksfoliasi.",
    },
    {
        "code": "R6",
        "if": {"oiliness": "high", "sensitivity": "low"},
        "then": {"oil_control_need": "high", "acne_care_need": "medium"},
        "description": "Kulit berminyak dengan sensitivitas rendah dapat menerima oil-control lebih aktif.",
    },
    {
        "code": "R7",
        "if": {"dryness": "high", "sensitivity": "high"},
        "then": {"hydration_need": "high", "barrier_repair_need": "high", "soothing_need": "high", "irritation_risk": "high"},
        "description": "Kulit kering sensitif perlu hidrasi barrier repair dan soothing.",
    },
    {
        "code": "R8",
        "if": {"dullness": "high", "sensitivity": "low"},
        "then": {"brightening_need": "high", "exfoliation_caution": "medium"},
        "description": "Kulit kusam dengan sensitivitas rendah dapat memakai brightening lebih aktif.",
    },
    {
        "code": "R9",
        "if": {"dullness": "high", "sensitivity": "high"},
        "then": {"brightening_need": "medium", "exfoliation_caution": "high"},
        "description": "Kulit kusam sensitif tetap butuh brightening namun lebih hati-hati.",
    },
    {
        "code": "R10",
        "if": {"oiliness": "low", "dryness": "low", "acne": "low", "sensitivity": "low"},
        "then": {"hydration_need": "medium", "irritation_risk": "low"},
        "description": "Profil seimbang tetap membutuhkan basic hydration.",
    },
    {
        "code": "R11",
        "if": {"acne": "medium", "sensitivity": "medium"},
        "then": {"acne_care_need": "medium", "soothing_need": "medium", "irritation_risk": "medium"},
        "description": "Acne dan sensitivitas sedang membutuhkan balancing antara acne-care dan soothing.",
    },
    {
        "code": "R12",
        "if": {"acne": "high", "barrier_damage": "high"},
        "then": {"acne_care_need": "medium", "barrier_repair_need": "high", "exfoliation_caution": "high"},
        "description": "Acne dengan barrier terganggu memprioritaskan barrier repair.",
    },
    {
        "code": "R13",
        "if": {"sensitivity": "high"},
        "then": {"soothing_need": "high", "irritation_risk": "high", "fragrance_penalty": "high"},
        "description": "Kemerahan dimapping ke sensitivitas dan memicu penalti fragrance.",
    },
    {
        "code": "R14",
        "if": {"oiliness": "high", "dryness": "high"},
        "then": {"hydration_need": "high", "oil_control_need": "medium"},
        "description": "Kondisi berminyak sekaligus kering memerlukan hidrasi tanpa oil-control berlebihan.",
    },
    {
        "code": "R15",
        "if": {"sensitivity": "low", "barrier_damage": "low"},
        "then": {"irritation_risk": "low"},
        "description": "Sensitivitas dan barrier damage rendah menurunkan risiko iritasi awal.",
    },
]

