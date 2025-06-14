import RegisterPresenter from '../../presenters/register-presenter.js';

const RegisterPage = {
  async render() {
    return `<div id="content" tabindex="-1"></div>`;
  },

  async afterRender() {
    const container = document.getElementById('content');
    RegisterPresenter.init(container);
  },
};

export default RegisterPage;
