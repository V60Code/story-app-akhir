import LoginPresenter from '../../presenters/login-presenter.js';

const LoginPage = {
  async render() {
    return `<div id="content" tabindex="-1"></div>`;
  },

  async afterRender() {
    const container = document.getElementById('content');
    LoginPresenter.init(container);
  },
};

export default LoginPage;
