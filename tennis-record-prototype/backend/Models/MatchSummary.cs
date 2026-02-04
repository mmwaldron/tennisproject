namespace TennisRecord.Api.Models;

/// <summary>
/// Brief summary of a recent match for display on player rating view.
/// Maps to future MySQL table: matches
/// </summary>
public class MatchSummary
{
    public int Id { get; set; }
    public string OpponentName { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty; // e.g. "W 6-4, 6-3"
    public DateTime? Date { get; set; }
}
