namespace LangFlipDesktop.Services.TranslationProviders;

using System.Net.Http;
using LangFlipDesktop.Core.Interfaces;

public class OpenAITranslationProvider : ITranslationProvider
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;
    private const string ApiEndpoint = "https://api.openai.com/v1/chat/completions";

    public OpenAITranslationProvider(string apiKey)
    {
        _apiKey = apiKey;
        _httpClient = new HttpClient();
    }

    public async Task<string> TranslateAsync(string text, string sourceLang, string targetLang)
    {
        if (string.IsNullOrEmpty(_apiKey))
            throw new InvalidOperationException("API key is not configured");

        var prompt = GeneratePrompt(text, sourceLang, targetLang);
        var request = new
        {
            model = "gpt-4-turbo",
            messages = new[]
            {
                new { role = "system", content = "You are a professional translator. Always return only the translated text, no explanations." },
                new { role = "user", content = prompt }
            },
            temperature = 0.3,
            max_tokens = 2000
        };

        var json = System.Text.Json.JsonSerializer.Serialize(request);
        var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

        var response = await _httpClient.PostAsync(ApiEndpoint, content);
        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync();
        using var doc = System.Text.Json.JsonDocument.Parse(responseJson);
        var root = doc.RootElement;

        if (root.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var message) &&
                message.TryGetProperty("content", out var contentElement))
            {
                return contentElement.GetString()?.Trim() ?? string.Empty;
            }
        }

        throw new InvalidOperationException("Unexpected OpenAI response format");
    }

    public async Task<bool> TestConnectionAsync()
    {
        if (string.IsNullOrEmpty(_apiKey))
            return false;

        try
        {
            var request = new
            {
                model = "gpt-3.5-turbo",
                messages = new[]
                {
                    new { role = "user", content = "Test" }
                },
                max_tokens = 5
            };

            var json = System.Text.Json.JsonSerializer.Serialize(request);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_apiKey}");

            var response = await _httpClient.PostAsync(ApiEndpoint, content);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }

    private static string GeneratePrompt(string text, string sourceLang, string targetLang)
    {
        return targetLang.ToLower() switch
        {
            "english" => "Translate the following Hebrew text to natural, fluent English. Preserve meaning, tone, names, numbers and formatting. Return only the translated text.\n\n" + text,
            "hebrew" => "Translate the following English text to natural, fluent Hebrew. Preserve meaning, tone, names, numbers and formatting. Return only the translated text.\n\n" + text,
            _ => text
        };
    }
}
