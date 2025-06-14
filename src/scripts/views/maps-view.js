import L from 'leaflet';

const MapsView = {
  init(container) {
    container.innerHTML = this.getTemplate();

    this.root = container;
    this.mapContainer = container.querySelector('#map');
  },

  getTemplate() {
    return `
      <section class="container">
        <h2>Semua Cerita</h2>
        <div id="map"></div>
      </section>
    `;
  },

  async showStories(stories) {
    this.initializeMap(stories);
  },

  initializeMap(stories) {
    if (!this.mapContainer || !stories.length) return;

    const map = L.map(this.mapContainer).setView([-2.548926, 118.014863], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).addTo(map);
        marker.bindPopup(`
          <h4>${story.name}</h4>
          <p>${story.description}</p>
          <img src="${story.photoUrl}" alt="Story image" style="max-width: 200px;">
        `);
      }
    });
  },


};

export default MapsView;