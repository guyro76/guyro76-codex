namespace LangFlipDesktop.Services.TranslationProviders;

using LangFlipDesktop.Core.Interfaces;

public interface ITranslationProvider
{
    Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage);
    Task<bool> TestConnectionAsync();
}

public class LocalTranslationProvider : ITranslationProvider
{
    private readonly Dictionary<string, string> _hebrewEnglishDict = new()
    {
        // Greetings & Common
        { "שלום", "hello" },
        { "בוקר", "morning" },
        { "לילה", "night" },
        { "תודה", "thanks" },
        { "בבקשה", "please" },
        { "כן", "yes" },
        { "לא", "no" },
        { "עזור", "help" },
        { "סליחה", "sorry" },
        { "בוודאות", "sure" },

        // Pronouns
        { "אני", "i" },
        { "אתה", "you" },
        { "הוא", "he" },
        { "היא", "she" },
        { "אנחנו", "we" },
        { "אתם", "you" },
        { "הם", "they" },
        { "הן", "they" },
        { "זה", "this" },
        { "זו", "this" },
        { "אלה", "these" },

        // Family & People
        { "משפחה", "family" },
        { "חברים", "friends" },
        { "אוהב", "love" },
        { "חבר", "friend" },
        { "אם", "mother" },
        { "אב", "father" },
        { "אח", "brother" },
        { "אחות", "sister" },
        { "בן", "son" },
        { "בת", "daughter" },

        // Home & Place
        { "בית", "house" },
        { "דירה", "apartment" },
        { "חדר", "room" },
        { "רחוב", "street" },
        { "עיר", "city" },
        { "ארץ", "country" },
        { "עולם", "world" },
        { "פארק", "park" },
        { "בר", "bar" },
        { "מסעדה", "restaurant" },

        // Nature & Elements
        { "עץ", "tree" },
        { "מים", "water" },
        { "אש", "fire" },
        { "רוח", "wind" },
        { "אור", "light" },
        { "שמש", "sun" },
        { "ירח", "moon" },
        { "כוכב", "star" },
        { "ענן", "cloud" },
        { "גשם", "rain" },

        // Food & Drink
        { "אוכל", "food" },
        { "לחם", "bread" },
        { "בשר", "meat" },
        { "דג", "fish" },
        { "פרי", "fruit" },
        { "ירקות", "vegetables" },
        { "מים", "water" },
        { "תה", "tea" },
        { "קפה", "coffee" },
        { "יין", "wine" },

        // Work & Study
        { "עבודה", "work" },
        { "משרד", "office" },
        { "שיעור", "lesson" },
        { "בית ספר", "school" },
        { "ספר", "book" },
        { "עיתון", "newspaper" },
        { "מכתב", "letter" },
        { "מחשב", "computer" },
        { "טלפון", "phone" },
        { "דואר", "mail" },

        // Transportation
        { "רכב", "car" },
        { "אוטובוס", "bus" },
        { "רכבת", "train" },
        { "מטוס", "plane" },
        { "אניה", "ship" },
        { "אופניים", "bicycle" },
        { "דרך", "way" },
        { "מסלול", "path" },

        // Time
        { "זמן", "time" },
        { "יום", "day" },
        { "לילה", "night" },
        { "שבוע", "week" },
        { "חודש", "month" },
        { "שנה", "year" },
        { "שעה", "hour" },
        { "דקה", "minute" },
        { "שנייה", "second" },

        // Sports & Entertainment
        { "משחק", "game" },
        { "ספורט", "sport" },
        { "כדור", "ball" },
        { "מוזיקה", "music" },
        { "שיר", "song" },
        { "רקדן", "dancer" },
        { "סרט", "movie" },
        { "תיאטרון", "theater" },
        { "ציור", "painting" },

        // Verbs (Common)
        { "עשה", "make" },
        { "לכת", "go" },
        { "בוא", "come" },
        { "דבר", "speak" },
        { "שמע", "hear" },
        { "רואה", "see" },
        { "נתן", "give" },
        { "לקח", "take" },
        { "יושב", "sit" },
        { "עומד", "stand" },
        { "רץ", "run" },
        { "הלך", "walk" },
        { "קנה", "buy" },
        { "מכר", "sell" },
        { "אכל", "eat" },
        { "שתה", "drink" },

        // Adjectives
        { "טוב", "good" },
        { "רע", "bad" },
        { "גדול", "big" },
        { "קטן", "small" },
        { "חזק", "strong" },
        { "חלש", "weak" },
        { "יפה", "beautiful" },
        { "מכוער", "ugly" },
        { "חם", "hot" },
        { "קר", "cold" },
        { "חדש", "new" },
        { "ישן", "old" },
        { "מהיר", "fast" },
        { "איטי", "slow" },
    };

    public Task<string> TranslateAsync(string text, string sourceLanguage, string targetLanguage)
    {
        // Handle improvement (same language)
        if (sourceLanguage == targetLanguage)
        {
            return Task.FromResult(ImproveText(text, sourceLanguage));
        }

        // Handle translation
        var result = TranslateText(text, sourceLanguage, targetLanguage);
        return Task.FromResult(result);
    }

    public Task<bool> TestConnectionAsync()
    {
        return Task.FromResult(true); // Always available
    }

    private string TranslateText(string text, string source, string target)
    {
        var words = text.Split(new[] { ' ', ',', '.', '!', '?', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
        var translated = new List<string>();
        var dictionary = GetDictionary(source, target);

        foreach (var word in words)
        {
            var lowerWord = word.ToLower();
            if (dictionary.TryGetValue(lowerWord, out var translatedWord))
            {
                // Preserve original casing
                if (word[0] == char.ToUpper(word[0]))
                    translated.Add(char.ToUpper(translatedWord[0]) + translatedWord.Substring(1));
                else
                    translated.Add(translatedWord);
            }
            else
            {
                translated.Add(word); // Keep original if not found
            }
        }

        return string.Join(" ", translated);
    }

    private string ImproveText(string text, string language)
    {
        // Basic improvements for Hebrew
        if (language == "Hebrew")
        {
            var improved = text;

            // Fix common typing mistakes
            improved = improved.Replace("לא", "לא "); // Add space after negation
            improved = improved.Replace("ב", "ב "); // Add space after prefix
            improved = System.Text.RegularExpressions.Regex.Replace(improved, @"  +", " "); // Remove extra spaces
            improved = improved.Trim();

            // Capitalize first letter if Hebrew
            if (!string.IsNullOrEmpty(improved))
            {
                improved = char.ToUpper(improved[0]) + improved.Substring(1);
            }

            return improved;
        }

        // Basic improvements for English
        if (language == "English")
        {
            var improved = text.Trim();

            // Capitalize first letter
            if (!string.IsNullOrEmpty(improved))
            {
                improved = char.ToUpper(improved[0]) + improved.Substring(1);
            }

            // Remove extra spaces
            improved = System.Text.RegularExpressions.Regex.Replace(improved, @"  +", " ");

            return improved;
        }

        return text;
    }

    private Dictionary<string, string> GetDictionary(string source, string target)
    {
        if (source == "Hebrew" && target == "English")
        {
            return _hebrewEnglishDict;
        }

        if (source == "English" && target == "Hebrew")
        {
            // Reverse dictionary
            return _hebrewEnglishDict.ToDictionary(x => x.Value, x => x.Key);
        }

        return new Dictionary<string, string>();
    }
}
