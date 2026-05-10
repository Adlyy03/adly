const fs = require('fs/promises');
const path = require('path');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'img');
const PUBLIC_IMAGE_PREFIX = '/img/';

function sanitizeFilename(filename) {
  const baseName = path.basename(filename || 'upload.jpg');
  return baseName.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function getLocalFilenameFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith(PUBLIC_IMAGE_PREFIX)) return null;

  const rawName = url.slice(PUBLIC_IMAGE_PREFIX.length).split('?')[0];
  try {
    return sanitizeFilename(decodeURIComponent(rawName));
  } catch (_) {
    return sanitizeFilename(rawName);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    try {
      const { filename } = req.query;
      if (!filename) return res.status(400).json({ error: 'filename wajib diisi.' });

      const ext = filename.split('.').pop().toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) {
        return res.status(400).json({ error: 'Tipe file tidak didukung.' });
      }

      // Baca body sebagai buffer (Vercel sudah parse jadi buffer)
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const buffer = Buffer.concat(chunks);

      await fs.mkdir(UPLOAD_DIR, { recursive: true });

      const safeFilename = sanitizeFilename(filename);
      const filePath = path.join(UPLOAD_DIR, safeFilename);
      await fs.writeFile(filePath, buffer);

      return res.status(200).json({ url: `${PUBLIC_IMAGE_PREFIX}${encodeURIComponent(safeFilename)}` });
    } catch (err) {
      console.error('[upload error]', err);
      return res.status(500).json({ error: err.message || 'Gagal mengupload.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString());
      const { url } = body;

      if (!url) return res.status(400).json({ error: 'url wajib diisi.' });

      const localFilename = getLocalFilenameFromUrl(url);
      if (localFilename) {
        try {
          await fs.unlink(path.join(UPLOAD_DIR, localFilename));
        } catch (unlinkErr) {
          if (unlinkErr.code !== 'ENOENT') throw unlinkErr;
        }
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[delete error]', err);
      return res.status(500).json({ error: err.message || 'Gagal menghapus.' });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
