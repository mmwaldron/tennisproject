/**
 * Home / landing view.
 */

export function render() {
  return `
    <div class="page-enter home-hero">
      <div class="bg-bouncer" aria-hidden="true"></div>

      <div class="text-center py-5 position-relative">
        <h1 class="display-5 fw-bold text-dark mb-3">USTA Tennis Analytics</h1>
        <p class="lead text-secondary mb-4">
          Look up player ratings, search players and teams, and view rankings — all in one place.
        </p>
        <div class="d-flex flex-wrap justify-content-center gap-3">
          <a href="#/ratings" class="btn btn-primary btn-lg">Player Ratings</a>
          <a href="#/search" class="btn btn-outline-primary btn-lg">Player Search</a>
          <a href="#/teams" class="btn btn-outline-primary btn-lg">Team Search</a>
          <a href="#/rankings" class="btn btn-outline-primary btn-lg">Rankings</a>
          <a href="#/bookmarks" class="btn btn-outline-primary btn-lg">Bookmarked Players</a>
        </div>
      </div>
    </div>
  `;
}

