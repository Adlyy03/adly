/**
 * api/upload.js — Vercel Serverless Function
 *
 * POST   /api/upload?filename=xxx.jpg  → upload ke Vercel Blob
 * DELETE /api/upload                   → hapus dari Vercel Blob
 */

const { put, del } = require('@vercel/blob');

// Matikan body parser bawaan Vercel agar bisa stream file langsung
module.exports.config = {
  api: { bodyParser: false },
};

module.exports = async function handler(req, res) {
  // CORS (berguna saat dev lokal)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST: Upload ─────────────────────────────────────────────────────────────
  if (req.method === 'POST') {
    try {
      const { filename } = req.query;
      if (!filename) {
        return res.status(400).json({ error: 'Query param ?filename= wajib diisi.' });
      }

      // Validasi ekstensi
      const ext = filename.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return res.status(400).json({ error: 'Tipe file tidak didukung.' });
      }

      const blob = await put(filename, req, {
        access: 'private',
        contentType: req.headers['content-type'],
      });

      return res.status(200).json({ url: blob.url });
    } catch (err) {
      console.error('[upload error]', err.message);
      return res.status(500).json({ error: err.message || 'Gagal mengupload.' });
    }
  }

  // ── DELETE: Hapus ─────────────────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    try {
      const body = await readBody(req);
      const { url } = body;

      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Field url wajib diisi.' });
      }

      // Hanya izinkan URL dari Vercel Blob (blob.vercel-storage.com)
      if (!url.includes('vercel-storage.com') && !url.includes('blob.vercel')) {
        return res.status(403).json({ error: 'URL tidak valid.' });
      }

      await del(url);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[delete error]', err.message);
      return res.status(500).json({ error: err.message || 'Gagal menghapus.' });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};

// Helper: baca body sebagai JSON
function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(raw)); }
      catch { reject(new Error('Body bukan JSON valid.')); }
    });
    req.on('error', reject);
  });
}
