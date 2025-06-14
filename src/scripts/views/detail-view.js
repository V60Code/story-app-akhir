const DetailView = {
  getTemplate(story) {
    return `
      <section class="container detail-section">
        <h2>Detail Cerita</h2>
        <div class="story-card">
          <button id="back-button" class="back-button"><i class="fas fa-arrow-left"></i> Kembali</button>
          <img src="${story.photoUrl}" alt="Foto dari ${story.name}" />
          <h3><i class="fas fa-user"></i> ${story.name}</h3>
          <p><i class="fas fa-calendar-alt"></i> <strong>Tanggal:</strong> ${new Date(story.createdAt).toLocaleString()}</p>
          <p><i class="fas fa-align-left"></i> ${story.description}</p>
          <p><i class="fas fa-map-marker-alt"></i> <strong>Lokasi:</strong> ${story.location}</p>
        </div>
      </section>
    `;
  },

  render(container, story) {
    container.innerHTML = this.getTemplate(story);

    const backBtn = container.querySelector('#back-button');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.hash = '#/';
      });
    }
  },

  showError(container, message) {
    container.innerHTML = `<p class="error-message">${message}</p>`;
  },
};

export default DetailView;
