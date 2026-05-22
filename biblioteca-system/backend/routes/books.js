const express = require('express');
const db = require('../database');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();

// Ensure upload directory exists (publicly served under /uploads)
const uploadsDir = path.join(__dirname, '..', '..', '..', 'documentos', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random()*1e9)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

router.get('/', (req, res) => {
  db.all('SELECT * FROM books ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', upload.single('cover_file'), (req, res) => {
  const body = req.body || {};
  const { title, author, category, status, description, isbn, year, publisher, cover_url } = body;
  if (!title || !author || !category || !status) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  const createdAt = new Date().toISOString();
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : (cover_url || '');
  db.run(
    'INSERT INTO books (title, author, category, status, description, isbn, year, publisher, cover_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, author, category, status, description || '', isbn || '', year || null, publisher || '', fileUrl, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, author, category, status, description, isbn, year, publisher, cover_url: fileUrl, created_at: createdAt });
    }
  );
});

router.put('/:id', upload.single('cover_file'), (req, res) => {
  const { id } = req.params;
  const body = req.body || {};
  const { title, author, category, status, description, isbn, year, publisher, cover_url } = body;
  const fileUrl = req.file ? `/uploads/${req.file.filename}` : (cover_url || '');
  db.run(
    'UPDATE books SET title = ?, author = ?, category = ?, status = ?, description = ?, isbn = ?, year = ?, publisher = ?, cover_url = ? WHERE id = ?',
    [title, author, category, status, description || '', isbn || '', year || null, publisher || '', fileUrl, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Libro no encontrado.' });
      res.json({ id: Number(id), title, author, category, status, description, isbn, year, publisher, cover_url: fileUrl });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM books WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Libro no encontrado.' });
    res.json({ success: true });
  });
});

module.exports = router;
