# 02 — Prompt Codex: Bangun Sistem Web SPK Rekomendasi Kandungan Skincare dengan Fuzzy Mamdani

## Judul project

**Sistem Pendukung Keputusan Berbasis Web untuk Rekomendasi Skincare Berdasarkan Jenis dan Kondisi Kulit Menggunakan Metode Fuzzy Mamdani**

## Fokus tahap ini

Bangun aplikasi web berdasarkan dataset dari tahap pertama.

Aplikasi ini adalah **sistem pendukung keputusan** yang memberikan rekomendasi **kandungan skincare**, bukan rekomendasi brand atau produk.

Pengguna bebas memilih brand sendiri di luar sistem dengan mencocokkan kandungan yang direkomendasikan.

## Prinsip utama

1. Sistem tidak menampilkan atau merekomendasikan brand.
2. Sistem tidak menampilkan atau merekomendasikan produk tertentu.
3. Sistem tidak menggunakan kuesioner panjang.
4. Input pengguna hanya berupa pilihan ringkas.
5. Output berupa rekomendasi kandungan, skor kecocokan, alasan, peringatan risiko, dan panduan memilih produk.
6. Keputusan akhir tetap berada pada manusia/pengguna.
7. Sistem bukan alat diagnosis medis.
8. Fuzzy Mamdani digunakan untuk menghitung kebutuhan kandungan dan risiko iritasi.
9. Dataset yang dipakai berasal dari tahap pertama: ingredient knowledge base.

---

# 1. Tech stack yang digunakan

Gunakan stack berikut untuk MVP:

```text
Next.js App Router
TypeScript
Tailwind CSS
Prisma ORM
SQLite
React Hook Form atau form biasa
Zod untuk validasi input
Vitest untuk unit test
```

Jika package tertentu belum tersedia, tambahkan dependency yang diperlukan.

---

# 2. Struktur folder aplikasi

Buat struktur seperti berikut:

```text
skincare-spk-web/
├── README.md
├── package.json
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── data/
│   └── processed/
│       ├── ingredients_master.csv
│       ├── ingredient_aliases.csv
│       ├── ingredient_benefits.csv
│       ├── ingredient_risks.csv
│       ├── skin_types.csv
│       ├── skin_conditions.csv
│       ├── fuzzy_rules_seed.json
│       └── routine_templates.json
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── rekomendasi/
│   │   │   ├── page.tsx
│   │   │   └── hasil/
│   │   │       └── page.tsx
│   │   ├── ingredients/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── admin/
│   │   │   ├── ingredients/page.tsx
│   │   │   ├── rules/page.tsx
│   │   │   └── data/page.tsx
│   │   └── api/
│   │       ├── recommend/route.ts
│   │       ├── ingredients/route.ts
│   │       ├── skin-types/route.ts
│   │       ├── skin-conditions/route.ts
│   │       └── fuzzy-rules/route.ts
│   ├── components/
│   │   ├── RecommendationForm.tsx
│   │   ├── ResultSummary.tsx
│   │   ├── IngredientCard.tsx
│   │   ├── IngredientTable.tsx
│   │   ├── RiskWarning.tsx
│   │   ├── RoutineTemplate.tsx
│   │   └── ScoreBadge.tsx
│   ├── lib/
│   │   ├── db.ts
│   │   ├── fuzzy/
│   │   │   ├── membership.ts
│   │   │   ├── mamdani.ts
│   │   │   ├── rules.ts
│   │   │   └── defuzzification.ts
│   │   ├── recommendation/
│   │   │   ├── inputMapping.ts
│   │   │   ├── ingredientScoring.ts
│   │   │   ├── reasonGenerator.ts
│   │   │   └── routineSelector.ts
│   │   └── validation.ts
│   └── tests/
│       ├── fuzzy.test.ts
│       ├── recommendation.test.ts
│       └── scenarios.test.ts
└── .env.example
```

---

# 3. Data input dari tahap pertama

Aplikasi harus membaca data berikut dari folder `data/processed/`:

```text
ingredients_master.csv
ingredient_aliases.csv
ingredient_benefits.csv
ingredient_risks.csv
skin_types.csv
skin_conditions.csv
fuzzy_rules_seed.json
routine_templates.json
```

Saat menjalankan seed database, data tersebut dimasukkan ke SQLite melalui Prisma.

---

# 4. Database Prisma

Buat model berikut di `prisma/schema.prisma`.

Minimal tabel:

```text
Ingredient
IngredientAlias
IngredientBenefit
IngredientRisk
SkinType
SkinCondition
FuzzyRule
RecommendationSession
RecommendationResult
```

## Model yang dibutuhkan

```prisma
model Ingredient {
  id              Int                 @id @default(autoincrement())
  inciName        String
  normalizedName  String              @unique
  aliasPrimary    String?
  ingredientGroup String?
  cosmeticFunction String?
  description     String?
  source          String?
  referenceUrl    String?
  status          String              @default("active")
  aliases         IngredientAlias[]
  benefits        IngredientBenefit[]
  risks           IngredientRisk[]
}

model IngredientAlias {
  id           Int        @id @default(autoincrement())
  ingredientId Int
  aliasName    String
  aliasType    String?
  source       String?
  ingredient   Ingredient @relation(fields: [ingredientId], references: [id])
}

model IngredientBenefit {
  id            Int        @id @default(autoincrement())
  ingredientId  Int
  benefitTag    String
  strengthScore Int
  evidenceNote  String?
  source        String?
  ingredient    Ingredient @relation(fields: [ingredientId], references: [id])
}

model IngredientRisk {
  id            Int        @id @default(autoincrement())
  ingredientId  Int
  riskTag       String
  riskScore     Int
  riskCondition String?
  note          String?
  source        String?
  ingredient    Ingredient @relation(fields: [ingredientId], references: [id])
}

model SkinType {
  id                   Int     @id @default(autoincrement())
  name                 String  @unique
  oilinessDefault      Int
  drynessDefault       Int
  sensitivityDefault   Int
  barrierDamageDefault Int
  description          String?
}

model SkinCondition {
  id                 Int     @id @default(autoincrement())
  name               String  @unique
  acneLevel          Int     @default(0)
  dullnessLevel      Int     @default(0)
  rednessLevel       Int     @default(0)
  barrierDamageLevel Int     @default(0)
  drynessLevel       Int     @default(0)
  oilinessLevel      Int     @default(0)
  description        String?
}

model FuzzyRule {
  id             Int     @id @default(autoincrement())
  ruleCode       String  @unique
  antecedentJson String
  consequentJson String
  description    String?
  isActive       Boolean @default(true)
}

model RecommendationSession {
  id                 Int      @id @default(autoincrement())
  skinType           String
  selectedConditions String
  sensitivityLevel   String
  selectedGoals      String
  avoidPreferences   String
  oilinessScore      Float
  drynessScore       Float
  acneScore          Float
  sensitivityScore   Float
  barrierDamageScore Float
  dullnessScore      Float
  createdAt          DateTime @default(now())
  results            RecommendationResult[]
}

model RecommendationResult {
  id             Int      @id @default(autoincrement())
  sessionId      Int
  ingredientId   Int
  recommendationType String
  score          Float
  reason         String
  warning        String?
  session        RecommendationSession @relation(fields: [sessionId], references: [id])
  ingredient     Ingredient @relation(fields: [ingredientId], references: [id])
}
```

---

# 5. Input pengguna

Tidak ada kuesioner panjang.

Buat form rekomendasi dengan input berikut:

## 5.1 Jenis kulit

Dropdown tunggal:

```text
berminyak
kering
kombinasi
normal
sensitif
```

## 5.2 Kondisi kulit

Multi-select:

```text
jerawat
komedo
dehidrasi
kemerahan
skin_barrier_terganggu
kusam
bekas_jerawat_ringan
```

## 5.3 Tingkat sensitivitas

Radio button:

```text
rendah
sedang
tinggi
```

## 5.4 Tujuan skincare

Multi-select:

```text
oil_control
hidrasi
acne_care
soothing
barrier_repair
brightening
basic_care
```

## 5.5 Preferensi kehati-hatian

Checkbox:

```text
hindari_fragrance
hindari_essential_oil
hindari_alcohol_denat
hindari_exfoliant_kuat
```

---

# 6. Mapping input ke skor fuzzy

Buat file:

```text
src/lib/recommendation/inputMapping.ts
```

Tujuan file ini:

- Mengubah pilihan pengguna menjadi skor numerik 0–10.
- Skor ini menjadi input Fuzzy Mamdani.

## 6.1 Input fuzzy yang dihitung

```text
oiliness
dryness
acne
sensitivity
barrier_damage
dullness
```

## 6.2 Aturan mapping

Ambil default dari tabel `SkinType`, lalu tambahkan efek dari `SkinCondition`.

Contoh:

```text
Jenis kulit berminyak:
oiliness = 8
dryness = 2
sensitivity = 4
barrier_damage = 3
```

```text
Jika kondisi jerawat dipilih:
acne += 8
oiliness += 2
```

```text
Jika kondisi komedo dipilih:
acne += 6
oiliness += 2
```

```text
Jika kondisi dehidrasi dipilih:
dryness += 8
barrier_damage += 4
```

```text
Jika kondisi kemerahan dipilih:
sensitivity += 4
barrier_damage += 5
```

```text
Jika kondisi skin_barrier_terganggu dipilih:
barrier_damage += 9
dryness += 5
sensitivity += 3
```

```text
Jika kondisi kusam dipilih:
dullness += 8
```

Skor akhir harus dicap di rentang 0–10.

```ts
function clampScore(value: number): number {
  return Math.max(0, Math.min(10, value));
}
```

Jika sensitivitas dipilih manual:

```text
rendah = 2
sedang = 5
tinggi = 9
```

Nilai sensitivitas manual boleh override atau menaikkan skor sensitivitas dari skin type.

---

# 7. Metode Fuzzy Mamdani

Buat modul fuzzy di:

```text
src/lib/fuzzy/
```

## 7.1 Membership function input

Semua input berada pada rentang 0–10.

Gunakan himpunan fuzzy:

```text
low
medium
high
```

Parameter:

```text
low    = trapezoid [0, 0, 2, 4]
medium = triangle  [3, 5, 7]
high   = trapezoid [6, 8, 10, 10]
```

Implementasikan:

```ts
trapezoid(x, a, b, c, d)
triangle(x, a, b, c)
```

## 7.2 Output fuzzy

Output berada pada rentang 0–100.

Output yang harus dihitung:

```text
oil_control_need
hydration_need
acne_care_need
barrier_repair_need
soothing_need
brightening_need
exfoliation_caution
irritation_risk
```

Membership output:

```text
low    = trapezoid [0, 0, 25, 45]
medium = triangle  [35, 50, 65]
high   = trapezoid [55, 75, 100, 100]
```

## 7.3 Inferensi Mamdani

Gunakan:

```text
AND = min
OR = max
Implication = min
Aggregation = max
Defuzzification = centroid
```

Centroid dihitung dengan sampling 0–100, step 1.

---

# 8. Fuzzy rules

Baca rule dari tabel `FuzzyRule`, yang diseed dari `fuzzy_rules_seed.json`.

Minimal rule:

```text
R1: Jika oiliness high dan acne high, maka oil_control_need high, acne_care_need high, soothing_need medium, irritation_risk medium.
R2: Jika dryness high, maka hydration_need high dan barrier_repair_need high.
R3: Jika sensitivity high, maka soothing_need high dan irritation_risk high.
R4: Jika acne high dan sensitivity high, maka acne_care_need medium, soothing_need high, irritation_risk high, exfoliation_caution high.
R5: Jika barrier_damage high, maka barrier_repair_need high, hydration_need high, exfoliation_caution high.
R6: Jika oiliness high dan sensitivity low, maka oil_control_need high dan acne_care_need medium.
R7: Jika dryness high dan sensitivity high, maka hydration_need high, barrier_repair_need high, soothing_need high, irritation_risk high.
R8: Jika dullness high dan sensitivity low, maka brightening_need high dan exfoliation_caution medium.
R9: Jika dullness high dan sensitivity high, maka brightening_need medium dan exfoliation_caution high.
R10: Jika oiliness low dan dryness low dan acne low dan sensitivity low, maka hydration_need medium dan irritation_risk low.
R11: Jika acne medium dan sensitivity medium, maka acne_care_need medium, soothing_need medium, irritation_risk medium.
R12: Jika acne high dan barrier_damage high, maka acne_care_need medium, barrier_repair_need high, exfoliation_caution high.
R13: Jika redness/sensitivity high, maka soothing_need high dan fragrance_risk harus dipenalti saat scoring ingredient.
R14: Jika oiliness high dan dryness high, maka hydration_need high dan oil_control_need medium.
R15: Jika sensitivity low dan barrier_damage low, maka irritation_risk low.
```

Catatan:

- `redness` tidak harus menjadi input fuzzy terpisah. Kondisi kemerahan dapat menaikkan `sensitivity` dan `barrier_damage` di tahap mapping.
- Rule R13 memengaruhi scoring risk pada ingredient.

---

# 9. Scoring ingredient

Buat file:

```text
src/lib/recommendation/ingredientScoring.ts
```

Tujuan:

Mengubah hasil fuzzy menjadi ranking kandungan.

## 9.1 Mapping output fuzzy ke benefit tag

```text
oil_control_need     -> oil_control
hydration_need       -> hydrating
acne_care_need       -> acne_care
barrier_repair_need  -> barrier_repair
soothing_need        -> soothing
brightening_need     -> brightening
```

## 9.2 Formula skor ingredient

Untuk setiap ingredient:

```text
benefit_score = sum(output_need * ingredient_benefit_strength) / normalization
risk_penalty = risk_score * risk_multiplier
preference_bonus = bonus jika ingredient sesuai preferensi aman
final_score = benefit_score - risk_penalty + preference_bonus
```

Skor akhir dinormalisasi ke 0–100.

## 9.3 Risk penalty

Jika pengguna memilih kulit sensitif tinggi:

```text
fragrance_risk -> penalti tinggi
essential_oil_risk -> penalti tinggi
strong_exfoliant_risk -> penalti sedang/tinggi
alcohol_denat_risk -> penalti sedang
```

Jika barrier_damage tinggi:

```text
strong_exfoliant_risk -> penalti tinggi
barrier_caution -> penalti tinggi
```

Jika dryness tinggi:

```text
alcohol_denat_risk -> penalti tinggi
dryness_irritation_risk -> penalti sedang/tinggi
```

Jika exfoliation_caution tinggi:

```text
exfoliating ingredient tetap boleh muncul, tetapi masuk kategori "gunakan dengan hati-hati"
```

## 9.4 Kategori hasil rekomendasi

Gunakan kategori:

```text
recommended
supporting
use_with_caution
avoid_if_sensitive
```

Aturan:

```text
final_score >= 75 dan risk rendah/sedang -> recommended
final_score 60–74 -> supporting
benefit tinggi tetapi risk tinggi -> use_with_caution
risk tinggi dan cocok dengan kondisi sensitif/kering/barrier_damage -> avoid_if_sensitive
```

---

# 10. Reason generator

Buat file:

```text
src/lib/recommendation/reasonGenerator.ts
```

Sistem harus menjelaskan alasan rekomendasi dalam bahasa Indonesia yang sederhana.

Contoh template:

```text
Niacinamide direkomendasikan karena profil kulit Anda menunjukkan kebutuhan oil-control dan barrier support yang cukup tinggi. Kandungan ini masuk kategori pendukung untuk kulit berminyak dan kusam.
```

```text
Salicylic Acid masuk kategori gunakan dengan hati-hati karena cocok untuk komedo/jerawat ringan, tetapi sistem mendeteksi sensitivitas atau risiko iritasi yang cukup tinggi. Gunakan bertahap dan hentikan jika terjadi iritasi.
```

```text
Fragrance/parfum tidak menjadi prioritas karena Anda memilih kulit sensitif atau sistem mendeteksi risiko iritasi tinggi.
```

Jangan gunakan kalimat:

```text
menyembuhkan jerawat
menghilangkan flek secara pasti
aman 100%
cocok untuk semua orang
pengganti dokter
```

---

# 11. Output halaman hasil

Halaman hasil harus menampilkan:

## 11.1 Ringkasan input pengguna

Contoh:

```text
Jenis kulit: Berminyak
Kondisi kulit: Jerawat, komedo
Sensitivitas: Sedang
Tujuan: Oil-control dan acne-care
Preferensi: Hindari fragrance
```

## 11.2 Profil skor fuzzy

Tampilkan skor:

```text
Oiliness: 8/10
Dryness: 2/10
Acne: 8/10
Sensitivity: 5/10
Barrier damage: 3/10
Dullness: 0/10
```

## 11.3 Hasil kebutuhan kandungan

Tampilkan output fuzzy:

```text
Oil-control need: 86%
Hydration need: 45%
Acne-care need: 80%
Barrier-repair need: 52%
Soothing need: 60%
Brightening need: 20%
Exfoliation caution: 58%
Irritation risk: 55%
```

## 11.4 Kandungan utama yang direkomendasikan

Tabel:

```text
Kandungan | Fungsi | Skor | Alasan
```

Contoh:

```text
Niacinamide | oil-control, barrier support | 88% | Cocok karena kebutuhan oil-control tinggi.
Zinc PCA | oil-control | 82% | Cocok untuk profil kulit berminyak.
Panthenol | soothing, barrier support | 76% | Mendukung kulit agar lebih tenang.
Glycerin | hydrating | 72% | Membantu hidrasi dasar.
```

## 11.5 Kandungan pendukung

Contoh:

```text
Centella Asiatica Extract
Allantoin
Green Tea Extract
Sodium Hyaluronate
```

## 11.6 Kandungan yang perlu hati-hati

Contoh:

```text
Salicylic Acid — gunakan bertahap jika sensitivitas sedang/tinggi.
Glycolic Acid — hati-hati jika skin barrier terganggu.
Alcohol Denat — hati-hati jika kulit kering.
Fragrance/Parfum — hati-hati jika kulit sensitif.
```

## 11.7 Panduan memilih produk di toko

Karena sistem tidak merekomendasikan brand, beri panduan:

```text
Saat memilih produk, cek daftar ingredient. Prioritaskan produk yang mengandung kandungan pada daftar rekomendasi utama. Untuk kulit sensitif, prioritaskan label fragrance-free dan hindari kandungan yang masuk daftar kehati-hatian.
```

## 11.8 Routine sederhana

Contoh:

```text
Pagi:
1. Gentle cleanser
2. Moisturizer ringan dengan humectant/soothing ingredient
3. Sunscreen broad spectrum

Malam:
1. Gentle cleanser
2. Moisturizer
3. Acne-care ingredient secara bertahap jika cocok
```

## 11.9 Disclaimer

Wajib tampilkan:

```text
Sistem ini adalah sistem pendukung keputusan, bukan alat diagnosis medis. Hasil rekomendasi bersifat informatif berdasarkan data kandungan skincare dan aturan fuzzy. Keputusan akhir tetap berada pada pengguna. Jika terjadi iritasi berat, alergi, luka, atau kondisi kulit memburuk, konsultasikan dengan tenaga profesional.
```

---

# 12. Halaman aplikasi

Buat halaman berikut:

## 12.1 Home

Route:

```text
/
```

Isi:

- Judul sistem
- Penjelasan singkat
- Tombol mulai rekomendasi
- Penjelasan bahwa sistem tidak merekomendasikan brand

## 12.2 Form rekomendasi

Route:

```text
/rekomendasi
```

Isi:

- Form input singkat
- Validasi input
- Tombol proses rekomendasi

## 12.3 Hasil rekomendasi

Route:

```text
/rekomendasi/hasil
```

Isi:

- Ringkasan input
- Skor fuzzy
- Kandungan direkomendasikan
- Kandungan pendukung
- Kandungan hati-hati
- Routine sederhana
- Disclaimer

## 12.4 Daftar ingredient

Route:

```text
/ingredients
```

Isi:

- Search ingredient
- Filter berdasarkan benefit tag
- Filter berdasarkan risk tag
- Tabel ingredient

## 12.5 Detail ingredient

Route:

```text
/ingredients/[id]
```

Isi:

- Nama INCI
- Alias
- Fungsi kosmetik
- Benefit tag
- Risk tag
- Catatan sumber

## 12.6 Admin data browser sederhana

Route:

```text
/admin/data
/admin/ingredients
/admin/rules
```

Admin tidak perlu autentikasi untuk MVP lokal, tetapi beri catatan bahwa auth diperlukan jika production.

---

# 13. API endpoint

Buat endpoint:

## 13.1 `GET /api/skin-types`

Return daftar jenis kulit.

## 13.2 `GET /api/skin-conditions`

Return daftar kondisi kulit.

## 13.3 `GET /api/ingredients`

Query opsional:

```text
?q=niacinamide&benefit=oil_control&risk=fragrance_risk
```

## 13.4 `GET /api/fuzzy-rules`

Return daftar fuzzy rules aktif.

## 13.5 `POST /api/recommend`

Request body:

```json
{
  "skinType": "berminyak",
  "conditions": ["jerawat", "komedo"],
  "sensitivityLevel": "sedang",
  "goals": ["oil_control", "acne_care"],
  "avoidPreferences": ["hindari_fragrance"]
}
```

Response body:

```json
{
  "inputSummary": {},
  "mappedScores": {
    "oiliness": 8,
    "dryness": 2,
    "acne": 8,
    "sensitivity": 5,
    "barrier_damage": 3,
    "dullness": 0
  },
  "fuzzyOutputs": {
    "oil_control_need": 86,
    "hydration_need": 45,
    "acne_care_need": 80,
    "barrier_repair_need": 52,
    "soothing_need": 60,
    "brightening_need": 20,
    "exfoliation_caution": 58,
    "irritation_risk": 55
  },
  "recommended": [],
  "supporting": [],
  "useWithCaution": [],
  "avoidIfSensitive": [],
  "routine": {},
  "disclaimer": ""
}
```

---

# 14. Unit test wajib

Buat test dengan Vitest.

## 14.1 Test membership function

Cek:

```text
trapezoid(0, [0,0,2,4]) = 1
trapezoid(5, [0,0,2,4]) = 0
triangle(5, [3,5,7]) = 1
triangle(3, [3,5,7]) = 0
```

## 14.2 Test fuzzy scenario

Scenario 1:

```text
Input:
skinType = berminyak
conditions = jerawat, komedo
sensitivity = sedang

Expected:
oil_control_need tinggi
acne_care_need tinggi
soothing_need minimal sedang
```

Scenario 2:

```text
Input:
skinType = kering
conditions = dehidrasi, skin_barrier_terganggu
sensitivity = tinggi

Expected:
hydration_need tinggi
barrier_repair_need tinggi
irritation_risk tinggi
exfoliation_caution tinggi
```

Scenario 3:

```text
Input:
skinType = sensitif
conditions = kemerahan
sensitivity = tinggi

Expected:
soothing_need tinggi
irritation_risk tinggi
fragrance/essential oil masuk kategori hati-hati atau avoid_if_sensitive
```

## 14.3 Test recommendation ranking

Pastikan:

- Niacinamide muncul tinggi untuk oily/acne.
- Glycerin muncul tinggi untuk dry/dehydrated.
- Panthenol/Centella/Allantoin muncul tinggi untuk sensitive/redness.
- Fragrance tidak masuk recommended jika sensitivitas tinggi.
- Exfoliant kuat tidak masuk recommended jika barrier_damage tinggi.

---

# 15. UI style

Gunakan UI sederhana dan bersih.

Tema:

```text
clean
soft
medical-safe
educational
```

Jangan buat UI seperti toko online.

Hindari elemen:

```text
cart
checkout
buy button
brand logo
product card marketplace
harga produk
```

Gunakan elemen:

```text
score badge
explanation card
ingredient table
risk warning
routine guide
filter tag
```

---

# 16. Copywriting penting

Gunakan istilah:

```text
Direkomendasikan
Pendukung
Gunakan dengan hati-hati
Hindari jika sensitif
Skor kecocokan
Risiko iritasi
Kandungan utama
Kandungan pendukung
Panduan memilih produk
```

Hindari istilah:

```text
pasti cocok
pasti sembuh
obat
diagnosis
terbaik untuk semua orang
produk wajib
beli sekarang
```

---

# 17. Acceptance criteria tahap 2

Aplikasi dianggap selesai jika:

1. Bisa dijalankan dengan `npm run dev`.
2. Prisma migrate dan seed berhasil.
3. Dataset dari tahap pertama berhasil masuk database.
4. Form rekomendasi berjalan.
5. API `/api/recommend` mengembalikan hasil lengkap.
6. Fuzzy Mamdani berjalan dengan membership function, rule evaluation, aggregation, dan centroid defuzzification.
7. Sistem menampilkan kandungan recommended, supporting, use_with_caution, dan avoid_if_sensitive.
8. Tidak ada brand/produk/harga/marketplace di UI.
9. Ada halaman daftar ingredient.
10. Ada halaman detail ingredient.
11. Ada halaman admin data browser sederhana.
12. Ada unit test untuk fuzzy dan rekomendasi.
13. Ada disclaimer bahwa sistem bukan diagnosis medis.
14. Keputusan akhir tetap berada pada pengguna.

---

# 18. Command yang harus bisa dijalankan

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
npm test
```

Tambahkan script di `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest",
    "db:seed": "prisma db seed"
  }
}
```

---

# 19. README yang harus dibuat

`README.md` harus berisi:

1. Deskripsi project.
2. Batasan sistem.
3. Penjelasan bahwa sistem tidak merekomendasikan brand.
4. Penjelasan singkat metode Fuzzy Mamdani.
5. Struktur data.
6. Cara menjalankan aplikasi.
7. Cara menjalankan test.
8. Contoh input dan output.
9. Disclaimer.
10. Rencana pengembangan lanjutan.

---

# 20. Output yang saya harapkan dari Codex

Setelah membangun aplikasi, berikan:

1. Ringkasan fitur yang selesai.
2. Daftar file penting yang dibuat.
3. Cara menjalankan project.
4. Cara menguji rekomendasi.
5. Contoh skenario input dan output.
6. Catatan jika ada bagian yang masih dummy.
7. Saran pengembangan setelah MVP selesai.

---

# 21. Catatan akhir untuk Codex

Fokus utama project ini bukan menjual produk, tetapi membantu pengguna memahami **kandungan skincare apa yang perlu dicari atau dihindari** berdasarkan kondisi kulit mereka.

Output terbaik bukan “pakai produk X”, tetapi:

```text
Cari produk dengan kandungan A, B, C. Gunakan kandungan D dengan hati-hati. Hindari kandungan E jika kulit Anda sensitif. Keputusan akhir tetap pada pengguna.
```

