namespace TennisRecord.Api.DTOs;

/// <summary>
/// DTO for team list and search results.
/// </summary>
public class TeamDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Section { get; set; }
    public string? LeagueLevel { get; set; }
    public decimal? AverageRating { get; set; }
    public List<PlayerSummaryDto>? TopPlayers { get; set; }
    public List<PlayerSummaryDto>? Roster { get; set; }
}

public class PlayerSummaryDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public decimal? NtrpRating { get; set; }
}
