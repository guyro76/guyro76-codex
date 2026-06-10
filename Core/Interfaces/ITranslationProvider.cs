namespace LangFlipDesktop.Core.Interfaces;

public interface ITranslationProvider
{
    Task<string> TranslateAsync(string text, string sourceLang, string targetLang);
    Task<bool> TestConnectionAsync();
}
