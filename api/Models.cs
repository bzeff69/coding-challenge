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

public class AppState
{
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

public record CreateHabitRequest(string Name, int DailyTarget, string? Color);
public record EditHabitRequest(string Name, int DailyTarget, string? Color);
public record SetDayCountRequest(int Count);
