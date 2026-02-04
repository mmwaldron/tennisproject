using TennisRecord.Api.DTOs;
using TennisRecord.Api.Models;

namespace TennisRecord.Api.Services;

/// <summary>
/// Mock implementation of ranking service. Replace with repository calls to MySQL when ready.
/// </summary>
public class RankingService : IRankingService
{
    private static readonly List<Ranking> MockRankings = BuildMockRankings();

    public Task<IEnumerable<RankingDto>> GetRankingsAsync(string category, string? section, string? ageGroup, string? gender)
    {
        var query = MockRankings.Where(r => string.Equals(r.Category, category, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(section))
            query = query.Where(r => r.Section == section);
        if (!string.IsNullOrWhiteSpace(ageGroup))
            query = query.Where(r => r.AgeGroup == ageGroup);
        if (!string.IsNullOrWhiteSpace(gender))
            query = query.Where(r => r.Gender == gender);

        var ordered = query.OrderBy(r => r.Rank).ToList();
        var dtos = ordered.Select(r => new RankingDto
        {
            Rank = r.Rank,
            PlayerId = r.PlayerId,
            PlayerName = r.PlayerName,
            Rating = r.Rating,
            Trend = r.Trend,
            Category = r.Category,
            Section = r.Section,
            AgeGroup = r.AgeGroup,
            Gender = r.Gender
        });
        return Task.FromResult(dtos);
    }

    private static List<Ranking> BuildMockRankings()
    {
        var list = new List<Ranking>();
        var categories = new[] { "Adult", "Junior" };
        var sections = new[] { "Southern", "Southern Cal", "Texas", "Florida", "Midwest", "Eastern" };
        var ageGroups = new[] { "18+", "40+", "55+", "12U", "14U", "16U", "18U" };
        var trends = new[] { "up", "down", "stable" };
        var rng = new Random(99);
        var names = new[] {
            "Emma Williams", "James Smith", "Sofia Johnson", "Liam Davis", "Olivia Martinez",
            "Noah Garcia", "Ava Rodriguez", "Ethan Wilson", "Mia Anderson", "Mason Thomas",
            "Charlotte Taylor", "Lucas Moore", "Amelia Jackson", "Oliver White", "Harper Harris"
        };
        int rank = 1;
        foreach (var cat in categories)
        {
            var ag = cat == "Junior" ? new[] { "12U", "14U", "16U", "18U" } : new[] { "18+", "40+", "55+" };
            foreach (var section in sections.Take(3))
            {
                foreach (var g in new[] { "M", "F" })
                {
                    for (int i = 0; i < 10; i++)
                    {
                        list.Add(new Ranking
                        {
                            Rank = rank++,
                            PlayerId = rng.Next(1, 50),
                            PlayerName = names[rng.Next(names.Length)] + " " + rng.Next(1, 99),
                            Rating = (decimal)(4.0 + rng.NextDouble() * 3),
                            Trend = trends[rng.Next(trends.Length)],
                            Category = cat,
                            Section = section,
                            AgeGroup = ag[rng.Next(ag.Length)],
                            Gender = g
                        });
                    }
                }
            }
        }
        return list;
    }
}
