/**
 * Bookmarked Players — list view with filters and table.
 */

import { getBookmarkedPlayers } from '../api.js';

const SECTIONS = ['Southern', 'Southern Cal', 'Texas', 'Florida', 'Midwest', 'Eastern'];

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function render() {
  const sectionOpts = SECTIONS
    .map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`)
    .join('');

  return `
    <div class="page-enter">
      <h1 class="h2 mb-4">Bookmarked Players</h1>

      <div class="filter-panel mb-4">
        <div class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label" for="bm-section">Section</label>
            <select class="form-select form-select-sm" id="bm-section">
              <option value="">All</option>
              ${sectionOpts}
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label" for="bm-gender">Gender</label>
            <select class="form-select form-select-sm" id="bm-gender">
              <option value="">All</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-primary btn-sm w-100" id="bm-apply">
              Apply
            </button>
          </div>
        </div>
      </div>

      <div id="bm-loading" class="loading-wrap d-none">
        <div class="spinner-border text-primary"></div>
        <span>Loading...</span>
      </div>

      <div id="bm-empty" class="empty-state d-none">
        <div class="empty-state-icon">⭐</div>
        <p class="mb-0">No bookmarked players yet.</p>
      </div>

      <div id="bm-content" class="d-none">
        <div class="table-analytics">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Player</th>
                <th>Rating</th>
                <th>Section</th>
                <th>Age</th>
                <th>Gender</th>
              </tr>
            </thead>
            <tbody id="bm-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function setState(state) {
  document.getElementById('bm-loading')?.classList.toggle('d-none', state !== 'loading');
  document.getElementById('bm-empty')?.classList.toggle('d-none', state !== 'empty');
  document.getElementById('bm-content')?.classList.toggle('d-none', state !== 'content');
}

async function loadBookmarks() {
  const section = document.getElementById('bm-section')?.value || null;
  const gender = document.getElementById('bm-gender')?.value || null;

  setState('loading');

  try {
    const data = await getBookmarkedPlayers({ section, gender });
    const list = Array.isArray(data) ? data : [];

    if (list.length === 0) {
      setState('empty');
      return;
    }

    setState('content');

    const tbody = document.getElementById('bm-tbody');
    if (tbody) {
      tbody.innerHTML = list.map(p => `
        <tr>
          <td>${escapeHtml(p.playerName)}</td>
          <td>${p.rating != null ? p.rating.toFixed(1) : '—'}</td>
          <td>${escapeHtml(p.section || '—')}</td>
          <td>${escapeHtml(p.ageGroup || '—')}</td>
          <td>${escapeHtml(p.gender || '—')}</td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.error(e);
    setState('empty');
  }
}

export function mount() {
  document.getElementById('bm-apply')?.addEventListener('click', loadBookmarks);
  document.getElementById('bm-section')?.addEventListener('change', loadBookmarks);
  document.getElementById('bm-gender')?.addEventListener('change', loadBookmarks);

  loadBookmarks();
}
