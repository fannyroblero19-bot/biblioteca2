const path = require('path');
const express = require('express');
const cors = require('cors');
const booksRoute = require('./routes/books');
const usersRoute = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos desde la carpeta documentos en la raíz del repo
app.use(express.static(path.join(__dirname, '..', '..', 'documentos')));

app.use('/api/books', booksRoute);
app.use('/api/users', usersRoute);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', '..', 'documentos', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Biblioteca System backend escuchando en http://localhost:${PORT}`);
});
