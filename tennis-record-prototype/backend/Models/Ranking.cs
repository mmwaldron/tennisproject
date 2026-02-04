namespace TennisRecord.Api.Models;

/// <summary>
/// Ranking entry for a player in a given category.
/// Maps to future MySQL table: rankings (or view).
/// </summary>
public class Ranking
{
    public int Rank { get; set; }
    public int PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public decimal? Rating { get; set; }
    public string? Trend { get; set; }
    public string Category { get; set; } = "Adult"; // Adult, Junior
    public string? Section { get; set; }
    public string? AgeGroup { get; set; }
    public string? Gender { get; set; }
}
