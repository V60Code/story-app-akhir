import MapsPresenter from '../../presenters/maps-presenter.js';

const MapsPage = {
  async render() {
    return `<div id="content" tabindex="-1"></div>`;
  },

  async afterRender() {
    const container = document.getElementById('content');
    MapsPresenter.init(container);
  },
};

export default MapsPage;