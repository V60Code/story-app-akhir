import DetailPresenter from '../../presenters/detail-presenter.js';

const DetailPage = {
  async render() {
    return `<div id="content" tabindex="-1"></div>`;
  },

  async afterRender() {
    const container = document.getElementById('content');
    const url = window.location.hash.split('/');
    const id = url[2];
    await DetailPresenter.init(container, id);
  },
};

export default DetailPage;
