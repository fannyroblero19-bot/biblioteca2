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
      <div style="display:flex;gap:12px;align-items:flex-start;padding:16px;border-bottom:1px solid rgba(255,255,255,0.04);">
        <div style="width:100px;height:140px;border-radius:8px;overflow:hidden;background:rgba(255,255,255,0.03);flex-shrink:0;display:grid;place-items:center;">
          ${b.cover_url ? `<img src="${b.cover_url}" alt="${b.title}" style="width:100%;height:100%;object-fit:cover;"/>` : '<div style="color:var(--text-muted);font-size:0.85rem;padding:8px;text-align:center;">Portada</div>'}
        </div>
        <div style="flex:1;">
          <h4 style="margin:0 0 6px 0">${b.title}</h4>
          <div style="color:var(--text-muted);font-size:0.9rem;margin-bottom:8px;">${b.author} — ${b.category} ${b.year ? '— ' + b.year : ''}</div>
          ${b.description ? `<p style="margin:6px 0;color:var(--text-muted);">${b.description}</p>` : ''}
          <div style="margin-top:8px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
            <div>Estado: <span class="tag-pill ${b.status.toLowerCase()}">${b.status}</span></div>
            ${b.isbn ? `<div style="color:var(--text-muted)">ISBN: ${b.isbn}</div>` : ''}
            ${b.publisher ? `<div style="color:var(--text-muted)">Editorial: ${b.publisher}</div>` : ''}
          </div>
        </div>
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
