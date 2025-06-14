import NotFoundView from '../views/not-found-view.js';

const NotFoundPresenter = {
  async render() {
    return NotFoundView.render();
  },
  async afterRender() {
    if (NotFoundView.afterRender) await NotFoundView.afterRender();
  },
};
export default NotFoundPresenter;
