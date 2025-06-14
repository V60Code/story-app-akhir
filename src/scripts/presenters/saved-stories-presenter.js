import SavedStoriesView from '../views/saved-stories-view.js';
import { getSavedStories, unsaveStory } from '../utils/idb.js';

const SavedStoriesPresenter = {
  async init(container) {
    this._view = SavedStoriesView;
    this._view.init(container);

    try {
      this._view.showLoading();
      const stories = await this._getSavedStories();
      this._view.showStories(stories);
      this._initializeEvents();
    } catch (error) {
      this._view.showError('Gagal memuat cerita tersimpan');
      console.error('Error initializing saved stories:', error);
    }
  },

  async _getSavedStories() {
    try {
      return await getSavedStories();
    } catch (error) {
      console.error('Error fetching saved stories:', error);
      throw error;
    }
  },

  async _handleUnsaveStory(storyId) {
    try {
      await unsaveStory(storyId);
      return true;
    } catch (error) {
      console.error('Error removing story:', error);
      throw error;
    }
  },

  _initializeEvents() {
    this._view.attachUnsaveCallback(async (storyId) => {
      try {
        await this._handleUnsaveStory(storyId);
        return true;
      } catch (error) {
        throw error;
      }
    });
  },
};

export default SavedStoriesPresenter;
