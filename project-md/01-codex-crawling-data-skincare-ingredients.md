# 01 — Prompt Codex: Crawling dan Penyusunan Dataset Kandungan Skincare

## Judul project

**Sistem Pendukung Keputusan Berbasis Web untuk Rekomendasi Skincare Berdasarkan Jenis dan Kondisi Kulit Menggunakan Metode Fuzzy Mamdani**

## Fokus tahap ini

Tahap ini hanya berfokus pada **pengumpulan, pembersihan, normalisasi, dan penyusunan dataset kandungan skincare**.

Sistem **tidak boleh fokus pada brand, produk, harga, toko, marketplace, atau review produk**. Sistem hanya fokus pada **kandungan/ingredient skincare** agar pengguna nantinya bebas memilih brand sendiri berdasarkan kandungan yang direkomendasikan.

## Prinsip utama

1. Sistem tidak merekomendasikan merek atau produk tertentu.
2. Sistem tidak melakukan diagnosis penyakit kulit.
3. Sistem tidak menggunakan kuesioner panjang.
4. Sistem menggunakan pilihan singkat dari pengguna, seperti jenis kulit, kondisi kulit, sensitivitas, dan tujuan skincare.
5. Dataset utama adalah **ingredient knowledge base**, bukan katalog produk.
6. Data yang dikumpulkan harus dapat ditelusuri sumbernya.
7. Jika suatu sumber tidak boleh di-crawl atau tidak stabil, buat seed data manual/kurasi dan catat alasannya.
8. Hormati robots.txt, Terms of Service, rate limit, dan jangan ambil data personal.
9. Jangan mengambil review pengguna, username, foto, atau data personal apa pun.
10. Hasil tahap ini harus bisa dipakai oleh tahap kedua untuk membangun aplikasi web SPK Fuzzy Mamdani.

## Tujuan teknis

Buat pipeline data untuk menghasilkan dataset berikut:

1. **Master kandungan skincare**
2. **Alias/nama umum ingredient**
3. **Fungsi kosmetik ingredient**
4. **Kategori ingredient**
5. **Benefit tag**
6. **Risk tag**
7. **Mapping jenis kulit ke skor awal**
8. **Mapping kondisi kulit ke kebutuhan skincare**
9. **Fuzzy rule seed**
10. **Template routine skincare berbasis kandungan**

Output akhirnya harus berupa file CSV/JSON dan schema database yang rapi.

---

# 1. Sumber data yang boleh diprioritaskan

Gunakan sumber publik dan legal. Prioritaskan sumber yang memang menyediakan informasi kosmetik/ingredient.

## 1.1 CosIng — European Commission Cosmetic Ingredient Database

URL rujukan:

```text
https://single-market-economy.ec.europa.eu/sectors/cosmetics/cosmetic-ingredient-database_en
https://ec.europa.eu/growth/tools-databases/cosing/
```

Data yang dicari:

- INCI name
- CAS number jika tersedia
- EC number jika tersedia
- fungsi kosmetik
- restriction/status bila tersedia
- referensi regulasi bila tersedia

Catatan:

- CosIng dipakai sebagai sumber nama dan fungsi ingredient.
- Jangan menganggap CosIng sebagai rekomendasi skincare langsung.
- CosIng bersifat informatif, sehingga tetap perlu knowledge base tambahan.

## 1.2 COSMILE Europe

URL rujukan:

```text
https://cosmileeurope.eu/
https://cosmileeurope.eu/inci/
```

Data yang dicari:

- nama INCI
- nama umum ingredient
- fungsi ingredient
- deskripsi ingredient yang mudah dipahami pengguna
- kategori ingredient bila tersedia

Catatan:

- Gunakan hanya jika akses crawling diperbolehkan.
- Jika tidak memungkinkan, gunakan sebagai rujukan manual untuk penyusunan seed data.

## 1.3 Open Beauty Facts

URL rujukan:

```text
https://github.com/openfoodfacts/openbeautyfacts
https://www.kaggle.com/datasets/openfoodfacts/openbeautyfacts
```

Data yang dicari:

- daftar ingredient dari label kosmetik
- variasi penulisan ingredient
- frekuensi ingredient umum
- sinonim atau nama ingredient yang sering muncul di label

Catatan:

- Jangan menjadikan produk/brand sebagai output sistem.
- Jika memakai Open Beauty Facts, gunakan hanya untuk memperkaya daftar ingredient dan normalisasi nama.
- Jangan tampilkan brand atau produk pada sistem final.

## 1.4 CosmeticsInfo / referensi pendukung lain

URL rujukan:

```text
https://www.cosmeticsinfo.org/
```

Data yang dicari:

- deskripsi ingredient
- fungsi umum ingredient
- penjelasan ingredient untuk pengguna awam

Catatan:

- Jika tidak boleh dicrawl, gunakan sebagai sumber rujukan manual.
- Simpan sumber pada field `source` atau `reference_url`.

---

# 2. Data yang tidak boleh dikumpulkan

Jangan ambil data berikut:

```text
brand
nama produk
harga produk
rating produk
review produk
marketplace
toko
stok produk
gambar produk
username reviewer
foto pengguna
profil pengguna
nomor telepon
alamat email pribadi
```

Alasan:

Project ini adalah rekomendasi **kandungan skincare**, bukan rekomendasi produk atau brand.

---

# 3. Struktur folder yang harus dibuat

Buat struktur folder berikut:

```text
skincare-ingredient-data/
├── README.md
├── data/
│   ├── raw/
│   │   ├── cosing/
│   │   ├── cosmile/
│   │   ├── openbeautyfacts/
│   │   └── manual_seed/
│   ├── interim/
│   └── processed/
├── database/
│   └── schema.sql
├── docs/
│   ├── data_dictionary.md
│   ├── crawling_notes.md
│   ├── source_policy.md
│   └── dataset_report.md
├── scripts/
│   ├── run_crawl.py
│   ├── run_transform.py
│   ├── run_validate.py
│   └── export_sqlite.py
├── src/
│   ├── crawlers/
│   │   ├── base.py
│   │   ├── cosing_crawler.py
│   │   ├── cosmile_crawler.py
│   │   └── openbeautyfacts_loader.py
│   ├── transformers/
│   │   ├── normalize_ingredients.py
│   │   ├── classify_ingredients.py
│   │   ├── generate_tags.py
│   │   └── build_fuzzy_seed.py
│   ├── validators/
│   │   └── validate_dataset.py
│   └── utils/
│       ├── text_cleaning.py
│       └── source_logger.py
└── requirements.txt
```

---

# 4. File output wajib

Setelah pipeline berjalan, hasilkan file berikut di `data/processed/`:

```text
ingredients_master.csv
ingredient_aliases.csv
ingredient_benefits.csv
ingredient_risks.csv
skin_types.csv
skin_conditions.csv
condition_ingredient_rules.csv
benefit_tags.csv
risk_tags.csv
routine_templates.json
fuzzy_rules_seed.json
dataset_metadata.json
```

Selain itu, hasilkan:

```text
database/schema.sql
data/processed/skincare_ingredients.sqlite
docs/data_dictionary.md
docs/dataset_report.md
```

---

# 5. Schema data

## 5.1 `ingredients_master.csv`

Field wajib:

```text
id
inci_name
normalized_name
alias_primary
ingredient_group
cosmetic_function
description
source
reference_url
status
created_at
updated_at
```

Contoh data:

```csv
id,inci_name,normalized_name,alias_primary,ingredient_group,cosmetic_function,description,source,reference_url,status,created_at,updated_at
1,Niacinamide,niacinamide,Vitamin B3,active,skin conditioning,"Kandungan yang umum dipakai untuk oil-control, brightening, dan barrier support",manual_seed,,active,2026-05-25,2026-05-25
2,Glycerin,glycerin,Glycerol,humectant,humectant,"Humectant yang membantu menarik dan menjaga kelembapan",manual_seed,,active,2026-05-25,2026-05-25
```

## 5.2 `ingredient_aliases.csv`

Field wajib:

```text
id
ingredient_id
alias_name
alias_type
source
```

Contoh:

```csv
id,ingredient_id,alias_name,alias_type,source
1,1,Vitamin B3,common_name,manual_seed
2,1,Nicotinamide,common_name,manual_seed
3,2,Glycerol,common_name,manual_seed
```

## 5.3 `ingredient_benefits.csv`

Field wajib:

```text
id
ingredient_id
benefit_tag
strength_score
evidence_note
source
```

`strength_score` berada pada skala 1–10.

Contoh:

```csv
id,ingredient_id,benefit_tag,strength_score,evidence_note,source
1,1,oil_control,8,"Dipakai dalam knowledge base sebagai kandungan pendukung kulit berminyak",manual_seed
2,1,brightening,7,"Dipakai dalam knowledge base sebagai kandungan pendukung kulit kusam",manual_seed
3,2,hydrating,9,"Humectant umum untuk mendukung hidrasi",manual_seed
```

## 5.4 `ingredient_risks.csv`

Field wajib:

```text
id
ingredient_id
risk_tag
risk_score
risk_condition
note
source
```

`risk_score` berada pada skala 1–10.

Contoh:

```csv
id,ingredient_id,risk_tag,risk_score,risk_condition,note,source
1,30,fragrance_risk,8,sensitive_skin,"Perlu kehati-hatian pada kulit sensitif",manual_seed
2,31,dryness_risk,7,dry_skin,"Perlu kehati-hatian pada kulit kering atau barrier terganggu",manual_seed
```

## 5.5 `benefit_tags.csv`

Buat tag berikut minimal:

```text
hydrating
barrier_repair
soothing
oil_control
acne_care
brightening
exfoliating
sunscreen_filter
basic_support
```

Field:

```text
id
tag_name
description
```

## 5.6 `risk_tags.csv`

Buat tag berikut minimal:

```text
fragrance_risk
essential_oil_risk
alcohol_denat_risk
strong_exfoliant_risk
photosensitivity_caution
dryness_irritation_risk
barrier_caution
unknown_safety
```

Field:

```text
id
tag_name
description
```

## 5.7 `skin_types.csv`

Field wajib:

```text
id
name
oiliness_default
dryness_default
sensitivity_default
barrier_damage_default
description
```

Nilai default skala 0–10.

Contoh:

```csv
id,name,oiliness_default,dryness_default,sensitivity_default,barrier_damage_default,description
1,berminyak,8,2,4,3,"Kulit cenderung menghasilkan minyak berlebih"
2,kering,2,8,5,5,"Kulit cenderung kurang lembap dan terasa tertarik"
3,kombinasi,6,5,4,3,"Area tertentu berminyak, area lain kering atau normal"
4,normal,4,4,3,2,"Kulit relatif seimbang"
5,sensitif,4,5,9,6,"Kulit mudah perih, merah, atau iritasi"
```

## 5.8 `skin_conditions.csv`

Field wajib:

```text
id
name
acne_level
dullness_level
redness_level
barrier_damage_level
dryness_level
oiliness_level
description
```

Nilai skala 0–10.

Contoh:

```csv
id,name,acne_level,dullness_level,redness_level,barrier_damage_level,dryness_level,oiliness_level,description
1,jerawat,8,2,4,3,2,6,"Kondisi kulit dengan jerawat aktif atau mudah breakout"
2,komedo,6,2,2,2,1,7,"Kondisi pori tersumbat atau komedo"
3,dehidrasi,1,4,3,5,8,2,"Kulit terasa kurang air atau tertarik"
4,kemerahan,2,2,8,6,4,3,"Kulit mudah merah atau reaktif"
5,skin_barrier_terganggu,2,3,6,9,7,3,"Kondisi barrier kulit lemah atau mudah iritasi"
6,kusam,1,8,2,2,3,3,"Kulit tampak kurang cerah atau tidak merata"
```

## 5.9 `condition_ingredient_rules.csv`

Field wajib:

```text
id
condition_name
recommended_benefit_tag
caution_risk_tag
priority_score
note
```

Contoh:

```csv
id,condition_name,recommended_benefit_tag,caution_risk_tag,priority_score,note
1,jerawat,acne_care,dryness_irritation_risk,8,"Acne-care boleh direkomendasikan tetapi tetap perlu memperhatikan sensitivitas"
2,komedo,exfoliating,strong_exfoliant_risk,7,"Exfoliating ringan bisa membantu, namun perlu batasan jika sensitif"
3,skin_barrier_terganggu,barrier_repair,strong_exfoliant_risk,9,"Prioritaskan barrier repair dan batasi exfoliant kuat"
```

---

# 6. Ingredient seed minimal

Walaupun crawling dilakukan, tetap buat seed manual awal agar sistem bisa berjalan jika crawler gagal.

Minimal masukkan ingredient berikut.

## 6.1 Hydrating

```text
Glycerin
Hyaluronic Acid
Sodium Hyaluronate
Beta-Glucan
Aloe Barbadensis Leaf Juice
Urea
Sodium PCA
```

Tag utama:

```text
hydrating
basic_support
```

## 6.2 Barrier repair

```text
Ceramide NP
Ceramide AP
Ceramide EOP
Cholesterol
Fatty Acid
Panthenol
Squalane
```

Tag utama:

```text
barrier_repair
basic_support
```

## 6.3 Soothing

```text
Panthenol
Allantoin
Centella Asiatica Extract
Madecassoside
Bisabolol
Green Tea Extract
Oat Extract
```

Tag utama:

```text
soothing
barrier_repair
```

## 6.4 Oil-control

```text
Niacinamide
Zinc PCA
Green Tea Extract
Kaolin
Charcoal
```

Tag utama:

```text
oil_control
```

## 6.5 Acne-care / komedo

```text
Salicylic Acid
Zinc PCA
Niacinamide
Azelaic Acid
Sulfur
```

Tag utama:

```text
acne_care
exfoliating
```

Catatan:

- Jangan membuat klaim menyembuhkan jerawat.
- Gunakan kalimat “mendukung perawatan kulit berjerawat ringan/komedo”.
- Jika sensitivitas tinggi, beri peringatan penggunaan bertahap.

## 6.6 Brightening / kusam

```text
Niacinamide
Ascorbyl Glucoside
Sodium Ascorbyl Phosphate
Magnesium Ascorbyl Phosphate
Alpha Arbutin
Licorice Root Extract
Tranexamic Acid
```

Tag utama:

```text
brightening
```

Catatan:

- Jangan klaim menghilangkan flek secara pasti.
- Gunakan kalimat “membantu tampilan kulit tampak lebih cerah/merata”.

## 6.7 Exfoliating

```text
Salicylic Acid
Lactic Acid
Mandelic Acid
Glycolic Acid
PHA
Gluconolactone
```

Tag utama:

```text
exfoliating
```

Risk tag:

```text
strong_exfoliant_risk
photosensitivity_caution
barrier_caution
```

## 6.8 Sunscreen filter

```text
Zinc Oxide
Titanium Dioxide
Avobenzone
Octocrylene
Tinosorb S
Tinosorb M
Uvinul A Plus
Uvinul T 150
```

Tag utama:

```text
sunscreen_filter
```

Catatan:

- Sistem tidak perlu merekomendasikan brand sunscreen.
- Output cukup menyarankan pengguna memilih sunscreen broad spectrum dan SPF yang sesuai.

## 6.9 Risk/sensitivity trigger

```text
Fragrance
Parfum
Limonene
Linalool
Citral
Geraniol
Alcohol Denat
Menthol
Peppermint Oil
Lavender Oil
Eucalyptus Oil
Tea Tree Oil
```

Risk tag:

```text
fragrance_risk
essential_oil_risk
alcohol_denat_risk
dryness_irritation_risk
```

Catatan:

- Jangan menyatakan ingredient ini selalu buruk.
- Gunakan sebagai indikator kehati-hatian, terutama untuk kulit sensitif, kering, atau barrier terganggu.

---

# 7. Normalisasi data

Terapkan aturan normalisasi berikut:

1. `normalized_name` dibuat lowercase.
2. Hapus spasi ganda.
3. Hapus karakter aneh yang tidak diperlukan.
4. Simpan `inci_name` dalam bentuk paling resmi/rapi.
5. Alias disimpan di tabel terpisah.
6. Ingredient duplikat harus digabung.
7. Jika ada ingredient sama dengan penulisan berbeda, gunakan mapping alias.
8. Jangan buang sumber asli. Simpan `source` dan `reference_url`.
9. Setiap baris hasil transformasi harus punya `created_at` dan `updated_at`.

Contoh mapping:

```text
vitamin b3 -> niacinamide
nicotinamide -> niacinamide
sodium hyaluronate -> sodium hyaluronate
hyaluronic acid -> hyaluronic acid
parfum -> fragrance
perfume -> fragrance
```

---

# 8. Klasifikasi ingredient

Buat fungsi klasifikasi untuk mengisi `ingredient_group`.

Kategori minimal:

```text
humectant
emollient
occlusive
active
exfoliant
soothing_agent
barrier_support
sunscreen_filter
surfactant
preservative
fragrance
essential_oil
solvent
unknown
```

Mapping awal:

```text
Glycerin -> humectant
Hyaluronic Acid -> humectant
Panthenol -> barrier_support / soothing_agent
Ceramide NP -> barrier_support
Niacinamide -> active
Zinc PCA -> active
Salicylic Acid -> exfoliant / active
Lactic Acid -> exfoliant
Glycolic Acid -> exfoliant
Zinc Oxide -> sunscreen_filter
Titanium Dioxide -> sunscreen_filter
Fragrance -> fragrance
Alcohol Denat -> solvent
```

---

# 9. Fuzzy rule seed

Buat file `fuzzy_rules_seed.json` berisi rule awal untuk tahap aplikasi.

Format:

```json
[
  {
    "code": "R1",
    "if": {
      "oiliness": "high",
      "acne": "high"
    },
    "then": {
      "oil_control_need": "high",
      "acne_care_need": "high",
      "soothing_need": "medium",
      "irritation_risk": "medium"
    },
    "description": "Kulit berminyak dan berjerawat membutuhkan kandungan oil-control dan acne-care, tetap didukung soothing."
  }
]
```

Rule minimal:

```text
R1: Jika oiliness tinggi dan acne tinggi, maka oil_control_need tinggi dan acne_care_need tinggi.
R2: Jika dryness tinggi, maka hydration_need tinggi dan barrier_repair_need tinggi.
R3: Jika sensitivity tinggi, maka soothing_need tinggi dan irritation_risk tinggi.
R4: Jika acne tinggi dan sensitivity tinggi, maka acne_care_need sedang, soothing_need tinggi, irritation_risk tinggi.
R5: Jika barrier_damage tinggi, maka barrier_repair_need tinggi dan exfoliation_caution tinggi.
R6: Jika oiliness tinggi dan sensitivity rendah, maka oil_control_need tinggi dan exfoliation_caution sedang.
R7: Jika dryness tinggi dan sensitivity tinggi, maka hydration_need tinggi, barrier_repair_need tinggi, dan hindari dryness_risk tinggi.
R8: Jika dullness tinggi dan sensitivity rendah, maka brightening_need tinggi dan exfoliation_caution sedang.
R9: Jika dullness tinggi dan sensitivity tinggi, maka brightening_need sedang dan exfoliation_caution tinggi.
R10: Jika normal dan tidak ada kondisi khusus, maka basic_support tinggi.
R11: Jika redness tinggi, maka soothing_need tinggi dan fragrance_risk tinggi.
R12: Jika acne sedang dan sensitivity sedang, maka acne_care_need sedang dan soothing_need sedang.
R13: Jika komedo/acne tinggi dan barrier_damage tinggi, maka acne_care_need sedang, barrier_repair_need tinggi, dan exfoliation_caution tinggi.
R14: Jika dryness tinggi dan oiliness tinggi, maka hydration_need tinggi dan oil_control_need sedang.
R15: Jika sensitivity rendah dan acne rendah dan dryness rendah, maka irritation_risk rendah.
```

---

# 10. Routine template

Buat `routine_templates.json`.

Format contoh:

```json
[
  {
    "profile": "oily_acne_prone",
    "morning": [
      "Gentle cleanser",
      "Moisturizer ringan dengan humectant/soothing ingredient",
      "Sunscreen broad spectrum"
    ],
    "night": [
      "Gentle cleanser",
      "Moisturizer ringan",
      "Acne-care ingredient secara bertahap jika cocok"
    ],
    "look_for": [
      "Niacinamide",
      "Zinc PCA",
      "Panthenol",
      "Glycerin",
      "Salicylic Acid rendah"
    ],
    "caution": [
      "Fragrance jika sensitif",
      "Exfoliant kuat jika barrier terganggu"
    ]
  }
]
```

Template minimal:

```text
oily_acne_prone
dry_dehydrated
sensitive_redness
barrier_damage
dullness_brightening
normal_basic
combination_skin
```

---

# 11. Validasi dataset

Buat script `scripts/run_validate.py` untuk mengecek:

1. Tidak ada ingredient dengan `normalized_name` kosong.
2. Tidak ada duplikat `normalized_name` pada `ingredients_master.csv`.
3. Setiap ingredient benefit punya `ingredient_id` valid.
4. Setiap ingredient risk punya `ingredient_id` valid.
5. Semua benefit tag harus terdaftar di `benefit_tags.csv`.
6. Semua risk tag harus terdaftar di `risk_tags.csv`.
7. Setiap ingredient harus punya minimal satu `source`.
8. Tidak ada field brand/product/price/marketplace di dataset final.
9. Minimal 80 ingredient tersedia.
10. Minimal 50 ingredient punya benefit/risk tag.
11. Minimal 15 fuzzy rules tersedia.
12. Minimal 5 skin types tersedia.
13. Minimal 6 skin conditions tersedia.

Jika validasi gagal, tampilkan pesan error yang jelas.

---

# 12. Database schema SQL

Buat `database/schema.sql` dengan tabel berikut:

```sql
CREATE TABLE ingredients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inci_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL UNIQUE,
  alias_primary TEXT,
  ingredient_group TEXT,
  cosmetic_function TEXT,
  description TEXT,
  source TEXT,
  reference_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT,
  updated_at TEXT
);

CREATE TABLE ingredient_aliases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  alias_name TEXT NOT NULL,
  alias_type TEXT,
  source TEXT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE ingredient_benefits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  benefit_tag TEXT NOT NULL,
  strength_score INTEGER NOT NULL,
  evidence_note TEXT,
  source TEXT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE ingredient_risks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient_id INTEGER NOT NULL,
  risk_tag TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  risk_condition TEXT,
  note TEXT,
  source TEXT,
  FOREIGN KEY (ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE skin_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  oiliness_default INTEGER NOT NULL,
  dryness_default INTEGER NOT NULL,
  sensitivity_default INTEGER NOT NULL,
  barrier_damage_default INTEGER NOT NULL,
  description TEXT
);

CREATE TABLE skin_conditions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  acne_level INTEGER DEFAULT 0,
  dullness_level INTEGER DEFAULT 0,
  redness_level INTEGER DEFAULT 0,
  barrier_damage_level INTEGER DEFAULT 0,
  dryness_level INTEGER DEFAULT 0,
  oiliness_level INTEGER DEFAULT 0,
  description TEXT
);

CREATE TABLE fuzzy_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_code TEXT NOT NULL UNIQUE,
  antecedent_json TEXT NOT NULL,
  consequent_json TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1
);
```

---

# 13. Command yang harus tersedia

Buat command berikut:

```bash
python scripts/run_crawl.py --source all
python scripts/run_transform.py
python scripts/run_validate.py
python scripts/export_sqlite.py
```

Jika crawler tidak bisa berjalan karena akses sumber dibatasi, pipeline tetap harus bisa menghasilkan dataset dari `data/raw/manual_seed/`.

---

# 14. Dataset metadata

Buat `dataset_metadata.json` berisi:

```json
{
  "project": "SPK Rekomendasi Kandungan Skincare Fuzzy Mamdani",
  "dataset_type": "ingredient_knowledge_base",
  "uses_brand_data": false,
  "uses_product_data": false,
  "uses_personal_data": false,
  "sources": [],
  "created_at": "",
  "updated_at": "",
  "ingredient_count": 0,
  "benefit_tag_count": 0,
  "risk_tag_count": 0,
  "fuzzy_rule_count": 0,
  "notes": "Dataset ini digunakan untuk rekomendasi kandungan skincare, bukan diagnosis medis."
}
```

---

# 15. Acceptance criteria tahap 1

Tahap crawling/penyusunan data dianggap selesai jika:

1. Folder project terbentuk sesuai struktur.
2. Pipeline bisa dijalankan dari awal sampai akhir.
3. Dataset processed berhasil dibuat.
4. SQLite database berhasil dibuat.
5. Validasi dataset berhasil tanpa error.
6. Dataset tidak mengandung brand, produk, harga, marketplace, atau data personal.
7. Minimal ada 80 ingredient.
8. Minimal ada 50 ingredient dengan benefit/risk tag.
9. Minimal ada 15 fuzzy rules.
10. Ada dokumentasi data dictionary.
11. Ada dataset report yang menjelaskan jumlah data, sumber, batasan, dan catatan etis.
12. Dataset siap dipakai oleh aplikasi web pada tahap kedua.

---

# 16. Output yang saya harapkan dari Codex

Setelah menjalankan instruksi ini, berikan:

1. Ringkasan file yang dibuat.
2. Cara menjalankan pipeline.
3. Lokasi dataset final.
4. Jumlah ingredient, benefit tag, risk tag, skin type, skin condition, dan fuzzy rule.
5. Catatan jika ada sumber yang tidak bisa dicrawl dan diganti dengan seed manual.
6. Instruksi untuk menghubungkan dataset ini ke aplikasi web tahap kedua.

