# GitHub Pages Static Build

Folder ini adalah versi static untuk GitHub Pages.

## Cara Deploy

1. Push repository ke GitHub.
2. Buka repository `Settings`.
3. Masuk ke `Pages`.
4. Pilih:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/docs`
5. Simpan.

GitHub Pages akan melayani aplikasi dari folder `/docs`.

## Cara Update Data

Jalankan dari folder `skincare-spk-web`:

```bash
npm run build:pages
```

Command ini mengekspor dataset tahap 2 ke:

```text
docs/data/app-data.json
```

## Catatan Teknis

- Versi `/docs` tidak memakai Prisma, SQLite, atau API route karena GitHub Pages hanya mendukung static hosting.
- Fuzzy Mamdani dan scoring rekomendasi berjalan langsung di browser.
- Versi Next.js penuh tetap ada di `skincare-spk-web` untuk local development.
