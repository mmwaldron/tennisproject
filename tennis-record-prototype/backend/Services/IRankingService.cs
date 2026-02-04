using TennisRecord.Api.DTOs;

namespace TennisRecord.Api.Services;

/// <summary>
/// Rankings data access abstraction. Replace with MySQL-backed implementation later.
/// </summary>
public interface IRankingService
{
    Task<IEnumerable<RankingDto>> GetRankingsAsync(string category, string? section, string? ageGroup, string? gender);
}
