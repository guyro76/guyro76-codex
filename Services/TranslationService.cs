namespace LangFlipDesktop.Services;

using LangFlipDesktop.Core.Enums;
using LangFlipDesktop.Core.Interfaces;
using LangFlipDesktop.Services.TranslationProviders;

public class TranslationService
{
    private readonly ISettingsService _settingsService;
    private ITranslationProvider? _currentProvider;

    public TranslationService(ISettingsService settingsService)
    {
        _settingsService = settingsService;
        InitializeProvider();
    }

    public void InitializeProvider()
    {
        var provider = _settingsService.GetTranslationProvider();
        var apiKey = _settingsService.GetTranslationApiKey();

        _currentProvider = provider switch
        {
            TranslationProvider.OpenAI => new OpenAITranslationProvider(apiKey),
            TranslationProvider.DeepL => new DeepLTranslationProvider(apiKey),
            _ => null
        };
    }

    public async Task<string> TranslateToEnglishAsync(string text)
    {
        if (_currentProvider == null)
            throw new InvalidOperationException("No translation provider configured");

        return await _currentProvider.TranslateAsync(text, "Hebrew", "English");
    }

    public async Task<string> TranslateToHebrewAsync(string text)
    {
        if (_currentProvider == null)
            throw new InvalidOperationException("No translation provider configured");

        return await _currentProvider.TranslateAsync(text, "English", "Hebrew");
    }

    public async Task<string> ImproveHebrewAsync(string text)
    {
        if (_currentProvider == null)
            throw new InvalidOperationException("No translation provider configured");

        // Use a specialized prompt for improvement
        var improvedText = await _currentProvider.TranslateAsync(
            text,
            "Hebrew",
            "Hebrew"
        );
        return improvedText;
    }

    public async Task<string> ImproveEnglishAsync(string text)
    {
        if (_currentProvider == null)
            throw new InvalidOperationException("No translation provider configured");

        // Use a specialized prompt for improvement
        var improvedText = await _currentProvider.TranslateAsync(
            text,
            "English",
            "English"
        );
        return improvedText;
    }

    public async Task<bool> TestProviderConnectionAsync()
    {
        if (_currentProvider == null)
            return false;

        return await _currentProvider.TestConnectionAsync();
    }
}
