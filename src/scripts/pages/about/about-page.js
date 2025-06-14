import AboutPresenter from '../../presenters/about-presenter.js';

const AboutPage = {
  async render() {
    return `<div id="content" tabindex="-1"></div>`;
  },

  async afterRender() {
    const container = document.getElementById('content');
    AboutPresenter.init(container);
  },
};

export default AboutPage;
