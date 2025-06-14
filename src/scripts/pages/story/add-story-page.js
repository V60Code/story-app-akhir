import AddStoryPresenter from '../../presenters/add-story-presenter.js';

const AddStoryPage = {
  async render() {
    return `<div id="content" tabindex="-1"></div>`;
  },

  async afterRender() {
    const container = document.getElementById('content');
    this.presenter = AddStoryPresenter;
    this.presenter.init(container);
  },

  destroy() {
    if (this.presenter && typeof this.presenter.destroy === 'function') {
      this.presenter.destroy();
    }
  },
};

export default AddStoryPage;
