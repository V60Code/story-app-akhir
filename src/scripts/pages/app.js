import { getActiveRoute, parseActivePathname } from '../routes/url-parser.js';
import { matchRoute } from '../routes/routes.js';

class App {
  #content;
  #drawerButton;
  #navigationDrawer;
  currentPage = null;

  constructor({ content, drawerButton, navigationDrawer }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#initDrawer();
  }

  #initDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    this.#content.addEventListener('click', () => {
      this.#navigationDrawer.classList.remove('open');
    });
  }

  async renderPage() {
    const route = getActiveRoute();
    const { id } = parseActivePathname();
    const routeMatch = matchRoute(route);
    const page = routeMatch.presenter;

    if (this.currentPage && typeof this.currentPage.destroy === 'function') {
      this.currentPage.destroy();
    }

    if (!document.startViewTransition) {
      this.#content.innerHTML = await page.render();
      await page.afterRender(id);
      this.currentPage = page;

      if (window.location.hash === '#content') {
        const mainContent = document.getElementById('content');
        mainContent?.focus();
      }
      return;
    }

    document.startViewTransition(async () => {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
      this.currentPage = page;

      if (window.location.hash === '#content') {
        const mainContent = document.getElementById('content');
        mainContent?.focus();
      }
    });
  }
}

export default App;
