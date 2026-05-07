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

const string SessionCookieName = "streak_session";
var sessionLifetime = TimeSpan.FromDays(30);

app.MapGet("/api/auth/session", (HttpContext http, HabitStore store) =>
{
    var state = store.Load();
    var dirty = PruneExpiredSessions(state);
    var user = GetAuthenticatedUser(state, http);
    if (user == null)
    {
        if (dirty) store.Save(state);
        return Results.Unauthorized();
    }

    if (dirty) store.Save(state);
    return Results.Ok(ToAuthResponse(user));
});

app.MapPost("/api/auth/register", (RegisterRequest req, HttpContext http, HabitStore store) =>
{
    var username = req.Username.Trim();
    var password = req.Password.Trim();
    var validationError = ValidateCredentials(username, password);
    if (validationError != null)
        return Results.BadRequest(new ErrorResponse { Message = validationError });

    var state = store.Load();
    PruneExpiredSessions(state);

    var normalized = AuthLogic.NormalizeUsername(username);
    if (state.Users.Any(u => u.NormalizedUsername == normalized))
        return Results.BadRequest(new ErrorResponse { Message = "That username is already taken." });

    var (hash, salt) = AuthLogic.HashPassword(password);
    var user = new UserAccount
    {
        Id = Guid.NewGuid().ToString(),
        Username = username,
        NormalizedUsername = normalized,
        PasswordHash = hash,
        PasswordSalt = salt,
        CreatedAt = DateTime.UtcNow.ToString("o")
    };

    state.Users.Add(user);
    var userState = GetOrCreateUserState(state, user.Id);
    MigrateLegacyState(state, userState);

    var token = CreateSession(state, user.Id, sessionLifetime);
    store.Save(state);
    SetSessionCookie(http, token, sessionLifetime);

    return Results.Ok(ToAuthResponse(user));
});

app.MapPost("/api/auth/login", (LoginRequest req, HttpContext http, HabitStore store) =>
{
    var username = req.Username.Trim();
    var password = req.Password.Trim();
    if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        return Results.BadRequest(new ErrorResponse { Message = "Username and password are required." });

    var state = store.Load();
    PruneExpiredSessions(state);

    var normalized = AuthLogic.NormalizeUsername(username);
    var user = state.Users.FirstOrDefault(u => u.NormalizedUsername == normalized);
    if (user == null || !AuthLogic.VerifyPassword(password, user.PasswordHash, user.PasswordSalt))
        return Results.BadRequest(new ErrorResponse { Message = "Invalid username or password." });

    var token = CreateSession(state, user.Id, sessionLifetime);
    store.Save(state);
    SetSessionCookie(http, token, sessionLifetime);

    return Results.Ok(ToAuthResponse(user));
});

app.MapPost("/api/auth/logout", (HttpContext http, HabitStore store) =>
{
    var state = store.Load();
    var dirty = PruneExpiredSessions(state);
    var token = http.Request.Cookies[SessionCookieName];
    if (!string.IsNullOrWhiteSpace(token))
    {
        var tokenHash = AuthLogic.HashToken(token);
        dirty = state.Sessions.RemoveAll(s => s.TokenHash == tokenHash) > 0 || dirty;
    }

    if (dirty) store.Save(state);
    ClearSessionCookie(http);
    return Results.NoContent();
});

app.MapGet("/api/state", (HttpContext http, HabitStore store) =>
{
    var state = store.Load();
    var dirty = PruneExpiredSessions(state);
    var user = GetAuthenticatedUser(state, http);
    if (user == null)
    {
        if (dirty) store.Save(state);
        return Results.Unauthorized();
    }

    var userState = GetOrCreateUserState(state, user.Id);
    var today = DateUtils.GetTodayDateString();
    var missed = new List<string>();
    foreach (var h in userState.Habits)
    {
        if (HabitLogic.ProcessMissedDays(h, today)) missed.Add(h.Id);
        HabitLogic.RecalculateStats(h, today);
    }

    userState.LastOpenedDate = today;
    store.Save(state);
    return Results.Ok(ToResponse(userState, missed));
});

app.MapPost("/api/habits", (CreateHabitRequest req, HttpContext http, HabitStore store) =>
{
    var auth = RequireUser(http, store, out var state, out var userState);
    if (auth != null) return auth;

    userState.Habits.Add(HabitLogic.CreateHabit(req.Name, req.DailyTarget, req.Color));
    store.Save(state!);
    return Results.Ok(ToResponse(userState));
});

app.MapPut("/api/habits/{id}", (string id, EditHabitRequest req, HttpContext http, HabitStore store) =>
{
    var auth = RequireUser(http, store, out var state, out var userState);
    if (auth != null) return auth;

    var habit = userState.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        HabitLogic.Edit(habit, req.Name, req.DailyTarget, req.Color, DateUtils.GetTodayDateString());
        store.Save(state!);
    }

    return Results.Ok(ToResponse(userState));
});

app.MapDelete("/api/habits/{id}", (string id, HttpContext http, HabitStore store) =>
{
    var auth = RequireUser(http, store, out var state, out var userState);
    if (auth != null) return auth;

    var habit = userState.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        userState.Habits.Remove(habit);
        userState.DeletedHabits.Add(habit);
        store.Save(state!);
    }

    return Results.Ok(ToResponse(userState));
});

app.MapPost("/api/habits/{id}/increment", (string id, HttpContext http, HabitStore store) =>
{
    var auth = RequireUser(http, store, out var state, out var userState);
    if (auth != null) return auth;

    var habit = userState.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        HabitLogic.Increment(habit, DateUtils.GetTodayDateString());
        store.Save(state!);
    }

    return Results.Ok(ToResponse(userState));
});

app.MapPost("/api/habits/{id}/undo", (string id, HttpContext http, HabitStore store) =>
{
    var auth = RequireUser(http, store, out var state, out var userState);
    if (auth != null) return auth;

    var habit = userState.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        HabitLogic.Undo(habit, DateUtils.GetTodayDateString());
        store.Save(state!);
    }

    return Results.Ok(ToResponse(userState));
});

app.MapPut("/api/habits/{id}/days/{date}", (string id, string date, SetDayCountRequest req, HttpContext http, HabitStore store) =>
{
    var auth = RequireUser(http, store, out var state, out var userState);
    if (auth != null) return auth;

    var habit = userState.Habits.Find(h => h.Id == id);
    if (habit != null)
    {
        HabitLogic.SetDayCount(habit, date, req.Count, DateUtils.GetTodayDateString());
        store.Save(state!);
    }

    return Results.Ok(ToResponse(userState));
});

app.MapPost("/api/habits/{id}/restore", (string id, HttpContext http, HabitStore store) =>
{
    var auth = RequireUser(http, store, out var state, out var userState);
    if (auth != null) return auth;

    var habit = userState.DeletedHabits.Find(h => h.Id == id);
    if (habit != null)
    {
        userState.DeletedHabits.Remove(habit);
        userState.Habits.Add(habit);
        store.Save(state!);
    }

    return Results.Ok(ToResponse(userState));
});

app.MapDelete("/api/habits/{id}/permanent", (string id, HttpContext http, HabitStore store) =>
{
    var auth = RequireUser(http, store, out var state, out var userState);
    if (auth != null) return auth;

    userState.DeletedHabits = userState.DeletedHabits.Where(h => h.Id != id).ToList();
    store.Save(state!);
    return Results.Ok(ToResponse(userState));
});

app.Run();

string? ValidateCredentials(string username, string password)
{
    if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
        return "Username and password are required.";

    if (username.Length < 3 || username.Length > 32)
        return "Username must be between 3 and 32 characters.";

    if (!username.All(c => char.IsLetterOrDigit(c) || c == '-' || c == '_'))
        return "Username can only use letters, numbers, dashes, and underscores.";

    if (password.Length < 8)
        return "Password must be at least 8 characters.";

    return null;
}

IResult? RequireUser(HttpContext http, HabitStore store, out AppState? state, out UserState userState)
{
    state = store.Load();
    var dirty = PruneExpiredSessions(state);
    var user = GetAuthenticatedUser(state, http);
    if (user == null)
    {
        if (dirty) store.Save(state);
        userState = new UserState();
        return Results.Unauthorized();
    }

    userState = GetOrCreateUserState(state, user.Id);
    return null;
}

UserAccount? GetAuthenticatedUser(AppState state, HttpContext http)
{
    var token = http.Request.Cookies[SessionCookieName];
    if (string.IsNullOrWhiteSpace(token)) return null;

    var tokenHash = AuthLogic.HashToken(token);
    var session = state.Sessions.FirstOrDefault(s => s.TokenHash == tokenHash);
    if (session == null) return null;

    return state.Users.FirstOrDefault(u => u.Id == session.UserId);
}

bool PruneExpiredSessions(AppState state)
{
    var now = DateTime.UtcNow;
    var originalCount = state.Sessions.Count;
    state.Sessions = state.Sessions
        .Where(session =>
        {
            if (!DateTime.TryParse(session.ExpiresAt, out var expiresAt)) return false;
            return expiresAt.ToUniversalTime() > now && state.Users.Any(u => u.Id == session.UserId);
        })
        .ToList();

    return state.Sessions.Count != originalCount;
}

string CreateSession(AppState state, string userId, TimeSpan lifetime)
{
    var token = AuthLogic.GenerateSessionToken();
    state.Sessions.Add(new UserSession
    {
        TokenHash = AuthLogic.HashToken(token),
        UserId = userId,
        CreatedAt = DateTime.UtcNow.ToString("o"),
        ExpiresAt = DateTime.UtcNow.Add(lifetime).ToString("o")
    });

    return token;
}

void SetSessionCookie(HttpContext http, string token, TimeSpan lifetime)
{
    http.Response.Cookies.Append(SessionCookieName, token, new CookieOptions
    {
        HttpOnly = true,
        IsEssential = true,
        SameSite = SameSiteMode.Strict,
        Secure = http.Request.IsHttps,
        Expires = DateTimeOffset.UtcNow.Add(lifetime),
        Path = "/"
    });
}

void ClearSessionCookie(HttpContext http)
{
    http.Response.Cookies.Delete(SessionCookieName, new CookieOptions
    {
        HttpOnly = true,
        IsEssential = true,
        SameSite = SameSiteMode.Strict,
        Secure = http.Request.IsHttps,
        Path = "/"
    });
}

UserState GetOrCreateUserState(AppState state, string userId)
{
    if (!state.UserStates.TryGetValue(userId, out var userState))
    {
        userState = new UserState();
        state.UserStates[userId] = userState;
    }

    userState.DeletedHabits ??= new List<Habit>();
    return userState;
}

void MigrateLegacyState(AppState state, UserState userState)
{
    if (state.UserStates.Count != 1) return;
    if (userState.Habits.Count > 0 || userState.DeletedHabits.Count > 0 || userState.LastOpenedDate != null) return;
    if (state.Habits.Count == 0 && (state.DeletedHabits == null || state.DeletedHabits.Count == 0) && state.LastOpenedDate == null) return;

    userState.Habits = state.Habits;
    userState.DeletedHabits = state.DeletedHabits ?? new List<Habit>();
    userState.LastOpenedDate = state.LastOpenedDate;

    state.Habits = new List<Habit>();
    state.DeletedHabits = new List<Habit>();
    state.LastOpenedDate = null;
}

StateResponse ToResponse(UserState state, List<string>? missed = null) => new()
{
    Habits = state.Habits,
    DeletedHabits = state.DeletedHabits,
    MissedHabitIds = missed ?? new List<string>()
};

AuthResponse ToAuthResponse(UserAccount user) => new()
{
    User = new SessionUser
    {
        Id = user.Id,
        Username = user.Username
    }
};
