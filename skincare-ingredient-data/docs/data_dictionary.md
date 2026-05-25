# Data Dictionary

## ingredients_master.csv
Master kandungan skincare. Berisi INCI name, normalized name, group, cosmetic function, deskripsi, sumber, status, dan timestamp.

## ingredient_aliases.csv
Alias atau nama umum ingredient, termasuk alias manual dan nama dari Open Beauty Facts jika cocok.

## ingredient_benefits.csv
Mapping ingredient ke benefit tag dengan strength score skala 1-10.

## ingredient_risks.csv
Mapping ingredient ke risk tag dengan risk score skala 1-10 dan kondisi pemicu risiko.

## benefit_tags.csv
Daftar tag manfaat yang dipakai sistem rekomendasi.

## risk_tags.csv
Daftar tag kehati-hatian yang dipakai sistem rekomendasi.

## skin_types.csv
Jenis kulit dan skor default fuzzy 0-10.

## skin_conditions.csv
Kondisi kulit dan kontribusi skor fuzzy 0-10.

## condition_ingredient_rules.csv
Mapping kondisi kulit ke benefit tag prioritas dan risk tag yang perlu diperhatikan.

## fuzzy_rules_seed.json
Rule awal Fuzzy Mamdani untuk tahap aplikasi web.

## routine_templates.json
Template routine sederhana berbasis profil kebutuhan kandungan.

## knowledge_source_audit.csv
Daftar seluruh item pengetahuan yang dipakai sistem, status sumbernya, alasan penggunaannya, dan sumber rujukan yang direkomendasikan.

## source_references.csv
Daftar sumber resmi/tepercaya yang dipakai untuk menyusun dan mengaudit basis pengetahuan.

## knowledge_status_summary.json
Ringkasan status basis pengetahuan berbasis sumber.
