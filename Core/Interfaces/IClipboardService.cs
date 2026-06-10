namespace LangFlipDesktop.Core.Interfaces;

public interface IClipboardService
{
    string GetClipboardText();
    void SetClipboardText(string text);
    void CopyToClipboard(string text);
    string SaveAndClear();
    void Restore(string previousContent);
}
