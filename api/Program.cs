using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

builder.Services.AddCors(opts =>
    opts.AddDefaultPolicy(p => p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

var dataDir = Path.Combine(Directory.GetCurrentDirectory(), "data");
Directory.CreateDirectory(dataDir);
builder.Services.AddSingleton(new HabitStore(Path.Combine(dataDir, "habits.db")));

var app = builder.Build();
app.UseCors();

app.MapGet("/api/state", (HabitStore store) =>
{
    var state = store.Load();
    var today = DateUtils.GetTodayDateString();
    var missed = new List<string>();
    foreach (var h in state.Habits)
    {
        if (HabitLogic.ProcessMissedDays(h, today)) missed.Add(h.Id);
        HabitLogic.RecalculateStats(h, today);
    }
    state.LastOpenedDate = today;
    store.Save(state);
    return ToResponse(state, missed);
});

app.MapPost("/api/habits", (CreateHabitRequest req, HabitStore store) =>
{
    var state = store.Load();
    state.Habits.Add(HabitLogic.CreateHabit(req.Name, req.DailyTarget, req.Color));
    store.Save(state);
    return ToResponse(state);
});

app.MapPut("/api/habits/{id}", (string id, EditHabitRequest req, HabitStore store) =>
{
    var state = store.Load();
    var habit = state.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        HabitLogic.Edit(habit, req.Name, req.DailyTarget, req.Color, DateUtils.GetTodayDateString());
        store.Save(state);
    }
    return ToResponse(state);
});

app.MapDelete("/api/habits/{id}", (string id, HabitStore store) =>
{
    var state = store.Load();
    var habit = state.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        state.Habits.Remove(habit);
        state.DeletedHabits ??= new List<Habit>();
        state.DeletedHabits.Add(habit);
        store.Save(state);
    }
    return ToResponse(state);
});

app.MapPost("/api/habits/{id}/increment", (string id, HabitStore store) =>
{
    var state = store.Load();
    var habit = state.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        HabitLogic.Increment(habit, DateUtils.GetTodayDateString());
        store.Save(state);
    }
    return ToResponse(state);
});

app.MapPost("/api/habits/{id}/undo", (string id, HabitStore store) =>
{
    var state = store.Load();
    var habit = state.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        HabitLogic.Undo(habit, DateUtils.GetTodayDateString());
        store.Save(state);
    }
    return ToResponse(state);
});

app.MapPut("/api/habits/{id}/days/{date}", (string id, string date, SetDayCountRequest req, HabitStore store) =>
{
    var state = store.Load();
    var habit = state.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        HabitLogic.SetDayCount(habit, date, req.Count, DateUtils.GetTodayDateString());
        store.Save(state);
    }
    return ToResponse(state);
});

app.MapPost("/api/habits/{id}/restore", (string id, HabitStore store) =>
{
    var state = store.Load();
    var deleted = state.DeletedHabits ?? new List<Habit>();
    var habit = deleted.Find(h => h.Id == id);
    if (habit != null)
    {
        deleted.Remove(habit);
        state.Habits.Add(habit);
        state.DeletedHabits = deleted;
        store.Save(state);
    }
    return ToResponse(state);
});

app.MapDelete("/api/habits/{id}/permanent", (string id, HabitStore store) =>
{
    var state = store.Load();
    state.DeletedHabits = (state.DeletedHabits ?? new List<Habit>()).Where(h => h.Id != id).ToList();
    store.Save(state);
    return ToResponse(state);
});

app.Run();

StateResponse ToResponse(AppState s, List<string>? missed = null) => new()
{
    Habits = s.Habits,
    DeletedHabits = s.DeletedHabits ?? new List<Habit>(),
    MissedHabitIds = missed ?? new List<string>()
};
