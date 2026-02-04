namespace TennisRecord.Api.Models;

/// <summary>
/// Domain model for a USTA player.
/// Maps to future MySQL table: players
/// </summary>
public class Player
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Gender { get; set; } = "M"; // M, F
    public string? UstaSection { get; set; }
    public decimal? NtrpRating { get; set; }
    public string? RatingTrend { get; set; } // "up", "down", "stable"
    public int? MatchCount { get; set; }
    public int? ActiveYear { get; set; }
    public string? AgeGroup { get; set; } // "18+", "40+", "55+", etc.
}
