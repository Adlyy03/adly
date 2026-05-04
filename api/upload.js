const { put, del } = require('@vercel/blob');

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

      const blob = await put(filename, buffer, {
        access: 'public',
        contentType: req.headers['content-type'],
      });

      return res.status(200).json({ url: blob.url });
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

      await del(url);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('[delete error]', err);
      return res.status(500).json({ error: err.message || 'Gagal menghapus.' });
    }
  }

  return res.status(405).json({ error: 'Method tidak diizinkan.' });
};
