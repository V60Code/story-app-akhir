const LoginView = {
  getTemplate() {
    return `
      <section class="auth-section">
        <div class="auth-form-container" id="login-container">
          <h2>Masuk</h2>
          <form id="login-form">
            <label for="email">Email:</label>
            <input type="email" id="email" required />
            <label for="password">Password:</label>
            <input type="password" id="password" required />
            <button type="submit">Masuk</button>
          </form>
          <p>Belum punya akun? <a href="#/register">Daftar</a></p>
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
      container: container.querySelector('#login-container'),
      form: container.querySelector('#login-form'),
      email: container.querySelector('#email'),
      password: container.querySelector('#password'),
    };
  },

  bindSubmit(container, handler) {
    const { form } = this.getElements(container);
    form.addEventListener('submit', handler);
  },

  showFullLoader(container) {
    if (!container.querySelector('#login-loader')) {
      const loader = document.createElement('div');
      loader.className = 'full-page-loader';
      loader.id = 'login-loader';
      loader.innerHTML = '<div class="spinner"></div>';
      container.appendChild(loader);
    }
    this.hideForm(container);
  },

  hideLoader(container, showForm = false) {
    const loader = container.querySelector('#login-loader');
    if (loader) loader.remove();
    if (showForm) this.showForm(container);
  },

  hideForm(container) {
    const formContainer = container.querySelector('#login-container');
    if (formContainer) formContainer.style.display = 'none';
  },

  showForm(container) {
    const formContainer = container.querySelector('#login-container');
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

export default LoginView;
