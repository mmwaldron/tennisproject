/**
 * API client for TennisRecord backend.
 * When the site is served from the same host (e.g. port 5000), use same-origin so no CORS or port mix-up.
 * Override with window.TENNIS_RECORD_API if you serve the frontend elsewhere.
 */
const API_BASE = window.TENNIS_RECORD_API ?? '';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!res.ok) {
    const text = await res.text();
    let err;
    try {
      err = JSON.parse(text);
    } catch {
      err = { message: text || res.statusText };
    }
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204 || res.headers.get('content-length') === '0') return null;
  return res.json();
}

export async function getPlayerRating(query) {
  const params = new URLSearchParams({ q: query });
  return request(`/api/players/rating?${params}`);
}

export async function getPlayers(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') search.set(k, v);
  });
  const qs = search.toString();
  return request(`/api/players${qs ? `?${qs}` : ''}`);
}

export async function getPlayerById(id) {
  return request(`/api/players/${id}`);
}

export async function getTeams(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') search.set(k, v);
  });
  const qs = search.toString();
  return request(`/api/teams${qs ? `?${qs}` : ''}`);
}

export async function getTeamById(id) {
  return request(`/api/teams/${id}`);
}

export async function getRankings(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') search.set(k, v);
  });
  const qs = search.toString();
  return request(`/api/rankings${qs ? `?${qs}` : ''}`);
}

export { API_BASE };
