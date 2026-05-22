const path = require('path');
const fs = require('fs');
const db = require('../database');

const src = path.resolve(__dirname, '..', '..', '..', 'documentos', 'test-cover.svg');
const destDir = path.resolve(__dirname, '..', '..', 'documentos', 'uploads');
if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
const dest = path.join(destDir, `manual-${Date.now()}.svg`);
fs.copyFileSync(src, dest);
const coverUrl = `/uploads/${path.basename(dest)}`;

const stmt = db.prepare('INSERT INTO books (title, author, category, status, description, isbn, year, publisher, cover_url, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
stmt.run('Manual Libro', 'Autor Manual', 'Prueba', 'Disponible', 'Descripción manual con imagen', '000-0', 2024, 'Editorial Manual', coverUrl, new Date().toISOString(), function(err) {
  if (err) {
    console.error('Error inserting:', err.message);
    process.exit(1);
  }
  console.log('Inserted id', this.lastID);
  process.exit(0);
});
