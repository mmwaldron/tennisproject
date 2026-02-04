/**
 * Player Ratings — single page, search at top, results update dynamically below.
 */

import { getPlayerRating } from '../api.js';
import { showPlayerModal } from '../modal.js';

let lastSearch = '';

function trendClass(trend) {
  if (!trend) return 'trend-stable';
  const t = (trend || '').toLowerCase();
  if (t === 'up') return 'trend-up';
  if (t === 'down') return 'trend-down';
  return 'trend-stable';
}

function trendIcon(trend) {
  const t = (trend || '').toLowerCase();
  if (t === 'up') return '↑';
  if (t === 'down') return '↓';
  return '→';
}

export function render() {
  return `
    <div class="page-enter">
      <h1 class="h2 mb-4">Player Ratings</h1>
      <div class="card mb-4">
        <div class="card-body">
          <label class="form-label fw-semibold" for="rating-search">Search by player name</label>
          <div class="input-group input-group-lg">
            <input type="text" class="form-control" id="rating-search" placeholder="Enter first or last name..." autocomplete="off" />
            <button class="btn btn-primary" type="button" id="rating-search-btn">Search</button>
          </div>
          <p class="form-text text-muted mt-2 mb-0">Results update below without leaving the page.</p>
        </div>
      </div>
      <div id="rating-result-area">
        <div class="empty-state" id="rating-empty">
          <div class="empty-state-icon">🎾</div>
          <p class="mb-0">Enter a name above to look up a player's rating and recent matches.</p>
        </div>
        <div id="rating-loading" class="loading-wrap d-none">
          <div class="spinner-border text-primary" role="status"></div>
          <span>Loading...</span>
        </div>
        <div id="rating-content" class="d-none"></div>
        <div id="rating-error" class="alert alert-warning d-none" role="alert"></div>
      </div>
    </div>
  `;
}

export function mount() {
  const input = document.getElementById('rating-search');
  const btn = document.getElementById('rating-search-btn');
  const empty = document.getElementById('rating-empty');
  const loading = document.getElementById('rating-loading');
  const content = document.getElementById('rating-content');
  const errEl = document.getElementById('rating-error');

  function setState(state) {
    empty.classList.add('d-none');
    loading.classList.add('d-none');
    content.classList.add('d-none');
    errEl.classList.add('d-none');
    if (state === 'empty') empty.classList.remove('d-none');
    else if (state === 'loading') loading.classList.remove('d-none');
    else if (state === 'error') errEl.classList.remove('d-none');
    else if (state === 'content') content.classList.remove('d-none');
  }

  async function doSearch() {
    const q = (input?.value || '').trim();
    if (!q) {
      setState('empty');
      lastSearch = '';
      return;
    }
    lastSearch = q;
    setState('loading');
    errEl.textContent = '';
    try {
      const player = await getPlayerRating(q);
      if (!player) {
        setState('error');
        errEl.textContent = 'No player found for that search. Try a different name.';
        return;
      }
      setState('content');
      const trend = trendClass(player.ratingTrend);
      const icon = trendIcon(player.ratingTrend);
      const matchesHtml = (player.recentMatches && player.recentMatches.length)
        ? `
          <h3 class="h6 mt-3 mb-2">Recent matches</h3>
          <ul class="list-group list-group-flush">
            ${player.recentMatches.map(m => `
              <li class="list-group-item d-flex justify-content-between align-items-center">
                <span>${escapeHtml(m.opponentName)}</span>
                <span class="badge bg-secondary">${escapeHtml(m.result)}</span>
                ${m.date ? `<small class="text-muted">${escapeHtml(m.date)}</small>` : ''}
              </li>
            `).join('')}
          </ul>
        `
        : '<p class="text-muted small mt-2 mb-0">No recent matches.</p>';
      content.innerHTML = `
        <div class="card">
          <div class="card-body">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <h2 class="h4 mb-1">${escapeHtml(player.fullName)}</h2>
                <p class="text-muted mb-0">${escapeHtml(player.ustaSection || '')} ${player.ageGroup ? ' · ' + escapeHtml(player.ageGroup) : ''} ${player.gender ? ' · ' + escapeHtml(player.gender) : ''}</p>
              </div>
              <div class="d-flex align-items-baseline gap-2">
                <span class="rating-badge">NTRP ${player.ntrpRating != null ? player.ntrpRating.toFixed(1) : '—'}</span>
                <span class="${trend} trend-icon" title="Trend">${icon}</span>
              </div>
            </div>
            ${player.matchCount != null ? `<p class="text-muted small mt-2 mb-0">${player.matchCount} matches (active ${player.activeYear || '—'})</p>` : ''}
            ${matchesHtml}
            <button type="button" class="btn btn-outline-primary btn-sm mt-3" data-player-id="${player.id}">View full profile</button>
          </div>
        </div>
      `;
      const viewBtn = content.querySelector('[data-player-id]');
      if (viewBtn) viewBtn.addEventListener('click', () => showPlayerModal(player.id));
    } catch (e) {
      setState('error');
      errEl.textContent = e.message || 'Something went wrong. Please try again.';
    }
  }

  btn?.addEventListener('click', doSearch);
  input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}
