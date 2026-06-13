namespace LangFlipDesktop.Services;

using LangFlipDesktop.Core.Enums;
using LangFlipDesktop.Core.Interfaces;
using LangFlipDesktop.Services.TranslationProviders;

public class TranslationService
{
    private readonly ISettingsService _settingsService;
    private readonly IKeyboardLayoutService _keyboardService;
    private ITranslationProvider? _currentProvider;

    public TranslationService(ISettingsService settingsService, IKeyboardLayoutService? keyboardService = null)
    {
        _settingsService = settingsService;
        _keyboardService = keyboardService ?? new KeyboardLayoutService();
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
        if (_currentProvider != null)
            return await _currentProvider.TranslateAsync(text, "Hebrew", "English");

        // Fallback: Use keyboard conversion if no provider configured
        return _keyboardService.ConvertToEnglish(text);
    }

    public async Task<string> TranslateToHebrewAsync(string text)
    {
        if (_currentProvider != null)
            return await _currentProvider.TranslateAsync(text, "English", "Hebrew");

        // Fallback: Use keyboard conversion if no provider configured
        return _keyboardService.ConvertToHebrew(text);
    }

    public async Task<string> ImproveHebrewAsync(string text)
    {
        if (_currentProvider != null)
        {
            return await _currentProvider.TranslateAsync(text, "Hebrew", "Hebrew");
        }

        // Fallback: Return text as-is when no provider (user needs to enable translation)
        throw new InvalidOperationException("תיקון ניסוח דורש מפתח תרגום. אנא הגדר OpenAI או DeepL בהגדרות");
    }

    public async Task<string> ImproveEnglishAsync(string text)
    {
        if (_currentProvider != null)
        {
            return await _currentProvider.TranslateAsync(text, "English", "English");
        }

        // Fallback: Return text as-is when no provider (user needs to enable translation)
        throw new InvalidOperationException("Improvement requires translation key. Please configure OpenAI or DeepL in settings");
    }

    public async Task<bool> TestProviderConnectionAsync()
    {
        if (_currentProvider == null)
            return false;

        return await _currentProvider.TestConnectionAsync();
    }
}
