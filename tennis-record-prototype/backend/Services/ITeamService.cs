using TennisRecord.Api.DTOs;

namespace TennisRecord.Api.Services;

/// <summary>
/// Team data access abstraction. Replace with MySQL-backed implementation later.
/// </summary>
public interface ITeamService
{
    Task<IEnumerable<TeamDto>> SearchAsync(string? name, string? section, string? leagueLevel);
    Task<TeamDto?> GetByIdAsync(int id);
}
