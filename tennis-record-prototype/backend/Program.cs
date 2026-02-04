using TennisRecord.Api.Services;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.FileProviders;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Register services (later: replace with MySQL-backed repositories)
builder.Services.AddScoped<IPlayerService, PlayerService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<IRankingService, RankingService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:5500", "http://127.0.0.1:5500", "http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();

// Serve frontend static files from sibling ../frontend so the site is available at http://localhost:5000
var frontendPath = Path.GetFullPath(Path.Combine(builder.Environment.ContentRootPath, "..", "frontend"));
var fileProvider = new PhysicalFileProvider(frontendPath);
app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = fileProvider, DefaultFileNames = new List<string> { "index.html" } });
app.UseStaticFiles(new StaticFileOptions { FileProvider = fileProvider });

// --- API Routes (stubbed with mock data; MySQL integration will replace service calls) ---

// Player search and list (supports query params for filters, sort, pagination)
app.MapGet("/api/players", async (IPlayerService playerService,
    string? name, string? gender, string? ageGroup,
    decimal? ntrpMin, decimal? ntrpMax, string? section, int? activeYear,
    string? sortBy, int page = 1, int pageSize = 20) =>
{
    var (items, total) = await playerService.SearchAsync(
        name, gender, ageGroup, ntrpMin, ntrpMax, section, activeYear,
        sortBy ?? "name", page, pageSize);
    return Results.Ok(new { items, total });
});

// Player rating lookup by search (single result for ratings page) — must be before /api/players/{id}
app.MapGet("/api/players/rating", async (IPlayerService playerService, string? q) =>
{
    if (string.IsNullOrWhiteSpace(q)) return Results.BadRequest("Query 'q' required.");
    var player = await playerService.GetRatingBySearchAsync(q);
    return player is null ? Results.NotFound() : Results.Ok(player);
});

// Single player detail (for modal / inline view)
app.MapGet("/api/players/{id:int}", async (int id, IPlayerService playerService) =>
{
    var player = await playerService.GetByIdAsync(id);
    return player is null ? Results.NotFound() : Results.Ok(player);
});

// Team search
app.MapGet("/api/teams", async (ITeamService teamService, string? name, string? section, string? leagueLevel) =>
{
    var results = await teamService.SearchAsync(name, section, leagueLevel);
    return Results.Ok(results);
});

// Single team (for roster expansion)
app.MapGet("/api/teams/{id:int}", async (int id, ITeamService teamService) =>
{
    var team = await teamService.GetByIdAsync(id);
    return team is null ? Results.NotFound() : Results.Ok(team);
});

// Rankings (category = Adult | Junior; optional section, ageGroup, gender)
app.MapGet("/api/rankings", async (IRankingService rankingService,
    string category = "Adult", string? section = null, string? ageGroup = null, string? gender = null) =>
{
    var results = await rankingService.GetRankingsAsync(category, section, ageGroup, gender);
    return Results.Ok(results);
});

// SPA fallback: serve index.html for any non-API route so hash routing works
app.MapFallback(async context =>
{
    context.Response.ContentType = "text/html";
    await context.Response.SendFileAsync(Path.Combine(frontendPath, "index.html"));
});

app.Run();
