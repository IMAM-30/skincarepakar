# SPK Rekomendasi Kandungan Skincare

Aplikasi web MVP untuk rekomendasi kandungan skincare berdasarkan jenis dan kondisi kulit menggunakan metode Fuzzy Mamdani.

## Batasan Sistem

- Sistem merekomendasikan kandungan, bukan brand atau produk.
- Sistem tidak menampilkan harga, marketplace, rating, review, cart, checkout, atau tombol beli.
- Sistem bukan alat diagnosis medis.
- Keputusan akhir tetap berada pada pengguna.

## Basis Pengetahuan

Dataset berasal dari tahap 1 dan berstatus `source_documented` dengan metode `trusted_source_literature_review`.

Sumber utama:

- CosIng
- COSMILE Europe
- CosmeticsInfo
- Open Beauty Facts ingredient facets
- Manual curated seed berbasis scope project

## Metode Fuzzy Mamdani

Input pengguna dipetakan ke skor 0-10:

- oiliness
- dryness
- acne
- sensitivity
- barrier_damage
- dullness

Rule Mamdani mengevaluasi kebutuhan kandungan seperti oil-control, hydration, acne-care, barrier-repair, soothing, brightening, exfoliation caution, dan irritation risk. Output didefuzzifikasi dengan metode centroid pada rentang 0-100.

## Struktur Data

Data tahap 1 disalin ke `data/processed/`:

- `ingredients_master.csv`
- `ingredient_aliases.csv`
- `ingredient_benefits.csv`
- `ingredient_risks.csv`
- `skin_types.csv`
- `skin_conditions.csv`
- `fuzzy_rules_seed.json`
- `routine_templates.json`

## Menjalankan Project

```bash
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Dev server berjalan di `http://localhost:3000`.

## Test

```bash
npm test
```

Test mencakup membership function, skenario Fuzzy Mamdani, dan ranking rekomendasi ingredient.

## Contoh Input

```json
{
  "skinType": "berminyak",
  "conditions": ["jerawat", "komedo"],
  "sensitivityLevel": "sedang",
  "goals": ["oil_control", "acne_care"],
  "avoidPreferences": ["hindari_fragrance"]
}
```

## Contoh Output

Sistem mengembalikan ringkasan input, skor fuzzy, kebutuhan kandungan, daftar recommended, supporting, use with caution, avoid if sensitive, routine sederhana, dan disclaimer.

## Rencana Lanjutan

- Tambah dokumentasi referensi per ingredient secara lebih rinci.
- Tambah halaman audit knowledge source.
- Tambah autentikasi admin jika aplikasi dipakai di luar MVP lokal.
- Tambah pengujian E2E untuk alur form sampai halaman hasil.

## Disclaimer

Sistem ini adalah sistem pendukung keputusan, bukan alat diagnosis medis. Hasil rekomendasi bersifat informatif berdasarkan data kandungan skincare dan aturan fuzzy.
