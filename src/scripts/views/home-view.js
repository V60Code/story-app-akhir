import { saveStory, unsaveStory, isStorySaved, checkIndexedDBStatus } from '../utils/idb.js';

const HomeView = {
  init(container) {
    container.innerHTML = this.getTemplate();
    this.root = container;
    this.list = container.querySelector('#story-list');
    this.savedStoriesBtn = container.querySelector('#view-saved-stories');
    this.errorContainer = container.querySelector('#error-message');
    this.offlineContainer = container.querySelector('#offline-message');

    this.addClearButton();
    this.addCheckIDBButton();
    this._updateOfflineStatus();
    this._initOfflineImageHandler();
  },

  getTemplate() {
    return `
      <section class="container">
        <h2>Semua Cerita</h2>
        <div id="error-message" class="error-message" style="display: none;"></div>
        <div id="offline-message" class="offline-message" style="display: none;">
          <p>Anda sedang offline. Beberapa fitur mungkin tidak tersedia.</p>
        </div>
        <div class="story-actions">
          <button id="view-saved-stories">Lihat Cerita Tersimpan</button>
          <button id="check-idb" class="check-idb-btn">Cek Status IndexedDB</button>
        </div>
        <div id="story-list" class="story-list"></div>
        <button id="clear-idb">Hapus Data Offline</button>
      </section>
    `;
  },

  async showStories(stories) {
    if (!stories || !stories.length) {
      this.list.innerHTML = '<p class="no-stories">Tidak ada cerita tersedia.</p>';
      return;
    }

    const storyPromises = stories.map(async (story) => {
      const isSaved = await isStorySaved(story.id);
      return this.renderItem(story, isSaved);
    });

    this.list.innerHTML = (await Promise.all(storyPromises)).join('');
    this.attachStoryEvents();
    this._handleImageLoading();
  },

  showError(message) {
    if (!this.errorContainer) return;

    this.errorContainer.textContent = message;
    this.errorContainer.style.display = 'block';
  },

  hideError() {
    if (!this.errorContainer) return;

    this.errorContainer.textContent = '';
    this.errorContainer.style.display = 'none';
  },

  _updateOfflineStatus() {
    const isOffline = !navigator.onLine;
    if (this.offlineContainer) {
      this.offlineContainer.style.display = isOffline ? 'block' : 'none';
    }
  },

  _initOfflineImageHandler() {
    window.addEventListener('offline', () => {
      console.log('App went offline - images should load from cache');
    });
    
    window.addEventListener('online', () => {
      console.log('App went online');
    });
  },

  _forceReloadImages() {
    // Removed force reload logic to prevent flickering
    // Service worker will handle image caching automatically
    console.log('Force reload disabled - relying on service worker cache');
  },

  renderItem(story, isSaved = false) {
    const saveButtonIcon = isSaved ? 'fas fa-bookmark' : 'far fa-bookmark';
    const saveButtonText = isSaved ? 'Tersimpan' : 'Simpan';

    return `
      <article class="story-card" data-id="${story.id}" tabindex="0">
        <img src="${story.photoUrl}" alt="Foto untuk cerita ${story.description}" class="story-image" style="opacity: 1; transition: opacity 0.3s ease;">
        <div class="story-content">
          <h3>${story.name}</h3>
          <p>${story.description}</p>
          <div class="story-meta">
            <span class="story-date">${new Date(story.createdAt).toLocaleDateString()}</span>
            <button class="save-story-btn" data-id="${story.id}" data-story='${JSON.stringify(story)}'>
              <i class="${saveButtonIcon}"></i> ${saveButtonText}
            </button>
          </div>
        </div>
      </article>
    `;
  },

  _handleImageLoading() {
    const images = this.root.querySelectorAll('.story-image');
    images.forEach((img) => {
      // Add error handling for images
      img.addEventListener('error', () => {
        img.style.display = 'none';
        console.warn('Failed to load image:', img.src);
      });
      
      img.addEventListener('load', () => {
        img.style.opacity = '1';
      });
      
      // If image is already loaded, ensure it's visible
      if (img.complete && img.naturalHeight !== 0) {
        img.style.opacity = '1';
      }
    });
  },

  attachStoryEvents() {
    this.root.querySelectorAll('.story-card').forEach((card) => {
      const id = card.dataset.id;
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('save-story-btn')) return;
        if (id) window.location.hash = `#/detail/${id}`;
      });
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          if (id) window.location.hash = `#/detail/${id}`;
        }
      });
    });

    this.root.querySelectorAll('.save-story-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          const storyId = btn.dataset.id;
          const storyData = JSON.parse(btn.dataset.story);

          const isSaved = await isStorySaved(storyId);
          if (isSaved) {
            await unsaveStory(storyId);
            btn.innerHTML = '<i class="far fa-bookmark"></i> Simpan';
            this._showNotification('Cerita dihapus dari tersimpan', 'info');
          } else {
            await saveStory(storyData);
            btn.innerHTML = '<i class="fas fa-bookmark"></i> Tersimpan';
            this._showNotification('Cerita berhasil disimpan', 'success');
          }
        } catch (error) {
          console.error('Error handling save/unsave:', error);
          this._showNotification('Gagal menyimpan cerita', 'error');
        }
      });
    });

    this.savedStoriesBtn?.addEventListener('click', () => {
      window.location.hash = '#/saved';
    });
  },

  _showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  },

  addCheckIDBButton() {
    const checkBtn = document.getElementById('check-idb');
    if (!checkBtn) return;

    checkBtn.addEventListener('click', async () => {
      try {
        const status = await checkIndexedDBStatus();
        let message = '';

        if (status.isAvailable) {
          message = `Status IndexedDB:
- Database: ${status.dbName} (v${status.dbVersion})
- Jumlah Cerita Tersimpan: ${status.savedStoriesCount}
- Jumlah Cerita Offline: ${status.offlineStoriesCount}`;
        } else {
          message = `IndexedDB tidak tersedia: ${status.error}`;
        }

        alert(message);
      } catch (error) {
        alert('Gagal mengecek status IndexedDB');
      }
    });
  },

  addClearButton() {
    const btn = document.getElementById('clear-idb');
    if (!btn) return;

    const isOffline = !navigator.onLine;
    btn.style.display = isOffline ? 'none' : 'block';
  },
};

export default HomeView;
