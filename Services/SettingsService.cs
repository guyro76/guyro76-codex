namespace LangFlipDesktop.Services;

using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LangFlipDesktop.Core.Enums;
using LangFlipDesktop.Core.Interfaces;

public class SettingsService : ISettingsService
{
    private readonly string _settingsPath;
    private Dictionary<string, object> _settings;

    public SettingsService()
    {
        var appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
        var langFlipPath = Path.Combine(appDataPath, "LangFlip");
        Directory.CreateDirectory(langFlipPath);
        _settingsPath = Path.Combine(langFlipPath, "settings.json");
        _settings = LoadSettings();
    }

    private Dictionary<string, object> LoadSettings()
    {
        if (!File.Exists(_settingsPath))
            return GetDefaultSettings();

        try
        {
            var json = File.ReadAllText(_settingsPath);
            return JsonSerializer.Deserialize<Dictionary<string, object>>(json) ?? GetDefaultSettings();
        }
        catch
        {
            return GetDefaultSettings();
        }
    }

    private static Dictionary<string, object> GetDefaultSettings()
    {
        return new Dictionary<string, object>
        {
            { "resultMode", ResultMode.PreviewBeforeReplace.ToString() },
            { "restoreClipboard", true },
            { "translationProvider", TranslationProvider.None.ToString() },
            { "translationApiKey", "" },
            { "disableTextStorage", true },
            { "ignorePasswordFields", true },
            { "interfaceLanguage", "he" },
            { "startWithWindows", false },
            { "runInBackground", true },
            { "theme", "GlassDark" },
            { "reducedMotion", false }
        };
    }

    public ResultMode GetResultMode()
    {
        var value = GetSetting("resultMode", ResultMode.PreviewBeforeReplace.ToString());
        return Enum.TryParse<ResultMode>(value, out var result) ? result : ResultMode.PreviewBeforeReplace;
    }

    public void SetResultMode(ResultMode mode) => SetSetting("resultMode", mode.ToString());

    public bool GetRestoreClipboard() => bool.TryParse(GetSetting("restoreClipboard", "true"), out var result) && result;

    public void SetRestoreClipboard(bool value) => SetSetting("restoreClipboard", value);

    public TranslationProvider GetTranslationProvider()
    {
        var value = GetSetting("translationProvider", TranslationProvider.None.ToString());
        return Enum.TryParse<TranslationProvider>(value, out var result) ? result : TranslationProvider.None;
    }

    public void SetTranslationProvider(TranslationProvider provider) => SetSetting("translationProvider", provider.ToString());

    public string GetTranslationApiKey()
    {
        var encrypted = GetSetting("translationApiKey", "");
        return string.IsNullOrEmpty(encrypted) ? "" : DecryptString(encrypted);
    }

    public void SetTranslationApiKey(string key) => SetSetting("translationApiKey", EncryptString(key));

    public bool GetDisableTextStorage() => bool.TryParse(GetSetting("disableTextStorage", "true"), out var result) && result;

    public void SetDisableTextStorage(bool value) => SetSetting("disableTextStorage", value);

    public bool GetIgnorePasswordFields() => bool.TryParse(GetSetting("ignorePasswordFields", "true"), out var result) && result;

    public void SetIgnorePasswordFields(bool value) => SetSetting("ignorePasswordFields", value);

    public string GetInterfaceLanguage() => GetSetting("interfaceLanguage", "he");

    public void SetInterfaceLanguage(string lang) => SetSetting("interfaceLanguage", lang);

    public bool GetStartWithWindows() => bool.TryParse(GetSetting("startWithWindows", "false"), out var result) && result;

    public void SetStartWithWindows(bool value) => SetSetting("startWithWindows", value);

    public bool GetRunInBackground() => bool.TryParse(GetSetting("runInBackground", "true"), out var result) && result;

    public void SetRunInBackground(bool value) => SetSetting("runInBackground", value);

    public string GetTheme() => GetSetting("theme", "GlassDark");

    public void SetTheme(string theme) => SetSetting("theme", theme);

    public bool GetReducedMotion() => bool.TryParse(GetSetting("reducedMotion", "false"), out var result) && result;

    public void SetReducedMotion(bool value) => SetSetting("reducedMotion", value);

    public void Save()
    {
        try
        {
            var json = JsonSerializer.Serialize(_settings, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_settingsPath, json);
        }
        catch
        {
            // Silently fail if settings cannot be saved
        }
    }

    private string GetSetting(string key, string defaultValue)
    {
        if (_settings.TryGetValue(key, out var value))
        {
            return value switch
            {
                JsonElement element => element.GetString() ?? defaultValue,
                string strValue => strValue,
                bool boolValue => boolValue.ToString(),
                _ => value.ToString() ?? defaultValue
            };
        }
        return defaultValue;
    }

    private void SetSetting(string key, object value) => _settings[key] = value;

    private static string EncryptString(string plainText)
    {
        if (string.IsNullOrEmpty(plainText))
            return "";

        try
        {
            var key = Encoding.UTF8.GetBytes("LangFlip2024SecureKey1234567890");
            using var aes = Aes.Create();
            aes.Key = key;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream();
            ms.Write(aes.IV, 0, aes.IV.Length);

            using (var cs = new System.Security.Cryptography.CryptoStream(ms, encryptor, System.Security.Cryptography.CryptoStreamMode.Write))
            {
                using var sw = new StreamWriter(cs);
                sw.Write(plainText);
            }

            return Convert.ToBase64String(ms.ToArray());
        }
        catch
        {
            return plainText;
        }
    }

    private static string DecryptString(string cipherText)
    {
        if (string.IsNullOrEmpty(cipherText))
            return "";

        try
        {
            var key = Encoding.UTF8.GetBytes("LangFlip2024SecureKey1234567890");
            var buffer = Convert.FromBase64String(cipherText);

            using var aes = Aes.Create();
            aes.Key = key;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            aes.IV = buffer.Take(aes.IV.Length).ToArray();

            using var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(buffer, aes.IV.Length, buffer.Length - aes.IV.Length);
            using var cs = new System.Security.Cryptography.CryptoStream(ms, decryptor, System.Security.Cryptography.CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            return sr.ReadToEnd();
        }
        catch
        {
            return cipherText;
        }
    }
}
