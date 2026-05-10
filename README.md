# Portfolio — Muhammad Adli Fajriyansyah

Portfolio website dengan upload gambar proyek & sertifikat ke folder lokal `public/img`.

---

## Deploy ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "feat: add local image upload"
git push
```

### 2. Import project di Vercel
- Buka [vercel.com/new](https://vercel.com/new)
- Import repo GitHub kamu
- Vercel otomatis detect konfigurasi dari `vercel.json`

### 3. Deploy
Langsung deploy seperti biasa. Upload gambar sekarang disimpan ke `public/img` lewat endpoint `/api/upload`.

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
npm run dev
```

Buka `http://localhost:3000`

> Dev lokal sekarang pakai server Node bawaan repo, jadi tidak perlu login Vercel untuk upload.

---

## Struktur

```
├── api/
│   └── upload.js      # Serverless function: upload & hapus gambar lokal
├── public/
│   ├── index.html
│   ├── main.js
│   ├── style.css
│   └── img/           # Gambar hasil upload proyek & sertifikat
├── vercel.json        # Konfigurasi routing Vercel
└── package.json
```

## API

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/upload?filename=foto.jpg` | Upload gambar ke `public/img` |
| `DELETE` | `/api/upload` | Hapus gambar lokal (body: `{ url: "..." }`) |
