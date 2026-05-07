public class HabitDayRecord
{
    public string Date { get; set; } = "";
    public int Count { get; set; }
    public bool Completed { get; set; }
}

public class Habit
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public int DailyTarget { get; set; }
    public string? Color { get; set; }
    public string CreatedAt { get; set; } = "";
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
    public int TotalCompletions { get; set; }
    public string? LastEvaluatedDate { get; set; }
    public Dictionary<string, HabitDayRecord> DayRecords { get; set; } = new();
}

public class UserState
{
    public List<Habit> Habits { get; set; } = new();
    public List<Habit> DeletedHabits { get; set; } = new();
    public string? LastOpenedDate { get; set; }
}

public class UserAccount
{
    public string Id { get; set; } = "";
    public string Username { get; set; } = "";
    public string NormalizedUsername { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string PasswordSalt { get; set; } = "";
    public string CreatedAt { get; set; } = "";
}

public class UserSession
{
    public string TokenHash { get; set; } = "";
    public string UserId { get; set; } = "";
    public string CreatedAt { get; set; } = "";
    public string ExpiresAt { get; set; } = "";
}

public class AppState
{
    public List<UserAccount> Users { get; set; } = new();
    public List<UserSession> Sessions { get; set; } = new();
    public Dictionary<string, UserState> UserStates { get; set; } = new();

    // Legacy single-user fields kept for migration.
    public List<Habit> Habits { get; set; } = new();
    public List<Habit>? DeletedHabits { get; set; }
    public string? LastOpenedDate { get; set; }
}

public class StateResponse
{
    public List<Habit> Habits { get; set; } = new();
    public List<Habit> DeletedHabits { get; set; } = new();
    public List<string> MissedHabitIds { get; set; } = new();
}

public class SessionUser
{
    public string Id { get; set; } = "";
    public string Username { get; set; } = "";
}

public class AuthResponse
{
    public SessionUser User { get; set; } = new();
}

public class ErrorResponse
{
    public string Message { get; set; } = "";
}

public record CreateHabitRequest(string Name, int DailyTarget, string? Color);
public record EditHabitRequest(string Name, int DailyTarget, string? Color);
public record SetDayCountRequest(int Count);
public record RegisterRequest(string Username, string Password);
public record LoginRequest(string Username, string Password);
