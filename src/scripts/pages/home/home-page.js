import HomePresenter from '../../presenters/home-presenter.js';

const HomePage = {
  async render() {
    return `<div id="content" tabindex="-1"></div>`;
  },

  async afterRender() {
    const container = document.getElementById('content');
    HomePresenter.init(container);
  },
};

export default HomePage;
