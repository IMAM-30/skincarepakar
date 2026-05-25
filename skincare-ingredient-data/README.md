# Skincare Ingredient Data

Dataset tahap 1 untuk project:

Sistem Pendukung Keputusan Berbasis Web untuk Rekomendasi Skincare Berdasarkan Jenis dan Kondisi Kulit Menggunakan Metode Fuzzy Mamdani.

## Batasan

Dataset ini berfokus pada kandungan skincare, bukan brand atau produk.

Tidak dikumpulkan:

- brand
- nama produk
- harga
- marketplace
- review
- rating
- username
- foto atau data personal

## Pipeline

```bash
python scripts/run_crawl.py --source all
python scripts/run_transform.py
python scripts/run_validate.py
python scripts/export_sqlite.py
```

## Output utama

File final tersedia di `data/processed/`:

- `ingredients_master.csv`
- `ingredient_aliases.csv`
- `ingredient_benefits.csv`
- `ingredient_risks.csv`
- `skin_types.csv`
- `skin_conditions.csv`
- `condition_ingredient_rules.csv`
- `benefit_tags.csv`
- `risk_tags.csv`
- `routine_templates.json`
- `fuzzy_rules_seed.json`
- `dataset_metadata.json`
- `knowledge_source_audit.csv`
- `source_references.csv`
- `knowledge_status_summary.json`
- `skincare_ingredients.sqlite`

## Status basis pengetahuan

Dataset saat ini berstatus `source_documented`.

Artinya basis pengetahuan disusun dari sumber tepercaya dan literatur ingredient kosmetik, bukan klaim acak atau data marketplace. Dataset tidak mengklaim validasi pakar langsung.

Review pakar langsung bersifat opsional. Jika suatu saat diperlukan, file `knowledge_source_audit.csv` dapat dipakai sebagai daftar item yang perlu ditinjau.

## Sumber

- Manual curated seed sebagai baseline knowledge base.
- Open Beauty Facts ingredient facet API untuk normalisasi dan frekuensi ingredient agregat.
- CosIng, COSMILE, dan CosmeticsInfo sebagai rujukan resmi. Search interaktif dan detail ingredient tidak di-bulk-scrape.

## Disclaimer

Dataset ini digunakan untuk sistem pendukung keputusan kandungan skincare. Dataset bukan diagnosis medis dan bukan bukti bahwa ingredient pasti cocok untuk semua orang.
