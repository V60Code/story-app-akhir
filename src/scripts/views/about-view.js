const AboutView = {
  getTemplate() {
    return `
        <section class="container about-section">
          <h2>Tentang Story App</h2>
          <p>
            <strong>Story App</strong> adalah aplikasi web berbasis Single Page Application (SPA)
            yang memungkinkan pengguna untuk membagikan cerita berupa gambar dan lokasi secara interaktif.
          </p>
          <p>Aplikasi ini dikembangkan sebagai bagian dari submission kelas Dicoding, dengan fitur utama:</p>
          <ul>
            <li>Registrasi dan Login pengguna</li>
            <li>Menampilkan daftar cerita dari pengguna lain</li>
            <li>Menambahkan cerita menggunakan kamera dan peta</li>
            <li>Peta interaktif dengan marker dan layer control</li>
            <li>Transisi halaman yang halus dengan View Transition API</li>
            <li>Aksesibilitas dan navigasi keyboard (skip to content)</li>
          </ul>
        </section>
      `;
  },

  render(container) {
    container.innerHTML = this.getTemplate();
  },
};

export default AboutView;
