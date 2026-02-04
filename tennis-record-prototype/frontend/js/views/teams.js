/**
 * Team Search — search by name/section/level, team cards, expandable roster (accordion).
 */

import { getTeams, getTeamById } from '../api.js';

function escapeHtml(s) {
  if (s == null) return '';
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

export function render() {
  const sections = ['Southern', 'Southern Cal', 'Texas', 'Florida', 'Midwest', 'Eastern'];
  const sectionOpts = sections.map(s => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join('');
  const levels = ['3.0', '3.5', '4.0', '4.5', '5.0'];
  const levelOpts = levels.map(l => `<option value="${escapeHtml(l)}">${escapeHtml(l)}</option>`).join('');

  return `
    <div class="page-enter">
      <h1 class="h2 mb-4">Team Search</h1>
      <div class="filter-panel mb-4">
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label" for="team-name">Team name</label>
            <input type="text" class="form-control" id="team-name" placeholder="Partial name" />
          </div>
          <div class="col-md-3">
            <label class="form-label" for="team-section">Section</label>
            <select class="form-select" id="team-section">
              <option value="">Any</option>
              ${sectionOpts}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="team-level">League level</label>
            <select class="form-select" id="team-level">
              <option value="">Any</option>
              ${levelOpts}
            </select>
          </div>
          <div class="col-md-2 d-flex align-items-end">
            <button type="button" class="btn btn-primary w-100" id="team-search-btn">Search</button>
          </div>
        </div>
      </div>
      <div id="teams-loading" class="loading-wrap d-none">
        <div class="spinner-border text-primary"></div>
        <span>Loading...</span>
      </div>
      <div id="teams-empty" class="empty-state d-none">
        <div class="empty-state-icon">👥</div>
        <p class="mb-0">No teams found. Try different filters.</p>
      </div>
      <div id="teams-list" class="row g-4 d-none"></div>
    </div>
  `;
}

function setState(state) {
  document.getElementById('teams-loading')?.classList.toggle('d-none', state !== 'loading');
  document.getElementById('teams-empty')?.classList.toggle('d-none', state !== 'empty');
  document.getElementById('teams-list')?.classList.toggle('d-none', state !== 'list');
}

export function mount() {
  const nameEl = document.getElementById('team-name');
  const sectionEl = document.getElementById('team-section');
  const levelEl = document.getElementById('team-level');
  const btn = document.getElementById('team-search-btn');

  async function doSearch() {
    const name = nameEl?.value?.trim() || null;
    const section = sectionEl?.value || null;
    const leagueLevel = levelEl?.value || null;
    setState('loading');
    try {
      const data = await getTeams({ name, section, leagueLevel });
      const teams = Array.isArray(data) ? data : [];
      if (teams.length === 0) {
        setState('empty');
        return;
      }
      setState('list');
      const listEl = document.getElementById('teams-list');
      if (!listEl) return;

      listEl.innerHTML = teams.map((team, idx) => {
        const top3 = (team.topPlayers || []).slice(0, 3);
        const topList = top3.map(p => `<li class="list-group-item py-1">${escapeHtml(p.fullName)} <span class="text-muted">${p.ntrpRating != null ? p.ntrpRating.toFixed(1) : ''}</span></li>`).join('');
        const accordionId = `team-accordion-${team.id}-${idx}`;
        const collapseId = `team-collapse-${team.id}-${idx}`;
        return `
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100">
              <div class="card-header d-flex justify-content-between align-items-center">
                <span>${escapeHtml(team.name)}</span>
                <span class="badge bg-primary">${team.averageRating != null ? team.averageRating.toFixed(1) : '—'} avg</span>
              </div>
              <div class="card-body">
                <p class="text-muted small mb-2">${escapeHtml(team.section || '')} ${team.leagueLevel ? ' · ' + escapeHtml(team.leagueLevel) : ''}</p>
                <p class="small fw-semibold mb-1">Top players</p>
                <ul class="list-group list-group-flush mb-3">
                  ${topList || '<li class="list-group-item py-1 text-muted">—</li>'}
                </ul>
                <div class="accordion" id="${accordionId}">
                  <div class="accordion-item border-0">
                    <h3 class="accordion-header">
                      <button class="accordion-button collapsed py-2" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                        View full roster
                      </button>
                    </h3>
                    <div id="${collapseId}" class="accordion-collapse collapse" data-bs-parent="#${accordionId}">
                      <div class="accordion-body py-2" data-team-id="${team.id}">
                        <div class="small loading-roster">Loading...</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      listEl.querySelectorAll('[data-team-id]').forEach(accBody => {
        const collapse = accBody.closest('.accordion-collapse');
        if (!collapse) return;
        const observer = new MutationObserver(() => {
          if (collapse.classList.contains('show')) {
            const tid = parseInt(accBody.dataset.teamId, 10);
            if (accBody.dataset.loaded) return;
            accBody.dataset.loaded = '1';
            getTeamById(tid).then(team => {
              const roster = team?.roster || [];
              accBody.innerHTML = roster.length
                ? `<ul class="list-group list-group-flush mb-0">${roster.map(p => `<li class="list-group-item py-1">${escapeHtml(p.fullName)} <span class="text-muted">${p.ntrpRating != null ? p.ntrpRating.toFixed(1) : ''}</span></li>`).join('')}</ul>`
                : '<p class="small text-muted mb-0">No roster data.</p>';
            }).catch(() => {
              accBody.innerHTML = '<p class="small text-muted mb-0">Could not load roster.</p>';
            });
          }
        });
        observer.observe(collapse, { attributes: true, attributeFilter: ['class'] });
      });
    } catch (e) {
      setState('empty');
      console.error(e);
    }
  }

  btn?.addEventListener('click', doSearch);
  nameEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  doSearch();
}
