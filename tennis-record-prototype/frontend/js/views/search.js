/**
 * Player Search — filter panel, sort, paginated results, modal detail on click.
 */

import { getPlayers } from '../api.js';
import { showPlayerModal } from '../modal.js';

const PAGE_SIZE = 20;
let currentPage = 1;
let lastParams = {};
let totalCount = 0;

const SECTIONS = ['Southern', 'Southern Cal', 'Texas', 'Florida', 'Midwest', 'Eastern', 'Northern'];
const AGE_GROUPS = ['18+', '40+', '55+', '65+'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'rating', label: 'Rating (high → low)' },
  { value: 'matches', label: 'Match count' }
];

function trendIcon(trend) {
  const t = (trend || '').toLowerCase();
  if (t === 'up') return '↑';
  if (t === 'down') return '↓';
  return '→';
}

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function render() {
  const sectionOpts = SECTIONS.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  const ageOpts = AGE_GROUPS.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
  const sortOpts = SORT_OPTIONS.map(o => `<option value="${escapeHtml(o.value)}">${escapeHtml(o.label)}</option>`).join('');

  return `
    <div class="page-enter">
      <h1 class="h2 mb-4">Player Search</h1>
      <div class="row">
        <div class="col-lg-3 mb-4">
          <div class="filter-panel">
            <h2 class="h6 mb-3">Filters</h2>
            <div class="mb-3">
              <label class="form-label" for="filter-name">Name</label>
              <input type="text" class="form-control form-control-sm" id="filter-name" placeholder="Partial match" />
            </div>
            <div class="mb-3">
              <label class="form-label" for="filter-gender">Gender</label>
              <select class="form-select form-select-sm" id="filter-gender">
                <option value="">Any</option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="filter-age">Age group</label>
              <select class="form-select form-select-sm" id="filter-age">
                <option value="">Any</option>
                ${ageOpts}
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="filter-ntrp-min">NTRP min</label>
              <input type="number" class="form-control form-control-sm" id="filter-ntrp-min" min="2" max="7" step="0.5" placeholder="e.g. 3.0" />
            </div>
            <div class="mb-3">
              <label class="form-label" for="filter-ntrp-max">NTRP max</label>
              <input type="number" class="form-control form-control-sm" id="filter-ntrp-max" min="2" max="7" step="0.5" placeholder="e.g. 5.0" />
            </div>
            <div class="mb-3">
              <label class="form-label" for="filter-section">Section</label>
              <select class="form-select form-select-sm" id="filter-section">
                <option value="">Any</option>
                ${sectionOpts}
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="filter-year">Active year</label>
              <input type="number" class="form-control form-control-sm" id="filter-year" placeholder="e.g. 2024" />
            </div>
            <button type="button" class="btn btn-primary w-100" id="search-apply">Apply</button>
          </div>
        </div>
        <div class="col-lg-9">
          <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
            <div class="d-flex align-items-center gap-2">
              <label class="form-label mb-0" for="sort-by">Sort by</label>
              <select class="form-select form-select-sm w-auto" id="sort-by">
                ${sortOpts}
              </select>
            </div>
          </div>
          <div id="search-loading" class="loading-wrap d-none">
            <div class="spinner-border text-primary"></div>
            <span>Loading...</span>
          </div>
          <div id="search-empty" class="empty-state d-none">
            <div class="empty-state-icon">🔍</div>
            <p class="mb-0">No players found. Adjust filters or try a different search.</p>
          </div>
          <div id="search-results" class="d-none">
            <div class="table-analytics">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Rating</th>
                    <th>Trend</th>
                    <th>Section</th>
                    <th>Matches</th>
                  </tr>
                </thead>
                <tbody id="search-tbody"></tbody>
              </table>
            </div>
            <nav class="mt-3" id="search-pagination" aria-label="Results pagination"></nav>
          </div>
        </div>
      </div>
    </div>
  `;
}

function setState(state) {
  document.getElementById('search-loading')?.classList.toggle('d-none', state !== 'loading');
  document.getElementById('search-empty')?.classList.toggle('d-none', state !== 'empty');
  document.getElementById('search-results')?.classList.toggle('d-none', state !== 'results');
}

function buildParams() {
  const name = document.getElementById('filter-name')?.value?.trim() || null;
  const gender = document.getElementById('filter-gender')?.value || null;
  const ageGroup = document.getElementById('filter-age')?.value || null;
  const ntrpMin = document.getElementById('filter-ntrp-min')?.value ? parseFloat(document.getElementById('filter-ntrp-min').value) : null;
  const ntrpMax = document.getElementById('filter-ntrp-max')?.value ? parseFloat(document.getElementById('filter-ntrp-max').value) : null;
  const section = document.getElementById('filter-section')?.value || null;
  const activeYear = document.getElementById('filter-year')?.value ? parseInt(document.getElementById('filter-year').value, 10) : null;
  const sortBy = document.getElementById('sort-by')?.value || 'name';
  return { name, gender, ageGroup, ntrpMin, ntrpMax, section, activeYear, sortBy, page: currentPage, pageSize: PAGE_SIZE };
}

async function loadResults() {
  lastParams = buildParams();
  setState('loading');
  try {
    const data = await getPlayers(lastParams);
    const list = data?.items ? data.items : (Array.isArray(data) ? data : []);
    totalCount = data?.total != null ? data.total : list.length;
    if (list.length === 0) {
      setState('empty');
      return;
    }
    setState('results');
    const tbody = document.getElementById('search-tbody');
    if (tbody) {
      tbody.innerHTML = list.map(p => `
        <tr class="player-row" data-id="${p.id}">
          <td>${escapeHtml(p.fullName)}</td>
          <td>${p.ntrpRating != null ? p.ntrpRating.toFixed(1) : '—'}</td>
          <td><span class="trend-icon">${trendIcon(p.ratingTrend)}</span></td>
          <td>${escapeHtml(p.ustaSection || '—')}</td>
          <td>${p.matchCount != null ? p.matchCount : '—'}</td>
        </tr>
      `).join('');
      tbody.querySelectorAll('.player-row').forEach(row => {
        row.addEventListener('click', () => showPlayerModal(parseInt(row.dataset.id, 10)));
      });
    }
    renderPagination();
  } catch (e) {
    setState('empty');
    console.error(e);
  }
}

function renderPagination() {
  const nav = document.getElementById('search-pagination');
  if (!nav) return;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  if (totalPages <= 1) {
    nav.innerHTML = '';
    return;
  }
  let html = '<ul class="pagination pagination-sm mb-0">';
  for (let i = 1; i <= totalPages; i++) {
    const active = i === currentPage ? ' active' : '';
    html += `<li class="page-item${active}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`;
  }
  html += '</ul>';
  nav.innerHTML = html;
  nav.querySelectorAll('.page-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      currentPage = parseInt(link.dataset.page, 10);
      loadResults();
    });
  });
}

export function mount() {
  currentPage = 1;
  document.getElementById('search-apply')?.addEventListener('click', () => {
    currentPage = 1;
    loadResults();
  });
  document.getElementById('sort-by')?.addEventListener('change', () => {
    currentPage = 1;
    loadResults();
  });
  loadResults();
}
