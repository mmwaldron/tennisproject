using TennisRecord.Api.DTOs;

namespace TennisRecord.Api.Services;

/// <summary>
/// Player data access abstraction. Replace with MySQL-backed implementation later.
/// </summary>
public interface IPlayerService
{
    Task<(IEnumerable<PlayerDto> Items, int Total)> SearchAsync(string? name, string? gender, string? ageGroup,
        decimal? ntrpMin, decimal? ntrpMax, string? section, int? activeYear, string? sortBy, int page, int pageSize);
    Task<PlayerDetailDto?> GetByIdAsync(int id);
    Task<PlayerDetailDto?> GetRatingBySearchAsync(string searchTerm);
}
