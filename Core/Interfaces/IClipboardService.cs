namespace LangFlipDesktop.Core.Interfaces;

public interface IClipboardService
{
    string GetClipboardText();
    bool SetClipboardText(string text);
    void CopyToClipboard(string text);
    string SaveAndClear();
    void Restore(string previousContent);
}
