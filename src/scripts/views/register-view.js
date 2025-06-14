const RegisterView = {
  getTemplate() {
    return `
      <section class="auth-section">
        <div class="auth-form-container" id="register-container">
          <h2>Daftar Akun</h2>
          <form id="register-form">
            <label for="name">Nama:</label>
            <input type="text" id="name" required />
            <label for="email">Email:</label>
            <input type="email" id="email" required />
            <label for="password">Password:</label>
            <input type="password" id="password" required />
            <button type="submit">Daftar</button>
          </form>
          <p>Sudah punya akun? <a href="#/login">Masuk</a></p>
        </div>
      </section>
    `;
  },

  render(container) {
    container.innerHTML = this.getTemplate();
  },

  getElements(container) {
    return {
      root: container,
      container: container.querySelector('#register-container'),
      form: container.querySelector('#register-form'),
      name: container.querySelector('#name'),
      email: container.querySelector('#email'),
      password: container.querySelector('#password'),
    };
  },

  bindSubmit(container, handler) {
    const { form } = this.getElements(container);
    form.addEventListener('submit', handler);
  },

  showFullLoader(container) {
    if (!container.querySelector('#register-loader')) {
      const loader = document.createElement('div');
      loader.className = 'full-page-loader';
      loader.id = 'register-loader';
      loader.innerHTML = '<div class="spinner"></div>';
      container.appendChild(loader);
    }
    this.hideForm(container);
  },

  hideLoader(container, showForm = false) {
    const loader = container.querySelector('#register-loader');
    if (loader) loader.remove();
    if (showForm) this.showForm(container);
  },

  hideForm(container) {
    const formContainer = container.querySelector('#register-container');
    if (formContainer) formContainer.style.display = 'none';
  },

  showForm(container) {
    const formContainer = container.querySelector('#register-container');
    if (formContainer) formContainer.style.display = 'block';
  },

  showSuccessAlert(message) {
    return Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: message,
      timer: 2000,
      showConfirmButton: false,
    });
  },

  showErrorAlert(message) {
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: message,
    });
  },

  redirectTo(path) {
    window.location.hash = path;
  },
};

export default RegisterView;
