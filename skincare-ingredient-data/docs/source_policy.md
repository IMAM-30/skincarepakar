# Source Policy

Project ini hanya mengumpulkan data ingredient skincare dan metadata sumber.

Data yang tidak dikumpulkan:

- brand
- nama produk
- harga
- marketplace
- rating
- review
- username
- foto pengguna
- data personal

Sumber yang dipakai:

- Manual curated seed untuk knowledge base awal.
- Open Beauty Facts ingredient facet API untuk normalisasi nama dan frekuensi ingredient secara agregat.
- CosIng dan COSMILE disimpan sebagai halaman rujukan resmi. Pipeline tidak melakukan bulk scrape pada search interaktif.
- CosmeticsInfo disimpan sebagai halaman rujukan pendukung. Pipeline tidak melakukan bulk scrape pada detail ingredient.

CosIng diperlakukan sebagai rujukan nomenklatur dan fungsi kosmetik informatif, bukan bukti bahwa ingredient pasti direkomendasikan.
