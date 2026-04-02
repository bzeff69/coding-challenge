public static class DateUtils
{
    public static string GetTodayDateString()
    {
        return DateTime.Now.ToString("yyyy-MM-dd");
    }

    public static string FormatDate(DateTime date)
    {
        return date.ToString("yyyy-MM-dd");
    }

    public static DateTime ParseDateString(string dateStr)
    {
        var parts = dateStr.Split('-');
        return new DateTime(int.Parse(parts[0]), int.Parse(parts[1]), int.Parse(parts[2]));
    }

    public static string GetYesterdayDateString(string date)
    {
        return FormatDate(ParseDateString(date).AddDays(-1));
    }

    public static string GetNextDateString(string date)
    {
        return FormatDate(ParseDateString(date).AddDays(1));
    }
}
