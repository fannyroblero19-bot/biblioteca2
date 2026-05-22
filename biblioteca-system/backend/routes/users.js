const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT * FROM users ORDER BY joined_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }
  const joinedAt = new Date().toISOString();
  db.run(
    'INSERT INTO users (name, email, role, joined_at) VALUES (?, ?, ?, ?)',
    [name, email, role, joinedAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, email, role, joined_at: joinedAt });
    }
  );
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  db.run(
    'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
    [name, email, role, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
      res.json({ id: Number(id), name, email, role });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ success: true });
  });
});

module.exports = router;
