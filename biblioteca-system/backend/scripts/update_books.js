const db = require('../database');
db.serialize(() => {
  db.all('PRAGMA table_info(books)', [], (err, rows) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log('columns:', rows.map(r => r.name).join(','));
    db.run(
      'UPDATE books SET description = ?, isbn = ?, year = ?, publisher = ?, cover_url = ? WHERE id = 1',
      [
        'Edición clásica del Quijote con traducción anotada y notas de la obra.',
        '978-84-376-0494-7',
        1605,
        'Editorial Clásicos',
        'https://via.placeholder.com/200x280.png?text=El+Quijote'
      ],
      function (err) {
        if (err) console.error(err);
        else console.log('updated book 1');
        db.run(
          'UPDATE books SET description = ?, isbn = ?, year = ?, publisher = ?, cover_url = ? WHERE id = 2',
          [
            'Ensayo introductorio sobre el uso de la biblioteca y la gestión de libros.',
            '978-1-23456-789-7',
            2021,
            'Editorial Demo',
            'https://via.placeholder.com/200x280.png?text=Libro+Prueba'
          ],
          function (err) {
            if (err) console.error(err);
            else console.log('updated book 2');
            db.all('SELECT * FROM books ORDER BY id', [], (err, rows) => {
              if (err) console.error(err);
              else console.log('books:', JSON.stringify(rows, null, 2));
              process.exit(0);
            });
          }
        );
      }
    );
  });
});
