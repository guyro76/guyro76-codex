namespace LangFlipDesktop.Services;

using System.Windows;
using LangFlipDesktop.Core.Interfaces;

public class ClipboardService : IClipboardService
{
    public string GetClipboardText()
    {
        try
        {
            return Clipboard.GetText() ?? string.Empty;
        }
        catch
        {
            return string.Empty;
        }
    }

    public void SetClipboardText(string text)
    {
        try
        {
            Clipboard.SetText(text);
        }
        catch
        {
            // Silently fail if clipboard is unavailable
        }
    }

    public void CopyToClipboard(string text)
    {
        SetClipboardText(text);
    }

    public string SaveAndClear()
    {
        var current = GetClipboardText();
        try
        {
            Clipboard.Clear();
        }
        catch
        {
            // Silently fail
        }
        return current;
    }

    public void Restore(string previousContent)
    {
        if (!string.IsNullOrEmpty(previousContent))
        {
            SetClipboardText(previousContent);
        }
    }
}
