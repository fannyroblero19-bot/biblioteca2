(() => {
  const state = {
    view: 'overview',
    books: [],
    users: [],
    activeRecord: null,
    recordMode: 'book'
  };

  const views = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page-view');
  const booksBody = document.getElementById('books-body');
  const usersBody = document.getElementById('users-body');
  const overviewList = document.getElementById('overview-list');
  const dashboardBooks = document.getElementById('dashboard-books');
  const dashboardUsers = document.getElementById('dashboard-users');
  const dashboardFlow = document.getElementById('dashboard-flow');

  const booksFilter = document.getElementById('books-filter');
  const booksStatus = document.getElementById('books-status');
  const usersFilter = document.getElementById('users-filter');

  const btnNewBook = document.getElementById('btn-new-book');
  const btnNewUser = document.getElementById('btn-new-user');
  const formModal = document.getElementById('form-modal');
  const modalHeading = document.getElementById('modal-heading');
  const closeModal = document.getElementById('close-modal');
  const recordForm = document.getElementById('record-form');
  const fieldOne = document.getElementById('field-one');
  const fieldTwo = document.getElementById('field-two');
  const fieldThree = document.getElementById('field-three');
  const fieldFourRow = document.getElementById('field-four-row');
  const fieldFour = document.getElementById('field-four');
  const fieldThreeRow = document.getElementById('field-three-row');

  const api = {
    books: '/api/books',
    users: '/api/users'
  };

  const fetchData = async (endpoint) => {
    const res = await fetch(endpoint);
    return res.json();
  };

  const postData = async (endpoint, payload, method = 'POST') => {
    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  };

  const setView = (target) => {
    state.view = target;
    views.forEach((button) => button.classList.toggle('active', button.dataset.view === target));
    pages.forEach((section) => section.id === target ? section.classList.remove('hidden') : section.classList.add('hidden'));
  };

  const renderActivity = () => {
    const events = [];
    state.books.slice(0, 2).forEach((book) => {
      events.push(`Libro <strong>${book.title}</strong> agregado. `);
    });
    state.users.slice(0, 2).forEach((user) => {
      events.push(`Usuario <strong>${user.name}</strong> creado. `);
    });
    overviewList.innerHTML = events.length ? events.map(text => `<p>${text}</p>`).join('') : '<p class="placeholder">Sin actividad todavía.</p>';
  };

  const statusBadge = (text) => {
    const tag = document.createElement('span');
    tag.className = `tag-pill ${text.toLowerCase()}`;
    tag.textContent = text;
    return tag.outerHTML;
  };

  const renderBooks = () => {
    const term = booksFilter.value.toLowerCase();
    const status = booksStatus.value;
    booksBody.innerHTML = '';
    state.books
      .filter((book) => {
        const searchable = [book.title, book.author, book.category].join(' ').toLowerCase();
        const matchesTerm = searchable.includes(term);
        const matchesStatus = status === 'all' || book.status === status;
        return matchesTerm && matchesStatus;
      })
      .forEach((book) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.category}</td>
          <td>${statusBadge(book.status)}</td>
          <td>
            <button class="tiny-btn" data-action="edit-book" data-id="${book.id}">Editar</button>
            <button class="tiny-btn danger" data-action="delete-book" data-id="${book.id}">Borrar</button>
          </td>
        `;
        booksBody.appendChild(row);
      });

    dashboardBooks.textContent = state.books.length;
  };

  const renderUsers = () => {
    const term = usersFilter.value.toLowerCase();
    usersBody.innerHTML = '';
    state.users
      .filter((user) => [user.name, user.email, user.role].join(' ').toLowerCase().includes(term))
      .forEach((user) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${new Date(user.joined_at).toLocaleDateString('es-ES')}</td>
          <td>
            <button class="tiny-btn" data-action="edit-user" data-id="${user.id}">Editar</button>
            <button class="tiny-btn danger" data-action="delete-user" data-id="${user.id}">Borrar</button>
          </td>
        `;
        usersBody.appendChild(row);
      });

    dashboardUsers.textContent = state.users.length;
  };

  const refresh = async () => {
    state.books = await fetchData(api.books);
    state.users = await fetchData(api.users);
    renderBooks();
    renderUsers();
    dashboardFlow.textContent = state.books.length + state.users.length;
    renderActivity();
  };

  const openModal = (type, record = null) => {
    state.recordMode = type;
    state.activeRecord = record;
    formModal.classList.remove('hidden');
    fieldFourRow.classList.toggle('hidden', type !== 'book');
    fieldThreeRow.querySelector('label').textContent = type === 'book' ? 'Categoría' : 'Rol';
    modalHeading.textContent = record ? `Editar ${type === 'book' ? 'libro' : 'usuario'}` : `Agregar ${type === 'book' ? 'libro' : 'usuario'}`;
    fieldOne.value = record ? (type === 'book' ? record.title : record.name) : '';
    fieldTwo.value = record ? (type === 'book' ? record.author : record.email) : '';
    fieldThree.value = record ? (type === 'book' ? record.category : record.role) : '';
    fieldFour.value = record ? record.status : 'Disponible';
  };

  const closeForm = () => {
    formModal.classList.add('hidden');
    state.activeRecord = null;
    recordForm.reset();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      title: fieldOne.value.trim(),
      author: fieldTwo.value.trim(),
      category: fieldThree.value.trim(),
      status: fieldFour.value,
      name: fieldOne.value.trim(),
      email: fieldTwo.value.trim(),
      role: fieldThree.value.trim()
    };

    if (state.recordMode === 'book') {
      const endpoint = state.activeRecord ? `${api.books}/${state.activeRecord.id}` : api.books;
      await postData(endpoint, {
        title: payload.title,
        author: payload.author,
        category: payload.category,
        status: payload.status
      }, state.activeRecord ? 'PUT' : 'POST');
    } else {
      const endpoint = state.activeRecord ? `${api.users}/${state.activeRecord.id}` : api.users;
      await postData(endpoint, {
        name: payload.name,
        email: payload.email,
        role: payload.role
      }, state.activeRecord ? 'PUT' : 'POST');
    }

    closeForm();
    await refresh();
  };

  const handleTableAction = async (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;

    if (action === 'edit-book') {
      const book = state.books.find((b) => String(b.id) === id);
      openModal('book', book);
      return;
    }
    if (action === 'delete-book') {
      await fetch(`${api.books}/${id}`, { method: 'DELETE' });
      return refresh();
    }
    if (action === 'edit-user') {
      const user = state.users.find((u) => String(u.id) === id);
      openModal('user', user);
      return;
    }
    if (action === 'delete-user') {
      await fetch(`${api.users}/${id}`, { method: 'DELETE' });
      return refresh();
    }
  };

  views.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });

  btnNewBook.addEventListener('click', () => openModal('book'));
  btnNewUser.addEventListener('click', () => openModal('user'));
  closeModal.addEventListener('click', closeForm);
  recordForm.addEventListener('submit', handleSubmit);
  document.getElementById('books-body').addEventListener('click', handleTableAction);
  document.getElementById('users-body').addEventListener('click', handleTableAction);
  booksFilter.addEventListener('input', renderBooks);
  booksStatus.addEventListener('change', renderBooks);
  usersFilter.addEventListener('input', renderUsers);
  formModal.addEventListener('click', (event) => {
    if (event.target === formModal) closeForm();
  });

  refresh();
})();
