using TennisRecord.Api.DTOs;
using TennisRecord.Api.Models;

namespace TennisRecord.Api.Services;

/// <summary>
/// Mock implementation of team service. Replace with repository calls to MySQL when ready.
/// </summary>
public class TeamService : ITeamService
{
    private static readonly List<Team> MockTeams = BuildMockTeams();

    public Task<IEnumerable<TeamDto>> SearchAsync(string? name, string? section, string? leagueLevel)
    {
        var query = MockTeams.AsEnumerable();
        if (!string.IsNullOrWhiteSpace(name))
        {
            var n = name.Trim().ToLowerInvariant();
            query = query.Where(t => t.Name.ToLowerInvariant().Contains(n));
        }
        if (!string.IsNullOrWhiteSpace(section))
            query = query.Where(t => t.Section == section);
        if (!string.IsNullOrWhiteSpace(leagueLevel))
            query = query.Where(t => t.LeagueLevel == leagueLevel);

        var dtos = query.Select(t => new TeamDto
        {
            Id = t.Id,
            Name = t.Name,
            Section = t.Section,
            LeagueLevel = t.LeagueLevel,
            AverageRating = t.AverageRating,
            TopPlayers = t.TopPlayers?.Select(p => new PlayerSummaryDto { Id = p.Id, FullName = p.FullName, NtrpRating = p.NtrpRating }).ToList(),
            Roster = t.Roster?.Select(p => new PlayerSummaryDto { Id = p.Id, FullName = p.FullName, NtrpRating = p.NtrpRating }).ToList()
        });
        return Task.FromResult(dtos);
    }

    public Task<TeamDto?> GetByIdAsync(int id)
    {
        var t = MockTeams.FirstOrDefault(x => x.Id == id);
        if (t == null) return Task.FromResult<TeamDto?>(null);
        var dto = new TeamDto
        {
            Id = t.Id,
            Name = t.Name,
            Section = t.Section,
            LeagueLevel = t.LeagueLevel,
            AverageRating = t.AverageRating,
            TopPlayers = t.TopPlayers?.Select(p => new PlayerSummaryDto { Id = p.Id, FullName = p.FullName, NtrpRating = p.NtrpRating }).ToList(),
            Roster = t.Roster?.Select(p => new PlayerSummaryDto { Id = p.Id, FullName = p.FullName, NtrpRating = p.NtrpRating }).ToList()
        };
        return Task.FromResult<TeamDto?>(dto);
    }

    private static List<Team> BuildMockTeams()
    {
        var sections = new[] { "Southern", "Southern Cal", "Texas", "Florida", "Midwest" };
        var levels = new[] { "3.0", "3.5", "4.0", "4.5", "5.0" };
        var rng = new Random(123);
        var teams = new List<Team>();
        var names = new[] {
            "Riverside Racquet Club", "Metro Tennis Alliance", "Sunset Park Aces", "Downtown Dynamos",
            "Lakeside Legends", "Highland Hurricanes", "Valley View Vipers", "Central City Chargers",
            "Northside Nets", "West End Warriors", "Eastside Eagles", "South Bay Strikers"
        };
        for (int i = 0; i < names.Length; i++)
        {
            var section = sections[rng.Next(sections.Length)];
            var level = levels[rng.Next(levels.Length)];
            var roster = new List<PlayerSummary>();
            for (int j = 1; j <= 8; j++)
            {
                var pid = (i * 4 + j) % 50 + 1;
                roster.Add(new PlayerSummary { Id = pid, FullName = $"Player {pid}", NtrpRating = (decimal)(3.0 + rng.NextDouble() * 2) });
            }
            var top3 = roster.OrderByDescending(p => p.NtrpRating).Take(3).ToList();
            var avg = (decimal?)roster.Average(p => (double)(p.NtrpRating ?? 0));
            teams.Add(new Team
            {
                Id = i + 1,
                Name = names[i],
                Section = section,
                LeagueLevel = level,
                AverageRating = Math.Round(avg ?? 0, 1),
                TopPlayers = top3,
                Roster = roster
            });
        }
        return teams;
    }
}
