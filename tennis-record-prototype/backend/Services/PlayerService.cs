using TennisRecord.Api.DTOs;
using TennisRecord.Api.Models;

namespace TennisRecord.Api.Services;

/// <summary>
/// Mock implementation of player service. Replace with repository calls to MySQL when ready.
/// </summary>
public class PlayerService : IPlayerService
{
    private static readonly List<Player> MockPlayers = BuildMockPlayers();
    private static readonly Dictionary<int, List<MatchSummary>> MockMatches = BuildMockMatches();

    public Task<(IEnumerable<PlayerDto> Items, int Total)> SearchAsync(string? name, string? gender, string? ageGroup,
        decimal? ntrpMin, decimal? ntrpMax, string? section, int? activeYear, string? sortBy, int page, int pageSize)
    {
        var query = MockPlayers.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            var n = name.Trim().ToLowerInvariant();
            query = query.Where(p =>
                (p.FirstName + " " + p.LastName).ToLowerInvariant().Contains(n) ||
                (p.LastName + " " + p.FirstName).ToLowerInvariant().Contains(n));
        }
        if (!string.IsNullOrWhiteSpace(gender))
            query = query.Where(p => string.Equals(p.Gender, gender, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(ageGroup))
            query = query.Where(p => p.AgeGroup == ageGroup);
        if (ntrpMin.HasValue)
            query = query.Where(p => p.NtrpRating >= ntrpMin);
        if (ntrpMax.HasValue)
            query = query.Where(p => p.NtrpRating <= ntrpMax);
        if (!string.IsNullOrWhiteSpace(section))
            query = query.Where(p => p.UstaSection == section);
        if (activeYear.HasValue)
            query = query.Where(p => p.ActiveYear == activeYear.Value);

        query = (sortBy?.ToLowerInvariant()) switch
        {
            "rating" => query.OrderByDescending(p => p.NtrpRating),
            "matches" => query.OrderByDescending(p => p.MatchCount ?? 0),
            _ => query.OrderBy(p => p.LastName).ThenBy(p => p.FirstName)
        };

        var list = query.ToList();
        var total = list.Count;
        var paged = list.Skip((page - 1) * pageSize).Take(pageSize);

        var dtos = paged.Select(p => new PlayerDto
        {
            Id = p.Id,
            FirstName = p.FirstName,
            LastName = p.LastName,
            Gender = p.Gender,
            UstaSection = p.UstaSection,
            NtrpRating = p.NtrpRating,
            RatingTrend = p.RatingTrend,
            MatchCount = p.MatchCount,
            ActiveYear = p.ActiveYear,
            AgeGroup = p.AgeGroup
        });

        return Task.FromResult((dtos, total));
    }

    public Task<PlayerDetailDto?> GetByIdAsync(int id)
    {
        var p = MockPlayers.FirstOrDefault(x => x.Id == id);
        if (p == null) return Task.FromResult<PlayerDetailDto?>(null);

        var recent = (MockMatches.TryGetValue(id, out var m) ? m : new List<MatchSummary>())
            .Take(5)
            .Select(x => new MatchSummaryDto { Id = x.Id, OpponentName = x.OpponentName, Result = x.Result, Date = x.Date?.ToString("yyyy-MM-dd") })
            .ToList();

        var dto = new PlayerDetailDto
        {
            Id = p.Id,
            FirstName = p.FirstName,
            LastName = p.LastName,
            Gender = p.Gender,
            UstaSection = p.UstaSection,
            NtrpRating = p.NtrpRating,
            RatingTrend = p.RatingTrend,
            MatchCount = p.MatchCount,
            ActiveYear = p.ActiveYear,
            AgeGroup = p.AgeGroup,
            RecentMatches = recent
        };
        return Task.FromResult<PlayerDetailDto?>(dto);
    }

    public Task<PlayerDetailDto?> GetRatingBySearchAsync(string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm)) return Task.FromResult<PlayerDetailDto?>(null);
        var term = searchTerm.Trim().ToLowerInvariant();
        var p = MockPlayers.FirstOrDefault(x =>
            (x.FirstName + " " + x.LastName).ToLowerInvariant().Contains(term) ||
            (x.LastName + " " + x.FirstName).ToLowerInvariant().Contains(term));
        if (p == null) return Task.FromResult<PlayerDetailDto?>(null);
        return GetByIdAsync(p.Id);
    }

    private static List<Player> BuildMockPlayers()
    {
        var sections = new[] { "Southern", "Southern Cal", "Texas", "Florida", "Midwest", "Eastern", "Northern" };
        var ageGroups = new[] { "18+", "40+", "55+", "65+" };
        var trends = new[] { "up", "down", "stable" };
        var list = new List<Player>();
        var names = new[] {
            ("Emma", "Williams"), ("James", "Smith"), ("Sofia", "Johnson"), ("Liam", "Davis"),
            ("Olivia", "Martinez"), ("Noah", "Garcia"), ("Ava", "Rodriguez"), ("Ethan", "Wilson"),
            ("Mia", "Anderson"), ("Mason", "Thomas"), ("Charlotte", "Taylor"), ("Lucas", "Moore"),
            ("Amelia", "Jackson"), ("Oliver", "White"), ("Harper", "Harris"), ("Elijah", "Clark"),
            ("Evelyn", "Lewis"), ("Alexander", "Robinson"), ("Abigail", "Walker"), ("Benjamin", "Hall"),
            ("Emily", "Allen"), ("William", "Young"), ("Elizabeth", "King"), ("Henry", "Wright"),
            ("Sofia", "Lopez"), ("Sebastian", "Hill"), ("Avery", "Scott"), ("Jack", "Green"),
            ("Ella", "Adams"), ("Aiden", "Baker"), ("Scarlett", "Nelson"), ("Owen", "Carter"),
            ("Grace", "Mitchell"), ("Samuel", "Perez"), ("Chloe", "Roberts"), ("Matthew", "Turner"),
            ("Victoria", "Phillips"), ("Joseph", "Campbell"), ("Riley", "Parker"), ("David", "Evans"),
            ("Aria", "Edwards"), ("John", "Collins"), ("Lily", "Stewart"), ("Luke", "Sanchez"),
            ("Zoey", "Morris"), ("Daniel", "Rogers"), ("Penelope", "Reed"), ("Carter", "Cook"),
            ("Layla", "Morgan"), ("Dylan", "Bell"), ("Nora", "Murphy"), ("Leo", "Bailey")
        };
        var rng = new Random(42);
        for (int i = 0; i < names.Length; i++)
        {
            var (first, last) = names[i];
            list.Add(new Player
            {
                Id = i + 1,
                FirstName = first,
                LastName = last,
                Gender = i % 2 == 0 ? "F" : "M",
                UstaSection = sections[rng.Next(sections.Length)],
                NtrpRating = (decimal)(3.0 + rng.NextDouble() * 4.5),
                RatingTrend = trends[rng.Next(trends.Length)],
                MatchCount = rng.Next(5, 120),
                ActiveYear = 2024,
                AgeGroup = ageGroups[rng.Next(ageGroups.Length)]
            });
        }
        return list;
    }

    private static Dictionary<int, List<MatchSummary>> BuildMockMatches()
    {
        var results = new[] { "W 6-4, 6-3", "L 3-6, 6-4, 6-2", "W 6-2, 6-1", "W 7-5, 6-4", "L 6-3, 6-2", "W 6-0, 6-1" };
        var opponents = new[] { "Taylor Brown", "Jordan Lee", "Casey Kim", "Morgan Davis", "Riley Clark", "Alex Johnson" };
        var dict = new Dictionary<int, List<MatchSummary>>();
        var rng = new Random(42);
        for (int pid = 1; pid <= 50; pid++)
        {
            var count = rng.Next(3, 6);
            var matches = new List<MatchSummary>();
            for (int i = 0; i < count; i++)
            {
                matches.Add(new MatchSummary
                {
                    Id = pid * 10 + i,
                    OpponentName = opponents[rng.Next(opponents.Length)],
                    Result = results[rng.Next(results.Length)],
                    Date = DateTime.UtcNow.AddDays(-rng.Next(5, 90))
                });
            }
            dict[pid] = matches.OrderByDescending(m => m.Date).ToList();
        }
        return dict;
    }
}
