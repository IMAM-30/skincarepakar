# Knowledge Acquisition Report

## Tujuan

Menjelaskan cara basis pengetahuan sistem pakar disusun tanpa mengklaim validasi pakar langsung.

## Status

- Knowledge status: `source_documented`
- Knowledge method: `trusted_source_literature_review`
- Direct expert validation: `not_performed`
- Optional expert review: `available_if_required`

## Metode Akuisisi Pengetahuan

1. Mengumpulkan sumber resmi dan tepercaya tentang ingredient kosmetik.
2. Menyusun daftar ingredient inti yang relevan untuk rekomendasi skincare.
3. Menormalisasi nama ingredient dan alias agar konsisten.
4. Mengelompokkan ingredient ke fungsi kosmetik, benefit tag, dan risk tag.
5. Mengubah pengetahuan tersebut menjadi skor 1-10 untuk kebutuhan sistem fuzzy.
6. Menyusun rule Fuzzy Mamdani untuk memetakan kondisi kulit ke kebutuhan kandungan.
7. Memvalidasi struktur data dengan script agar tidak ada duplikasi, field kosong, tag tidak dikenal, atau klaim terlarang.

## Sumber Utama

- CosIng: rujukan nama INCI, fungsi kosmetik, dan konteks regulasi kosmetik.
- COSMILE Europe: rujukan penjelasan ingredient untuk pengguna umum.
- CosmeticsInfo: rujukan deskripsi ingredient dan bahasa kehati-hatian.
- Open Beauty Facts: rujukan agregat ingredient dan variasi nama.
- Manual curated seed: sintesis awal yang dibatasi pada kebutuhan sistem dan sumber tepercaya.

## Batas Klaim

Sistem tidak melakukan diagnosis, tidak menjamin cocok untuk semua orang, dan tidak merekomendasikan brand atau produk tertentu.
