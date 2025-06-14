import { getSavedStories, unsaveStory } from '../utils/idb.js';

const SavedStoriesView = {
  init(container) {
    this.container = container;
    this.container.innerHTML = this.getTemplate();
    this.storyList = this.container.querySelector('#saved-story-list');
  },

  getTemplate() {
    return `
      <section class="container">
        <h2>Cerita Tersimpan</h2>
        <div id="saved-story-list" class="story-list"></div>
      </section>
    `;
  },

  showStories(stories) {
    if (stories.length === 0) {
      this.storyList.innerHTML = '<p class="empty-message">Belum ada cerita yang disimpan.</p>';
      return;
    }

    this.storyList.innerHTML = stories.map(this._createStoryItemTemplate).join('');
  },

  _createStoryItemTemplate(story) {
    return `
      <div class="story-card" data-id="${story.id}">
        <img src="${story.photoUrl}" alt="Foto ${story.name}" loading="lazy" />
        <div class="story-content">
          <h3><i class="fas fa-user"></i> ${story.name}</h3>
          <p><i class="fas fa-align-left"></i> ${story.description}</p>
          <p><i class="fas fa-calendar-alt"></i> <strong>Tanggal:</strong> ${new Date(story.createdAt).toLocaleString()}</p>
          <p><i class="fas fa-map-marker-alt"></i> <strong>Lokasi:</strong> ${story.location}</p>
          <p><i class="fas fa-clock"></i> <strong>Disimpan pada:</strong> ${new Date(story.savedAt).toLocaleString()}</p>
          <button class="unsave-story-btn" data-id="${story.id}" aria-label="Hapus dari tersimpan">
            <i class="fas fa-trash"></i> Hapus dari Tersimpan
          </button>
        </div>
      </div>
    `;
  },

  attachUnsaveCallback(callback) {
    this.container.querySelectorAll('.unsave-story-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const storyId = btn.dataset.id;
        const card = this.container.querySelector(`.story-card[data-id="${storyId}"]`);

        try {
          await callback(storyId);
          this._handleSuccessfulUnsave(card);
        } catch (error) {
          this._handleFailedUnsave();
        }
      });
    });
  },

  _handleSuccessfulUnsave(card) {
    card.classList.add('fade-out');
    setTimeout(() => {
      card.remove();
      if (this.storyList.children.length === 0) {
        this.showStories([]);
      }
      this._showNotification('Cerita berhasil dihapus dari tersimpan', 'success');
    }, 300);
  },

  _handleFailedUnsave() {
    this._showNotification('Gagal menghapus cerita', 'error');
  },

  _showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  },

  showError(message) {
    this.storyList.innerHTML = `<p class="error-message">${message}</p>`;
  },

  showLoading() {
    this.storyList.innerHTML = '<div class="loading-spinner">Memuat...</div>';
  },
};

export default SavedStoriesView;
