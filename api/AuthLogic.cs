using System.Security.Cryptography;
using System.Text;

public static class AuthLogic
{
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    public static string NormalizeUsername(string username) => username.Trim().ToUpperInvariant();

    public static (string Hash, string Salt) HashPassword(string password)
    {
        var saltBytes = RandomNumberGenerator.GetBytes(SaltSize);
        var hashBytes = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, HashAlgorithmName.SHA256, HashSize);
        return (Convert.ToHexString(hashBytes), Convert.ToHexString(saltBytes));
    }

    public static bool VerifyPassword(string password, string expectedHash, string salt)
    {
        var saltBytes = Convert.FromHexString(salt);
        var hashBytes = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, HashAlgorithmName.SHA256, HashSize);
        var expectedBytes = Convert.FromHexString(expectedHash);
        return CryptographicOperations.FixedTimeEquals(hashBytes, expectedBytes);
    }

    public static string GenerateSessionToken() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    public static string HashToken(string token)
    {
        var tokenBytes = Encoding.UTF8.GetBytes(token);
        return Convert.ToHexString(SHA256.HashData(tokenBytes));
    }
}
