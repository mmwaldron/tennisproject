namespace TennisRecord.Api.DTOs;

/// <summary>
/// DTO for player list and search results.
/// </summary>
public class PlayerDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string Gender { get; set; } = "M";
    public string? UstaSection { get; set; }
    public decimal? NtrpRating { get; set; }
    public string? RatingTrend { get; set; }
    public int? MatchCount { get; set; }
    public int? ActiveYear { get; set; }
    public string? AgeGroup { get; set; }
}

/// <summary>
/// DTO for single player detail (ratings page, modal).
/// </summary>
public class PlayerDetailDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string Gender { get; set; } = "M";
    public string? UstaSection { get; set; }
    public decimal? NtrpRating { get; set; }
    public string? RatingTrend { get; set; }
    public int? MatchCount { get; set; }
    public int? ActiveYear { get; set; }
    public string? AgeGroup { get; set; }
    public List<MatchSummaryDto>? RecentMatches { get; set; }
}

public class MatchSummaryDto
{
    public int Id { get; set; }
    public string OpponentName { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
    public string? Date { get; set; }
}
