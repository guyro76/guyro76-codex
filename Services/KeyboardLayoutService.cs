namespace LangFlipDesktop.Services;

using LangFlipDesktop.Core.Interfaces;
using LangFlipDesktop.Core.Models;

public class KeyboardLayoutService : IKeyboardLayoutService
{
    // Standard Israeli Hebrew keyboard layout mapped onto QWERTY positions.
    private static readonly Dictionary<char, char> EnglishToHebrew = new()
    {
        // Top row
        { 'q', '/' }, { 'w', '\'' }, { 'e', 'ק' }, { 'r', 'ר' }, { 't', 'א' }, { 'y', 'ט' },
        { 'u', 'ו' }, { 'i', 'ן' }, { 'o', 'ם' }, { 'p', 'פ' },
        // Middle row
        { 'a', 'ש' }, { 's', 'ד' }, { 'd', 'ג' }, { 'f', 'כ' }, { 'g', 'ע' }, { 'h', 'י' },
        { 'j', 'ח' }, { 'k', 'ל' }, { 'l', 'ך' }, { ';', 'ף' },
        // Bottom row
        { 'z', 'ז' }, { 'x', 'ס' }, { 'c', 'ב' }, { 'v', 'ה' }, { 'b', 'נ' }, { 'n', 'מ' },
        { 'm', 'צ' }, { ',', 'ת' }, { '.', 'ץ' },
    };

    private static readonly Dictionary<char, char> HebrewToEnglish = BuildReverseMap();

    private static Dictionary<char, char> BuildReverseMap()
    {
        var reverse = new Dictionary<char, char>();
        foreach (var pair in EnglishToHebrew)
        {
            reverse[pair.Value] = pair.Key;
        }
        return reverse;
    }

    public string ConvertToHebrew(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;

        var result = new System.Text.StringBuilder(text.Length);
        foreach (var ch in text)
        {
            var lowerCh = char.ToLowerInvariant(ch);
            result.Append(EnglishToHebrew.TryGetValue(lowerCh, out var hebrewChar) ? hebrewChar : ch);
        }
        return result.ToString();
    }

    public string ConvertToEnglish(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;

        var result = new System.Text.StringBuilder(text.Length);
        foreach (var ch in text)
        {
            result.Append(HebrewToEnglish.TryGetValue(ch, out var englishChar) ? englishChar : ch);
        }
        return result.ToString();
    }

    public TextDirection DetectTextDirection(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return TextDirection.LTR;

        int hebrewChars = 0;
        int englishChars = 0;

        foreach (var ch in text)
        {
            if (ch >= '֐' && ch <= '׿')
                hebrewChars++;
            else if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'))
                englishChars++;
        }

        return hebrewChars > englishChars ? TextDirection.RTL : TextDirection.LTR;
    }
}
