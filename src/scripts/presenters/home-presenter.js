import HomeView from '../views/home-view.js';
import StoryModel from '../models/story-model.js';
import { getAllStories, checkIndexedDBStatus } from '../utils/idb.js';
import storySync from '../utils/story-sync.js';

const HomePresenter = {
  async init(container) {
    HomeView.init(container);
    this._initializeEvents();

    // Check if we're offline first
    if (!navigator.onLine) {
      await this._loadOfflineStories();
      return;
    }

    try {
      const stories = await StoryModel.getAll();
      await storySync.syncStories(stories);
      HomeView.showStories(stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      await this._loadOfflineStories();
    }
  },

  _initializeEvents() {
    window.addEventListener('stories-updated', async (event) => {
      const stories = event.detail.stories;
      if (stories && stories.length) {
        HomeView.showStories(stories);
        // Force reload images after showing updated stories
        setTimeout(() => {
          HomeView._forceReloadImages();
        }, 300);
      } else if (!navigator.onLine) {
        await this._loadOfflineStories();
      }
    });

    window.addEventListener('online', () => {
      this._handleOnlineStatus(true);
    });

    window.addEventListener('offline', () => {
      this._handleOnlineStatus(false);
    });
  },

  async _loadOfflineStories() {
    const offlineStories = await getAllStories();
    
    if (offlineStories.length) {
      HomeView.showStories(offlineStories);
      // Force reload images after showing offline stories with longer delay
      setTimeout(() => {
        HomeView._forceReloadImages();
      }, 300);
      HomeView.showError(
        'Kamu sedang offline. Menampilkan data dari penyimpanan lokal.'
      );
    } else {
      HomeView.showError('Tidak bisa mengambil data, cek koneksi kamu!');
    }
  },

  async _handleOnlineStatus(isOnline) {
    if (isOnline) {
      try {
        const stories = await StoryModel.getAll();
        await storySync.syncStories(stories);
        HomeView.showStories(stories);
        HomeView.hideError();
      } catch (error) {
        console.error('Error fetching stories when back online:', error);
      }
    } else {
      // When going offline, ensure we have the latest data
      await this._ensureLatestOfflineData();
      await this._loadOfflineStories();
    }
  },

  async _ensureLatestOfflineData() {
    // Check if we have recent data in IndexedDB
    // If not, try to get the latest data before going fully offline
    try {
      if (navigator.onLine) {
        const stories = await StoryModel.getAll();
        await storySync.syncStories(stories);
        console.log('Updated offline data with latest stories before going offline');
      }
    } catch (error) {
      console.log('Could not update offline data, using existing cache');
    }
  }
};

export default HomePresenter;
