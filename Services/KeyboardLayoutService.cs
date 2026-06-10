namespace LangFlipDesktop.Services;

using LangFlipDesktop.Core.Interfaces;
using LangFlipDesktop.Core.Models;

public class KeyboardLayoutService : IKeyboardLayoutService
{
    private static readonly Dictionary<char, char> HebrewToEnglish = new()
    {
        // Top row
        ('/', 'q'), ('\'', 'w'), ('ק', 'e'), ('ר', 'r'), ('א', 't'), ('ט', 'y'),
        ('ו', 'u'), ('ן', 'i'), ('ם', 'o'), ('פ', 'p'),
        // Middle row
        ('ש', 'a'), ('ד', 's'), ('ג', 'd'), ('כ', 'f'), ('ע', 'g'), ('י', 'h'),
        ('ח', 'j'), ('ל', 'k'), ('ך', 'l'),
        // Bottom row
        ('ז', 'z'), ('ס', 'x'), ('ב', 'c'), ('ה', 'v'), ('נ', 'b'), ('מ', 'n'), ('צ', 'm'),
        // Numbers and symbols (preserved)
        ('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'),
        ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('0', '0'),
        ('-', '-'), ('=', '='),
        // Spaces and punctuation preserved
        (' ', ' '), ('\n', '\n'), ('\t', '\t'),
        (',', ','), ('.', '.'), ('!', '!'), ('?', '?'), (';', ';'), (':', ':'),
    };

    private static readonly Dictionary<char, char> EnglishToHebrew = new()
    {
        // Top row
        ('q', '/'), ('w', '\''), ('e', 'ק'), ('r', 'ר'), ('t', 'א'), ('y', 'ט'),
        ('u', 'ו'), ('i', 'ן'), ('o', 'ם'), ('p', 'פ'),
        // Middle row
        ('a', 'ש'), ('s', 'ד'), ('d', 'ג'), ('f', 'כ'), ('g', 'ע'), ('h', 'י'),
        ('j', 'ח'), ('k', 'ל'), ('l', 'ך'),
        // Bottom row
        ('z', 'ז'), ('x', 'ס'), ('c', 'ב'), ('v', 'ה'), ('b', 'נ'), ('n', 'מ'), ('m', 'צ'),
        // Numbers and symbols (preserved)
        ('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'),
        ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('0', '0'),
        ('-', '-'), ('=', '='),
        // Spaces and punctuation preserved
        (' ', ' '), ('\n', '\n'), ('\t', '\t'),
        (',', ','), ('.', '.'), ('!', '!'), ('?', '?'), (';', ';'), (':', ':'),
    };

    public string ConvertToHebrew(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;

        var result = new System.Text.StringBuilder();
        foreach (var ch in text)
        {
            var lowerCh = char.ToLower(ch);
            if (EnglishToHebrew.TryGetValue(lowerCh, out var hebrewChar))
            {
                result.Append(hebrewChar);
            }
            else
            {
                result.Append(ch);
            }
        }
        return result.ToString();
    }

    public string ConvertToEnglish(string text)
    {
        if (string.IsNullOrEmpty(text))
            return text;

        var result = new System.Text.StringBuilder();
        foreach (var ch in text)
        {
            var lowerCh = char.ToLower(ch);
            if (HebrewToEnglish.TryGetValue(lowerCh, out var englishChar))
            {
                result.Append(englishChar);
            }
            else
            {
                result.Append(ch);
            }
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
