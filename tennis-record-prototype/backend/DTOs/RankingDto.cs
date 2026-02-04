namespace TennisRecord.Api.DTOs;

/// <summary>
/// DTO for ranking table rows.
/// </summary>
public class RankingDto
{
    public int Rank { get; set; }
    public int PlayerId { get; set; }
    public string PlayerName { get; set; } = string.Empty;
    public decimal? Rating { get; set; }
    public string? Trend { get; set; }
    public string Category { get; set; } = "Adult";
    public string? Section { get; set; }
    public string? AgeGroup { get; set; }
    public string? Gender { get; set; }
}
