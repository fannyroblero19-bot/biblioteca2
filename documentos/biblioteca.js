document.addEventListener('DOMContentLoaded', () => {
  const booksContainer = document.getElementById('public-books');
  const searchInput = document.getElementById('book-search');
  const filterSelect = document.getElementById('book-filter');
  const registerForm = document.getElementById('register-form');
  const feedback = document.getElementById('reg-feedback');

  // --- BASE DE DATOS LOCAL (Simulada en el Navegador) ---
  
  // Libros por defecto si la base de datos está vacía
  const defaultBooks = [
    { title: "Don Quijote de la Mancha", author: "Miguel de Cervantes", category: "Novela", status: "Disponible" },
    { title: "Cien años de soledad", author: "Gabriel García Márquez", category: "Realismo Mágico", status: "Prestado" },
    { title: "El Principito", author: "Antoine de Saint-Exupéry", category: "Infantil", status: "Disponible" },
    { title: "Breves respuestas a las grandes preguntas", author: "Stephen Hawking", category: "Ciencia", status: "Disponible" }
  ];

  // Inicializar almacenamiento local para libros y usuarios si no existen
  if (!localStorage.getItem('local_books')) {
    localStorage.setItem('local_books', JSON.stringify(defaultBooks));
  }
  if (!localStorage.getItem('local_users')) {
    localStorage.setItem('local_users', JSON.stringify([]));
  }

  // --- FUNCIONES DE CARGA SIMULADAS ---

  const fetchBooks = () => {
    try {
      // Leemos los libros guardados en el navegador en vez de usar fetch
      const data = JSON.parse(localStorage.getItem('local_books'));
      return data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  const renderBooks = (books) => {
    const term = (searchInput.value || '').toLowerCase();
    const status = filterSelect.value;
    
    const filtered = books.filter(b => {
      const searchable = [b.title, b.author, b.category].join(' ').toLowerCase();
      const matchTerm = searchable.includes(term);
      const matchStatus = status === 'all' || b.status.toLowerCase() === status.toLowerCase();
      return matchTerm && matchStatus;
    });

    if (!filtered.length) {
      booksContainer.innerHTML = '<p class="placeholder">No se encontraron libros.</p>';
      return;
    }

    booksContainer.innerHTML = filtered.map(b => `
      <div style="padding:12px;border-bottom:1px solid rgba(255,255,255,0.04);">
        <h4 style="margin:0 0 6px 0">${b.title}</h4>
        <div style="color:var(--text-muted);font-size:0.9rem">${b.author} — ${b.category}</div>
        <div style="margin-top:8px">Estado: <span class="tag-pill ${b.status.toLowerCase()}">${b.status}</span></div>
      </div>
    `).join('');
  };

  const loadAndRender = () => {
    booksContainer.innerHTML = '<p class="placeholder">Cargando libros...</p>';
    const books = fetchBooks();
    renderBooks(books);
  };

  searchInput.addEventListener('input', () => loadAndRender());
  filterSelect.addEventListener('change', () => loadAndRender());

  // --- FORMULARIO DE REGISTRO CORREGIDO ---

  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    feedback.textContent = '';
    
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const role = document.getElementById('reg-role').value;
    
    if (!name || !email) return;

    try {
      // 1. Obtener la lista actual de usuarios guardados en el navegador
      let users = JSON.parse(localStorage.getItem('local_users')) || [];

      // 2. Verificar si el correo ya está registrado para evitar duplicados
      const existe = users.find(user => user.email === email);
      if (existe) {
        feedback.style.color = "var(--text-error, #ff4d4d)"; // Cambia al color de error de tu CSS
        feedback.textContent = 'Este correo electrónico ya está registrado.';
        return;
      }

      // 3. Crear el nuevo miembro y añadirlo a la lista
      const nuevoUsuario = { name, email, role, date: new Date().toISOString() };
      users.push(nuevoUsuario);

      // 4. Guardar de vuelta la lista actualizada en el localStorage
      localStorage.setItem('local_users', JSON.stringify(users));

      // 5. Mostrar mensaje de éxito y limpiar formulario
      feedback.style.color = "var(--text-success, #4dff4d)";
      feedback.textContent = 'Registro completado. ¡Bienvenido!';
      registerForm.reset();

    } catch (err) {
      console.error(err);
      feedback.style.color = "var(--text-error, #ff4d4d)";
      feedback.textContent = 'Error al guardar los datos en el sistema local.';
    }
  });

  // Carga inicial al abrir la página
  loadAndRender();
});