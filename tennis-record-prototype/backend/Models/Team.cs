namespace TennisRecord.Api.Models;

/// <summary>
/// Domain model for a USTA team.
/// Maps to future MySQL table: teams
/// </summary>
public class Team
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Section { get; set; }
    public string? LeagueLevel { get; set; }
    public decimal? AverageRating { get; set; }
    public List<PlayerSummary>? TopPlayers { get; set; }
    public List<PlayerSummary>? Roster { get; set; }
}

/// <summary>
/// Lightweight player reference for team rosters and top players.
/// </summary>
public class PlayerSummary
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public decimal? NtrpRating { get; set; }
}
