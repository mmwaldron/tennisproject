/**
 * Player detail modal — shared by Ratings and Player Search.
 */

import { getPlayerById } from './api.js';

let modalInstance = null;

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function trendClass(trend) {
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

export function showPlayerModal(playerId) {
  const el = document.getElementById('playerModal');
  const body = document.getElementById('playerModalBody');
  if (!el || !body) return;

  if (!modalInstance) modalInstance = new bootstrap.Modal(el);

  body.innerHTML = '<div class="loading-wrap"><div class="spinner-border"></div> Loading...</div>';
  modalInstance.show();

  getPlayerById(playerId)
    .then(player => {
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
        : '<p class="text-muted small mt-2">No recent matches.</p>';
      body.innerHTML = `
        <div>
          <h3 class="h5">${escapeHtml(player.fullName)}</h3>
          <p class="text-muted mb-2">${escapeHtml(player.ustaSection || '')} ${player.ageGroup ? ' · ' + escapeHtml(player.ageGroup) : ''} ${player.gender ? ' · ' + escapeHtml(player.gender) : ''}</p>
          <p class="mb-2">
            <span class="rating-badge">NTRP ${player.ntrpRating != null ? player.ntrpRating.toFixed(1) : '—'}</span>
            <span class="${trend} trend-icon ms-1">${icon}</span>
            ${player.matchCount != null ? `<span class="text-muted ms-2">${player.matchCount} matches</span>` : ''}
          </p>
          ${matchesHtml}
        </div>
      `;
    })
    .catch(() => {
      body.innerHTML = '<p class="text-danger">Could not load player details.</p>';
    });
}
