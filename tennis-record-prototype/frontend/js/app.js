/**
 * SPA router and app bootstrap. Hash-based routes, no full page reloads.
 */

import * as home from './views/home.js';
import * as ratings from './views/ratings.js';
import * as search from './views/search.js';
import * as teams from './views/teams.js';
import * as rankings from './views/rankings.js';

const routes = {
  '': { view: home, id: 'home' },
  '/': { view: home, id: 'home' },
  '/ratings': { view: ratings, id: 'ratings' },
  '/search': { view: search, id: 'search' },
  '/teams': { view: teams, id: 'teams' },
  '/rankings': { view: rankings, id: 'rankings' }
};

const pageContent = document.getElementById('page-content');

function getHashRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const path = hash.split('?')[0] || '/';
  return path in routes ? routes[path] : routes['/'];
}

function setActiveNav(routeId) {
  document.querySelectorAll('.nav-link[data-route]').forEach(link => {
    link.classList.toggle('active', link.dataset.route === routeId);
  });
}

function render() {
  const route = getHashRoute();
  if (!route || !route.view || !route.view.render) {
    pageContent.innerHTML = '<div class="empty-state"><p>Page not found.</p></div>';
    return;
  }
  pageContent.innerHTML = route.view.render();
  setActiveNav(route.id);
  if (typeof route.view.mount === 'function') {
    route.view.mount();
  }
}

window.addEventListener('hashchange', render);
window.addEventListener('load', render);
