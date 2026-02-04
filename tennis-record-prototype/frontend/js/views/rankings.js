/**
 * Player Rankings — tabbed (Adult / Junior), filters, ranking table with trend.
 */

import { getRankings } from '../api.js';

const SECTIONS = ['Southern', 'Southern Cal', 'Texas', 'Florida', 'Midwest', 'Eastern'];
const AGE_ADULT = ['18+', '40+', '55+', '65+'];
const AGE_JUNIOR = ['12U', '14U', '16U', '18U'];

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function trendIcon(trend) {
  const t = (trend || '').toLowerCase();
  if (t === 'up') return '↑';
  if (t === 'down') return '↓';
  return '→';
}

export function render() {
  const sectionOpts = SECTIONS.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  const ageAdultOpts = AGE_ADULT.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');
  const ageJuniorOpts = AGE_JUNIOR.map(a => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('');

  return `
    <div class="page-enter">
      <h1 class="h2 mb-4">Player Rankings</h1>
      <ul class="nav nav-tabs mb-4" id="rankings-tabs" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link active" id="tab-adult" data-bs-toggle="tab" data-bs-target="#panel-adult" type="button" role="tab" aria-controls="panel-adult" aria-selected="true">Adult</button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab-junior" data-bs-toggle="tab" data-bs-target="#panel-junior" type="button" role="tab" aria-controls="panel-junior" aria-selected="false">Junior</button>
        </li>
      </ul>
      <div class="filter-panel mb-4">
        <div class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label" for="rank-section">Section</label>
            <select class="form-select form-select-sm" id="rank-section">
              <option value="">All</option>
              ${sectionOpts}
            </select>
          </div>
          <div class="col-md-3" id="rank-age-wrap-adult">
            <label class="form-label" for="rank-age-adult">Age group</label>
            <select class="form-select form-select-sm" id="rank-age-adult">
              <option value="">All</option>
              ${ageAdultOpts}
            </select>
          </div>
          <div class="col-md-3 d-none" id="rank-age-wrap-junior">
            <label class="form-label" for="rank-age-junior">Age group</label>
            <select class="form-select form-select-sm" id="rank-age-junior">
              <option value="">All</option>
              ${ageJuniorOpts}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="rank-gender">Gender</label>
            <select class="form-select form-select-sm" id="rank-gender">
              <option value="">All</option>
              <option value="M">M</option>
              <option value="F">F</option>
            </select>
          </div>
          <div class="col-md-2">
            <button type="button" class="btn btn-primary btn-sm w-100" id="rank-apply">Apply</button>
          </div>
        </div>
      </div>
      <div id="rank-loading" class="loading-wrap d-none">
        <div class="spinner-border text-primary"></div>
        <span>Loading...</span>
      </div>
      <div id="rank-empty" class="empty-state d-none">
        <div class="empty-state-icon">🏆</div>
        <p class="mb-0">No rankings for this selection.</p>
      </div>
      <div id="rank-content" class="d-none">
        <div class="table-analytics">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Rating</th>
                <th>Trend</th>
                <th>Section</th>
                <th>Age</th>
              </tr>
            </thead>
            <tbody id="rank-tbody"></tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function getCurrentCategory() {
  const active = document.querySelector('#rankings-tabs .nav-link.active');
  return active?.id === 'tab-junior' ? 'Junior' : 'Adult';
}

function getCurrentAgeGroup() {
  const cat = getCurrentCategory();
  const sel = cat === 'Junior' ? document.getElementById('rank-age-junior') : document.getElementById('rank-age-adult');
  return sel?.value || null;
}

function setState(state) {
  document.getElementById('rank-loading')?.classList.toggle('d-none', state !== 'loading');
  document.getElementById('rank-empty')?.classList.toggle('d-none', state !== 'empty');
  document.getElementById('rank-content')?.classList.toggle('d-none', state !== 'content');
}

async function loadRankings() {
  const category = getCurrentCategory();
  const section = document.getElementById('rank-section')?.value || null;
  const ageGroup = getCurrentAgeGroup();
  const gender = document.getElementById('rank-gender')?.value || null;
  setState('loading');
  try {
    const data = await getRankings({ category, section, ageGroup, gender });
    const list = Array.isArray(data) ? data : [];
    if (list.length === 0) {
      setState('empty');
      return;
    }
    setState('content');
    const tbody = document.getElementById('rank-tbody');
    if (tbody) {
      tbody.innerHTML = list.slice(0, 100).map(r => `
        <tr>
          <td>${r.rank}</td>
          <td>${escapeHtml(r.playerName)}</td>
          <td>${r.rating != null ? r.rating.toFixed(1) : '—'}</td>
          <td><span class="trend-icon">${trendIcon(r.trend)}</span></td>
          <td>${escapeHtml(r.section || '—')}</td>
          <td>${escapeHtml(r.ageGroup || '—')}</td>
        </tr>
      `).join('');
    }
  } catch (e) {
    setState('empty');
    console.error(e);
  }
}

export function mount() {
  const tabAdult = document.getElementById('tab-adult');
  const tabJunior = document.getElementById('tab-junior');
  const wrapAdult = document.getElementById('rank-age-wrap-adult');
  const wrapJunior = document.getElementById('rank-age-wrap-junior');

  tabAdult?.addEventListener('shown.bs.tab', () => {
    wrapAdult?.classList.remove('d-none');
    wrapJunior?.classList.add('d-none');
    loadRankings();
  });
  tabJunior?.addEventListener('shown.bs.tab', () => {
    wrapAdult?.classList.add('d-none');
    wrapJunior?.classList.remove('d-none');
    loadRankings();
  });

  document.getElementById('rank-apply')?.addEventListener('click', loadRankings);
  document.getElementById('rank-section')?.addEventListener('change', loadRankings);
  document.getElementById('rank-age-adult')?.addEventListener('change', loadRankings);
  document.getElementById('rank-age-junior')?.addEventListener('change', loadRankings);
  document.getElementById('rank-gender')?.addEventListener('change', loadRankings);

  loadRankings();
}
