import HomePage from '../pages/home/home-page.js';
import AboutPage from '../pages/about/about-page';
import RegisterPage from '../pages/auth/register-page';
import LoginPage from '../pages/auth/login-page';
import AddStoryPage from '../pages/story/add-story-page';
import DetailPage from '../pages/detail/detail-page';
import SavedStoriesPage from '../pages/story/saved-stories-page';
import MapsPage from '../pages/maps/maps-page.js';
import NotFoundPresenter from '../presenters/not-found-presenter.js';

const routes = {
  '/': HomePage,
  '/about': AboutPage,
  '/register': RegisterPage,
  '/login': LoginPage,
  '/add': AddStoryPage,
  '/detail/:id': DetailPage,
  '/saved': SavedStoriesPage,
  '/maps': MapsPage,
  '*': NotFoundPresenter,
};

export function matchRoute(hash) {
  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;
  const path = cleanHash || '/';

  if (routes[path]) {
    return { presenter: routes[path], params: {} };
  }

  for (const route in routes) {
    if (route.includes(':')) {
      const routeParts = route.split('/');
      const pathParts = path.split('/');

      if (routeParts.length === pathParts.length) {
        const params = {};
        let isMatch = true;

        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            params[routeParts[i].slice(1)] = pathParts[i];
          } else if (routeParts[i] !== pathParts[i]) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          return { presenter: routes[route], params };
        }
      }
    }
  }

  return { presenter: routes['*'], params: {} };
}

export default routes;
