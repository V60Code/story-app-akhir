import SavedStoriesPresenter from '../../presenters/saved-stories-presenter.js';

const SavedStoriesPage = {
  async render() {
    return `<div id="content" tabindex="-1"></div>`;
  },

  async afterRender() {
    const container = document.getElementById('content');
    await SavedStoriesPresenter.init(container);
  },
};

export default SavedStoriesPage;
