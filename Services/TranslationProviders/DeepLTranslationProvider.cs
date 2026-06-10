namespace LangFlipDesktop.Services.TranslationProviders;

using LangFlipDesktop.Core.Interfaces;

public class DeepLTranslationProvider : ITranslationProvider
{
    private readonly string _apiKey;

    public DeepLTranslationProvider(string apiKey)
    {
        _apiKey = apiKey;
    }

    public async Task<string> TranslateAsync(string text, string sourceLang, string targetLang)
    {
        // TODO: Implement DeepL API integration
        // https://www.deepl.com/docs-api/
        await Task.Delay(0);
        throw new NotImplementedException("DeepL provider will be implemented in a future version");
    }

    public async Task<bool> TestConnectionAsync()
    {
        // TODO: Implement connection test
        await Task.Delay(0);
        return false;
    }
}
