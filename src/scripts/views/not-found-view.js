const NotFoundView = {
  async render() {
    return `
        <section class="not-found">
          <h2>404 Not Found</h2>
          <p>Halaman yang kamu cari tidak ditemukan.</p>
          <a href="#/" class="back-home">Kembali ke Beranda</a>
        </section>
      `;
  },
  async afterRender() {},
};
export default NotFoundView;
