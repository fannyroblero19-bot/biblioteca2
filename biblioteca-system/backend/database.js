const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbFile = path.resolve(__dirname, 'biblioteca.db');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error('No se pudo abrir la base de datos:', err.message);
    process.exit(1);
  }
});

const initialize = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    // Ensure additional columns exist for richer book metadata
    const ensureColumn = (table, column, definition) => {
      db.all(`PRAGMA table_info(${table})`, [], (err, rows) => {
        if (err) return;
        const exists = rows.some(r => r.name === column);
        if (!exists) {
          db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        }
      });
    };

    ensureColumn('books', 'description', 'TEXT DEFAULT ""');
    ensureColumn('books', 'isbn', 'TEXT DEFAULT ""');
    ensureColumn('books', 'year', 'INTEGER DEFAULT NULL');
    ensureColumn('books', 'publisher', 'TEXT DEFAULT ""');
    ensureColumn('books', 'cover_url', 'TEXT DEFAULT ""');

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL,
        joined_at TEXT NOT NULL
      )
    `);
  });
};

initialize();

module.exports = db;
