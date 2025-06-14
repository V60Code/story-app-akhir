import { saveStories, getAllStories } from './idb.js';

class StorySync {
  constructor() {
    this._registerServiceWorkerEvents();
  }

  _registerServiceWorkerEvents() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener('message', async (event) => {
      if (!event.data) return;

      switch (event.data.type) {
        case 'STORIES_UPDATED':
          await this._handleStoriesUpdate(event.data.stories);
          break;
        case 'GET_INDEXED_DB_STORIES':
          await this._handleGetStoriesRequest();
          break;
      }
    });
  }

  async _handleStoriesUpdate(stories) {
    try {
      await saveStories(stories);
      console.log('Stories saved to IndexedDB');

      window.dispatchEvent(
        new CustomEvent('stories-updated', {
          detail: { stories },
        })
      );
    } catch (error) {
      console.error('Error saving stories to IndexedDB:', error);
    }
  }

  async _handleGetStoriesRequest() {
    try {
      const stories = await getAllStories();
      if (!navigator.serviceWorker.controller) return;

      navigator.serviceWorker.controller.postMessage({
        type: 'INDEXED_DB_STORIES',
        stories,
      });
    } catch (error) {
      console.error('Error getting stories from IndexedDB:', error);
    }
  }

  async syncStories(stories) {
    try {
      await saveStories(stories);
      console.log('Stories manually synced to IndexedDB');
    } catch (error) {
      console.error('Error manually syncing stories:', error);
    }
  }
}
const storySync = new StorySync();
export default storySync;

