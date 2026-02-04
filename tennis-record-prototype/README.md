# TennisRecord.com — Prototype

A modern, front-end–focused prototype for an improved USTA tennis analytics platform. Single-page app with mock API, ready for future MySQL integration.

## Tech Stack

- **Frontend:** HTML5, CSS (Flexbox/Grid, responsive), Vanilla JavaScript (ES6 modules), Bootstrap 5
- **Backend:** C# ASP.NET Core 8 minimal API, mock data, repository/service pattern
- **Database:** Structure is MySQL-ready; no DB required for this prototype

## Project Structure

```
tennis-record-prototype/
├── frontend/
│   ├── index.html          # Single entry, #app container
│   ├── css/
│   │   └── styles.css      # Custom styles + tennis theme
│   └── js/
│       ├── app.js          # SPA router
│       ├── api.js          # API client
│       ├── modal.js        # Player detail modal
│       └── views/
│           ├── home.js
│           ├── ratings.js  # Player Ratings
│           ├── search.js   # Player Search
│           ├── teams.js    # Team Search
│           └── rankings.js # Player Rankings
├── backend/
│   ├── Program.cs          # API + CORS
│   ├── Models/             # Domain models (MySQL-ready)
│   ├── DTOs/               # Data transfer objects
│   └── Services/           # Mock implementations (swap for MySQL later)
└── README.md
```

## Running the App

### 1. Backend (API)

```bash
cd backend
dotnet run
```

API runs at **http://localhost:5000**. Endpoints:

- `GET /api/players` — search (name, gender, ageGroup, ntrpMin, ntrpMax, section, activeYear, sortBy, page, pageSize)
- `GET /api/players/rating?q=...` — single player rating lookup
- `GET /api/players/{id}` — player detail
- `GET /api/teams` — team search (name, section, leagueLevel)
- `GET /api/teams/{id}` — team with roster
- `GET /api/rankings` — rankings (category, section, ageGroup, gender)

### 2. Frontend

Serve the `frontend` folder with any static server. Examples:

**Option A — VS Code Live Server**  
Open `frontend/index.html` and use “Live Server” (must allow CORS if needed).

**Option B — Python**

```bash
cd frontend
python3 -m http.server 5500
```

**Option C — Node (npx)**

```bash
cd frontend
npx serve -p 5500
```

Then open **http://localhost:5500** (or the port you used). The app expects the API at **http://localhost:5000**. To use a different API URL, set `window.TENNIS_RECORD_API` before loading (e.g. in a script in `index.html`).

### CORS

The API allows origins: `http://localhost:5500`, `http://127.0.0.1:5500`, `http://localhost:3000`. Adjust in `backend/Program.cs` if you use another origin.

## Features

- **Global layout:** Sticky nav (Player Ratings, Player Search, Team Search, Player Rankings), full-width content, no ads.
- **Player Ratings:** Single page, search by name, results update below; rating, trend, recent matches; “View full profile” opens modal.
- **Player Search:** Left filter panel (name, gender, age, NTRP range, section, year), sort (name, rating, matches), paginated table; row click opens player modal.
- **Team Search:** Search by name/section/level; team cards with avg rating and top 3 players; “View full roster” accordion loads roster via API.
- **Player Rankings:** Adult / Junior tabs; filters (section, age, gender); ranking table with rank, name, rating, trend.

## Future MySQL Integration

- **Models** in `backend/Models/` are intended to map to tables (`players`, `teams`, `rankings`, `matches`).
- **Services** in `backend/Services/` can be replaced with implementations that call a repository layer; repositories would run SQL (e.g. via MySqlConnector). Keep the same interface so controllers/endpoints stay unchanged.
- Add connection string to `appsettings.json` and inject `IDbConnection` or a repository into the existing services.

## License

Prototype for educational/demo use.
