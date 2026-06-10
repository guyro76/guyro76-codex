namespace LangFlipDesktop.Core.Interfaces;

using LangFlipDesktop.Core.Enums;

public interface ISettingsService
{
    // Result behavior
    ResultMode GetResultMode();
    void SetResultMode(ResultMode mode);
    bool GetRestoreClipboard();
    void SetRestoreClipboard(bool value);

    // Translation provider
    TranslationProvider GetTranslationProvider();
    void SetTranslationProvider(TranslationProvider provider);
    string GetTranslationApiKey();
    void SetTranslationApiKey(string key);

    // Privacy
    bool GetDisableTextStorage();
    void SetDisableTextStorage(bool value);
    bool GetIgnorePasswordFields();
    void SetIgnorePasswordFields(bool value);

    // General
    string GetInterfaceLanguage();
    void SetInterfaceLanguage(string lang);
    bool GetStartWithWindows();
    void SetStartWithWindows(bool value);
    bool GetRunInBackground();
    void SetRunInBackground(bool value);

    // UI
    string GetTheme();
    void SetTheme(string theme);
    bool GetReducedMotion();
    void SetReducedMotion(bool value);

    void Save();
}
