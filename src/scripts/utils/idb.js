import { openDB, deleteDB } from 'idb';

const DB_NAME = 'story-app-db';
const DB_VERSION = 2;
const SAVED_STORIES_STORE = 'saved_stories';
const OFFLINE_STORIES_STORE = 'offline_stories';

async function deleteOldDatabase() {
  try {
    await deleteDB(DB_NAME);
    console.log('Old database deleted successfully');
  } catch (error) {
    console.error('Error deleting old database:', error);
  }
}

export async function getDb() {
  try {
    return await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion) {
        if (oldVersion < 2) {
          if (db.objectStoreNames.contains('stories')) {
            db.deleteObjectStore('stories');
          }
          if (db.objectStoreNames.contains(SAVED_STORIES_STORE)) {
            db.deleteObjectStore(SAVED_STORIES_STORE);
          }
          if (db.objectStoreNames.contains(OFFLINE_STORIES_STORE)) {
            db.deleteObjectStore(OFFLINE_STORIES_STORE);
          }

          const savedStore = db.createObjectStore(SAVED_STORIES_STORE, { keyPath: 'id' });
          savedStore.createIndex('createdAt', 'createdAt');

          const offlineStore = db.createObjectStore(OFFLINE_STORIES_STORE, { keyPath: 'id' });
          offlineStore.createIndex('createdAt', 'createdAt');
        }
      },
      blocked() {
        console.warn('Database upgrade blocked. Please close other tabs of this app.');
      },
      blocking() {
        console.warn('Database is blocked by an older version. Please reload.');
      },
      terminated() {
        console.error('Database connection terminated unexpectedly.');
      },
    });
  } catch (error) {
    if (error.message.includes('existing version')) {
      console.log('Version conflict detected, attempting to delete old database...');
      await deleteOldDatabase();
      return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
          const savedStore = db.createObjectStore(SAVED_STORIES_STORE, { keyPath: 'id' });
          savedStore.createIndex('createdAt', 'createdAt');

          const offlineStore = db.createObjectStore(OFFLINE_STORIES_STORE, { keyPath: 'id' });
          offlineStore.createIndex('createdAt', 'createdAt');
        },
      });
    }
    throw error;
  }
}

export async function saveStories(stories) {
  const db = await getDb();
  const tx = db.transaction(OFFLINE_STORIES_STORE, 'readwrite');
  try {
    // Clear existing stories to ensure we have the latest data
    await tx.store.clear();
    
    // Add timestamp to track when data was last updated
    const storiesWithTimestamp = stories.map(story => ({
      ...story,
      lastUpdated: new Date().toISOString()
    }));
    
    for (const story of storiesWithTimestamp) {
      await tx.store.put(story);
    }
    await tx.done;
    console.log(`Saved ${stories.length} stories to IndexedDB with timestamp`);
  } catch (error) {
    console.error('Error saving stories:', error);
    throw error;
  }
}

export async function getAllStories() {
  const db = await getDb();
  try {
    const stories = await db.getAllFromIndex(OFFLINE_STORIES_STORE, 'createdAt');
    // Sort by createdAt in descending order to get the most recent stories first
    return stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error('Error getting all stories:', error);
    return [];
  }
}

export async function clearOfflineStories() {
  const db = await getDb();
  try {
    await db.clear(OFFLINE_STORIES_STORE);
  } catch (error) {
    console.error('Error clearing offline stories:', error);
    throw error;
  }
}

export async function saveStory(story) {
  const db = await getDb();
  const tx = db.transaction(SAVED_STORIES_STORE, 'readwrite');
  try {
    await tx.store.put({
      ...story,
      savedAt: new Date().toISOString(),
    });
    await tx.done;
  } catch (error) {
    console.error('Error saving story:', error);
    throw error;
  }
}

export async function getSavedStories() {
  const db = await getDb();
  try {
    return await db.getAllFromIndex(SAVED_STORIES_STORE, 'createdAt');
  } catch (error) {
    console.error('Error getting saved stories:', error);
    return [];
  }
}

export async function isStorySaved(id) {
  const db = await getDb();
  try {
    const story = await db.get(SAVED_STORIES_STORE, id);
    return !!story;
  } catch (error) {
    console.error('Error checking if story is saved:', error);
    return false;
  }
}

export async function unsaveStory(id) {
  const db = await getDb();
  try {
    await db.delete(SAVED_STORIES_STORE, id);
  } catch (error) {
    console.error('Error unsaving story:', error);
    throw error;
  }
}

export async function clearSavedStories() {
  const db = await getDb();
  try {
    await db.clear(SAVED_STORIES_STORE);
  } catch (error) {
    console.error('Error clearing saved stories:', error);
    throw error;
  }
}

export async function checkIndexedDBStatus() {
  try {
    const db = await getDb();
    const savedStories = await db.count(SAVED_STORIES_STORE);
    const offlineStories = await db.count(OFFLINE_STORIES_STORE);

    return {
      isAvailable: true,
      savedStoriesCount: savedStories,
      offlineStoriesCount: offlineStories,
      dbName: DB_NAME,
      dbVersion: DB_VERSION,
    };
  } catch (error) {
    console.error('Error checking IndexedDB status:', error);
    return {
      isAvailable: false,
      error: error.message,
    };
  }
}
