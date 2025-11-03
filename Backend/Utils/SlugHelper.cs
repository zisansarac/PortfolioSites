using System.Text.RegularExpressions;

namespace Backend.Utils;

public static class SlugHelper
{
    public static string ToSlug(string text)
    {
        text = text.ToLowerInvariant().Trim();
        text = text
        .Replace("ş", "s").Replace("Ş", "s")
        .Replace("ı", "i").Replace("İ", "i")
        .Replace("ğ", "g").Replace("Ğ", "g")
        .Replace("ü", "u").Replace("Ü", "u")
        .Replace("ö", "o").Replace("Ö", "o")
        .Replace("ç", "c").Replace("Ç", "c");

        text = Regex.Replace(text, @"[^a-z0-9\s-]", "");
        text = Regex.Replace(text, @"\s+", "-").Trim('-');
        text = Regex.Replace(text, @"-+", "-");

        return text;   
    }
}