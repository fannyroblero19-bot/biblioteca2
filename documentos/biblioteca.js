document.addEventListener('DOMContentLoaded', () => {
  const booksContainer = document.getElementById('public-books');
  const searchInput = document.getElementById('book-search');
  const filterSelect = document.getElementById('book-filter');
  const registerForm = document.getElementById('register-form');
  const feedback = document.getElementById('reg-feedback');

  const api = {
    books: '/api/books',
    users: '/api/users'
  };

  const fetchBooks = async () => {
    try {
      const res = await fetch(api.books);
      const data = await res.json();
      return data;
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
      const matchStatus = status === 'all' || b.status === status;
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

  const loadAndRender = async () => {
    booksContainer.innerHTML = '<p class="placeholder">Cargando libros...</p>';
    const books = await fetchBooks();
    renderBooks(books);
  };

  searchInput.addEventListener('input', () => loadAndRender());
  filterSelect.addEventListener('change', () => loadAndRender());

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    feedback.textContent = '';
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const role = document.getElementById('reg-role').value;
    if (!name || !email) return;
    try {
      const res = await fetch(api.users, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role })
      });
      if (!res.ok) {
        const err = await res.json();
        feedback.textContent = err.error || 'Error al registrar.';
        return;
      }
      feedback.textContent = 'Registro completado. ¡Bienvenido!';
      registerForm.reset();
    } catch (err) {
      console.error(err);
      feedback.textContent = 'Error de conexión.';
    }
  });

  loadAndRender();
});
