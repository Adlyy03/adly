# Portfolio — Muhammad Adli Fajriyansyah

Portfolio website dengan Vercel Blob untuk upload gambar proyek & sertifikat.

---

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "feat: add vercel blob image upload"
git push
```

### 2. Import project di Vercel
- Buka [vercel.com/new](https://vercel.com/new)
- Import repo GitHub kamu
- Vercel otomatis detect konfigurasi dari `vercel.json`

### 3. Tambah Environment Variable
Di dashboard Vercel → **Settings → Environment Variables**, tambahkan:

| Key | Value |
|-----|-------|
| `BLOB_READ_WRITE_TOKEN` | Token dari Vercel Blob Store |

**Cara dapat token:**
1. Di dashboard Vercel → **Storage → Create Store → Blob**
2. Beri nama store (misal: `porto-images`)
3. Copy token `BLOB_READ_WRITE_TOKEN` yang muncul
4. Paste ke Environment Variables

### 4. Redeploy
Setelah env var ditambahkan, klik **Redeploy** di dashboard Vercel.

---

## Dev Lokal

### Install Vercel CLI
```bash
npm install -g vercel
```

### Login & link project
```bash
vercel login
vercel link
```

### Jalankan dev server
```bash
vercel dev
```

Buka `http://localhost:3000`

> `vercel dev` otomatis pull env vars dari Vercel dashboard, termasuk `BLOB_READ_WRITE_TOKEN`.

---

## Struktur

```
├── api/
│   └── upload.js      # Serverless function: upload & hapus gambar
├── public/
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   └── img/           # Gambar statis (foto profil, dll)
├── vercel.json        # Konfigurasi routing Vercel
└── package.json
```

## API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/upload?filename=foto.jpg` | Upload gambar ke Vercel Blob |
| `DELETE` | `/api/upload` | Hapus gambar (body: `{ url: "..." }`) |
