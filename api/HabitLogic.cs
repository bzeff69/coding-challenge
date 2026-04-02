public static class HabitLogic
{
    public static Habit CreateHabit(string name, int dailyTarget, string? color)
    {
        return new Habit
        {
            Id = Guid.NewGuid().ToString(),
            Name = name,
            DailyTarget = Math.Clamp(dailyTarget, 1, 10),
            Color = color,
            CreatedAt = DateTime.UtcNow.ToString("o"),
            CurrentStreak = 0,
            LongestStreak = 0,
            TotalCompletions = 0,
            DayRecords = new Dictionary<string, HabitDayRecord>()
        };
    }

    private static HabitDayRecord EnsureDayRecord(Habit habit, string date)
    {
        if (!habit.DayRecords.ContainsKey(date))
        {
            habit.DayRecords[date] = new HabitDayRecord
            {
                Date = date,
                Count = 0,
                Completed = false
            };
        }
        return habit.DayRecords[date];
    }

    private static bool IsCompleteOnDate(Habit habit, string date)
    {
        return habit.DayRecords.TryGetValue(date, out var record) && record.Completed;
    }

    public static bool ProcessMissedDays(Habit habit, string today)
    {
        if (habit.LastEvaluatedDate == null)
        {
            habit.LastEvaluatedDate = today;
            return false;
        }

        if (habit.LastEvaluatedDate == today)
            return false;

        var date = DateUtils.GetNextDateString(habit.LastEvaluatedDate);
        var missedAny = false;

        while (string.Compare(date, today, StringComparison.Ordinal) < 0)
        {
            if (!habit.DayRecords.TryGetValue(date, out var record) || !record.Completed)
                missedAny = true;
            date = DateUtils.GetNextDateString(date);
        }

        if (missedAny)
            habit.CurrentStreak = 0;

        habit.LastEvaluatedDate = today;
        return missedAny;
    }

    public static void RecalculateStats(Habit habit, string today)
    {
        // Total completions
        habit.TotalCompletions = habit.DayRecords.Values.Count(r => r.Completed);

        // Current streak
        var streak = 0;
        var anchor = today;
        if (!IsCompleteOnDate(habit, today))
            anchor = DateUtils.GetYesterdayDateString(today);
        while (IsCompleteOnDate(habit, anchor))
        {
            streak++;
            anchor = DateUtils.GetYesterdayDateString(anchor);
        }
        habit.CurrentStreak = streak;

        // Longest streak
        var dates = habit.DayRecords.Keys.OrderBy(d => d).ToList();
        var longest = 0;
        var running = 0;
        string? prevCompleted = null;
        foreach (var d in dates)
        {
            if (!habit.DayRecords[d].Completed)
            {
                running = 0;
                prevCompleted = null;
                continue;
            }
            if (prevCompleted != null && d == DateUtils.GetNextDateString(prevCompleted))
                running++;
            else
                running = 1;
            if (running > longest)
                longest = running;
            prevCompleted = d;
        }
        habit.LongestStreak = longest;
    }

    public static void Increment(Habit habit, string today)
    {
        ProcessMissedDays(habit, today);
        var record = EnsureDayRecord(habit, today);
        if (record.Count < habit.DailyTarget)
            record.Count++;
        record.Completed = record.Count >= habit.DailyTarget;
        RecalculateStats(habit, today);
    }

    public static void Undo(Habit habit, string today)
    {
        ProcessMissedDays(habit, today);
        var record = EnsureDayRecord(habit, today);
        if (record.Count > 0)
            record.Count--;
        record.Completed = record.Count >= habit.DailyTarget;
        RecalculateStats(habit, today);
    }

    public static void SetDayCount(Habit habit, string date, int count, string today)
    {
        var clamped = Math.Clamp(count, 0, habit.DailyTarget);
        if (clamped == 0)
        {
            habit.DayRecords.Remove(date);
        }
        else
        {
            if (!habit.DayRecords.ContainsKey(date))
                habit.DayRecords[date] = new HabitDayRecord { Date = date, Count = 0, Completed = false };
            habit.DayRecords[date].Count = clamped;
            habit.DayRecords[date].Completed = clamped >= habit.DailyTarget;
        }
        RecalculateStats(habit, today);
    }

    public static void Edit(Habit habit, string name, int dailyTarget, string? color, string today)
    {
        habit.Name = name;
        habit.DailyTarget = Math.Clamp(dailyTarget, 1, 10);
        habit.Color = color;
        foreach (var key in habit.DayRecords.Keys.ToList())
        {
            habit.DayRecords[key].Completed = habit.DayRecords[key].Count >= habit.DailyTarget;
        }
        RecalculateStats(habit, today);
    }
}
