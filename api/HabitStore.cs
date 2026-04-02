using System.Text.Json;
using Microsoft.Data.Sqlite;

public class HabitStore
{
    private readonly string _connStr;
    private readonly JsonSerializerOptions _jsonOpts;
    private readonly object _lock = new();

    public HabitStore(string dbPath)
    {
        _connStr = $"Data Source={dbPath}";
        _jsonOpts = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };
        Initialize();
    }

    private void Initialize()
    {
        using var conn = new SqliteConnection(_connStr);
        conn.Open();
        using var cmd = conn.CreateCommand();
        cmd.CommandText = "CREATE TABLE IF NOT EXISTS app_state (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL)";
        cmd.ExecuteNonQuery();
    }

    public AppState Load()
    {
        lock (_lock)
        {
            using var conn = new SqliteConnection(_connStr);
            conn.Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "SELECT data FROM app_state WHERE id = 1";
            var result = cmd.ExecuteScalar() as string;
            if (result == null) return new AppState();
            return JsonSerializer.Deserialize<AppState>(result, _jsonOpts) ?? new AppState();
        }
    }

    public void Save(AppState state)
    {
        lock (_lock)
        {
            using var conn = new SqliteConnection(_connStr);
            conn.Open();
            using var cmd = conn.CreateCommand();
            cmd.CommandText = "INSERT INTO app_state (id, data) VALUES (1, @data) ON CONFLICT(id) DO UPDATE SET data = @data";
            cmd.Parameters.AddWithValue("@data", JsonSerializer.Serialize(state, _jsonOpts));
            cmd.ExecuteNonQuery();
        }
    }
}
