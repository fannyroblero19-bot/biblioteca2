const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM books ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { title, author, category, status } = req.body;
  if (!title || !author || !category || !status) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO books (title, author, category, status, created_at) VALUES (?, ?, ?, ?, ?)',
    [title, author, category, status, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, title, author, category, status, created_at: createdAt });
    }
  );
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, category, status } = req.body;
  db.run(
    'UPDATE books SET title = ?, author = ?, category = ?, status = ? WHERE id = ?',
    [title, author, category, status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Libro no encontrado.' });
      res.json({ id: Number(id), title, author, category, status });
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
