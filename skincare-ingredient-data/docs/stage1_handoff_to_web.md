# Stage 1 Handoff to Web App

## Status

Tahap 1 siap dipakai untuk MVP web tahap 2.

- Knowledge status: `source_documented`
- Knowledge method: `trusted_source_literature_review`
- Direct expert validation: `not_performed`
- Ingredient master: 95
- Benefit rows: 155
- Risk rows: 53
- Fuzzy rules: 15
- Routine templates: 7

## File yang Dipakai Tahap 2

- `data/processed/ingredients_master.csv`
- `data/processed/ingredient_aliases.csv`
- `data/processed/ingredient_benefits.csv`
- `data/processed/ingredient_risks.csv`
- `data/processed/skin_types.csv`
- `data/processed/skin_conditions.csv`
- `data/processed/fuzzy_rules_seed.json`
- `data/processed/routine_templates.json`
- `data/processed/skincare_ingredients.sqlite`

## Prinsip Implementasi Web

1. Tampilkan rekomendasi kandungan, bukan brand atau produk.
2. Gunakan disclaimer bahwa sistem bukan diagnosis medis.
3. Jangan memakai klaim pasti seperti cocok untuk semua orang atau menyembuhkan jerawat.
4. Tampilkan alasan rekomendasi berdasarkan benefit tag, risk tag, dan output fuzzy.
5. Simpan status dataset sebagai source-documented pada halaman admin/data bila ditampilkan.
