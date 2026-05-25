BENEFIT_TAGS = [
    ("hydrating", "Mendukung hidrasi dan kelembapan kulit."),
    ("barrier_repair", "Mendukung perawatan skin barrier."),
    ("soothing", "Mendukung rasa nyaman pada kulit reaktif."),
    ("oil_control", "Mendukung kontrol minyak berlebih."),
    ("acne_care", "Mendukung perawatan kulit berjerawat ringan atau komedo."),
    ("brightening", "Mendukung tampilan kulit tampak lebih cerah dan merata."),
    ("exfoliating", "Mendukung pengangkatan sel kulit mati secara kosmetik."),
    ("sunscreen_filter", "Filter UV untuk membantu perlindungan dari paparan matahari."),
    ("basic_support", "Bahan pendukung dasar formula skincare."),
]


RISK_TAGS = [
    ("fragrance_risk", "Perlu kehati-hatian pada kulit sensitif atau mudah iritasi."),
    ("essential_oil_risk", "Essential oil dapat menjadi pemicu reaksi pada kulit sensitif."),
    ("alcohol_denat_risk", "Alcohol denat dapat terasa mengeringkan pada sebagian kulit."),
    ("strong_exfoliant_risk", "Eksfoliant kuat perlu penggunaan bertahap dan terbatas."),
    ("photosensitivity_caution", "Perlu perhatian terhadap penggunaan sunscreen dan waktu pemakaian."),
    ("dryness_irritation_risk", "Berpotensi terasa kering atau mengiritasi pada kondisi tertentu."),
    ("barrier_caution", "Perlu kehati-hatian ketika skin barrier sedang terganggu."),
    ("unknown_safety", "Data kehati-hatian terbatas atau bergantung konteks formula."),
]


SKIN_TYPES = [
    (1, "berminyak", 8, 2, 4, 3, "Kulit cenderung menghasilkan minyak berlebih."),
    (2, "kering", 2, 8, 5, 5, "Kulit cenderung kurang lembap dan terasa tertarik."),
    (3, "kombinasi", 6, 5, 4, 3, "Sebagian area berminyak dan area lain normal atau kering."),
    (4, "normal", 4, 4, 3, 2, "Kulit relatif seimbang."),
    (5, "sensitif", 4, 5, 9, 6, "Kulit mudah terasa perih merah atau reaktif."),
]


SKIN_CONDITIONS = [
    (1, "jerawat", 8, 2, 4, 3, 2, 6, "Kondisi jerawat aktif ringan atau mudah breakout."),
    (2, "komedo", 6, 2, 2, 2, 1, 7, "Kondisi pori tersumbat atau komedo."),
    (3, "dehidrasi", 1, 4, 3, 5, 8, 2, "Kulit terasa kurang air atau tertarik."),
    (4, "kemerahan", 2, 2, 8, 6, 4, 3, "Kulit mudah merah atau reaktif."),
    (5, "skin_barrier_terganggu", 2, 3, 6, 9, 7, 3, "Skin barrier lemah atau mudah iritasi."),
    (6, "kusam", 1, 8, 2, 2, 3, 3, "Kulit tampak kurang cerah atau tidak merata."),
    (7, "bekas_jerawat_ringan", 2, 7, 2, 2, 2, 3, "Tampilan noda ringan pascajerawat tanpa klaim medis."),
]


CONDITION_RULES = [
    (1, "jerawat", "acne_care", "dryness_irritation_risk", 8, "Acne-care untuk dukungan kulit berjerawat ringan dengan perhatian sensitivitas."),
    (2, "komedo", "exfoliating", "strong_exfoliant_risk", 7, "Eksfoliasi ringan dapat dipertimbangkan dengan batasan sensitivitas."),
    (3, "dehidrasi", "hydrating", "dryness_irritation_risk", 9, "Prioritaskan humectant dan barrier support."),
    (4, "kemerahan", "soothing", "fragrance_risk", 9, "Prioritaskan soothing dan batasi fragrance."),
    (5, "skin_barrier_terganggu", "barrier_repair", "barrier_caution", 10, "Prioritaskan barrier repair dan batasi eksfoliant kuat."),
    (6, "kusam", "brightening", "photosensitivity_caution", 7, "Brightening kosmetik perlu sunscreen dan kehati-hatian eksfoliasi."),
    (7, "bekas_jerawat_ringan", "brightening", "photosensitivity_caution", 7, "Dukung tampilan warna kulit lebih merata tanpa klaim menghilangkan flek."),
]


ROUTINE_TEMPLATES = [
    {
        "profile": "oily_acne_prone",
        "morning": ["Gentle cleanser", "Moisturizer ringan dengan humectant atau soothing ingredient", "Sunscreen broad spectrum"],
        "night": ["Gentle cleanser", "Moisturizer ringan", "Acne-care ingredient secara bertahap jika cocok"],
        "look_for": ["Niacinamide", "Zinc PCA", "Panthenol", "Glycerin", "Salicylic Acid rendah"],
        "caution": ["Fragrance jika sensitif", "Eksfoliant kuat jika barrier terganggu"],
    },
    {
        "profile": "dry_dehydrated",
        "morning": ["Gentle cleanser", "Humectant serum", "Moisturizer dengan emollient atau occlusive", "Sunscreen broad spectrum"],
        "night": ["Gentle cleanser", "Humectant", "Barrier-support moisturizer"],
        "look_for": ["Glycerin", "Sodium Hyaluronate", "Urea", "Ceramide NP", "Squalane"],
        "caution": ["Alcohol denat", "Eksfoliasi terlalu sering"],
    },
    {
        "profile": "sensitive_redness",
        "morning": ["Gentle cleanser atau bilas air", "Soothing moisturizer", "Sunscreen broad spectrum"],
        "night": ["Gentle cleanser", "Soothing dan barrier-support moisturizer"],
        "look_for": ["Panthenol", "Allantoin", "Centella Asiatica Extract", "Madecassoside", "Beta-Glucan"],
        "caution": ["Fragrance", "Essential oil", "Menthol", "Eksfoliant kuat"],
    },
    {
        "profile": "barrier_damage",
        "morning": ["Gentle cleanser", "Barrier moisturizer", "Sunscreen broad spectrum"],
        "night": ["Gentle cleanser", "Ceramide atau panthenol moisturizer"],
        "look_for": ["Ceramide NP", "Cholesterol", "Panthenol", "Petrolatum", "Squalane"],
        "caution": ["Strong exfoliant", "Alcohol denat", "Fragrance"],
    },
    {
        "profile": "dullness_brightening",
        "morning": ["Gentle cleanser", "Brightening support jika cocok", "Moisturizer", "Sunscreen broad spectrum"],
        "night": ["Gentle cleanser", "Hydrating step", "Brightening atau eksfoliasi ringan secara bertahap"],
        "look_for": ["Niacinamide", "Ascorbyl Glucoside", "Alpha-Arbutin", "Licorice Root Extract", "Tranexamic Acid"],
        "caution": ["Photosensitivity", "Eksfoliant kuat pada kulit sensitif"],
    },
    {
        "profile": "normal_basic",
        "morning": ["Gentle cleanser", "Moisturizer ringan", "Sunscreen broad spectrum"],
        "night": ["Gentle cleanser", "Moisturizer"],
        "look_for": ["Glycerin", "Panthenol", "Niacinamide", "Squalane"],
        "caution": ["Tambahkan active secara bertahap"],
    },
    {
        "profile": "combination_skin",
        "morning": ["Gentle cleanser", "Moisturizer ringan pada area berminyak", "Moisturizer lebih nyaman pada area kering", "Sunscreen broad spectrum"],
        "night": ["Gentle cleanser", "Hydrating step", "Oil-control ringan pada T-zone jika perlu"],
        "look_for": ["Niacinamide", "Glycerin", "Panthenol", "Green Tea Extract"],
        "caution": ["Over-exfoliation", "Produk terlalu drying pada area kering"],
    },
]

