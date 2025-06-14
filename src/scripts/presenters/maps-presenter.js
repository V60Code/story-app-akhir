import StoryModel from '../models/story-model.js';
import MapsView from '../views/maps-view.js';
import { getAllStories } from '../utils/idb.js';
import storySync from '../utils/story-sync.js';

const MapsPresenter = {
  async init(container) {
    MapsView.init(container);
    this._initializeEvents();

    try {
      const stories = await StoryModel.getAll();
      await storySync.syncStories(stories);
      MapsView.showStories(stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      const offlineStories = await getAllStories();
      
      if (offlineStories.length) {
        MapsView.showStories(offlineStories);
        MapsView.showError(
          'Kamu sedang offline. Menampilkan data dari penyimpanan lokal.'
        );
      } else {
        MapsView.showError('Tidak bisa mengambil data, cek koneksi kamu!');
      }
    }
  },

  _initializeEvents() {
    window.addEventListener('stories-updated', async (event) => {
      const stories = event.detail.stories;
      if (stories && stories.length) {
        MapsView.showStories(stories);
      }
    });

    window.addEventListener('online', () => {
      this._handleOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this._handleOnlineStatus(false);
    });
  },

  async _handleOnlineStatus(isOnline) {
    if (isOnline) {
      try {
        const stories = await StoryModel.getAll();
        await storySync.syncStories(stories);
        MapsView.showStories(stories);
        MapsView.hideError();
      } catch (error) {
        console.error('Error fetching stories when back online:', error);
      }
    } else {
      const offlineStories = await getAllStories();
      if (offlineStories.length) {
        MapsView.showStories(offlineStories);
        MapsView.showError(
          'Kamu sedang offline. Menampilkan data dari penyimpanan lokal.'
        );
      }
    }
  }
};

export default MapsPresenter;