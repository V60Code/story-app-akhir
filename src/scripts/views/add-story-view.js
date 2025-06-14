import { getLocationName } from '../utils/location.js';

const AddStoryView = {
  async init(container) {
    container.innerHTML = this.getTemplate();
    this.root = container;

    this.form = container.querySelector('#story-form');
    this.description = container.querySelector('#description');
    this.video = container.querySelector('#camera');
    this.canvas = container.querySelector('#preview');
    this.captureBtn = container.querySelector('#capture');
    this.mapContainer = container.querySelector('#map');

    this.stream = await this.initCamera();
    this.bindEvents();
  },

  getTemplate() {
    return `
      <section class="story-form-container">
        <h2>Tambah Cerita</h2>
        <form id="story-form">
          <label for="description">Deskripsi:</label>
          <textarea id="description" required></textarea>

          <label>Ambil Gambar:</label>
          <video id="camera" autoplay muted playsinline></video>
          <canvas id="preview" style="display: none;"></canvas>
          <button type="button" id="capture">📸 Ambil Foto</button>

          <label>Pilih Lokasi:</label>
          <div id="map"></div>

          <button type="submit">Upload Cerita</button>
        </form>
      </section>
    `;
  },

  async initCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = stream;
      return stream;
    } catch {
      return null;
    }
  },

  hasCameraAccess() {
    return !!this.stream;
  },

  bindEvents() {
    this.captureBtn.addEventListener('click', () => this.takePhoto());
  },

  async takePhoto() {
    const ctx = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    ctx.drawImage(this.video, 0, 0);

    this.canvas.style.display = 'block';
    this.video.style.display = 'none';

    return new Promise((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
    });
  },

  setMap(center, onSelect) {
    const map = L.map(this.mapContainer).setView(center, 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    let marker;
    map.on('click', async (e) => {
      const { lat, lng } = e.latlng;

      const location = await getLocationName(lat, lng);

      if (!marker) {
        marker = L.marker(e.latlng).addTo(map);
      } else {
        marker.setLatLng(e.latlng);
      }
      marker.bindPopup(`<strong>Lokasi Terpilih:</strong><br>${location}`).openPopup();

      onSelect(e.latlng);
    });
  },

  onSubmit(callback) {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      this.showLoader();

      const photo = await this.takePhoto();

      await callback({
        description: this.description.value,
        photo,
      });

      this.hideLoader();
    });
  },

  showLoader() {
    const loader = document.createElement('div');
    loader.className = 'full-page-loader';
    loader.innerHTML = '<div class="spinner"></div>';
    this.root.appendChild(loader);
  },

  hideLoader() {
    this.root.querySelector('.full-page-loader')?.remove();
  },

  showSuccess(msg) {
    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: msg,
      timer: 2000,
      showConfirmButton: false,
    });
  },

  showError(msg) {
    Swal.fire({
      icon: 'error',
      title: 'Terjadi Kesalahan',
      text: msg,
    });
  },

  goTo(path) {
    window.location.hash = path;
  },

  cleanup() {
    if (this.video && this.video.srcObject) {
      this.video.srcObject.getTracks().forEach((track) => track.stop());
      this.video.srcObject = null;
    }
    this.canvas.style.display = 'none';
    this.video.style.display = 'block';
  },
};

export default AddStoryView;
